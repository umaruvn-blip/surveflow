from .rules import evaluate_timing
from .schema import QualityCheckRequest, QualityCheckResponse

MODEL_VERSION = "quality-v1-time"


def check_quality(request: QualityCheckRequest) -> QualityCheckResponse:
    result = evaluate_timing(request)

    return QualityCheckResponse(
        participation_id=request.participation_id,
        completion_seconds=result.completion_seconds,
        score=result.score,
        status=result.status,
        reason_codes=[result.signal.code],
        model_version=MODEL_VERSION,
    )
