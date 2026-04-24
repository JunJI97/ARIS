from math import sqrt

from app.schemas.bonds import Interpretation
from app.schemas.portfolio import (
    PortfolioAnalyzeRequest,
    PortfolioAnalyzeResponse,
    PortfolioAnalyzeResults,
    PortfolioHoldingResult,
)

TRADING_DAYS_PER_YEAR = 252
Z_SCORE_95 = 1.6449
Z_SCORE_99 = 2.3263


def _round_money(value: float) -> float:
    return round(value, 2)


def _round_metric(value: float) -> float:
    return round(value, 6)


def _classify_concentration(largest_weight: float, hhi: float) -> str:
    if largest_weight >= 0.5 or hhi >= 0.35:
        return "high"
    if largest_weight >= 0.35 or hhi >= 0.25:
        return "watch"
    return "diversified"


def analyze_portfolio(request: PortfolioAnalyzeRequest) -> PortfolioAnalyzeResponse:
    total_market_value = sum(holding.market_value for holding in request.holdings)
    expected_return = 0.0
    variance_proxy = 0.0
    hhi = 0.0
    largest_weight = 0.0
    beta_sum = 0.0
    beta_weight = 0.0
    duration_sum = 0.0
    duration_weight = 0.0
    series: list[PortfolioHoldingResult] = []

    for holding in request.holdings:
        weight = holding.market_value / total_market_value
        contribution_to_return = weight * holding.expected_return
        contribution_to_variance = (weight * holding.volatility) ** 2
        expected_return += contribution_to_return
        variance_proxy += contribution_to_variance
        hhi += weight**2
        largest_weight = max(largest_weight, weight)

        if holding.beta is not None:
            beta_sum += weight * holding.beta
            beta_weight += weight
        if holding.duration is not None:
            duration_sum += weight * holding.duration
            duration_weight += weight

        series.append(
            PortfolioHoldingResult(
                asset_type=holding.asset_type,
                instrument_id=holding.instrument_id,
                name=holding.name,
                market_value=_round_money(holding.market_value),
                weight=_round_metric(weight),
                expected_return=_round_metric(holding.expected_return),
                volatility=_round_metric(holding.volatility),
                contribution_to_return=_round_metric(contribution_to_return),
                contribution_to_variance=_round_metric(contribution_to_variance),
                beta=_round_metric(holding.beta) if holding.beta is not None else None,
                duration=(
                    _round_metric(holding.duration)
                    if holding.duration is not None
                    else None
                ),
            )
        )

    estimated_volatility = sqrt(variance_proxy)
    holding_period_volatility = estimated_volatility * sqrt(
        request.holding_period_days / TRADING_DAYS_PER_YEAR
    )
    loss_percent_95 = holding_period_volatility * Z_SCORE_95
    loss_percent_99 = holding_period_volatility * Z_SCORE_99

    return PortfolioAnalyzeResponse(
        inputs=request,
        results=PortfolioAnalyzeResults(
            total_market_value=_round_money(total_market_value),
            expected_return=_round_metric(expected_return),
            estimated_volatility=_round_metric(estimated_volatility),
            holding_period_volatility=_round_metric(holding_period_volatility),
            weighted_beta=(
                _round_metric(beta_sum / beta_weight) if beta_weight > 0 else None
            ),
            weighted_duration=(
                _round_metric(duration_sum / duration_weight)
                if duration_weight > 0
                else None
            ),
            largest_weight=_round_metric(largest_weight),
            hhi=_round_metric(hhi),
            concentration_level=_classify_concentration(largest_weight, hhi),
            var_95=_round_money(total_market_value * loss_percent_95),
            var_99=_round_money(total_market_value * loss_percent_99),
            loss_percent_95=_round_metric(loss_percent_95),
            loss_percent_99=_round_metric(loss_percent_99),
        ),
        interpretation=Interpretation(
            label="포트폴리오 분석",
            summary=(
                "주식과 채권 holding을 같은 구조로 받아 비중, 기대수익률, 변동성, VaR, 집중도를 계산합니다."
            ),
            assumptions=[
                "각 holding의 기대수익률과 변동성은 입력값을 그대로 사용합니다.",
                "포트폴리오 변동성은 상관관계를 0으로 둔 단순 variance proxy입니다.",
                "VaR는 정규분포 z-score와 보유기간 변동성을 사용하는 parametric 방식입니다.",
            ],
        ),
        series=series,
    )
