from pydantic import BaseModel, Field

from app.schemas.bonds import Interpretation


class ProjectFeasibilityRequest(BaseModel):
    initial_investment: float = Field(gt=0)
    discount_rate: float = Field(ge=0, description="Annual discount rate as a decimal")
    cash_flows: list[float] = Field(min_length=1)


class ProjectFeasibilityResults(BaseModel):
    npv: float
    irr: float | None = None
    payback_period: float | None = None
    cumulative_cash_flow_final: float


class CashFlowPoint(BaseModel):
    year: int
    cash_flow: float
    cumulative_cash_flow: float


class ProjectFeasibilityResponse(BaseModel):
    inputs: ProjectFeasibilityRequest
    results: ProjectFeasibilityResults
    interpretation: Interpretation
    series: list[CashFlowPoint]
