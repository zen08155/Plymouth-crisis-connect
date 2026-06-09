from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.auth import (
    create_session,
    require_authenticated_user,
    revoke_session,
)
from app.repositories.user_repository import authenticate_user, get_user_by_id
from app.schemas.system_manager import ApiResponse, LoginRequest


router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer()


@router.post("/login", response_model=ApiResponse)
def login(payload: LoginRequest):
    user = authenticate_user(payload.email, payload.password)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_session(user.user_id)
    return ApiResponse(
        success=True,
        message="Logged in successfully.",
        data={"token": token, "user": user.without_password()},
    )


@router.get("/me", response_model=ApiResponse)
def current_user(user_id: int = Depends(require_authenticated_user)):
    user = get_user_by_id(user_id)
    return ApiResponse(
        success=True,
        message="Current user loaded.",
        data=user.without_password(),
    )


@router.post("/logout", response_model=ApiResponse)
def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    user_id: int = Depends(require_authenticated_user),
):
    revoke_session(credentials.credentials)
    return ApiResponse(
        success=True,
        message="Logged out successfully.",
        data={"user_id": user_id},
    )
