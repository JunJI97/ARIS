import unittest

from fastapi.testclient import TestClient

from main import app


class StocksApiTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_stock_instruments_returns_sample_stocks(self) -> None:
        response = self.client.get("/api/stocks/instruments")

        self.assertEqual(response.status_code, 200)
        instruments = response.json()["instruments"]

        self.assertGreaterEqual(len(instruments), 3)
        self.assertIn("instrument_id", instruments[0])
        self.assertIn("ticker", instruments[0])
        self.assertIn("last_price", instruments[0])
        self.assertIn("eps_ttm", instruments[0])

    def test_stock_market_data_returns_selected_instrument(self) -> None:
        instruments = self.client.get("/api/stocks/instruments").json()["instruments"]
        instrument_id = instruments[0]["instrument_id"]

        response = self.client.get(
            "/api/stocks/market-data",
            params={"instrument_id": instrument_id},
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["instrument"]["instrument_id"], instrument_id)
        self.assertEqual(payload["source"], "sample")
        self.assertTrue(payload["fallback_used"])

    def test_stock_market_data_returns_404_for_unknown_instrument(self) -> None:
        response = self.client.get(
            "/api/stocks/market-data",
            params={"instrument_id": "missing"},
        )

        self.assertEqual(response.status_code, 404)
        self.assertIn("Unknown stock instrument_id", response.json()["detail"])

    def test_stock_search_uses_market_data_provider(self) -> None:
        from app.api import stocks
        from app.schemas.stocks import StockInstrument

        original_search = stocks.search_yahoo_stocks
        stocks.search_yahoo_stocks = lambda query: [
            StockInstrument(
                instrument_id="yahoo:AAPL",
                ticker="AAPL",
                name="Apple Inc.",
                exchange="NasdaqGS",
                currency="USD",
                last_price=273.43,
                shares_outstanding=1_000_000,
                eps_ttm=15.0,
                book_value_per_share=65.0,
                dividend_per_share=1.64,
                beta=1.0,
                expected_growth_rate=0.04,
            )
        ]
        try:
            response = self.client.get("/api/stocks/search", params={"query": "AAPL"})
        finally:
            stocks.search_yahoo_stocks = original_search

        self.assertEqual(response.status_code, 200)
        instruments = response.json()["instruments"]
        self.assertEqual(instruments[0]["instrument_id"], "yahoo:AAPL")
        self.assertEqual(instruments[0]["ticker"], "AAPL")

    def test_yahoo_stock_market_data_has_external_source(self) -> None:
        from app.api import stocks
        from app.schemas.stocks import StockInstrument
        from app.services.market_data import StockMarketDataResult

        original_get = stocks.get_yahoo_stock_result
        stocks.get_yahoo_stock_result = lambda instrument_id: StockMarketDataResult(
            fundamentals_source="placeholder",
            instrument=StockInstrument(
                instrument_id=instrument_id,
                ticker="AAPL",
                name="Apple Inc.",
                exchange="NasdaqGS",
                currency="USD",
                last_price=273.43,
                shares_outstanding=1_000_000,
                eps_ttm=15.0,
                book_value_per_share=65.0,
                dividend_per_share=1.64,
                beta=1.0,
                expected_growth_rate=0.04,
            ),
        )
        try:
            response = self.client.get(
                "/api/stocks/market-data",
                params={"instrument_id": "yahoo:AAPL"},
            )
        finally:
            stocks.get_yahoo_stock_result = original_get

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["source"], "yahoo-finance-chart+placeholder")
        self.assertFalse(payload["fallback_used"])

    def test_yahoo_stock_market_data_uses_fundamentals_provider_when_available(
        self,
    ) -> None:
        from app.api import stocks
        from app.schemas.stocks import StockInstrument
        from app.services.market_data import StockMarketDataResult

        original_get = stocks.get_yahoo_stock_result
        stocks.get_yahoo_stock_result = lambda instrument_id: StockMarketDataResult(
            fundamentals_source="alpha-vantage-overview",
            instrument=StockInstrument(
                instrument_id=instrument_id,
                ticker="AAPL",
                name="Apple Inc.",
                exchange="NasdaqGS",
                currency="USD",
                last_price=273.43,
                shares_outstanding=15_000_000_000,
                eps_ttm=7.5,
                book_value_per_share=4.5,
                dividend_per_share=1.08,
                beta=1.2,
                expected_growth_rate=0.05,
            ),
        )
        try:
            response = self.client.get(
                "/api/stocks/market-data",
                params={"instrument_id": "yahoo:AAPL"},
            )
        finally:
            stocks.get_yahoo_stock_result = original_get

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["source"], "yahoo-finance-chart+alpha-vantage-overview")
        self.assertIn("Alpha Vantage", payload["assumptions"][-1])

    def test_stock_valuation_api_returns_core_metrics(self) -> None:
        response = self.client.post(
            "/api/stocks/valuation",
            json={
                "current_price": 100,
                "eps": 8,
                "book_value_per_share": 50,
                "dividend_per_share": 2,
                "beta": 1.1,
                "risk_free_rate": 0.03,
                "market_return": 0.08,
                "growth_rate": 0.03,
                "target_pe": 14,
                "target_pb": 1.8,
            },
        )

        self.assertEqual(response.status_code, 200)
        results = response.json()["results"]
        self.assertIn("price_to_earnings", results)
        self.assertIn("price_to_book", results)
        self.assertIn("dividend_yield", results)
        self.assertIn("capm_required_return", results)
        self.assertIn("fair_value_by_pe", results)
        self.assertIn("fair_value_by_pb", results)
        self.assertIn("gordon_growth_value", results)

    def test_stock_scenarios_api_returns_series(self) -> None:
        response = self.client.post(
            "/api/stocks/scenarios",
            json={
                "current_price": 100,
                "eps": 8,
                "book_value_per_share": 50,
                "dividend_per_share": 2,
                "required_return": 0.09,
                "growth_rate": 0.03,
                "min_growth_shock": -0.01,
                "max_growth_shock": 0.01,
                "steps": 5,
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["series"]), 5)

    def test_stock_scenarios_api_rejects_invalid_growth_range(self) -> None:
        response = self.client.post(
            "/api/stocks/scenarios",
            json={
                "current_price": 100,
                "eps": 8,
                "book_value_per_share": 50,
                "dividend_per_share": 2,
                "required_return": 0.09,
                "growth_rate": 0.03,
                "min_growth_shock": 0.02,
                "max_growth_shock": 0.01,
                "steps": 5,
            },
        )

        self.assertEqual(response.status_code, 422)
        self.assertIn("min_growth_shock", response.json()["detail"])

    def test_stock_portfolio_api_returns_weighted_metrics(self) -> None:
        response = self.client.post(
            "/api/stocks/portfolio",
            json={
                "holdings": [
                    {
                        "ticker": "AAA",
                        "market_value": 600000,
                        "beta": 1.2,
                        "expected_return": 0.1,
                    },
                    {
                        "ticker": "BBB",
                        "market_value": 400000,
                        "beta": 0.8,
                        "expected_return": 0.06,
                    },
                ],
                "market_volatility": 0.2,
                "holding_period_days": 10,
            },
        )

        self.assertEqual(response.status_code, 200)
        results = response.json()["results"]
        self.assertEqual(results["total_market_value"], 1000000)
        self.assertEqual(results["portfolio_beta"], 1.04)
        self.assertEqual(results["expected_return"], 0.084)
        self.assertIn("var_95", results)
        self.assertIn("var_99", results)
        self.assertIn("deprecated", response.json()["interpretation"]["label"])
        self.assertEqual(len(response.json()["series"]), 2)


if __name__ == "__main__":
    unittest.main()
