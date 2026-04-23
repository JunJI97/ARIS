from pydantic import BaseModel, Field

from app.schemas.bonds import Interpretation


class CreditRiskScoreRequest(BaseModel):
    debt_ratio: float = Field(
        ge=0,
        le=2,
        description="Total debt divided by total assets as a decimal ratio",
    )
    current_ratio: float = Field(
        ge=0,
        le=10,
        description="Current assets divided by current liabilities",
    )
    interest_coverage_ratio: float = Field(
        ge=0,
        le=50,
        description="EBIT divided by interest expense",
    )
    operating_margin: float = Field(
        ge=-1,
        le=1,
        description="Operating income divided by revenue as a decimal ratio",
    )


class CreditRiskResults(BaseModel):
    score: float
    grade: str
    strongest_factor: str
    weakest_factor: str


class CreditRiskFactorContribution(BaseModel):
    factor: str
    input_value: float
    factor_score: float
    contribution: float
    assessment: str


class CreditRiskScoreResponse(BaseModel):
    inputs: CreditRiskScoreRequest
    results: CreditRiskResults
    interpretation: Interpretation
    series: list[CreditRiskFactorContribution]
