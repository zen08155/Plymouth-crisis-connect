import secrets
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.repositories.user_repository import get_user_by_id


_security = HTTPBearer(auto_error=False)
SESSION_DURATION = timedelta(hours=8)
_sessions: dict[str, tuple[int, datetime]] = {}


def create_session(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    _sessions[token] = (
        user_id,
        datetime.now(timezone.utc) + SESSION_DURATION,
    )
    return token


def revoke_session(token: str) -> None:
    _sessions.pop(token, None)


def require_authenticated_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_security),
) -> int:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    session = _sessions.get(credentials.credentials)

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session.",
        )

    user_id, expires_at = session

    if expires_at <= datetime.now(timezone.utc):
        revoke_session(credentials.credentials)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session.",
        )

    user = get_user_by_id(user_id)

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session.",
        )

    return user.user_id


def require_system_manager(
    user_id: int = Depends(require_authenticated_user),
) -> int:
    user = get_user_by_id(user_id)

    if user is None or user.role != "system_manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="System Manager permission is required.",
        )

    return user.user_id
