from app.database.fake_database import database
from app.models.User import User


ALLOWED_ROLES = ["volunteer", "coordinator", "system_manager"]


def get_user_by_email(email):
    user_data = next(
        (user for user in database["Users"] if user["Email"] == email),
        None,
    )

    if user_data is None:
        return None

    return User(user_data)


def get_user_by_id(user_id):
    user_data = next(
        (user for user in database["Users"] if user["User_id"] == user_id),
        None,
    )

    if user_data is None:
        return None

    return User(user_data)


def authenticate_system_manager(email, password):
    user = get_user_by_email(email)

    if user is None:
        return {
            "success": False,
            "message": "Login failed: user was not found.",
            "user": None,
            "session_token": None,
        }

    if user.data["Password"] != password:
        return {
            "success": False,
            "message": "Login failed: password is incorrect.",
            "user": None,
            "session_token": None,
        }

    if not user.is_active:
        return {
            "success": False,
            "message": "Login failed: user account is inactive.",
            "user": None,
            "session_token": None,
        }

    if user.role != "system_manager":
        return {
            "success": False,
            "message": "Login failed: user is not a System Manager.",
            "user": None,
            "session_token": None,
        }

    return {
        "success": True,
        "message": "System Manager logged in successfully.",
        "user": user.without_password(),
        "session_token": f"fake-session-token-{user.user_id}",
    }


def list_registered_users():
    return [User(user).without_password() for user in database["Users"]]


def count_active_volunteers():
    return len(
        [
            user
            for user in database["Users"]
            if user["Role"] == "volunteer" and user["Is_Active"] is True
        ]
    )


def update_user_role(user_id, new_role, updated_at):
    user = get_user_by_id(user_id)

    if user is None:
        return None

    user.data["Role"] = new_role
    user.data["Updated_At"] = updated_at

    return user


def is_trusted_volunteer(user_id):
    volunteer_skill_ids = [
        volunteer_skill["Skills_id"]
        for volunteer_skill in database["Volunteer_skills"]
        if volunteer_skill["User_id"] == user_id
    ]

    for skill in database["Skills"]:
        if skill["skills_id"] not in volunteer_skill_ids:
            continue

        if skill["Certified"] == "Yes" and skill["reliability"] == "Trustworthy":
            return True

    return False


def list_active_incidents():
    return [
        incident
        for incident in database["Incidents"]
        if incident["Ended_at"] is None
    ]


def list_active_projects():
    return [
        incident
        for incident in database["Incidents"]
        if incident["Is_Project"] is True and incident["Ended_at"] is None
    ]


def _matches_filters(incident, filters):
    if filters is None:
        return True

    for key, value in filters.items():
        if value is None:
            continue

        if incident.get(key) != value:
            return False

    return True


def get_incident_heatmap_data():
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


def get_filtered_dashboard_statistics(filters=None):
    incidents = [
        incident
        for incident in database["Incidents"]
        if _matches_filters(incident, filters)
    ]
    open_incidents = [
        incident
        for incident in incidents
        if incident["Ended_at"] is None
    ]
    projects = [
        incident
        for incident in incidents
        if incident["Is_Project"] is True
    ]

    return {
        "total_incidents": len(incidents),
        "open_incidents": len(open_incidents),
        "closed_incidents": len(incidents) - len(open_incidents),
        "projects": len(projects),
        "urgent_incidents": len(
            [
                incident
                for incident in incidents
                if incident["Priority"] == "Urgent"
            ]
        ),
        "total_volunteers_helped": sum(
            incident["Volunteers_helped"]
            for incident in incidents
        ),
        "filters": filters or {},
    }


def get_volunteer_participation():
    participation_by_user = {}
    helped_user_ids = [
        volunteer_help["User_id"]
        for volunteer_help in database["Volunteer_help"]
    ]

    for user in database["Users"]:
        if user["Role"] == "volunteer" or user["User_id"] in helped_user_ids:
            participation_by_user[user["User_id"]] = {
                "user_id": user["User_id"],
                "name": f"{user['Name']} {user['Surname']}",
                "current_role": user["Role"],
                "incidents_helped": 0,
                "average_response_time_minutes": user["Avg_Response_Time_Mins"],
            }

    for volunteer_help in database["Volunteer_help"]:
        user_id = volunteer_help["User_id"]

        if user_id not in participation_by_user:
            continue

        participation_by_user[user_id]["incidents_helped"] += 1

    volunteers = list(participation_by_user.values())

    return {
        "volunteer_count": len(volunteers),
        "total_participations": sum(
            volunteer["incidents_helped"]
            for volunteer in volunteers
        ),
        "volunteers": volunteers,
    }


