---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation-skipped
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
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
  - docs/project-parts.json
  - docs/project-scan-report.json
  - _bmad-output/project-context.md
documentCounts:
  productBriefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 12
workflowType: "prd"
status: "complete"
completedAt: "2026-04-23T19:10:00+09:00"
classification:
  projectType: "web_app + api_backend"
  domain: "fintech"
  complexity: "high domain complexity, medium MVP implementation scope"
  projectContext: "brownfield"
vision:
  targetUsers: "Users who need quantitative risk analysis before real investment decisions"
  coreValue: "Accurate financial mathematics presented through clear visual dashboards"
  evaluationFocus: "Visualization, UI polish, friendly usability, and calculation accuracy"
  mvpMustHave: "Financial asset valuation, VaR, Duration, Convexity-based risk metrics"
  designDecision: "Bond-first MVP with multi-asset extensibility for future stock analysis"
---

# Product Requirements Document - ARIS

**Author:** Genie
**Date:** 2026-04-23

## Executive Summary

ARIS(Asset Risk Integrated System)는 실제 투자 판단 전에 금융자산의 가치와 리스크를 정량적으로 분석해야 하는 사용자를 위한 통합 자산 리스크/가치평가 대시보드다. 초기 MVP는 채권을 중심으로 현재가치(PV), Duration, Convexity, VaR를 계산하고, 결과를 대시보드와 차트로 시각화한다. 제품 구조는 채권 전용 계산기가 아니라 향후 주식 포트폴리오와 기타 자산군까지 확장 가능한 multi-asset 분석 플랫폼을 전제로 설계한다.

ARIS의 핵심 목표는 복잡한 예측 모델보다 검증 가능한 금융 수학 로직을 정확하게 구현하고, 사용자가 입력값 변화에 따른 가치와 리스크 변화를 직관적으로 이해하게 만드는 것이다. MVP는 채권 가치평가, 시장 리스크 산출, 신용 리스크 점수화, 프로젝트 사업성 평가를 하나의 분석 흐름으로 묶어 과제 제출에서 요구되는 계산 정확성, UI 완성도, 시각화, 사용성을 입증한다.

### What Makes This Special

ARIS는 단일 지표 계산기가 아니라 자산군별 입력 모델, 계산 엔진, 리스크 지표, 시각화를 분리한 확장형 분석 시스템이다. MVP에서는 채권이 첫 구현 대상이지만, VaR와 같은 공통 리스크 엔진은 주식 포트폴리오에도 재사용 가능하도록 설계한다. 이를 통해 사용자는 금융자산의 가치평가 결과뿐 아니라 금리 변화, 변동성, 현금흐름, 신용 상태가 리스크에 미치는 영향을 한 화면에서 비교할 수 있다.

제품의 차별점은 “정확한 계산 + 친절한 해석 + 시각적 표현”의 결합이다. Duration, Convexity, VaR, NPV, IRR 같은 금융 지표를 단순 숫자로 끝내지 않고, 입력 가정과 결과 의미를 함께 보여줌으로써 실제 투자 검토와 과제 평가 모두에서 설명 가능한 시스템이 된다.

## Project Classification

- **Project Type:** Web application + API backend
- **Domain:** Fintech / financial analytics
- **Project Context:** Brownfield. 기존 Next.js frontend와 FastAPI backend 스캐폴딩 위에 금융 분석 MVP를 추가한다.
- **Complexity:** 금융 도메인 자체는 높은 복잡도를 가지지만, MVP 구현 범위는 교육/과제 제출 목적에 맞춰 중간 수준으로 제한한다.
- **Implementation Direction:** Bond-first MVP with multi-asset extensibility. 채권 가치평가와 리스크 산출을 우선 구현하되, UI/API/리스크 엔진은 주식 확장을 고려해 설계한다.

## Success Criteria

### User Success

