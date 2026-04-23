from app.schemas.bonds import (
    BondScenarioPoint,
    BondScenarioRequest,
    BondScenarioResponse,
    BondValuationRequest,
    BondValuationResponse,
    BondValuationResults,
    Interpretation,
)


def _round_money(value: float) -> float:
    return round(value, 2)


def _round_metric(value: float) -> float:
    return round(value, 6)


def build_cash_flows(
    face_value: float,
    coupon_rate: float,
    maturity_years: float,
    payment_frequency: int,
) -> list[tuple[float, float]]:
    periods = max(1, round(maturity_years * payment_frequency))
    coupon_payment = face_value * coupon_rate / payment_frequency
    cash_flows: list[tuple[float, float]] = []

    for period in range(1, periods + 1):
        time_years = period / payment_frequency
        amount = coupon_payment
        if period == periods:
            amount += face_value
        cash_flows.append((time_years, amount))

    return cash_flows


def calculate_bond_price(request: BondValuationRequest) -> float:
    periodic_yield = request.market_yield / request.payment_frequency
    present_value = 0.0

    for period, (_, cash_flow) in enumerate(
        build_cash_flows(
            request.face_value,
            request.coupon_rate,
            request.maturity_years,
            request.payment_frequency,
        ),
        start=1,
    ):
        present_value += cash_flow / ((1 + periodic_yield) ** period)

    return present_value


def calculate_bond_valuation(
    request: BondValuationRequest,
) -> BondValuationResponse:
    cash_flows = build_cash_flows(
        request.face_value,
        request.coupon_rate,
        request.maturity_years,
        request.payment_frequency,
    )
    periodic_yield = request.market_yield / request.payment_frequency
    present_value = 0.0
    weighted_time_sum = 0.0
    convexity_sum = 0.0

    for period, (time_years, cash_flow) in enumerate(cash_flows, start=1):
        discount_factor = (1 + periodic_yield) ** period
        discounted_cash_flow = cash_flow / discount_factor
        present_value += discounted_cash_flow
        weighted_time_sum += time_years * discounted_cash_flow
        convexity_sum += (
            discounted_cash_flow
            * period
            * (period + 1)
            / ((1 + periodic_yield) ** 2)
        )

    macaulay_duration = weighted_time_sum / present_value
    modified_duration = macaulay_duration / (1 + periodic_yield)
    convexity = convexity_sum / (present_value * request.payment_frequency**2)
    estimated_units = (
        request.investment_amount / present_value
        if request.investment_amount is not None
        else None
    )

    return BondValuationResponse(
        inputs=request,
        results=BondValuationResults(
            present_value=_round_money(present_value),
            macaulay_duration=_round_metric(macaulay_duration),
            modified_duration=_round_metric(modified_duration),
            convexity=_round_metric(convexity),
            estimated_units=(
                _round_metric(estimated_units) if estimated_units is not None else None
            ),
        ),
        interpretation=Interpretation(
            label="Bond valuation",
            summary=(
                "Discounted coupon and principal cash flows are used to calculate "
                "present value and interest-rate sensitivity."
            ),
            assumptions=[
                "coupon_rate and market_yield are annual decimal rates.",
                "Macaulay Duration is the weighted average cash-flow timing.",
                "Modified Duration adjusts Macaulay Duration by periodic yield.",
                "Convexity is calculated from discounted cash flows.",
            ],
        ),
    )


def calculate_bond_scenarios(
    request: BondScenarioRequest,
) -> BondScenarioResponse:
    if request.min_rate_shock >= request.max_rate_shock:
        raise ValueError("min_rate_shock must be lower than max_rate_shock")

    shock_interval = (request.max_rate_shock - request.min_rate_shock) / (
        request.steps - 1
    )
    series: list[BondScenarioPoint] = []

    for index in range(request.steps):
        rate_shock = request.min_rate_shock + shock_interval * index
        shocked_yield = max(0.0, request.market_yield + rate_shock)
        price = calculate_bond_price(
            BondValuationRequest(
                face_value=request.face_value,
                coupon_rate=request.coupon_rate,
                market_yield=shocked_yield,
                maturity_years=request.maturity_years,
                payment_frequency=request.payment_frequency,
                investment_amount=request.investment_amount,
            )
        )
        series.append(
            BondScenarioPoint(
                rate_shock=_round_metric(rate_shock),
                market_yield=_round_metric(shocked_yield),
                price=_round_money(price),
            )
        )

    base_price = calculate_bond_price(request)

    return BondScenarioResponse(
        inputs=request,
        results={"base_price": _round_money(base_price)},
        interpretation=Interpretation(
            label="Rate scenario",
            summary=(
                "Bond prices are recalculated across rate shocks. In general, "
                "bond prices fall when market yields rise."
            ),
            assumptions=[
                "Each scenario changes only market_yield and keeps cash flows fixed.",
                "Negative shocked yields are floored at zero for the MVP.",
            ],
        ),
        series=series,
    )
