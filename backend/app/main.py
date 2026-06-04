from api.system_manager_controller import promote_volunteer


if __name__ == "__main__":
    response = promote_volunteer(manager_id=3, volunteer_id=2)

    print(response["message"])
    print(f"New role: {response['volunteer']['Role']}")
