---
stepsCompleted:
  - step-01-init
  - step-02-context
  - step-03-starter
  - step-04-decisions
  - step-05-patterns
  - step-06-structure
  - step-07-validation
  - step-08-complete
inputDocuments:
  - docs/index.md
  - docs/project-overview.md
  - docs/source-tree-analysis.md
  - docs/architecture-frontend.md
  - docs/architecture-backend.md
  - docs/integration-architecture.md
  - docs/development-guide-frontend.md
  - docs/development-guide-backend.md
  - docs/api-contracts-backend.md
  - _bmad-output/project-context.md
  - _bmad-output/planning-artifacts/prd.md
workflowType: "architecture"
project_name: "ARIS"
user_name: "Genie"
date: "2026-04-23"
lastStep: 8
status: "complete"
completedAt: "2026-04-23"
---

# ARIS Architecture Decision Document

이 문서는 ARIS PRD를 기준으로 Next.js frontend와 FastAPI backend의 구현 아키텍처를 정의한다. MVP는 채권 중심으로 구현하되, 이후 주식 자산군을 추가할 수 있도록 multi-asset 구조를 기본 전제로 둔다.

## 1. Project Context Analysis

### Requirements Overview

ARIS는 금융 자산의 가치와 위험을 설명 가능한 수학 모델로 계산하고, 사용자가 입력 변화에 따른 결과를 빠르게 이해하도록 돕는 dashboard + calculation API 시스템이다.

**MVP 기능 범위**

- 채권 종목 또는 샘플 채권 선택
- 채권 PV, Macaulay Duration, Modified Duration, Convexity 계산
- 금리 충격별 채권 가격 시나리오 계산 및 차트 표시
- Parametric VaR 계산
- 신용 위험 점수 및 Normal / Watch / Default 등급 계산
- 프로젝트 NPV, IRR, Payback Period 계산
- FastAPI docs에서 계산 API 검증
- Next.js dashboard에서 입력, 결과 카드, 차트, 해석 문구 제공

**Post-MVP 확장 범위**

- 주식 포트폴리오 VaR 및 변동성 분석
- KRX/OpenDART 등 외부 데이터 연동
- 자산군별 비교 dashboard
- 결과 export 및 사용자별 포트폴리오 저장
- 자산군별 valuation/risk plugin 구조

### Scale & Complexity

- Primary domain: fintech / financial analytics
- Product type: Next.js web dashboard + FastAPI calculation backend
- Complexity level: domain complexity high, MVP implementation medium
- Runtime model: stateless API first; database, auth, user portfolio persistence는 MVP에서 제외
- Primary risk: 계산 정확성, 단위 일관성, frontend/backend 계산 중복, future asset 확장 시 구조 붕괴

### Cross-Cutting Concerns

- 모든 핵심 계산은 backend service가 authoritative source다.
- API schema는 자산군 확장을 위해 `asset_type` 또는 asset-specific endpoint를 명확히 유지한다.
- 금융 지표는 숫자 결과뿐 아니라 가정, 단위, 해석 문구를 함께 반환한다.
- 외부 데이터 API는 MVP hard dependency가 아니며 sample data fallback을 제공한다.
- UI는 landing page가 아니라 즉시 사용할 수 있는 dashboard로 시작한다.

## 2. Starter Template Evaluation

### Selected Foundation

현재 repository에는 이미 다음 starter가 구성되어 있다.

- Frontend: Next.js `16.2.4`, React `19.2.4`, TypeScript strict, Tailwind CSS 4, Recharts, Zustand
- Backend: FastAPI `0.136.0`, Uvicorn `0.45.0`

Next.js 공식 문서는 App Router를 현재 React 기능 기반의 주요 routing model로 설명하며, ARIS의 현재 `frontend/app` 구조와 맞다. FastAPI 공식 문서는 FastAPI가 빠르게 변화하므로 project dependency를 pin 하라고 권고한다. 따라서 ARIS는 새 starter를 다시 생성하지 않고 현재 scaffold를 보존하면서 domain module을 추가한다.

### Starter Decisions Kept

- Next.js App Router를 유지한다.
- TypeScript strict mode를 유지한다.
- Tailwind CSS 4를 dashboard styling의 기본으로 쓴다.
- Recharts는 scenario/cash-flow/VaR 시각화에 쓴다.
- FastAPI + Pydantic schema + service module 구조를 쓴다.
- `requirements.txt`와 `package.json`의 버전을 고정하고, 버전 변경은 별도 task로 다룬다.

