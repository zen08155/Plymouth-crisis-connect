class User:
    def __init__(self, user_data: dict):
        self.data = user_data

    @property
    def user_id(self):
        return self.data["User_id"]

    @property
    def name(self):
        return self.data["Name"]

    @property
    def surname(self):
        return self.data["Surname"]

    @property
    def role(self):
        return self.data["Role"]

    @property
    def is_active(self):
        return self.data["Is_Active"]

    def without_password(self):
        return {
            key: value
            for key, value in self.data.items()
            if key != "Password"
        }
