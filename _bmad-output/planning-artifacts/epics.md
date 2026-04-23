---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
workflowType: "epics-and-stories"
project_name: "ARIS"
status: "complete"
completedAt: "2026-04-23"
---

# ARIS - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for ARIS, decomposing the requirements from the PRD and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: 사용자는 자산 평가 영역에서 분석할 자산군을 선택할 수 있다.
FR2: 사용자는 MVP에서 채권 종목을 검색하거나 선택할 수 있다.
FR3: 시스템은 선택한 채권에 대해 사용 가능한 시장 데이터와 기본 정보를 자동으로 채울 수 있다.
FR4: 사용자는 투자금액 또는 보유수량을 입력할 수 있다.
FR5: 사용자는 자동 채움된 채권 정보를 직접 수정할 수 있다.
FR6: 사용자는 고급 설정에서 표면금리, 만기, 시장수익률, 지급주기, 액면가, 기준일 등을 조정할 수 있다.
FR7: 시스템은 외부 채권 데이터 조회가 불가능할 때 샘플 채권 데이터를 제공할 수 있다.
FR8: 시스템은 채권 입력값을 기반으로 현재가치(PV)를 계산한다.
FR9: 시스템은 채권 입력값을 기반으로 Macaulay Duration을 계산한다.
FR10: 시스템은 채권 입력값을 기반으로 Modified Duration을 계산한다.
FR11: 시스템은 채권 입력값을 기반으로 Convexity를 계산한다.
FR12: 시스템은 금리 변화 시나리오별 채권 가격을 계산한다.
FR13: 사용자는 금리 상승/하락 충격 범위를 조정할 수 있다.
FR14: 시스템은 채권 가치평가 결과와 민감도 지표의 의미를 설명한다.
FR15: 사용자는 포트폴리오 가치, 변동성, 보유기간, 신뢰수준을 입력할 수 있다.
FR16: 시스템은 입력값을 기반으로 Parametric VaR를 계산한다.
FR17: 시스템은 VaR 결과의 신뢰수준과 정규분포 가정을 설명한다.
FR18: 시스템은 VaR 계산 구조를 채권 및 이후 자산군에 적용 가능한 방식으로 표현한다.
FR19: 사용자는 신용 위험 평가에 필요한 재무비율을 입력할 수 있다.
FR20: 시스템은 입력 재무비율을 기반으로 신용점수를 계산한다.
FR21: 시스템은 신용점수를 Normal, Watch, Default 등급으로 분류한다.
FR22: 시스템은 어떤 재무비율이 신용점수에 영향을 주는지 설명한다.
FR23: 사용자는 초기 투자금, 할인율, 연도별 현금흐름을 입력할 수 있다.
FR24: 시스템은 프로젝트 NPV를 계산한다.
FR25: 시스템은 프로젝트 IRR을 계산한다.
FR26: 시스템은 Payback Period를 계산한다.
FR27: 시스템은 현금흐름과 누적 회수 흐름을 사용자에게 보여준다.
FR28: 시스템은 NPV, IRR, Payback Period의 의사결정 의미를 설명한다.
FR29: 사용자는 dashboard에서 자산 평가, 신용 위험, 프로젝트 사업성 영역을 전환할 수 있다.
FR30: 시스템은 핵심 계산 결과를 요약 카드로 표시한다.
FR31: 시스템은 금리 시나리오별 채권 가격 변화를 차트로 표시한다.
FR32: 시스템은 프로젝트 현금흐름을 차트 또는 표로 표시한다.
FR33: 시스템은 사용자가 입력을 변경하면 관련 계산 결과를 갱신한다.
FR34: 시스템은 계산 결과에 대한 해석 문구를 함께 표시한다.
FR35: 시스템은 채권 종목 목록 또는 샘플 채권 목록을 API로 제공한다.
FR36: 시스템은 선택한 채권의 시장 데이터를 API로 제공한다.
FR37: 시스템은 채권 가치평가 API를 제공한다.
FR38: 시스템은 채권 시나리오 분석 API를 제공한다.
FR39: 시스템은 신용 위험 계산 API를 제공한다.
FR40: 시스템은 프로젝트 사업성 계산 API를 제공한다.
FR41: 시스템은 시장 위험 VaR 계산 API를 제공한다.
FR42: 시스템은 잘못된 입력값에 대해 명확한 오류 메시지를 제공한다.
FR43: 시스템은 API 문서에서 주요 계산 API를 직접 테스트할 수 있게 한다.
FR44: 시스템은 자산군 확장을 고려한 asset type 개념을 표현한다.
FR45: 시스템은 MVP 이후 주식 자산군을 추가할 수 있는 구조를 가진다.
FR46: 시스템은 공통 위험 지표를 여러 자산군에 연결할 수 있어야 한다.
FR47: 시스템은 자산군별 전용 지표와 공통 지표를 구분할 수 있어야 한다.

