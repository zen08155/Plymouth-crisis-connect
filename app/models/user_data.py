from datetime import datetime, date 
import bcrypt
import re #TODO: use for verifying email format

    
class UserData:
    """
    Data object, storing user-account data with setter methods 
    DO NOT directly modify the variables, use the update-methods instead
    """

    def __init__(self, 
                 hashed_password: str, 
                 name: str, 
                 surname: str, 
                 email: str, 
                 phone_number: str,
                 birthday : date,
                 role: str,
                 status: str,
                 created_at: datetime | None = None,
                 updated_at: datetime | None = None,
                 is_active: bool = True,
                 avg_response_time : datetime | None = None,
                 push_notifications : bool = False,
                 id : int | None = None
                 
                 ):
        self.password = hashed_password
        self.name = name
        self.surname = surname
        self.email = email
        self.phone = phone_number
        self.birthday = birthday
        self.role = role
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()
        self.is_active = is_active
        self.avg_response_time = avg_response_time #to be calculated later on...
        self.push_notifications_enabled = push_notifications
        self.status = status
        self.user_id = id #None on first creation, afterwards fetch id from db

    def __touch(self):
        """Updates updated_at to current time"""
        self.updated_at = datetime.now()

    #region setters
    def update_name(self, new_name: str):
        """Update name of user in memory"""
        self.name = new_name
        self.__touch()

    def update_password(self, password: str):
        """Hashes and updates password of user in memory 

        Parameters
        ----------
        password : str, required
            unhashed new password
        """
        pw = password.encode()
        s = bcrypt.gensalt()

        self.password = bcrypt.hashpw(pw, s)
        self.__touch()

    def update_surname(self, new_surname: str):
        self.surname = new_surname
        self.__touch()

    def update_email(self, new_email: str):
        self.email = new_email
        self.__touch()

    def update_bd(self, new_dob : date):
        self.birthday = new_dob
        self.__touch()

    def update_phone(self, new_phone_number: int):
        self.phone = new_phone_number
        self.__touch()

    def update_role(self, new_role : str):
        self.role = new_role
        self.__touch()

    def deactivate(self):
        self.is_active = False
        self.__touch()

    def activate(self):
        self.is_active = True
        self.__touch()

    def enable_push_notifications(self):
        self.push_notifications_enabled = True
        self.__touch()

    def disable_push_notifications(self):
        self.push_notifications_enabled = False
        self.__touch()

        
        
    #endregion
    
  