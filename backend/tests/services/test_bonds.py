import unittest

from app.schemas.bonds import BondScenarioRequest, BondValuationRequest
from app.services.bonds import calculate_bond_scenarios, calculate_bond_valuation


class BondServiceTest(unittest.TestCase):
    def test_zero_coupon_bond_still_returns_valid_metrics(self) -> None:
        request = BondValuationRequest(
            face_value=10_000,
            coupon_rate=0.0,
            market_yield=0.035,
            maturity_years=3,
            payment_frequency=2,
        )

        result = calculate_bond_valuation(request)

        self.assertGreater(result.results.present_value, 0)
        self.assertGreater(result.results.macaulay_duration, 0)
        self.assertGreater(result.results.convexity, 0)

    def test_price_falls_when_market_yield_rises(self) -> None:
        base = BondValuationRequest(
            face_value=10_000,
            coupon_rate=0.04,
            market_yield=0.04,
            maturity_years=5,
            payment_frequency=2,
        )
        shocked = BondValuationRequest(
            face_value=10_000,
            coupon_rate=0.04,
            market_yield=0.05,
            maturity_years=5,
            payment_frequency=2,
        )

        base_result = calculate_bond_valuation(base)
        shocked_result = calculate_bond_valuation(shocked)

        self.assertLess(
            shocked_result.results.present_value,
            base_result.results.present_value,
        )

    def test_modified_duration_is_less_than_macaulay_duration(self) -> None:
        request = BondValuationRequest(
            face_value=10_000,
            coupon_rate=0.04,
            market_yield=0.05,
            maturity_years=5,
            payment_frequency=2,
        )

        result = calculate_bond_valuation(request)

        self.assertLess(
            result.results.modified_duration,
            result.results.macaulay_duration,
        )

    def test_scenarios_return_multiple_ordered_price_points(self) -> None:
        request = BondScenarioRequest(
            face_value=10_000,
            coupon_rate=0.04,
            market_yield=0.04,
            maturity_years=5,
            payment_frequency=2,
            min_rate_shock=-0.01,
            max_rate_shock=0.01,
            steps=5,
        )

        result = calculate_bond_scenarios(request)

        self.assertEqual(len(result.series), 5)
        self.assertGreater(result.series[0].price, result.series[-1].price)

    def test_estimated_units_are_returned_when_investment_amount_exists(self) -> None:
        request = BondValuationRequest(
            face_value=10_000,
            coupon_rate=0.04,
            market_yield=0.04,
            maturity_years=5,
            payment_frequency=2,
            investment_amount=1_000_000,
        )

        result = calculate_bond_valuation(request)

        self.assertIsNotNone(result.results.estimated_units)
        self.assertGreater(result.results.estimated_units or 0, 0)

    def test_invalid_scenario_range_raises_value_error(self) -> None:
        request = BondScenarioRequest(
            face_value=10_000,
            coupon_rate=0.04,
            market_yield=0.04,
            maturity_years=5,
            payment_frequency=2,
            min_rate_shock=0.02,
            max_rate_shock=0.01,
            steps=5,
        )

        with self.assertRaises(ValueError):
            calculate_bond_scenarios(request)


if __name__ == "__main__":
    unittest.main()
