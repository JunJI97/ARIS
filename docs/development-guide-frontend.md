# ARIS Frontend Development Guide

**Date:** 2026-04-23
**Part:** Frontend

## Prerequisites

- Node.js 20+
- pnpm

## Local Run

```powershell
cd C:\ARIS\ARIS\frontend
pnpm dev
```

기본 접속 주소:

```text
http://localhost:3000
```

## Useful Commands

```powershell
pnpm dev
pnpm build
pnpm lint
```

## Current Files

- `app/page.tsx`: 현재 create-next-app 기본 화면
- `app/layout.tsx`: root layout과 font 설정
- `app/globals.css`: Tailwind CSS import와 전역 색상
- `package.json`: Next.js, React, Recharts, Zustand 의존성

## MVP Work Plan

1. `app/page.tsx`를 ARIS dashboard shell로 교체한다.
2. `[자산 평가] / [신용 리스크] / [프로젝트 사업성]` 탭을 만든다.
3. 채권 입력 폼과 결과 카드부터 구현한다.
4. Recharts로 금리 변화별 채권 가격 차트를 추가한다.
5. 프로젝트 현금흐름 입력과 NPV/IRR 결과를 추가한다.
6. 신용 리스크와 VaR 탭을 추가한다.

## UI Rules for This Project

- 랜딩 페이지보다 실제 대시보드를 첫 화면으로 제공한다.
- 계산 입력과 결과를 같은 화면에서 확인할 수 있게 한다.
- 금융 지표는 카드나 표로 명확하게 표시한다.
- 시나리오 차트는 결과 해석을 돕는 목적으로 배치한다.
- 모바일보다 데스크톱 과제 시연 화면의 가독성을 우선한다.

## API Connection

권장 `.env.local`:

```text
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

현재 `.env.local`은 git 추적 대상 여부와 secret 포함 여부를 항상 확인한다.
