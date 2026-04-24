import unittest

from fastapi.testclient import TestClient

from main import app


class AssetsAndBondsApiTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_asset_types_include_enabled_bond_and_stock(self) -> None:
        response = self.client.get("/api/assets/types")

        self.assertEqual(response.status_code, 200)
        asset_types = response.json()["asset_types"]

        self.assertIn(
            {"asset_type": "bond", "status": "enabled"},
            [
                {
                    "asset_type": asset_type["asset_type"],
                    "status": asset_type["status"],
                }
                for asset_type in asset_types
            ],
        )
        self.assertIn(
            {"asset_type": "stock", "status": "enabled"},
            [
                {
                    "asset_type": asset_type["asset_type"],
                    "status": asset_type["status"],
                }
                for asset_type in asset_types
            ],
        )

    def test_bond_instruments_returns_sample_bonds(self) -> None:
        response = self.client.get("/api/bonds/instruments")

        self.assertEqual(response.status_code, 200)
        instruments = response.json()["instruments"]

        self.assertGreaterEqual(len(instruments), 3)
        self.assertIn("instrument_id", instruments[0])
        self.assertIn("face_value", instruments[0])
        self.assertIn("coupon_rate", instruments[0])
        self.assertIn("market_yield", instruments[0])

    def test_bond_market_data_returns_selected_instrument(self) -> None:
        instruments = self.client.get("/api/bonds/instruments").json()["instruments"]
        instrument_id = instruments[0]["instrument_id"]

        response = self.client.get(
            "/api/bonds/market-data",
            params={"instrument_id": instrument_id},
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["instrument"]["instrument_id"], instrument_id)
        self.assertEqual(payload["source"], "sample")
        self.assertTrue(payload["fallback_used"])
        self.assertGreaterEqual(len(payload["assumptions"]), 1)

    def test_bond_market_data_returns_404_for_unknown_instrument(self) -> None:
        response = self.client.get(
            "/api/bonds/market-data",
            params={"instrument_id": "missing"},
        )

        self.assertEqual(response.status_code, 404)
        self.assertIn("Unknown bond instrument_id", response.json()["detail"])

    def test_bond_valuation_api_returns_core_metrics(self) -> None:
        response = self.client.post(
            "/api/bonds/valuation",
            json={
                "face_value": 10000,
                "coupon_rate": 0.04,
                "market_yield": 0.045,
                "maturity_years": 5,
                "payment_frequency": 2,
            },
        )

        self.assertEqual(response.status_code, 200)
        results = response.json()["results"]
        self.assertIn("present_value", results)
        self.assertIn("macaulay_duration", results)
        self.assertIn("modified_duration", results)
        self.assertIn("convexity", results)

    def test_bond_scenarios_api_returns_series(self) -> None:
        response = self.client.post(
            "/api/bonds/scenarios",
            json={
                "face_value": 10000,
                "coupon_rate": 0.04,
                "market_yield": 0.045,
                "maturity_years": 5,
                "payment_frequency": 2,
                "min_rate_shock": -0.01,
                "max_rate_shock": 0.01,
                "steps": 5,
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["series"]), 5)

    def test_bond_scenarios_api_rejects_invalid_rate_range(self) -> None:
        response = self.client.post(
            "/api/bonds/scenarios",
            json={
                "face_value": 10000,
                "coupon_rate": 0.04,
                "market_yield": 0.045,
                "maturity_years": 5,
                "payment_frequency": 2,
                "min_rate_shock": 0.02,
                "max_rate_shock": 0.01,
                "steps": 5,
            },
        )

        self.assertEqual(response.status_code, 422)
        self.assertIn("최소 금리 충격", response.json()["detail"])


if __name__ == "__main__":
    unittest.main()
