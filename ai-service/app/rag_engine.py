from app.db import get_connection
from sentence_transformers import SentenceTransformer, CrossEncoder
embedder = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
reranker = CrossEncoder('mixedbread-ai/mxbai-rerank-base-v1')
from app.llm_provider import llm_provider

llm = llm_provider.get_llm()
embeddings = llm_provider.get_embeddings()
def generate_hypothetical_answer(query, agent_name):
    prompt = (
            f"You are an expert assistant for '{agent_name}'. "
            f"Provide a detailed, professional, and factual hypothetical answer to the following question. "
            f"Be specific with technical details, numbers, and dates if applicable. "
            f"Answer in the same language as the question. "
            f"Question: {query}"
        )
    current_llm = llm_provider.get_llm()
    
    # LangChain-стиль виклику (працює і для ChatOpenAI, і для ChatOllama)
    response = current_llm.invoke(prompt)
    return response.content.strip()
def _get_rag_core(original_query, rewritten_query, agent_name):
    # hypothetical_doc = generate_hypothetical_answer(original_query, agent_name)
    # print(f"--- FULL HYDE DOC ---\n{hypothetical_doc}\n---------------------")
    # query_embedding = embedder.encode(hypothetical_doc).tolist()
    query_embedding = embedder.encode(rewritten_query).tolist()
    keywords = " | ".join([w for w in rewritten_query.split() if w])# todo &
    #keywords = " & ".join([w for w in rewritten_query.split() if len(w) > 2])
    with get_connection() as conn:
        with conn.cursor() as cur:
            # Векторний пошук
            cur.execute("""
                SELECT content FROM documents 
                WHERE agent_name = %s 
                ORDER BY (1 - (embedding <=> %s::vector)) DESC LIMIT 10
            """, (agent_name, query_embedding))
            vec_results = [row[0] for row in cur.fetchall()]
            
            # Текстовий пошук
            cur.execute("""
                SELECT content FROM documents 
                WHERE agent_name = %s 
                AND to_tsvector('simple', content) @@ to_tsquery('simple', %s)
                ORDER BY ts_rank_cd(to_tsvector('simple', content), to_tsquery('simple', %s)) DESC LIMIT 10
            """, (agent_name, keywords, keywords)) # plainto_tsquery(%s) phraseto_tsquery(%s)
            txt_results = [row[0] for row in cur.fetchall()]

    print(f"DEBUG: Vector results count: {len(vec_results)}")
    print(f"DEBUG: Text results count: {len(txt_results)}")
    # RRF (Reciprocal Rank Fusion)
    k = 40
    rrf_scores = {}
    for rank, doc in enumerate(vec_results):
        rrf_scores[doc] = rrf_scores.get(doc, 0) + 1 / (rank + k)
    for rank, doc in enumerate(txt_results):
        rrf_scores[doc] = rrf_scores.get(doc, 0) + 1 / (rank + k)

    fused_docs = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
    initial_contexts = [doc for doc, score in fused_docs[:10]]

    # Реранкінг
    pairs = [[original_query, doc] for doc in initial_contexts]
    rerank_scores = reranker.predict(pairs)
    reranked_results = sorted(zip(initial_contexts, rerank_scores), key=lambda x: x[1], reverse=True)
    
    # Вибираємо фінальні чанки
    final_contexts = [res[0] for res in reranked_results[:6]]
    combined_context = "\n\n".join(final_contexts)
    # 6. Генерація відповіді з контекстом
    system_prompt = (
        f"You are a professional assistant for '{agent_name}'. "
        f"Your ONLY source of truth is the provided context. "
        f"Ignore any previous knowledge or hypothetical scenarios. "
        f"If the context says the vulnerability is about 'data types', "
        f"then that is the only correct answer, even if you think otherwise."
    )
    # Додай це перед відправкою в LLM
    print("--- FINAL CONTEXT SENT TO LLM ---")
    print(combined_context)
    print("---------------------------------")
    user_message = f"Context:\n{combined_context}\n\nQuestion: {original_query}"
    current_llm = llm_provider.get_llm()
    
    # LangChain-стиль (messages для чат-моделей)
    response = current_llm.invoke([
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ])
    
    answer = response.content.strip()
    
    return answer, final_contexts

# 2. Твоя стара функція для звичайного /ask (залишається БЕЗ ЗМІН для зовнішнього світу)
def get_rag_response(original_query, rewritten_query, agent_name):
    answer, _ = _get_rag_core(original_query, rewritten_query, agent_name)
    return answer

# 3. Нова функція спеціально для /evaluate-testset
def get_rag_response_with_chunks(original_query, rewritten_query, agent_name):
    return _get_rag_core(original_query, rewritten_query, agent_name)