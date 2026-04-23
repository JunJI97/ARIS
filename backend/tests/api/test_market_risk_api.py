import unittest

from fastapi.testclient import TestClient

from main import app


class MarketRiskApiTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_market_risk_var_api_returns_core_metrics(self) -> None:
        response = self.client.post(
            "/api/market-risk/var",
            json={
                "asset_type": "bond",
                "portfolio_value": 1000000,
                "annualized_volatility": 0.15,
                "holding_period_days": 10,
                "confidence_level": 0.95,
            },
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("var_amount", payload["results"])
        self.assertIn("loss_percent", payload["results"])
        self.assertEqual(len(payload["series"]), 3)

    def test_market_risk_var_api_validates_confidence_level(self) -> None:
        response = self.client.post(
            "/api/market-risk/var",
            json={
                "asset_type": "bond",
                "portfolio_value": 1000000,
                "annualized_volatility": 0.15,
                "holding_period_days": 10,
                "confidence_level": 0.92,
            },
        )

        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()
