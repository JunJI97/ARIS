from app.schemas.stocks import StockInstrument


SAMPLE_STOCKS: list[StockInstrument] = [
    StockInstrument(
        instrument_id="kr-equity-005930",
        ticker="005930.KS",
        name="Samsung Electronics Sample",
        exchange="KRX",
        currency="KRW",
        last_price=72000,
        shares_outstanding=5_969_782_550,
        eps_ttm=5200,
        book_value_per_share=48000,
        dividend_per_share=1444,
        beta=1.05,
        expected_growth_rate=0.035,
    ),
    StockInstrument(
        instrument_id="kr-equity-000660",
        ticker="000660.KS",
        name="SK Hynix Sample",
        exchange="KRX",
        currency="KRW",
        last_price=185000,
        shares_outstanding=728_002_365,
        eps_ttm=9800,
        book_value_per_share=93000,
        dividend_per_share=1200,
        beta=1.28,
        expected_growth_rate=0.055,
    ),
    StockInstrument(
        instrument_id="us-equity-aapl",
        ticker="AAPL",
        name="Apple Inc. Sample",
        exchange="NASDAQ",
        currency="USD",
        last_price=190,
        shares_outstanding=15_300_000_000,
        eps_ttm=6.3,
        book_value_per_share=4.2,
        dividend_per_share=1.04,
        beta=1.18,
        expected_growth_rate=0.045,
    ),
]


def list_sample_stocks() -> list[StockInstrument]:
    return SAMPLE_STOCKS


def get_sample_stock(instrument_id: str) -> StockInstrument | None:
    return next(
        (stock for stock in SAMPLE_STOCKS if stock.instrument_id == instrument_id),
        None,
    )
