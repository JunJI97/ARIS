from app.schemas.bonds import Interpretation
from app.schemas.credit_risk import (
    CreditRiskFactorContribution,
    CreditRiskResults,
    CreditRiskScoreRequest,
    CreditRiskScoreResponse,
)


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(value, maximum))


def _round_metric(value: float) -> float:
    return round(value, 4)


def _score_lower_better(value: float, best: float, worst: float) -> float:
    if value <= best:
        return 100.0
    if value >= worst:
        return 0.0
    return (worst - value) / (worst - best) * 100


def _score_higher_better(value: float, floor: float, target: float) -> float:
    if value <= floor:
        return 0.0
    if value >= target:
        return 100.0
    return (value - floor) / (target - floor) * 100


def _grade_from_score(score: float) -> str:
    if score >= 70:
        return "Normal"
    if score >= 40:
        return "Watch"
    return "Default"


def _assessment_for_factor(factor: str, factor_score: float) -> str:
    if factor == "부채비율":
        if factor_score >= 80:
            return "레버리지 부담이 낮아 재무구조가 안정적입니다."
        if factor_score >= 50:
            return "부채 부담이 관리 가능한 수준이지만 추가 점검이 필요합니다."
        return "부채 부담이 높아 신용도에 부정적입니다."

    if factor == "유동비율":
        if factor_score >= 80:
            return "단기 유동성이 안정적입니다."
        if factor_score >= 50:
            return "단기 상환 여력은 보통 수준입니다."
        return "단기 유동성이 약해 상환 부담이 큽니다."

    if factor == "이자보상배율":
        if factor_score >= 80:
            return "이자비용 방어력이 충분합니다."
        if factor_score >= 50:
            return "이자비용 방어력은 보통 수준입니다."
        return "이자비용 방어력이 약합니다."

    if factor_score >= 80:
        return "수익성이 우수합니다."
    if factor_score >= 50:
        return "수익성은 보통 수준입니다."
    return "수익성이 낮아 신용도에 부담이 됩니다."


def calculate_credit_risk_score(
    request: CreditRiskScoreRequest,
) -> CreditRiskScoreResponse:
    factor_rows = [
        {
            "factor": "부채비율",
            "input_value": request.debt_ratio,
            "weight": 0.35,
            "factor_score": _score_lower_better(request.debt_ratio, best=0.4, worst=1.0),
        },
        {
            "factor": "유동비율",
            "input_value": request.current_ratio,
            "weight": 0.25,
            "factor_score": _score_higher_better(
                request.current_ratio, floor=0.8, target=2.0
            ),
        },
        {
            "factor": "이자보상배율",
            "input_value": request.interest_coverage_ratio,
            "weight": 0.25,
            "factor_score": _score_higher_better(
                request.interest_coverage_ratio, floor=1.0, target=5.0
            ),
        },
        {
            "factor": "영업이익률",
            "input_value": request.operating_margin,
            "weight": 0.15,
            "factor_score": _score_higher_better(
                request.operating_margin, floor=0.0, target=0.2
            ),
        },
    ]

    contributions = [
        CreditRiskFactorContribution(
            factor=row["factor"],
            input_value=_round_metric(row["input_value"]),
            factor_score=_round_metric(_clamp(row["factor_score"], 0.0, 100.0)),
            contribution=_round_metric(
                _clamp(row["factor_score"], 0.0, 100.0) * row["weight"]
            ),
            assessment=_assessment_for_factor(
                row["factor"], _clamp(row["factor_score"], 0.0, 100.0)
            ),
        )
        for row in factor_rows
    ]

    total_score = sum(item.contribution for item in contributions)
    grade = _grade_from_score(total_score)
    strongest_factor = max(contributions, key=lambda item: item.contribution).factor
    weakest_factor = min(contributions, key=lambda item: item.contribution).factor

    if grade == "Normal":
        summary = "주요 재무비율 기준으로 전반적인 신용 상태가 안정적으로 평가되었습니다."
    elif grade == "Watch":
        summary = "일부 재무비율이 약해 관찰이 필요한 신용 상태로 평가되었습니다."
    else:
        summary = "부채, 유동성, 이자상환, 수익성 중 취약한 항목이 많아 신용 위험이 높게 평가되었습니다."

    return CreditRiskScoreResponse(
        inputs=request,
        results=CreditRiskResults(
            score=_round_metric(total_score),
            grade=grade,
            strongest_factor=strongest_factor,
            weakest_factor=weakest_factor,
        ),
        interpretation=Interpretation(
            label=grade,
            summary=summary,
            assumptions=[
                "이 모델은 MVP용 단순 가중치 신용위험 점수입니다.",
                "부채비율은 낮을수록, 유동비율·이자보상배율·영업이익률은 높을수록 유리하게 반영됩니다.",
                "등급 기준은 Normal 70점 이상, Watch 40점 이상, Default 40점 미만입니다.",
                "실제 신용평가사가 제공하는 정식 등급이나 투자 판단을 대체하지 않습니다.",
            ],
        ),
        series=contributions,
    )