### NonFunctional Requirements

NFR1: 주요 계산 API는 일반적인 MVP 입력값 기준 1초 이내 응답을 목표로 한다.
NFR2: 사용자가 입력값을 변경하면 관련 결과와 차트가 체감상 즉시 갱신되어야 한다.
NFR3: dashboard 초기 화면은 로컬 개발 환경 기준 과도한 지연 없이 표시되어야 한다.
NFR4: 차트는 최소 5개 이상의 시나리오 구간을 표시해도 레이아웃 깨짐 없이 렌더링되어야 한다.
NFR5: 채권 PV, Duration, Convexity, VaR, NPV, IRR 계산은 동일 입력에 대해 항상 동일 결과를 반환해야 한다.
NFR6: 금융 계산 함수는 backend service 모듈에서 분리되어 검증 가능해야 한다.
NFR7: 핵심 계산에는 샘플 입력/출력 또는 단위 테스트가 있어야 한다.
NFR8: 계산 결과의 소수점 표시 기준은 일관되게 적용되어야 한다.
NFR9: IRR처럼 실패 가능성이 있는 계산은 실패 상태를 명확히 반환해야 한다.
NFR10: 기본 채권 분석 흐름은 채권 종목 선택과 투자금액/보유수량 입력만으로 시작할 수 있어야 한다.
NFR11: 고급 입력값은 기본 화면을 방해하지 않도록 별도 영역으로 분리되어야 한다.
NFR12: 모든 핵심 지표는 숫자 결과와 함께 의미 설명을 제공해야 한다.
NFR13: 외부 API가 없어도 샘플 데이터로 전체 demo flow를 진행할 수 있어야 한다.
NFR14: 오류 메시지는 사용자가 어떤 입력을 수정해야 하는지 이해할 수 있어야 한다.
NFR15: MVP는 사용자 계정, 개인 금융정보, 실제 거래정보를 저장하지 않는다.
NFR16: 외부 데이터 연동 정보나 API key는 frontend 코드에 노출하지 않는다.
NFR17: 계산 결과가 투자 조언이 아니라 입력값 기반 분석 결과임을 명시해야 한다.
NFR18: 외부 API 연동 실패 시 민감한 오류 정보를 사용자에게 노출하지 않는다.
NFR19: 외부 채권 API가 실패해도 샘플 데이터 fallback으로 demo가 가능해야 한다.
NFR20: frontend와 backend는 일관된 JSON API schema를 사용해야 한다.
NFR21: FastAPI docs에서 주요 계산 API를 수동 검증할 수 있어야 한다.
NFR22: frontend UI 결과와 backend API 결과는 동일 입력 기준 일치해야 한다.
NFR23: 채권 전용 계산과 공통 위험 계산은 분리되어야 한다.
NFR24: VaR 계산은 이후 주식 포트폴리오에도 재사용 가능해야 한다.
NFR25: 새 자산군 추가 시 기존 채권 계산 로직을 크게 변경하지 않아야 한다.
NFR26: API, service, schema 계층은 역할별로 분리되어야 한다.

### Additional Requirements

- 현재 repository의 Next.js App Router, TypeScript strict, Tailwind CSS 4, Recharts, Zustand scaffold를 유지한다.
- FastAPI backend는 router, schema, service 계층을 분리한다.
- 모든 핵심 금융 계산은 backend service가 authoritative source가 되며 frontend는 계산식을 중복 구현하지 않는다.
- API field는 snake_case를 사용하고 frontend 내부 변수/props는 camelCase를 사용한다.
- 모든 calculation response는 inputs, results, interpretation, series 구조를 우선한다.
- CORS는 local frontend origin을 허용하도록 설정한다.
- `NEXT_PUBLIC_API_BASE_URL`로 frontend/backend 연결을 구성한다.
- MVP는 stateless API로 구현하며 DB와 auth는 제외한다.
- sample bond data fallback을 제공한다.
- `asset_type`과 common risk service를 통해 future stock 확장을 고려한다.
- VaR는 common market risk service로 두고 Duration/Convexity는 bond-only service로 둔다.
- Backend tests는 service-level financial formula 검증을 우선한다.

