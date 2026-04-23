# ARIS Integration Architecture

**Date:** 2026-04-23

## Overview

ARIS는 browser-based dashboard와 FastAPI calculation API를 결합한다. MVP에서는 인증, DB, 배치 작업 없이 사용자의 입력값을 즉시 계산하는 stateless 구조가 적합하다.

## Runtime Topology

```text
User Browser
    |
    | HTTP
    v
Next.js Frontend :3000
    |
    | JSON API calls
    v
FastAPI Backend :8000
    |
    | Pure calculation services
    v
Financial Analytics Engine
```

## Integration Contract

Frontend는 도메인별 입력 payload를 backend에 보내고, backend는 계산 결과와 시각화용 series 데이터를 반환한다.

공통 응답 설계:

```json
{
  "inputs": {},
  "results": {},
  "interpretation": {
    "label": "Normal",
    "summary": "계산 결과 해석"
  },
  "series": []
}
```

## Recommended Endpoint Map

| Domain | Endpoint | Method | Purpose |
| --- | --- | --- | --- |
| Health | `/health` | GET | Backend 상태 확인 |
| Bonds | `/api/bonds/valuation` | POST | PV, Duration, Convexity |
| Bonds | `/api/bonds/scenarios` | POST | 금리 변화별 가격 시뮬레이션 |
| Credit Risk | `/api/credit-risk/score` | POST | 신용점수와 등급 |
| Projects | `/api/projects/feasibility` | POST | NPV, IRR, Payback |
| Market Risk | `/api/market-risk/var` | POST | Parametric VaR |

## Frontend State Model

MVP에서는 다음 상태를 구분한다.

- form input state
- API loading/error state
- calculation result state
- chart scenario state

Zustand는 여러 탭에서 계산 결과를 유지하거나 통합 summary를 만들 때 사용한다. 단일 탭의 단순 입력은 React local state만으로도 충분하다.

## CORS and Environment

로컬 개발에서 Next.js와 FastAPI 포트가 다르므로 CORS 설정이 필요할 수 있다.

권장 backend 설정:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

권장 frontend 환경 변수:

```text
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## MVP Implementation Order

1. Backend bond valuation API 구현
2. Frontend 자산 평가 탭 구현
3. Project feasibility API/UI 구현
4. Credit risk API/UI 구현
5. VaR API/UI 구현
6. 통합 summary dashboard 구성

## Evaluation Strategy

과제 평가에서는 다음을 보여주는 것이 중요하다.

- 입력값을 바꾸면 결과가 일관되게 바뀐다.
- 계산 공식이 문서와 코드에 명확히 남아 있다.
- backend API docs에서 각 계산 기능을 테스트할 수 있다.
- frontend는 숫자 결과뿐 아니라 의미를 해석해 보여준다.
