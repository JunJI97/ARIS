from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.bonds import Interpretation


class MarketRiskVarRequest(BaseModel):
    asset_type: Literal["bond", "stock"] = Field(default="bond")
    portfolio_value: float = Field(gt=0)
    annualized_volatility: float = Field(
        ge=0,
        le=5,
        description="Annualized volatility as a decimal",
    )
    holding_period_days: int = Field(ge=1, le=252)
    confidence_level: Literal[0.90, 0.95, 0.99]


class MarketRiskVarResults(BaseModel):
    var_amount: float
    loss_percent: float
    holding_period_volatility: float
    z_score: float


class MarketRiskVarPoint(BaseModel):
    confidence_level: float
    z_score: float
    var_amount: float


class MarketRiskVarResponse(BaseModel):
    inputs: MarketRiskVarRequest
    results: MarketRiskVarResults
    interpretation: Interpretation
    series: list[MarketRiskVarPoint]
