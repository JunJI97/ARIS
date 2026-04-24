from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.bonds import Interpretation


class PortfolioHoldingRequest(BaseModel):
    asset_type: Literal["stock", "bond"]
    instrument_id: str
    name: str | None = None
    market_value: float = Field(gt=0)
    expected_return: float = Field(description="Expected annual return")
    volatility: float = Field(ge=0, le=5, description="Annualized volatility")
    beta: float | None = Field(default=None, gt=0)
    duration: float | None = Field(default=None, ge=0)


class PortfolioAnalyzeRequest(BaseModel):
    holdings: list[PortfolioHoldingRequest] = Field(min_length=1)
    holding_period_days: int = Field(default=10, ge=1, le=252)


class PortfolioHoldingResult(BaseModel):
    asset_type: Literal["stock", "bond"]
    instrument_id: str
    name: str | None = None
    market_value: float
    weight: float
    expected_return: float
    volatility: float
    contribution_to_return: float
    contribution_to_variance: float
    beta: float | None = None
    duration: float | None = None


class PortfolioAnalyzeResults(BaseModel):
    total_market_value: float
    expected_return: float
    estimated_volatility: float
    holding_period_volatility: float
    weighted_beta: float | None = None
    weighted_duration: float | None = None
    largest_weight: float
    hhi: float
    concentration_level: str
    var_95: float
    var_99: float
    loss_percent_95: float
    loss_percent_99: float


class PortfolioAnalyzeResponse(BaseModel):
    inputs: PortfolioAnalyzeRequest
    results: PortfolioAnalyzeResults
    interpretation: Interpretation
    series: list[PortfolioHoldingResult]
