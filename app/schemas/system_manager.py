from typing import Any, Literal

from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class RoleUpdateRequest(BaseModel):
    role: Literal["volunteer", "coordinator", "system_manager"]


class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Any = None


class DashboardFilters(BaseModel):
    incident_type: str | None = None
    priority: str | None = None
    is_project: bool | None = None
    is_open: bool | None = None

    def to_repository_filters(self) -> dict[str, Any]:
        filters: dict[str, Any] = {}

        if self.incident_type is not None:
            filters["Type"] = self.incident_type
        if self.priority is not None:
            filters["Priority"] = self.priority
        if self.is_project is not None:
            filters["Is_Project"] = self.is_project
        if self.is_open is not None:
            filters["Is_Open"] = self.is_open

        return filters
