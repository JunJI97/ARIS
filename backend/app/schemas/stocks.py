from pydantic import BaseModel, Field

from app.schemas.bonds import Interpretation


class StockInstrument(BaseModel):
    instrument_id: str
    ticker: str
    name: str
    exchange: str
    currency: str = Field(examples=["KRW", "USD"])
    last_price: float = Field(gt=0)
    shares_outstanding: float = Field(gt=0)
    eps_ttm: float
    book_value_per_share: float = Field(gt=0)
    dividend_per_share: float = Field(ge=0)
    beta: float = Field(gt=0)
    expected_growth_rate: float = Field(description="Expected annual growth rate")


class StockInstrumentsResponse(BaseModel):
    instruments: list[StockInstrument]


class StockMarketDataResponse(BaseModel):
    instrument: StockInstrument
    source: str
    fallback_used: bool
    assumptions: list[str]


class StockValuationRequest(BaseModel):
    current_price: float = Field(gt=0)
    eps: float
    book_value_per_share: float = Field(gt=0)
    dividend_per_share: float = Field(ge=0)
    required_return: float | None = Field(
        default=None,
        gt=0,
        description="Required annual return override",
    )
    risk_free_rate: float = Field(default=0.035, description="Risk-free annual rate")
    market_return: float = Field(default=0.085, description="Expected market return")
    beta: float = Field(default=1.0, gt=0)
    growth_rate: float = Field(description="Expected annual growth rate")
    target_pe: float | None = Field(default=None, gt=0)
    target_pb: float | None = Field(default=None, gt=0)
    shares_outstanding: float | None = Field(default=None, gt=0)
    investment_amount: float | None = Field(default=None, gt=0)


class StockValuationResults(BaseModel):
    market_cap: float | None = None
    price_to_earnings: float | None = None
    price_to_book: float
    dividend_yield: float
    earnings_yield: float | None = None
    capm_required_return: float
    effective_required_return: float
    gordon_growth_value: float | None = None
    fair_value_by_pe: float | None = None
    fair_value_by_pb: float | None = None
    upside_by_gordon: float | None = None
    upside_by_pe: float | None = None
    upside_by_pb: float | None = None
    estimated_shares: float | None = None


class StockValuationResponse(BaseModel):
    inputs: StockValuationRequest
    results: StockValuationResults
    interpretation: Interpretation


class StockScenarioRequest(StockValuationRequest):
    min_growth_shock: float = Field(default=-0.03)
    max_growth_shock: float = Field(default=0.03)
    steps: int = Field(default=7, ge=3, le=25)


class StockScenarioPoint(BaseModel):
    growth_shock: float
    growth_rate: float
    gordon_growth_value: float | None


class StockScenarioResponse(BaseModel):
    inputs: StockScenarioRequest
    results: dict[str, float | None]
    interpretation: Interpretation
    series: list[StockScenarioPoint]


class StockPortfolioHoldingRequest(BaseModel):
    ticker: str
    name: str | None = None
    market_value: float = Field(gt=0)
    beta: float = Field(gt=0)
    expected_return: float = Field(description="Expected annual return")


class StockPortfolioRequest(BaseModel):
    holdings: list[StockPortfolioHoldingRequest] = Field(min_length=1)
    market_volatility: float = Field(
        default=0.18,
        ge=0,
        le=5,
        description="Annualized market volatility as a decimal",
    )
    holding_period_days: int = Field(default=10, ge=1, le=252)


class StockPortfolioHoldingResult(BaseModel):
    ticker: str
    name: str | None = None
    market_value: float
    weight: float
    beta: float
    expected_return: float
    contribution_to_beta: float
    contribution_to_return: float


class StockPortfolioResults(BaseModel):
    total_market_value: float
    portfolio_beta: float
    expected_return: float
    largest_weight: float
    hhi: float
    concentration_level: str
    estimated_volatility: float
    holding_period_volatility: float
    var_95: float
    var_99: float
    loss_percent_95: float
    loss_percent_99: float


class StockPortfolioResponse(BaseModel):
    inputs: StockPortfolioRequest
    results: StockPortfolioResults
    interpretation: Interpretation
    series: list[StockPortfolioHoldingResult]
