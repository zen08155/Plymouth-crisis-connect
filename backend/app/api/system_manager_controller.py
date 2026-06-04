from core.database import find_user
from models.system_manager import SystemManager


def promote_volunteer(manager_id, volunteer_id):
    try:
        system_manager = SystemManager(user_id=manager_id)
        message = system_manager.promote_volunteer_to_coordinator(volunteer_id)
        volunteer = find_user(volunteer_id)

        return {
            "success": message.startswith(volunteer["Name"]) if volunteer else False,
            "message": message,
            "volunteer": volunteer,
        }
    except (PermissionError, ValueError) as error:
        return {
            "success": False,
            "message": f"Promotion failed: {error}",
            "volunteer": None,
        }
