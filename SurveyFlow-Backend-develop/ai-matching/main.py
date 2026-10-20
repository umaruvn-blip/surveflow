import logging
import threading
from collections import OrderedDict
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from fastembed import TextEmbedding
import numpy as np


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_matching")


class EmbeddingCache:
    """Thread-safe LRU cache for pre-normalized text embeddings."""
    def __init__(self, max_size: int = 10000):
        self.max_size = max_size
        self.cache = OrderedDict()
        self.lock = threading.Lock()

    def get(self, text: str) -> Optional[np.ndarray]:
        with self.lock:
            if text in self.cache:
                self.cache.move_to_end(text)
                return self.cache[text]
            return None

    def put(self, text: str, vector: np.ndarray):
        with self.lock:
            self.cache[text] = vector
            self.cache.move_to_end(text)
            if len(self.cache) > self.max_size:
                self.cache.popitem(last=False)

    def clear(self):
        with self.lock:
            self.cache.clear()


model_container = {}
embedding_cache = EmbeddingCache(max_size=10000)


@asynccontextmanager
async def lifespan(app: FastAPI):
    model_name = "sentence-transformers/all-MiniLM-L6-v2"
    logger.info(f"Loading model: {model_name}...")

    model_container["model"] = TextEmbedding(
        model_name=model_name
    )
    logger.info("Model loaded successfully.")

    yield

    model_container.clear()
    embedding_cache.clear()


app = FastAPI(
    title="SurveyFlow AI Matching",
    version="1.0.0",
    description="AI-powered survey matching engine",
    lifespan=lifespan,
)


class SurveyItem(BaseModel):
    id: int
    text: str


class MatchRequest(BaseModel):
    user_text: str = Field(...)
    surveys: List[SurveyItem] = Field(...)
    top_k: Optional[int] = Field(default=10, ge=1)


class SurveyScore(BaseModel):
    survey_id: int
    score: float


class MatchResponse(BaseModel):
    results: List[SurveyScore]


def get_normalized_embeddings(texts: List[str], model: TextEmbedding, cache: EmbeddingCache) -> np.ndarray:
    """Retrieve normalized embeddings from cache or compute uncached in batch."""
    n = len(texts)
    vectors = [None] * n
    uncached_indices = []
    uncached_texts = []

    for i, text in enumerate(texts):
        cached = cache.get(text)
        if cached is not None:
            vectors[i] = cached
        else:
            uncached_indices.append(i)
            uncached_texts.append(text)

    if uncached_texts:
        embeddings_gen = model.embed(uncached_texts, batch_size=64)
        for idx, raw_emb in zip(uncached_indices, embeddings_gen):
            vec = np.asarray(raw_emb, dtype=np.float32)
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec = vec / norm
            cache.put(texts[idx], vec)
            vectors[idx] = vec

    return np.vstack(vectors)


@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "model_loaded": "model" in model_container
    }


@app.post("/api/v1/match", response_model=MatchResponse)
def match_surveys(request: MatchRequest):
    if not request.surveys:
        return MatchResponse(results=[])

    model = model_container.get("model")
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="AI Model is not loaded yet"
        )

    try:
        # 1. User embedding (L2 normalized)
        user_text = request.user_text.strip()
        user_vec = embedding_cache.get(user_text)
        if user_vec is None:
            raw_user = next(model.embed([user_text]))
            user_vec = np.asarray(raw_user, dtype=np.float32)
            norm = np.linalg.norm(user_vec)
            if norm > 0:
                user_vec = user_vec / norm
            embedding_cache.put(user_text, user_vec)

        # 2. Survey embeddings matrix (N x D, L2 normalized)
        survey_texts = [survey.text.strip() for survey in request.surveys]
        survey_matrix = get_normalized_embeddings(survey_texts, model, embedding_cache)

        # 3. Vectorized Cosine Similarity via BLAS matrix-vector product
        scores = np.dot(survey_matrix, user_vec)

        # 4. Fast Top-K Selection
        n_surveys = len(request.surveys)
        top_k = min(request.top_k or 10, n_surveys)

        if n_surveys <= top_k:
            top_indices = np.argsort(-scores)
        else:
            partitioned = np.argpartition(-scores, top_k)[:top_k]
            top_indices = partitioned[np.argsort(-scores[partitioned])]

        results = [
            SurveyScore(
                survey_id=request.surveys[i].id,
                score=round(float(scores[i]), 4)
            )
            for i in top_indices
        ]

        return MatchResponse(results=results)

    except Exception as e:
        logger.error(f"Error during AI matching: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

