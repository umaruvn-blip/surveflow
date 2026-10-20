from dataclasses import dataclass

from .schema import (
    QualityCheckRequest,
    QualityStatus,
    QualitySignal,
    SignalSeverity,
)


@dataclass(frozen=True)
class RuleResult:
    completion_seconds: int
    score: float
    status: QualityStatus
    signal: QualitySignal


def evaluate_timing(request: QualityCheckRequest) -> RuleResult:
    completion_seconds = max(
        1, int((request.submitted_at - request.slot_reserved_at).total_seconds())
    )

    if request.estimated_duration_seconds is None:
        return RuleResult(
            completion_seconds=completion_seconds,
            score=0.5,
            status=QualityStatus.REVIEW,
            signal=QualitySignal(
                code="ESTIMATED_DURATION_MISSING",
                severity=SignalSeverity.MEDIUM,
                message="Estimated survey duration is unavailable; review the timing result.",
            ),
        )

    completion_ratio = completion_seconds / request.estimated_duration_seconds
    score = round(min(completion_ratio, 1.0), 4)

    if completion_ratio < 0.30:
        return RuleResult(
            completion_seconds=completion_seconds,
            score=score,
            status=QualityStatus.VERY_LOW,
            signal=QualitySignal(
                code="COMPLETION_TOO_FAST",
                severity=SignalSeverity.HIGH,
                message="Completion time is below 30% of the estimated duration.",
            )
        )

    if completion_ratio < 0.70:
        return RuleResult(
            completion_seconds=completion_seconds,
            score=score,
            status=QualityStatus.REVIEW,
            signal=QualitySignal(
                code="COMPLETION_TIME_REVIEW",
                severity=SignalSeverity.MEDIUM,
                message="Completion time is below 70% of the estimated duration.",
            ),
        )

    return RuleResult(
        completion_seconds=completion_seconds,
        score=score,
        status=QualityStatus.GOOD,
        signal=QualitySignal(
            code="COMPLETION_TIME_OK",
            severity=SignalSeverity.INFO,
            message="Completion time is within the expected range.",
        )
    )
