from app.models.SystemManager import SystemManager


def login_system_manager(email, password):
    return SystemManager.login(email, password)


def promote_volunteer(manager_id, volunteer_id):
    try:
        system_manager = SystemManager(user_id=manager_id)
        return system_manager.promote_volunteer_to_coordinator(volunteer_id)
    except (PermissionError, ValueError) as error:
        return {
            "success": False,
            "message": f"Promotion failed: {error}",
            "volunteer": None,
        }


def view_registered_users(manager_id):
    try:
        system_manager = SystemManager(user_id=manager_id)
        return system_manager.view_registered_users()
    except (PermissionError, ValueError) as error:
        return {
            "success": False,
            "message": f"Could not load users: {error}",
            "users": [],
        }


def manage_user_role(manager_id, target_user_id, new_role):
    try:
        system_manager = SystemManager(user_id=manager_id)
        return system_manager.manage_user_role(target_user_id, new_role)
    except (PermissionError, ValueError) as error:
        return {
            "success": False,
            "message": f"Role update failed: {error}",
            "user": None,
        }


def view_active_incidents(manager_id):
    try:
        system_manager = SystemManager(user_id=manager_id)
        return system_manager.view_active_incidents()
    except (PermissionError, ValueError) as error:
        return {
            "success": False,
            "message": f"Could not load active incidents: {error}",
            "incidents": [],
        }


def view_active_projects(manager_id):
    try:
        system_manager = SystemManager(user_id=manager_id)
        return system_manager.view_active_projects()
    except (PermissionError, ValueError) as error:
        return {
            "success": False,
            "message": f"Could not load active projects: {error}",
            "projects": [],
        }


def view_active_volunteer_count(manager_id):
    try:
        system_manager = SystemManager(user_id=manager_id)
        return system_manager.view_active_volunteer_count()
    except (PermissionError, ValueError) as error:
        return {
            "success": False,
            "message": f"Could not load active volunteer count: {error}",
            "active_volunteer_count": 0,
        }


def view_open_incident_statistics(manager_id):
    try:
        system_manager = SystemManager(user_id=manager_id)
        return system_manager.view_open_incident_statistics()
    except (PermissionError, ValueError) as error:
        return {
            "success": False,
            "message": f"Could not load open incident statistics: {error}",
            "statistics": {},
        }


def view_average_response_times(manager_id):
    try:
        system_manager = SystemManager(user_id=manager_id)
        return system_manager.view_average_response_times()
    except (PermissionError, ValueError) as error:
        return {
            "success": False,
            "message": f"Could not load average response times: {error}",
            "response_times": {},
        }


def view_activity_graphs(manager_id):
    try:
        system_manager = SystemManager(user_id=manager_id)
        return system_manager.view_activity_graphs()
    except (PermissionError, ValueError) as error:
        return {
            "success": False,
            "message": f"Could not load activity graphs: {error}",
            "graphs": {},
        }


def view_incident_heatmap(manager_id):
    try:
        system_manager = SystemManager(user_id=manager_id)
        return system_manager.view_incident_heatmap()
    except (PermissionError, ValueError) as error:
        return {
            "success": False,
            "message": f"Could not load incident heatmap: {error}",
            "heatmap_points": [],
        }


def filter_dashboard_statistics(manager_id, filters=None):
    try:
        system_manager = SystemManager(user_id=manager_id)
        return system_manager.filter_dashboard_statistics(filters)
    except (PermissionError, ValueError) as error:
        return {
            "success": False,
            "message": f"Could not filter dashboard statistics: {error}",
            "statistics": {},
        }


def monitor_volunteer_participation(manager_id):
    try:
        system_manager = SystemManager(user_id=manager_id)
        return system_manager.monitor_volunteer_participation()
    except (PermissionError, ValueError) as error:
        return {
            "success": False,
            "message": f"Could not load volunteer participation: {error}",
            "participation": {},
        }


def monitor_project_progress(manager_id):
    try:
        system_manager = SystemManager(user_id=manager_id)
        return system_manager.monitor_project_progress()
    except (PermissionError, ValueError) as error:
        return {
            "success": False,
            "message": f"Could not load project progress: {error}",
            "project_progress": {},
        }


def view_real_time_management_information(manager_id):
    try:
        system_manager = SystemManager(user_id=manager_id)
        return system_manager.view_real_time_management_information()
    except (PermissionError, ValueError) as error:
        return {
            "success": False,
            "message": f"Could not load real-time management information: {error}",
            "management_information": {},
        }
