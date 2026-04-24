import unittest

from app.schemas.portfolio import PortfolioAnalyzeRequest, PortfolioHoldingRequest
from app.services.portfolio import analyze_portfolio


class PortfolioServiceTest(unittest.TestCase):
    def test_multi_asset_portfolio_returns_weighted_metrics(self) -> None:
        request = PortfolioAnalyzeRequest(
            holdings=[
                PortfolioHoldingRequest(
                    asset_type="stock",
                    instrument_id="005930.KS",
                    market_value=60,
                    expected_return=0.1,
                    volatility=0.2,
                    beta=1.1,
                ),
                PortfolioHoldingRequest(
                    asset_type="bond",
                    instrument_id="kr-gov-3y-001",
                    market_value=40,
                    expected_return=0.04,
                    volatility=0.05,
                    duration=2.8,
                ),
            ],
            holding_period_days=10,
        )

        result = analyze_portfolio(request)

        self.assertEqual(result.results.total_market_value, 100)
        self.assertEqual(result.results.expected_return, 0.076)
        self.assertEqual(result.results.weighted_beta, 1.1)
        self.assertEqual(result.results.weighted_duration, 2.8)
        self.assertEqual(result.results.concentration_level, "high")
        self.assertGreater(result.results.var_95, 0)
        self.assertGreater(result.results.var_99, result.results.var_95)


if __name__ == "__main__":
    unittest.main()
