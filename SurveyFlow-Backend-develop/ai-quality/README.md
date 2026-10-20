# SurveyFlow AI Quality Check

Standalone Python REST service that estimates response quality from completion time. Version 1 returns an analytics score and status; it does not decide verification or Credits.

The Survey V1 flow uses `slot_reserved_at` as the start-time proxy, then receives the actual Google Form `submitted_at` from its webhook. The team confirmed that `slot_reserved_at` represents when the participant starts the survey. It is recorded when the slot is reserved, so it can include a short delay before the participant opens the form.

## Version 1 scoring

When `estimated_duration_seconds` is available:

```text
completion_seconds = submitted_at - slot_reserved_at
score = min(completion_seconds / estimated_duration_seconds, 1.0)
```

| Completion ratio | Status | Reason code |
| --- | --- | --- |
| Below 0.30 | `VERY_LOW` | `COMPLETION_TOO_FAST` |
| 0.30 to below 0.70 | `REVIEW` | `COMPLETION_TIME_REVIEW` |
| 0.70 or higher | `GOOD` | `COMPLETION_TIME_OK` |

When the survey has no estimated duration, the service returns score `0.5`, status `REVIEW`, and `ESTIMATED_DURATION_MISSING`. Thresholds are an initial baseline; they need evaluation against reviewed data before being used for consequential decisions.

The Survey V1 business rules say quality scores are for analysis and must not block a reward. The `status` values therefore describe the timing signal only. They do not mean the survey verification passed or failed.

## API contract

`GET /health` returns service health and model version.

`POST /api/v1/quality/check` accepts:

```json
{
  "participation_id": 123,
  "survey_id": 45,
  "slot_reserved_at": "2026-09-24T09:00:00Z",
  "submitted_at": "2026-09-24T09:03:30Z",
  "estimated_duration_seconds": 300
}
```

`slot_reserved_at` and `submitted_at` must be timezone-aware timestamps, and submission must be later than reservation. Estimated duration is optional. Unknown fields, including verification fields, are rejected so the API contract stays explicit.

Example response:

```json
{
  "participation_id": 123,
  "completion_seconds": 210,
  "score": 0.7,
  "status": "GOOD",
  "reason_codes": ["COMPLETION_TIME_OK"],
  "model_version": "quality-v1-time"
}
```

## Backend integration handoff

Call this service after a Google Form webhook has been accepted and the participation has been verified. The backend currently verifies the completion code and distributes Credits in the webhook transaction; invoke Quality Check after that business transaction commits so an AI timeout cannot roll back verification or delay the reward.

Map the response to the existing `quality_scores` columns:

| API response | Database column |
| --- | --- |
| `participation_id` | `participation_id` |
| `completion_seconds` | `completion_seconds` |
| `score` | `score` |
| `status` | `status` |
| `model_version` | `model_version` |

`quality_scores` currently has no column for `reason_codes`. The backend can log them for now or add a new Flyway migration if they need durable storage. Do not edit the existing V1 migration.

The participation table has a unique quality-score row per participation. The backend should make persistence idempotent so retrying a webhook or AI request does not create duplicate scores. If the AI service is unavailable, record/log the integration failure and continue the already completed survey verification and reward flow.

## Run locally

Use Python 3.11 or newer:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Open `http://localhost:8001/docs` for interactive API documentation.

Run tests from this directory:

```powershell
pytest -v
```

## Run with Docker

From the repository root:

```powershell
docker build -t surveyflow-ai-quality ./ai-quality
docker run --rm -p 8001:8001 surveyflow-ai-quality
```
