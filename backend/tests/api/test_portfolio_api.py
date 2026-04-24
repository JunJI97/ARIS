import unittest

from fastapi.testclient import TestClient

from main import app


class PortfolioApiTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_portfolio_analyze_accepts_stock_and_bond_holdings(self) -> None:
        response = self.client.post(
            "/api/portfolio/analyze",
            json={
                "holdings": [
                    {
                        "asset_type": "stock",
                        "instrument_id": "005930.KS",
                        "market_value": 60000000,
                        "expected_return": 0.1,
                        "volatility": 0.2,
                        "beta": 1.1,
                    },
                    {
                        "asset_type": "bond",
                        "instrument_id": "kr-gov-3y-001",
                        "market_value": 40000000,
                        "expected_return": 0.04,
                        "volatility": 0.05,
                        "duration": 2.8,
                    },
                ],
                "holding_period_days": 10,
            },
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["results"]["total_market_value"], 100000000)
        self.assertIn("var_95", payload["results"])
        self.assertEqual(len(payload["series"]), 2)


if __name__ == "__main__":
    unittest.main()