### UX Design Requirements

No separate UX Design document was found. UX requirements are derived from PRD and Architecture:

UX-DR1: 첫 화면은 landing page가 아니라 즉시 사용 가능한 ARIS dashboard여야 한다.
UX-DR2: dashboard는 자산 평가, 신용 위험, 프로젝트 사업성, 시장 위험 영역을 전환할 수 있어야 한다.
UX-DR3: 채권 화면은 기본 입력 흐름과 고급 설정을 분리해야 한다.
UX-DR4: 계산 결과는 metric card, chart, interpretation panel 조합으로 표시되어야 한다.
UX-DR5: API loading, error, result 상태가 명확히 표시되어야 한다.
UX-DR6: 사용자에게 보이는 UI copy는 한국어를 기본으로 한다.
UX-DR7: 차트는 desktop dashboard에서 라벨 겹침 없이 표시되어야 한다.

### FR Coverage Map

FR1: Epic 1 - asset type selection foundation for the analysis dashboard.
FR2: Epic 1 - bond instrument selection.
FR3: Epic 1 - selected bond default data population.
FR4: Epic 1 - investment amount or holding quantity input.
FR5: Epic 1 - editable bond assumptions.
FR6: Epic 1 - advanced bond valuation assumptions.
FR7: Epic 1 - sample bond fallback data.
FR8: Epic 1 - bond PV calculation.
FR9: Epic 1 - Macaulay Duration calculation.
FR10: Epic 1 - Modified Duration calculation.
FR11: Epic 1 - Convexity calculation.
FR12: Epic 1 - rate scenario price calculation.
FR13: Epic 1 - configurable rate shock range.
FR14: Epic 1 - bond result interpretation.
FR15: Epic 4 - market risk input model.
FR16: Epic 4 - Parametric VaR calculation.
FR17: Epic 4 - VaR assumption explanation.
FR18: Epic 5 - reusable VaR structure for multiple asset classes.
FR19: Epic 3 - credit risk financial ratio inputs.
FR20: Epic 3 - credit score calculation.
FR21: Epic 3 - Normal / Watch / Default classification.
FR22: Epic 3 - credit score driver explanation.
FR23: Epic 2 - project feasibility inputs.
FR24: Epic 2 - NPV calculation.
FR25: Epic 2 - IRR calculation.
FR26: Epic 2 - Payback Period calculation.
FR27: Epic 2 - cash-flow and cumulative recovery display.
FR28: Epic 2 - project result interpretation.
FR29: Epic 5 - dashboard-level navigation across analysis areas.
FR30: Epic 1, Epic 2, Epic 3, Epic 4 - metric cards for each analysis module.
FR31: Epic 1 - bond scenario chart.
FR32: Epic 2 - project cash-flow chart or table.
FR33: Epic 1, Epic 2, Epic 3, Epic 4 - result refresh when inputs change.
FR34: Epic 1, Epic 2, Epic 3, Epic 4 - interpretation copy for each calculation result.
FR35: Epic 1 - bond instruments API.
FR36: Epic 1 - bond market-data API.
FR37: Epic 1 - bond valuation API.
FR38: Epic 1 - bond scenario API.
FR39: Epic 3 - credit risk API.
FR40: Epic 2 - project feasibility API.
FR41: Epic 4 - market risk VaR API.
FR42: Epic 1, Epic 2, Epic 3, Epic 4 - validation and actionable errors.
FR43: Epic 1, Epic 2, Epic 3, Epic 4 - FastAPI docs coverage for calculation APIs.
FR44: Epic 5 - asset type concept represented in UI/API structure.
FR45: Epic 5 - future stock asset structure readiness.
FR46: Epic 5 - common risk indicators connected to multiple asset classes.
FR47: Epic 5 - separation of asset-specific and common indicators.

## Epic List

### Epic 1: Bond Valuation Vertical Slice

Users can select or use sample bond data, adjust bond assumptions, calculate PV, Duration, Convexity, and rate scenarios, then verify the same results through FastAPI docs and the Next.js dashboard.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR30, FR31, FR33, FR34, FR35, FR36, FR37, FR38, FR42, FR43

