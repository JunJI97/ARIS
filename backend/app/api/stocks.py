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

router = APIRouter(prefix="/api/stocks", tags=["stocks"])


@router.get("/instruments", response_model=StockInstrumentsResponse)
def get_stock_instruments() -> StockInstrumentsResponse:
    return StockInstrumentsResponse(instruments=list_sample_stocks())


@router.get("/market-data", response_model=StockMarketDataResponse)
def get_stock_market_data(instrument_id: str) -> StockMarketDataResponse:
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


@router.post("/portfolio", response_model=StockPortfolioResponse)
def post_stock_portfolio(request: StockPortfolioRequest) -> StockPortfolioResponse:
    return calculate_stock_portfolio(request)
