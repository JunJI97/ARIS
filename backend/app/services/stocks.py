from math import sqrt

from app.schemas.bonds import Interpretation
from app.schemas.stocks import (
    StockPortfolioHoldingResult,
    StockPortfolioRequest,
    StockPortfolioResponse,
    StockPortfolioResults,
    StockScenarioPoint,
    StockScenarioRequest,
    StockScenarioResponse,
    StockValuationRequest,
    StockValuationResponse,
    StockValuationResults,
)


def _round_money(value: float) -> float:
    return round(value, 2)


def _round_metric(value: float) -> float:
    return round(value, 6)


def _safe_ratio(numerator: float, denominator: float) -> float | None:
    if denominator == 0:
        return None
    return numerator / denominator


def calculate_gordon_growth_value(
    dividend_per_share: float,
    required_return: float,
    growth_rate: float,
) -> float | None:
    if required_return <= growth_rate:
        return None
    next_dividend = dividend_per_share * (1 + growth_rate)
    return next_dividend / (required_return - growth_rate)


def calculate_capm_required_return(
    risk_free_rate: float,
    market_return: float,
    beta: float,
) -> float:
    return risk_free_rate + beta * (market_return - risk_free_rate)


def calculate_stock_valuation(
    request: StockValuationRequest,
) -> StockValuationResponse:
    market_cap = (
        request.current_price * request.shares_outstanding
        if request.shares_outstanding is not None
        else None
    )
    price_to_earnings = _safe_ratio(request.current_price, request.eps)
    earnings_yield = _safe_ratio(request.eps, request.current_price)
    capm_required_return = calculate_capm_required_return(
        request.risk_free_rate,
        request.market_return,
        request.beta,
    )
    effective_required_return = request.required_return or capm_required_return
    gordon_growth_value = calculate_gordon_growth_value(
        request.dividend_per_share,
        effective_required_return,
        request.growth_rate,
    )
    fair_value_by_pe = (
        request.eps * request.target_pe if request.target_pe is not None else None
    )
    fair_value_by_pb = (
        request.book_value_per_share * request.target_pb
        if request.target_pb is not None
        else None
    )
    estimated_shares = (
        request.investment_amount / request.current_price
        if request.investment_amount is not None
        else None
    )

    return StockValuationResponse(
        inputs=request,
        results=StockValuationResults(
            market_cap=_round_money(market_cap) if market_cap is not None else None,
            price_to_earnings=(
                _round_metric(price_to_earnings)
                if price_to_earnings is not None
                else None
            ),
            price_to_book=_round_metric(
                request.current_price / request.book_value_per_share
            ),
            dividend_yield=_round_metric(
                request.dividend_per_share / request.current_price
            ),
            earnings_yield=(
                _round_metric(earnings_yield) if earnings_yield is not None else None
            ),
            capm_required_return=_round_metric(capm_required_return),
            effective_required_return=_round_metric(effective_required_return),
            gordon_growth_value=(
                _round_money(gordon_growth_value)
                if gordon_growth_value is not None
                else None
            ),
            fair_value_by_pe=(
                _round_money(fair_value_by_pe)
                if fair_value_by_pe is not None
                else None
            ),
            fair_value_by_pb=(
                _round_money(fair_value_by_pb)
                if fair_value_by_pb is not None
                else None
            ),
            upside_by_gordon=(
                _round_metric(gordon_growth_value / request.current_price - 1)
                if gordon_growth_value is not None
                else None
            ),
            upside_by_pe=(
                _round_metric(fair_value_by_pe / request.current_price - 1)
                if fair_value_by_pe is not None
                else None
            ),
            upside_by_pb=(
                _round_metric(fair_value_by_pb / request.current_price - 1)
                if fair_value_by_pb is not None
                else None
            ),
            estimated_shares=(
                _round_metric(estimated_shares)
                if estimated_shares is not None
                else None
            ),
        ),
        interpretation=Interpretation(
            label="주식 가치평가",
            summary=(
                "가격, 이익, 순자산, 배당, CAPM 요구수익률, 성장률 가정을 기반으로 핵심 주식 valuation 지표를 계산합니다. "
                "요구수익률이 성장률보다 크지 않으면 Gordon growth value는 표시하지 않습니다."
            ),
            assumptions=[
                "EPS, 순자산, 배당금은 모두 주당 입력값입니다.",
                "성장률, 무위험수익률, 시장기대수익률, 요구수익률은 연율 decimal 값입니다.",
                "요구수익률을 직접 입력하지 않으면 CAPM으로 산출한 요구수익률을 사용합니다.",
                "Target P/E와 target P/B가 있으면 상대가치평가 적정가를 함께 계산합니다.",
                "Gordon growth value는 다음 기간 배당금을 요구수익률과 성장률의 차이로 나누어 계산합니다.",
            ],
        ),
    )


