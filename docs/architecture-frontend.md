# ARIS Frontend Architecture

**Date:** 2026-04-23
**Part:** Frontend
**Location:** `frontend/`

## Current State

Frontend는 create-next-app 기반 Next.js App Router 프로젝트다. 현재 `app/page.tsx`는 기본 템플릿 화면이며, ARIS 도메인 UI는 아직 구현되지 않았다.

## Target Role

Frontend의 역할은 금융 계산을 직접 수행하기보다 입력과 결과 해석을 잘 보여주는 대시보드를 제공하는 것이다. 계산은 backend API에 위임하고, frontend는 다음을 담당한다.

- 자산 평가, 신용 리스크, 프로젝트 사업성 탭 구성
- 금융 입력 폼과 validation
- 결과 카드와 지표 강조
- 금리 시나리오, 현금흐름, VaR 차트 시각화
- 과제 평가자가 계산 흐름을 이해할 수 있는 설명 UI

## Recommended UI Structure

```text
frontend/app/
├── page.tsx
├── layout.tsx
├── globals.css
├── components/
│   ├── dashboard-shell.tsx
│   ├── metric-card.tsx
│   ├── scenario-chart.tsx
│   └── tabs.tsx
├── features/
│   ├── bonds/
│   │   ├── bond-input-form.tsx
│   │   ├── bond-results.tsx
│   │   └── types.ts
│   ├── credit-risk/
│   ├── project-feasibility/
│   └── market-risk/
└── lib/
    ├── api.ts
    └── format.ts
```

현재 위 구조는 아직 없다. MVP 구현 시 한 파일에 모두 넣기보다 최소한 `features` 단위로 나누면 작업 속도와 설명 가능성이 좋아진다.

## Data Flow

1. 사용자가 입력 폼에서 금융 변수 입력
2. Frontend가 API request payload 생성
3. Backend 계산 API 호출
4. 응답 결과를 카드/표/차트로 표시
5. 입력 변경 시 재계산

## Planned Screens

### 자산 평가

- 채권 액면가, 쿠폰금리, 시장금리, 만기, 지급주기 입력
- PV, Macaulay Duration, Modified Duration, Convexity 표시
- 금리 변화별 채권 가격 시나리오 차트

### 신용 리스크

- 부채비율, 유동비율, 영업이익률 등 재무비율 입력
- Altman Z-Score 또는 자체 weighted score 표시
- Normal, Watch, Default 등급 표시

### 프로젝트 사업성

- 초기 투자금, 할인율, 연도별 현금흐름 입력
- NPV, IRR, Payback Period 표시
- 현금흐름 막대/누적 그래프 표시

### 통합 리스크

- 포트폴리오 가치, 변동성, 보유기간, 신뢰수준 입력
- Parametric VaR 결과 표시

## Styling Guidance

금융/운영 도구 성격이 강하므로 조밀하고 스캔하기 쉬운 UI가 적합하다.

- 메인 화면은 바로 대시보드로 시작
- 과도한 hero/landing page 지양
- 결과 수치를 큰 metric card로 강조
- 입력 폼과 결과를 같은 viewport에서 비교 가능하게 배치
- 차트는 결과 해석을 돕는 보조 수단으로 사용

## API Integration

권장 환경 변수:

```text
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

권장 fetch wrapper:

```ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
```

## Risks

- 모든 계산을 frontend에 구현하면 backend 가치가 약해진다.
- 차트와 입력 UI에 시간을 너무 많이 쓰면 핵심 금융 엔진 구현이 밀릴 수 있다.
- Recharts를 사용할 때 작은 화면에서 라벨 겹침을 조심해야 한다.

## Next Implementation Step

`frontend/app/page.tsx`를 ARIS 대시보드 shell로 교체하고, bond calculator부터 구현하는 것이 좋다. 채권 평가는 공식과 결과가 명확해서 MVP의 첫 데모 기능으로 적합하다.
