import fitz, docx, mammoth, re

import re
import os
from langdetect import detect
from nltk.corpus import stopwords
from app.llm_provider import llm_provider

llm = llm_provider.get_llm()
embeddings = llm_provider.get_embeddings()

def extract_text(file_path):
    ext = file_path.lower()
    if ext.endswith(".pdf"):
        doc = fitz.open(file_path)
        return " ".join([page.get_text() for page in doc])
    elif ext.endswith(".docx"):
        d = docx.Document(file_path)
        return "\n".join(p.text for p in d.paragraphs)
    elif ext.endswith(".doc"):
        with open(file_path, "rb") as f:
            return mammoth.extract_raw_text(f).value
    return ""

def chunk_text(text, size=500, overlap=100):
    text = re.sub(r'\s+', ' ', text).strip()
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = words[i : i + size]
        chunks.append(" ".join(chunk))
        if len(words) <= size:
            break
        i += (size - overlap)
    return chunks
def rewrite_query_with_llm(query, agent_name):
    try:
        try:
            lang = detect(query)
        except:
            lang = "sk"
        
        prompt = f"""
        You are an expert assistant in the field of: {agent_name}.
        Extract the main subjects, entities, and technical terms from the user's question.
        - Return ONLY a list of keywords separated by spaces.
        - DO NOT write full sentences.
        - DO NOT include conversational words (e.g., "please", "find", "search").
        - Keep the keywords in the SAME language as the input (detected: {lang}).
        - If the query mentions a specific name (like a medicine or a law), ensure it is the first keyword.

        User Question: {query}
        """

        # Заміна на llm.invoke
        response = llm.invoke(prompt)
        rewritten = response.content.strip()
        rewritten = re.sub(r'[,.;:!?]', '', rewritten) 
        return rewritten

    except Exception as e:
        print(f"LLM Rewrite Error: {e}")
        return rewrite_query_no_llm(query)

def rewrite_query_no_llm(query, max_keywords=8):
    words = re.findall(r"\w+", query.lower(), re.UNICODE)
    filtered = [w for w in words if w not in set(stopwords.words("english"))]
    return " ".join(filtered[:max_keywords])
def call_llm_directly(prompt: str):
    current_llm = llm_provider.get_llm()
    response = current_llm.invoke(prompt)
    return response.content.strip()