def calculate_stock_scenarios(
    request: StockScenarioRequest,
) -> StockScenarioResponse:
    if request.min_growth_shock >= request.max_growth_shock:
        raise ValueError("min_growth_shock must be less than max_growth_shock")

    effective_required_return = request.required_return or calculate_capm_required_return(
        request.risk_free_rate,
        request.market_return,
        request.beta,
    )

    shock_interval = (request.max_growth_shock - request.min_growth_shock) / (
        request.steps - 1
    )
    series: list[StockScenarioPoint] = []

    for index in range(request.steps):
        growth_shock = request.min_growth_shock + shock_interval * index
        shocked_growth = request.growth_rate + growth_shock
        shocked_value = calculate_gordon_growth_value(
            request.dividend_per_share,
            effective_required_return,
            shocked_growth,
        )
        series.append(
            StockScenarioPoint(
                growth_shock=_round_metric(growth_shock),
                growth_rate=_round_metric(shocked_growth),
                gordon_growth_value=(
                    _round_money(shocked_value) if shocked_value is not None else None
                ),
            )
        )

    base_value = calculate_gordon_growth_value(
        request.dividend_per_share,
        effective_required_return,
        request.growth_rate,
    )

    return StockScenarioResponse(
        inputs=request,
        results={
            "effective_required_return": _round_metric(effective_required_return),
            "base_gordon_growth_value": (
                _round_money(base_value) if base_value is not None else None
            )
        },
        interpretation=Interpretation(
            label="주식 성장률 시나리오",
            summary=(
                "기준 성장률 가정에 충격을 적용해 시나리오별 배당할인모형 가치 변화를 보여줍니다."
            ),
            assumptions=[
                "각 시나리오에서는 성장률 가정만 변경합니다.",
                "요구수익률이 성장률 이하인 시나리오는 값을 표시하지 않습니다.",
            ],
        ),
        series=series,
    )


def _classify_concentration(largest_weight: float, hhi: float) -> str:
    if largest_weight >= 0.5 or hhi >= 0.35:
        return "high"
    if largest_weight >= 0.35 or hhi >= 0.25:
        return "watch"
    return "diversified"


TRADING_DAYS_PER_YEAR = 252
Z_SCORE_95 = 1.6449
Z_SCORE_99 = 2.3263


def calculate_stock_portfolio(
    request: StockPortfolioRequest,
) -> StockPortfolioResponse:
    total_market_value = sum(holding.market_value for holding in request.holdings)
    series: list[StockPortfolioHoldingResult] = []

    portfolio_beta = 0.0
    expected_return = 0.0
    hhi = 0.0
    largest_weight = 0.0

    for holding in request.holdings:
        weight = holding.market_value / total_market_value
        contribution_to_beta = weight * holding.beta
        contribution_to_return = weight * holding.expected_return
        portfolio_beta += contribution_to_beta
        expected_return += contribution_to_return
        hhi += weight**2
        largest_weight = max(largest_weight, weight)

        series.append(
            StockPortfolioHoldingResult(
                ticker=holding.ticker,
                name=holding.name,
                market_value=_round_money(holding.market_value),
                weight=_round_metric(weight),
                beta=_round_metric(holding.beta),
                expected_return=_round_metric(holding.expected_return),
                contribution_to_beta=_round_metric(contribution_to_beta),
                contribution_to_return=_round_metric(contribution_to_return),
            )
        )

    concentration_level = _classify_concentration(largest_weight, hhi)
    estimated_volatility = portfolio_beta * request.market_volatility
    holding_period_volatility = estimated_volatility * sqrt(
        request.holding_period_days / TRADING_DAYS_PER_YEAR
    )
    loss_percent_95 = holding_period_volatility * Z_SCORE_95
    loss_percent_99 = holding_period_volatility * Z_SCORE_99
    var_95 = total_market_value * loss_percent_95
    var_99 = total_market_value * loss_percent_99

    return StockPortfolioResponse(
        inputs=request,
        results=StockPortfolioResults(
            total_market_value=_round_money(total_market_value),
            portfolio_beta=_round_metric(portfolio_beta),
            expected_return=_round_metric(expected_return),
            largest_weight=_round_metric(largest_weight),
            hhi=_round_metric(hhi),
            concentration_level=concentration_level,
            estimated_volatility=_round_metric(estimated_volatility),
            holding_period_volatility=_round_metric(holding_period_volatility),
            var_95=_round_money(var_95),
            var_99=_round_money(var_99),
            loss_percent_95=_round_metric(loss_percent_95),
            loss_percent_99=_round_metric(loss_percent_99),
        ),
        interpretation=Interpretation(
            label="주식 포트폴리오",
            summary=(
                "종목별 평가금액 비중으로 포트폴리오 beta, 기대수익률, 집중도 리스크, 추정 VaR를 계산합니다."
            ),
            assumptions=[
                "각 종목의 beta와 기대수익률은 입력값을 그대로 사용합니다.",
                "HHI는 종목 비중 제곱합으로 계산합니다.",
                "최대 비중 또는 HHI가 높으면 집중도 리스크가 높게 분류됩니다.",
                "포트폴리오 변동성은 portfolio beta와 시장 변동성의 곱으로 추정합니다.",
                "VaR는 정규분포 z-score와 보유기간 변동성을 사용하는 단순 parametric 방식입니다.",
            ],
        ),
        series=series,
    )
