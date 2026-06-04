from datetime import datetime, date 
import bcrypt
import re

    
class User:
    """
    Data object, storing user-account data
    """

    def __init__(self, 
                 hashed_password: str, 
                 name: str, 
                 surname: str, 
                 email: str, 
                 phone_number: str,
                 date_of_birth : date,
                 role: str,
                 created_at: datetime = None,
                 updated_at: datetime = None,
                 is_active: bool = True,
                 avg_response_time : datetime = None
                 ):
        self.user_id = None
        self.password = hashed_password
        self.name = name
        self.surname = surname
        self.email = email
        self.phone = phone_number
        self.date_of_birth = date_of_birth
        self.role = role
        self.created_at = created_at or datetime.now
        self.updated_at = updated_at or datetime.now
        self.response_time = avg_response_time or None

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

    def update_dob(self, new_dob : date):
        self.date_of_birth = new_dob
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
        
    #endregion
    
  