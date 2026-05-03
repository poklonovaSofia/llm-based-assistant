# app/llm_provider.py
import os
from typing import Optional, Literal
from langchain_core.language_models import BaseLanguageModel
from langchain_core.embeddings import Embeddings
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_ollama import ChatOllama
from langchain_ollama import OllamaEmbeddings

class LLMProvider:
    """Абстракція для перемикання між OpenAI та Ollama."""

    def __init__(
        self,
        provider: Literal["openai", "ollama"] = "ollama",
        model_name: str = "gpt-4o-mini",          # для OpenAI
        ollama_model: str = "gemma3-27b-ctx16k",            # для Ollama llama3b-ctx16k
        temperature: float = 0.4,
        base_url: Optional[str] = None,           # для Ollama: "http://ollama:11434"
    ):
        self.provider = provider.lower()
        self.temperature = temperature
        self.llm: BaseLanguageModel = None
        self.embeddings: Embeddings = None

        if self.provider == "openai":

            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OPENAI_API_KEY not set in environment")

            self.llm = ChatOpenAI(
                model=model_name,
                temperature=temperature,
                api_key=api_key,
            )
            self.embeddings = OpenAIEmbeddings(
                model="text-embedding-3-small",
                api_key=api_key,   # або інша модель
            )

        elif self.provider == "ollama":
            if not base_url:
                base_url = "http://localhost:11434"   # або "http://ollama:11434" в Docker

            self.llm = ChatOllama(
                model=ollama_model,
                base_url=base_url,
                temperature=temperature,
            )
            self.embeddings = OllamaEmbeddings(
                model=ollama_model,
                base_url=base_url,
            )

        else:
            raise ValueError(f"Unknown provider: {provider}. Use 'openai' or 'ollama'")

    def get_llm(self) -> BaseLanguageModel:
        return self.llm

    def get_embeddings(self) -> Embeddings:
        return self.embeddings

llm_provider = LLMProvider(
    provider=os.getenv("LLM_PROVIDER", "ollama"),      # змінна середовища
    model_name=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
    ollama_model=os.getenv("OLLAMA_MODEL", "openeurollm-slovak-ctx16k"), #llama3b-ctx16k gemma3-12b-ctx16k gemma3-4b-ctx16k openeurollm-slovak-ctx16k gemma3-27b-ctx16k
    base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
    temperature=0.4
)
# eval_llm_provider = LLMProvider(
#     provider="openai",
#     model_name="gpt-4o-mini",
#     temperature=0.1,
# )
entity_llm = ChatOllama(
    model="gemma3-12b-ctx16k",
    base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
    temperature=0.1
)
rewrite_llm = ChatOllama(
    model="openeurollm-slovak-ctx16k",
    base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
    temperature=0.1,
    num_predict=100
)