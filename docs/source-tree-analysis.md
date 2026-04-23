# ARIS - Source Tree Analysis

**Date:** 2026-04-23

## Overview

ARIS는 Next.js frontend와 FastAPI backend를 분리한 full-stack 구조다. 현재는 기본 스캐폴딩 상태이며, 앞으로 금융 계산 엔진과 대시보드 UI를 추가할 수 있는 최소 기반이 마련되어 있다.

## Complete Directory Structure

```text
C:\ARIS\ARIS
├── .agents/
│   └── skills/                    # BMad skill definitions for Codex
├── _bmad/
│   ├── _config/                   # BMad generated manifests
│   ├── bmm/                       # BMad Method module configuration
│   └── core/                      # BMad Core module configuration
├── _bmad-output/                  # Ignored BMad workflow output
│   ├── implementation-artifacts/
│   └── planning-artifacts/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── health.py
│   │   └── __init__.py
│   ├── .gitignore
│   ├── main.py
│   ├── README.md
│   └── requirements.txt
├── docs/
│   └── *.md                       # Project documentation
├── frontend/
│   ├── app/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── public/
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   ├── .env.local
│   ├── .gitignore
│   ├── AGENTS.md
│   ├── CLAUDE.md
│   ├── eslint.config.mjs
│   ├── next.config.ts
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── pnpm-workspace.yaml
│   ├── postcss.config.mjs
│   ├── README.md
│   └── tsconfig.json
└── .gitignore
```

Generated/build folders such as `frontend/.next`, `frontend/node_modules`, `backend/venv`, and Python `__pycache__` are intentionally excluded from this tree.

## Critical Directories

### `frontend/app`

**Purpose:** Next.js App Router entrypoint.
**Contains:** `layout.tsx`, `page.tsx`, global CSS, favicon.
**Entry Points:** `page.tsx`, `layout.tsx`

현재 `page.tsx`는 create-next-app 기본 화면이다. MVP에서는 이 파일 또는 하위 route/component 구조를 통해 금융 대시보드로 교체해야 한다.

### `frontend/public`

**Purpose:** 정적 에셋 저장소.
**Contains:** Next/Vercel 기본 SVG 파일.

MVP 구현 시 로고나 과제용 시각 자료를 추가할 수 있다. 현재 핵심 기능 의존성은 없다.

### `backend/app/api`

**Purpose:** FastAPI router 모듈 위치.
**Contains:** `health.py`
**Entry Points:** `health.py`

앞으로 `bonds.py`, `credit_risk.py`, `projects.py`, `market_risk.py` 같은 도메인별 router를 추가하기 좋은 위치다.

### `backend`

**Purpose:** FastAPI 앱 루트.
**Contains:** `main.py`, `requirements.txt`, README.
**Entry Points:** `main.py`

현재 `main.py`는 FastAPI 앱을 생성하고 health router를 include한다.

### `docs`

**Purpose:** 프로젝트 지식 저장소.
**Contains:** BMad 기반 문서.

향후 PRD, 아키텍처, 작업 계획을 만들 때 이 폴더를 우선 참조한다.

## Entry Points

### Frontend

- **Page Entry:** `frontend/app/page.tsx`
- **Root Layout:** `frontend/app/layout.tsx`
- **Global Styles:** `frontend/app/globals.css`

### Backend

- **Application Entry:** `backend/main.py`
- **Health Router:** `backend/app/api/health.py`

## File Organization Patterns

- Frontend는 현재 App Router 기본 구조를 따른다.
- Backend는 `app/api` 아래에 router를 분리하는 구조를 이미 시작했다.
- MVP 확장 시 backend는 `app/services` 또는 `app/domain` 아래에 계산 로직을 분리하는 것이 좋다.
- API schema는 FastAPI/Pydantic 모델로 `app/schemas`에 분리하는 것이 적합하다.

## Key File Types

### TypeScript / TSX

- **Pattern:** `*.ts`, `*.tsx`
- **Purpose:** Next.js 화면, layout, 설정
- **Examples:** `frontend/app/page.tsx`, `frontend/app/layout.tsx`

### Python

- **Pattern:** `*.py`
- **Purpose:** FastAPI 앱, API router, 계산 service
- **Examples:** `backend/main.py`, `backend/app/api/health.py`

### Markdown

- **Pattern:** `*.md`
- **Purpose:** 개발 문서, BMad 프로젝트 지식
- **Examples:** `docs/index.md`, `backend/README.md`

### YAML/CSV

- **Pattern:** `*.yaml`, `*.csv`
- **Purpose:** BMad 설정과 manifest
- **Examples:** `_bmad/bmm/config.yaml`, `_bmad/_config/bmad-help.csv`

## Configuration Files

- `frontend/package.json`: frontend scripts and dependencies
- `frontend/tsconfig.json`: TypeScript strict mode and path alias
- `frontend/next.config.ts`: Next.js configuration placeholder
- `frontend/eslint.config.mjs`: ESLint configuration
- `backend/requirements.txt`: backend Python dependencies
- `_bmad/bmm/config.yaml`: BMad Method project settings
- `.gitignore`: `_bmad-output/` ignore rule

## Notes for Development

- `frontend/page.tsx`는 MVP 대시보드로 교체 대상이다.
- backend 계산 기능은 현재 전혀 구현되어 있지 않으므로 도메인별 service/API를 먼저 추가해야 한다.
- 과제 제출용이라면 산출물 문서와 코드가 함께 설명 가능해야 한다.
- 금융 계산은 입력값, 공식, 결과 해석을 UI와 문서에 명확히 드러내야 한다.

---

_Generated using BMAD Method `document-project` workflow_
