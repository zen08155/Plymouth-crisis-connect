from app.database.fake_database import database
from app.repositories.user_repository import (
    count_active_volunteers,
    get_volunteer_participation,
)


def list_active_incidents() -> list[dict]:
    return [
        incident
        for incident in database["Incidents"]
        if incident["Ended_at"] is None
    ]


def list_active_projects() -> list[dict]:
    return [
        incident
        for incident in database["Incidents"]
        if incident["Is_Project"] is True and incident["Ended_at"] is None
    ]


def _matches_filters(incident: dict, filters: dict | None) -> bool:
    if not filters:
        return True

    for key, value in filters.items():
        if value is None:
            continue
        if key == "Is_Open":
            if (incident["Ended_at"] is None) != value:
                return False
        elif incident.get(key) != value:
            return False

    return True


def get_incident_heatmap_data() -> list[dict]:
    return [
        {
            "incident_id": incident["Incident_id"],
            "title": incident["Title"],
            "latitude": incident["Latitude"],
            "longitude": incident["Longitude"],
            "priority": incident["Priority"],
            "type": incident["Type"],
            "is_open": incident["Ended_at"] is None,
            "weight": incident["Volunteers_helped"] + 1,
        }
        for incident in database["Incidents"]
    ]


def get_filtered_dashboard_statistics(filters: dict | None = None) -> dict:
    incidents = [
        incident
        for incident in database["Incidents"]
        if _matches_filters(incident, filters)
    ]
    open_incidents = [
        incident for incident in incidents if incident["Ended_at"] is None
    ]

    return {
        "total_incidents": len(incidents),
        "open_incidents": len(open_incidents),
        "closed_incidents": len(incidents) - len(open_incidents),
        "projects": sum(1 for incident in incidents if incident["Is_Project"]),
        "urgent_incidents": sum(
            1 for incident in incidents if incident["Priority"] == "Urgent"
        ),
        "total_volunteers_helped": sum(
            incident["Volunteers_helped"] for incident in incidents
        ),
        "filters": filters or {},
    }


def get_project_progress() -> dict:
    projects = [
        incident for incident in database["Incidents"] if incident["Is_Project"]
    ]
    teams_by_incident: dict[int, list[dict]] = {}

    for team in database["Team"]:
        teams_by_incident.setdefault(team["incident_id"], []).append(team)

    progress = [
        {
            "incident_id": project["Incident_id"],
            "project_name": project["Project_Name"],
            "title": project["Title"],
            "status": "open" if project["Ended_at"] is None else "closed",
            "priority": project["Priority"],
            "volunteers_helped": project["Volunteers_helped"],
            "team_count": len(teams_by_incident.get(project["Incident_id"], [])),
            "progress_percent": 50 if project["Ended_at"] is None else 100,
        }
        for project in projects
    ]

    return {
        "project_count": len(projects),
        "open_project_count": sum(
            1 for project in projects if project["Ended_at"] is None
        ),
        "projects": progress,
    }


def get_open_incident_statistics() -> dict:
    open_incidents = list_active_incidents()
    by_priority: dict[str, int] = {}
    by_type: dict[str, int] = {}

    for incident in open_incidents:
        priority = incident["Priority"]
        incident_type = incident["Type"]
        by_priority[priority] = by_priority.get(priority, 0) + 1
        by_type[incident_type] = by_type.get(incident_type, 0) + 1

    return {
        "total_open_incidents": len(open_incidents),
        "urgent_open_incidents": by_priority.get("Urgent", 0),
        "open_projects": sum(
            1 for incident in open_incidents if incident["Is_Project"]
        ),
        "total_volunteers_helped": sum(
            incident["Volunteers_helped"] for incident in open_incidents
        ),
        "by_priority": by_priority,
        "by_type": by_type,
    }


def get_average_response_times() -> dict:
    response_records = [
        record["Response_Time_Seconds"]
        for record in database["Volunteer_help"]
        if record["Response_Time_Seconds"] is not None
    ]
    active_volunteer_times = [
        user["Avg_Response_Time_Mins"]
        for user in database["Users"]
        if user["Role"] == "volunteer" and user["Is_Active"]
    ]
    average_seconds = (
        sum(response_records) / len(response_records) if response_records else 0
    )

    return {
        "average_response_time_seconds": average_seconds,
        "average_response_time_minutes": average_seconds / 60,
        "average_active_volunteer_response_time_minutes": (
            sum(active_volunteer_times) / len(active_volunteer_times)
            if active_volunteer_times
            else 0
        ),
        "response_record_count": len(response_records),
        "active_volunteer_count": len(active_volunteer_times),
    }


def get_activity_graph_data() -> dict:
    priority_counts: dict[str, int] = {}
    type_counts: dict[str, int] = {}

    for incident in database["Incidents"]:
        priority_counts[incident["Priority"]] = (
            priority_counts.get(incident["Priority"], 0) + 1
        )
        type_counts[incident["Type"]] = type_counts.get(incident["Type"], 0) + 1

    return {
        "incident_status_counts": {
            "open": len(list_active_incidents()),
            "closed": sum(
                1
                for incident in database["Incidents"]
                if incident["Ended_at"] is not None
            ),
        },
        "incident_priority_counts": priority_counts,
        "incident_type_counts": type_counts,
        "response_time_trend": [
            {
                "created_at": response["Created_at"],
                "incident_id": response["Incident_id"],
                "response_time_minutes": response["Response_Time_Seconds"] / 60,
            }
            for response in database["Volunteer_help"]
        ],
        "volunteer_availability": {
            "active_volunteers": count_active_volunteers(),
            "registered_users": len(database["Users"]),
        },
    }


def get_real_time_management_information() -> dict:
    workload = get_open_incident_statistics()
    project_progress = get_project_progress()
    active_volunteers = count_active_volunteers()

    return {
        "current_workload": workload,
        "available_resources": {
            "active_volunteers": active_volunteers,
            "registered_users": len(database["Users"]),
            "volunteer_participation": get_volunteer_participation(),
        },
        "operational_performance": get_average_response_times(),
        "active_projects": project_progress,
        "incident_heatmap": get_incident_heatmap_data(),
        "activity_graphs": get_activity_graph_data(),
        "decision_flags": {
            "urgent_incidents_need_attention": (
                workload["urgent_open_incidents"] > 0
            ),
            "low_active_volunteer_availability": (
                active_volunteers < workload["urgent_open_incidents"]
            ),
            "open_projects_need_monitoring": (
                project_progress["open_project_count"] > 0
            ),
        },
    }
