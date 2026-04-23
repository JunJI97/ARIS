from app.schemas.bonds import BondInstrument


SAMPLE_BONDS: list[BondInstrument] = [
    BondInstrument(
        instrument_id="kr-gov-3y-001",
        name="Korea Treasury Bond 3Y Sample",
        issuer="Republic of Korea",
        currency="KRW",
        face_value=10_000,
        coupon_rate=0.0325,
        maturity_years=3,
        payment_frequency=2,
        market_yield=0.034,
        credit_rating="AA",
    ),
    BondInstrument(
        instrument_id="kr-corp-aa-5y-001",
        name="Korean Corporate Bond AA 5Y Sample",
        issuer="Sample Manufacturing Co.",
        currency="KRW",
        face_value=10_000,
        coupon_rate=0.041,
        maturity_years=5,
        payment_frequency=2,
        market_yield=0.045,
        credit_rating="AA-",
    ),
    BondInstrument(
        instrument_id="kr-corp-a-7y-001",
        name="Korean Corporate Bond A 7Y Sample",
        issuer="Sample Infrastructure Co.",
        currency="KRW",
        face_value=10_000,
        coupon_rate=0.052,
        maturity_years=7,
        payment_frequency=2,
        market_yield=0.058,
        credit_rating="A",
    ),
]


def list_sample_bonds() -> list[BondInstrument]:
    return SAMPLE_BONDS


def get_sample_bond(instrument_id: str) -> BondInstrument | None:
    return next(
        (bond for bond in SAMPLE_BONDS if bond.instrument_id == instrument_id),
        None,
    )

