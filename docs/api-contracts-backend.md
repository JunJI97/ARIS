# ARIS Backend API Contracts

**Date:** 2026-04-23

## Current APIs

### `GET /`

Backend 상태 메시지를 반환한다.

Response:

```json
{
  "message": "ARIS backend is running"
}
```

### `GET /health`

헬스체크 결과를 반환한다.

Response:

```json
{
  "status": "ok"
}
```

## Planned MVP APIs

아래 계약은 MVP 구현을 위한 초안이다. 실제 구현 시 Pydantic schema로 고정한다.

### `POST /api/bonds/valuation`

채권 현재가치, 듀레이션, 컨벡시티를 계산한다.

Request:

```json
{
  "face_value": 10000,
  "coupon_rate": 0.05,
  "market_yield": 0.04,
  "years_to_maturity": 5,
  "payments_per_year": 2
}
```

Response:

```json
{
  "price": 10449.12,
  "macaulay_duration": 4.52,
  "modified_duration": 4.43,
  "convexity": 23.81
}
```

### `POST /api/bonds/scenarios`

금리 변화별 채권 가격을 계산한다.

Request:

```json
{
  "face_value": 10000,
  "coupon_rate": 0.05,
  "base_yield": 0.04,
  "years_to_maturity": 5,
  "payments_per_year": 2,
  "shock_bps": [-100, -50, 0, 50, 100]
}
```

### `GET /api/stocks/instruments`

Returns sample stock instruments for the stock foundation.

Response:

```json
{
  "instruments": [
    {
      "instrument_id": "kr-equity-005930",
      "ticker": "005930.KS",
      "name": "Samsung Electronics Sample",
      "exchange": "KRX",
      "currency": "KRW",
      "last_price": 72000,
      "shares_outstanding": 5969782550,
      "eps_ttm": 5200,
      "book_value_per_share": 48000,
      "dividend_per_share": 1444,
      "beta": 1.05,
      "expected_growth_rate": 0.035
    }
  ]
}
```

### `GET /api/stocks/market-data`

Returns one sample stock instrument and fallback metadata.

Query:

```text
instrument_id=kr-equity-005930
```

### `POST /api/stocks/valuation`

Calculates core stock valuation metrics.

Request:

```json
{
  "current_price": 100,
  "eps": 8,
  "book_value_per_share": 50,
  "dividend_per_share": 2,
  "required_return": 0.09,
  "risk_free_rate": 0.03,
  "market_return": 0.08,
  "beta": 1.2,
  "growth_rate": 0.03,
  "target_pe": 14,
  "target_pb": 1.8,
  "shares_outstanding": 1000000,
  "investment_amount": 10000
}
```

Response:

```json
{
  "results": {
    "market_cap": 100000000,
    "price_to_earnings": 12.5,
    "price_to_book": 2,
    "dividend_yield": 0.02,
    "earnings_yield": 0.08,
    "capm_required_return": 0.09,
    "effective_required_return": 0.09,
    "gordon_growth_value": 34.33,
    "fair_value_by_pe": 112,
    "fair_value_by_pb": 90,
    "upside_by_gordon": -0.656667,
    "upside_by_pe": 0.12,
    "upside_by_pb": -0.1,
    "estimated_shares": 100
  }
}
```

### `POST /api/stocks/scenarios`

Applies growth-rate shocks and recalculates Gordon growth value.

Request:

```json
{
  "current_price": 100,
  "eps": 8,
  "book_value_per_share": 50,
  "dividend_per_share": 2,
  "required_return": 0.09,
  "risk_free_rate": 0.03,
  "market_return": 0.08,
  "beta": 1.2,
  "growth_rate": 0.03,
  "target_pe": 14,
  "target_pb": 1.8,
  "min_growth_shock": -0.01,
  "max_growth_shock": 0.01,
  "steps": 5
}
```

Response:

```json
{
  "series": [
    { "yield": 0.03, "price": 10918.22 },
    { "yield": 0.04, "price": 10449.12 },
    { "yield": 0.05, "price": 10000.00 }
  ]
}
```

### `POST /api/credit-risk/score`

재무비율 기반 신용점수와 등급을 계산한다.

Request:

```json
{
  "debt_ratio": 0.6,
  "current_ratio": 1.4,
  "operating_margin": 0.12,
  "interest_coverage": 4.2
}
```

Response:

```json
{
  "score": 78,
  "grade": "Normal",
  "probability_band": "Low",
  "drivers": [
    { "name": "current_ratio", "impact": "positive" }
  ]
}
```

### `POST /api/projects/feasibility`

프로젝트 사업성 지표를 계산한다.

Request:

```json
{
  "initial_investment": 100000,
  "discount_rate": 0.1,
  "cash_flows": [25000, 30000, 35000, 40000]
}
```

Response:

```json
{
  "npv": 6832.42,
  "irr": 0.128,
  "payback_period": 3.25
}
```

### `POST /api/market-risk/var`

Parametric VaR를 계산한다.

Request:

```json
{
  "portfolio_value": 1000000,
  "volatility": 0.18,
  "confidence_level": 0.95,
  "holding_period_days": 1
}
```

Response:

```json
{
  "var": 18645.33,
  "confidence_level": 0.95,
  "interpretation": "1일 기준 95% 신뢰수준에서 최대 손실 추정액"
}
```

## Error Handling

권장 오류 형식:

```json
{
  "detail": "market_yield must be greater than -1.0"
}
```

FastAPI의 기본 validation error를 유지하되, 금융 도메인 제약은 명확한 메시지로 반환한다.
