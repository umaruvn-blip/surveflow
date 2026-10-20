from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "UP",
        "service": "surveyflow-ai-quality",
        "model_version": "quality-v1-time",
    }


def test_quality_endpoint_matches_survey_backend_contract() -> None:
    response = client.post(
        "/api/v1/quality/check",
        json={
            "participation_id": 123,
            "survey_id": 45,
            "slot_reserved_at": "2026-09-24T09:00:00Z",
            "submitted_at": "2026-09-24T09:03:30Z",
            "estimated_duration_seconds": 300,
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "participation_id": 123,
        "completion_seconds": 210,
        "score": 0.7,
        "status": "GOOD",
        "reason_codes": ["COMPLETION_TIME_OK"],
        "model_version": "quality-v1-time",
    }


def test_quality_endpoint_rejects_invalid_ids_or_time_order() -> None:
    invalid_id = client.post(
        "/api/v1/quality/check",
        json={
            "participation_id": 0,
            "survey_id": 45,
            "slot_reserved_at": "2026-09-24T09:00:00Z",
            "submitted_at": "2026-09-24T09:03:30Z",
        },
    )
    invalid_time = client.post(
        "/api/v1/quality/check",
        json={
            "participation_id": 123,
            "survey_id": 45,
            "slot_reserved_at": "2026-09-24T09:00:00Z",
            "submitted_at": "2026-09-24T08:59:00Z",
        },
    )

    assert invalid_id.status_code == 422
    assert invalid_time.status_code == 422


def test_quality_endpoint_rejects_verification_and_unknown_fields() -> None:
    response = client.post(
        "/api/v1/quality/check",
        json={
            "participation_id": 123,
            "survey_id": 45,
            "slot_reserved_at": "2026-09-24T09:00:00Z",
            "submitted_at": "2026-09-24T09:03:30Z",
            "verification_passed": True,
        },
    )

    assert response.status_code == 422
