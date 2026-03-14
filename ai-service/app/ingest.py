import os
from app.db import get_connection
from app.utils import extract_text, chunk_text
from sentence_transformers import SentenceTransformer
from app.llm_provider import llm_provider

embedder = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
def get_document_subject(text):
    """
    Аналізує початок тексту та автоматично визначає головний об'єкт (Entity).
    Працює для ліків, законів, інструкцій тощо.
    """
    header_context = text[:3000]
    
    try:
        prompt = f"""
            Analyze the provided document fragment and identify its primary identity.
            Guidelines:
            1. If it's a periodic report, include the Title and Time Frame (e.g., 'Financial Report Q3 2024').
            2. If it's a technical manual or recipe, include the Subject and Model/Type (e.g., 'Chocolate Cake Recipe' or 'Router XR-500').
            3. If it's a legal act, include the ID and Year.
            
            Output ONLY a concise string (max 5 words) that uniquely identifies this document among others.
            
            Text: {header_context}
            """
        
        # Беремо актуальний LLM з провайдера (OpenAI або Ollama)
        current_llm = llm_provider.get_llm()
        
        # LangChain-стиль виклику
        response = current_llm.invoke(prompt)
        subject = response.content.strip().upper()
        
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