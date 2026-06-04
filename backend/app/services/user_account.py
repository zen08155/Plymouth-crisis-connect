import bcrypt

from models.user import User
from database import Database
from datetime import date
from typing import Optional
import bcrypt

class UserAccount:
    def __init__(self, db : Database):
        self.db = db

    def create_account(self, firstname: str, surname: str, password: str, email: str, phone_nr: str, dob : date, role: str = "volunteer"):
        """Create a new user account and insert into DB

        Default role is 'volunteer' if no role is provided.
        dob (datetime.date): date of birth
        """

        pw = password.encode()
        salt = bcrypt.gensalt()
        hashed_pw = bcrypt.hashpw(pw, salt) 

        user = User(hashed_pw, firstname, surname, email, phone_nr, dob, role)

        sql = f"""INSERT INTO users (name, surname, email, role, phoneNumber, dob, createdAt, updatedAt, isActive)
                 VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)"""
        
        try:
            #TODO: Verify if insert returns bool when wrapped
            if self.db.execute(sql, (user.name, user.surname, user.email, user.role, user.phone, user.dob, user.created_at, user.updated_at, user.is_active)): 
                return True
            else: 
                return False
            
        except Exception as e:
            print(e) 
            return False   
        


    def log_in(self, email : str, password : str) -> Optional[User] :
        """Log in user using email and password

        Args:
            email (str): user email
            password (str): plain password

        Returns:
            Optional[User]: Returns an User object if login succeeds, otherwise None.
        """
        sql = f"SELECT Password FROM users WHERE email = ?"

        try:
            hashed_pass = self.db.execute(sql(email)) #TODO: Verify if returns arrays

            if bcrypt.checkpw(password.encode(), hashed_pass) :
                sql_id = f"SELECT * FROM users WHERE email = ?"
                user_data = self.db.execute(sql_id, (email));

                #TODO: turn user_data into an User object
                return User()
            else:
                print("User not found.")
                return None
                
        except Exception as e:
            print(e)
            return None
            
            





