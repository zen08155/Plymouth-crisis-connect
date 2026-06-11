import bcrypt
from app.database.database_connection import Database
from app.models.user_data import UserData
from app.models.user_skills import UserSkills
from datetime import date, datetime
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
        hashed_pw = bcrypt.hashpw(pw, salt).decode("utf-8")

        user = UserData(hashed_pw, firstname, surname, email, phone_nr, birthday, role, status)

        sql = f"""INSERT INTO users (password, name, surname, email, role, status, phoneNumber, birthday, createdAt, updatedAt, isActive, avgResponseTimeMins, pushNotifications)
                 VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""

        try:
            Database.execute(sql, (user.password, user.name, user.surname, user.email, user.role, user.status, user.phone, user.birthday, user.created_at, user.updated_at, user.is_active, user.avg_response_time, user.push_notifications_enabled))
            return True
            
        except Exception as e:
            print(e) 
            return False   
        
    def log_in(self, email : str, password : str) -> UserData | None :
        """Log in user using email and password

        Args:
            email (str): user email
            password (str): plain password

        Returns:
            Optional[User]: Returns an User object if login succeeds, otherwise None.
        """
        sql = "SELECT * FROM users WHERE email = %s"
        cursor = None

        try:
            conn = Database.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql, (email,))

            row = cursor.fetchone()

            if row is None:
                return None
            
            stored_password = row["password"]
            if isinstance(stored_password, str):
                stored_password = stored_password.encode()

            if not bcrypt.checkpw(password.encode(), stored_password):
                return None
            
            return UserData(hashed_password=row["password"],
                        name=row["name"],
                        surname=row["surname"],
                        email=row["email"],
                        phone_number=row["phoneNumber"],
                        birthday=row["birthday"],
                        role=row["role"],
                        created_at=row["createdAt"],
                        updated_at=row["updatedAt"],
                        is_active=row["isActive"],
                        avg_response_time=row["avgResponseTimeMins"],
                        push_notifications=row["pushNotifications"],
                        id=row["userId"],
                        status=row["status"]
                        )
           
        except Exception as e:
            print("error: " + str(e))
            return None
        
        finally:
            if cursor:
                cursor.close()

    def can_create_incidents(self, user_id: int) -> bool:
        sql = """
            SELECT role, isActive
            FROM users
            WHERE userId = %s
        """
        cursor = None

        try:
            conn = Database.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql, (user_id,))
            user = cursor.fetchone()
            return bool(
                user
                and user["isActive"]
                and user["role"] == "coordinator"
            )
        finally:
            if cursor:
                cursor.close()

    def get_user_role(self, user_id: int) -> str | None:
        cursor = None
        try:
            conn = Database.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT role FROM users WHERE userId = %s AND isActive = TRUE",
                (user_id,),
            )
            user = cursor.fetchone()
            return user["role"] if user else None
        finally:
            if cursor:
                cursor.close()

    def submit_certificate(
        self,
        user_id: int,
        certificate_type: str,
        description: str,
        file_name: str,
    ) -> int | None:
        conn = None
        cursor = None
        try:
            conn = Database.get_connection()
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO skills (
                    title, description, skillType, skillDescription,
                    proofOfCertificate, certificateName, verificationStatus
                )
                VALUES (%s, %s, 'certified', %s, %s, %s, 'under_review')
                """,
                (
                    certificate_type,
                    description,
                    description,
                    file_name,
                    file_name,
                ),
            )
            skill_id = cursor.lastrowid
            cursor.execute(
                "INSERT INTO volunteerSkills (skillId, userId) VALUES (%s, %s)",
                (skill_id, user_id),
            )
            conn.commit()
            return skill_id
        except Exception:
            if conn:
                conn.rollback()
            raise
        finally:
            if cursor:
                cursor.close()

    def list_user_certificates(self, user_id: int) -> list[dict]:
        cursor = None
        try:
            conn = Database.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT skills.skillId, skills.title, skills.description,
                       skills.certificateName, skills.verificationStatus,
                       skills.reviewedAt
                FROM skills
                JOIN volunteerSkills
                  ON volunteerSkills.skillId = skills.skillId
                WHERE volunteerSkills.userId = %s
                ORDER BY skills.skillId DESC
                """,
                (user_id,),
            )
            return cursor.fetchall()
        finally:
            if cursor:
                cursor.close()

    def list_certificate_submissions(self) -> list[dict]:
        cursor = None
        try:
            conn = Database.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT skills.skillId, skills.title, skills.description,
                       skills.certificateName, skills.verificationStatus,
                       skills.reviewedAt, users.userId,
                       users.name, users.surname, users.email
                FROM skills
                JOIN volunteerSkills
                  ON volunteerSkills.skillId = skills.skillId
                JOIN users
                  ON users.userId = volunteerSkills.userId
                ORDER BY
                  CASE skills.verificationStatus
                    WHEN 'under_review' THEN 0
                    ELSE 1
                  END,
                  skills.skillId DESC
                """
            )
            return cursor.fetchall()
        finally:
            if cursor:
                cursor.close()

    def review_certificate(
        self,
        skill_id: int,
        reviewer_id: int,
        status: str,
    ) -> bool:
        conn = None
        cursor = None
        try:
            conn = Database.get_connection()
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE skills
                SET verificationStatus = %s, reviewedBy = %s, reviewedAt = %s
                WHERE skillId = %s
                """,
                (status, reviewer_id, datetime.now(), skill_id),
            )
            conn.commit()
            return cursor.rowcount > 0
        except Exception:
            if conn:
                conn.rollback()
            raise
        finally:
            if cursor:
                cursor.close()

    def has_verified_certificate(self, user_id: int, certificate_type: str) -> bool:
        cursor = None
        try:
            conn = Database.get_connection()
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT 1
                FROM skills
                JOIN volunteerSkills
                  ON volunteerSkills.skillId = skills.skillId
                WHERE volunteerSkills.userId = %s
                  AND skills.title = %s
                  AND skills.verificationStatus = 'verified'
                LIMIT 1
                """,
                (user_id, certificate_type),
            )
            return cursor.fetchone() is not None
        finally:
            if cursor:
                cursor.close()

    def set_skills(self, user_id : int, skills: UserSkills) -> bool:
        """Sets skills for User in database, also connects the skills and user in volunteerSkills.

        Args:
            skills (UserSkills): Object with skill data

        Raises:
            ValueError: throws exception when the user_id is invalid.

        Returns:
            bool: on success/failure
        """
        sql = "INSERT INTO skills (title, description, skillType, skillDescription, proofOfCertificate, certificateName, expirationDateCertificate, courseTakenAt) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
        sql_volunteerskill = "INSERT INTO volunteerSkills(skillId, userId) VALUES (%s, %s)"

        if user_id is None:
            raise ValueError("User id is not set!")
        
        try:
            #insert new skill
            cursor = Database.execute(sql, (skills.title, skills.description, skills.skill_type, skills.skill_description, skills.proof_of_certificate, skills.name_of_certificate, skills.expiration_date_certificate, skills.course_taken_at))

            #use the prev generated id to link to user
            skill_id = cursor.lastrowid
            Database.execute(sql_volunteerskill, (skill_id, user_id))
            return True

        except Exception as e:
            print("error: " + str(e))
            return False
        
    def volunteer_for(self, user_id : int, incident_id : int) -> bool:
        """Adds the volunteer to the incident and the main-team of said incident

        Args:
            user_id (int): id of the user
            incident_id (int): id of incident to join 

        Raises:
            ValueError: incident with the id cannot be found.

        Returns:
            bool: on success/failure
        """
        sql = "INSERT INTO incidentVolunteers(incidentId, userId, joinedAt) VALUES (%s, %s, %s)"
        sql_find_team = "SELECT teamId FROM team WHERE incidentId = %s AND name LIKE 'MAIN%%' LIMIT 1"
        sql_team = "INSERT INTO volunteeringTeams (teamId, userId) VALUES (%s, %s)"

        try: 
            conn = Database.get_connection()
            cursor = conn.cursor()

            #adds user to incidentVolunteers
            cursor.execute(sql, (incident_id, user_id, datetime.now()))

            #find team_id
            cursor.execute(sql_find_team, (incident_id,))
            result = cursor.fetchone()
            
            if result is None: 
                raise ValueError(f"No team found for incident {incident_id}")
            
            #insert volunteer into main-team of the incident
            team_id = result[0]
            cursor.execute(sql_team, (team_id, user_id))
            conn.commit()

            return True

        except Exception as e:
            print("error: " + str(e))
            conn.rollback()
            return False

        finally:
            if cursor: cursor.close()
#TESTING
# usr =  UserAccount()
# print(usr.create_account("jenita2", "z", "pw", "yay@", "123", date(2000, 1, 31))) 
# obj = usr.log_in("yay@", "pw")
# print(obj)
# print(obj.name, obj.surname, obj.email, obj.birthday, obj.role, obj.status, obj.is_active, obj.updated_at, obj.avg_response_time)

        
        