def get_project_progress():
    projects = [
        incident
        for incident in database["Incidents"]
        if incident["Is_Project"] is True
    ]
    teams_by_incident = {}

    for team in database["Team"]:
        incident_id = team["incident_id"]
        teams_by_incident.setdefault(incident_id, []).append(team)

    progress = []

    for project in projects:
        project_teams = teams_by_incident.get(project["Incident_id"], [])
        is_open = project["Ended_at"] is None

        progress.append(
            {
                "incident_id": project["Incident_id"],
                "project_name": project["Project_Name"],
                "title": project["Title"],
                "status": "open" if is_open else "closed",
                "priority": project["Priority"],
                "volunteers_helped": project["Volunteers_helped"],
                "team_count": len(project_teams),
                "progress_percent": 50 if is_open else 100,
            }
        )

    return {
        "project_count": len(projects),
        "open_project_count": len(
            [
                project
                for project in projects
                if project["Ended_at"] is None
            ]
        ),
        "projects": progress,
    }


def get_open_incident_statistics():
    open_incidents = list_active_incidents()
    by_priority = {}
    by_type = {}

    for incident in open_incidents:
        priority = incident["Priority"]
        incident_type = incident["Type"]

        by_priority[priority] = by_priority.get(priority, 0) + 1
        by_type[incident_type] = by_type.get(incident_type, 0) + 1

    return {
        "total_open_incidents": len(open_incidents),
        "urgent_open_incidents": by_priority.get("Urgent", 0),
        "open_projects": len(
            [
                incident
                for incident in open_incidents
                if incident["Is_Project"] is True
            ]
        ),
        "total_volunteers_helped": sum(
            incident["Volunteers_helped"]
            for incident in open_incidents
        ),
        "by_priority": by_priority,
        "by_type": by_type,
    }


def get_average_response_times():
    response_records = [
        volunteer_help["Response_Time_Seconds"]
        for volunteer_help in database["Volunteer_help"]
        if volunteer_help["Response_Time_Seconds"] is not None
    ]
    active_volunteer_times = [
        user["Avg_Response_Time_Mins"]
        for user in database["Users"]
        if user["Role"] == "volunteer" and user["Is_Active"] is True
    ]

    average_response_seconds = (
        sum(response_records) / len(response_records)
        if response_records
        else 0
    )
    average_volunteer_minutes = (
        sum(active_volunteer_times) / len(active_volunteer_times)
        if active_volunteer_times
        else 0
    )

    return {
        "average_response_time_seconds": average_response_seconds,
        "average_response_time_minutes": average_response_seconds / 60,
        "average_active_volunteer_response_time_minutes": average_volunteer_minutes,
        "response_record_count": len(response_records),
        "active_volunteer_count": len(active_volunteer_times),
    }


def get_activity_graph_data():
    incidents = database["Incidents"]
    open_incidents = list_active_incidents()
    closed_incidents = [
        incident
        for incident in incidents
        if incident["Ended_at"] is not None
    ]
    status_counts = {
        "open": len(open_incidents),
        "closed": len(closed_incidents),
    }
    priority_counts = {}
    type_counts = {}
    response_time_trend = []

    for incident in incidents:
        priority = incident["Priority"]
        incident_type = incident["Type"]

        priority_counts[priority] = priority_counts.get(priority, 0) + 1
        type_counts[incident_type] = type_counts.get(incident_type, 0) + 1

    for response in database["Volunteer_help"]:
        response_time_trend.append(
            {
                "created_at": response["Created_at"],
                "incident_id": response["Incident_id"],
                "response_time_minutes": response["Response_Time_Seconds"] / 60,
            }
        )

    return {
        "incident_status_counts": status_counts,
        "incident_priority_counts": priority_counts,
        "incident_type_counts": type_counts,
        "response_time_trend": response_time_trend,
        "volunteer_availability": {
            "active_volunteers": count_active_volunteers(),
            "registered_users": len(database["Users"]),
        },
    }


def get_real_time_management_information():
    open_incident_statistics = get_open_incident_statistics()
    response_times = get_average_response_times()
    project_progress = get_project_progress()
    volunteer_participation = get_volunteer_participation()
    active_volunteer_count = count_active_volunteers()
    urgent_open_incidents = open_incident_statistics["urgent_open_incidents"]
    open_project_count = project_progress["open_project_count"]

    decision_flags = {
        "urgent_incidents_need_attention": urgent_open_incidents > 0,
        "low_active_volunteer_availability": active_volunteer_count < urgent_open_incidents,
        "open_projects_need_monitoring": open_project_count > 0,
    }

    return {
        "current_workload": open_incident_statistics,
        "available_resources": {
            "active_volunteers": active_volunteer_count,
            "registered_users": len(database["Users"]),
            "volunteer_participation": volunteer_participation,
        },
        "operational_performance": response_times,
        "active_projects": project_progress,
        "incident_heatmap": get_incident_heatmap_data(),
        "activity_graphs": get_activity_graph_data(),
        "decision_flags": decision_flags,
    }
