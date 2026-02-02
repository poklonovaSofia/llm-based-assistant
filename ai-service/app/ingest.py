import os
from openai import OpenAI
from app.db import get_connection
from app.utils import extract_text, chunk_text
from sentence_transformers import SentenceTransformer

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)
embedder = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
def get_document_subject(text):
    """
    Аналізує початок тексту та автоматично визначає головний об'єкт (Entity).
    Працює для ліків, законів, інструкцій тощо.
    """
    header_context = text[:2000]
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Identify the primary subject of this document (e.g., medicine name, law name, or product model). Output ONLY the name in 1-2 words. Example: 'FERANT' or 'Priligy' or 'Zákon 102'."},
                {"role": "user", "content": f"Text fragment: {header_context}"}
            ],
            temperature=0
        )
        subject = response.choices[0].message.content.strip().upper()
        return subject
    except Exception as e:
        print(f"Error identifying subject: {e}")
        return "UNKNOWN"
def process_single_file(agent_name, file_path, original_filename):
    print(f"Processing {original_filename} for agent {agent_name}...")
    
    # 1. Витягуємо весь текст
    full_text = extract_text(file_path)
    
    # 2. АВТОМАТИЧНО визначаємо сутність документа (Entity-Aware Step)
    document_entity = get_document_subject(full_text)
    print(f"Detected entity: {document_entity}")

    # 3. Розбиваємо на чанки
    chunks = chunk_text(full_text)
    
    with get_connection() as conn:
        with conn.cursor() as cur:
            for chunk in chunks:
                # 4. ЗБАГАЧЕННЯ КОНТЕКСТУ: додаємо сутність на початок чанку
                # Тепер вектор чанку буде нерозривно пов'язаний з назвою об'єкта
                enriched_chunk = f"[{document_entity}] {chunk}"
                
                # Створюємо ембедінг вже збагаченого чанку
                embedding = embedder.encode(enriched_chunk).tolist()
                
                cur.execute("""
                    INSERT INTO documents (agent_name, filename, content, embedding)
                    VALUES (%s, %s, %s, %s);
                """, (agent_name, original_filename, enriched_chunk, embedding))
            conn.commit()
    print(f"Successfully finished: {original_filename} with entity {document_entity}")

def ingest_all_documents(agent_name="medicine_bot"):
    DOCS_FOLDER = "../../Lieky/Dokumenty"
    if not os.path.exists(DOCS_FOLDER):
        print(f"Folder {DOCS_FOLDER} not found")
        return

    files = [f for f in os.listdir(DOCS_FOLDER) if f.lower().endswith('.pdf')]
    for filename in files:
        path = os.path.join(DOCS_FOLDER, filename)
        process_single_file(agent_name, path, filename)