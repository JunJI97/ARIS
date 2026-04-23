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

