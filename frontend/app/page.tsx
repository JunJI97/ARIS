"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

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
  interpretation: {
    label: string;
    summary: string;
    assumptions: string[];
  };
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
  interpretation: {
    label: string;
    summary: string;
    assumptions: string[];
  };
  series: BondScenarioPoint[];
};

const fallbackForm: BondForm = {
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

function formatMoney(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function toApiPayload(form: BondForm) {
  return {
    face_value: Number(form.face_value),
    coupon_rate: Number(form.coupon_rate),
    market_yield: Number(form.market_yield),
    maturity_years: Number(form.maturity_years),
    payment_frequency: Number(form.payment_frequency),
    investment_amount: Number(form.investment_amount),
  };
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

export default function Home() {
  const [instruments, setInstruments] = useState<BondInstrument[]>([]);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState("");
  const [form, setForm] = useState<BondForm>(fallbackForm);
  const [valuation, setValuation] = useState<BondValuationResponse | null>(null);
  const [scenario, setScenario] = useState<BondScenarioResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedInstrument = useMemo(
    () =>
      instruments.find(
        (instrument) => instrument.instrument_id === selectedInstrumentId,
      ),
    [instruments, selectedInstrumentId],
  );

  useEffect(() => {
    let mounted = true;

    fetchJson<{ instruments: BondInstrument[] }>("/api/bonds/instruments")
      .then((payload) => {
        if (!mounted) {
          return;
        }

        setInstruments(payload.instruments);
        const firstInstrument = payload.instruments[0];

        if (firstInstrument) {
          setSelectedInstrumentId(firstInstrument.instrument_id);
          setForm((current) => ({
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
          setError(`채권 목록을 불러오지 못했습니다. ${caught.message}`);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSelectInstrument(instrumentId: string) {
    setSelectedInstrumentId(instrumentId);
    setError(null);

    try {
      const payload = await fetchJson<{ instrument: BondInstrument }>(
        `/api/bonds/market-data?instrument_id=${encodeURIComponent(instrumentId)}`,
      );
      setForm((current) => ({
        ...current,
        face_value: payload.instrument.face_value,
        coupon_rate: payload.instrument.coupon_rate,
        market_yield: payload.instrument.market_yield,
        maturity_years: payload.instrument.maturity_years,
        payment_frequency: payload.instrument.payment_frequency,
      }));
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "알 수 없는 오류입니다.";
      setError(`채권 데이터를 불러오지 못했습니다. ${message}`);
    }
  }

  async function handleCalculate() {
    setLoading(true);
    setError(null);

    try {
      const valuationPayload = toApiPayload(form);
      const scenarioPayload = {
        ...valuationPayload,
        min_rate_shock: Number(form.min_rate_shock),
        max_rate_shock: Number(form.max_rate_shock),
        steps: Number(form.steps),
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
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "알 수 없는 오류입니다.";
      setError(`계산에 실패했습니다. ${message}`);
    } finally {
      setLoading(false);
    }
  }

  function updateForm(key: keyof BondForm, value: string) {
    setForm((current) => ({
      ...current,
      [key]: Number(value),
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
            <h1 className="mt-1 text-3xl font-bold tracking-normal text-[#111827]">
              ARIS 채권 가치평가
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5b6675]">
              샘플 채권을 선택하고 투자 가정과 금리 충격을 조정해 현재가치,
              Duration, Convexity, 시나리오 가격을 확인합니다.
            </p>
          </div>
          <div className="flex gap-2 text-sm font-medium">
            <span className="border-b-2 border-[#1f6feb] px-3 py-2 text-[#1f4f8f]">
              자산 평가
            </span>
            <span className="px-3 py-2 text-[#7a8492]">신용 위험</span>
            <span className="px-3 py-2 text-[#7a8492]">프로젝트</span>
            <span className="px-3 py-2 text-[#7a8492]">시장 위험</span>
          </div>
        </header>

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
              <p className="mt-2 text-xs leading-5 text-[#6b7280]">
                발행자: {selectedInstrument.issuer} / 통화:{" "}
                {selectedInstrument.currency}
              </p>
            ) : null}

            <div className="mt-5 grid gap-4">
              <NumberField
                label="투자금액"
                value={form.investment_amount}
                onChange={(value) => updateForm("investment_amount", value)}
              />
              <NumberField
                label="액면가"
                value={form.face_value}
                onChange={(value) => updateForm("face_value", value)}
              />
              <NumberField
                label="표면금리"
                step="0.001"
                value={form.coupon_rate}
                onChange={(value) => updateForm("coupon_rate", value)}
              />
              <NumberField
                label="시장수익률"
                step="0.001"
                value={form.market_yield}
                onChange={(value) => updateForm("market_yield", value)}
              />
            </div>

            <details className="mt-5 rounded border border-[#d9dee7] bg-[#fafbfc] p-4">
              <summary className="cursor-pointer text-sm font-semibold">
                고급 설정
              </summary>
              <div className="mt-4 grid gap-4">
                <NumberField
                  label="만기(년)"
                  step="0.5"
                  value={form.maturity_years}
                  onChange={(value) => updateForm("maturity_years", value)}
                />
                <NumberField
                  label="연 지급 횟수"
                  step="1"
                  value={form.payment_frequency}
                  onChange={(value) => updateForm("payment_frequency", value)}
                />
                <NumberField
                  label="최소 금리 충격"
                  step="0.005"
                  value={form.min_rate_shock}
                  onChange={(value) => updateForm("min_rate_shock", value)}
                />
                <NumberField
                  label="최대 금리 충격"
                  step="0.005"
                  value={form.max_rate_shock}
                  onChange={(value) => updateForm("max_rate_shock", value)}
                />
                <NumberField
                  label="시나리오 개수"
                  step="1"
                  value={form.steps}
                  onChange={(value) => updateForm("steps", value)}
                />
              </div>
            </details>

            <button
              className="mt-5 w-full rounded bg-[#1f6feb] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#195bc2] disabled:cursor-not-allowed disabled:bg-[#9ab7e6]"
              disabled={loading}
              onClick={handleCalculate}
            >
              {loading ? "계산 중" : "채권 가치평가 실행"}
            </button>

            {error ? (
              <div className="mt-4 rounded border border-[#f0b4a7] bg-[#fff4f1] p-3 text-sm leading-6 text-[#9f2f1f]">
                {error}
              </div>
            ) : null}
          </aside>

          <section className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="현재가치"
                value={
                  valuation
                    ? `${formatMoney(valuation.results.present_value)} 원`
                    : "-"
                }
                hint="미래 현금흐름의 할인가치"
              />
              <MetricCard
                label="Macaulay Duration"
                value={
                  valuation
                    ? `${valuation.results.macaulay_duration.toFixed(3)} 년`
                    : "-"
                }
                hint="현금흐름 회수시점의 가중평균"
              />
              <MetricCard
                label="Modified Duration"
                value={
                  valuation
                    ? `${valuation.results.modified_duration.toFixed(3)}`
                    : "-"
                }
                hint="금리 변화에 대한 1차 민감도"
              />
              <MetricCard
                label="Convexity"
                value={
                  valuation ? valuation.results.convexity.toFixed(3) : "-"
                }
                hint="금리 변화에 대한 2차 민감도"
              />
            </div>

            <div className="rounded border border-[#d9dee7] bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">금리 시나리오</h2>
                  <p className="mt-1 text-sm text-[#6b7280]">
                    금리 충격별 채권 가격 변화를 비교합니다.
                  </p>
                </div>
                <p className="text-sm font-medium text-[#49627a]">
                  기준가격{" "}
                  {scenario ? `${formatMoney(scenario.results.base_price)} 원` : "-"}
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
                      <XAxis
                        dataKey="shockLabel"
                        tick={{ fill: "#5b6675", fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fill: "#5b6675", fontSize: 12 }}
                        tickFormatter={(value) => formatMoney(Number(value))}
                        width={76}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `${formatMoney(Number(value))} 원`,
                          "가격",
                        ]}
                        labelFormatter={(label) => `금리 충격 ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#1f6feb"
                        strokeWidth={3}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded border border-dashed border-[#cfd6e0] text-sm text-[#7a8492]">
                    계산을 실행하면 시나리오 차트가 표시됩니다.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <InterpretationPanel
                title="결과 해석"
                summary={
                  valuation?.interpretation.summary ??
                  "계산을 실행하면 채권 가치와 민감도에 대한 해석이 표시됩니다."
                }
                assumptions={valuation?.interpretation.assumptions ?? []}
              />
              <InterpretationPanel
                title="입력 가정"
                summary="수익률과 표면금리는 연율 decimal 값을 사용합니다. 모든 계산은 백엔드 API 결과를 기준으로 표시됩니다."
                assumptions={[
                  `표면금리 ${formatPercent(form.coupon_rate)}`,
                  `시장수익률 ${formatPercent(form.market_yield)}`,
                  `금리 충격 ${formatPercent(form.min_rate_shock)} ~ ${formatPercent(
                    form.max_rate_shock,
                  )}`,
                ]}
              />
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = "1",
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
  step?: string;
}) {
  return (
    <label className="block text-sm font-medium text-[#384252]">
      {label}
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
      <p className="mt-3 text-2xl font-bold tracking-normal text-[#111827]">
        {value}
      </p>
      <p className="mt-2 text-xs leading-5 text-[#7a8492]">{hint}</p>
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
