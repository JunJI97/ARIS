from fastapi import APIRouter

from app.schemas.assets import AssetType, AssetTypesResponse

router = APIRouter(prefix="/api/assets", tags=["assets"])


@router.get("/types", response_model=AssetTypesResponse)
def get_asset_types() -> AssetTypesResponse:
    return AssetTypesResponse(
        asset_types=[
            AssetType(
                asset_type="bond",
                label="채권",
                status="enabled",
                description="MVP에서 가치평가와 금리 민감도 분석을 지원합니다.",
            ),
            AssetType(
                asset_type="stock",
                label="주식",
                status="planned",
                description="MVP 이후 포트폴리오 위험 분석 확장을 위해 예약된 자산군입니다.",
            ),
        ]
    )

