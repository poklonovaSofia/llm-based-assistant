import os
from openai import OpenAI
from app.db import get_connection
from sentence_transformers import SentenceTransformer, CrossEncoder
embedder = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
reranker = CrossEncoder('mixedbread-ai/mxbai-rerank-base-v1')
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)
def get_rag_response(original_query, rewritten_query, agent_name):
    query_embedding = embedder.encode(rewritten_query).tolist()
    keywords = " | ".join([w for w in rewritten_query.split() if w])

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT content FROM documents 
                WHERE agent_name = %s 
                ORDER BY (1 - (embedding <=> %s::vector)) DESC LIMIT 20
            """, (agent_name, query_embedding))
            vec_results = [row[0] for row in cur.fetchall()]
            cur.execute("""
                SELECT content FROM documents 
                WHERE agent_name = %s 
                AND to_tsvector('simple', content) @@ to_tsquery('simple', %s)
                ORDER BY ts_rank_cd(to_tsvector('simple', content), to_tsquery('simple', %s)) DESC LIMIT 20
            """, (agent_name, keywords, keywords))
            txt_results = [row[0] for row in cur.fetchall()]

    k = 60
    rrf_scores = {}

    for rank, doc in enumerate(vec_results):
        rrf_scores[doc] = rrf_scores.get(doc, 0) + 1 / (rank + k)

    for rank, doc in enumerate(txt_results):
        rrf_scores[doc] = rrf_scores.get(doc, 0) + 1 / (rank + k)

    fused_docs = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
    initial_contexts = [doc for doc, score in fused_docs[:40]]

    # 4. ЕТАП РЕРАНКІНГУ (як і було)
    pairs = [[original_query, doc] for doc in initial_contexts]
    rerank_scores = reranker.predict(pairs)
    
    reranked_results = sorted(zip(initial_contexts, rerank_scores), key=lambda x: x[1], reverse=True)
    final_contexts = [res[0] for res in reranked_results[:5]]
    print(f"DEBUG: Початково знайдено: {len(initial_contexts)}")
    print(f"DEBUG: ТОП-3 після Reranking:")
    for i, (txt, score) in enumerate(reranked_results[:3]):
        print(f"  Rank {i} (Score: {score:.4f}): {txt[:100]}...")

    combined_context = "\n\n".join(final_contexts)

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system", 
                    "content": "You are a professional medical assistant. Answer STRICTLY using context."
                },
                {
                    "role": "user", 
                    "content": f"Context:\n{combined_context}\n\nQuestion: {original_query}"
                }
            ],
            temperature=0
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"OpenAI Error: {str(e)}"