## 3. Core Architectural Decisions

### Decision Priority Analysis

**Critical decisions**

- 계산 로직은 frontend가 아니라 backend service에 둔다.
- API는 REST JSON으로 시작한다.
- MVP는 stateless API로 구현하고 DB/auth는 제외한다.
- 채권 전용 계산과 공통 risk 계산을 분리한다.
- multi-asset 확장은 `asset_type`, shared risk service, asset-specific valuation service 조합으로 처리한다.

**Deferred decisions**

- 사용자 인증, 사용자별 포트폴리오 저장, DB schema
- 실시간 market data 자동 갱신
- 배포 인프라, observability stack
- 주식 valuation 모델의 상세 범위

### Backend Architecture

FastAPI backend는 계산 엔진이다. Router는 HTTP 입출력과 validation만 담당하고, 금융 공식은 service 함수에 둔다.

**Layering**

- `app/api/*`: route definition, request parsing, response return
- `app/schemas/*`: Pydantic request/response schema
- `app/services/*`: pure calculation logic
- `app/data/*`: sample instruments, fallback market data
- `tests/*`: service unit tests 우선, route tests 보조

**MVP API**

- `GET /health`
- `GET /api/assets/types`
- `GET /api/bonds/instruments`
- `GET /api/bonds/market-data?instrument_id=...`
- `POST /api/bonds/valuation`
- `POST /api/bonds/scenarios`
- `POST /api/credit-risk/score`
- `POST /api/projects/feasibility`
- `POST /api/market-risk/var`

**Future API**

- `GET /api/stocks/instruments`
- `GET /api/stocks/market-data?instrument_id=...`
- `POST /api/stocks/portfolio-risk`
- `POST /api/assets/portfolio-var`

주식은 MVP에서 구현하지 않더라도 endpoint namespace와 domain boundary를 미리 예약한다.

### Frontend Architecture

Next.js frontend는 dashboard shell, 입력 UX, 결과 표시, 차트, 해석 문구를 담당한다. 계산식은 frontend에 중복 구현하지 않는다.

**Frontend responsibilities**

- 자산군 선택과 feature navigation
- 입력 form state와 lightweight validation
- API request/response type 정의
- loading/error/result state 표시
- metric card, scenario chart, interpretation panel 표시

**State strategy**

- 단일 tab 내부의 form state는 React local state를 우선 사용한다.
- 여러 tab에서 공유되는 portfolio summary나 selected asset은 Zustand store로 승격한다.
- API data fetching은 MVP에서 fetch wrapper로 충분하다. 캐시/동기화 요구가 커지면 TanStack Query 도입을 별도 결정으로 다룬다.

### Multi-Asset Domain Model

ARIS는 asset-specific valuation과 common risk engine을 분리한다.

```text
Asset
  - common fields: asset_type, instrument_id, name, currency
  - bond fields: face_value, coupon_rate, maturity_years, payment_frequency
  - stock fields later: ticker, shares, price, volatility, returns

Valuation Engine
  - bond valuation: PV, duration, convexity, scenarios
  - stock valuation: post-MVP extension

Risk Engine
  - market VaR: common portfolio/value/volatility/confidence model
  - credit score: issuer/company financial ratios
```

**Key rule:** VaR는 채권과 주식 모두에서 재사용 가능한 common risk service로 둔다. Duration/Convexity는 bond-only service다.

### API Communication

- Frontend는 `NEXT_PUBLIC_API_BASE_URL`로 backend base URL을 읽는다.
- 모든 calculation endpoint는 `POST`를 사용한다.
- JSON field name은 API에서 `snake_case`, TypeScript type에서는 response shape를 그대로 표현한다.
- Frontend 내부 UI prop은 `camelCase`를 사용하되 API boundary에서 변환 책임을 명확히 둔다.

**Common response envelope**

```json
{
  "inputs": {},
  "results": {},
  "interpretation": {
    "label": "Normal",
    "summary": "입력값 기준의 분석 결과입니다.",
    "assumptions": []
  },
  "series": []
}
```

### Security & Data Handling

- MVP는 개인 금융정보, 계정, 거래정보를 저장하지 않는다.
- 결과는 투자 조언이 아니라 입력값 기반 분석 결과임을 UI와 docs에서 명시한다.
- 외부 API key가 필요하면 backend environment variable에만 둔다.
- CORS는 local frontend origin만 허용하는 방식으로 시작한다.

## 4. Implementation Patterns & Consistency Rules

### Naming Patterns

