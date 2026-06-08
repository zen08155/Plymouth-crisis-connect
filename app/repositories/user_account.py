import bcrypt
from app.database.database_connection import Database
from app.models.user_data import UserData
from app.models.user_skills import UserSkills
from datetime import date
from typing import Optional

class UserAccount:
    """User repository, includes create_account and log_in (which should be login tbh but ok)
    """
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
                self.__user_id = row["userId"]
                
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

    def set_skills(self, skills: UserSkills) -> None:
        """Sets skills for User in database, also connects the skills and user in volunteerSkills.

        Args:
            skills (UserSkills): Object with skill data

        Raises:
            ValueError: throws exception when the user_id is invalid.
        """
        sql = "INSERT INTO skills (title, description, skillType, skillDescription, certificateName, expirationDateCertificate, courseTakenAt) VALUES (%s, %s, %s, %s, %s, %s %s, %s)"
        sql_volunteerskill = "INSERT INTO volunteerSkills(skillId, userId) VALUES (%s, %s)"

        if self.__user_id == -1:
            raise ValueError("User id is not set!")
        
        try:
            conn = Database.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, (skills.title, skills.description, skills.skill_type, skills.skill_description, skills.proof_of_certificate, skills.name_of_certificate, skills.expiration_date_certificate, skills.course_taken_at))
            
            skill_id = cursor.lastrowid
            cursor.execute(sql_volunteerskill, (self.__user_id, skill_id))
            conn.commit()

        except Exception as e:
            print("error: " + str(e))

        finally: 
            conn.close()

    def volunteer_for_team(self, user_id : int, team_id : int) -> None:
        """User assigns themselves to a (main/general) team of an incident, to more specialized teams the coordinator will have to assign them

        Args:
            team_id (int): team id

        Raises:
            ValueError: throws exception if the user_id is invalid
        """
        if user_id == -1:
            raise ValueError("User id is not set")
        
        sql = "INSERT INTO volunteeringTeams (teamId, userId) VALUES (%s, %s)"
        
        try:
            conn = Database.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, (team_id, user_id))

        except Exception as e:
            print("error: " + e)

        finally:
            conn.close()
        
#TESTING
# usr =  UserAccount()
# print(usr.create_account("jenita2", "z", "pw", "yay@", "123", date(2000, 1, 31))) 
# obj = usr.log_in("yay@", "pw")
# print(obj)
# print(obj.name, obj.surname, obj.email, obj.birthday, obj.role, obj.status, obj.is_active, obj.updated_at, obj.avg_response_time)

        
        


