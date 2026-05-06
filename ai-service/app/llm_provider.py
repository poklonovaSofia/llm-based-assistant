import os
from typing import Optional, Literal
from langchain_core.language_models import BaseLanguageModel
from langchain_core.embeddings import Embeddings
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_ollama import ChatOllama
from langchain_ollama import OllamaEmbeddings

class LLMProvider:
    def __init__(
        self,
        provider: Literal["openai", "ollama"] = "ollama",
        model_name: str = "gpt-4o-mini",
        ollama_model: str = "openeurollm-slovak-ctx16k",
        temperature: float = 0.4,
        base_url: Optional[str] = None,
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
                api_key=api_key,
            )

        elif self.provider == "ollama":
            if not base_url:
                base_url = "http://localhost:11434"

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
    provider=os.getenv("LLM_PROVIDER", "ollama"),
    model_name=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
    ollama_model=os.getenv("OLLAMA_MODEL", "openeurollm-slovak-ctx16k"), #llama3b-ctx16k gemma3-12b-ctx16k gemma3-4b-ctx16k openeurollm-slovak-ctx16k gemma3-27b-ctx16k
    base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
    temperature=0.4
)
_eval_llm_provider = None

def get_eval_llm_provider():
    global _eval_llm_provider
    if _eval_llm_provider is None:
        _eval_llm_provider = LLMProvider(
            provider="openai",
            model_name="gpt-4o-mini",
            temperature=0.1,
        )
    return _eval_llm_provider
entity_llm = ChatOllama(
    model="openeurollm-slovak-ctx16k",
    base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
    temperature=0.1
)
rewrite_llm = ChatOllama(
    model="openeurollm-slovak-ctx16k",
    base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
    temperature=0.1,
    num_predict=100
)