import bcrypt
from services.database import Database
from models.user import User
from datetime import date
from typing import Optional
import bcrypt

class UserAccount:
    def __init__(self):
        pass

    def create_account(self, firstname: str, surname: str, password: str, email: str, phone_nr: str, birthday : date, role: str = "volunteer"):
        """Create a new user account and insert into DB

        Default role is 'volunteer' if no role is provided.
        dob (datetime.date): date of birth
        """

        pw = password.encode()
        salt = bcrypt.gensalt()
        hashed_pw = bcrypt.hashpw(pw, salt) 

        user = User(hashed_pw, firstname, surname, email, phone_nr, birthday, role)

        sql = f"""INSERT INTO users (name, surname, email, role, phoneNumber, birthday, createdAt, updatedAt, isActive)
                 VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)"""
        
        try:
            conn = Database.get_connection()
            cursor = conn.cursor()
            #TODO: Verify if insert returns bool when wrapped
            if cursor.execute(sql, (user.name, user.surname, user.email, user.role, user.phone, user.birthday, user.created_at, user.updated_at, user.is_active)): 
                return True
            else: 
                return False
            
        except Exception as e:
            print(e) 
            return False   
        
        finally:
            conn.close()

    def log_in(self, email : str, password : str) -> Optional[User] :
        """Log in user using email and password

        Args:
            email (str): user email
            password (str): plain password

        Returns:
            Optional[User]: Returns an User object if login succeeds, otherwise None.
        """
        sql_pw = f"SELECT Password FROM users WHERE email = ?"
        sql_id = f"SELECT * FROM users WHERE email = ?"

        try:
            conn = Database.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql_pw, (email)) #TODO: Verify if returns arrays
            pw_str = cursor.fetchone()["password"]
            pw_b = pw_str.encode()

            if bcrypt.checkpw(password.encode(), pw_b) :
                cursor.execute(sql_id, (email))
                row = cursor.fetchone()
                
                return User(hashed_password=row["password"],
                            name=row["name"],
                            surname=row["surname"],
                            email=row["email"],
                            phone_number=["phoneNumber"],
                            birthday=["birthday"],
                            role=row["role"],
                            created_at=row["createdAt"],
                            updated_at=row["createdAt"],
                            is_active=row["isActive"],
                            avg_response_time=row["avgResponseTimeMins"],
                            push_notifications=row["pushNotifications"]
                            )
            else:
                print("User not found.")
                return None
                
        except Exception as e:
            print(e)
            return None
        
        finally:
            conn.close()
        
            
            





