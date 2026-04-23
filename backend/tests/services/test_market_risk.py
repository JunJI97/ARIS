import unittest

from app.schemas.market_risk import MarketRiskVarRequest
from app.services.market_risk import calculate_market_risk_var


class MarketRiskServiceTest(unittest.TestCase):
    def test_var_increases_with_portfolio_value(self) -> None:
        base = MarketRiskVarRequest(
            asset_type="bond",
            portfolio_value=1_000_000,
            annualized_volatility=0.12,
            holding_period_days=10,
            confidence_level=0.95,
        )
        larger = MarketRiskVarRequest(
            asset_type="bond",
            portfolio_value=2_000_000,
            annualized_volatility=0.12,
            holding_period_days=10,
            confidence_level=0.95,
        )

        base_result = calculate_market_risk_var(base)
        larger_result = calculate_market_risk_var(larger)

        self.assertGreater(larger_result.results.var_amount, base_result.results.var_amount)

    def test_var_increases_with_volatility(self) -> None:
        low = MarketRiskVarRequest(
            asset_type="bond",
            portfolio_value=1_000_000,
            annualized_volatility=0.08,
            holding_period_days=10,
            confidence_level=0.95,
        )
        high = MarketRiskVarRequest(
            asset_type="bond",
            portfolio_value=1_000_000,
            annualized_volatility=0.2,
            holding_period_days=10,
            confidence_level=0.95,
        )

        low_result = calculate_market_risk_var(low)
        high_result = calculate_market_risk_var(high)

        self.assertGreater(high_result.results.var_amount, low_result.results.var_amount)

    def test_series_returns_three_confidence_scenarios(self) -> None:
        request = MarketRiskVarRequest(
            asset_type="stock",
            portfolio_value=1_500_000,
            annualized_volatility=0.18,
            holding_period_days=5,
            confidence_level=0.95,
        )

        result = calculate_market_risk_var(request)

        self.assertEqual(len(result.series), 3)
        self.assertEqual([point.confidence_level for point in result.series], [0.9, 0.95, 0.99])


if __name__ == "__main__":
    unittest.main()
