from math import sqrt

from app.schemas.bonds import Interpretation
from app.schemas.market_risk import (
    MarketRiskVarPoint,
    MarketRiskVarRequest,
    MarketRiskVarResponse,
    MarketRiskVarResults,
)

TRADING_DAYS_PER_YEAR = 252
Z_SCORE_MAP = {
    0.90: 1.2816,
    0.95: 1.6449,
    0.99: 2.3263,
}


def _round_metric(value: float) -> float:
    return round(value, 6)


def calculate_var_amount(
    portfolio_value: float,
    annualized_volatility: float,
    holding_period_days: int,
    confidence_level: float,
) -> tuple[float, float, float]:
    z_score = Z_SCORE_MAP[confidence_level]
    holding_period_volatility = annualized_volatility * sqrt(
        holding_period_days / TRADING_DAYS_PER_YEAR
    )
    var_amount = portfolio_value * holding_period_volatility * z_score
    loss_percent = holding_period_volatility * z_score
    return var_amount, loss_percent, z_score


def calculate_market_risk_var(
    request: MarketRiskVarRequest,
) -> MarketRiskVarResponse:
    var_amount, loss_percent, z_score = calculate_var_amount(
        request.portfolio_value,
        request.annualized_volatility,
        request.holding_period_days,
        request.confidence_level,
    )

    series = [
        MarketRiskVarPoint(
            confidence_level=level,
            z_score=_round_metric(level_z_score),
            var_amount=_round_metric(level_var_amount),
        )
        for level, level_z_score, level_var_amount in [
            (
                level,
                calculate_var_amount(
                    request.portfolio_value,
                    request.annualized_volatility,
                    request.holding_period_days,
                    level,
                )[2],
                calculate_var_amount(
                    request.portfolio_value,
                    request.annualized_volatility,
                    request.holding_period_days,
                    level,
                )[0],
            )
            for level in (0.90, 0.95, 0.99)
        ]
    ]

    return MarketRiskVarResponse(
        inputs=request,
        results=MarketRiskVarResults(
            var_amount=_round_metric(var_amount),
            loss_percent=_round_metric(loss_percent),
            holding_period_volatility=_round_metric(
                request.annualized_volatility
                * sqrt(request.holding_period_days / TRADING_DAYS_PER_YEAR)
            ),
            z_score=_round_metric(z_score),
        ),
        interpretation=Interpretation(
            label="시장 위험",
            summary=(
                "정규분포와 선택한 신뢰수준을 가정해 보유 기간 동안 발생할 수 있는 "
                "잠재 손실 규모를 추정했습니다."
            ),
            assumptions=[
                "VaR는 과거 분포를 단순화한 분석 추정치이며 실제 손실 한도를 보장하지 않습니다.",
                "변동성은 연율 decimal 값으로 입력하며, 보유 기간 변동성은 제곱근 시간 규칙으로 환산합니다.",
                "신뢰수준 90%, 95%, 99%에 대응하는 정규분포 z-score를 사용합니다.",
                "asset_type 필드는 향후 주식 포트폴리오 VaR 확장을 위한 공통 위험 구조입니다.",
            ],
        ),
        series=series,
    )
