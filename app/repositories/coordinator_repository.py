
import requests
from decimal import *
from app.models.incident import Incident
from app.models.tasks import Task
from app.database.database_connection import Database
from datetime import datetime

class CoordinatorRepository:
    def list_active_incidents(self) -> list[dict]:
        sql = """
            SELECT incidentId, title, description, type, latitude, longitude,
                   priority, requiredCertificate, status, createdAt, createdBy,
                   endedAt, endedBy
            FROM incidents
            WHERE endedAt IS NULL AND status = TRUE
            ORDER BY createdAt DESC
        """
        conn = None
        cursor = None

        try:
            conn = Database.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql)
            incidents = cursor.fetchall()
            conn.commit()
            return incidents
        except Exception:
            if conn:
                conn.rollback()
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def get_incident(self, incident_id: int) -> dict | None:
        sql = """
            SELECT incidentId, title, description, type, latitude, longitude,
                   priority, requiredCertificate, status, createdAt, createdBy,
                   endedAt, endedBy
            FROM incidents
            WHERE incidentId = %s
        """
        conn = None
        cursor = None

        try:
            conn = Database.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute(sql, (incident_id,))
            incident = cursor.fetchone()
            conn.commit()
            return incident
        except Exception:
            if conn:
                conn.rollback()
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def create_incident(self, incident : Incident, coordinator_id : int) -> int | None:
        """Creates an incident and immediatelly sends out a notification using the created incident

        Args:
            incident (Incident): Object with all incident data
            admin_id (int): user_id of the admin

        Returns:
            bool: on success/failure
        """
        sql = "INSERT INTO incidents (title, description, type, importantData, importantDataExtra, latitude, longitude, priority, requiredCertificate, status, createdAt, createdBy) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
        sql_notifs = "INSERT INTO incidentNotification(incidentId, title, sentAt) VALUES (%s, %s, %s)"
        current_time = datetime.now()

        conn = None
        cursor = None

        try:
            conn = Database.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, (incident.title, incident.description, incident.incident_type, incident.important_data, incident.important_data_extra, incident.latitude, incident.longitude, incident.priority, incident.required_certificate, incident.status, current_time, coordinator_id))
            incident_id = cursor.lastrowid
            cursor.execute(sql_notifs, (incident_id, incident.title, current_time))
            cursor.execute(
                "INSERT INTO team (incidentId, coordinatorId, teamLeaderId, name, task, createdAt, isActive) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (incident_id, coordinator_id, None, "MAIN - " + incident.title, "", current_time, True),
            )
            conn.commit()
            return incident_id
        except Exception as e:
            if conn:
                conn.rollback()
            print("error: " + str(e))
            return None
        finally:
            if cursor:
                cursor.close()
            if conn:
                conn.close()

    def create_team(self, incident_id : int, coordinator_id : int, name : str, team_leader_id : int | None = None, task : str = "", createdAt : datetime = datetime.now(), is_active : bool = True) -> bool:
        """Creates a team

        Args:
            incidentId (int)
            coordinator_id (int): id of the coordinator who created the team
            team_leader_id (int): if there's no teamleader the value is None
            name (str): team name
            task (str, optional): Task description. Defaults to "".
            createdAt (datetime, optional): task creation date. Defaults to datetime.now().
            is_active (bool, optional): whether the task is still active. Defaults to True.

        Returns:
            bool: on success/failure
        """
        sql = "INSERT INTO team (incidentId, coordinatorId, teamLeaderId, name, task, createdAt, isActive) VALUES(%s, %s, %s, %s, %s, %s, %s)"

        try:
            Database.execute(sql, (incident_id, coordinator_id, team_leader_id, name, task, createdAt, is_active))
            return True
        except Exception as e:
                print("error: " + str(e))
                return False

    def close_incident(self, coordinator_id : int, incident_id : int) -> bool:
        """Updates the incident with an endedAt and endedBy

        Args:
            admin_id (int): user_id of the admin closing the incident
            incident_id (int): id of the incident being closed

        Returns:
            bool: on success/failure
    
        """
        sql = "UPDATE incidents SET endedAt = %s, endedBy = %s WHERE incidentId = %s"

        try:
            Database.execute(sql, (datetime.now(), coordinator_id, incident_id))
            return True

        except Exception as e:
            print("error: " + str(e))

    def add_volunteer_to_team(self, volunteer_id : int, team_id : int) ->bool :
        """read method name

        Args:
            volunteer_id (int): user_id of the volunteer to be added
            team_id (int): id of team

        Returns:
            bool: on success/failure
        """
        sql = "INSERT INTO volunteeringTeams (teamId, userId) VALUES (%s, %s)"

        try:
            Database.execute(sql, (team_id, volunteer_id))
            return True
        
        except Exception as e:
            print("error: " + str(e))

    def remove_volunteer_from_team(self, volunteer_id : int, team_id : int) -> bool:
        """Removes the volunteer from a team

        Args:
            volunteer_id (int): user_id of the volunteer
            team_id (int): team where the user is being removed from

        Returns: bool on success/failure
        """
        sql = "DELETE FROM volunteeringTeams WHERE teamId = %s AND userId = %s"
        # FIXME: if it's a teamlead getting removed, set teamlead to null
        try:
            Database.execute(sql, (team_id, volunteer_id))
            return True

        except Exception as e:
            print("error: " + str(e))

    def appoint_team_lead(self, team_id : int, volunteer_id : int) -> bool:
        """Appointing a volunteer as the leader of a team

        Args:
            team_id (int): team the volunteer is being appointed to
            volunteer_id (int): the volunteer being assigned as lead

        Returns: bool on success/failure
        """
        sql = "UPDATE team SET teamLeaderId = %s WHERE teamId = %s"

        try:
            Database.execute(sql, (volunteer_id, team_id))
            return True
        
        except Exception as e:
            print("error: " + str(e))

    def convert_location_to_coords(self, location : str) -> tuple[Decimal, Decimal]:
        """Builds url using the location and runs it through an API

        Args:
            location (str): streetname/location

        Raises:
            Exception: raises an exception when nominatim doesn't return coords

        Returns:
            tuple[Decimal, Decimal]: returns the lat and lon as a tuple
        """
        city = "Plymouth"
        country = "England"
        params = {
            "q": f"{location} {city} {country}",
            "format": "json",
            "limit": 1
        }
        header = {
            "User-Agent": "PlymouthCrisisConnect/1.0 (6043508@mborijnland.nl)"
        }

        response = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params=params,
            headers=header,
            timeout=5
        ).json()

        if not response:
            raise Exception("No coordinates found for location")

        first = response[0]

        latitude = Decimal(first["lat"])
        longitude = Decimal(first["lon"])

        return latitude, longitude

    def update_priority(self, incident_id : int, priority : str) -> bool:
        sql = "UPDATE incidents SET priority = %s WHERE incidentId = %s"
        try:
            cursor = Database.execute(sql, (priority, incident_id))
            return cursor.rowcount > 0

        except Exception as e:
            print("error:" + str(e))
            return False


    def update_description(self, incident_id : int, description : str) -> bool:
        sql = "UPDATE incidents SET description = %s WHERE incidentId = %s"

        try:
            cursor = Database.execute(sql, (description, incident_id))
            return cursor.rowcount > 0

        except Exception as e:
            print("error: " + str(e))
            return False

    def create_task(self, task : Task) ->bool:
        """Creates a task and assign to team, inserts in database

        Args:
            task (Task): Task object

        Returns:
            bool: on success/failure
        """
        sql = "INSERT INTO tasks (teamId, name, description, priority, createdAt, updatedAt, IsActive) VALUES (%s, %s, %s, %s, %s, %s, %s)"

        try:
            Database.execute(sql, (task.team_id, task.name, task.description, task.priority, task.created_at, task.updated_at, task.is_active))
            return True
        
        except Exception as e:
            print("error: " + str(e))

#TESTING
# admin_id = 2
# adm = CoordinatorRepository()

# inc = Incident("Fire at preschool 3", "There's a fire at preschool XXX in disctrict blablablah", "bilalGoingOutside", "school-aged children, barely/not self-reliable", "", 50.4154198, -4.1225064, "urgent",)
# adm.create_incident(inc, admin_id)
# print(adm.close_incident(admin_id, 8))
# adm.add_volunteer_to_team(1, 1)
# adm.remove_volunteer_from_team(1, 1)
# adm.appoint_team_lead(1, 1)

# lat, lon = adm.convert_location_to_coords("Royal Parade")
# print(lat)
# print(lon)
# task = Task(1, "sweep leaves", "sweep sum leaves", "urgent")
# print(adm.create_task(task))
    


    
