from app.database import fake_database


#print(fake_database.database)

priority_mapping = {
    "urgent":1,
    "high":2,
    "medium":3,
    "low":4,
    "none":5
}

incidents = fake_database.database["Incidents"]
def sort_severity(incidents):
    sorted_incidents = sorted(
        incidents,
        key=lambda incident: priority_mapping.get(incident["Priority"], 999)
    )
    return sorted_incidents


#print(sort_severity(incidents))

def filter_by_severity(incidents, severity):
    filtered_incidents = [incident for incident in incidents if incident["Priority"].lower() == severity.lower()]
    return filtered_incidents



