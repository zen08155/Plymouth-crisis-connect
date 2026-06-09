from app.models.User import User
from app.repositories.dashboard_repository import (
    get_activity_graph_data,
    get_average_response_times,
    get_filtered_dashboard_statistics,
    get_incident_heatmap_data,
    get_open_incident_statistics,
    get_project_progress,
    get_real_time_management_information,
    list_active_incidents,
    list_active_projects,
)
from app.repositories.user_repository import (
    ALLOWED_ROLES,
    authenticate_system_manager,
    count_active_volunteers,
    get_user_by_id,
    get_volunteer_participation,
    is_trusted_volunteer,
    list_registered_users,
    update_user_role,
)


class SystemManager:
    @staticmethod
    def login(email: str, password: str) -> User:
        user = authenticate_system_manager(email, password)

        if user is None:
            raise PermissionError("Invalid System Manager credentials.")

        return user

    def __init__(self, user_id: int):
        self.user = get_user_by_id(user_id)

        if self.user is None:
            raise ValueError("System Manager was not found.")
        if not self.user.is_active:
            raise PermissionError("System Manager account is inactive.")
        if self.user.role != "system_manager":
            raise PermissionError("System Manager permission is required.")

    def promote_volunteer_to_coordinator(self, volunteer_id: int) -> dict:
        volunteer = get_user_by_id(volunteer_id)

        if volunteer is None:
            raise ValueError("Volunteer was not found.")
        if volunteer.role != "volunteer":
            raise ValueError("User is not a volunteer.")
        if not volunteer.is_active:
            raise ValueError("Volunteer account is inactive.")
        if not is_trusted_volunteer(volunteer_id):
            raise ValueError("Volunteer is not certified and trusted.")

        updated_volunteer = update_user_role(volunteer_id, "coordinator")
        return updated_volunteer.without_password()

    def view_registered_users(self) -> list[dict]:
        return list_registered_users()

    def manage_user_role(self, target_user_id: int, new_role: str) -> dict:
        target_user = get_user_by_id(target_user_id)

        if target_user is None:
            raise ValueError("User was not found.")
        if target_user.user_id == self.user.user_id:
            raise ValueError("System Managers cannot change their own role.")
        if new_role not in ALLOWED_ROLES:
            raise ValueError(f"Unsupported role: {new_role}.")

        updated_user = update_user_role(target_user_id, new_role)
        return updated_user.without_password()

    def view_active_incidents(self) -> list[dict]:
        return list_active_incidents()

    def view_active_projects(self) -> list[dict]:
        return list_active_projects()

    def view_active_volunteer_count(self) -> int:
        return count_active_volunteers()

    def view_open_incident_statistics(self) -> dict:
        return get_open_incident_statistics()

    def view_average_response_times(self) -> dict:
        return get_average_response_times()

    def view_activity_graphs(self) -> dict:
        return get_activity_graph_data()

    def view_incident_heatmap(self) -> list[dict]:
        return get_incident_heatmap_data()

    def filter_dashboard_statistics(self, filters: dict | None = None) -> dict:
        return get_filtered_dashboard_statistics(filters)

    def monitor_volunteer_participation(self) -> dict:
        return get_volunteer_participation()

    def monitor_project_progress(self) -> dict:
        return get_project_progress()

    def view_real_time_management_information(self) -> dict:
        return get_real_time_management_information()