- 사용자는 채권의 기본 조건(액면가, 쿠폰금리, 시장금리, 만기, 지급주기)을 입력해 PV, Duration, Convexity를 즉시 확인할 수 있다.
- 사용자는 금리 변화 시나리오에 따른 채권 가격 변화를 차트로 이해할 수 있다.
- 사용자는 포트폴리오 가치와 변동성을 기반으로 95% 신뢰수준 VaR를 확인할 수 있다.
- 사용자는 계산 결과가 의미하는 리스크 수준을 숫자뿐 아니라 설명과 시각화로 이해할 수 있다.
- 사용자는 최소한의 금융 지식만 있어도 입력 → 계산 → 해석 흐름을 따라갈 수 있다.

### Business Success

- 과제 평가자가 ARIS를 단순 UI 데모가 아니라 금융 계산 엔진이 있는 분석 시스템으로 인식한다.
- 시연 시 핵심 기능이 하나의 대시보드 흐름에서 설명 가능하다.
- 채권 중심 MVP이지만 주식 등 다른 자산군으로 확장 가능한 설계 의도가 PRD와 코드 구조에서 드러난다.
- 평가 포인트인 시각화, UI 완성도, 친절한 사용성, 정확한 계산을 모두 확인할 수 있다.

### Technical Success

- 금융 계산 로직은 backend service 모듈에 분리되어 있고, frontend는 API 결과를 표시한다.
- 채권 PV, Duration, Convexity, VaR 계산은 재사용 가능한 함수로 구현된다.
- API request/response schema가 명확하며 FastAPI docs에서 테스트 가능하다.
- frontend는 자산 평가 중심 대시보드로 구성되고, bond-only UI에 과도하게 고정되지 않는다.
- 계산 함수는 핵심 케이스에 대한 테스트 또는 검증 가능한 샘플 입력/출력을 가진다.

### Measurable Outcomes

- 채권 가치평가 API가 PV, Macaulay Duration, Modified Duration, Convexity를 반환한다.
- 금리 시나리오 차트가 최소 5개 이상의 금리 충격 구간을 표시한다.
- VaR 계산이 95% 신뢰수준 기준 최대 손실액을 반환한다.
- 프로젝트 사업성 기능이 NPV, IRR, Payback Period를 반환한다.
- 신용 리스크 기능이 점수와 Normal / Watch / Default 등급을 반환한다.
- 주요 계산 결과는 UI에서 1초 내외로 갱신된다.

## Product Scope

### MVP - Minimum Viable Product

- 자산 평가 탭: 채권 PV, Duration, Convexity, 금리 시나리오 차트
- 통합 리스크 또는 시장 리스크 영역: Parametric VaR
- 신용 리스크 탭: 재무비율 기반 신용점수 및 등급
- 프로젝트 사업성 탭: NPV, IRR, Payback Period
- FastAPI 기반 계산 API
- Next.js 기반 입력 중심 대시보드

### Growth Features (Post-MVP)

- 주식 포트폴리오 VaR 및 변동성 분석
- 자산군별 비교 대시보드
- 시장 데이터 API 연동
- 결과 리포트 export
- 사용자별 포트폴리오 저장

### Vision (Future)

- 채권, 주식, 프로젝트 투자안을 하나의 플랫폼에서 비교하는 multi-asset valuation & risk platform
- 자산군별 평가 모델을 확장 가능한 plugin/module 구조로 추가
- 실제 투자 검토에 사용할 수 있는 리스크 리포팅 및 의사결정 지원 시스템

## User Journeys

### Journey 1: 투자 검토자가 채권 투자 리스크를 빠르게 판단하는 흐름

민지는 투자 검토를 위해 특정 채권의 매수 여부를 판단해야 한다. 기존에는 쿠폰금리, 만기, 시장금리를 별도로 계산기에 넣고, Duration과 Convexity는 따로 계산해야 해서 금리 변화에 따른 손실 가능성을 빠르게 설명하기 어려웠다.

민지는 ARIS의 자산 평가 탭에 들어가 채권의 액면가, 쿠폰금리, 시장금리, 만기, 지급주기를 입력한다. 시스템은 즉시 채권의 현재가치(PV), Macaulay Duration, Modified Duration, Convexity를 계산해 카드 형태로 보여준다. 이어서 금리 상승/하락 시나리오별 채권 가격 그래프를 확인한다.

