from fastapi import APIRouter, HTTPException

from app.data.sample_stocks import get_sample_stock, list_sample_stocks
from app.schemas.stocks import (
    StockInstrumentsResponse,
    StockMarketDataResponse,
    StockPortfolioRequest,
    StockPortfolioResponse,
    StockScenarioRequest,
    StockScenarioResponse,
    StockValuationRequest,
    StockValuationResponse,
)
from app.services.stocks import (
    calculate_stock_portfolio,
    calculate_stock_scenarios,
    calculate_stock_valuation,
)
from app.services.market_data import get_yahoo_stock_result, search_yahoo_stocks

router = APIRouter(prefix="/api/stocks", tags=["stocks"])


@router.get("/instruments", response_model=StockInstrumentsResponse)
def get_stock_instruments() -> StockInstrumentsResponse:
    return StockInstrumentsResponse(instruments=list_sample_stocks())


@router.get("/search", response_model=StockInstrumentsResponse)
def search_stock_instruments(query: str) -> StockInstrumentsResponse:
    if not query.strip():
        return StockInstrumentsResponse(instruments=list_sample_stocks())

    try:
        instruments = search_yahoo_stocks(query)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Stock market-data provider failed: {exc}",
        ) from exc

    if not instruments:
        raise HTTPException(
            status_code=404,
            detail=f"No stock instruments found for query: {query}",
        )

    return StockInstrumentsResponse(instruments=instruments)


@router.get("/market-data", response_model=StockMarketDataResponse)
def get_stock_market_data(instrument_id: str) -> StockMarketDataResponse:
    if instrument_id.startswith("yahoo:"):
        try:
            market_data = get_yahoo_stock_result(instrument_id)
            assumptions = [
                "Price, exchange, and currency come from Yahoo Finance chart data.",
                "Yahoo Finance endpoints are unofficial and can throttle or change without notice.",
            ]
            if market_data.fundamentals_source == "alpha-vantage-overview":
                assumptions.append(
                    "EPS, book value, dividend, beta, shares outstanding, and growth came from Alpha Vantage OVERVIEW."
                )
            else:
                assumptions.append(
                    "EPS, book value, dividend, beta, shares outstanding, and growth use conservative placeholders. Set ALPHAVANTAGE_API_KEY to enrich fundamentals."
                )
            return StockMarketDataResponse(
                instrument=market_data.instrument,
                source=f"yahoo-finance-chart+{market_data.fundamentals_source}",
                fallback_used=False,
                assumptions=assumptions,
            )
        except Exception as exc:
            raise HTTPException(
                status_code=502,
                detail=f"Stock market-data provider failed: {exc}",
            ) from exc

    instrument = get_sample_stock(instrument_id)
    if instrument is None:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown stock instrument_id: {instrument_id}",
        )

    return StockMarketDataResponse(
        instrument=instrument,
        source="sample",
        fallback_used=True,
        assumptions=[
            "MVP uses sample equity market data until an external market-data adapter is connected.",
            "Per-share accounting inputs are simplified trailing values.",
            "Growth and required return are annual decimal assumptions.",
        ],
    )


@router.post("/valuation", response_model=StockValuationResponse)
def post_stock_valuation(request: StockValuationRequest) -> StockValuationResponse:
    return calculate_stock_valuation(request)


@router.post("/scenarios", response_model=StockScenarioResponse)
def post_stock_scenarios(request: StockScenarioRequest) -> StockScenarioResponse:
    try:
        return calculate_stock_scenarios(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/portfolio", response_model=StockPortfolioResponse, deprecated=True)
def post_stock_portfolio(request: StockPortfolioRequest) -> StockPortfolioResponse:
    return calculate_stock_portfolio(request)