### Epic 2: Project Feasibility Analysis

Users can enter project investment assumptions and cash flows, then evaluate NPV, IRR, Payback Period, cash-flow progression, and decision meaning in the dashboard.

**FRs covered:** FR23, FR24, FR25, FR26, FR27, FR28, FR30, FR32, FR33, FR34, FR40, FR42, FR43

### Epic 3: Explainable Credit Risk Scoring

Users can enter key financial ratios, receive an explainable credit risk score and Normal / Watch / Default grade, and understand which ratios affected the result.

**FRs covered:** FR19, FR20, FR21, FR22, FR30, FR33, FR34, FR39, FR42, FR43

### Epic 4: Market Risk VaR Analysis

Users can estimate potential portfolio loss with Parametric VaR by entering portfolio value, volatility, holding period, and confidence level, with assumptions clearly explained.

**FRs covered:** FR15, FR16, FR17, FR30, FR33, FR34, FR41, FR42, FR43

### Epic 5: Dashboard Integration and Multi-Asset Readiness

Users can move across analysis areas in a cohesive dashboard while the codebase exposes asset type concepts and separates asset-specific metrics from common risk metrics for future stock expansion.

**FRs covered:** FR18, FR29, FR44, FR45, FR46, FR47

## Epic 1: Bond Valuation Vertical Slice

Users can select or use sample bond data, adjust bond assumptions, calculate PV, Duration, Convexity, and rate scenarios, then verify the same results through FastAPI docs and the Next.js dashboard.

### Story 1.1: Bond Sample Data and Asset Type Foundation

As an ARIS user,
I want to select bond as an asset type and load sample bond data,
So that I can start analysis without relying on an external market data API.

**Acceptance Criteria:**

**Given** the FastAPI backend is running
**When** I request `GET /api/assets/types`
**Then** the response includes `bond` as an enabled MVP asset type
**And** future asset types such as `stock` are represented as planned or disabled metadata.

**Given** no external bond API is configured
**When** I request `GET /api/bonds/instruments`
**Then** the backend returns at least three sample bonds with stable `instrument_id`, name, currency, face value, coupon rate, maturity, payment frequency, and market yield.

**Given** I request market data for a known sample bond
**When** I call `GET /api/bonds/market-data?instrument_id=...`
**Then** the response returns normalized bond assumptions that can be used directly by valuation requests.

### Story 1.2: Bond Valuation Calculation Service

As an evaluator,
I want the backend to calculate bond PV, Macaulay Duration, Modified Duration, and Convexity,
So that ARIS has a trustworthy financial engine behind the dashboard.

**Acceptance Criteria:**

**Given** valid bond inputs with decimal rates, maturity in years, and payment frequency
**When** the bond valuation service is called
**Then** it returns PV, Macaulay Duration, Modified Duration, and Convexity
**And** the response includes assumptions and units used by the calculation.

**Given** the market yield increases while other inputs remain constant
**When** the service calculates the new bond price
**Then** the price is lower than the prior price.

**Given** a positive market yield
**When** the service calculates both duration values
**Then** Modified Duration is lower than Macaulay Duration.

### Story 1.3: Bond Valuation and Scenario APIs

As a developer or evaluator,
I want FastAPI endpoints for bond valuation and rate scenarios,
So that backend calculations can be verified independently from the UI.

**Acceptance Criteria:**

**Given** valid valuation payload
**When** I call `POST /api/bonds/valuation`
**Then** the API returns `inputs`, `results`, and `interpretation`
**And** FastAPI docs show the request and response schema.

**Given** valid scenario payload with rate shock range
**When** I call `POST /api/bonds/scenarios`
**Then** the API returns at least five scenario points
**And** each point includes market yield, price, and rate shock value.

**Given** invalid inputs such as zero payment frequency or negative maturity
**When** I call either calculation API
**Then** the API returns a validation error with a clear `detail`.

### Story 1.4: Bond Dashboard UI

As an ARIS user,
I want a bond analysis dashboard with inputs, metric cards, chart, and interpretation,
So that I can understand how rate changes affect bond value and sensitivity.

**Acceptance Criteria:**

**Given** the frontend is running
**When** I open the first screen
**Then** I see the usable ARIS dashboard rather than a landing page
**And** bond analysis is available as the primary MVP flow.

