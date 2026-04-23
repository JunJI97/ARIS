from fastapi import APIRouter

from app.schemas.market_risk import MarketRiskVarRequest, MarketRiskVarResponse
from app.services.market_risk import calculate_market_risk_var

router = APIRouter(prefix="/api/market-risk", tags=["market-risk"])


@router.post("/var", response_model=MarketRiskVarResponse)
def post_market_risk_var(
    request: MarketRiskVarRequest,
) -> MarketRiskVarResponse:
    return calculate_market_risk_var(request)
