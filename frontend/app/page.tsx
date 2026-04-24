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

type DashboardTab =
  | "bond"
  | "stock"
  | "portfolio"
  | "credit"
  | "project"
  | "market";
type AssetTypeKey = "bond" | "stock";

type Interpretation = {
  label: string;
  summary: string;
  assumptions: string[];
};

type AssetTypeInfo = {
  asset_type: AssetTypeKey;
  label: string;
  status: "enabled" | "planned" | "disabled";
  description: string;
};

type AssetTypesResponse = {
  asset_types: AssetTypeInfo[];
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

type StockInstrument = {
  instrument_id: string;
  ticker: string;
  name: string;
  exchange: string;
  currency: string;
  last_price: number;
  shares_outstanding: number;
  eps_ttm: number;
  book_value_per_share: number;
  dividend_per_share: number;
  beta: number;
  expected_growth_rate: number;
};

type StockForm = {
  current_price: number;
  eps: number;
  book_value_per_share: number;
  dividend_per_share: number;
  required_return: number;
  risk_free_rate: number;
  market_return: number;
  beta: number;
  growth_rate: number;
  target_pe: number;
  target_pb: number;
  shares_outstanding: number;
  investment_amount: number;
  min_growth_shock: number;
  max_growth_shock: number;
  steps: number;
};

type StockValuationResponse = {
  results: {
    market_cap: number | null;
    price_to_earnings: number | null;
    price_to_book: number;
    dividend_yield: number;
    earnings_yield: number | null;
    capm_required_return: number;
    effective_required_return: number;
    gordon_growth_value: number | null;
    fair_value_by_pe: number | null;
    fair_value_by_pb: number | null;
    upside_by_gordon: number | null;
    upside_by_pe: number | null;
    upside_by_pb: number | null;
    estimated_shares: number | null;
  };
  interpretation: Interpretation;
};

type StockScenarioPoint = {
  growth_shock: number;
  growth_rate: number;
  gordon_growth_value: number | null;
};

type StockScenarioResponse = {
  results: {
    base_gordon_growth_value: number | null;
  };
  interpretation: Interpretation;
  series: StockScenarioPoint[];
};

type PortfolioHoldingResult = {
  asset_type: "stock" | "bond";
  instrument_id: string;
  name: string | null;
  market_value: number;
  weight: number;
  beta: number | null;
  duration: number | null;
  expected_return: number;
  volatility: number;
  contribution_to_return: number;
  contribution_to_variance: number;
};

type PortfolioHoldingForm = {
  asset_type: "stock" | "bond";
  instrument_id: string;
  ticker: string;
  name: string;
  market_value: number;
  beta: number | null;
  duration: number | null;
  expected_return: number;
  volatility: number;
};

type PortfolioHoldingView = {
  holding: PortfolioHoldingForm;
  sourceIndex: number;
};

type PortfolioRiskForm = {
  holding_period_days: number;
};

type PortfolioAnalyzeResponse = {
  results: {
    total_market_value: number;
    weighted_beta: number | null;
    weighted_duration: number | null;
    expected_return: number;
    largest_weight: number;
    hhi: number;
    concentration_level: "diversified" | "watch" | "high";
    estimated_volatility: number;
    holding_period_volatility: number;
    var_95: number;
    var_99: number;
    loss_percent_95: number;
    loss_percent_99: number;
  };
  interpretation: Interpretation;
  series: PortfolioHoldingResult[];
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
  asset_type: AssetTypeKey;
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

const fallbackStockForm: StockForm = {
  current_price: 72000,
  eps: 5200,
  book_value_per_share: 48000,
  dividend_per_share: 1444,
  required_return: 0.09,
  risk_free_rate: 0.035,
  market_return: 0.085,
  beta: 1.05,
  growth_rate: 0.035,
  target_pe: 14,
  target_pb: 1.6,
  shares_outstanding: 5969782550,
  investment_amount: 1000000,
  min_growth_shock: -0.03,
  max_growth_shock: 0.03,
  steps: 7,
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

function formatMoneyGuide(value: number) {
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 100000000) {
    return `약 ${(value / 100000000).toFixed(1)}억원`;
  }
  if (absoluteValue >= 10000) {
    return `약 ${(value / 10000).toFixed(0)}만원`;
  }
  return `${formatMoney(value)}원`;
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

function calculateCapmReturn(
  riskFreeRate: number,
  marketReturn: number,
  beta: number,
) {
  return riskFreeRate + beta * (marketReturn - riskFreeRate);
}

function concentrationLabel(level: "diversified" | "watch" | "high") {
  if (level === "diversified") return "분산 양호";
  if (level === "watch") return "집중 주의";
  return "고집중";
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

function toStockPayload(form: StockForm) {
  return {
    current_price: Number(form.current_price),
    eps: Number(form.eps),
    book_value_per_share: Number(form.book_value_per_share),
    dividend_per_share: Number(form.dividend_per_share),
    required_return: Number(form.required_return),
    risk_free_rate: Number(form.risk_free_rate),
    market_return: Number(form.market_return),
    beta: Number(form.beta),
    growth_rate: Number(form.growth_rate),
    target_pe: Number(form.target_pe),
    target_pb: Number(form.target_pb),
    shares_outstanding: Number(form.shares_outstanding),
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

function validateStockForm(form: StockForm): string | null {
  if (form.current_price <= 0) return "현재가는 0보다 커야 합니다.";
  if (form.book_value_per_share <= 0) return "주당 순자산은 0보다 커야 합니다.";
  if (form.dividend_per_share < 0) return "주당 배당금은 음수일 수 없습니다.";
  if (form.required_return <= 0) return "요구수익률은 0보다 커야 합니다.";
  if (form.beta <= 0) return "Beta는 0보다 커야 합니다.";
  if (form.target_pe <= 0) return "Target P/E는 0보다 커야 합니다.";
  if (form.target_pb <= 0) return "Target P/B는 0보다 커야 합니다.";
  if (form.shares_outstanding <= 0) return "발행주식 수는 0보다 커야 합니다.";
  if (form.investment_amount <= 0) return "투자금액은 0보다 커야 합니다.";
  if (form.min_growth_shock >= form.max_growth_shock) {
    return "최소 성장률 충격은 최대 성장률 충격보다 작아야 합니다.";
  }
  if (form.steps < 3) return "시나리오 개수는 3개 이상이어야 합니다.";
  if (form.steps > 25) return "시나리오 개수는 25개 이하여야 합니다.";
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
  const [assetTypes, setAssetTypes] = useState<AssetTypeInfo[]>([]);
  const [assetTypeError, setAssetTypeError] = useState<string | null>(null);
  const [instruments, setInstruments] = useState<BondInstrument[]>([]);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState("");
  const [stockInstruments, setStockInstruments] = useState<StockInstrument[]>([]);
  const [selectedStockInstrumentId, setSelectedStockInstrumentId] = useState("");
  const [portfolioHoldings, setPortfolioHoldings] = useState<
    PortfolioHoldingForm[]
  >([]);
  const [portfolioRiskForm, setPortfolioRiskForm] =
    useState<PortfolioRiskForm>({
      holding_period_days: 10,
    });
  const [bondForm, setBondForm] = useState<BondForm>(fallbackBondForm);
  const [stockForm, setStockForm] = useState<StockForm>(fallbackStockForm);
  const [creditForm, setCreditForm] =
    useState<CreditRiskForm>(fallbackCreditForm);
  const [projectForm, setProjectForm] =
    useState<ProjectForm>(fallbackProjectForm);
  const [marketForm, setMarketForm] =
    useState<MarketRiskForm>(fallbackMarketForm);
  const [valuation, setValuation] = useState<BondValuationResponse | null>(null);
  const [scenario, setScenario] = useState<BondScenarioResponse | null>(null);
  const [stockValuation, setStockValuation] =
    useState<StockValuationResponse | null>(null);
  const [stockScenario, setStockScenario] =
    useState<StockScenarioResponse | null>(null);
  const [portfolioAnalysis, setPortfolioAnalysis] =
    useState<PortfolioAnalyzeResponse | null>(null);
  const [creditResult, setCreditResult] = useState<CreditRiskResponse | null>(
    null,
  );
  const [projectResult, setProjectResult] =
    useState<ProjectFeasibilityResponse | null>(null);
  const [marketResult, setMarketResult] = useState<MarketRiskResponse | null>(
    null,
  );
  const [bondLoading, setBondLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [creditLoading, setCreditLoading] = useState(false);
  const [projectLoading, setProjectLoading] = useState(false);
  const [marketLoading, setMarketLoading] = useState(false);
  const [bondError, setBondError] = useState<string | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);
  const [portfolioError, setPortfolioError] = useState<string | null>(
    null,
  );
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

  const selectedStockInstrument = useMemo(
    () =>
      stockInstruments.find(
        (instrument) =>
          instrument.instrument_id === selectedStockInstrumentId,
      ),
    [selectedStockInstrumentId, stockInstruments],
  );

  useEffect(() => {
    if (
      portfolioHoldings.length > 0 ||
      stockInstruments.length === 0 ||
      instruments.length === 0
    ) {
      return;
    }

    const baseStockValues = [50000000, 30000000];
    const stockHoldings: PortfolioHoldingForm[] = stockInstruments
      .slice(0, 2)
      .map((instrument, index) => ({
        asset_type: "stock",
        instrument_id: instrument.instrument_id,
        ticker: instrument.ticker,
        name: instrument.name,
        market_value: baseStockValues[index] ?? 10000000,
        beta: instrument.beta,
        duration: null,
        expected_return: calculateCapmReturn(
          fallbackStockForm.risk_free_rate,
          fallbackStockForm.market_return,
          instrument.beta,
        ),
        volatility: 0.22,
      }));

    const bond = instruments[0];
    const bondHolding: PortfolioHoldingForm | null = bond
      ? {
          asset_type: "bond",
          instrument_id: bond.instrument_id,
          ticker: bond.name,
          name: bond.name,
          market_value: 20000000,
          beta: null,
          duration: bond.maturity_years,
          expected_return: bond.market_yield,
          volatility: 0.06,
        }
      : null;

    setPortfolioHoldings(
      bondHolding ? [...stockHoldings, bondHolding] : stockHoldings,
    );
  }, [instruments, stockInstruments, portfolioHoldings.length]);

  const priceGap = useMemo(() => {
    if (!valuation) return null;
    return valuation.results.present_value - bondForm.face_value;
  }, [bondForm.face_value, valuation]);

  const creditTone = creditResult
    ? gradeTone(creditResult.results.grade)
    : gradeTone("Watch");

  const enabledAssetCount = assetTypes.filter(
    (assetType) => assetType.status === "enabled",
  ).length;

  const portfolioStockHoldings = useMemo(
    () =>
      portfolioHoldings
        .map((holding, sourceIndex) => ({ holding, sourceIndex }))
        .filter(({ holding }) => holding.asset_type === "stock"),
    [portfolioHoldings],
  );

  const portfolioBondHoldings = useMemo(
    () =>
      portfolioHoldings
        .map((holding, sourceIndex) => ({ holding, sourceIndex }))
        .filter(({ holding }) => holding.asset_type === "bond"),
    [portfolioHoldings],
  );

  const readinessItems = [
    {
      label: "채권",
      status: valuation ? "ready" : "waiting",
      detail: valuation ? "계산 가능" : "대기",
    },
    {
      label: "신용위험",
      status: creditResult ? "ready" : "waiting",
      detail: creditResult ? gradeLabel(creditResult.results.grade) : "대기",
    },
    {
      label: "프로젝트",
      status: projectResult ? "ready" : "waiting",
      detail: projectResult ? "계산 가능" : "대기",
    },
    {
      label: "시장위험",
      status: marketResult ? "ready" : "waiting",
      detail: marketResult ? "VaR 계산 가능" : "대기",
    },
  ] as const;

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

    fetchJson<AssetTypesResponse>("/api/assets/types")
      .then((payload) => {
        if (mounted) setAssetTypes(payload.asset_types);
      })
      .catch((caught: Error) => {
        if (mounted) {
          setAssetTypeError(`자산군 정보를 불러오지 못했습니다. ${caught.message}`);
        }
      });

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

    fetchJson<{ instruments: StockInstrument[] }>("/api/stocks/instruments")
      .then((payload) => {
        if (!mounted) return;

        setStockInstruments(payload.instruments);
        const firstInstrument = payload.instruments[0];

        if (firstInstrument) {
          setSelectedStockInstrumentId(firstInstrument.instrument_id);
          setStockForm((current) => ({
            ...current,
            current_price: firstInstrument.last_price,
            eps: firstInstrument.eps_ttm,
            book_value_per_share: firstInstrument.book_value_per_share,
            dividend_per_share: firstInstrument.dividend_per_share,
            beta: firstInstrument.beta,
            growth_rate: firstInstrument.expected_growth_rate,
            shares_outstanding: firstInstrument.shares_outstanding,
          }));
        }
      })
      .catch((caught: Error) => {
        if (mounted) {
          setStockError(`주식 목록을 불러오지 못했습니다. ${caught.message}`);
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

  async function handleSelectStockInstrument(instrumentId: string) {
    setSelectedStockInstrumentId(instrumentId);
    setStockError(null);

    try {
      const payload = await fetchJson<{ instrument: StockInstrument }>(
        `/api/stocks/market-data?instrument_id=${encodeURIComponent(instrumentId)}`,
      );

      setStockForm((current) => ({
        ...current,
        current_price: payload.instrument.last_price,
        eps: payload.instrument.eps_ttm,
        book_value_per_share: payload.instrument.book_value_per_share,
        dividend_per_share: payload.instrument.dividend_per_share,
        beta: payload.instrument.beta,
        growth_rate: payload.instrument.expected_growth_rate,
        shares_outstanding: payload.instrument.shares_outstanding,
      }));

      setStockValuation(null);
      setStockScenario(null);
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "알 수 없는 오류";
      setStockError(`주식 데이터를 불러오지 못했습니다. ${message}`);
    }
  }

  async function handleStockCalculate() {
    const validationMessage = validateStockForm(stockForm);
    if (validationMessage) {
      setStockError(validationMessage);
      return;
    }

    setStockLoading(true);
    setStockError(null);

    try {
      const valuationPayload = toStockPayload(stockForm);
      const scenarioPayload = {
        ...valuationPayload,
        min_growth_shock: Number(stockForm.min_growth_shock),
        max_growth_shock: Number(stockForm.max_growth_shock),
        steps: Number(stockForm.steps),
      };

      const [valuationResult, scenarioResult] = await Promise.all([
        fetchJson<StockValuationResponse>("/api/stocks/valuation", {
          method: "POST",
          body: JSON.stringify(valuationPayload),
        }),
        fetchJson<StockScenarioResponse>("/api/stocks/scenarios", {
          method: "POST",
          body: JSON.stringify(scenarioPayload),
        }),
      ]);

      setStockValuation(valuationResult);
      setStockScenario(scenarioResult);
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "알 수 없는 오류";
      setStockError(`주식 가치평가에 실패했습니다. ${message}`);
    } finally {
      setStockLoading(false);
    }
  }

  async function handlePortfolioCalculate() {
    if (portfolioHoldings.length === 0) {
      setPortfolioError("포트폴리오 종목을 먼저 불러와야 합니다.");
      return;
    }
    if (portfolioHoldings.some((holding) => holding.market_value <= 0)) {
      setPortfolioError("각 종목의 평가금액은 0보다 커야 합니다.");
      return;
    }
    if (
      portfolioHoldings.some(
        (holding) => holding.beta !== null && holding.beta <= 0,
      )
    ) {
      setPortfolioError("Beta는 입력하는 경우 0보다 커야 합니다.");
      return;
    }
    if (
      portfolioHoldings.some(
        (holding) => holding.duration !== null && holding.duration < 0,
      )
    ) {
      setPortfolioError("Duration은 음수일 수 없습니다.");
      return;
    }
    if (
      portfolioRiskForm.holding_period_days < 1 ||
      portfolioRiskForm.holding_period_days > 252
    ) {
      setPortfolioError("보유기간은 1일 이상 252일 이하여야 합니다.");
      return;
    }

    setPortfolioLoading(true);
    setPortfolioError(null);

    try {
      const result = await fetchJson<PortfolioAnalyzeResponse>(
        "/api/portfolio/analyze",
        {
          method: "POST",
          body: JSON.stringify({
            holdings: portfolioHoldings.map((holding) => ({
              asset_type: holding.asset_type,
              instrument_id: holding.instrument_id,
              name: holding.name,
              market_value: holding.market_value,
              expected_return: holding.expected_return,
              volatility: holding.volatility,
              beta: holding.beta,
              duration: holding.duration,
            })),
            holding_period_days: portfolioRiskForm.holding_period_days,
          }),
        },
      );

      setPortfolioAnalysis(result);
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "알 수 없는 오류";
      setPortfolioError(`포트폴리오 계산에 실패했습니다. ${message}`);
    } finally {
      setPortfolioLoading(false);
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

  function updateStockForm(key: keyof StockForm, value: string) {
    setStockForm((current) => ({
      ...current,
      [key]: Number(value),
    }));
  }

  function updatePortfolioHolding(
    index: number,
    key: keyof Pick<
      PortfolioHoldingForm,
      "market_value" | "beta" | "duration" | "expected_return" | "volatility"
    >,
    value: string,
  ) {
    setPortfolioHoldings((current) =>
      current.map((holding, holdingIndex) =>
        holdingIndex === index
          ? {
              ...holding,
              [key]:
                (key === "beta" || key === "duration") && value === ""
                  ? null
                  : Number(value),
            }
          : holding,
      ),
    );
    setPortfolioAnalysis(null);
  }

  function updatePortfolioRiskForm(
    key: keyof PortfolioRiskForm,
    value: string,
  ) {
    setPortfolioRiskForm((current) => ({
      ...current,
      [key]: Number(value),
    }));
    setPortfolioAnalysis(null);
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
    value: string | AssetTypeKey | 0.9 | 0.95 | 0.99,
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
        <header className="flex flex-col gap-3 border-b border-[#d9dee7] pb-5">
          <div>
            <p className="text-sm font-semibold text-[#49627a]">
              Asset Risk Integrated System
            </p>
            <h1 className="mt-1 text-3xl font-bold text-[#111827]">
              ARIS 통합 분석 대시보드
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5b6675]">
              채권 가치평가, 신용위험, 프로젝트 사업성, 시장위험 VaR을 한 화면에서
              다루고 이후 주식 자산군 확장까지 대비한 구조를 함께 확인할 수
              있습니다.
            </p>
          </div>
        </header>

        <section className="rounded border border-[#d9dee7] bg-white px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-[#18202a]">
                지원 분석
              </span>
              <span className="rounded bg-[#eaf2ff] px-2.5 py-1 text-xs font-semibold text-[#1f4f8f]">
                사용 가능 자산군 {enabledAssetCount}개
              </span>
              <span className="rounded bg-[#eef2f7] px-2.5 py-1 text-xs font-semibold text-[#5b6675]">
                자산군 확장 준비됨
              </span>
              {assetTypeError ? (
                <span className="text-xs text-[#9f2f1f]">{assetTypeError}</span>
              ) : (
                assetTypes.map((assetType) => (
                  <AssetTypePill key={assetType.asset_type} assetType={assetType} />
                ))
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {readinessItems.map((item) => (
                <StatusChip
                  key={item.label}
                  detail={item.detail}
                  label={item.label}
                  status={item.status}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="rounded border border-[#d9dee7] bg-white p-3 shadow-sm">
          <div className="flex flex-wrap gap-2 text-sm font-medium">
            <TabButton
              active={activeTab === "bond"}
              label="채권"
              onClick={() => setActiveTab("bond")}
            />
            <TabButton
              active={activeTab === "stock"}
              label="주식"
              onClick={() => setActiveTab("stock")}
            />
            <TabButton
              active={activeTab === "portfolio"}
              label="포트폴리오"
              onClick={() => setActiveTab("portfolio")}
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
        </section>

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
                  onChange={(event) => handleSelectInstrument(event.target.value)}
                  value={selectedInstrumentId}
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
                  onChange={(value) => updateBondForm("investment_amount", value)}
                  suffix="원"
                  value={bondForm.investment_amount}
                />
                <NumberField
                  label="액면가"
                  onChange={(value) => updateBondForm("face_value", value)}
                  suffix="원"
                  value={bondForm.face_value}
                />
                <NumberField
                  label="표면금리"
                  onChange={(value) => updateBondForm("coupon_rate", value)}
                  step="0.001"
                  suffix="decimal"
                  value={bondForm.coupon_rate}
                />
                <NumberField
                  label="시장수익률"
                  onChange={(value) => updateBondForm("market_yield", value)}
                  step="0.001"
                  suffix="decimal"
                  value={bondForm.market_yield}
                />
              </div>

              <details className="mt-5 rounded border border-[#d9dee7] bg-[#fafbfc] p-4">
                <summary className="cursor-pointer text-sm font-semibold">
                  고급 설정
                </summary>
                <div className="mt-4 grid gap-4">
                  <NumberField
                    label="만기"
                    onChange={(value) => updateBondForm("maturity_years", value)}
                    step="0.5"
                    suffix="년"
                    value={bondForm.maturity_years}
                  />
                  <NumberField
                    label="연간 지급 횟수"
                    onChange={(value) =>
                      updateBondForm("payment_frequency", value)
                    }
                    step="1"
                    suffix="회"
                    value={bondForm.payment_frequency}
                  />
                  <NumberField
                    label="최소 금리 충격"
                    onChange={(value) => updateBondForm("min_rate_shock", value)}
                    step="0.005"
                    suffix="decimal"
                    value={bondForm.min_rate_shock}
                  />
                  <NumberField
                    label="최대 금리 충격"
                    onChange={(value) => updateBondForm("max_rate_shock", value)}
                    step="0.005"
                    suffix="decimal"
                    value={bondForm.max_rate_shock}
                  />
                  <NumberField
                    label="시나리오 개수"
                    onChange={(value) => updateBondForm("steps", value)}
                    step="1"
                    suffix="개"
                    value={bondForm.steps}
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
                  hint="미래 현금흐름을 할인한 채권 가격"
                  label="현재가치"
                  value={
                    valuation ? `${formatMoney(valuation.results.present_value)} 원` : "-"
                  }
                />
                <MetricCard
                  hint={
                    priceGap === null
                      ? "프리미엄 또는 디스카운트 여부"
                      : priceGap >= 0
                        ? "액면가 대비 프리미엄"
                        : "액면가 대비 디스카운트"
                  }
                  label="액면가 대비"
                  value={
                    priceGap !== null
                      ? `${priceGap >= 0 ? "+" : ""}${formatMoney(priceGap)} 원`
                      : "-"
                  }
                />
                <MetricCard
                  hint="현금흐름 회수 시점의 가중평균"
                  label="Macaulay Duration"
                  value={
                    valuation
                      ? `${formatNumber(valuation.results.macaulay_duration)} 년`
                      : "-"
                  }
                />
                <MetricCard
                  hint="금리 변화에 대한 1차 가격 민감도"
                  label="Modified Duration"
                  value={
                    valuation
                      ? `${formatNumber(valuation.results.modified_duration)}`
                      : "-"
                  }
                />
                <MetricCard
                  hint="금리 변화에 대한 2차 민감도"
                  label="Convexity"
                  value={valuation ? formatNumber(valuation.results.convexity) : "-"}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <ChartPanel
                  description="금리 충격에 따라 채권 가격이 얼마나 흔들리는지 비교합니다."
                  title="금리 시나리오"
                >
                  {scenario ? (
                    <ResponsiveContainer height="100%" width="100%">
                      <LineChart
                        data={scenario.series.map((point) => ({
                          ...point,
                          shockLabel: `${(point.rate_shock * 100).toFixed(1)}%p`,
                        }))}
                        margin={{ top: 12, right: 16, bottom: 8, left: 8 }}
                      >
                        <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
                        <ReferenceLine
                          stroke="#94a3b8"
                          y={scenario.results.base_price}
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
                          activeDot={{ r: 5 }}
                          dataKey="price"
                          dot={{ r: 3 }}
                          stroke="#1f6feb"
                          strokeWidth={3}
                          type="monotone"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart message="계산을 실행하면 금리 시나리오 차트가 표시됩니다." />
                  )}
                </ChartPanel>

                <SummaryPanel title="포지션 요약">
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
                </SummaryPanel>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <InterpretationPanel
                  assumptions={valuation?.interpretation.assumptions ?? []}
                  summary={
                    valuation?.interpretation.summary ??
                    "계산을 실행하면 채권 가치와 금리 민감도에 대한 해석이 표시됩니다."
                  }
                  title="결과 해석"
                />
                <InterpretationPanel
                  assumptions={[
                    `표면금리 ${formatPercent(bondForm.coupon_rate)}`,
                    `시장수익률 ${formatPercent(bondForm.market_yield)}`,
                    `금리 충격 ${formatPercent(bondForm.min_rate_shock)} ~ ${formatPercent(
                      bondForm.max_rate_shock,
                    )}`,
                    "채권 valuation 로직은 bond 전용 서비스로 분리되어 있습니다.",
                  ]}
                  summary="수익률과 표면금리는 decimal 값으로 입력합니다. 채권 valuation은 자산군 전용 계산이고 공통 위험 지표와는 경계를 분리해 유지합니다."
                  title="자산군 경계"
                />
              </div>
            </section>
          </section>
        ) : activeTab === "stock" ? (
          <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <aside className="rounded border border-[#d9dee7] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">주식 입력</h2>
                {selectedStockInstrument ? (
                  <span className="rounded bg-[#eef2f7] px-2 py-1 text-xs font-semibold text-[#384252]">
                    {selectedStockInstrument.ticker}
                  </span>
                ) : null}
              </div>

              <label className="mt-5 block text-sm font-medium text-[#384252]">
                샘플 종목
                <select
                  className="mt-2 w-full rounded border border-[#cfd6e0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f6feb]"
                  onChange={(event) =>
                    handleSelectStockInstrument(event.target.value)
                  }
                  value={selectedStockInstrumentId}
                >
                  {stockInstruments.length === 0 ? (
                    <option value="">백엔드 연결 대기 중</option>
                  ) : null}
                  {stockInstruments.map((instrument) => (
                    <option
                      key={instrument.instrument_id}
                      value={instrument.instrument_id}
                    >
                      {instrument.name}
                    </option>
                  ))}
                </select>
              </label>

              {selectedStockInstrument ? (
                <div className="mt-3 rounded border border-[#e5e7eb] bg-[#f9fafb] p-3 text-xs leading-5 text-[#5b6675]">
                  <div>거래소: {selectedStockInstrument.exchange}</div>
                  <div>통화: {selectedStockInstrument.currency}</div>
                  <div>Beta: {formatNumber(selectedStockInstrument.beta, 2)}</div>
                  <div>
                    예상 성장률:{" "}
                    {formatPercent(selectedStockInstrument.expected_growth_rate)}
                  </div>
                </div>
              ) : null}

              <div className="mt-5 grid gap-4">
                <NumberField
                  label="투자금액"
                  onChange={(value) => updateStockForm("investment_amount", value)}
                  suffix="원"
                  value={stockForm.investment_amount}
                />
                <NumberField
                  label="현재가"
                  onChange={(value) => updateStockForm("current_price", value)}
                  suffix={selectedStockInstrument?.currency ?? "가격"}
                  value={stockForm.current_price}
                />
                <NumberField
                  label="EPS"
                  onChange={(value) => updateStockForm("eps", value)}
                  step="0.01"
                  value={stockForm.eps}
                />
                <NumberField
                  label="주당 순자산"
                  onChange={(value) =>
                    updateStockForm("book_value_per_share", value)
                  }
                  step="0.01"
                  value={stockForm.book_value_per_share}
                />
                <NumberField
                  label="주당 배당금"
                  onChange={(value) =>
                    updateStockForm("dividend_per_share", value)
                  }
                  step="0.01"
                  value={stockForm.dividend_per_share}
                />
                <NumberField
                  label="요구수익률"
                  onChange={(value) => updateStockForm("required_return", value)}
                  step="0.001"
                  suffix="decimal"
                  value={stockForm.required_return}
                />
                <NumberField
                  label="Beta"
                  onChange={(value) => updateStockForm("beta", value)}
                  step="0.01"
                  value={stockForm.beta}
                />
                <NumberField
                  label="무위험수익률"
                  onChange={(value) => updateStockForm("risk_free_rate", value)}
                  step="0.001"
                  suffix="decimal"
                  value={stockForm.risk_free_rate}
                />
                <NumberField
                  label="시장기대수익률"
                  onChange={(value) => updateStockForm("market_return", value)}
                  step="0.001"
                  suffix="decimal"
                  value={stockForm.market_return}
                />
                <NumberField
                  label="성장률"
                  onChange={(value) => updateStockForm("growth_rate", value)}
                  step="0.001"
                  suffix="decimal"
                  value={stockForm.growth_rate}
                />
                <NumberField
                  label="Target P/E"
                  onChange={(value) => updateStockForm("target_pe", value)}
                  step="0.1"
                  value={stockForm.target_pe}
                />
                <NumberField
                  label="Target P/B"
                  onChange={(value) => updateStockForm("target_pb", value)}
                  step="0.1"
                  value={stockForm.target_pb}
                />
              </div>

              <details className="mt-5 rounded border border-[#d9dee7] bg-[#fafbfc] p-4">
                <summary className="cursor-pointer text-sm font-semibold">
                  시나리오 설정
                </summary>
                <div className="mt-4 grid gap-4">
                  <NumberField
                    label="발행주식 수"
                    onChange={(value) =>
                      updateStockForm("shares_outstanding", value)
                    }
                    step="1"
                    value={stockForm.shares_outstanding}
                  />
                  <NumberField
                    label="최소 성장률 충격"
                    onChange={(value) =>
                      updateStockForm("min_growth_shock", value)
                    }
                    step="0.005"
                    suffix="decimal"
                    value={stockForm.min_growth_shock}
                  />
                  <NumberField
                    label="최대 성장률 충격"
                    onChange={(value) =>
                      updateStockForm("max_growth_shock", value)
                    }
                    step="0.005"
                    suffix="decimal"
                    value={stockForm.max_growth_shock}
                  />
                  <NumberField
                    label="시나리오 개수"
                    onChange={(value) => updateStockForm("steps", value)}
                    step="1"
                    value={stockForm.steps}
                  />
                </div>
              </details>

              <button
                className="mt-5 w-full rounded bg-[#1f6feb] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#195bc2] disabled:cursor-not-allowed disabled:bg-[#9ab7e6]"
                disabled={stockLoading}
                onClick={handleStockCalculate}
              >
                {stockLoading ? "계산 중..." : "주식 가치평가 실행"}
              </button>

              {stockError ? <AlertBox tone="error">{stockError}</AlertBox> : null}
            </aside>

            <section className="flex flex-col gap-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <MetricCard
                  hint="현재가를 최근 EPS로 나눈 배수입니다."
                  label="P/E"
                  value={
                    stockValuation?.results.price_to_earnings !== null &&
                    stockValuation?.results.price_to_earnings !== undefined
                      ? formatNumber(stockValuation.results.price_to_earnings, 2)
                      : "-"
                  }
                />
                <MetricCard
                  hint="현재가를 주당 순자산으로 나눈 배수입니다."
                  label="P/B"
                  value={
                    stockValuation
                      ? formatNumber(stockValuation.results.price_to_book, 2)
                      : "-"
                  }
                />
                <MetricCard
                  hint="주당 배당금을 현재가로 나눈 비율입니다."
                  label="배당수익률"
                  value={
                    stockValuation
                      ? formatPercent(stockValuation.results.dividend_yield, 2)
                      : "-"
                  }
                />
                <MetricCard
                  hint="CAPM으로 산출한 요구수익률입니다."
                  label="CAPM 요구수익률"
                  value={
                    stockValuation
                      ? formatPercent(
                          stockValuation.results.capm_required_return,
                          2,
                        )
                      : "-"
                  }
                />
                <MetricCard
                  hint="입력된 요구수익률이 valuation에 적용됩니다."
                  label="적용 요구수익률"
                  value={
                    stockValuation
                      ? formatPercent(
                          stockValuation.results.effective_required_return,
                          2,
                        )
                      : "-"
                  }
                />
                <MetricCard
                  hint="Gordon growth 배당할인모형 추정값입니다."
                  label="Gordon Value"
                  value={
                    stockValuation?.results.gordon_growth_value !== null &&
                    stockValuation?.results.gordon_growth_value !== undefined
                      ? formatMoney(stockValuation.results.gordon_growth_value)
                      : "-"
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  hint="EPS에 target P/E를 적용한 상대가치평가 적정가입니다."
                  label="P/E 적정가"
                  value={
                    stockValuation?.results.fair_value_by_pe
                      ? formatMoney(stockValuation.results.fair_value_by_pe)
                      : "-"
                  }
                />
                <MetricCard
                  hint="주당 순자산에 target P/B를 적용한 상대가치평가 적정가입니다."
                  label="P/B 적정가"
                  value={
                    stockValuation?.results.fair_value_by_pb
                      ? formatMoney(stockValuation.results.fair_value_by_pb)
                      : "-"
                  }
                />
                <MetricCard
                  hint="P/E 적정가의 현재가 대비 괴리율입니다."
                  label="P/E 괴리율"
                  value={
                    stockValuation?.results.upside_by_pe !== null &&
                    stockValuation?.results.upside_by_pe !== undefined
                      ? formatPercent(stockValuation.results.upside_by_pe, 2)
                      : "-"
                  }
                />
                <MetricCard
                  hint="P/B 적정가의 현재가 대비 괴리율입니다."
                  label="P/B 괴리율"
                  value={
                    stockValuation?.results.upside_by_pb !== null &&
                    stockValuation?.results.upside_by_pb !== undefined
                      ? formatPercent(stockValuation.results.upside_by_pb, 2)
                      : "-"
                  }
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <ChartPanel
                  description="성장률 충격을 배당할인모형에 적용해 가치 변화를 확인합니다."
                  title="성장률 시나리오"
                >
                  {stockScenario ? (
                    <ResponsiveContainer height="100%" width="100%">
                      <LineChart
                        data={stockScenario.series.map((point) => ({
                          ...point,
                          shockLabel: `${(point.growth_shock * 100).toFixed(1)}%p`,
                          valueForChart: point.gordon_growth_value,
                        }))}
                        margin={{ top: 12, right: 16, bottom: 8, left: 8 }}
                      >
                        <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
                        {stockScenario.results.base_gordon_growth_value ? (
                          <ReferenceLine
                            stroke="#94a3b8"
                            y={stockScenario.results.base_gordon_growth_value}
                          />
                        ) : null}
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
                            if (key === "valueForChart") {
                              return [
                                value === null
                                  ? "-"
                                  : formatMoney(Number(value)),
                                "Gordon value",
                              ];
                            }
                            return [value, key];
                          }}
                          labelFormatter={(label) => `성장률 충격 ${label}`}
                        />
                        <Line
                          activeDot={{ r: 5 }}
                          dataKey="valueForChart"
                          dot={{ r: 3 }}
                          stroke="#1f6feb"
                          strokeWidth={3}
                          type="monotone"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart message="가치평가를 실행하면 성장률 시나리오가 표시됩니다." />
                  )}
                </ChartPanel>

                <SummaryPanel title="주식 요약">
                  <SummaryRow
                    label="티커"
                    value={selectedStockInstrument?.ticker ?? "-"}
                  />
                  <SummaryRow
                    label="시가총액"
                    value={
                      stockValuation?.results.market_cap
                        ? formatMoney(stockValuation.results.market_cap)
                        : "-"
                    }
                  />
                  <SummaryRow
                    label="예상 주식 수"
                    value={
                      stockValuation?.results.estimated_shares
                        ? formatNumber(stockValuation.results.estimated_shares, 3)
                        : "-"
                    }
                  />
                  <SummaryRow
                    label="이익수익률"
                    value={
                      stockValuation?.results.earnings_yield !== null &&
                      stockValuation?.results.earnings_yield !== undefined
                        ? formatPercent(stockValuation.results.earnings_yield, 2)
                        : "-"
                    }
                  />
                  <SummaryRow
                    label="요구수익률"
                    value={formatPercent(stockForm.required_return)}
                  />
                  <SummaryRow
                    label="CAPM"
                    value={`${formatPercent(stockForm.risk_free_rate)} + ${formatNumber(
                      stockForm.beta,
                      2,
                    )} x (${formatPercent(stockForm.market_return)} - ${formatPercent(
                      stockForm.risk_free_rate,
                    )})`}
                  />
                  <SummaryRow
                    label="Target Multiple"
                    value={`P/E ${formatNumber(stockForm.target_pe, 1)}, P/B ${formatNumber(
                      stockForm.target_pb,
                      1,
                    )}`}
                  />
                  <SummaryRow
                    label="성장률 범위"
                    value={`${formatPercent(
                      stockForm.growth_rate + stockForm.min_growth_shock,
                    )} ~ ${formatPercent(
                      stockForm.growth_rate + stockForm.max_growth_shock,
                    )}`}
                  />
                </SummaryPanel>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <InterpretationPanel
                  assumptions={stockValuation?.interpretation.assumptions ?? []}
                  summary={
                    stockValuation?.interpretation.summary ??
                    "가치평가를 실행하면 주식 valuation 해석이 표시됩니다."
                  }
                  title="결과 해석"
                />
                <InterpretationPanel
                  assumptions={[
                    `요구수익률 ${formatPercent(stockForm.required_return)}`,
                    `CAPM 요구수익률 ${
                      stockValuation
                        ? formatPercent(
                            stockValuation.results.capm_required_return,
                          )
                        : "계산 전"
                    }`,
                    `성장률 ${formatPercent(stockForm.growth_rate)}`,
                    `Target P/E ${formatNumber(stockForm.target_pe, 1)}, target P/B ${formatNumber(
                      stockForm.target_pb,
                      1,
                    )}`,
                    "성장률이 요구수익률 이상이면 Gordon value는 표시하지 않습니다.",
                  ]}
                  summary="주식 모듈은 자산군 전용 foundation으로 분리했고, 시장위험 VaR는 여러 자산군에서 재사용할 수 있는 공통 구조로 유지합니다."
                  title="자산군 경계"
                />
              </div>

            </section>
          </section>
        ) : activeTab === "portfolio" ? (
          <section className="space-y-4">
            <section className="rounded border border-[#d9dee7] bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">포트폴리오</h2>
                  <p className="mt-1 text-sm text-[#6b7280]">
                    주식과 채권 holding을 함께 넣어 기대수익률, 변동성, VaR, 집중도를 계산합니다.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <NumberField
                    label="보유기간"
                    onChange={(value) =>
                      updatePortfolioRiskForm("holding_period_days", value)
                    }
                    step="1"
                    suffix="일"
                    value={portfolioRiskForm.holding_period_days}
                  />
                  <button
                    className="h-10 rounded bg-[#1f6feb] px-4 text-sm font-semibold text-white transition hover:bg-[#195bc2] disabled:cursor-not-allowed disabled:bg-[#9ab7e6]"
                    disabled={portfolioLoading}
                    onClick={handlePortfolioCalculate}
                    type="button"
                  >
                    {portfolioLoading ? "계산 중..." : "계산"}
                  </button>
                </div>
              </div>

              {portfolioError ? (
                <AlertBox tone="error">{portfolioError}</AlertBox>
              ) : null}

              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <PortfolioInputPanel
                  holdings={portfolioStockHoldings}
                  metricKey="beta"
                  metricLabel="Beta"
                  title="주식 holding"
                  updatePortfolioHolding={updatePortfolioHolding}
                />
                <PortfolioInputPanel
                  holdings={portfolioBondHoldings}
                  metricKey="duration"
                  metricLabel="Duration"
                  title="채권 holding"
                  updatePortfolioHolding={updatePortfolioHolding}
                />
              </div>
            </section>

            <section className="rounded border border-[#d9dee7] bg-white p-4 shadow-sm">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <CompactMetricCard
                  hint="전체 평가금액"
                  label="총 평가금액"
                  value={
                    portfolioAnalysis
                      ? `${formatMoney(portfolioAnalysis.results.total_market_value)} 원`
                      : "-"
                  }
                />
                <CompactMetricCard
                  hint="비중 가중평균"
                  label="기대수익률"
                  value={
                    portfolioAnalysis
                      ? formatPercent(portfolioAnalysis.results.expected_return, 2)
                      : "-"
                  }
                />
                <CompactMetricCard
                  hint="연율 기준"
                  label="추정 변동성"
                  value={
                    portfolioAnalysis
                      ? formatPercent(
                          portfolioAnalysis.results.estimated_volatility,
                          2,
                        )
                      : "-"
                  }
                />
                <CompactMetricCard
                  hint="95% 신뢰수준"
                  label="VaR"
                  value={
                    portfolioAnalysis
                      ? `${formatMoney(portfolioAnalysis.results.var_95)} 원`
                      : "-"
                  }
                />
              </div>

              <div className="mt-3 grid gap-2 text-sm text-[#384252] md:grid-cols-3 xl:grid-cols-6">
                <PortfolioStat
                  label="Portfolio Beta"
                  value={
                    portfolioAnalysis?.results.weighted_beta !== null &&
                    portfolioAnalysis?.results.weighted_beta !== undefined
                      ? formatNumber(portfolioAnalysis.results.weighted_beta, 3)
                      : "-"
                  }
                />
                <PortfolioStat
                  label="Duration"
                  value={
                    portfolioAnalysis?.results.weighted_duration !== null &&
                    portfolioAnalysis?.results.weighted_duration !== undefined
                      ? formatNumber(portfolioAnalysis.results.weighted_duration, 2)
                      : "-"
                  }
                />
                <PortfolioStat
                  label="최대 비중"
                  value={
                    portfolioAnalysis
                      ? formatPercent(portfolioAnalysis.results.largest_weight, 1)
                      : "-"
                  }
                />
                <PortfolioStat
                  label="집중도"
                  value={
                    portfolioAnalysis
                      ? concentrationLabel(
                          portfolioAnalysis.results.concentration_level,
                        )
                      : "-"
                  }
                />
                <PortfolioStat
                  label="99% VaR"
                  value={
                    portfolioAnalysis
                      ? `${formatMoney(portfolioAnalysis.results.var_99)} 원`
                      : "-"
                  }
                />
                <PortfolioStat
                  label="99% 손실률"
                  value={
                    portfolioAnalysis
                      ? formatPercent(portfolioAnalysis.results.loss_percent_99, 2)
                      : "-"
                  }
                />
              </div>
            </section>

            {portfolioAnalysis ? (
              <section className="overflow-hidden rounded border border-[#d9dee7] bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-[#eef1f5] px-4 py-3">
                  <h3 className="text-sm font-semibold text-[#18202a]">분석 결과</h3>
                  <span className="text-xs text-[#6b7280]">
                    {portfolioAnalysis.series.length} holdings
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse text-sm">
                    <thead className="bg-[#f9fafb] text-left text-[#5b6675]">
                      <tr>
                        <th className="px-3 py-2 font-semibold">자산군</th>
                        <th className="px-3 py-2 font-semibold">티커</th>
                        <th className="px-3 py-2 font-semibold">비중</th>
                        <th className="px-3 py-2 font-semibold">Beta</th>
                        <th className="px-3 py-2 font-semibold">Duration</th>
                        <th className="px-3 py-2 font-semibold">변동성</th>
                        <th className="px-3 py-2 font-semibold">기대수익률</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolioAnalysis.series.map((holding) => (
                        <tr
                          className="border-t border-[#eef1f5]"
                          key={holding.instrument_id}
                        >
                          <td className="px-3 py-2">
                            {holding.asset_type === "stock" ? "주식" : "채권"}
                          </td>
                          <td className="px-3 py-2 font-semibold">
                            {holding.instrument_id}
                          </td>
                          <td className="px-3 py-2">
                            {formatPercent(holding.weight, 1)}
                          </td>
                          <td className="px-3 py-2">
                            {holding.beta !== null
                              ? formatNumber(holding.beta, 2)
                              : "-"}
                          </td>
                          <td className="px-3 py-2">
                            {holding.duration !== null
                              ? formatNumber(holding.duration, 2)
                              : "-"}
                          </td>
                          <td className="px-3 py-2">
                            {formatPercent(holding.volatility, 2)}
                          </td>
                          <td className="px-3 py-2">
                            {formatPercent(holding.expected_return, 2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}
          </section>        ) : activeTab === "credit" ? (
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
                  onChange={(value) => updateCreditForm("debt_ratio", value)}
                  step="0.01"
                  suffix="decimal"
                  value={creditForm.debt_ratio}
                />
                <NumberField
                  label="유동비율"
                  onChange={(value) => updateCreditForm("current_ratio", value)}
                  step="0.01"
                  suffix="배"
                  value={creditForm.current_ratio}
                />
                <NumberField
                  label="이자보상배율"
                  onChange={(value) =>
                    updateCreditForm("interest_coverage_ratio", value)
                  }
                  step="0.1"
                  suffix="배"
                  value={creditForm.interest_coverage_ratio}
                />
                <NumberField
                  label="영업이익률"
                  onChange={(value) =>
                    updateCreditForm("operating_margin", value)
                  }
                  step="0.01"
                  suffix="decimal"
                  value={creditForm.operating_margin}
                />
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
                  hint="0점에서 100점 사이의 단순 가중치 점수"
                  label="신용위험 점수"
                  value={
                    creditResult
                      ? `${formatNumber(creditResult.results.score, 2)} 점`
                      : "-"
                  }
                />
                <MetricCard
                  hint="Normal / Watch / Default를 한국어로 표시"
                  label="등급"
                  value={creditResult ? gradeLabel(creditResult.results.grade) : "-"}
                />
                <MetricCard
                  hint="점수에 가장 크게 기여한 항목"
                  label="강점 요인"
                  value={creditResult?.results.strongest_factor ?? "-"}
                />
                <MetricCard
                  hint="점수를 가장 많이 깎아먹은 항목"
                  label="취약 요인"
                  value={creditResult?.results.weakest_factor ?? "-"}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <ChartPanel
                  description="각 재무비율이 신용위험 점수에 얼마나 기여했는지 확인합니다."
                  title="요인별 기여도"
                >
                  {creditResult ? (
                    <ResponsiveContainer height="100%" width="100%">
                      <BarChart
                        data={creditResult.series}
                        margin={{ top: 12, right: 16, bottom: 8, left: 8 }}
                      >
                        <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
                        <XAxis
                          dataKey="factor"
                          tick={{ fill: "#5b6675", fontSize: 12 }}
                        />
                        <YAxis tick={{ fill: "#5b6675", fontSize: 12 }} width={78} />
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
                </ChartPanel>

                <SummaryPanel title="비율 요약">
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
                </SummaryPanel>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <InterpretationPanel
                  assumptions={creditResult?.interpretation.assumptions ?? []}
                  summary={
                    creditResult?.interpretation.summary ??
                    "계산을 실행하면 신용위험 등급과 설명 문구가 표시됩니다."
                  }
                  title="결과 해석"
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
                  onChange={(value) =>
                    updateProjectForm("initial_investment", value)
                  }
                  suffix="원"
                  value={projectForm.initial_investment}
                />
                <NumberField
                  label="할인율"
                  onChange={(value) => updateProjectForm("discount_rate", value)}
                  step="0.001"
                  suffix="decimal"
                  value={projectForm.discount_rate}
                />
                <label className="block text-sm font-medium text-[#384252]">
                  연도별 현금흐름
                  <textarea
                    className="mt-2 min-h-36 w-full rounded border border-[#cfd6e0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f6feb]"
                    onChange={(event) =>
                      updateProjectForm("cash_flows_text", event.target.value)
                    }
                    value={projectForm.cash_flows_text}
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
                  hint="할인율 기준 순현재가치"
                  label="NPV"
                  value={
                    projectResult
                      ? `${formatMoney(projectResult.results.npv)} 원`
                      : "-"
                  }
                />
                <MetricCard
                  hint="내부수익률"
                  label="IRR"
                  value={
                    projectResult?.results.irr !== null &&
                    projectResult?.results.irr !== undefined
                      ? formatPercent(projectResult.results.irr, 2)
                      : "정의되지 않음"
                  }
                />
                <MetricCard
                  hint="부분 연도 보간 포함"
                  label="Payback Period"
                  value={
                    projectResult?.results.payback_period !== null &&
                    projectResult?.results.payback_period !== undefined
                      ? `${formatNumber(projectResult.results.payback_period)} 년`
                      : "회수 불가"
                  }
                />
                <MetricCard
                  hint="전체 기간 종료 시 누적 값"
                  label="최종 누적 현금흐름"
                  value={
                    projectResult
                      ? `${formatMoney(
                          projectResult.results.cumulative_cash_flow_final,
                        )} 원`
                      : "-"
                  }
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <ChartPanel
                  description="연도별 현금흐름과 누적 회수 흐름을 함께 봅니다."
                  title="현금흐름 차트"
                >
                  {projectResult ? (
                    <ResponsiveContainer height="100%" width="100%">
                      <BarChart
                        data={projectResult.series.map((point) => ({
                          ...point,
                          yearLabel: `Y${point.year}`,
                        }))}
                        margin={{ top: 12, right: 16, bottom: 8, left: 8 }}
                      >
                        <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
                        <ReferenceLine stroke="#94a3b8" y={0} />
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
                          dataKey="cumulative_cash_flow"
                          stroke="#ff7a00"
                          strokeWidth={3}
                          type="monotone"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart message="분석을 실행하면 현금흐름 차트가 표시됩니다." />
                  )}
                </ChartPanel>

                <SummaryPanel title="입력 요약">
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
                </SummaryPanel>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <InterpretationPanel
                  assumptions={projectResult?.interpretation.assumptions ?? []}
                  summary={
                    projectResult?.interpretation.summary ??
                    "분석을 실행하면 NPV, IRR, Payback Period에 대한 해석이 표시됩니다."
                  }
                  title="결과 해석"
                />
                <InterpretationPanel
                  assumptions={[
                    `할인율 ${formatPercent(projectForm.discount_rate)}`,
                    "IRR은 현금흐름 패턴에 따라 정의되지 않을 수 있습니다.",
                    "Payback Period는 부분 연도를 보간해 계산합니다.",
                  ]}
                  summary={projectDecisionSummary}
                  title="판단 기준"
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
                    onChange={(event) =>
                      updateMarketForm("asset_type", event.target.value as AssetTypeKey)
                    }
                    value={marketForm.asset_type}
                  >
                    <option value="bond">bond</option>
                    <option value="stock">stock</option>
                  </select>
                </label>
                <NumberField
                  label="포트폴리오 가치"
                  onChange={(value) => updateMarketForm("portfolio_value", value)}
                  suffix="원"
                  value={marketForm.portfolio_value}
                />
                <NumberField
                  label="연율 변동성"
                  onChange={(value) =>
                    updateMarketForm("annualized_volatility", value)
                  }
                  step="0.01"
                  suffix="decimal"
                  value={marketForm.annualized_volatility}
                />
                <NumberField
                  label="보유 기간"
                  onChange={(value) =>
                    updateMarketForm("holding_period_days", value)
                  }
                  step="1"
                  suffix="일"
                  value={marketForm.holding_period_days}
                />
                <label className="block text-sm font-medium text-[#384252]">
                  신뢰수준
                  <select
                    className="mt-2 w-full rounded border border-[#cfd6e0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f6feb]"
                    onChange={(event) =>
                      updateMarketForm(
                        "confidence_level",
                        Number(event.target.value) as 0.9 | 0.95 | 0.99,
                      )
                    }
                    value={String(marketForm.confidence_level)}
                  >
                    <option value="0.9">90%</option>
                    <option value="0.95">95%</option>
                    <option value="0.99">99%</option>
                  </select>
                </label>
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
                  hint="선택한 신뢰수준과 보유 기간 기준 잠재 손실 추정치"
                  label="VaR 금액"
                  value={
                    marketResult
                      ? `${formatMoney(marketResult.results.var_amount)} 원`
                      : "-"
                  }
                />
                <MetricCard
                  hint="포트폴리오 가치 대비 VaR 비율"
                  label="손실률"
                  value={
                    marketResult
                      ? formatPercent(marketResult.results.loss_percent, 2)
                      : "-"
                  }
                />
                <MetricCard
                  hint="제곱근 시간 규칙 적용 후 변동성"
                  label="보유 기간 변동성"
                  value={
                    marketResult
                      ? formatPercent(
                          marketResult.results.holding_period_volatility,
                          2,
                        )
                      : "-"
                  }
                />
                <MetricCard
                  hint="정규분포 신뢰수준 대응 값"
                  label="z-score"
                  value={
                    marketResult ? formatNumber(marketResult.results.z_score, 4) : "-"
                  }
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <ChartPanel
                  description="동일한 포트폴리오 조건에서 신뢰수준에 따라 VaR가 어떻게 커지는지 확인합니다."
                  title="신뢰수준별 VaR"
                >
                  {marketResult ? (
                    <ResponsiveContainer height="100%" width="100%">
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
                </ChartPanel>

                <SummaryPanel title="공통 위험 입력">
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
                </SummaryPanel>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <InterpretationPanel
                  assumptions={marketResult?.interpretation.assumptions ?? []}
                  summary={
                    marketResult?.interpretation.summary ??
                    "계산을 실행하면 VaR 결과와 가정이 표시됩니다."
                  }
                  title="결과 해석"
                />
                <InterpretationPanel
                  assumptions={[
                    `asset_type ${marketForm.asset_type}`,
                    `신뢰수준 ${Math.round(marketForm.confidence_level * 100)}%`,
                    `연율 변동성 ${formatPercent(marketForm.annualized_volatility, 2)}`,
                    "시장위험 VaR는 bond와 future stock 모두에 재사용 가능한 common risk 구조입니다.",
                  ]}
                  summary="VaR는 공통 위험 모듈로 분리되어 있어 자산군이 늘어나도 같은 입력 구조와 API 패턴을 유지할 수 있습니다."
                  title="Multi-Asset 준비도"
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
  const moneyHint =
    suffix === "원" && Number.isFinite(value)
      ? `${formatMoney(value)}원 · ${formatMoneyGuide(value)}`
      : null;

  return (
    <label className="block text-sm font-medium text-[#384252]">
      <div className="flex items-center justify-between gap-3">
        <span>{label}</span>
        {suffix ? (
          <span className="text-xs text-[#7a8492]">
            {suffix === "원" ? formatMoneyGuide(value) : suffix}
          </span>
        ) : null}
      </div>
      <input
        className="mt-2 w-full rounded border border-[#cfd6e0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f6feb]"
        onChange={(event) => onChange(event.target.value)}
        step={step}
        type="number"
        value={value}
      />
      {moneyHint ? (
        <span className="mt-2 block text-xs text-[#7a8492]">{moneyHint}</span>
      ) : null}
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

function CompactMetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded border border-[#d9dee7] bg-[#fbfcfe] p-3">
      <p className="text-xs font-medium text-[#5b6675]">{label}</p>
      <p className="mt-2 text-xl font-bold text-[#111827]">{value}</p>
      <p className="mt-1 text-xs text-[#7a8492]">{hint}</p>
    </div>
  );
}

function PortfolioStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-[#e5e7eb] bg-[#fbfcfe] px-3 py-2">
      <span className="text-xs font-medium text-[#6b7280]">{label}</span>
      <span className="text-sm font-semibold text-[#111827]">{value}</span>
    </div>
  );
}

function PortfolioInputPanel({
  title,
  holdings,
  metricKey,
  metricLabel,
  updatePortfolioHolding,
}: {
  title: string;
  holdings: PortfolioHoldingView[];
  metricKey: "beta" | "duration";
  metricLabel: "Beta" | "Duration";
  updatePortfolioHolding: (
    index: number,
    key: keyof Pick<
      PortfolioHoldingForm,
      "market_value" | "beta" | "duration" | "expected_return" | "volatility"
    >,
    value: string,
  ) => void;
}) {
  return (
    <section className="rounded border border-[#e5e7eb]">
      <div className="flex items-center justify-between border-b border-[#eef1f5] px-3 py-2">
        <h3 className="text-sm font-semibold text-[#18202a]">{title}</h3>
        <span className="text-xs text-[#6b7280]">{holdings.length} holdings</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-sm">
          <thead className="bg-[#f9fafb] text-left text-[#5b6675]">
            <tr>
              <th className="px-3 py-2 font-semibold">티커</th>
              <th className="px-3 py-2 font-semibold">평가금액</th>
              <th className="px-3 py-2 font-semibold">{metricLabel}</th>
              <th className="px-3 py-2 font-semibold">변동성</th>
              <th className="px-3 py-2 font-semibold">기대수익률</th>
            </tr>
          </thead>
          <tbody>
            {holdings.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-sm text-[#7a8492]" colSpan={5}>
                  표시할 holding이 없습니다.
                </td>
              </tr>
            ) : (
              holdings.map(({ holding, sourceIndex }) => (
                <tr className="border-t border-[#eef1f5]" key={holding.ticker}>
                  <td className="px-3 py-2">
                    <div className="font-semibold text-[#111827]">
                      {holding.ticker}
                    </div>
                    <div className="max-w-[160px] truncate text-xs text-[#6b7280]">
                      {holding.name}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full rounded border border-[#cfd6e0] px-2 py-1 text-sm outline-none focus:border-[#1f6feb]"
                      onChange={(event) =>
                        updatePortfolioHolding(
                          sourceIndex,
                          "market_value",
                          event.target.value,
                        )
                      }
                      step="1000000"
                      type="number"
                      value={holding.market_value}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full rounded border border-[#cfd6e0] px-2 py-1 text-sm outline-none focus:border-[#1f6feb]"
                      onChange={(event) =>
                        updatePortfolioHolding(
                          sourceIndex,
                          metricKey,
                          event.target.value,
                        )
                      }
                      step={metricKey === "beta" ? "0.01" : "0.1"}
                      type="number"
                      value={holding[metricKey] ?? ""}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full rounded border border-[#cfd6e0] px-2 py-1 text-sm outline-none focus:border-[#1f6feb]"
                      onChange={(event) =>
                        updatePortfolioHolding(
                          sourceIndex,
                          "volatility",
                          event.target.value,
                        )
                      }
                      step="0.01"
                      type="number"
                      value={holding.volatility}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full rounded border border-[#cfd6e0] px-2 py-1 text-sm outline-none focus:border-[#1f6feb]"
                      onChange={(event) =>
                        updatePortfolioHolding(
                          sourceIndex,
                          "expected_return",
                          event.target.value,
                        )
                      }
                      step="0.001"
                      type="number"
                      value={holding.expected_return}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatusChip({
  label,
  detail,
  status,
}: {
  label: string;
  detail: string;
  status: "ready" | "waiting";
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded border border-[#d9dee7] bg-[#fafbfc] px-3 py-1.5">
      <span
        className={
          status === "ready"
            ? "h-2 w-2 rounded-full bg-[#1b6b3a]"
            : "h-2 w-2 rounded-full bg-[#9aa4b2]"
        }
      />
      <span className="text-xs font-semibold text-[#18202a]">{label}</span>
      <span className="text-xs text-[#6b7280]">{detail}</span>
    </div>
  );
}

function AssetTypePill({ assetType }: { assetType: AssetTypeInfo }) {
  const tone =
    assetType.status === "enabled"
      ? "bg-[#e6f4ea] text-[#1b6b3a]"
      : assetType.status === "planned"
        ? "bg-[#eef2f7] text-[#5b6675]"
        : "bg-[#fde8e6] text-[#a1261a]";

  return (
    <span className={`rounded px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {assetType.label} {assetType.status}
    </span>
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

function SummaryPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded border border-[#d9dee7] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 space-y-3 text-sm text-[#4b5563]">{children}</div>
    </section>
  );
}

function ChartPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded border border-[#d9dee7] bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-[#6b7280]">{description}</p>
      </div>
      <div className="mt-5 h-80">{children}</div>
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


