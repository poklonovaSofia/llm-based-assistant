from fastapi import FastAPI
from pydantic import BaseModel
from app.rag_engine import get_rag_response
from app.rag_engine import get_rag_response_with_chunks
from app.utils import rewrite_query_with_llm
from app.db import get_connection
from app.db import get_random_chunks
from app.ingest import process_single_file
from app.utils import call_llm_directly
from fastapi import UploadFile, File
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from datasets import Dataset
from fastapi import Body
import pandas as pd
import json
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
    rewritten = rewrite_query_with_llm(request.query, request.agent_name)
    print(f"DEBUG: Original: {request.query}")
    print(f"DEBUG: Rewritten ({request.agent_name}): {rewritten}")
    
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

@app.post("/generate-testset")
async def generate_testset(agent_name: str, num_questions: int = 5):
    try:
        # 1. Отримуємо випадкові чанки з бази даних для цього агента
        # Це дасть моделі контекст, на основі якого вона вигадає питання
 # Треба буде додати цю функцію в db.py
        chunks = get_random_chunks(agent_name, limit=num_questions * 2)
        
        if not chunks:
            return {"error": "No data found for this agent. Please ingest files first."}

        # 2. Формуємо промпт для LLM
        context_text = "\n\n".join([f"Chunk {i}: {c}" for i, c in enumerate(chunks)])
        
        prompt = f"""
        You are an expert quality assurance engineer for RAG systems.
        Your goal is to create a test dataset based STRICTLY on the provided text chunks.

        CONTEXT FROM DATABASE:
        {context_text}

        INSTRUCTIONS:
        1. Generate {num_questions} questions that can be answered ONLY using the provided context.
        2. If the context mentions specific rules, medications (like Sinupret), or dates, focus on them.
        3. DO NOT use your internal knowledge to invent facts, medications, or dosages not present in the text.
        4. If the context is insufficient to create a good question, use only what is available.
        5. Both questions and ground_truth must be in Slovak language.

        OUTPUT FORMAT:
        Return ONLY a valid JSON list of objects:
        [
        {{"question": "Slovak question", "ground_truth": "Slovak answer from text"}},
        ...
        ]
        """
        
        # 3. Викликаємо твій LLM utils (наприклад, через ту ж функцію, що і rewrite)
  # Треба додати в utils.py
        raw_response = call_llm_directly(prompt)
        
        # Очищуємо відповідь від можливих ```json ... ```

        clean_json = raw_response.replace("```json", "").replace("```", "").strip()
        testset = json.loads(clean_json)
        
        return {"agent": agent_name, "testset": testset}
        
    except Exception as e:
        return {"error": str(e)}
    
@app.post("/evaluate-testset")
async def evaluate_testset(agent_name: str, file: UploadFile = File(...)):
    try:
        # 1. Prečítanie JSON súboru
        content = await file.read()
        testset = json.loads(content) # Premeníme obsah súboru na list
        
        evaluation_data = []
        llm = ChatOpenAI(model="gpt-4o-mini")
        embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

        # 2. Cyklus cez otázky (rovnaký ako predtým)
        for item in testset:
            q = item["question"]
            gt = item["ground_truth"]

            rewritten = rewrite_query_with_llm(q, agent_name)
            answer, chunks = get_rag_response_with_chunks(q, rewritten, agent_name)

            evaluation_data.append({
                "question": q,
                "answer": answer,
                "contexts": chunks,
                "ground_truth": gt
            })

        # 3. RAGAS evaluácia
        df = pd.DataFrame(evaluation_data)
        dataset = Dataset.from_pandas(df)
        
        result = evaluate(
            dataset, 
            metrics=[faithfulness, answer_relevancy, context_precision],
            llm=llm,        # Priraďujeme model
            embeddings=embeddings
        )
        
        return {
            "agent": agent_name,
            "summary_scores": result,
            "individual_results": result.to_pandas().to_dict(orient="records")
        }

    except Exception as e:
        return {"error": f"Chyba pri spracovaní súboru: {str(e)}"}