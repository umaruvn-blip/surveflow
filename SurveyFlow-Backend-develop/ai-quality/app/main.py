from fastapi import FastAPI

from .quality_service import MODEL_VERSION, check_quality
from .schema import HealthResponse, QualityCheckRequest, QualityCheckResponse

app = FastAPI(
    title="SurveyFlow AI Quality Check",
    version="1.0.0",
    description="Rule-based quality signals for survey participation submissions.",
)


@app.get("/health", response_model=HealthResponse, tags=["health"])
def health() -> HealthResponse:
    return HealthResponse(
        status="UP",
        service="surveyflow-ai-quality",
        model_version=MODEL_VERSION,
    )


@app.post(
    "/api/v1/quality/check",
    response_model=QualityCheckResponse,
    tags=["quality"],
)
def quality_check(request: QualityCheckRequest) -> QualityCheckResponse:
    return check_quality(request)
