from fastapi import APIRouter, HTTPException

from app.data.sample_bonds import get_sample_bond, list_sample_bonds
from app.schemas.bonds import (
    BondInstrumentsResponse,
    BondMarketDataResponse,
    BondScenarioRequest,
    BondScenarioResponse,
    BondValuationRequest,
    BondValuationResponse,
)
from app.services.bonds import calculate_bond_scenarios, calculate_bond_valuation
from app.services.market_data import get_treasury_bond, list_treasury_bonds

router = APIRouter(prefix="/api/bonds", tags=["bonds"])


@router.get("/instruments", response_model=BondInstrumentsResponse)
def get_bond_instruments() -> BondInstrumentsResponse:
    return BondInstrumentsResponse(instruments=list_sample_bonds())


@router.get("/search", response_model=BondInstrumentsResponse)
def search_bond_instruments(query: str = "treasury") -> BondInstrumentsResponse:
    try:
        instruments = list_treasury_bonds(query)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Bond market-data provider failed: {exc}",
        ) from exc

    if not instruments:
        raise HTTPException(
            status_code=404,
            detail=f"No bond instruments found for query: {query}",
        )

    return BondInstrumentsResponse(instruments=instruments)


@router.get("/market-data", response_model=BondMarketDataResponse)
def get_bond_market_data(instrument_id: str) -> BondMarketDataResponse:
    if instrument_id.startswith("treasury:"):
        try:
            instrument = get_treasury_bond(instrument_id)
        except Exception as exc:
            raise HTTPException(
                status_code=502,
                detail=f"Bond market-data provider failed: {exc}",
            ) from exc

        if instrument is None:
            raise HTTPException(
                status_code=404,
                detail=f"Unknown Treasury instrument_id: {instrument_id}",
            )

        return BondMarketDataResponse(
            instrument=instrument,
            source="us-treasury-yield-curve",
            fallback_used=False,
            assumptions=[
                "Market yield comes from the latest U.S. Treasury Daily Par Yield Curve XML feed.",
                "Coupon rate is set equal to the par yield, so the generated bond prices near par.",
                "Face value is normalized to 10,000 USD for ARIS valuation inputs.",
            ],
        )

    instrument = get_sample_bond(instrument_id)
    if instrument is None:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown bond instrument_id: {instrument_id}",
        )

    return BondMarketDataResponse(
        instrument=instrument,
        source="sample",
        fallback_used=True,
        assumptions=[
            "MVP에서는 외부 채권 시세 API 대신 샘플 데이터를 사용합니다.",
            "coupon_rate와 market_yield는 연율 decimal 값입니다.",
            "payment_frequency는 연간 이자 지급 횟수입니다.",
        ],
    )


@router.post("/valuation", response_model=BondValuationResponse)
def post_bond_valuation(request: BondValuationRequest) -> BondValuationResponse:
    return calculate_bond_valuation(request)


@router.post("/scenarios", response_model=BondScenarioResponse)
def post_bond_scenarios(request: BondScenarioRequest) -> BondScenarioResponse:
    try:
        return calculate_bond_scenarios(request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