**Backend**

- Python module/file: `snake_case.py`
- Pydantic model: `PascalCase`
- Service function: `snake_case`
- API field: `snake_case`
- Router path: plural resource, kebab-case where needed

Examples:

- `backend/app/api/credit_risk.py`
- `CreditRiskScoreRequest`
- `calculate_bond_valuation`
- `/api/credit-risk/score`

**Frontend**

- Component: `PascalCase`
- Component file: `kebab-case.tsx`
- Hook: `useXyz`
- Type/interface: `PascalCase`
- UI variable and prop: `camelCase`

Examples:

- `bond-input-form.tsx`
- `BondInputForm`
- `BondValuationResponse`
- `selectedAssetType`

### Structure Patterns

- Feature-specific UI lives in `frontend/app/features/<feature>/`.
- Shared UI primitives live in `frontend/app/components/`.
- API client and format helpers live in `frontend/app/lib/`.
- Backend routers, schemas, and services are mirrored by domain.
- Tests focus first on `backend/tests/services/`.

### API Format Patterns

All calculation responses include:

- `inputs`: normalized inputs actually used by backend
- `results`: numeric outputs
- `interpretation`: human-readable label, summary, assumptions
- `series`: chart-ready arrays where useful

All validation errors use FastAPI/Pydantic standard validation unless a domain-specific controlled error is needed.

### Calculation Patterns

- Rates are decimals in API payloads unless field name explicitly says `_percent`.
- Payment frequency is integer payments per year.
- Maturity is expressed in years for MVP.
- Modified duration is derived from Macaulay duration using periodic yield.
- Convexity and scenario curves use cash-flow based calculation.
- IRR returns a controlled failure state if no valid solution exists.
- VaR response states confidence level, holding period, and normal distribution assumption.

### Frontend Process Patterns

- Every API call has `loading`, `error`, and `data` states.
- User-facing errors are Korean and actionable.
- Result cards show value, unit, and short interpretation.
- Charts never become the only source of information; numeric values remain visible.
- Advanced bond inputs are grouped separately from the default flow.

### Agent Enforcement Rules

All implementation agents must:

- Add schema before route wiring.
- Add service function before endpoint implementation.
- Avoid frontend financial formula duplication.
- Include assumptions in response or UI for each financial metric.
- Keep bond-specific code out of common `market_risk` service unless it is truly reusable.
- Preserve Korean UI copy and English code identifiers.

## 5. Project Structure & Boundaries

### Complete Target Directory Structure

```text
ARIS/
  docs/
    architecture-backend.md
    architecture-frontend.md
    integration-architecture.md
    api-contracts-backend.md
  _bmad-output/
    planning-artifacts/
      prd.md
      architecture.md
  backend/
    main.py
    requirements.txt
    app/
      __init__.py
      api/
        __init__.py
        health.py
        assets.py
        bonds.py
        credit_risk.py
        market_risk.py
        projects.py
      schemas/
        __init__.py
        common.py
        assets.py
        bonds.py
        credit_risk.py
        market_risk.py
        projects.py
      services/
        __init__.py
        bonds.py
        credit_risk.py
        market_risk.py
        projects.py
      data/
        __init__.py
        sample_bonds.py
    tests/
      services/
        test_bonds.py
        test_credit_risk.py
        test_market_risk.py
        test_projects.py
      api/
        test_bonds_api.py
  frontend/
    app/
      layout.tsx
      page.tsx
      globals.css
      components/
        dashboard-shell.tsx
        metric-card.tsx
        interpretation-panel.tsx
        tab-navigation.tsx
      features/
        assets/
          asset-type-selector.tsx
          types.ts
        bonds/
          bond-dashboard.tsx
          bond-input-form.tsx
          bond-results.tsx
          bond-scenario-chart.tsx
          types.ts
        credit-risk/
          credit-risk-panel.tsx
          types.ts
        market-risk/
          market-risk-panel.tsx
          types.ts
        project-feasibility/
          project-feasibility-panel.tsx
          cash-flow-chart.tsx
          types.ts
      lib/
        api.ts
        format.ts
        financial-labels.ts
      store/
        dashboard-store.ts
    public/
    package.json
    tsconfig.json
```

### Architectural Boundaries

**Frontend/backend boundary**

- Frontend owns interaction and presentation.
- Backend owns calculation correctness and interpretation metadata.
- Shared contract is JSON schema documented by FastAPI OpenAPI and TypeScript types.

**Asset boundary**