핵심 순간은 민지가 “금리가 1%p 상승하면 이 채권 가격이 얼마나 흔들리는지”를 숫자와 차트로 동시에 이해하는 순간이다. 민지는 Duration과 Convexity를 근거로 금리 민감도를 설명하고, 투자 리스크를 더 명확하게 판단할 수 있다.

이 여정은 채권 입력 폼, 채권 계산 API, 민감도 지표 카드, 금리 시나리오 차트, 결과 해석 문구가 필요함을 보여준다.

### Journey 2: 사용자가 여러 자산군 확장을 염두에 두고 포트폴리오 VaR를 확인하는 흐름

준호는 현재 MVP에서는 채권 중심으로 분석하지만, 이후 주식 포트폴리오까지 같은 시스템에서 관리하고 싶다. 그는 특정 자산 포트폴리오의 가치와 변동성을 입력해 하루 기준 최대 손실 가능성을 빠르게 확인하려 한다.

준호는 시장 리스크 영역에서 포트폴리오 가치, 변동성, 보유기간, 신뢰수준을 입력한다. 시스템은 95% 신뢰수준의 Parametric VaR를 계산하고, “정규분포 가정하에 하루 동안 이 수준 이상의 손실이 발생할 가능성은 약 5%”처럼 결과를 해석해준다.

핵심 순간은 준호가 VaR가 채권뿐 아니라 주식 포트폴리오에도 적용 가능한 공통 리스크 엔진이라는 점을 확인하는 순간이다. 그는 ARIS가 단발성 채권 계산기가 아니라 multi-asset 리스크 플랫폼으로 확장될 수 있음을 이해한다.

이 여정은 assetType 확장성, 공통 VaR 계산 API, 결과 해석, 향후 주식 확장을 고려한 UI 구조가 필요함을 보여준다.

### Journey 3: 프로젝트 투자안을 검토하는 사용자가 NPV/IRR로 사업성을 판단하는 흐름

서연은 신규 프로젝트 투자안을 검토하고 있다. 초기 투자금과 연도별 예상 현금흐름은 있지만, 할인율을 바꿨을 때 프로젝트 가치가 어떻게 달라지는지 빠르게 확인하고 싶다.

서연은 프로젝트 사업성 탭에 초기 투자금, 할인율, 연도별 현금흐름을 입력한다. 시스템은 NPV, IRR, Payback Period를 계산하고, 현금흐름과 누적 회수 흐름을 시각적으로 보여준다.

핵심 순간은 서연이 NPV가 양수인지, IRR이 요구수익률보다 높은지, 투자금 회수 시점이 언제인지 한 화면에서 확인하는 순간이다. 이 결과로 프로젝트가 재무적으로 타당한지 빠르게 판단할 수 있다.

이 여정은 현금흐름 입력 UI, NPV/IRR/Payback 계산 API, 현금흐름 차트, 결과 해석 문구가 필요함을 보여준다.

### Journey 4: 과제 평가자가 시스템 완성도와 계산 신뢰성을 검토하는 흐름

평가자는 ARIS가 단순한 화면 데모인지, 실제 계산 로직을 가진 시스템인지 확인하려 한다. 평가자는 대시보드에서 채권 입력값을 바꿔보고, 금리 변화에 따라 PV와 Duration 관련 결과가 자연스럽게 변하는지 확인한다.

이후 FastAPI docs에서 계산 API를 직접 열어 request/response schema를 확인하고, 같은 입력값으로 API 결과가 UI에 반영되는지 비교한다. 마지막으로 PRD와 docs를 확인해 왜 채권 중심 MVP로 시작했고, 주식 확장을 어떻게 고려했는지 확인한다.

핵심 순간은 평가자가 “UI, API, 금융 계산 로직, 문서가 같은 방향으로 연결되어 있다”고 판단하는 순간이다.

이 여정은 API 문서화, 계산 로직 분리, 일관된 입력/출력 schema, PRD/docs 정합성이 필요함을 보여준다.

