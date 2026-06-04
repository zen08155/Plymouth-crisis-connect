database = {
    "Users": [
        {
            "User_id": 1,
            "Password": "hashed_password_123",
            "Name": "John",
            "Surname": "Doe",
            "Email": "john@example.com",
            "Role": "coordinator",
            "Phone_number": "+123456789",
            "DOB": "1990-01-01 00:00:00",
            "Created_At": "2023-01-01 10:00:00",
            "Updated_At": "2023-01-01 10:00:00",
            "Is_Active": True,
            "On_Call": True,
            "Avg_Response_Time_Mins": 15,
        },
        {
            "User_id": 2,
            "Password": "hashed_password_456",
            "Name": "Jane",
            "Surname": "Smith",
            "Email": "jane@example.com",
            "Role": "volunteer",
            "Phone_number": "+987654321",
            "DOB": "1995-05-12 00:00:00",
            "Created_At": "2023-02-15 12:00:00",
            "Updated_At": "2023-02-15 12:00:00",
            "Is_Active": True,
            "On_Call": True,
            "Avg_Response_Time_Mins": 8,
        },
        {
            "User_id": 3,
            "Password": "hashed_password_789",
            "Name": "Sam",
            "Surname": "Manager",
            "Email": "manager@example.com",
            "Role": "system_manager",
            "Phone_number": "+44123456789",
            "DOB": "1985-03-20 00:00:00",
            "Created_At": "2023-01-01 09:00:00",
            "Updated_At": "2023-01-01 09:00:00",
            "Is_Active": True,
            "On_Call": False,
            "Avg_Response_Time_Mins": 0,
        },
    ],
    "Skills": [
        {
            "skills_id": 501,
            "Title": "First Aid",
            "description": "Basic life support",
            "skills": "Medical",
            "Skills_description": None,
            "Certified": "Yes",
            "reliability": "Trustworthy",
            "Proof_of_Certificate": "cert_url_001",
            "Certificate_name": "Red Cross Cert",
            "ExpirationDate_certificate": "2025-12-31 23:59:59",
            "Course_taken_at": "2022-05-01 00:00:00",
        }
    ],
    "Volunteer_skills": [
        {
            "id": 1,
            "Skills_id": 501,
            "User_id": 2,
        }
    ],
}


def find_user(user_id):
    return next((user for user in database["Users"] if user["User_id"] == user_id), None)


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
