import bcrypt
from database.database_connection import Database
from models.user_data import UserData
from datetime import date
from typing import Optional

class UserAccount:
    def __init__(self):
        pass

    def create_account(self, firstname: str, surname: str, password: str, email: str, phone_nr: str, birthday : date, role: str = "volunteer", status = "available") -> bool:
        """Create a new user account and insert into DB

        Default role is 'volunteer' if no role is provided.
        """
        pw = password.encode()
        salt = bcrypt.gensalt()
        hashed_pw = bcrypt.hashpw(pw, salt) 

        user = UserData(hashed_pw, firstname, surname, email, phone_nr, birthday, role, status)

        sql = f"""INSERT INTO users (password, name, surname, email, role, status, phoneNumber, birthday, createdAt, updatedAt, isActive, avgResponseTimeMins, pushNotifications)
                 VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""

        try:
            conn = Database.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, (user.password, user.name, user.surname, user.email, user.role, user.status, user.phone, user.birthday, user.created_at, user.updated_at, user.is_active, user.avg_response_time, user.push_notifications_enabled))
            conn.commit()
            return True
            
        except Exception as e:
            print(e) 
            conn.rollback()
            return False   
        
        finally:
            if conn: conn.close()

    def log_in(self, email : str, password : str) -> Optional[UserData] :
        """Log in user using email and password

        Args:
            email (str): user email
            password (str): plain password

        Returns:
            Optional[User]: Returns an User object if login succeeds, otherwise None.
        """
        sql_pw = f"SELECT password FROM users WHERE email = %s"
        sql_id = f"SELECT * FROM users WHERE email = %s"

        try:
            conn = Database.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql_pw, (email,))

            row = cursor.fetchone()

            if row is None:
                return None
            
            pw_byte = row["password"].encode()

            if bcrypt.checkpw(password.encode(), pw_byte) :
                cursor.execute(sql_id, (email,))
                row = cursor.fetchone()
               
                
                return UserData(hashed_password=row["password"],
                            name=row["name"],
                            surname=row["surname"],
                            email=row["email"],
                            phone_number=row["phoneNumber"],
                            birthday=row["birthday"],
                            role=row["role"],
                            created_at=row["createdAt"],
                            updated_at=row["createdAt"],
                            is_active=row["isActive"],
                            avg_response_time=row["avgResponseTimeMins"],
                            push_notifications=row["pushNotifications"],
                            id=row["userId"],
                            status=row["status"]
                            )
            else:
                print("User not found.")
                return None
                
        except Exception as e:
            print("error: " + str(e))
            return None
        
        finally:
            if conn: conn.close()
