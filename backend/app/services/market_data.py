from __future__ import annotations

import json
import os
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any

from app.schemas.bonds import BondInstrument
from app.schemas.stocks import StockInstrument

USER_AGENT = "ARIS/0.1 market-data adapter"
YAHOO_SEARCH_URL = "https://query2.finance.yahoo.com/v1/finance/search"
YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
ALPHA_VANTAGE_URL = "https://www.alphavantage.co/query"
TREASURY_YIELD_CURVE_URL = (
    "https://home.treasury.gov/resource-center/data-chart-center/"
    "interest-rates/pages/xml"
)


@dataclass(frozen=True)
class StockMarketDataResult:
    instrument: StockInstrument
    fundamentals_source: str

TREASURY_MATURITIES: tuple[tuple[str, str, float], ...] = (
    ("BC_1YEAR", "U.S. Treasury 1Y Par Yield", 1.0),
    ("BC_2YEAR", "U.S. Treasury 2Y Par Yield", 2.0),
    ("BC_3YEAR", "U.S. Treasury 3Y Par Yield", 3.0),
    ("BC_5YEAR", "U.S. Treasury 5Y Par Yield", 5.0),
    ("BC_7YEAR", "U.S. Treasury 7Y Par Yield", 7.0),
    ("BC_10YEAR", "U.S. Treasury 10Y Par Yield", 10.0),
    ("BC_20YEAR", "U.S. Treasury 20Y Par Yield", 20.0),
    ("BC_30YEAR", "U.S. Treasury 30Y Par Yield", 30.0),
)


def _request_text(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=10) as response:
        return response.read().decode("utf-8")


def _request_json(url: str) -> dict[str, Any]:
    return json.loads(_request_text(url))


def _float_or_default(value: Any, default: float) -> float:
    try:
        if value is None:
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def _positive_float_or_none(value: Any) -> float | None:
    parsed = _float_or_default(value, 0)
    return parsed if parsed > 0 else None


def _alpha_vantage_overview(symbol: str) -> dict[str, Any] | None:
    api_key = os.getenv("ALPHAVANTAGE_API_KEY")
    if not api_key:
        return None

    query = urllib.parse.urlencode(
        {"function": "OVERVIEW", "symbol": symbol, "apikey": api_key}
    )
    payload = _request_json(f"{ALPHA_VANTAGE_URL}?{query}")
    if not payload or payload.get("Symbol") is None:
        return None
    return payload


def _stock_from_yahoo(
    symbol: str,
    name: str,
    exchange: str,
    include_fundamentals: bool = False,
) -> StockMarketDataResult:
    encoded_symbol = urllib.parse.quote(symbol)
    url = YAHOO_CHART_URL.format(symbol=encoded_symbol) + "?range=1d&interval=1d"
    payload = _request_json(url)
    result = (payload.get("chart", {}).get("result") or [None])[0]
    if not result:
        raise ValueError(f"No Yahoo chart data for symbol: {symbol}")

    meta = result.get("meta", {})
    price = _float_or_default(meta.get("regularMarketPrice"), 0)
    if price <= 0:
        raise ValueError(f"No valid Yahoo market price for symbol: {symbol}")

    currency = str(meta.get("currency") or "USD")
    exchange_name = str(meta.get("fullExchangeName") or exchange or "Yahoo")
    eps = max(price / 18, 0.01)
    book_value = max(price / 4, 0.01)
    dividend = price * 0.006
    beta = 1.0
    growth_rate = 0.04
    shares_outstanding = 1_000_000.0
    fundamentals_source = "placeholder"

    if include_fundamentals:
        overview = _alpha_vantage_overview(symbol)
        if overview:
            eps = _positive_float_or_none(overview.get("EPS")) or eps
            book_value = _positive_float_or_none(overview.get("BookValue")) or book_value
            dividend = (
                _positive_float_or_none(overview.get("DividendPerShare")) or dividend
            )
            beta = _positive_float_or_none(overview.get("Beta")) or beta
            growth_rate = (
                _positive_float_or_none(overview.get("QuarterlyEarningsGrowthYOY"))
                or _positive_float_or_none(overview.get("QuarterlyRevenueGrowthYOY"))
                or growth_rate
            )
            shares_outstanding = (
                _positive_float_or_none(overview.get("SharesOutstanding"))
                or shares_outstanding
            )
            fundamentals_source = "alpha-vantage-overview"

    return StockMarketDataResult(
        fundamentals_source=fundamentals_source,
        instrument=StockInstrument(
            instrument_id=f"yahoo:{symbol}",
            ticker=symbol,
            name=name or symbol,
            exchange=exchange_name,
            currency=currency,
            last_price=price,
            shares_outstanding=shares_outstanding,
            eps_ttm=round(eps, 4),
            book_value_per_share=round(book_value, 4),
            dividend_per_share=round(dividend, 4),
            beta=beta,
            expected_growth_rate=growth_rate,
        ),
    )