### Journey Requirements Summary

- 자산 평가 입력 폼과 결과 카드
- 채권 PV, Duration, Convexity 계산 API
- 금리 시나리오별 채권 가격 차트
- Parametric VaR 공통 리스크 엔진
- 프로젝트 NPV, IRR, Payback Period 계산
- 계산 결과에 대한 친절한 해석 문구
- FastAPI docs에서 검증 가능한 API schema
- 주식 확장을 고려한 multi-asset UI/API 구조
- 과제 평가자가 확인할 수 있는 문서와 구현의 정합성

## Domain-Specific Requirements

### Compliance & Regulatory

- ARIS MVP는 실제 투자 권유, 주문 체결, 자산 운용, 결제, KYC/AML 기능을 제공하지 않는다.
- UI와 문서에는 계산 결과가 투자 조언이 아니라 입력값 기반 분석 결과임을 명시한다.
- 실시간 거래 데이터나 개인 금융정보를 저장하지 않는 것을 MVP 기본 전제로 한다.
- 향후 실제 투자 서비스로 확장할 경우 금융 규제, 개인정보보호, 감사 로그, 접근 제어가 별도 요구사항으로 추가되어야 한다.

### Technical Constraints

- 모든 금융 계산은 입력값, 공식, 결과 해석이 추적 가능해야 한다.
- 채권 가치평가, Duration, Convexity, VaR, NPV, IRR 계산은 backend service 함수로 분리한다.
- 금리, 수익률, 변동성, 기간 단위는 API schema와 UI label에서 명확히 표시한다.
- 계산 실패 가능성이 있는 IRR, 비정상 입력값, 음수/0 값 등은 명확한 validation error를 반환해야 한다.
- VaR는 Parametric VaR이며 정규분포 가정을 사용한다는 점을 결과 화면에 표시한다.

### Integration Requirements

- MVP는 사용자 입력 기반 계산을 우선하며, 시장 데이터 API는 선택적 확장 기능으로 둔다.
- frontend는 backend API 결과를 표시하고, 동일 계산 로직을 중복 구현하지 않는다.
- FastAPI docs에서 각 계산 API를 직접 테스트할 수 있어야 한다.
- multi-asset 확장을 고려해 VaR 엔진은 채권/주식 포트폴리오 모두에 재사용 가능하게 설계한다.

### Risk Mitigations

- **계산 오류 리스크:** 핵심 금융 계산 함수에 샘플 케이스 또는 단위 테스트를 둔다.
- **오해 리스크:** 결과 카드에 지표의 의미와 계산 가정을 함께 표시한다.
- **범위 과다 리스크:** MVP는 채권 중심으로 완성하고, 주식은 구조적 확장 가능성까지만 반영한다.
- **데이터 의존 리스크:** 외부 API가 없어도 사용자 입력만으로 핵심 기능이 동작하도록 설계한다.
- **시연 실패 리스크:** UI 결과와 FastAPI docs 결과가 같은 입력에서 일치해야 한다.

## Web App + API Backend Specific Requirements

### Project-Type Overview

ARIS는 Next.js 기반 대시보드와 FastAPI 기반 계산 API로 구성된 full-stack 금융 분석 애플리케이션이다. 사용자는 브라우저에서 금융자산을 선택하거나 입력값을 조정하고, backend는 채권 가치평가, 리스크 산출, 프로젝트 사업성 계산을 수행해 JSON 결과를 반환한다.

### Technical Architecture Considerations

- Frontend는 입력, 시각화, 결과 해석을 담당한다.
- Backend는 금융 계산 로직의 authoritative source로 동작한다.
- 계산 로직은 frontend에 중복 구현하지 않는다.
- Backend API는 stateless 계산 API로 시작하며, DB 저장은 MVP 범위에서 제외한다.
- UI/API 구조는 bond-only가 아니라 multi-asset 확장을 고려한다.
- 외부 데이터 API는 사용자 입력 부담을 줄이는 보조 수단이며, API 연동 실패 시 샘플 데이터와 직접 입력 fallback을 제공한다.

### Browser & UI Requirements

