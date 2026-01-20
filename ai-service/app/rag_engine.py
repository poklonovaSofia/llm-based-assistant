import os
import torch
import subprocess
from sentence_transformers import SentenceTransformer, util
from .utils import extract_text, chunk_text

embedder = SentenceTransformer("all-MiniLM-L6-v2")

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_FOLDER = os.path.abspath(os.path.join(CURRENT_DIR, "../../Lieky/Dokumenty"))

def get_rag_response(original_query, rewritten_query, folder_path=DEFAULT_FOLDER):
    if not os.path.exists(folder_path):
        return f"Error: Folder not found at {folder_path}. Please check your directory structure."
    all_text = ""
    files = [f for f in os.listdir(folder_path) if f.lower().endswith(('.pdf'))] #
    
    if not files:
        return "No supported documents found in the specified folder."

    for f in files:
        file_path = os.path.join(folder_path, f)
        try:
            text = extract_text(file_path)
            if text:
                all_text += text + " "
        except Exception as e:
            print(f"Error reading {f}: {e}")

    if not all_text.strip():
        return "Could not extract any text from the documents."

    chunks = chunk_text(all_text)
    chunk_embeddings = embedder.encode(chunks, convert_to_tensor=True)
    q_emb = embedder.encode(rewritten_query, convert_to_tensor=True)
    
    scores = util.cos_sim(q_emb, chunk_embeddings)
    best_id = int(torch.argmax(scores))
    top_k = 3
    top_indices = torch.topk(scores, k=top_k).indices[0].tolist()
    contexts = [chunks[i] for i in top_indices]
    combined_context = "\n\n".join(contexts)

    prompt_text = f"""
    You MUST answer strictly and literally using ONLY the text in the provided context.
    If the context does not contain the answer, reply ONLY with: "Information not found in document."

    Context:
    {combined_context}

    Question: {original_query}

    Answer:
    """

    try:
        output = subprocess.run(
            ["ollama", "run", "tinyllama"],
            input=prompt_text.encode(),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=120
        )
        return output.stdout.decode().strip()
    except subprocess.TimeoutExpired:
        return "Error: Ollama request timed out."
    except Exception as e:
        return f"Error calling Ollama: {str(e)}"