**Given** sample bonds are available from the backend
**When** I select a bond
**Then** the form is populated with default assumptions
**And** I can edit advanced inputs separately from the basic flow.

**Given** valid bond inputs
**When** I run or trigger calculation
**Then** the UI displays PV, Macaulay Duration, Modified Duration, and Convexity as metric cards
**And** it displays a rate scenario chart and Korean interpretation text.

**Given** the backend returns an error
**When** the UI receives the error
**Then** a Korean, actionable error state is displayed.

## Epic 2: Project Feasibility Analysis

Users can enter project investment assumptions and cash flows, then evaluate NPV, IRR, Payback Period, cash-flow progression, and decision meaning in the dashboard.

### Story 2.1: Project Feasibility Calculation Service

As an ARIS user,
I want project NPV, IRR, and Payback Period calculated from cash flows,
So that I can judge whether a project investment is financially feasible.

**Acceptance Criteria:**

**Given** initial investment, discount rate, and yearly cash flows
**When** the project feasibility service is called
**Then** it returns NPV, IRR when defined, Payback Period, and cumulative cash-flow series.

**Given** discount rate increases while cash flows remain constant
**When** NPV is recalculated
**Then** NPV decreases.

**Given** cash flows do not produce a valid IRR
**When** the service attempts IRR calculation
**Then** it returns a controlled undefined state rather than crashing.

### Story 2.2: Project Feasibility API

As a developer or evaluator,
I want a project feasibility API,
So that project calculations can be tested in FastAPI docs and reused by the dashboard.

**Acceptance Criteria:**

**Given** valid project feasibility payload
**When** I call `POST /api/projects/feasibility`
**Then** the response includes `inputs`, `results`, `interpretation`, and cash-flow `series`.

**Given** invalid cash-flow inputs
**When** I call the API
**Then** the response returns a validation or controlled domain error.

**Given** the API is available
**When** I open FastAPI docs
**Then** I can inspect and execute the project feasibility endpoint.

### Story 2.3: Project Feasibility Dashboard Panel

As an ARIS user,
I want to enter project cash flows and see feasibility results,
So that I can understand project return and recovery timing.

**Acceptance Criteria:**

**Given** I open the project feasibility area
**When** I enter initial investment, discount rate, and yearly cash flows
**Then** the UI calls the backend and displays NPV, IRR, and Payback Period.

**Given** project results are returned
**When** the UI renders them
**Then** it shows a cash-flow chart or table and Korean interpretation text.

**Given** IRR is undefined
**When** the UI renders the result
**Then** it clearly states that IRR is not defined for the provided cash-flow pattern.

## Epic 3: Explainable Credit Risk Scoring

Users can enter key financial ratios, receive an explainable credit risk score and Normal / Watch / Default grade, and understand which ratios affected the result.

### Story 3.1: Credit Risk Scoring Service

As an ARIS user,
I want financial ratios converted into an explainable credit risk score,
So that I can judge issuer or company credit condition at a high level.

**Acceptance Criteria:**

**Given** valid financial ratio inputs
**When** the credit risk service is called
**Then** it returns a numeric score, grade, and ratio contribution details.

**Given** a weaker debt or liquidity profile
**When** the score is recalculated
**Then** the grade can move from Normal to Watch or Default according to documented thresholds.

**Given** the model is simplified for MVP
**When** the result is returned
**Then** the interpretation states that it is an explainable simplified scoring model.

### Story 3.2: Credit Risk API

As a developer or evaluator,
I want a credit risk scoring API,
So that credit score behavior can be tested independently from the dashboard.

**Acceptance Criteria:**

**Given** valid credit ratio payload
**When** I call `POST /api/credit-risk/score`
**Then** the response includes `inputs`, `results`, and `interpretation`.

**Given** out-of-range ratio values
**When** I call the API
**Then** the API returns clear validation feedback.

**Given** the API is available
**When** I open FastAPI docs
**Then** I can execute the credit risk scoring endpoint.

### Story 3.3: Credit Risk Dashboard Panel

As an ARIS user,
I want to enter financial ratios and see credit risk grade with drivers,
So that I can understand why the credit risk result was assigned.

**Acceptance Criteria:**

**Given** I open the credit risk area
**When** I enter financial ratio values
**Then** the UI displays score, grade, and key contribution explanations.

**Given** a grade is returned
**When** the UI renders the result
**Then** Normal, Watch, and Default states are visually distinct and labeled in Korean.

