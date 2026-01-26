import os
from openai import OpenAI
from app.db import get_connection
from sentence_transformers import SentenceTransformer
embedder = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)
def get_rag_response(original_query, rewritten_query, agent_name):
    query_embedding = embedder.encode(rewritten_query).tolist()
    keywords = " | ".join([w for w in rewritten_query.split() if w])

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT content, 
                       (1 - (embedding <=> %s::vector)) as sem_score,
                       ts_rank_cd(to_tsvector('simple', content), to_tsquery('simple', %s)) as key_score
                FROM documents 
                WHERE agent_name = %s
                ORDER BY ((1 - (embedding <=> %s::vector)) * 0.2 + 
                          ts_rank_cd(to_tsvector('simple', content), to_tsquery('simple', %s)) * 0.8) DESC
                LIMIT 50;
            """, (query_embedding, keywords, agent_name, query_embedding, keywords))
            
            rows = cur.fetchall()
            contexts = [row[0] for row in rows]
            print(f"DEBUG: Знайдено чанків: {len(contexts)}")
            for i, row in enumerate(rows):
                 print(f"CHUNK {i} (Sem: {row[1]:.3f}, Key: {row[2]:.3f}): {row[0][:150]}...")
    if not contexts:
        return "No relevant information found in the database."

    combined_context = "\n\n".join(contexts)

    try:

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system", 
                    "content": (
                        "You are a professional medical assistant. Answer the question STRICTLY using the provided context. "
                        "If the answer is not in the context, say 'Information not found in document.' "
                        "Do not use your internal knowledge. Answer in the same language as the question."
                    )
                },
                {
                    "role": "user", 
                    "content": f"Context:\n{combined_context}\n\nQuestion: {original_query}"
                }
            ],
            temperature=0,
            max_tokens=500
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        return f"OpenAI API Error: {str(e)}"