# ARIS Backend Development Guide

**Date:** 2026-04-23
**Part:** Backend

## Prerequisites

- Python environment
- FastAPI
- Uvicorn

## Local Run

```powershell
cd C:\ARIS\ARIS\backend
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload
```

기본 접속 주소:

```text
http://127.0.0.1:8000
```

API 문서:

```text
http://127.0.0.1:8000/docs
```

## Useful Commands

```powershell
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

## Current Files

- `main.py`: FastAPI app 생성, health router 등록
- `app/api/health.py`: `/health` endpoint
- `requirements.txt`: FastAPI/Uvicorn dependency pins

## MVP Work Plan

1. `app/services/bonds.py`에 채권 계산 함수 추가
2. `app/schemas/bonds.py`에 request/response schema 추가
3. `app/api/bonds.py`에 `/api/bonds/valuation` endpoint 추가
4. 동일 패턴으로 project feasibility, credit risk, market risk 추가
5. CORS middleware 추가
6. 계산 함수 단위 테스트 추가

## Suggested Dependency Update

금융 계산 구현 시 다음 패키지 추가를 검토한다.

```text
numpy
scipy
numpy-financial
```

## Testing Guidance

MVP라도 계산 엔진은 UI보다 테스트 가치가 높다. 최소한 다음 케이스를 검증한다.

- 채권 PV가 할인율 상승 시 감소하는지
- modified duration이 Macaulay duration보다 작은지
- NPV가 할인율 상승 시 감소하는지
- IRR 계산 실패 케이스를 처리하는지
- VaR가 포트폴리오 가치/변동성 증가에 따라 증가하는지
