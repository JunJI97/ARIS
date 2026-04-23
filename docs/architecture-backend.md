# ARIS Backend Architecture

**Date:** 2026-04-23
**Part:** Backend
**Location:** `backend/`

## Current State

Backend는 최소 FastAPI 앱이다.

- `backend/main.py`: FastAPI 앱 생성, health router 등록, `/` 라우트 제공
- `backend/app/api/health.py`: `/health` 라우트 제공
- `backend/requirements.txt`: `fastapi`, `uvicorn`

아직 금융 계산 로직, Pydantic schema, 도메인 router는 구현되어 있지 않다.

## Target Role

Backend는 ARIS의 금융 계산 엔진을 담당한다. MVP에서는 DB 없이 stateless API로 시작한다.

## Recommended Backend Structure

```text
backend/app/
├── api/
│   ├── health.py
│   ├── bonds.py
│   ├── credit_risk.py
│   ├── projects.py
│   └── market_risk.py
├── schemas/
│   ├── bonds.py
│   ├── credit_risk.py
│   ├── projects.py
│   └── market_risk.py
└── services/
    ├── bonds.py
    ├── credit_risk.py
    ├── projects.py
    └── market_risk.py
```

## Domain Responsibilities

### Bonds

계산 항목:

- Present Value
- Macaulay Duration
- Modified Duration
- Convexity
- Interest rate scenario price curve

권장 입력:

- face value
- coupon rate
- market yield
- years to maturity
- payment frequency

### Credit Risk

계산 항목:

- Altman Z-Score 또는 자체 weighted score
- Normal / Watch / Default 등급
- 주요 재무비율별 contribution

권장 입력:

- working capital / total assets
- retained earnings / total assets
- EBIT / total assets
- market value equity / total liabilities
- sales / total assets

간소화 MVP에서는 부채비율, 유동비율, 영업이익률 기반 자체 점수 모델로 시작해도 된다.

### Project Feasibility

계산 항목:

- NPV
- IRR
- Payback Period

권장 입력:

- initial investment
- discount rate
- yearly cash flows

### Market Risk

계산 항목:

- Parametric VaR
- 선택적으로 holding period scaling

권장 입력:

- portfolio value
- annualized volatility 또는 historical returns
- confidence level
- holding period

## Dependency Plan

현재 `requirements.txt`:

```text
fastapi==0.136.0
uvicorn==0.45.0
```

MVP 계산 엔진 확장 시 추가 후보:

```text
numpy
scipy
numpy-financial
pydantic
```

FastAPI가 Pydantic을 의존성으로 포함하지만, 명시적으로 schema를 관리하는 것이 설명에 좋다.

## API Design Principles

- 계산 API는 POST를 기본으로 한다.
- request/response schema를 Pydantic 모델로 정의한다.
- 계산 공식은 service 모듈에 두고 router는 입출력만 담당한다.
- API 응답에는 숫자 결과뿐 아니라 해석용 label/message를 포함한다.
- 오류는 입력값 범위 문제를 명확히 알려준다.

## Current API

- `GET /`: backend running message
- `GET /health`: health status
- `GET /docs`: FastAPI OpenAPI UI

## Risks

- IRR 계산은 수렴 실패나 복수 해가 있을 수 있으므로 예외 처리가 필요하다.
- Duration/Convexity는 지급주기와 금리 단위 일관성이 중요하다.
- VaR는 정규분포 가정을 명확히 표시해야 한다.
- 신용점수는 과제용 간이 모델임을 명시하고 해석 가능성에 초점을 둔다.

## Next Implementation Step

첫 backend 작업은 `app/services/bonds.py`, `app/schemas/bonds.py`, `app/api/bonds.py`를 추가하고 `/api/bonds/valuation`을 구현하는 것이다. 이후 frontend에서 이 API를 호출해 첫 end-to-end 데모를 만든다.