- 주요 대상 환경은 데스크톱 브라우저다.
- 첫 화면은 랜딩 페이지가 아니라 ARIS 대시보드여야 한다.
- 최상위 UI는 최소 `[자산 평가] / [신용 리스크] / [프로젝트 사업성]` 탭을 제공한다.
- 자산 평가 탭은 채권 MVP를 기본으로 하되, 향후 주식 확장을 고려해 asset type 구조를 유지한다.
- 채권 분석 UX는 사용자가 모든 금융 변수를 직접 입력하는 계산기가 아니라, 채권 종목 선택을 통해 가능한 값을 자동 채움하는 분석 대시보드로 설계한다.
- 기본 모드에서 사용자는 채권 종목과 투자금액 또는 보유수량만 입력해 핵심 결과를 확인할 수 있어야 한다.
- 표면금리, 만기, 시장수익률, 지급주기, 액면가, 기준일 등은 고급 설정에서 수정 가능해야 한다.
- 핵심 결과는 metric card, 표, 차트로 표시한다.
- 계산 결과에는 지표 의미와 가정 설명이 함께 제공되어야 한다.

### External Data Requirements

- MVP의 채권 종목 선택은 `금융위원회_채권시세정보` API를 우선 후보로 사용한다.
- API에서 가져올 수 있는 값은 채권명, 종목 식별자, 시장가격, 수익률, 거래량 등 시장 시세 정보다.
- Duration/Convexity 계산에 필요한 표면금리, 지급주기, 잔존만기, 현금흐름 정보가 API에서 부족할 수 있으므로 사용자 보정 입력을 허용한다.
- 외부 API 키 설정이 어렵거나 응답이 불안정한 경우를 대비해 샘플 채권 데이터셋을 fallback으로 제공한다.
- 향후 주식 확장 시 KRX Open API 또는 증권사 API를 추가 데이터 소스로 검토한다.
- 기업 재무/신용 참고 데이터는 OpenDART를 후속 후보로 둔다.

### API Endpoint Requirements

- `GET /health`: backend 상태 확인
- `GET /api/bonds/instruments`: 채권 종목 목록 또는 샘플 종목 목록 조회
- `GET /api/bonds/market-data?bond_id=...`: 선택한 채권의 시장 데이터 조회
- `POST /api/bonds/valuation`: PV, Macaulay Duration, Modified Duration, Convexity 계산
- `POST /api/bonds/scenarios`: 금리 충격별 채권 가격 시나리오 계산
- `POST /api/credit-risk/score`: 신용점수와 리스크 등급 계산
- `POST /api/projects/feasibility`: NPV, IRR, Payback Period 계산
- `POST /api/market-risk/var`: Parametric VaR 계산

### Data Format Requirements

- 모든 API request/response는 JSON을 사용한다.
- Request schema는 숫자 단위와 범위를 명확히 해야 한다.
- Response는 계산 결과와 해석용 metadata를 포함할 수 있다.
- 오류 응답은 FastAPI validation error 또는 명확한 `detail` 메시지로 반환한다.

### Authentication & Authorization

- MVP에서는 사용자 계정, 인증, 권한 관리를 구현하지 않는다.
- 개인 포트폴리오 저장, 사용자별 분석 이력, 실제 금융 데이터 연동이 추가될 경우 인증을 후속 요구사항으로 정의한다.

### Performance Requirements

- 주요 계산 API는 일반적인 입력값 기준 1초 이내 응답을 목표로 한다.
- Frontend는 입력 변경 후 결과 갱신 상태를 명확히 표시한다.
- 차트 렌더링은 데스크톱 브라우저에서 끊김 없이 동작해야 한다.

### Implementation Considerations

- FastAPI route는 `app/api`, 계산 로직은 `app/services`, schema는 `app/schemas`로 분리한다.
- Frontend는 feature 단위로 `bonds`, `credit-risk`, `project-feasibility`, `market-risk` 구조를 갖는 것이 좋다.
- CORS 설정은 frontend/backend 로컬 포트가 다르므로 필요하다.
- FastAPI docs는 과제 평가자가 API를 직접 검증할 수 있는 보조 시연 도구로 활용한다.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience + calculation engine MVP

