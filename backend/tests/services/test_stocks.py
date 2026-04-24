import unittest

from app.schemas.stocks import StockScenarioRequest, StockValuationRequest
from app.services.stocks import calculate_stock_scenarios, calculate_stock_valuation


class StockServiceTest(unittest.TestCase):
    def test_stock_valuation_returns_core_metrics(self) -> None:
        request = StockValuationRequest(
            current_price=100,
            eps=8,
            book_value_per_share=50,
            dividend_per_share=2,
            required_return=0.09,
            beta=1.1,
            risk_free_rate=0.03,
            market_return=0.08,
            growth_rate=0.03,
            target_pe=14,
            target_pb=1.8,
            shares_outstanding=1_000_000,
            investment_amount=10_000,
        )

        result = calculate_stock_valuation(request)

        self.assertEqual(result.results.price_to_earnings, 12.5)
        self.assertEqual(result.results.price_to_book, 2.0)
        self.assertEqual(result.results.dividend_yield, 0.02)
        self.assertEqual(result.results.estimated_shares, 100)
        self.assertEqual(result.results.capm_required_return, 0.085)
        self.assertEqual(result.results.effective_required_return, 0.09)
        self.assertEqual(result.results.fair_value_by_pe, 112)
        self.assertEqual(result.results.fair_value_by_pb, 90)
        self.assertEqual(result.results.upside_by_pe, 0.12)
        self.assertEqual(result.results.upside_by_pb, -0.1)
        self.assertGreater(result.results.gordon_growth_value or 0, 0)

    def test_stock_valuation_uses_capm_when_required_return_is_missing(self) -> None:
        request = StockValuationRequest(
            current_price=100,
            eps=8,
            book_value_per_share=50,
            dividend_per_share=2,
            beta=1.2,
            risk_free_rate=0.03,
            market_return=0.08,
            growth_rate=0.03,
        )

        result = calculate_stock_valuation(request)

        self.assertEqual(result.results.capm_required_return, 0.09)
        self.assertEqual(result.results.effective_required_return, 0.09)

    def test_gordon_value_is_null_when_growth_exceeds_required_return(self) -> None:
        request = StockValuationRequest(
            current_price=100,
            eps=8,
            book_value_per_share=50,
            dividend_per_share=2,
            required_return=0.04,
            growth_rate=0.05,
        )

        result = calculate_stock_valuation(request)

        self.assertIsNone(result.results.gordon_growth_value)

    def test_scenarios_return_growth_series(self) -> None:
        request = StockScenarioRequest(
            current_price=100,
            eps=8,
            book_value_per_share=50,
            dividend_per_share=2,
            required_return=0.09,
            beta=1.0,
            growth_rate=0.03,
            min_growth_shock=-0.01,
            max_growth_shock=0.01,
            steps=5,
        )

        result = calculate_stock_scenarios(request)

        self.assertEqual(len(result.series), 5)
        self.assertLess(
            result.series[0].gordon_growth_value or 0,
            result.series[-1].gordon_growth_value or 0,
        )

    def test_invalid_scenario_range_raises_value_error(self) -> None:
        request = StockScenarioRequest(
            current_price=100,
            eps=8,
            book_value_per_share=50,
            dividend_per_share=2,
            required_return=0.09,
            growth_rate=0.03,
            min_growth_shock=0.02,
            max_growth_shock=0.01,
            steps=5,
        )

        with self.assertRaises(ValueError):
            calculate_stock_scenarios(request)


if __name__ == "__main__":
    unittest.main()
