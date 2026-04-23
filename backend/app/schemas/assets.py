from typing import Literal

from pydantic import BaseModel


class AssetType(BaseModel):
    asset_type: Literal["bond", "stock"]
    label: str
    status: Literal["enabled", "planned", "disabled"]
    description: str


class AssetTypesResponse(BaseModel):
    asset_types: list[AssetType]

