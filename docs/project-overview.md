# ARIS - Project Overview

**Date:** 2026-04-23
**Type:** Full-stack financial analytics MVP
**Architecture:** Next.js frontend + FastAPI backend

## Executive Summary

ARIS(Asset Risk Integrated System)는 채권 가치평가, 신용 리스크, 프로젝트 사업성, 시장 리스크를 하나의 대시보드에서 분석하는 과제 제출용 금융 분석 시스템이다. 2~3일 MVP에서는 금융 수학적으로 설명 가능한 지표를 중심으로 구현해 시스템 개발 역량과 계산 로직의 정확성을 보여준다.

현재 저장소는 frontend/backend 기본 구조가 준비된 초기 단계다. Frontend는 Next.js App Router 템플릿 화면이고, backend는 FastAPI 앱에 `/`와 `/health` 엔드포인트만 제공한다. 따라서 다음 단계는 계산 엔진과 입력 중심 UI를 병렬로 확장하는 것이다.

## Project Classification

- **Repository Type:** Full-stack monorepo-style repository
- **Project Type(s):** Financial analytics dashboard, API-backed calculator
- **Primary Language(s):** TypeScript, Python
- **Architecture Pattern:** Client dashboard + stateless calculation API

## Multi-Part Structure

### Frontend

- **Type:** Next.js web application
- **Location:** `frontend/`
- **Purpose:** 금융 지표 입력, 시나리오 조정, 결과 카드/차트 표시
- **Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Recharts, Zustand

### Backend

- **Type:** FastAPI API service
- **Location:** `backend/`
- **Purpose:** 채권, 신용위험, 프로젝트, 시장위험 계산 API 제공
- **Tech Stack:** Python, FastAPI, Uvicorn

### How Parts Integrate

Frontend는 사용자의 입력값을 API 요청으로 backend에 전달하고, backend는 계산 결과와 시나리오 배열을 JSON으로 반환한다. MVP에서는 데이터 저장소 없이 stateless 계산 API로 시작하는 것이 적합하다.

## Technology Stack Summary

### Frontend Stack

| Area | Current Stack | MVP Usage |
| --- | --- | --- |
| Framework | Next.js 16 App Router | 탭 기반 대시보드 |
| UI Runtime | React 19 | 입력 폼, 결과 카드, 차트 상태 |
| Language | TypeScript | 계산 결과 타입과 API 응답 타입 |
| Styling | Tailwind CSS 4 | 조밀한 금융 대시보드 UI |
| Charting | Recharts | 금리-채권가격, VaR, 현금흐름 차트 |
| State | Zustand | 탭/폼/계산 결과 상태 관리 |

### Backend Stack

| Area | Current Stack | MVP Usage |
| --- | --- | --- |
| Framework | FastAPI | 계산 API |
| Server | Uvicorn | 로컬 개발 서버 |
| Language | Python | 금융 계산 로직 |
| Planned Math | NumPy, SciPy, numpy-financial | PV, IRR, VaR 등 |

## Key Features

### MVP Target

- 채권 현재가치(PV), Macaulay Duration, Modified Duration, Convexity 산출
- 금리 변동 시나리오에 따른 채권 가격 변동 그래프
- 재무비율 기반 Altman Z-Score 또는 자체 가중치 신용점수
- 프로젝트 NPV, IRR, Payback Period 계산
- 채권/주식 포트폴리오의 Parametric VaR 산출
- `[자산 평가] / [신용 리스크] / [프로젝트 사업성]` 중심 탭 UI

### Current Implementation

- Next.js 기본 화면 존재
- FastAPI 앱 초기화 완료
- `/` 루트 응답과 `/health` 헬스체크 제공
- BMad 문서/작업 관리 설정 완료

## Architecture Highlights

- MVP에서는 DB 없이 입력값 기반 계산 API로 시작한다.
- 금융 계산 로직은 backend의 별도 service 모듈로 분리한다.
- frontend는 계산식을 중복 구현하지 않고 API 결과를 표시한다.
- 차트 데이터는 backend가 계산한 시나리오 결과를 그대로 시각화한다.
- 평가/면접 대비를 위해 각 지표의 의미와 가정이 UI에 드러나야 한다.

## Development Overview

### Prerequisites

- Node.js 20+
- pnpm
- Python 3.14 환경 또는 현재 `backend/venv`
- FastAPI/Uvicorn

### Getting Started

Frontend와 backend를 각각 실행한다. 현재는 API 프록시가 설정되어 있지 않으므로 frontend에서 backend 호출 시 `NEXT_PUBLIC_API_BASE_URL` 사용을 권장한다.

### Key Commands

#### Frontend

- **Install:** `pnpm install`
- **Dev:** `pnpm dev`
- **Build:** `pnpm build`
- **Lint:** `pnpm lint`

#### Backend

- **Install:** `pip install -r requirements.txt`
- **Dev:** `python -m uvicorn main:app --reload`
- **Docs:** `http://127.0.0.1:8000/docs`

## Repository Structure

루트는 `frontend`, `backend`, `docs`, `_bmad`, `_bmad-output`로 구성된다. 실제 애플리케이션 코드는 `frontend/`와 `backend/`에 있고, `docs/`는 BMad 기반 프로젝트 지식 저장소다.

## Documentation Map

- [index.md](./index.md) - 문서 인덱스
- [source-tree-analysis.md](./source-tree-analysis.md) - 디렉터리 구조
- [architecture-frontend.md](./architecture-frontend.md) - Frontend 구조
- [architecture-backend.md](./architecture-backend.md) - Backend 구조
- [integration-architecture.md](./integration-architecture.md) - 통합 구조

---

_Generated using BMAD Method `document-project` workflow_
