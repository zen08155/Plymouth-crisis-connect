
import requests
from decimal import *
from app.models.incident import Incident
from app.models.tasks import Task
from app.database.database_connection import Database
from datetime import datetime

class CoordinatorRepository:
    def __close_connection(self, conn, cursor):
        if cursor: cursor.close()
        if conn: conn.close()
        

    def __print_rollback(self, e, conn) -> bool:
        print("error: " + str(e))
        conn.rollback()
        return False
    
    def create_incident(self, incident : Incident, coordinator_id : int) -> bool:
        """Creates an incident and immediatelly sends out a notification using the created incident

        Args:
            incident (Incident): Object with all incident data
            admin_id (int): user_id of the admin

        Returns:
            bool: on success/failure
        """
        sql = "INSERT INTO incidents (title, description, type, importantData, importantDataExtra, latitude, longitude, priority, createdAt, createdBy) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
        sql_notifs = "INSERT INTO incidentnotification(incidentId, title, sentAt) VALUES (%s, %s, %s)"
        current_time = datetime.now()

        try : 
            conn = Database.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, (incident.title, incident.description, incident.type, incident.important_data, incident.important_data_extra, incident.latitude, incident.longitude, incident.priority, current_time, coordinator_id))

            #creates the notification
            incident_id = cursor.lastrowid
            cursor.execute(sql_notifs, (incident_id, incident.title, current_time))

            notif_id = cursor.lastrowid
            cursor.execute(f"UPDATE incidents SET notificationId = {notif_id} WHERE incidentId = {incident_id}")
            conn.commit()

            #create the main-team on incident-creation
            self.create_team(incident_id, coordinator_id, -1, "MAIN - " + incident.title)
            return True
             
        except Exception as e:
            return self.__print_rollback(e, conn)
        finally:
            self.__close_connection(conn, cursor)

    def create_team(self, incidentId : int, coordinator_id : int, team_leader_id : int, name : str, task : str = "", createdAt : datetime = datetime.now(), is_active : bool = True) -> bool:
        """Creates a team

        Args:
            incidentId (int)
            coordinator_id (int): id of the coordinator who created the team
            team_leader_id (int): if there's no teamleader the value is -1
            name (str): team name
            task (str, optional): Task description. Defaults to "".
            createdAt (datetime, optional): task creation date. Defaults to datetime.now().
            is_active (bool, optional): whether the task is still active. Defaults to True.

        Returns:
            bool: on success/failure
        """
        sql = "INSERT INTO team (incidentId, coordinatorId, teamLeaderId, name, task, createdAt, isActive) VALUES(%s, %s, %s, %s, %s, %s, %s)"

        try:
            conn = Database.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, (incidentId, coordinator_id, team_leader_id, name, task, createdAt, is_active))
            conn.commit()
            return True
        except Exception as e:
            return self.__print_rollback(e, conn)
        finally:
            self.__close_connection(conn, cursor)

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
            conn = Database.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, (datetime.now(), coordinator_id, incident_id))
            conn.commit()
            return True

        except Exception as e:
            return self.__print_rollback(e, conn)
        finally:
            self.__close_connection(conn, cursor)

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
            conn = Database.get_connection()    
            cursor = conn.cursor()
            cursor.execute(sql, (team_id, volunteer_id))
            conn.commit()
            return True
        
        except Exception as e:
            return self.__print_rollback(e, conn)
        finally:
            self.__close_connection(conn, cursor)

    def remove_volunteer_from_team(self, volunteer_id : int, team_id : int) -> bool:
        """Removes the volunteer from a team

        Args:
            volunteer_id (int): user_id of the volunteer
            team_id (int): team where the user is being removed from

        Returns: bool on success/failure
        """
        sql = "DELETE FROM volunteeringTeams WHERE teamId = %s AND userId = %s"

        try:
            conn = Database.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, (team_id, volunteer_id))
            conn.commit()
            return True

        except Exception as e:
            return self.__print_rollback(e, conn)
        finally:
            self.__close_connection(conn, cursor)

    def appoint_team_lead(self, team_id : int, volunteer_id : int) -> bool:
        """Appointing a volunteer as the leader of a team

        Args:
            team_id (int): team the volunteer is being appointed to
            volunteer_id (int): the volunteer being assigned as lead

        Returns: bool on success/failure
        """
        sql = "UPDATE team SET teamLeaderId = %s WHERE teamId = %s"

        try:
            conn = Database.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, (volunteer_id, team_id))
            conn.commit()
            return True
        
        except Exception as e:
            return self.__print_rollback(e, conn)
        finally:
            self.__close_connection(conn, cursor)

    def convert_location_to_coords(self, location : str) -> tuple[Decimal, Decimal]:
        """Converts location into coords, only takes street rn? idk, city and country are standard Plymouth and England

        Args:
            location (str): streetname/location

        Raises:
            Exception: raises an exception when nominatim doesn't return coords

        Returns:
            tuple[Decimal, Decimal]: returns the lat and lon as a tuple
        """
        country = "England"
        city = "Plymouth"
        nominatim_url = f"https://nominatim.openstreetmap.org/search?q={location}%20{city}%20{country}&format=json&limit=1"
        header = {
            "User-Agent": "PlymouthCrisisConnect/1.0 (6043508@mborijnland.nl)"
        }
        response = requests.get(nominatim_url, headers= header).json()
        
        if not response:
            raise Exception("No coordinates found for location")

        first = response[0]

        latitude = Decimal(first["lat"])
        longitude = Decimal(first["lon"])

        return latitude, longitude

    def create_task(self, task : Task) ->bool:
        """Creates a task and assign to team, inserts in database

        Args:
            task (Task): Task object

        Returns:
            bool: on success/failure
        """
        sql = "INSERT INTO tasks (teamId, name, description, priority, createdAt, updatedAt, IsActive) VALUES (%s, %s, %s, %s, %s, %s, %s)"

        try:
            conn =  Database.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, (task.team_id, task.name, task.description, task.priority, task.created_at, task.updated_at, task.is_active))
            conn.commit()
            return True
        
        except Exception as e:
            return self.__print_rollback(e, conn)
        finally:
            self.__close_connection(conn, cursor)

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
    


    