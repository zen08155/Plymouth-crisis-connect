
from models.incident import Incident
from database.database_connection import Database
from datetime import datetime

class AdminRepository:
    def __init__():
        pass
    
    def create_incident(self, incident : Incident, admin_id : int):
        """Creates an incident and immediatelly sends out a notification using the created incident

        Args:
            incident (Incident): Object with all incident data
            admin_id (int): user_id of the admin
        """
        sql = "INSERT INTO incidents (title, description, type, importantData, importantDataExtra, latitude, longitude, priority, createdAt, createdBy)"
        sql_notifs = "INSERT INTO incidentNotification(title, sentAt) VALUES (%s, %s)"
        current_time = datetime.now()

        try : 
            conn = Database.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, (incident.title, incident.description, incident.type, incident.important_data, incident.important_data_extra, incident.latitude, incident.longitude, incident. priority, current_time, admin_id))

            #creates the notification
            incident_id = cursor.lastrowid
            cursor.execute(sql_notifs, (incident_id, incident.title, current_time))
             
        except Exception as e:
            print("error: " + e)

    def close_incident(self, admin_id : int, incident_id : int):
            
        pass

    def remove_volunteer_from_incident(self, volunteer_id : int, incident_id : int):
        pass

    def update_incident_description(self):
        pass

    def appoint_team_lead(self):
        pass
    


    


    