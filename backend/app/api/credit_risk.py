from fastapi import APIRouter

from app.schemas.credit_risk import CreditRiskScoreRequest, CreditRiskScoreResponse
from app.services.credit_risk import calculate_credit_risk_score

router = APIRouter(prefix="/api/credit-risk", tags=["credit-risk"])


@router.post("/score", response_model=CreditRiskScoreResponse)
def post_credit_risk_score(
    request: CreditRiskScoreRequest,
) -> CreditRiskScoreResponse:
    return calculate_credit_risk_score(request)
