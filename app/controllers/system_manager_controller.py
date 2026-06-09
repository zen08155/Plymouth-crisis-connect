from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.auth import create_session, require_system_manager, revoke_session
from app.models.SystemManager import SystemManager
from app.schemas.system_manager import (
    ApiResponse,
    DashboardFilters,
    LoginRequest,
    RoleUpdateRequest,
)


router = APIRouter(prefix="/api/system-manager", tags=["System Manager"])
security = HTTPBearer()


def _manager(manager_id: int) -> SystemManager:
    try:
        return SystemManager(manager_id)
    except (PermissionError, ValueError) as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(error),
        ) from error


def _execute(action, message: str):
    try:
        return ApiResponse(success=True, message=message, data=action())
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error


@router.post("/login", response_model=ApiResponse)
def login_system_manager(payload: LoginRequest):
    try:
        user = SystemManager.login(payload.email, payload.password)
    except PermissionError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(error),
        ) from error

    token = create_session(user.user_id)
    return ApiResponse(
        success=True,
        message="System Manager logged in successfully.",
        data={"token": token, "user": user.without_password()},
    )


@router.post("/logout", response_model=ApiResponse)
def logout_system_manager(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    manager_id: int = Depends(require_system_manager),
):
    revoke_session(credentials.credentials)
    return ApiResponse(
        success=True,
        message="System Manager logged out.",
        data={"user_id": manager_id},
    )


@router.get("/users", response_model=ApiResponse)
def view_registered_users(manager_id: int = Depends(require_system_manager)):
    return _execute(
        _manager(manager_id).view_registered_users,
        "Registered users loaded.",
    )


@router.post("/users/{volunteer_id}/promote", response_model=ApiResponse)
def promote_volunteer(
    volunteer_id: int,
    manager_id: int = Depends(require_system_manager),
):
    return _execute(
        lambda: _manager(manager_id).promote_volunteer_to_coordinator(volunteer_id),
        "Volunteer promoted to Coordinator.",
    )


@router.patch("/users/{user_id}/role", response_model=ApiResponse)
def manage_user_role(
    user_id: int,
    payload: RoleUpdateRequest,
    manager_id: int = Depends(require_system_manager),
):
    return _execute(
        lambda: _manager(manager_id).manage_user_role(user_id, payload.role),
        "User role updated.",
    )


@router.get("/incidents/active", response_model=ApiResponse)
def view_active_incidents(manager_id: int = Depends(require_system_manager)):
    return _execute(
        _manager(manager_id).view_active_incidents,
        "Active incidents loaded.",
    )


@router.get("/projects/active", response_model=ApiResponse)
def view_active_projects(manager_id: int = Depends(require_system_manager)):
    return _execute(
        _manager(manager_id).view_active_projects,
        "Active projects loaded.",
    )


@router.get("/volunteers/active-count", response_model=ApiResponse)
def view_active_volunteer_count(
    manager_id: int = Depends(require_system_manager),
):
    return _execute(
        _manager(manager_id).view_active_volunteer_count,
        "Active volunteer count loaded.",
    )


@router.get("/dashboard/open-incidents", response_model=ApiResponse)
def view_open_incident_statistics(
    manager_id: int = Depends(require_system_manager),
):
    return _execute(
        _manager(manager_id).view_open_incident_statistics,
        "Open incident statistics loaded.",
    )


@router.get("/dashboard/response-times", response_model=ApiResponse)
def view_average_response_times(
    manager_id: int = Depends(require_system_manager),
):
    return _execute(
        _manager(manager_id).view_average_response_times,
        "Average response times loaded.",
    )


@router.get("/dashboard/activity", response_model=ApiResponse)
def view_activity_graphs(manager_id: int = Depends(require_system_manager)):
    return _execute(
        _manager(manager_id).view_activity_graphs,
        "Activity graph data loaded.",
    )


@router.get("/dashboard/heatmap", response_model=ApiResponse)
def view_incident_heatmap(manager_id: int = Depends(require_system_manager)):
    return _execute(
        _manager(manager_id).view_incident_heatmap,
        "Incident heatmap data loaded.",
    )


@router.get("/dashboard/statistics", response_model=ApiResponse)
def filter_dashboard_statistics(
    incident_type: str | None = Query(default=None),
    priority: str | None = Query(default=None),
    is_project: bool | None = Query(default=None),
    is_open: bool | None = Query(default=None),
    manager_id: int = Depends(require_system_manager),
):
    filters = DashboardFilters(
        incident_type=incident_type,
        priority=priority,
        is_project=is_project,
        is_open=is_open,
    ).to_repository_filters()
    return _execute(
        lambda: _manager(manager_id).filter_dashboard_statistics(filters),
        "Filtered dashboard statistics loaded.",
    )


@router.get("/dashboard/volunteer-participation", response_model=ApiResponse)
def monitor_volunteer_participation(
    manager_id: int = Depends(require_system_manager),
):
    return _execute(
        _manager(manager_id).monitor_volunteer_participation,
        "Volunteer participation loaded.",
    )


@router.get("/dashboard/project-progress", response_model=ApiResponse)
def monitor_project_progress(
    manager_id: int = Depends(require_system_manager),
):
    return _execute(
        _manager(manager_id).monitor_project_progress,
        "Project progress loaded.",
    )


@router.get("/dashboard/realtime", response_model=ApiResponse)
def view_real_time_management_information(
    manager_id: int = Depends(require_system_manager),
):
    return _execute(
        _manager(manager_id).view_real_time_management_information,
        "Real-time management information loaded.",
    )
