from app.schemas.bonds import Interpretation
from app.schemas.projects import (
    CashFlowPoint,
    ProjectFeasibilityRequest,
    ProjectFeasibilityResponse,
    ProjectFeasibilityResults,
)


def _round_money(value: float) -> float:
    return round(value, 2)


def _round_metric(value: float) -> float:
    return round(value, 6)


def calculate_npv(
    initial_investment: float, discount_rate: float, cash_flows: list[float]
) -> float:
    npv = -initial_investment
    for year, cash_flow in enumerate(cash_flows, start=1):
        npv += cash_flow / ((1 + discount_rate) ** year)
    return npv


def calculate_payback_period(
    initial_investment: float, cash_flows: list[float]
) -> float | None:
    cumulative = -initial_investment

    for year, cash_flow in enumerate(cash_flows, start=1):
        previous_cumulative = cumulative
        cumulative += cash_flow

        if cumulative >= 0:
            if cash_flow == 0:
                return float(year)
            fraction = abs(previous_cumulative) / cash_flow
            return (year - 1) + fraction

    return None


def calculate_irr(initial_investment: float, cash_flows: list[float]) -> float | None:
    low = -0.9999
    high = 10.0

    def npv_at(rate: float) -> float:
        return calculate_npv(initial_investment, rate, cash_flows)

    low_npv = npv_at(low)
    high_npv = npv_at(high)

    if low_npv == 0:
        return low
    if high_npv == 0:
        return high
    if low_npv * high_npv > 0:
        return None

    for _ in range(200):
        mid = (low + high) / 2
        mid_npv = npv_at(mid)

        if abs(mid_npv) < 1e-8:
            return mid

        if low_npv * mid_npv < 0:
            high = mid
            high_npv = mid_npv
        else:
            low = mid
            low_npv = mid_npv

    return (low + high) / 2


def build_cash_flow_series(
    initial_investment: float, cash_flows: list[float]
) -> list[CashFlowPoint]:
    cumulative = -initial_investment
    series = [
        CashFlowPoint(
            year=0,
            cash_flow=-initial_investment,
            cumulative_cash_flow=cumulative,
        )
    ]

    for year, cash_flow in enumerate(cash_flows, start=1):
        cumulative += cash_flow
        series.append(
            CashFlowPoint(
                year=year,
                cash_flow=_round_money(cash_flow),
                cumulative_cash_flow=_round_money(cumulative),
            )
        )

    return series


def calculate_project_feasibility(
    request: ProjectFeasibilityRequest,
) -> ProjectFeasibilityResponse:
    npv = calculate_npv(
        request.initial_investment, request.discount_rate, request.cash_flows
    )
    irr = calculate_irr(request.initial_investment, request.cash_flows)
    payback_period = calculate_payback_period(
        request.initial_investment, request.cash_flows
    )
    series = build_cash_flow_series(request.initial_investment, request.cash_flows)

    return ProjectFeasibilityResponse(
        inputs=request,
        results=ProjectFeasibilityResults(
            npv=_round_money(npv),
            irr=_round_metric(irr) if irr is not None else None,
            payback_period=(
                _round_metric(payback_period) if payback_period is not None else None
            ),
            cumulative_cash_flow_final=_round_money(series[-1].cumulative_cash_flow),
        ),
        interpretation=Interpretation(
            label="프로젝트 사업성",
            summary=(
                "초기 투자금과 연도별 현금흐름을 기준으로 순현재가치, 내부수익률, "
                "회수기간을 계산했습니다."
            ),
            assumptions=[
                "discount_rate는 decimal 값입니다.",
                "NPV가 0보다 크면 할인율 기준에서 경제적 여유가 있는 것으로 해석합니다.",
                "IRR은 현금흐름 패턴에 따라 계산되지 않을 수 있습니다.",
                "Payback Period는 회수 시점의 부분 연도를 보간해 계산합니다.",
            ],
        ),
        series=series,
    )
