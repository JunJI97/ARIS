import unittest

from fastapi.testclient import TestClient

from main import app


class CreditRiskApiTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_credit_risk_score_api_returns_score_and_grade(self) -> None:
        response = self.client.post(
            "/api/credit-risk/score",
            json={
                "debt_ratio": 0.48,
                "current_ratio": 1.7,
                "interest_coverage_ratio": 4.2,
                "operating_margin": 0.09,
            },
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("score", payload["results"])
        self.assertIn("grade", payload["results"])
        self.assertEqual(len(payload["series"]), 4)

    def test_credit_risk_score_api_validates_out_of_range_input(self) -> None:
        response = self.client.post(
            "/api/credit-risk/score",
            json={
                "debt_ratio": 3.0,
                "current_ratio": 1.7,
                "interest_coverage_ratio": 4.2,
                "operating_margin": 0.09,
            },
        )

        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()
