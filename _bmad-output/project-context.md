---
project_name: "ARIS"
user_name: "Genie"
date: "2026-04-23"
sections_completed:
  - technology_stack
  - language_rules
  - framework_rules
  - testing_rules
  - quality_rules
  - workflow_rules
  - anti_patterns
status: "complete"
rule_count: 32
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Project:** ARIS(Asset Risk Integrated System), 과제 제출용 금융자산/프로젝트 통합 가치평가 MVP.
- **Frontend:** Next.js `16.2.4`, React `19.2.4`, TypeScript strict mode, Tailwind CSS `^4`, Recharts `^3.8.1`, Zustand `^5.0.12`.
- **Backend:** Python FastAPI `0.136.0`, Uvicorn `0.45.0`.
- **Planned backend math dependencies:** `numpy`, `scipy`, `numpy-financial`.
- **Architecture:** Next.js dashboard frontend + stateless FastAPI calculation backend.
- **Project knowledge:** Human/agent docs live in `docs/`.
- **BMad output:** Generated workflow artifacts live in `_bmad-output/` and are ignored by git.

## Critical Implementation Rules

### Product & Domain Rules

- Treat ARIS as a **financial analytics MVP**, not a generic CRUD app.
- Core MVP domains are fixed: bond valuation, credit risk score, project feasibility, and market risk VaR.
- Prefer financially explainable formulas over opaque models. The assignment defense depends on interpretability.
- UI copy and documentation should be Korean by default, while code identifiers, filenames, API fields, and commit messages should stay English.
- For every financial metric, expose the meaning, input assumptions, and result interpretation somewhere in the UI or docs.

### Frontend Rules

- The first screen should be the usable dashboard, not a marketing landing page.
- Replace `frontend/app/page.tsx` create-next-app starter UI with ARIS dashboard UI.
- Use tabs or segmented navigation for `[자산 평가] / [신용 리스크] / [프로젝트 사업성]`; add market risk either as a fourth tab or summary panel.
- Keep financial tool UI dense, readable, and operational. Avoid oversized hero sections and decorative marketing layouts.
- Use Recharts for scenario and cash-flow visualizations; ensure labels do not overlap on common desktop widths.
- Do not duplicate authoritative financial calculations in frontend if backend API exists. Frontend may do formatting and lightweight derived display only.
- Use `NEXT_PUBLIC_API_BASE_URL` for backend calls, defaulting locally to `http://127.0.0.1:8000`.
- Type API payloads/responses explicitly in TypeScript before wiring UI components.

### Backend Rules

- Keep routers thin. Put FastAPI route definitions in `backend/app/api/*` and pure calculation logic in `backend/app/services/*`.
- Define request/response schemas with Pydantic models in `backend/app/schemas/*` before exposing calculation APIs.
- Calculation endpoints should use POST because they accept structured input payloads.
- Suggested endpoint shape:
  - `POST /api/bonds/valuation`
  - `POST /api/bonds/scenarios`
  - `POST /api/credit-risk/score`
  - `POST /api/projects/feasibility`
  - `POST /api/market-risk/var`
- Add CORS middleware before frontend/backend integration if frontend runs on `localhost:3000` and backend on `127.0.0.1:8000`.
- API responses should include numeric results and, where useful, interpretation labels/messages for presentation.

### Financial Calculation Rules

- Bond pricing, duration, and convexity must use consistent units for yield, coupon rate, maturity, and payment frequency.
- Modified duration must be derived from Macaulay duration using the periodic yield convention.
- Convexity and scenario price curves should be calculated from cash flows, not hand-waved approximations.
- NPV/IRR calculations must handle invalid cash-flow cases; IRR can fail or be undefined.
- Payback Period must define how partial-year payback is interpolated.
- Parametric VaR must state its normal-distribution assumption and confidence level.
- Credit scoring can use a simplified weighted model for MVP, but the model must be explainable and label outputs as Normal, Watch, or Default.

### Testing Rules

- Backend financial service functions need the highest test priority.
- Minimum test expectations:
  - bond price falls when market yield rises;
  - modified duration is less than Macaulay duration for positive yield;
  - NPV falls when discount rate rises;
  - VaR rises when portfolio value or volatility rises;
  - invalid IRR/cash-flow inputs return a controlled error.
- Test pure calculation functions separately from FastAPI route tests.
- Frontend tests are optional for MVP unless UI logic becomes complex; prioritize backend correctness first.

### Code Quality & Style Rules

- Frontend TypeScript is strict; do not introduce `any` unless there is a narrow, documented reason.
- Keep component names PascalCase and files kebab-case where new feature files are added.
- Use English for code identifiers: `bondValuation`, `creditRisk`, `projectFeasibility`, `marketRisk`.
- Keep comments sparse, but document non-obvious formulas and financial assumptions.
- Do not place generated files, virtualenvs, `.next`, `node_modules`, or `_bmad-output` into git.
- Avoid broad refactors while building MVP features; preserve working scaffold and add narrow domain modules.

### Development Workflow Rules

- Current stable branch is `master`; prefer `develop` and feature branches for implementation work.
- Suggested feature branch names: `feat/bond-engine`, `feat/project-feasibility`, `feat/credit-risk`, `feat/market-risk`, `feat/dashboard-ui`.
- Commit BMad setup/docs/project source files, but keep `_bmad-output/` ignored unless explicitly requested.
- Before implementation branches, ensure docs reflect the intended MVP scope.
- For every completed feature, verify backend API behavior and frontend display together.

### Critical Don't-Miss Rules

- Do not build only a frontend calculator. The assignment value depends on backend financial engines.
- Do not overbuild authentication, databases, admin flows, or deployment infrastructure before MVP financial features.
- Do not rely on live market APIs as a hard blocker; use user input and deterministic sample data where needed.
- Do not hide assumptions. For finance work, unstated assumptions are more damaging than simplified assumptions.
- Do not make stock price prediction the core feature. The chosen defense is explainable valuation/risk math: Duration, Convexity, NPV, IRR, VaR.
- Do not let charts consume time before core formulas are correct and testable.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing code in ARIS.
- Follow all project-specific rules above.
- When in doubt, favor explainable financial logic and backend-calculated results.
- Update this file if durable implementation patterns change.

**For Humans:**

- Keep this file lean and focused on agent needs.
- Update it when the technology stack, branch strategy, or MVP scope changes.
- Remove outdated rules once they become misleading.

Last Updated: 2026-04-23