- `assets` owns common asset type concepts.
- `bonds` owns bond valuation and bond scenarios.
- `market_risk` owns common VaR and future portfolio risk.
- `credit_risk` can serve both bond issuer risk and future stock/company risk.

**Testing boundary**

- Financial formulas are tested as pure service functions.
- API tests verify schema, status code, and representative response.
- Frontend tests are optional for MVP unless complex UI state appears.

### Requirements to Structure Mapping

- FR1-FR7 asset selection/input: `frontend/app/features/assets`, `backend/app/api/assets.py`, `backend/app/data/sample_bonds.py`
- FR8-FR14 bond valuation/sensitivity: `backend/app/services/bonds.py`, `backend/app/api/bonds.py`, `frontend/app/features/bonds`
- FR15-FR18 market risk: `backend/app/services/market_risk.py`, `frontend/app/features/market-risk`
- FR19-FR22 credit risk: `backend/app/services/credit_risk.py`, `frontend/app/features/credit-risk`
- FR23-FR28 project feasibility: `backend/app/services/projects.py`, `frontend/app/features/project-feasibility`
- FR29-FR34 dashboard/visualization: `frontend/app/page.tsx`, `frontend/app/components`, Recharts components
- FR35-FR43 API/validation: `backend/app/schemas`, `backend/app/api`
- FR44-FR47 multi-asset extensibility: `backend/app/schemas/assets.py`, `frontend/app/features/assets`, common risk service

## 6. Data Flow

### Bond Valuation Flow

```text
User selects bond or sample instrument
  -> frontend loads /api/bonds/instruments
  -> frontend pre-fills bond input form
  -> user adjusts investment amount or advanced inputs
  -> POST /api/bonds/valuation
  -> POST /api/bonds/scenarios
  -> frontend renders metric cards, scenario chart, assumptions
```

### VaR Flow

```text
User enters portfolio value, volatility, confidence, holding period
  -> frontend sends asset_type and common risk inputs
  -> POST /api/market-risk/var
  -> backend calculates parametric VaR
  -> frontend shows loss estimate, confidence assumption, interpretation
```

### Future Stock Flow

```text
User selects asset_type = stock
  -> stock instrument lookup and market data populate stock-specific inputs
  -> common market_risk service calculates VaR from portfolio value/volatility
  -> stock-specific valuation/risk services can be added without changing bond services
```

## 7. Implementation Sequence

1. Backend foundation: CORS, common schemas, `assets` and sample bond data.
2. Bond service: cash flows, PV, duration, convexity, scenarios.
3. Bond API: instruments, market data, valuation, scenarios.
4. Backend tests for bond monotonicity, duration relation, scenario consistency.
5. Frontend API wrapper and TypeScript API types.
6. Bond dashboard UI: asset selection, input form, result cards, scenario chart.
7. Project feasibility service/API/UI.
8. Credit risk service/API/UI.
9. Market risk VaR service/API/UI.
10. Dashboard summary and multi-asset placeholders for future stock expansion.

## 8. Validation Results

### Coherence Validation

- Next.js App Router, TypeScript strict, Tailwind, Recharts, and Zustand are compatible with the dashboard UI requirements.
- FastAPI, Pydantic schemas, and pure Python services match calculation API requirements.
- Stateless backend supports MVP constraints and avoids premature DB/auth complexity.
- Multi-asset design is represented at the asset selection, API namespace, and service boundary levels.

### Requirements Coverage

- All PRD functional requirement categories map to concrete frontend/backend modules.
- NFR performance target is supported by local pure calculation services.
- NFR reliability target is supported by service-level unit tests.
- NFR usability target is supported by dashboard-first UI, defaults, sample data, and interpretation text.
- NFR extensibility target is supported by asset-specific valuation modules and common risk modules.

### Known Gaps and Decisions

- External bond API integration is intentionally deferred behind sample data fallback.
- Database and authentication are intentionally deferred.
- Stock support is architectural only in MVP; concrete stock screens and calculations are Phase 2.
- Dependency additions for backend math libraries should be made when service implementation starts.

### Readiness Assessment

Overall status: READY FOR IMPLEMENTATION

Confidence level: high for MVP architecture, medium for future external data integrations because provider-specific constraints are not yet selected.

### Implementation Handoff

The first implementation story should add backend bond schemas, bond service functions, bond routes, and service tests. The second story should wire the Next.js bond dashboard to those APIs. This gives ARIS an end-to-end vertical slice before adding project feasibility, credit risk, and VaR panels.