ARIS의 MVP는 단순히 계산 API만 만드는 것이 아니라, 실제 사용자가 “종목 선택 → 자동 채움 → 결과 해석” 흐름을 경험할 수 있는 대시보드여야 한다. 계산 정확성과 UI 사용성이 동시에 평가 대상이므로 backend 금융 엔진과 frontend 시각화가 함께 완성되어야 한다.

**Resource Requirements:**

1인 개발 기준으로 frontend, backend, 금융 계산 로직, 문서화를 모두 포함한다. 범위는 채권 중심으로 제한하되, API와 UI 구조는 주식 확장 가능성을 남긴다.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**

- 채권 종목을 선택하고 자동 채움된 데이터로 가치평가 결과 확인
- 투자금액 또는 보유수량 입력 후 리스크 지표 확인
- 금리 변화 시나리오에 따른 채권 가격 변화 시각화
- VaR로 포트폴리오 손실 가능성 확인
- 프로젝트 현금흐름 입력으로 NPV/IRR/Payback 확인
- 평가자가 FastAPI docs와 UI 결과를 비교해 계산 신뢰성 확인

**Must-Have Capabilities:**

- 채권 종목 선택 UI
- 샘플 채권 데이터 또는 금융위원회_채권시세정보 API 연동
- 채권 데이터 자동 채움 및 고급 설정 수정 기능
- 채권 PV, Macaulay Duration, Modified Duration, Convexity 계산
- 금리 시나리오별 채권 가격 차트
- Parametric VaR 계산
- 프로젝트 NPV, IRR, Payback Period 계산
- 신용 리스크 점수 및 Normal / Watch / Default 등급
- FastAPI 계산 API와 Next.js 대시보드 연동
- 계산 가정과 결과 의미를 설명하는 UI 문구

### Post-MVP Features

**Phase 2 (Post-MVP):**

- 주식 포트폴리오 VaR 및 변동성 분석
- KRX Open API 또는 증권사 API 기반 주식 종목 검색
- 자산군별 통합 비교 대시보드
- OpenDART 기반 기업 재무/신용 데이터 보조 연동
- 결과 리포트 export

**Phase 3 (Expansion):**

- 사용자별 포트폴리오 저장
- 시나리오 저장 및 비교
- 자산군별 평가 모델 plugin/module 구조
- 실제 투자 검토용 리스크 리포팅
- 외부 시장 데이터 자동 업데이트

### Risk Mitigation Strategy

**Technical Risks:**

외부 API 연동이 지연될 수 있으므로 샘플 채권 데이터 fallback을 MVP에 포함한다. 금융 계산 로직은 backend service 함수로 분리하고, 핵심 공식은 샘플 케이스로 검증한다.

**Market/User Risks:**

사용자가 모든 값을 직접 입력해야 하면 사용성이 떨어지므로, 기본 모드는 자동 채움 중심으로 설계하고 고급 설정은 접어둔다.

**Resource Risks:**

2~3일 MVP에서는 채권 중심 기능을 우선 완성한다. 주식은 실제 구현보다 확장 가능한 구조와 PRD/아키텍처 설명으로 반영한다.

**Scope Risks:**

실시간 데이터, 사용자 계정, 포트폴리오 저장, 리포트 export는 MVP에서 제외한다. 핵심은 계산 정확성, 시각화, 친절한 사용성이다.

## Functional Requirements

### Asset Selection & Input

- FR1: 사용자는 자산 평가 영역에서 분석할 자산군을 선택할 수 있다.
- FR2: 사용자는 MVP에서 채권 종목을 검색하거나 선택할 수 있다.
- FR3: 시스템은 선택된 채권에 대해 가능한 시장 데이터와 기본 정보를 자동으로 채울 수 있다.
- FR4: 사용자는 투자금액 또는 보유수량을 입력할 수 있다.
- FR5: 사용자는 자동 채움된 채권 정보를 직접 수정할 수 있다.
- FR6: 사용자는 고급 설정에서 표면금리, 만기, 시장수익률, 지급주기, 액면가, 기준일을 조정할 수 있다.
- FR7: 시스템은 외부 채권 데이터 조회가 불가능할 때 샘플 채권 데이터를 제공할 수 있다.

