import bcrypt
from datetime import datetime, timezone

from app.database.fake_database import database
from app.models.User import User


ALLOWED_ROLES = ["volunteer", "coordinator", "system_manager"]


def get_user_by_email(email: str) -> User | None:
    user_data = next(
        (
            user
            for user in database["Users"]
            if user["Email"].casefold() == email.casefold()
        ),
        None,
    )
    return User(user_data) if user_data else None


def get_user_by_id(user_id: int) -> User | None:
    user_data = next(
        (user for user in database["Users"] if user["User_id"] == user_id),
        None,
    )
    return User(user_data) if user_data else None


def authenticate_user(email: str, password: str) -> User | None:
    user = get_user_by_email(email)

    if user is None or not user.is_active:
        return None

    password_matches = bcrypt.checkpw(
        password.encode(),
        user.data["Password"].encode(),
    )
    return user if password_matches else None


def authenticate_system_manager(email: str, password: str) -> User | None:
    user = authenticate_user(email, password)
    return user if user is not None and user.role == "system_manager" else None


def create_volunteer(registration: dict) -> User:
    if get_user_by_email(registration["email"]) is not None:
        raise ValueError("An account with this email already exists.")

    phone = "".join(
        character
        for character in registration["phone"]
        if character.isdigit()
    )
    if phone.startswith("0"):
        phone = phone[1:]

    now = datetime.now(timezone.utc).isoformat()
    next_user_id = max(
        (user["User_id"] for user in database["Users"]),
        default=0,
    ) + 1
    user_data = {
        "User_id": next_user_id,
        "Password": bcrypt.hashpw(
            registration["password"].encode(),
            bcrypt.gensalt(),
        ).decode(),
        "Name": registration["first_name"].strip(),
        "Surname": registration["surname"].strip(),
        "Email": registration["email"],
        "Role": "volunteer",
        "Phone_number": f"{registration['country_code']}{phone}",
        "DOB": registration["date_of_birth"],
        "Home_Address": registration.get("home_address") or None,
        "Work_Address": registration.get("work_address") or None,
        "Created_At": now,
        "Updated_At": now,
        "Is_Active": True,
        "On_Call": False,
        "Avg_Response_Time_Mins": 0,
    }
    database["Users"].append(user_data)
    return User(user_data)


def list_registered_users() -> list[dict]:
    return [User(user).without_password() for user in database["Users"]]


def count_active_volunteers() -> int:
    return sum(
        1
        for user in database["Users"]
        if user["Role"] == "volunteer" and user["Is_Active"] is True
    )


def update_user_role(user_id: int, new_role: str) -> User | None:
    user = get_user_by_id(user_id)

    if user is None:
        return None

    user.data["Role"] = new_role
    user.data["Updated_At"] = datetime.now(timezone.utc).isoformat()
    return user


def is_trusted_volunteer(user_id: int) -> bool:
    volunteer_skill_ids = {
        volunteer_skill["Skills_id"]
        for volunteer_skill in database["Volunteer_skills"]
        if volunteer_skill["User_id"] == user_id
    }

    return any(
        skill["skills_id"] in volunteer_skill_ids
        and skill["Certified"] == "Yes"
        and skill["reliability"] == "Trustworthy"
        for skill in database["Skills"]
    )


def get_volunteer_participation() -> dict:
    helped_user_ids = {
        volunteer_help["User_id"]
        for volunteer_help in database["Volunteer_help"]
    }
    participation_by_user = {
        user["User_id"]: {
            "user_id": user["User_id"],
            "name": f"{user['Name']} {user['Surname']}",
            "current_role": user["Role"],
            "incidents_helped": 0,
            "average_response_time_minutes": user["Avg_Response_Time_Mins"],
        }
        for user in database["Users"]
        if user["Role"] == "volunteer" or user["User_id"] in helped_user_ids
    }

    for volunteer_help in database["Volunteer_help"]:
        participation = participation_by_user.get(volunteer_help["User_id"])
        if participation:
            participation["incidents_helped"] += 1

    volunteers = list(participation_by_user.values())
    return {
        "volunteer_count": len(volunteers),
        "total_participations": sum(
            volunteer["incidents_helped"] for volunteer in volunteers
        ),
        "volunteers": volunteers,
    }
