import httpx
from app.db import get_connection
from sentence_transformers import SentenceTransformer
embedder = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

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
                LIMIT 4;
            """, (agent_name, query_embedding)) # Шукаємо ТІЛЬКИ дані цього агента
            rows = cur.fetchall()
            contexts = [row[0] for row in rows]
            print(f"DEBUG: Кількість знайдених шматків: {len(contexts)}")
            for i, ctx in enumerate(contexts):
                print(f"CHUNK {i}: {ctx[:200]}...")
    if not contexts:
        return "No relevant information found in the database."

    combined_context = "\n\n".join(contexts)

    # 3. Промпт для Ollama (залишаємо вашу логіку)
    prompt_text = f"""
    Answer strictly using ONLY the provided context.
    If not found, reply ONLY with: "Information not found in document."
    Context: {combined_context}
    Question: {original_query}
    Answer:
    """

    try:
        response = httpx.post(
            "http://ollama:11434/api/generate",
            json={
                "model": "llama3.2:1b",
                "prompt": prompt_text,
                "stream": False
            },
            timeout=500.0
        )
        response.raise_for_status()
        return response.json().get("response", "").strip()
        
    except Exception as e:
        return f"Error connecting to Ollama: {str(e)}"