import os
from app.db import get_connection
from app.utils import extract_text, chunk_text
from sentence_transformers import SentenceTransformer
from app.llm_provider import entity_llm

embedder = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
def get_document_subject(text):
    header_context = text[:3000]
    
    try:
        prompt = f"""
        Analyze the provided document fragment and identify its primary subject.

        Rules:
        - Output ONLY a concise string of maximum 5 words
        - The string must uniquely identify this specific document
        - Include the most distinctive identifiers present in the document 
        (e.g. name, ID, date, version, period — whatever is most relevant)
        - Do NOT explain, do NOT add punctuation, do NOT use quotes
        - Output in the same language as the document

        Text: {header_context}
        """
        current_llm = entity_llm
        response = current_llm.invoke(prompt)
        subject = response.content.strip().upper()
        
        return subject
    except Exception as e:
        print(f"Error identifying subject: {e}")
        return "UNKNOWN"
def process_single_file(agent_name, file_path, original_filename):
    print(f"Processing {original_filename} for agent {agent_name}...")
    full_text = extract_text(file_path)
    document_entity = get_document_subject(full_text)
    print(f"Detected entity: {document_entity}")
    chunks = chunk_text(full_text)
    
    with get_connection() as conn:
        with conn.cursor() as cur:
            for chunk in chunks:
                enriched_chunk = f"[{document_entity}] {chunk}"
                
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