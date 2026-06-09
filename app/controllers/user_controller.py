from fastapi import APIRouter, HTTPException, status

from app.repositories.user_repository import create_volunteer
from app.schemas.system_manager import ApiResponse
from app.schemas.user import VolunteerRegistrationRequest


router = APIRouter(prefix="/api/users", tags=["Users"])


@router.post("/register", response_model=ApiResponse, status_code=201)
def register_volunteer(payload: VolunteerRegistrationRequest):
    try:
        user = create_volunteer(payload.model_dump())
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error

    return ApiResponse(
        success=True,
        message="Volunteer account created successfully.",
        data=user.without_password(),
    )
