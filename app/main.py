from controllers.system_manager_controller import (
    filter_dashboard_statistics,
    login_system_manager,
    manage_user_role,
    monitor_project_progress,
    monitor_volunteer_participation,
    promote_volunteer,
    view_activity_graphs,
    view_active_incidents,
    view_active_projects,
    view_active_volunteer_count,
    view_average_response_times,
    view_incident_heatmap,
    view_open_incident_statistics,
    view_real_time_management_information,
    view_registered_users,
)


if __name__ == "__main__":
    login_response = login_system_manager(
        email="manager@example.com",
        password="hashed_password_789",
    )
    response = promote_volunteer(manager_id=3, volunteer_id=2)
    users_response = view_registered_users(manager_id=3)
    role_response = manage_user_role(
        manager_id=3,
        target_user_id=1,
        new_role="volunteer",
    )
    incidents_response = view_active_incidents(manager_id=3)
    projects_response = view_active_projects(manager_id=3)
    active_volunteers_response = view_active_volunteer_count(manager_id=3)
    incident_stats_response = view_open_incident_statistics(manager_id=3)
    response_times_response = view_average_response_times(manager_id=3)
    activity_graphs_response = view_activity_graphs(manager_id=3)
    heatmap_response = view_incident_heatmap(manager_id=3)
    filtered_stats_response = filter_dashboard_statistics(
        manager_id=3,
        filters={"Is_Project": True},
    )
    participation_response = monitor_volunteer_participation(manager_id=3)
    project_progress_response = monitor_project_progress(manager_id=3)
    management_info_response = view_real_time_management_information(manager_id=3)

    print(login_response["message"])
    print(response["message"])
    print(f"New role: {response['volunteer']['Role']}")
    print(users_response["message"])
    print(role_response["message"])
    print(incidents_response["message"])
    print(projects_response["message"])
    print(active_volunteers_response["message"])
    print(incident_stats_response["message"])
    print(response_times_response["message"])
    print(activity_graphs_response["message"])
    print(heatmap_response["message"])
    print(filtered_stats_response["message"])
    print(participation_response["message"])
    print(project_progress_response["message"])
    print(management_info_response["message"])
