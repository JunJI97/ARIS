from fastapi import APIRouter

from app.schemas.portfolio import PortfolioAnalyzeRequest, PortfolioAnalyzeResponse
from app.services.portfolio import analyze_portfolio

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


@router.post("/analyze", response_model=PortfolioAnalyzeResponse)
def post_portfolio_analyze(
    request: PortfolioAnalyzeRequest,
) -> PortfolioAnalyzeResponse:
    return analyze_portfolio(request)