**Given** invalid input is submitted
**When** the backend returns validation feedback
**Then** the UI shows an actionable Korean error message.

## Epic 4: Market Risk VaR Analysis

Users can estimate potential portfolio loss with Parametric VaR by entering portfolio value, volatility, holding period, and confidence level, with assumptions clearly explained.

### Story 4.1: Parametric VaR Service

As an ARIS user,
I want Parametric VaR calculated from portfolio value and volatility,
So that I can estimate potential loss at a selected confidence level.

**Acceptance Criteria:**

**Given** portfolio value, annualized volatility, confidence level, and holding period
**When** the VaR service is called
**Then** it returns VaR amount, confidence level, holding period, and assumptions.

**Given** portfolio value or volatility increases
**When** VaR is recalculated
**Then** VaR increases.

**Given** the service returns a result
**When** interpretation is generated
**Then** it states the normal distribution and confidence-level assumption.

### Story 4.2: Market Risk VaR API

As a developer or evaluator,
I want a market risk VaR API,
So that VaR behavior can be verified and reused by future asset classes.

**Acceptance Criteria:**

**Given** valid VaR payload
**When** I call `POST /api/market-risk/var`
**Then** the response includes `inputs`, `results`, and `interpretation`.

**Given** invalid confidence level or volatility
**When** I call the API
**Then** the response returns validation feedback.

**Given** `asset_type` is included in the request or response metadata
**When** the API returns
**Then** the structure remains usable for bond MVP and future stock portfolios.

### Story 4.3: Market Risk Dashboard Panel

As an ARIS user,
I want to enter portfolio risk assumptions and see VaR,
So that I can understand potential loss under a confidence-level assumption.

**Acceptance Criteria:**

**Given** I open the market risk area
**When** I enter portfolio value, volatility, holding period, and confidence level
**Then** the UI displays VaR amount and explanatory assumptions.

**Given** inputs are changed
**When** recalculation completes
**Then** metric cards and interpretation update consistently.

**Given** the user views the VaR result
**When** they read the interpretation
**Then** it is clear that VaR is an analytical estimate, not investment advice.

## Epic 5: Dashboard Integration and Multi-Asset Readiness

Users can move across analysis areas in a cohesive dashboard while the codebase exposes asset type concepts and separates asset-specific metrics from common risk metrics for future stock expansion.

### Story 5.1: Integrated Dashboard Navigation

As an ARIS user,
I want to switch between asset valuation, credit risk, project feasibility, and market risk areas,
So that I can use ARIS as one coherent analysis dashboard.

**Acceptance Criteria:**

**Given** the frontend dashboard is open
**When** I use the navigation or tabs
**Then** I can switch between bond valuation, credit risk, project feasibility, and market risk areas.

**Given** a panel is loading or has an error
**When** I switch areas
**Then** the dashboard remains stable and does not lose unrelated panel state unexpectedly.

**Given** the dashboard is viewed on a desktop browser
**When** all panels are reachable
**Then** the layout remains dense, readable, and not styled like a marketing landing page.

### Story 5.2: Multi-Asset Type Boundaries

As a future ARIS developer,
I want asset type boundaries represented in UI and API code,
So that stock analysis can be added later without rewriting bond logic.

**Acceptance Criteria:**

**Given** the asset type selector exists
**When** the user views available asset types
**Then** bond is enabled and stock is clearly represented as future or disabled.

**Given** backend schemas and services are organized
**When** a developer inspects the codebase
**Then** bond-specific valuation code is separate from common market risk code.

**Given** future stock support is added
**When** a developer follows current boundaries
**Then** the change can add stock-specific files without modifying bond calculation formulas.

### Story 5.3: MVP Readiness Verification

As an evaluator,
I want the MVP flows to be verifiable from both UI and API docs,
So that I can confirm ARIS is more than a frontend mockup.

**Acceptance Criteria:**

**Given** the backend is running
**When** I open FastAPI docs
**Then** bond valuation, bond scenarios, project feasibility, credit risk, and VaR endpoints are visible and executable.

**Given** the frontend is running
**When** I enter representative inputs for each implemented panel
**Then** UI results match backend API results for the same inputs.

**Given** the evaluator reviews the dashboard
**When** they inspect calculations and interpretations
**Then** each major metric includes assumptions, units, and Korean explanatory text.
