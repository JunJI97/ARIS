from app.schemas.bonds import Interpretation
from app.schemas.portfolio import PortfolioAnalyzeRequest, PortfolioHoldingRequest
from app.schemas.stocks import (
    StockPortfolioRequest,
    StockPortfolioResponse,
    StockScenarioPoint,
    StockScenarioRequest,
    StockScenarioResponse,
    StockValuationRequest,
    StockValuationResponse,
    StockValuationResults,
)
from app.services.portfolio import analyze_portfolio


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


def calculate_stock_portfolio(
    request: StockPortfolioRequest,
) -> StockPortfolioResponse:
    portfolio_response = analyze_portfolio(
        PortfolioAnalyzeRequest(
            holdings=[
                PortfolioHoldingRequest(
                    asset_type="stock",
                    instrument_id=holding.ticker,
                    name=holding.name,
                    market_value=holding.market_value,
                    expected_return=holding.expected_return,
                    volatility=request.market_volatility,
                    beta=holding.beta,
                )
                for holding in request.holdings
            ],
            holding_period_days=request.holding_period_days,
        )
    )

    return StockPortfolioResponse.model_validate(
        {
            "inputs": request,
            "results": {
                "total_market_value": portfolio_response.results.total_market_value,
                "portfolio_beta": portfolio_response.results.weighted_beta or 0,
                "expected_return": portfolio_response.results.expected_return,
                "largest_weight": portfolio_response.results.largest_weight,
                "hhi": portfolio_response.results.hhi,
                "concentration_level": portfolio_response.results.concentration_level,
                "estimated_volatility": portfolio_response.results.estimated_volatility,
                "holding_period_volatility": (
                    portfolio_response.results.holding_period_volatility
                ),
                "var_95": portfolio_response.results.var_95,
                "var_99": portfolio_response.results.var_99,
                "loss_percent_95": portfolio_response.results.loss_percent_95,
                "loss_percent_99": portfolio_response.results.loss_percent_99,
            },
            "interpretation": {
                "label": "주식 포트폴리오(deprecated)",
                "summary": (
                    "/api/stocks/portfolio는 호환을 위해 유지됩니다. "
                    "신규 포트폴리오 분석은 /api/portfolio/analyze를 사용합니다."
                ),
                "assumptions": [
                    "stock 전용 holding은 공통 포트폴리오 분석 요청으로 변환됩니다.",
                    "각 종목 변동성은 요청의 market_volatility 값을 공통 적용합니다.",
                ],
            },
            "series": [
                {
                    "ticker": holding.instrument_id,
                    "name": holding.name,
                    "market_value": holding.market_value,
                    "weight": holding.weight,
                    "beta": holding.beta or 0,
                    "expected_return": holding.expected_return,
                    "contribution_to_beta": (
                        holding.weight * holding.beta
                        if holding.beta is not None
                        else 0
                    ),
                    "contribution_to_return": holding.contribution_to_return,
                }
                for holding in portfolio_response.series
            ],
        }
    )
