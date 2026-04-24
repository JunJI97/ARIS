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

    def test_bond_search_uses_treasury_provider(self) -> None:
        from app.api import bonds
        from app.schemas.bonds import BondInstrument

        original_list = bonds.list_treasury_bonds
        bonds.list_treasury_bonds = lambda query: [
            BondInstrument(
                instrument_id="treasury:bc_10year",
                name="U.S. Treasury 10Y Par Yield",
                issuer="U.S. Department of the Treasury",
                currency="USD",
                face_value=10000,
                coupon_rate=0.0434,
                maturity_years=10,
                payment_frequency=2,
                market_yield=0.0434,
                credit_rating="AA+",
            )
        ]
        try:
            response = self.client.get("/api/bonds/search", params={"query": "10y"})
        finally:
            bonds.list_treasury_bonds = original_list

        self.assertEqual(response.status_code, 200)
        instruments = response.json()["instruments"]
        self.assertEqual(instruments[0]["instrument_id"], "treasury:bc_10year")
        self.assertEqual(instruments[0]["issuer"], "U.S. Department of the Treasury")

    def test_treasury_bond_market_data_has_external_source(self) -> None:
        from app.api import bonds
        from app.schemas.bonds import BondInstrument

        original_get = bonds.get_treasury_bond
        bonds.get_treasury_bond = lambda instrument_id: BondInstrument(
            instrument_id=instrument_id,
            name="U.S. Treasury 10Y Par Yield",
            issuer="U.S. Department of the Treasury",
            currency="USD",
            face_value=10000,
            coupon_rate=0.0434,
            maturity_years=10,
            payment_frequency=2,
            market_yield=0.0434,
            credit_rating="AA+",
        )
        try:
            response = self.client.get(
                "/api/bonds/market-data",
                params={"instrument_id": "treasury:bc_10year"},
            )
        finally:
            bonds.get_treasury_bond = original_get

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["source"], "us-treasury-yield-curve")
        self.assertFalse(payload["fallback_used"])

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
