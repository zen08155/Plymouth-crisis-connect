from fastapi.testclient import TestClient

from app.database.fake_database import database
from app.main import app


client = TestClient(app)


def login_headers() -> dict[str, str]:
    response = client.post(
        "/api/system-manager/login",
        json={
            "email": "manager@example.com",
            "password": "manager123",
        },
    )
    assert response.status_code == 200
    token = response.json()["data"]["token"]
    return {"Authorization": f"Bearer {token}"}


def test_health_check():
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_login_rejects_bad_password():
    response = client.post(
        "/api/system-manager/login",
        json={
            "email": "manager@example.com",
            "password": "wrong-password",
        },
    )

    assert response.status_code == 401


def test_generic_login_returns_volunteer_role():
    response = client.post(
        "/api/auth/login",
        json={
            "email": "jane@example.com",
            "password": "volunteer123",
        },
    )

    assert response.status_code == 200
    assert response.json()["data"]["user"]["Role"] == "volunteer"


def test_generic_login_returns_coordinator_role():
    response = client.post(
        "/api/auth/login",
        json={
            "email": "john@example.com",
            "password": "coordinator123",
        },
    )

    assert response.status_code == 200
    assert response.json()["data"]["user"]["Role"] == "coordinator"


def test_generic_login_returns_system_manager_role():
    response = client.post(
        "/api/auth/login",
        json={
            "email": "manager@example.com",
            "password": "manager123",
        },
    )

    assert response.status_code == 200
    assert response.json()["data"]["user"]["Role"] == "system_manager"


def test_protected_route_requires_login():
    response = client.get("/api/system-manager/users")

    assert response.status_code == 401


def test_system_manager_can_view_users():
    response = client.get(
        "/api/system-manager/users",
        headers=login_headers(),
    )

    assert response.status_code == 200
    users = response.json()["data"]
    assert len(users) == 3
    assert all("Password" not in user for user in users)


def test_system_manager_can_promote_trusted_volunteer():
    volunteer = next(
        user for user in database["Users"] if user["User_id"] == 2
    )
    original_role = volunteer["Role"]
    volunteer["Role"] = "volunteer"

    try:
        response = client.post(
            "/api/system-manager/users/2/promote",
            headers=login_headers(),
        )

        assert response.status_code == 200
        assert response.json()["data"]["Role"] == "coordinator"
    finally:
        volunteer["Role"] = original_role


def test_realtime_dashboard_contains_decision_data():
    response = client.get(
        "/api/system-manager/dashboard/realtime",
        headers=login_headers(),
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert "current_workload" in data
    assert "available_resources" in data
    assert "decision_flags" in data


def test_logout_revokes_session():
    headers = login_headers()
    logout = client.post("/api/system-manager/logout", headers=headers)
    after_logout = client.get("/api/system-manager/users", headers=headers)

    assert logout.status_code == 200
    assert after_logout.status_code == 401


def test_volunteer_can_register():
    email = "new.volunteer@example.com"

    try:
        response = client.post(
            "/api/users/register",
            json={
                "first_name": "New",
                "surname": "Volunteer",
                "email": email,
                "password": "strong-password",
                "country_code": "+31",
                "phone": "0612345678",
                "date_of_birth": "1998-04-12",
                "home_address": "Plymouth",
                "work_address": "",
            },
        )

        assert response.status_code == 201
        user = response.json()["data"]
        assert user["Role"] == "volunteer"
        assert user["Phone_number"] == "+31612345678"
        assert "Password" not in user
    finally:
        database["Users"][:] = [
            user for user in database["Users"] if user["Email"] != email
        ]


def test_registration_rejects_duplicate_email():
    response = client.post(
        "/api/users/register",
        json={
            "first_name": "Duplicate",
            "surname": "Manager",
            "email": "manager@example.com",
            "password": "strong-password",
            "country_code": "+44",
            "phone": "07123456789",
            "date_of_birth": "1990-01-01",
        },
    )

    assert response.status_code == 409
