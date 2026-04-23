import unittest

from app.schemas.bonds import BondScenarioRequest, BondValuationRequest
from app.services.bonds import calculate_bond_scenarios, calculate_bond_valuation


class BondServiceTest(unittest.TestCase):
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


if __name__ == "__main__":
    unittest.main()
