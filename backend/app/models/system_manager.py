from core.database import find_user, is_trusted_volunteer


class SystemManager:
    def __init__(self, user_id):
        self.user = find_user(user_id)

        if self.user is None:
            raise ValueError("System manager was not found.")

        if self.user["Role"] != "system_manager":
            raise PermissionError("Only a System Manager can use this class.")

    def promote_volunteer_to_coordinator(self, volunteer_id):
        volunteer = find_user(volunteer_id)

        if volunteer is None:
            return "Promotion failed: volunteer was not found."

        if volunteer["Role"] != "volunteer":
            return "Promotion failed: user is not a volunteer."

        if not volunteer["Is_Active"]:
            return "Promotion failed: volunteer account is inactive."

        if not is_trusted_volunteer(volunteer_id):
            return "Promotion failed: volunteer is not marked as trusted."

        volunteer["Role"] = "coordinator"
        volunteer["Updated_At"] = "2026-06-04 00:00:00"

        return f"{volunteer['Name']} {volunteer['Surname']} has been promoted to Coordinator."
