from app.repositories.user_repository import (
    ALLOWED_ROLES,
    authenticate_system_manager,
    count_active_volunteers,
    get_activity_graph_data,
    get_average_response_times,
    get_filtered_dashboard_statistics,
    get_incident_heatmap_data,
    get_open_incident_statistics,
    get_project_progress,
    get_real_time_management_information,
    get_user_by_id,
    get_volunteer_participation,
    is_trusted_volunteer,
    list_active_incidents,
    list_active_projects,
    list_registered_users,
    update_user_role,
)


class SystemManager:
    @staticmethod
    def login(email, password):
        return authenticate_system_manager(email, password)

    def __init__(self, user_id):
        self.user = get_user_by_id(user_id)

        if self.user is None:
            raise ValueError("System manager was not found.")

        if self.user.role != "system_manager":
            raise PermissionError("Only a System Manager can use this class.")

    def promote_volunteer_to_coordinator(self, volunteer_id):
        volunteer = get_user_by_id(volunteer_id)

        if volunteer is None:
            return {
                "success": False,
                "message": "Promotion failed: volunteer was not found.",
                "volunteer": None,
            }

        if volunteer.role != "volunteer":
            return {
                "success": False,
                "message": "Promotion failed: user is not a volunteer.",
                "volunteer": volunteer.without_password(),
            }

        if not volunteer.is_active:
            return {
                "success": False,
                "message": "Promotion failed: volunteer account is inactive.",
                "volunteer": volunteer.without_password(),
            }

        if not is_trusted_volunteer(volunteer_id):
            return {
                "success": False,
                "message": "Promotion failed: volunteer is not marked as trusted.",
                "volunteer": volunteer.without_password(),
            }

        updated_volunteer = update_user_role(
            user_id=volunteer_id,
            new_role="coordinator",
            updated_at="2026-06-04 00:00:00",
        )

        return {
            "success": True,
            "message": (
                f"{updated_volunteer.name} {updated_volunteer.surname} "
                "has been promoted to Coordinator."
            ),
            "volunteer": updated_volunteer.without_password(),
        }

    def view_registered_users(self):
        users = list_registered_users()

        return {
            "success": True,
            "message": f"{len(users)} registered users found.",
            "users": users,
        }

    def manage_user_role(self, target_user_id, new_role):
        target_user = get_user_by_id(target_user_id)

        if target_user is None:
            return {
                "success": False,
                "message": "Role update failed: user was not found.",
                "user": None,
            }

        if target_user.user_id == self.user.user_id:
            return {
                "success": False,
                "message": "Role update failed: System Managers cannot change their own role.",
                "user": target_user.without_password(),
            }

        if new_role not in ALLOWED_ROLES:
            return {
                "success": False,
                "message": f"Role update failed: '{new_role}' is not a valid role.",
                "user": target_user.without_password(),
            }

        old_role = target_user.role

        if old_role == new_role:
            return {
                "success": True,
                "message": f"{target_user.name} {target_user.surname} is already a {new_role}.",
                "user": target_user.without_password(),
            }

        updated_user = update_user_role(
            user_id=target_user_id,
            new_role=new_role,
            updated_at="2026-06-05 00:00:00",
        )

        return {
            "success": True,
            "message": (
                f"{updated_user.name} {updated_user.surname} role changed "
                f"from {old_role} to {new_role}."
            ),
            "user": updated_user.without_password(),
        }

    def view_active_incidents(self):
        active_incidents = list_active_incidents()

        return {
            "success": True,
            "message": f"{len(active_incidents)} active incidents found.",
            "incidents": active_incidents,
        }

    def view_active_projects(self):
        active_projects = list_active_projects()

        return {
            "success": True,
            "message": f"{len(active_projects)} active projects found.",
            "projects": active_projects,
        }

    def view_active_volunteer_count(self):
        active_volunteer_count = count_active_volunteers()

        return {
            "success": True,
            "message": f"{active_volunteer_count} active volunteers found.",
            "active_volunteer_count": active_volunteer_count,
        }

    def view_open_incident_statistics(self):
        statistics = get_open_incident_statistics()

        return {
            "success": True,
            "message": (
                f"{statistics['total_open_incidents']} open incidents found, "
                f"including {statistics['urgent_open_incidents']} urgent."
            ),
            "statistics": statistics,
        }

    def view_average_response_times(self):
        response_times = get_average_response_times()

        return {
            "success": True,
            "message": (
                "Average incident response time is "
                f"{response_times['average_response_time_minutes']} minutes."
            ),
            "response_times": response_times,
        }

    def view_activity_graphs(self):
        graph_data = get_activity_graph_data()

        return {
            "success": True,
            "message": "Activity graph data loaded.",
            "graphs": graph_data,
        }

    def view_incident_heatmap(self):
        heatmap_points = get_incident_heatmap_data()

        return {
            "success": True,
            "message": f"{len(heatmap_points)} heatmap points loaded.",
            "heatmap_points": heatmap_points,
        }

    def filter_dashboard_statistics(self, filters=None):
        statistics = get_filtered_dashboard_statistics(filters)

        return {
            "success": True,
            "message": "Filtered dashboard statistics loaded.",
            "statistics": statistics,
        }

    def monitor_volunteer_participation(self):
        participation = get_volunteer_participation()

        return {
            "success": True,
            "message": (
                f"{participation['total_participations']} volunteer "
                "participations found."
            ),
            "participation": participation,
        }

    def monitor_project_progress(self):
        progress = get_project_progress()

        return {
            "success": True,
            "message": f"{progress['open_project_count']} open projects found.",
            "project_progress": progress,
        }

    def view_real_time_management_information(self):
        management_information = get_real_time_management_information()

        return {
            "success": True,
            "message": "Real-time management information loaded.",
            "management_information": management_information,
        }
