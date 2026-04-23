import unittest

from fastapi.testclient import TestClient

from main import app


class AssetsAndBondsApiTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_asset_types_include_enabled_bond_and_planned_stock(self) -> None:
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
            {"asset_type": "stock", "status": "planned"},
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


if __name__ == "__main__":
    unittest.main()
