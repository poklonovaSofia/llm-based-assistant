import os
from openai import OpenAI
from app.db import get_connection
from sentence_transformers import SentenceTransformer, CrossEncoder
embedder = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
reranker = CrossEncoder('mixedbread-ai/mxbai-rerank-base-v1')
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)
def generate_hypothetical_answer(query):
    prompt = (
            f"Answer the medical question as if you are writing a professional leaflet summary. "
            f"BE SPECIFIC about age groups, restrictions, and numbers if possible. "
            f"Question: {query}"
        )
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )
    return response.choices[0].message.content.strip()
def _get_rag_core(original_query, rewritten_query, agent_name):
    hypothetical_doc = generate_hypothetical_answer(original_query)
    query_embedding = embedder.encode(hypothetical_doc).tolist()
    keywords = " | ".join([w for w in rewritten_query.split() if w])
    
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
            """, (agent_name, keywords, keywords))
            txt_results = [row[0] for row in cur.fetchall()]

    # RRF (Reciprocal Rank Fusion)
    k = 20
    rrf_scores = {}
    for rank, doc in enumerate(vec_results):
        rrf_scores[doc] = rrf_scores.get(doc, 0) + 1 / (rank + k)
    for rank, doc in enumerate(txt_results):
        rrf_scores[doc] = rrf_scores.get(doc, 0) + 1 / (rank + k)

    fused_docs = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
    initial_contexts = [doc for doc, score in fused_docs[:40]]

    # Реранкінг
    pairs = [[original_query, doc] for doc in initial_contexts]
    rerank_scores = reranker.predict(pairs)
    reranked_results = sorted(zip(initial_contexts, rerank_scores), key=lambda x: x[1], reverse=True)
    
    # Вибираємо фінальні чанки
    final_contexts = [res[0] for res in reranked_results[:8]]
    combined_context = "\n\n".join(final_contexts)

    # Генерація відповіді
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a professional medical assistant. Answer STRICTLY using context..."},
            {"role": "user", "content": f"Context:\n{combined_context}\n\nQuestion: {original_query}"}
        ],
        temperature=0
    )
    answer = response.choices[0].message.content.strip()
    
    # ПОВЕРТАЄМО І ВІДПОВІДЬ, І СПИСОК ЧАНКІВ
    return answer, final_contexts

# 2. Твоя стара функція для звичайного /ask (залишається БЕЗ ЗМІН для зовнішнього світу)
def get_rag_response(original_query, rewritten_query, agent_name):
    answer, _ = _get_rag_core(original_query, rewritten_query, agent_name)
    return answer

# 3. Нова функція спеціально для /evaluate-testset
def get_rag_response_with_chunks(original_query, rewritten_query, agent_name):
    return _get_rag_core(original_query, rewritten_query, agent_name)