"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type DashboardTab = "bond" | "credit" | "project" | "market";
type AssetType = "bond" | "stock";

type Interpretation = {
  label: string;
  summary: string;
  assumptions: string[];
};

type BondInstrument = {
  instrument_id: string;
  name: string;
  issuer: string;
  currency: string;
  face_value: number;
  coupon_rate: number;
  maturity_years: number;
  payment_frequency: number;
  market_yield: number;
  credit_rating: string | null;
};

type BondForm = {
  face_value: number;
  coupon_rate: number;
  market_yield: number;
  maturity_years: number;
  payment_frequency: number;
  investment_amount: number;
  min_rate_shock: number;
  max_rate_shock: number;
  steps: number;
};

type BondValuationResponse = {
  results: {
    present_value: number;
    macaulay_duration: number;
    modified_duration: number;
    convexity: number;
    estimated_units: number | null;
  };
  interpretation: Interpretation;
};

type BondScenarioPoint = {
  rate_shock: number;
  market_yield: number;
  price: number;
};

type BondScenarioResponse = {
  results: {
    base_price: number;
  };
  interpretation: Interpretation;
  series: BondScenarioPoint[];
};

type CreditRiskForm = {
  debt_ratio: number;
  current_ratio: number;
  interest_coverage_ratio: number;
  operating_margin: number;
};

type CreditRiskFactorContribution = {
  factor: string;
  input_value: number;
  factor_score: number;
  contribution: number;
  assessment: string;
};

type CreditRiskResponse = {
  results: {
    score: number;
    grade: "Normal" | "Watch" | "Default";
    strongest_factor: string;
    weakest_factor: string;
  };
  interpretation: Interpretation;
  series: CreditRiskFactorContribution[];
};

type ProjectForm = {
  initial_investment: number;
  discount_rate: number;
  cash_flows_text: string;
};

type CashFlowPoint = {
  year: number;
  cash_flow: number;
  cumulative_cash_flow: number;
};

type ProjectFeasibilityResponse = {
  results: {
    npv: number;
    irr: number | null;
    payback_period: number | null;
    cumulative_cash_flow_final: number;
  };
  interpretation: Interpretation;
  series: CashFlowPoint[];
};

type MarketRiskForm = {
  asset_type: AssetType;
  portfolio_value: number;
  annualized_volatility: number;
  holding_period_days: number;
  confidence_level: 0.9 | 0.95 | 0.99;
};

type MarketRiskPoint = {
  confidence_level: number;
  z_score: number;
  var_amount: number;
};

type MarketRiskResponse = {
  results: {
    var_amount: number;
    loss_percent: number;
    holding_period_volatility: number;
    z_score: number;
  };
  interpretation: Interpretation;
  series: MarketRiskPoint[];
};

const fallbackBondForm: BondForm = {
  face_value: 10000,
  coupon_rate: 0.04,
  market_yield: 0.045,
  maturity_years: 5,
  payment_frequency: 2,
  investment_amount: 1000000,
  min_rate_shock: -0.02,
  max_rate_shock: 0.02,
  steps: 9,
};

const fallbackCreditForm: CreditRiskForm = {
  debt_ratio: 0.55,
  current_ratio: 1.35,
  interest_coverage_ratio: 3.2,
  operating_margin: 0.08,
};

const fallbackProjectForm: ProjectForm = {
  initial_investment: 200000000,
  discount_rate: 0.1,
  cash_flows_text: "70000000, 80000000, 90000000, 85000000",
};

const fallbackMarketForm: MarketRiskForm = {
  asset_type: "bond",
  portfolio_value: 100000000,
  annualized_volatility: 0.12,
  holding_period_days: 10,
  confidence_level: 0.95,
};

function formatMoney(value: number, digits = 0) {
  return new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function formatPercent(value: number, digits = 2) {
  return `${(value * 100).toFixed(digits)}%`;
}

function formatNumber(value: number, digits = 3) {
  return new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function toBondPayload(form: BondForm) {
  return {
    face_value: Number(form.face_value),
    coupon_rate: Number(form.coupon_rate),
    market_yield: Number(form.market_yield),
    maturity_years: Number(form.maturity_years),
    payment_frequency: Number(form.payment_frequency),
    investment_amount: Number(form.investment_amount),
  };
}

function parseCashFlows(text: string): number[] {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item));
}

function validateBondForm(form: BondForm): string | null {
  if (form.face_value <= 0) return "액면가는 0보다 커야 합니다.";
  if (form.investment_amount <= 0) return "투자금액은 0보다 커야 합니다.";
  if (form.payment_frequency <= 0) return "연간 지급 횟수는 1 이상이어야 합니다.";
  if (form.maturity_years <= 0) return "만기는 0보다 커야 합니다.";
  if (form.coupon_rate < 0) return "표면금리는 음수일 수 없습니다.";
  if (form.market_yield < 0) return "시장수익률은 음수일 수 없습니다.";
  if (form.min_rate_shock >= form.max_rate_shock) {
    return "최소 금리 충격은 최대 금리 충격보다 작아야 합니다.";
  }
  if (form.steps < 3) return "시나리오 개수는 3 이상이어야 합니다.";
  if (form.steps > 25) return "시나리오 개수는 25 이하여야 합니다.";
  return null;
}

function validateCreditRiskForm(form: CreditRiskForm): string | null {
  if (form.debt_ratio < 0 || form.debt_ratio > 2) {
    return "부채비율은 0 이상 2 이하로 입력해야 합니다.";
  }
  if (form.current_ratio < 0 || form.current_ratio > 10) {
    return "유동비율은 0 이상 10 이하로 입력해야 합니다.";
  }
  if (
    form.interest_coverage_ratio < 0 ||
    form.interest_coverage_ratio > 50
  ) {
    return "이자보상배율은 0 이상 50 이하로 입력해야 합니다.";
  }
  if (form.operating_margin < -1 || form.operating_margin > 1) {
    return "영업이익률은 -1 이상 1 이하의 decimal 값이어야 합니다.";
  }
  return null;
}

