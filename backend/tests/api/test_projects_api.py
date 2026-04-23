import unittest

from fastapi.testclient import TestClient

from main import app


class ProjectsApiTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_project_feasibility_api_returns_core_metrics(self) -> None:
        response = self.client.post(
            "/api/projects/feasibility",
            json={
                "initial_investment": 1000,
                "discount_rate": 0.1,
                "cash_flows": [500, 500, 300],
            },
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("npv", payload["results"])
        self.assertIn("irr", payload["results"])
        self.assertIn("payback_period", payload["results"])
        self.assertGreaterEqual(len(payload["series"]), 2)

    def test_project_feasibility_api_validates_required_input(self) -> None:
        response = self.client.post(
            "/api/projects/feasibility",
            json={
                "initial_investment": 1000,
                "discount_rate": 0.1,
                "cash_flows": [],
            },
        )

        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()
