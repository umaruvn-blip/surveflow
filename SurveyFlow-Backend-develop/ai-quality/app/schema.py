from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, model_validator


class QualityStatus(StrEnum):
    GOOD = "GOOD"
    REVIEW = "REVIEW"
    VERY_LOW = "VERY_LOW"


class SignalSeverity(StrEnum):
    INFO = "INFO"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class QualityCheckRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    participation_id: int = Field(gt=0)
    survey_id: int = Field(gt=0)
    slot_reserved_at: datetime
    submitted_at: datetime
    estimated_duration_seconds: int | None = Field(default=None, gt=0)

    @model_validator(mode="after")
    def validate_time_range(self) -> "QualityCheckRequest":
        if self.slot_reserved_at.utcoffset() is None or self.submitted_at.utcoffset() is None:
            raise ValueError("slot_reserved_at and submitted_at must include a timezone")
        if self.submitted_at <= self.slot_reserved_at:
            raise ValueError("submitted_at must be later than slot_reserved_at")
        return self


class QualitySignal(BaseModel):
    code: str
    severity: SignalSeverity
    message: str


class QualityCheckResponse(BaseModel):
    participation_id: int
    completion_seconds: int = Field(ge=1)
    score: float = Field(ge=0, le=1)
    status: QualityStatus
    reason_codes: list[str]
    model_version: str


class HealthResponse(BaseModel):
    status: str
    service: str
    model_version: str