### Bond Valuation & Sensitivity

- FR8: 시스템은 채권 입력값을 기반으로 현재가치(PV)를 계산할 수 있다.
- FR9: 시스템은 채권 입력값을 기반으로 Macaulay Duration을 계산할 수 있다.
- FR10: 시스템은 채권 입력값을 기반으로 Modified Duration을 계산할 수 있다.
- FR11: 시스템은 채권 입력값을 기반으로 Convexity를 계산할 수 있다.
- FR12: 시스템은 금리 변화 시나리오별 채권 가격을 계산할 수 있다.
- FR13: 사용자는 금리 상승/하락 충격 범위를 조정할 수 있다.
- FR14: 시스템은 채권 가치평가 결과와 민감도 지표의 의미를 사용자에게 설명할 수 있다.

### Market Risk

- FR15: 사용자는 포트폴리오 가치, 변동성, 보유기간, 신뢰수준을 입력할 수 있다.
- FR16: 시스템은 입력값을 기반으로 Parametric VaR를 계산할 수 있다.
- FR17: 시스템은 VaR 결과의 신뢰수준과 정규분포 가정을 사용자에게 설명할 수 있다.
- FR18: 시스템은 VaR 계산 구조를 채권 외 자산군에도 적용 가능한 방식으로 표현할 수 있다.

### Credit Risk

- FR19: 사용자는 신용 리스크 평가에 필요한 재무비율을 입력할 수 있다.
- FR20: 시스템은 입력된 재무비율을 기반으로 신용점수를 계산할 수 있다.
- FR21: 시스템은 신용점수를 Normal, Watch, Default 등급으로 분류할 수 있다.
- FR22: 시스템은 어떤 재무비율이 신용점수에 영향을 주는지 설명할 수 있다.

### Project Feasibility

- FR23: 사용자는 초기 투자금, 할인율, 연도별 현금흐름을 입력할 수 있다.
- FR24: 시스템은 프로젝트의 NPV를 계산할 수 있다.
- FR25: 시스템은 프로젝트의 IRR을 계산할 수 있다.
- FR26: 시스템은 프로젝트의 Payback Period를 계산할 수 있다.
- FR27: 시스템은 현금흐름과 투자금 회수 흐름을 사용자에게 보여줄 수 있다.
- FR28: 시스템은 NPV, IRR, Payback Period의 의사결정 의미를 설명할 수 있다.

### Dashboard & Visualization

- FR29: 사용자는 대시보드에서 자산 평가, 신용 리스크, 프로젝트 사업성 영역을 전환할 수 있다.
- FR30: 시스템은 핵심 계산 결과를 요약 카드로 표시할 수 있다.
- FR31: 시스템은 금리 시나리오별 채권 가격 변화를 차트로 표시할 수 있다.
- FR32: 시스템은 프로젝트 현금흐름을 차트 또는 표로 표시할 수 있다.
- FR33: 시스템은 사용자가 입력을 변경하면 관련 계산 결과를 갱신할 수 있다.
- FR34: 시스템은 계산 결과에 대한 해석 문구를 함께 표시할 수 있다.

### API & Validation

- FR35: 시스템은 채권 종목 목록 또는 샘플 채권 목록을 API로 제공할 수 있다.
- FR36: 시스템은 선택한 채권의 시장 데이터를 API로 제공할 수 있다.
- FR37: 시스템은 채권 가치평가 API를 제공할 수 있다.
- FR38: 시스템은 채권 시나리오 분석 API를 제공할 수 있다.
- FR39: 시스템은 신용 리스크 계산 API를 제공할 수 있다.
- FR40: 시스템은 프로젝트 사업성 계산 API를 제공할 수 있다.
- FR41: 시스템은 시장 리스크 VaR 계산 API를 제공할 수 있다.
- FR42: 시스템은 잘못된 입력값에 대해 명확한 오류 메시지를 제공할 수 있다.
- FR43: 시스템은 API 문서에서 주요 계산 API를 직접 테스트할 수 있게 한다.