function validateProjectForm(form: ProjectForm): string | null {
  if (form.initial_investment <= 0) return "초기 투자금은 0보다 커야 합니다.";
  if (form.discount_rate < 0) return "할인율은 음수일 수 없습니다.";

  const cashFlows = parseCashFlows(form.cash_flows_text);
  if (cashFlows.length === 0) return "연도별 현금흐름을 하나 이상 입력해야 합니다.";
  if (cashFlows.some((cashFlow) => Number.isNaN(cashFlow))) {
    return "현금흐름은 쉼표로 구분한 숫자여야 합니다.";
  }

  return null;
}

function validateMarketRiskForm(form: MarketRiskForm): string | null {
  if (form.portfolio_value <= 0) return "포트폴리오 가치는 0보다 커야 합니다.";
  if (form.annualized_volatility < 0 || form.annualized_volatility > 5) {
    return "연율 변동성은 0 이상 5 이하의 decimal 값이어야 합니다.";
  }
  if (form.holding_period_days < 1 || form.holding_period_days > 252) {
    return "보유 기간은 1일 이상 252일 이하여야 합니다.";
  }
  if (![0.9, 0.95, 0.99].includes(form.confidence_level)) {
    return "신뢰수준은 90%, 95%, 99% 중 하나여야 합니다.";
  }
  return null;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.detail ?? `API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function gradeLabel(grade: "Normal" | "Watch" | "Default") {
  if (grade === "Normal") return "정상";
  if (grade === "Watch") return "관찰";
  return "부실 위험";
}

function gradeTone(grade: "Normal" | "Watch" | "Default") {
  if (grade === "Normal") {
    return {
      badge: "bg-[#e6f4ea] text-[#1b6b3a]",
      panel: "border-[#cfe8d6] bg-[#f4fbf6]",
    };
  }
  if (grade === "Watch") {
    return {
      badge: "bg-[#fff4d6] text-[#8a5a00]",
      panel: "border-[#f0d58a] bg-[#fffaf0]",
    };
  }
  return {
    badge: "bg-[#fde8e6] text-[#a1261a]",
    panel: "border-[#f0b4a7] bg-[#fff5f3]",
  };
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("bond");
  const [instruments, setInstruments] = useState<BondInstrument[]>([]);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState("");
  const [bondForm, setBondForm] = useState<BondForm>(fallbackBondForm);
  const [creditForm, setCreditForm] =
    useState<CreditRiskForm>(fallbackCreditForm);
  const [projectForm, setProjectForm] =
    useState<ProjectForm>(fallbackProjectForm);
  const [marketForm, setMarketForm] =
    useState<MarketRiskForm>(fallbackMarketForm);
  const [valuation, setValuation] = useState<BondValuationResponse | null>(null);
  const [scenario, setScenario] = useState<BondScenarioResponse | null>(null);
  const [creditResult, setCreditResult] = useState<CreditRiskResponse | null>(
    null,
  );
  const [projectResult, setProjectResult] =
    useState<ProjectFeasibilityResponse | null>(null);
  const [marketResult, setMarketResult] = useState<MarketRiskResponse | null>(
    null,
  );
  const [bondLoading, setBondLoading] = useState(false);
  const [creditLoading, setCreditLoading] = useState(false);
  const [projectLoading, setProjectLoading] = useState(false);
  const [marketLoading, setMarketLoading] = useState(false);
  const [bondError, setBondError] = useState<string | null>(null);
  const [creditError, setCreditError] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [bondWarning, setBondWarning] = useState<string | null>(null);

  const selectedInstrument = useMemo(
    () =>
      instruments.find(
        (instrument) => instrument.instrument_id === selectedInstrumentId,
      ),
    [instruments, selectedInstrumentId],
  );

  const priceGap = useMemo(() => {
    if (!valuation) return null;
    return valuation.results.present_value - bondForm.face_value;
  }, [bondForm.face_value, valuation]);

  const creditTone = creditResult
    ? gradeTone(creditResult.results.grade)
    : gradeTone("Watch");

  const projectDecisionSummary = useMemo(() => {
    if (!projectResult) return "분석을 실행하면 투자 타당성 판단 포인트를 요약해 드립니다.";

    const positives: string[] = [];
    const cautions: string[] = [];

    if (projectResult.results.npv > 0) {
      positives.push("NPV가 양수라 할인율 기준으로 경제적 여유가 있습니다.");
    } else if (projectResult.results.npv < 0) {
      cautions.push("NPV가 음수라 현재 가정만으로는 투자 매력이 약합니다.");
    } else {
      cautions.push("NPV가 0에 가까워 추가 가정 검토가 필요합니다.");
    }

    if (
      projectResult.results.irr !== null &&
      projectResult.results.irr > projectForm.discount_rate
    ) {
      positives.push("IRR이 할인율을 상회합니다.");
    } else if (projectResult.results.irr !== null) {
      cautions.push("IRR이 할인율을 넘지 못합니다.");
    } else {
      cautions.push("현금흐름 패턴상 IRR이 정의되지 않습니다.");
    }

    if (projectResult.results.payback_period !== null) {
      positives.push(
        `투자금 회수 예상 시점은 약 ${formatNumber(projectResult.results.payback_period, 2)}년입니다.`,
      );
    } else {
      cautions.push("입력한 기간 안에는 투자금 회수가 어렵습니다.");
    }

    return [...positives, ...cautions].join(" ");
  }, [projectForm.discount_rate, projectResult]);

  useEffect(() => {
    let mounted = true;

    fetchJson<{ instruments: BondInstrument[] }>("/api/bonds/instruments")
      .then((payload) => {
        if (!mounted) return;

        setInstruments(payload.instruments);
        const firstInstrument = payload.instruments[0];

        if (firstInstrument) {
          setSelectedInstrumentId(firstInstrument.instrument_id);
          setBondForm((current) => ({
            ...current,
            face_value: firstInstrument.face_value,
            coupon_rate: firstInstrument.coupon_rate,
            market_yield: firstInstrument.market_yield,
            maturity_years: firstInstrument.maturity_years,
            payment_frequency: firstInstrument.payment_frequency,
          }));
        }
      })
      .catch((caught: Error) => {
        if (mounted) {
          setBondError(`채권 목록을 불러오지 못했습니다. ${caught.message}`);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSelectInstrument(instrumentId: string) {
    setSelectedInstrumentId(instrumentId);
    setBondError(null);
    setBondWarning(null);

    try {
      const payload = await fetchJson<{ instrument: BondInstrument }>(
        `/api/bonds/market-data?instrument_id=${encodeURIComponent(instrumentId)}`,
      );

      setBondForm((current) => ({
        ...current,
        face_value: payload.instrument.face_value,
        coupon_rate: payload.instrument.coupon_rate,
        market_yield: payload.instrument.market_yield,
        maturity_years: payload.instrument.maturity_years,
        payment_frequency: payload.instrument.payment_frequency,
      }));

      setValuation(null);
      setScenario(null);
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "알 수 없는 오류입니다.";
      setBondError(`채권 데이터를 불러오지 못했습니다. ${message}`);
    }
  }

  async function handleBondCalculate() {
    const validationMessage = validateBondForm(bondForm);
    if (validationMessage) {
      setBondError(validationMessage);
      return;
    }

    setBondLoading(true);
    setBondError(null);
    setBondWarning(null);

    try {
      const valuationPayload = toBondPayload(bondForm);
      const scenarioPayload = {
        ...valuationPayload,
        min_rate_shock: Number(bondForm.min_rate_shock),
        max_rate_shock: Number(bondForm.max_rate_shock),
        steps: Number(bondForm.steps),
      };

      const [valuationResult, scenarioResult] = await Promise.all([
        fetchJson<BondValuationResponse>("/api/bonds/valuation", {
          method: "POST",
          body: JSON.stringify(valuationPayload),
        }),
        fetchJson<BondScenarioResponse>("/api/bonds/scenarios", {
          method: "POST",
          body: JSON.stringify(scenarioPayload),
        }),
      ]);

      setValuation(valuationResult);
      setScenario(scenarioResult);

      if (valuationResult.results.modified_duration > 7) {
        setBondWarning(
          "Modified Duration이 높아 금리 변화에 따른 가격 민감도가 큰 채권입니다.",
        );
      }
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "알 수 없는 오류입니다.";
      setBondError(`계산에 실패했습니다. ${message}`);
    } finally {
      setBondLoading(false);
    }
  }

  async function handleCreditCalculate() {
    const validationMessage = validateCreditRiskForm(creditForm);
    if (validationMessage) {
      setCreditError(validationMessage);
      return;
    }

    setCreditLoading(true);
    setCreditError(null);

    try {
      const result = await fetchJson<CreditRiskResponse>("/api/credit-risk/score", {
        method: "POST",
        body: JSON.stringify(creditForm),
      });

      setCreditResult(result);
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "알 수 없는 오류입니다.";
      setCreditError(`신용위험 분석에 실패했습니다. ${message}`);
    } finally {
      setCreditLoading(false);
    }
  }

  async function handleProjectCalculate() {
    const validationMessage = validateProjectForm(projectForm);
    if (validationMessage) {
      setProjectError(validationMessage);
      return;
    }

    setProjectLoading(true);
    setProjectError(null);

    try {
      const payload = {
        initial_investment: Number(projectForm.initial_investment),
        discount_rate: Number(projectForm.discount_rate),
        cash_flows: parseCashFlows(projectForm.cash_flows_text),
      };

      const result = await fetchJson<ProjectFeasibilityResponse>(
        "/api/projects/feasibility",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      setProjectResult(result);
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "알 수 없는 오류입니다.";
      setProjectError(`프로젝트 분석에 실패했습니다. ${message}`);
    } finally {
      setProjectLoading(false);
    }
  }

  async function handleMarketCalculate() {
    const validationMessage = validateMarketRiskForm(marketForm);
    if (validationMessage) {
      setMarketError(validationMessage);
      return;
    }

    setMarketLoading(true);
    setMarketError(null);

    try {
      const result = await fetchJson<MarketRiskResponse>("/api/market-risk/var", {
        method: "POST",
        body: JSON.stringify(marketForm),
      });

      setMarketResult(result);
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "알 수 없는 오류입니다.";
      setMarketError(`시장위험 분석에 실패했습니다. ${message}`);
    } finally {
      setMarketLoading(false);
    }
  }

  function updateBondForm(key: keyof BondForm, value: string) {
    setBondForm((current) => ({
      ...current,
      [key]: Number(value),
    }));
  }

  function updateCreditForm(key: keyof CreditRiskForm, value: string) {
    setCreditForm((current) => ({
      ...current,
      [key]: Number(value),
    }));
  }

  function updateProjectForm(key: keyof ProjectForm, value: string) {
    setProjectForm((current) => ({
      ...current,
      [key]: key === "cash_flows_text" ? value : Number(value),
    }));
  }

  function updateMarketForm(
    key: keyof MarketRiskForm,
    value: string | AssetType | 0.9 | 0.95 | 0.99,
  ) {
    setMarketForm((current) => ({
      ...current,
      [key]:
        key === "asset_type" || key === "confidence_level"
          ? value
          : Number(value),
    }));
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#18202a]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-[#d9dee7] pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#49627a]">
              Asset Risk Integrated System
            </p>
            <h1 className="mt-1 text-3xl font-bold text-[#111827]">
              ARIS 금융 분석 대시보드
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5b6675]">
              채권 가치평가, 신용위험, 프로젝트 사업성, 시장위험 VaR을 한 화면에서
              확인하고 백엔드 계산 결과를 바로 검증할 수 있습니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-medium">
            <TabButton
              active={activeTab === "bond"}
              label="채권"
              onClick={() => setActiveTab("bond")}
            />
            <TabButton
              active={activeTab === "credit"}
              label="신용위험"
              onClick={() => setActiveTab("credit")}
            />
            <TabButton
              active={activeTab === "project"}
              label="프로젝트"
              onClick={() => setActiveTab("project")}
            />
            <TabButton
              active={activeTab === "market"}
              label="시장위험"
              onClick={() => setActiveTab("market")}
            />
          </div>
        </header>

        {activeTab === "bond" ? (
          <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <aside className="rounded border border-[#d9dee7] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">채권 입력</h2>
                {selectedInstrument?.credit_rating ? (
                  <span className="rounded bg-[#e6f4ea] px-2 py-1 text-xs font-semibold text-[#1b6b3a]">
                    {selectedInstrument.credit_rating}
                  </span>
                ) : null}
              </div>

              <label className="mt-5 block text-sm font-medium text-[#384252]">
                샘플 채권
                <select
                  className="mt-2 w-full rounded border border-[#cfd6e0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f6feb]"
                  value={selectedInstrumentId}
                  onChange={(event) => handleSelectInstrument(event.target.value)}
                >
                  {instruments.length === 0 ? (
                    <option value="">백엔드 연결 대기 중</option>
                  ) : null}
                  {instruments.map((instrument) => (
                    <option
                      key={instrument.instrument_id}
                      value={instrument.instrument_id}
                    >
                      {instrument.name}
                    </option>
                  ))}
                </select>
              </label>

              {selectedInstrument ? (
                <div className="mt-3 rounded border border-[#e5e7eb] bg-[#f9fafb] p-3 text-xs leading-5 text-[#5b6675]">
                  <div>발행사: {selectedInstrument.issuer}</div>
                  <div>통화: {selectedInstrument.currency}</div>
                  <div>표면금리: {formatPercent(selectedInstrument.coupon_rate)}</div>
                  <div>시장수익률: {formatPercent(selectedInstrument.market_yield)}</div>
                </div>
              ) : null}

              <div className="mt-5 grid gap-4">
                <NumberField
                  label="투자금액"
                  suffix="원"
                  value={bondForm.investment_amount}
                  onChange={(value) => updateBondForm("investment_amount", value)}
                />
                <NumberField
                  label="액면가"
                  suffix="원"
                  value={bondForm.face_value}
                  onChange={(value) => updateBondForm("face_value", value)}
                />
                <NumberField
                  label="표면금리"
                  step="0.001"
                  suffix="decimal"
                  value={bondForm.coupon_rate}
                  onChange={(value) => updateBondForm("coupon_rate", value)}
                />
                <NumberField
                  label="시장수익률"
                  step="0.001"
                  suffix="decimal"
                  value={bondForm.market_yield}
                  onChange={(value) => updateBondForm("market_yield", value)}
                />
              </div>

              <details className="mt-5 rounded border border-[#d9dee7] bg-[#fafbfc] p-4">
                <summary className="cursor-pointer text-sm font-semibold">
                  고급 설정
                </summary>
                <div className="mt-4 grid gap-4">
                  <NumberField
                    label="만기"
                    step="0.5"
                    suffix="년"
                    value={bondForm.maturity_years}
                    onChange={(value) => updateBondForm("maturity_years", value)}
                  />
                  <NumberField
                    label="연간 지급 횟수"
                    step="1"
                    suffix="회"
                    value={bondForm.payment_frequency}
                    onChange={(value) =>
                      updateBondForm("payment_frequency", value)
                    }
                  />
                  <NumberField
                    label="최소 금리 충격"
                    step="0.005"
                    suffix="decimal"
                    value={bondForm.min_rate_shock}
                    onChange={(value) => updateBondForm("min_rate_shock", value)}
                  />
                  <NumberField
                    label="최대 금리 충격"
                    step="0.005"
                    suffix="decimal"
                    value={bondForm.max_rate_shock}
                    onChange={(value) => updateBondForm("max_rate_shock", value)}
                  />
                  <NumberField
                    label="시나리오 개수"
                    step="1"
                    suffix="개"
                    value={bondForm.steps}
                    onChange={(value) => updateBondForm("steps", value)}
                  />
                </div>
              </details>

              <button
                className="mt-5 w-full rounded bg-[#1f6feb] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#195bc2] disabled:cursor-not-allowed disabled:bg-[#9ab7e6]"
                disabled={bondLoading}
                onClick={handleBondCalculate}
              >
                {bondLoading ? "계산 중..." : "채권 가치평가 실행"}
              </button>

              {bondError ? <AlertBox tone="error">{bondError}</AlertBox> : null}
              {bondWarning ? (
                <AlertBox tone="warning">{bondWarning}</AlertBox>
              ) : null}
            </aside>

            <section className="flex flex-col gap-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <MetricCard
                  label="현재가치"
                  value={
                    valuation ? `${formatMoney(valuation.results.present_value)} 원` : "-"
                  }
                  hint="미래 현금흐름을 할인한 채권 가격"
                />
                <MetricCard
                  label="액면가 대비"
                  value={
                    priceGap !== null
                      ? `${priceGap >= 0 ? "+" : ""}${formatMoney(priceGap)} 원`
                      : "-"
                  }
                  hint={
                    priceGap === null
                      ? "프리미엄 또는 디스카운트 여부"
                      : priceGap >= 0
                        ? "액면가 대비 프리미엄"
                        : "액면가 대비 디스카운트"
                  }
                />
                <MetricCard
                  label="Macaulay Duration"
                  value={
                    valuation
                      ? `${formatNumber(valuation.results.macaulay_duration)} 년`
                      : "-"
                  }
                  hint="현금흐름 회수 시점의 가중평균"
                />
                <MetricCard
                  label="Modified Duration"
                  value={
                    valuation
                      ? `${formatNumber(valuation.results.modified_duration)}`
                      : "-"
                  }
                  hint="금리 변화에 대한 1차 가격 민감도"
                />
                <MetricCard
                  label="Convexity"
                  value={
                    valuation ? formatNumber(valuation.results.convexity) : "-"
                  }
                  hint="금리 변화에 대한 2차 민감도"
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded border border-[#d9dee7] bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">금리 시나리오</h2>
                      <p className="mt-1 text-sm text-[#6b7280]">
                        금리 충격에 따라 채권 가격이 얼마나 흔들리는지 비교합니다.
                      </p>
                    </div>
                    <p className="text-sm font-medium text-[#49627a]">
                      기준 가격{" "}
                      {scenario
                        ? `${formatMoney(scenario.results.base_price)} 원`
                        : "-"}
                    </p>
                  </div>

                  <div className="mt-5 h-80">
                    {scenario ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={scenario.series.map((point) => ({
                            ...point,
                            shockLabel: `${(point.rate_shock * 100).toFixed(1)}%p`,
                          }))}
                          margin={{ top: 12, right: 16, bottom: 8, left: 8 }}
                        >
                          <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
                          <ReferenceLine
                            y={scenario.results.base_price}
                            stroke="#94a3b8"
                          />
                          <XAxis
                            dataKey="shockLabel"
                            tick={{ fill: "#5b6675", fontSize: 12 }}
                          />
                          <YAxis
                            tick={{ fill: "#5b6675", fontSize: 12 }}
                            tickFormatter={(value) => formatMoney(Number(value))}
                            width={82}
                          />
                          <Tooltip
                            formatter={(value, key) => {
                              if (key === "price") {
                                return [`${formatMoney(Number(value))} 원`, "가격"];
                              }
                              return [value, key];
                            }}
                            labelFormatter={(label) => `금리 충격 ${label}`}
                          />
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke="#1f6feb"
                            strokeWidth={3}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyChart message="계산을 실행하면 금리 시나리오 차트가 표시됩니다." />
                    )}
                  </div>
                </div>

                <section className="rounded border border-[#d9dee7] bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-semibold">포지션 요약</h2>
                  <div className="mt-4 space-y-3 text-sm text-[#4b5563]">
                    <SummaryRow
                      label="표면금리"
                      value={formatPercent(bondForm.coupon_rate)}
                    />
                    <SummaryRow
                      label="시장수익률"
                      value={formatPercent(bondForm.market_yield)}
                    />
                    <SummaryRow
                      label="만기"
                      value={`${formatNumber(bondForm.maturity_years, 1)} 년`}
                    />
                    <SummaryRow
                      label="연간 지급 횟수"
                      value={`${bondForm.payment_frequency} 회`}
                    />
                    <SummaryRow
                      label="투자금액"
                      value={`${formatMoney(bondForm.investment_amount)} 원`}
                    />
                    <SummaryRow
                      label="예상 매수 수량"
                      value={
                        valuation?.results.estimated_units
                          ? `${formatNumber(valuation.results.estimated_units)} 단위`
                          : "-"
                      }
                    />
                  </div>
                </section>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <InterpretationPanel
                  title="결과 해석"
                  summary={
                    valuation?.interpretation.summary ??
                    "계산을 실행하면 채권 가치와 금리 민감도에 대한 해석이 표시됩니다."
                  }
                  assumptions={valuation?.interpretation.assumptions ?? []}
                />
                <InterpretationPanel
                  title="입력 가정"
                  summary="수익률과 표면금리는 decimal 값으로 입력합니다. 모든 수치는 백엔드 계산 결과를 기준으로 표시됩니다."
                  assumptions={[
                    `표면금리 ${formatPercent(bondForm.coupon_rate)}`,
                    `시장수익률 ${formatPercent(bondForm.market_yield)}`,
                    `금리 충격 ${formatPercent(bondForm.min_rate_shock)} ~ ${formatPercent(
                      bondForm.max_rate_shock,
                    )}`,
                    "금리가 오르면 일반적으로 채권 가격은 하락합니다.",
                  ]}
                />
              </div>
            </section>
          </section>
        ) : activeTab === "credit" ? (
          <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <aside className="rounded border border-[#d9dee7] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">신용위험 입력</h2>
                {creditResult ? (
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${creditTone.badge}`}
                  >
                    {gradeLabel(creditResult.results.grade)}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-[#5b6675]">
                핵심 재무비율을 입력하면 가중치 기반 점수와 Normal / Watch /
                Default 등급을 계산합니다.
              </p>

              <div className="mt-5 grid gap-4">
                <NumberField
                  label="부채비율"
                  suffix="decimal"
                  step="0.01"
                  value={creditForm.debt_ratio}
                  onChange={(value) => updateCreditForm("debt_ratio", value)}
                />
                <NumberField
                  label="유동비율"
                  suffix="배"
                  step="0.01"
                  value={creditForm.current_ratio}
                  onChange={(value) => updateCreditForm("current_ratio", value)}
                />
                <NumberField
                  label="이자보상배율"
                  suffix="배"
                  step="0.1"
                  value={creditForm.interest_coverage_ratio}
                  onChange={(value) =>
                    updateCreditForm("interest_coverage_ratio", value)
                  }
                />
                <NumberField
                  label="영업이익률"
                  suffix="decimal"
                  step="0.01"
                  value={creditForm.operating_margin}
                  onChange={(value) =>
                    updateCreditForm("operating_margin", value)
                  }
                />
              </div>

              <div className="mt-4 rounded border border-[#e5e7eb] bg-[#f9fafb] p-3 text-xs leading-5 text-[#5b6675]">
                <div>부채비율은 낮을수록 유리합니다.</div>
                <div>유동비율, 이자보상배율, 영업이익률은 높을수록 유리합니다.</div>
                <div>이 모델은 설명 가능한 MVP용 단순 가중치 모델입니다.</div>
              </div>

              <button
                className="mt-5 w-full rounded bg-[#1f6feb] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#195bc2] disabled:cursor-not-allowed disabled:bg-[#9ab7e6]"
                disabled={creditLoading}
                onClick={handleCreditCalculate}
              >
                {creditLoading ? "계산 중..." : "신용위험 점수 계산"}
              </button>

              {creditError ? (
                <AlertBox tone="error">{creditError}</AlertBox>
              ) : null}
            </aside>

            <section className="flex flex-col gap-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="신용위험 점수"
                  value={
                    creditResult
                      ? `${formatNumber(creditResult.results.score, 2)} 점`
                      : "-"
                  }
                  hint="0점에서 100점 사이의 단순 가중치 점수"
                />
                <MetricCard
                  label="등급"
                  value={creditResult ? gradeLabel(creditResult.results.grade) : "-"}
                  hint="Normal / Watch / Default를 한국어로 표시"
                />
                <MetricCard
                  label="강점 요인"
                  value={creditResult?.results.strongest_factor ?? "-"}
                  hint="점수에 가장 크게 기여한 항목"
                />
                <MetricCard
                  label="취약 요인"
                  value={creditResult?.results.weakest_factor ?? "-"}
                  hint="점수를 가장 많이 깎아먹은 항목"
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded border border-[#d9dee7] bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">요인별 기여도</h2>
                      <p className="mt-1 text-sm text-[#6b7280]">
                        각 재무비율이 신용위험 점수에 얼마나 기여했는지 확인합니다.
                      </p>
                    </div>
                    {creditResult ? (
                      <div
                        className={`rounded border px-3 py-2 text-sm font-semibold ${creditTone.panel}`}
                      >
                        {gradeLabel(creditResult.results.grade)}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-5 h-80">
                    {creditResult ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={creditResult.series}
                          margin={{ top: 12, right: 16, bottom: 8, left: 8 }}
                        >
                          <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
                          <XAxis
                            dataKey="factor"
                            tick={{ fill: "#5b6675", fontSize: 12 }}
                          />
                          <YAxis
                            tick={{ fill: "#5b6675", fontSize: 12 }}
                            width={78}
                          />
                          <Tooltip
                            formatter={(value, key) => {
                              if (key === "contribution") {
                                return [`${formatNumber(Number(value), 2)} 점`, "기여도"];
                              }
                              if (key === "factor_score") {
                                return [`${formatNumber(Number(value), 2)} 점`, "요인 점수"];
                              }
                              return [value, key];
                            }}
                          />
                          <Bar
                            dataKey="contribution"
                            fill="#1f6feb"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyChart message="계산을 실행하면 요인별 기여도 차트가 표시됩니다." />
                    )}
                  </div>
                </div>

                <section className="rounded border border-[#d9dee7] bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-semibold">비율 요약</h2>
                  <div className="mt-4 space-y-3 text-sm text-[#4b5563]">
                    <SummaryRow
                      label="부채비율"
                      value={formatNumber(creditForm.debt_ratio, 2)}
                    />
                    <SummaryRow
                      label="유동비율"
                      value={`${formatNumber(creditForm.current_ratio, 2)} 배`}
                    />
                    <SummaryRow
                      label="이자보상배율"
                      value={`${formatNumber(creditForm.interest_coverage_ratio, 2)} 배`}
                    />
                    <SummaryRow
                      label="영업이익률"
                      value={formatPercent(creditForm.operating_margin, 2)}
                    />
                  </div>
                </section>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <InterpretationPanel
                  title="결과 해석"
                  summary={
                    creditResult?.interpretation.summary ??
                    "계산을 실행하면 신용위험 등급과 설명 문구가 표시됩니다."
                  }
                  assumptions={creditResult?.interpretation.assumptions ?? []}
                />
                <FactorPanel factors={creditResult?.series ?? []} />
              </div>
            </section>
          </section>
        ) : activeTab === "project" ? (
          <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <aside className="rounded border border-[#d9dee7] bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">프로젝트 입력</h2>
              <p className="mt-2 text-sm leading-6 text-[#5b6675]">
                초기 투자금, 할인율, 연도별 현금흐름을 입력하면 NPV, IRR,
                회수기간을 계산합니다.
              </p>

              <div className="mt-5 grid gap-4">
                <NumberField
                  label="초기 투자금"
                  suffix="원"
                  value={projectForm.initial_investment}
                  onChange={(value) =>
                    updateProjectForm("initial_investment", value)
                  }
                />
                <NumberField
                  label="할인율"
                  step="0.001"
                  suffix="decimal"
                  value={projectForm.discount_rate}
                  onChange={(value) => updateProjectForm("discount_rate", value)}
                />
                <label className="block text-sm font-medium text-[#384252]">
                  연도별 현금흐름
                  <textarea
                    className="mt-2 min-h-36 w-full rounded border border-[#cfd6e0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f6feb]"
                    value={projectForm.cash_flows_text}
                    onChange={(event) =>
                      updateProjectForm("cash_flows_text", event.target.value)
                    }
                  />
                  <span className="mt-2 block text-xs text-[#7a8492]">
                    예: 70000000, 80000000, 90000000, 85000000
                  </span>
                </label>
              </div>

              <button
                className="mt-5 w-full rounded bg-[#1f6feb] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#195bc2] disabled:cursor-not-allowed disabled:bg-[#9ab7e6]"
                disabled={projectLoading}
                onClick={handleProjectCalculate}
              >
                {projectLoading ? "계산 중..." : "프로젝트 사업성 분석"}
              </button>

              {projectError ? (
                <AlertBox tone="error">{projectError}</AlertBox>
              ) : null}
            </aside>

            <section className="flex flex-col gap-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="NPV"
                  value={
                    projectResult
                      ? `${formatMoney(projectResult.results.npv)} 원`
                      : "-"
                  }
                  hint="할인율 기준 순현재가치"
                />
                <MetricCard
                  label="IRR"
                  value={
                    projectResult?.results.irr !== null &&
                    projectResult?.results.irr !== undefined
                      ? formatPercent(projectResult.results.irr, 2)
                      : "정의되지 않음"
                  }
                  hint="내부수익률"
                />
                <MetricCard
                  label="Payback Period"
                  value={
                    projectResult?.results.payback_period !== null &&
                    projectResult?.results.payback_period !== undefined
                      ? `${formatNumber(projectResult.results.payback_period)} 년`
                      : "회수 불가"
                  }
                  hint="부분 연도 보간 포함"
                />
                <MetricCard
                  label="최종 누적 현금흐름"
                  value={
                    projectResult
                      ? `${formatMoney(
                          projectResult.results.cumulative_cash_flow_final,
                        )} 원`
                      : "-"
                  }
                  hint="전체 기간 종료 시 누적 값"
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded border border-[#d9dee7] bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">현금흐름 차트</h2>
                      <p className="mt-1 text-sm text-[#6b7280]">
                        연도별 현금흐름과 누적 회수 흐름을 함께 봅니다.
                      </p>
                    </div>
                    <p className="text-sm font-medium text-[#49627a]">
                      할인율 {formatPercent(projectForm.discount_rate)}
                    </p>
                  </div>

                  <div className="mt-5 h-80">
                    {projectResult ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={projectResult.series.map((point) => ({
                            ...point,
                            yearLabel: `Y${point.year}`,
                          }))}
                          margin={{ top: 12, right: 16, bottom: 8, left: 8 }}
                        >
                          <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
                          <ReferenceLine y={0} stroke="#94a3b8" />
                          <XAxis
                            dataKey="yearLabel"
                            tick={{ fill: "#5b6675", fontSize: 12 }}
                          />
                          <YAxis
                            tick={{ fill: "#5b6675", fontSize: 12 }}
                            tickFormatter={(value) => formatMoney(Number(value))}
                            width={96}
                          />
                          <Tooltip
                            formatter={(value, key) => {
                              if (
                                key === "cash_flow" ||
                                key === "cumulative_cash_flow"
                              ) {
                                return [
                                  `${formatMoney(Number(value))} 원`,
                                  key === "cash_flow"
                                    ? "연도별 현금흐름"
                                    : "누적 현금흐름",
                                ];
                              }
                              return [value, key];
                            }}
                          />
                          <Bar
                            dataKey="cash_flow"
                            fill="#1f6feb"
                            radius={[4, 4, 0, 0]}
                          />
                          <Line
                            type="monotone"
                            dataKey="cumulative_cash_flow"
                            stroke="#ff7a00"
                            strokeWidth={3}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyChart message="분석을 실행하면 현금흐름 차트가 표시됩니다." />
                    )}
                  </div>
                </div>

                <section className="rounded border border-[#d9dee7] bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-semibold">입력 요약</h2>
                  <div className="mt-4 space-y-3 text-sm text-[#4b5563]">
                    <SummaryRow
                      label="초기 투자금"
                      value={`${formatMoney(projectForm.initial_investment)} 원`}
                    />
                    <SummaryRow
                      label="할인율"
                      value={formatPercent(projectForm.discount_rate)}
                    />
                    <SummaryRow
                      label="분석 연도 수"
                      value={`${parseCashFlows(projectForm.cash_flows_text).length} 년`}
                    />
                    <SummaryRow
                      label="입력 현금흐름"
                      value={`${parseCashFlows(projectForm.cash_flows_text).length} 개`}
                    />
                  </div>
                </section>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <InterpretationPanel
                  title="결과 해석"
                  summary={
                    projectResult?.interpretation.summary ??
                    "분석을 실행하면 NPV, IRR, Payback Period에 대한 해석이 표시됩니다."
                  }
                  assumptions={projectResult?.interpretation.assumptions ?? []}
                />
                <InterpretationPanel
                  title="판단 기준"
                  summary={projectDecisionSummary}
                  assumptions={[
                    `할인율 ${formatPercent(projectForm.discount_rate)}`,
                    "IRR은 현금흐름 패턴에 따라 정의되지 않을 수 있습니다.",
                    "Payback Period는 부분 연도를 보간해 계산합니다.",
                  ]}
                />
              </div>
            </section>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <aside className="rounded border border-[#d9dee7] bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">시장위험 입력</h2>
              <p className="mt-2 text-sm leading-6 text-[#5b6675]">
                포트폴리오 가치, 연율 변동성, 보유 기간, 신뢰수준을 입력하면
                Parametric VaR를 계산합니다.
              </p>

              <div className="mt-5 grid gap-4">
                <label className="block text-sm font-medium text-[#384252]">
                  자산군
                  <select
                    className="mt-2 w-full rounded border border-[#cfd6e0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f6feb]"
                    value={marketForm.asset_type}
                    onChange={(event) =>
                      updateMarketForm("asset_type", event.target.value as AssetType)
                    }
                  >
                    <option value="bond">bond</option>
                    <option value="stock">stock (future-ready)</option>
                  </select>
                </label>
                <NumberField
                  label="포트폴리오 가치"
                  suffix="원"
                  value={marketForm.portfolio_value}
                  onChange={(value) => updateMarketForm("portfolio_value", value)}
                />
                <NumberField
                  label="연율 변동성"
                  step="0.01"
                  suffix="decimal"
                  value={marketForm.annualized_volatility}
                  onChange={(value) =>
                    updateMarketForm("annualized_volatility", value)
                  }
                />
                <NumberField
                  label="보유 기간"
                  step="1"
                  suffix="일"
                  value={marketForm.holding_period_days}
                  onChange={(value) =>
                    updateMarketForm("holding_period_days", value)
                  }
                />
                <label className="block text-sm font-medium text-[#384252]">
                  신뢰수준
                  <select
                    className="mt-2 w-full rounded border border-[#cfd6e0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f6feb]"
                    value={String(marketForm.confidence_level)}
                    onChange={(event) =>
                      updateMarketForm(
                        "confidence_level",
                        Number(event.target.value) as 0.9 | 0.95 | 0.99,
                      )
                    }
                  >
                    <option value="0.9">90%</option>
                    <option value="0.95">95%</option>
                    <option value="0.99">99%</option>
                  </select>
                </label>
              </div>

              <div className="mt-4 rounded border border-[#e5e7eb] bg-[#f9fafb] p-3 text-xs leading-5 text-[#5b6675]">
                <div>변동성은 연율 기준 decimal 값입니다.</div>
                <div>보유 기간 변동성은 제곱근 시간 규칙으로 환산합니다.</div>
                <div>VaR는 분석 추정치이며 실제 최대손실을 보장하지 않습니다.</div>
              </div>

              <button
                className="mt-5 w-full rounded bg-[#1f6feb] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#195bc2] disabled:cursor-not-allowed disabled:bg-[#9ab7e6]"
                disabled={marketLoading}
                onClick={handleMarketCalculate}
              >
                {marketLoading ? "계산 중..." : "시장위험 VaR 계산"}
              </button>

              {marketError ? (
                <AlertBox tone="error">{marketError}</AlertBox>
              ) : null}
            </aside>

            <section className="flex flex-col gap-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="VaR 금액"
                  value={
                    marketResult
                      ? `${formatMoney(marketResult.results.var_amount)} 원`
                      : "-"
                  }
                  hint="선택한 신뢰수준과 보유 기간 기준 잠재 손실 추정치"
                />
                <MetricCard
                  label="손실률"
                  value={
                    marketResult
                      ? formatPercent(marketResult.results.loss_percent, 2)
                      : "-"
                  }
                  hint="포트폴리오 가치 대비 VaR 비율"
                />
                <MetricCard
                  label="보유 기간 변동성"
                  value={
                    marketResult
                      ? formatPercent(
                          marketResult.results.holding_period_volatility,
                          2,
                        )
                      : "-"
                  }
                  hint="제곱근 시간 규칙 적용 후 변동성"
                />
                <MetricCard
                  label="z-score"
                  value={
                    marketResult ? formatNumber(marketResult.results.z_score, 4) : "-"
                  }
                  hint="정규분포 신뢰수준 대응 값"
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded border border-[#d9dee7] bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">신뢰수준별 VaR</h2>
                      <p className="mt-1 text-sm text-[#6b7280]">
                        동일한 포트폴리오 조건에서 신뢰수준에 따라 VaR가 어떻게 커지는지 확인합니다.
                      </p>
                    </div>
                    <p className="text-sm font-medium text-[#49627a]">
                      자산군 {marketForm.asset_type}
                    </p>
                  </div>

                  <div className="mt-5 h-80">
                    {marketResult ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={marketResult.series.map((point) => ({
                            ...point,
                            confidenceLabel: `${Math.round(
                              point.confidence_level * 100,
                            )}%`,
                          }))}
                          margin={{ top: 12, right: 16, bottom: 8, left: 8 }}
                        >
                          <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
                          <XAxis
                            dataKey="confidenceLabel"
                            tick={{ fill: "#5b6675", fontSize: 12 }}
                          />
                          <YAxis
                            tick={{ fill: "#5b6675", fontSize: 12 }}
                            tickFormatter={(value) => formatMoney(Number(value))}
                            width={96}
                          />
                          <Tooltip
                            formatter={(value, key) => {
                              if (key === "var_amount") {
                                return [`${formatMoney(Number(value))} 원`, "VaR"];
                              }
                              if (key === "z_score") {
                                return [formatNumber(Number(value), 4), "z-score"];
                              }
                              return [value, key];
                            }}
                          />
                          <Bar
                            dataKey="var_amount"
                            fill="#1f6feb"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyChart message="계산을 실행하면 신뢰수준별 VaR 차트가 표시됩니다." />
                    )}
                  </div>
                </div>

                <section className="rounded border border-[#d9dee7] bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-semibold">입력 요약</h2>
                  <div className="mt-4 space-y-3 text-sm text-[#4b5563]">
                    <SummaryRow label="자산군" value={marketForm.asset_type} />
                    <SummaryRow
                      label="포트폴리오 가치"
                      value={`${formatMoney(marketForm.portfolio_value)} 원`}
                    />
                    <SummaryRow
                      label="연율 변동성"
                      value={formatPercent(marketForm.annualized_volatility, 2)}
                    />
                    <SummaryRow
                      label="보유 기간"
                      value={`${marketForm.holding_period_days} 일`}
                    />
                    <SummaryRow
                      label="신뢰수준"
                      value={`${Math.round(marketForm.confidence_level * 100)}%`}
                    />
                  </div>
                </section>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <InterpretationPanel
                  title="결과 해석"
                  summary={
                    marketResult?.interpretation.summary ??
                    "계산을 실행하면 VaR 결과와 가정이 표시됩니다."
                  }
                  assumptions={marketResult?.interpretation.assumptions ?? []}
                />
                <InterpretationPanel
                  title="판단 기준"
                  summary="VaR는 선택한 신뢰수준 안에서 예상되는 잠재 손실 규모를 보여주는 지표입니다. 신뢰수준이 높아질수록, 변동성과 포트폴리오 가치가 커질수록 VaR도 커집니다."
                  assumptions={[
                    `신뢰수준 ${Math.round(marketForm.confidence_level * 100)}%`,
                    `연율 변동성 ${formatPercent(marketForm.annualized_volatility, 2)}`,
                    `보유 기간 ${marketForm.holding_period_days}일`,
                    "VaR는 투자 조언이 아니라 위험 규모를 비교하는 분석 도구입니다.",
                  ]}
                />
              </div>
            </section>
          </section>
        )}
      </div>
    </main>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = "1",
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
  step?: string;
  suffix?: string;
}) {
  return (
    <label className="block text-sm font-medium text-[#384252]">
      <div className="flex items-center justify-between gap-3">
        <span>{label}</span>
        {suffix ? <span className="text-xs text-[#7a8492]">{suffix}</span> : null}
      </div>
      <input
        className="mt-2 w-full rounded border border-[#cfd6e0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f6feb]"
        type="number"
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded border border-[#d9dee7] bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-[#5b6675]">{label}</p>
      <p className="mt-3 text-2xl font-bold text-[#111827]">{value}</p>
      <p className="mt-2 text-xs leading-5 text-[#7a8492]">{hint}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#eef1f5] pb-3 last:border-b-0 last:pb-0">
      <span className="text-[#5b6675]">{label}</span>
      <span className="font-semibold text-[#111827]">{value}</span>
    </div>
  );
}

function InterpretationPanel({
  title,
  summary,
  assumptions,
}: {
  title: string;
  summary: string;
  assumptions: string[];
}) {
  return (
    <section className="rounded border border-[#d9dee7] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#4b5563]">{summary}</p>
      {assumptions.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm text-[#5b6675]">
          {assumptions.map((assumption) => (
            <li key={assumption} className="border-l-2 border-[#1f6feb] pl-3">
              {assumption}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function FactorPanel({ factors }: { factors: CreditRiskFactorContribution[] }) {
  return (
    <section className="rounded border border-[#d9dee7] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">주요 요인 해설</h2>
      {factors.length > 0 ? (
        <ul className="mt-4 space-y-3 text-sm text-[#4b5563]">
          {factors.map((factor) => (
            <li
              key={factor.factor}
              className="rounded border border-[#e5e7eb] bg-[#fafbfc] p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-[#18202a]">{factor.factor}</span>
                <span className="text-xs text-[#6b7280]">
                  기여도 {formatNumber(factor.contribution, 2)}점
                </span>
              </div>
              <p className="mt-2 leading-6">{factor.assessment}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm leading-6 text-[#5b6675]">
          계산을 실행하면 어떤 비율이 점수에 영향을 주었는지 설명이 표시됩니다.
        </p>
      )}
    </section>
  );
}

function AlertBox({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "error" | "warning";
}) {
  const className =
    tone === "error"
      ? "mt-4 rounded border border-[#f0b4a7] bg-[#fff4f1] p-3 text-sm leading-6 text-[#9f2f1f]"
      : "mt-4 rounded border border-[#f0d58a] bg-[#fff8e1] p-3 text-sm leading-6 text-[#8a5a00]";

  return <div className={className}>{children}</div>;
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded border border-dashed border-[#cfd6e0] text-sm text-[#7a8492]">
      {message}
    </div>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={
        active
          ? "border-b-2 border-[#1f6feb] px-3 py-2 text-[#1f4f8f]"
          : "px-3 py-2 text-[#7a8492]"
      }
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
