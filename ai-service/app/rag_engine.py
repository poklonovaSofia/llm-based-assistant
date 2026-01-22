import os
from openai import OpenAI
from app.db import get_connection
from sentence_transformers import SentenceTransformer
embedder = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)
def get_rag_response(original_query, rewritten_query, agent_name):
    # 1. Створюємо вектор для запиту
    query_embedding = embedder.encode(rewritten_query).tolist()

    # 2. Шукаємо в БД найсхожіші шматки тексту (Top 3)
    with get_connection() as conn:
        with conn.cursor() as cur:
            # Оператор <=> у pgvector означає пошук за косинусною схожістю
            cur.execute("""
                SELECT content FROM documents 
                WHERE agent_name = %s 
                ORDER BY embedding <=> %s::vector 
                LIMIT 8;
            """, (agent_name, query_embedding)) # Шукаємо ТІЛЬКИ дані цього агента
            rows = cur.fetchall()
            contexts = [row[0] for row in rows]
            print(f"DEBUG: Кількість знайдених шматків: {len(contexts)}")
            for i, ctx in enumerate(contexts):
                print(f"CHUNK {i}: {ctx[:200]}...")
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