### Multi-Asset Extensibility

- FR44: 시스템은 자산군 확장을 고려해 asset type 개념을 표현할 수 있다.
- FR45: 시스템은 MVP 이후 주식 자산군을 추가할 수 있는 구조적 여지를 가져야 한다.
- FR46: 시스템은 공통 리스크 지표를 여러 자산군에 연결할 수 있어야 한다.
- FR47: 시스템은 자산군별 전용 지표와 공통 지표를 구분할 수 있어야 한다.

## Non-Functional Requirements

### Performance

- NFR1: 주요 계산 API는 일반적인 MVP 입력값 기준 1초 이내에 응답해야 한다.
- NFR2: 사용자가 입력값을 변경했을 때 관련 결과와 차트는 체감상 즉시 갱신되어야 한다.
- NFR3: 대시보드 초기 화면은 로컬 개발 환경 기준 과도한 지연 없이 표시되어야 한다.
- NFR4: 차트는 최소 5개 이상의 시나리오 구간을 표시해도 레이아웃 깨짐 없이 렌더링되어야 한다.

### Calculation Reliability

- NFR5: 채권 PV, Duration, Convexity, VaR, NPV, IRR 계산은 동일 입력에 대해 항상 동일 결과를 반환해야 한다.
- NFR6: 금융 계산 함수는 backend service 모듈에서 분리되어 검증 가능해야 한다.
- NFR7: 핵심 계산에는 샘플 입력/출력 또는 단위 테스트가 있어야 한다.
- NFR8: 계산 결과는 소수점 표시 기준을 일관되게 적용해야 한다.
- NFR9: IRR처럼 실패 가능성이 있는 계산은 실패 상태를 명확하게 반환해야 한다.

### Usability

- NFR10: 기본 채권 분석 흐름은 채권 종목 선택과 투자금액/보유수량 입력만으로 시작할 수 있어야 한다.
- NFR11: 고급 입력값은 기본 화면을 방해하지 않도록 별도 영역으로 분리되어야 한다.
- NFR12: 모든 핵심 지표는 숫자 결과와 함께 의미 설명을 제공해야 한다.
- NFR13: 사용자가 외부 API 데이터가 아닌 샘플 데이터로도 전체 데모를 진행할 수 있어야 한다.
- NFR14: 오류 메시지는 사용자가 어떤 입력을 수정해야 하는지 이해할 수 있어야 한다.

### Security & Data Handling

- NFR15: MVP는 사용자 계정, 개인 금융정보, 실제 거래정보를 저장하지 않는다.
- NFR16: API 키가 필요한 외부 데이터 연동 정보는 frontend 코드에 노출하지 않는다.
- NFR17: 계산 결과는 투자 조언이 아니라 입력값 기반 분석 결과임을 명시해야 한다.
- NFR18: 외부 API 연동 실패 시 시스템은 민감한 오류 정보를 사용자에게 노출하지 않아야 한다.

### Integration & Reliability

- NFR19: 외부 채권 API가 실패해도 샘플 데이터 fallback으로 핵심 데모가 가능해야 한다.
- NFR20: frontend와 backend의 API schema는 일관된 JSON 구조를 사용해야 한다.
- NFR21: FastAPI docs에서 주요 계산 API를 수동 검증할 수 있어야 한다.
- NFR22: frontend UI 결과와 backend API 결과는 동일 입력 기준 일치해야 한다.

### Maintainability & Extensibility

- NFR23: 채권 전용 계산과 공통 리스크 계산은 분리되어야 한다.
- NFR24: VaR 계산은 향후 주식 포트폴리오에도 재사용 가능해야 한다.
- NFR25: 새로운 자산군을 추가할 때 기존 채권 계산 로직을 크게 변경하지 않아야 한다.
- NFR26: API, service, schema 계층은 역할이 분리되어야 한다.
