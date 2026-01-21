import os
from app.db import get_connection
from app.utils import extract_text, chunk_text
from sentence_transformers import SentenceTransformer

embedder = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

def process_single_file(agent_name, file_path, original_filename):
    """
    Обробляє один конкретний файл: витягує текст, ділить на чанки,
    створює вектори та зберігає в БД.
    """
    print(f"Processing {original_filename} for agent {agent_name}...")
    
    # 1. Витягуємо текст
    text = extract_text(file_path)
    
    # 2. Ділимо на шматки
    chunks = chunk_text(text)
    
    # 3. Зберігаємо в базу
    with get_connection() as conn:
        with conn.cursor() as cur:
            for chunk in chunks:
                # Генеруємо вектор
                embedding = embedder.encode(chunk).tolist()
                
                # Записуємо в універсальну таблицю documents
                cur.execute("""
                    INSERT INTO documents (agent_name, filename, content, embedding)
                    VALUES (%s, %s, %s, %s);
                """, (agent_name, original_filename, chunk, embedding))
            conn.commit()
    print(f"Successfully finished: {original_filename}")

def ingest_all_documents(agent_name="medicine_bot"):
    """Стара функція для масового завантаження з папки (опціонально)"""
    DOCS_FOLDER = "../../Lieky/Dokumenty" # Врахуйте, що в Docker цей шлях не спрацює без Volume
    if not os.path.exists(DOCS_FOLDER):
        print(f"Folder {DOCS_FOLDER} not found")
        return

    files = [f for f in os.listdir(DOCS_FOLDER) if f.lower().endswith('.pdf')]
    for filename in files:
        path = os.path.join(DOCS_FOLDER, filename)
        process_single_file(agent_name, path, filename)