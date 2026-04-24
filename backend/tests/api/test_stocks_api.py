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


if __name__ == "__main__":
    unittest.main()
