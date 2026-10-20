from datetime import datetime, timezone

from app.quality_service import check_quality
from app.schema import QualityCheckRequest, QualityStatus


def make_request(**overrides: object) -> QualityCheckRequest:
    data: dict[str, object] = {
        "participation_id": 123,
        "survey_id": 45,
        "slot_reserved_at": datetime(2026, 9, 24, 9, 0, tzinfo=timezone.utc),
        "submitted_at": datetime(2026, 9, 24, 9, 3, 30, tzinfo=timezone.utc),
        "estimated_duration_seconds": 300,
    }
    data.update(overrides)
    return QualityCheckRequest.model_validate(data)


def test_normal_completion_returns_good_and_elapsed_seconds() -> None:
    result = check_quality(make_request())

    assert result.completion_seconds == 210
    assert result.score == 0.7
    assert result.status == QualityStatus.GOOD
    assert result.reason_codes == ["COMPLETION_TIME_OK"]
    assert result.model_version == "quality-v1-time"


def test_very_short_completion_returns_very_low() -> None:
    result = check_quality(
        make_request(submitted_at=datetime(2026, 9, 24, 9, 0, 30, tzinfo=timezone.utc))
    )

    assert result.completion_seconds == 30
    assert result.score == 0.1
    assert result.status == QualityStatus.VERY_LOW
    assert result.reason_codes == ["COMPLETION_TOO_FAST"]


def test_moderately_short_completion_returns_review() -> None:
    result = check_quality(
        make_request(submitted_at=datetime(2026, 9, 24, 9, 2, tzinfo=timezone.utc))
    )

    assert result.completion_seconds == 120
    assert result.score == 0.4
    assert result.status == QualityStatus.REVIEW
    assert result.reason_codes == ["COMPLETION_TIME_REVIEW"]


def test_missing_estimated_duration_returns_neutral_review() -> None:
    result = check_quality(make_request(estimated_duration_seconds=None))

    assert result.completion_seconds == 210
    assert result.score == 0.5
    assert result.status == QualityStatus.REVIEW
    assert result.reason_codes == ["ESTIMATED_DURATION_MISSING"]


def test_score_is_capped_when_completion_exceeds_estimate() -> None:
    result = check_quality(
        make_request(submitted_at=datetime(2026, 9, 24, 9, 8, tzinfo=timezone.utc))
    )

    assert result.completion_seconds == 480
    assert result.score == 1.0
    assert result.status == QualityStatus.GOOD
