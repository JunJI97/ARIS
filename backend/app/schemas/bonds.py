from pydantic import BaseModel, Field


class BondInstrument(BaseModel):
    instrument_id: str
    name: str
    issuer: str
    currency: str = Field(examples=["KRW"])
    face_value: float = Field(gt=0)
    coupon_rate: float = Field(ge=0, description="Annual coupon rate as a decimal")
    maturity_years: float = Field(gt=0)
    payment_frequency: int = Field(gt=0, description="Coupon payments per year")
    market_yield: float = Field(ge=0, description="Annual market yield as a decimal")
    credit_rating: str | None = None


class BondInstrumentsResponse(BaseModel):
    instruments: list[BondInstrument]


class BondMarketDataResponse(BaseModel):
    instrument: BondInstrument
    source: str
    fallback_used: bool
    assumptions: list[str]


class Interpretation(BaseModel):
    label: str
    summary: str
    assumptions: list[str]


class BondValuationRequest(BaseModel):
    face_value: float = Field(gt=0)
    coupon_rate: float = Field(ge=0, description="Annual coupon rate as a decimal")
    market_yield: float = Field(ge=0, description="Annual market yield as a decimal")
    maturity_years: float = Field(gt=0)
    payment_frequency: int = Field(gt=0, description="Coupon payments per year")
    investment_amount: float | None = Field(default=None, gt=0)


class BondValuationResults(BaseModel):
    present_value: float
    macaulay_duration: float
    modified_duration: float
    convexity: float
    estimated_units: float | None = None


class BondValuationResponse(BaseModel):
    inputs: BondValuationRequest
    results: BondValuationResults
    interpretation: Interpretation
    series: list[dict[str, float]] = []


class BondScenarioRequest(BondValuationRequest):
    min_rate_shock: float = Field(default=-0.02)
    max_rate_shock: float = Field(default=0.02)
    steps: int = Field(default=9, ge=3, le=25)


class BondScenarioPoint(BaseModel):
    rate_shock: float
    market_yield: float
    price: float


class BondScenarioResponse(BaseModel):
    inputs: BondScenarioRequest
    results: dict[str, float]
    interpretation: Interpretation
    series: list[BondScenarioPoint]

