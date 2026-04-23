from fastapi import APIRouter

from app.schemas.projects import (
    ProjectFeasibilityRequest,
    ProjectFeasibilityResponse,
)
from app.services.projects import calculate_project_feasibility

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.post("/feasibility", response_model=ProjectFeasibilityResponse)
def post_project_feasibility(
    request: ProjectFeasibilityRequest,
) -> ProjectFeasibilityResponse:
    return calculate_project_feasibility(request)
