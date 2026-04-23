import unittest

from app.schemas.projects import ProjectFeasibilityRequest
from app.services.projects import calculate_project_feasibility


class ProjectServiceTest(unittest.TestCase):
    def test_npv_decreases_when_discount_rate_rises(self) -> None:
        base = ProjectFeasibilityRequest(
            initial_investment=1000,
            discount_rate=0.08,
            cash_flows=[400, 400, 400],
        )
        shocked = ProjectFeasibilityRequest(
            initial_investment=1000,
            discount_rate=0.12,
            cash_flows=[400, 400, 400],
        )

        base_result = calculate_project_feasibility(base)
        shocked_result = calculate_project_feasibility(shocked)

        self.assertLess(shocked_result.results.npv, base_result.results.npv)

    def test_project_result_returns_defined_irr_for_valid_cash_flows(self) -> None:
        request = ProjectFeasibilityRequest(
            initial_investment=1000,
            discount_rate=0.1,
            cash_flows=[600, 600, 300],
        )

        result = calculate_project_feasibility(request)

        self.assertIsNotNone(result.results.irr)

    def test_project_result_returns_none_irr_for_invalid_pattern(self) -> None:
        request = ProjectFeasibilityRequest(
            initial_investment=1000,
            discount_rate=0.1,
            cash_flows=[0, 0, 0],
        )

        result = calculate_project_feasibility(request)

        self.assertIsNone(result.results.irr)

    def test_payback_period_supports_partial_year_interpolation(self) -> None:
        request = ProjectFeasibilityRequest(
            initial_investment=1000,
            discount_rate=0.1,
            cash_flows=[300, 500, 400],
        )

        result = calculate_project_feasibility(request)

        self.assertIsNotNone(result.results.payback_period)
        self.assertGreater(result.results.payback_period or 0, 2.0)
        self.assertLess(result.results.payback_period or 0, 3.0)


if __name__ == "__main__":
    unittest.main()
