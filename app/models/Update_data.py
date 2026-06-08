from app.database import fake_database

new_description = "" # change for actual integration 
new_priority = "" # change for acttual integration

incident_id = ""
def update_description(incident_id, new_description):
    for incident in fake_database.database["Incidents"]:
        if incident["id"] == incident_id:
            incident["Description"] = new_description
            return True
    return False

def update_priority(incident_id, new_priority):
    for incident in fake_database.database["Incidents"]:
        if incident["id"] == incident_id:
            incident["Priority"] = new_priority
            return True
    return False
