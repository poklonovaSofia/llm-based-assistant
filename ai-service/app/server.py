from fastapi import FastAPI
from pydantic import BaseModel
from app.rag_engine import get_rag_response
from app.utils import rewrite_query_no_llm
from app.db import get_connection
from app.ingest import process_single_file
from fastapi import UploadFile, File
import os
app = FastAPI(title="Medicine RAG API")

class QueryRequest(BaseModel):
    query: str
    agent_name: str



@app.post("/ingest")
async def trigger_ingestion(agent_name: str, file: UploadFile = File(...)):
    try:
        # 1. Читаємо файл безпосередньо з запиту
        content = await file.read()
        filename = file.filename
        
        # 2. Зберігаємо тимчасово, щоб extract_text міг його обробити
        temp_path = f"temp_{filename}"
        with open(temp_path, "wb") as f:
            f.write(content)
            
        # 3. Викликаємо обробку (передаємо шлях до темп-файлу)
        from app.ingest import process_single_file
        process_single_file(agent_name, temp_path, filename)
        
        # 4. Видаляємо тимчасовий файл
        os.remove(temp_path)
        
        return {"message": f"File {filename} ingested for agent {agent_name}"}
    except Exception as e:
        return {"error": str(e)}
    
@app.post("/ask")
async def ask_question(request: QueryRequest):
    rewritten = rewrite_query_no_llm(request.query)
    answer = get_rag_response(request.query, rewritten, request.agent_name)
    
    return {
        "agent": request.agent_name,
        "answer": answer
    }
@app.get("/db-test")
def db_test():
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS test_table (
                        id SERIAL PRIMARY KEY,
                        name TEXT
                    );
                """)
                cur.execute("INSERT INTO test_table (name) VALUES (%s) RETURNING id;", ("Hello DB",))
                inserted_id = cur.fetchone()[0]
                cur.execute("SELECT id, name FROM test_table WHERE id = %s;", (inserted_id,))
                row = cur.fetchone()
                
        return {"success": True, "row": {"id": row[0], "name": row[1]}}
    except Exception as e:
        return {"success": False, "error": str(e)}