def search_yahoo_stocks(query: str, limit: int = 8) -> list[StockInstrument]:
    encoded_query = urllib.parse.urlencode(
        {"q": query, "quotesCount": limit, "newsCount": 0}
    )
    payload = _request_json(f"{YAHOO_SEARCH_URL}?{encoded_query}")
    instruments: list[StockInstrument] = []

    for quote in payload.get("quotes", []):
        if quote.get("quoteType") not in {"EQUITY", "ETF"}:
            continue

        symbol = str(quote.get("symbol") or "")
        if not symbol:
            continue

        name = str(quote.get("longname") or quote.get("shortname") or symbol)
        exchange = str(quote.get("exchDisp") or quote.get("exchange") or "Yahoo")

        try:
            instruments.append(
                _stock_from_yahoo(symbol, name, exchange).instrument
            )
        except Exception:
            continue

        if len(instruments) >= limit:
            break

    return instruments


def get_yahoo_stock(instrument_id: str) -> StockInstrument:
    return get_yahoo_stock_result(instrument_id).instrument


def get_yahoo_stock_result(instrument_id: str) -> StockMarketDataResult:
    symbol = instrument_id.removeprefix("yahoo:")
    return _stock_from_yahoo(symbol, symbol, "Yahoo", include_fundamentals=True)


def _latest_treasury_curve() -> dict[str, str]:
    year = datetime.now(UTC).year
    query = urllib.parse.urlencode(
        {"data": "daily_treasury_yield_curve", "field_tdr_date_value": year}
    )
    root = ET.fromstring(_request_text(f"{TREASURY_YIELD_CURVE_URL}?{query}"))
    namespace = {
        "atom": "http://www.w3.org/2005/Atom",
        "m": "http://schemas.microsoft.com/ado/2007/08/dataservices/metadata",
        "d": "http://schemas.microsoft.com/ado/2007/08/dataservices",
    }
    entries = root.findall("atom:entry", namespace)
    if not entries:
        raise ValueError("No Treasury yield curve data available")

    properties = entries[-1].find("atom:content/m:properties", namespace)
    if properties is None:
        raise ValueError("Treasury yield curve payload missing properties")

    values: dict[str, str] = {}
    for child in properties:
        name = child.tag.split("}", maxsplit=1)[-1]
        values[name] = child.text or ""
    return values


def list_treasury_bonds(query: str = "") -> list[BondInstrument]:
    curve = _latest_treasury_curve()
    normalized_query = query.lower().strip()
    instruments: list[BondInstrument] = []

    for field, label, maturity_years in TREASURY_MATURITIES:
        yield_percent = _float_or_default(curve.get(field), 0)
        if yield_percent <= 0:
            continue

        instrument_id = f"treasury:{field.lower()}"
        searchable = f"{instrument_id} {label} {maturity_years:g}y treasury"
        if normalized_query and normalized_query not in searchable.lower():
            continue

        market_yield = yield_percent / 100
        instruments.append(
            BondInstrument(
                instrument_id=instrument_id,
                name=label,
                issuer="U.S. Department of the Treasury",
                currency="USD",
                face_value=10_000,
                coupon_rate=market_yield,
                maturity_years=maturity_years,
                payment_frequency=2,
                market_yield=market_yield,
                credit_rating="AA+",
            )
        )

    return instruments


def get_treasury_bond(instrument_id: str) -> BondInstrument | None:
    return next(
        (
            instrument
            for instrument in list_treasury_bonds()
            if instrument.instrument_id == instrument_id
        ),
        None,
    )
