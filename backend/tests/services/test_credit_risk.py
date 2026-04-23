import unittest

from app.schemas.credit_risk import CreditRiskScoreRequest
from app.services.credit_risk import calculate_credit_risk_score


class CreditRiskServiceTest(unittest.TestCase):
    def test_stronger_ratios_produce_higher_score(self) -> None:
        strong = CreditRiskScoreRequest(
            debt_ratio=0.35,
            current_ratio=2.1,
            interest_coverage_ratio=6.5,
            operating_margin=0.18,
        )
        weak = CreditRiskScoreRequest(
            debt_ratio=0.95,
            current_ratio=0.9,
            interest_coverage_ratio=1.2,
            operating_margin=0.01,
        )

        strong_result = calculate_credit_risk_score(strong)
        weak_result = calculate_credit_risk_score(weak)

        self.assertGreater(strong_result.results.score, weak_result.results.score)
        self.assertEqual(strong_result.results.grade, "Normal")

    def test_weak_profile_can_fall_to_default_grade(self) -> None:
        request = CreditRiskScoreRequest(
            debt_ratio=1.1,
            current_ratio=0.7,
            interest_coverage_ratio=0.8,
            operating_margin=-0.05,
        )

        result = calculate_credit_risk_score(request)

        self.assertEqual(result.results.grade, "Default")
        self.assertLess(result.results.score, 40)

    def test_contributions_include_all_factors(self) -> None:
        request = CreditRiskScoreRequest(
            debt_ratio=0.5,
            current_ratio=1.4,
            interest_coverage_ratio=3.0,
            operating_margin=0.08,
        )

        result = calculate_credit_risk_score(request)

        self.assertEqual(len(result.series), 4)
        self.assertIn(result.results.strongest_factor, [item.factor for item in result.series])
        self.assertIn(result.results.weakest_factor, [item.factor for item in result.series])


if __name__ == "__main__":
    unittest.main()
