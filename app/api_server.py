from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import mimetypes
import os
from urllib.parse import parse_qs, urlparse

from database.fake_database import database


ROOT_DIR = Path(__file__).resolve().parent.parent
DIST_DIR = ROOT_DIR / "dist"

DEFAULT_USER_SETTINGS = {
    "pushNotifications": True,
    "locationSharing": False,
    "emergencyAlerts": True,
    "availability": "available",
}


def normalize_priority(priority):
    priority = priority.lower()

    if priority == "urgent":
        return "critical"

    if priority == "medium":
        return "normal"

    if priority in ("low", "normal", "high", "critical"):
        return priority

    return "normal"


def serialize_incident(incident):
    return {
        "id": incident["Incident_id"],
        "incidentId": incident["Incident_id"],
        "title": incident["Title"],
        "description": incident["Description"],
        "type": incident["Type"],
        "latitude": incident["Latitude"],
        "longitude": incident["Longitude"],
        "priority": normalize_priority(incident["Priority"]),
        "status": "closed" if incident["Ended_at"] else "open",
        "volunteersHelped": incident["Volunteers_helped"],
        "createdAt": incident["Created_at"],
        "createdBy": incident["Created_by"],
    }


def find_incident(incident_id):
    return next(
        (
            incident
            for incident in database["Incidents"]
            if incident["Incident_id"] == incident_id
        ),
        None,
    )


def find_user(user_id):
    return next(
        (
            user
            for user in database["Users"]
            if user["User_id"] == user_id
        ),
        None,
    )


def public_user(user):
    return {
        "id": user["User_id"],
        "firstName": user["Name"],
        "surname": user["Surname"],
        "email": user["Email"],
        "role": user["Role"],
    }


def find_user_settings(user_id):
    return next(
        (
            settings
            for settings in database.setdefault("User_settings", [])
            if settings["User_id"] == user_id
        ),
        None,
    )


def public_settings(settings):
    return {
        "pushNotifications": bool(settings["Push_notifications"]),
        "locationSharing": bool(settings["Location_sharing"]),
        "emergencyAlerts": bool(settings["Emergency_alerts"]),
        "availability": settings["Availability"],
    }


def normalized_settings(payload, existing=None):
    current = public_settings(existing) if existing else DEFAULT_USER_SETTINGS
    availability = str(payload.get("availability", current["availability"]))

    if availability not in ("available", "busy", "offline"):
        availability = "available"

    return {
        "pushNotifications": bool(payload.get("pushNotifications", current["pushNotifications"])),
        "locationSharing": bool(payload.get("locationSharing", current["locationSharing"])),
        "emergencyAlerts": bool(payload.get("emergencyAlerts", current["emergencyAlerts"])),
        "availability": availability,
    }


class PlymouthApiHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path

        if path == "/incidents":
            incidents = [
                serialize_incident(incident)
                for incident in database["Incidents"]
                if incident["Ended_at"] is None
            ]
            self.send_json(incidents)
            return

        if path.startswith("/incidents/"):
            incident_id = self.parse_id(path, "/incidents/")
            incident = find_incident(incident_id)

            if incident is None:
                self.send_json({"message": "Incident not found."}, status=404)
                return

            self.send_json(serialize_incident(incident))
            return

        if path == "/api/settings":
            query = parse_qs(parsed_url.query)
            user_id = int(query.get("userId", ["2"])[0])
            user = find_user(user_id)

            if user is None:
                self.send_json({"message": "User not found."}, status=404)
                return

            settings = find_user_settings(user_id)

            if settings is None:
                settings = {
                    "User_id": user_id,
                    "Push_notifications": user.get("Push_notifications", DEFAULT_USER_SETTINGS["pushNotifications"]),
                    "Location_sharing": DEFAULT_USER_SETTINGS["locationSharing"],
                    "Emergency_alerts": DEFAULT_USER_SETTINGS["emergencyAlerts"],
                    "Availability": user.get("Status", DEFAULT_USER_SETTINGS["availability"]),
                }
                database.setdefault("User_settings", []).append(settings)

            self.send_json({"settings": public_settings(settings)})
            return

        self.serve_static(path)

    def do_POST(self):
        path = urlparse(self.path).path

        if path == "/api/login":
            payload = self.read_json()
            email = str(payload.get("email", "")).strip().lower()
            password = str(payload.get("password", ""))
            user = next(
                (
                    candidate
                    for candidate in database["Users"]
                    if candidate["Email"].lower() == email
                ),
                None,
            )

            if user is None or user["Password"] != password:
                self.send_json({"detail": "Invalid email or password."}, status=401)
                return

            self.send_json({"user": public_user(user)})
            return

        if path == "/api/register":
            payload = self.read_json()
            email = str(payload.get("email", "")).strip().lower()

            if any(user["Email"].lower() == email for user in database["Users"]):
                self.send_json(
                    {"detail": "An account with that email already exists."},
                    status=409,
                )
                return

            user = {
                "User_id": max(user["User_id"] for user in database["Users"]) + 1,
                "Password": str(payload.get("password", "")),
                "Name": str(payload.get("firstname", "")).strip(),
                "Surname": str(payload.get("surname", "")).strip(),
                "Email": email,
                "Role": "volunteer",
                "Phone_number": str(payload.get("phone_nr", "")).strip(),
                "DOB": str(payload.get("birthday", "")),
                "Created_At": None,
                "Updated_At": None,
                "Is_Active": True,
                "On_Call": False,
                "Avg_Response_Time_Mins": 0,
            }
            database["Users"].append(user)
            self.send_json(
                {"success": True, "message": "Account created", "user": public_user(user)},
                status=201,
            )
            return

        if path == "/api/settings":
            payload = self.read_json()
            user_id = int(payload.get("userId", 2))
            user = find_user(user_id)

            if user is None:
                self.send_json({"message": "User not found."}, status=404)
                return

            existing = find_user_settings(user_id)
            clean_settings = normalized_settings(payload, existing)

            if existing is None:
                existing = {"User_id": user_id}
                database.setdefault("User_settings", []).append(existing)

            existing.update(
                {
                    "Push_notifications": clean_settings["pushNotifications"],
                    "Location_sharing": clean_settings["locationSharing"],
                    "Emergency_alerts": clean_settings["emergencyAlerts"],
                    "Availability": clean_settings["availability"],
                }
            )
            user["Push_notifications"] = clean_settings["pushNotifications"]
            user["Status"] = clean_settings["availability"]

            self.send_json({"success": True, "settings": public_settings(existing)})
            return

        if path.startswith("/incidents/") and path.endswith("/join"):
            incident_id = self.parse_id(path.removesuffix("/join"), "/incidents/")
            payload = self.read_json()
            user_id = int(payload.get("userId", 2))
            incident = find_incident(incident_id)
            user = find_user(user_id)

            if incident is None:
                self.send_json({"success": False, "message": "Incident not found."}, status=404)
                return

            if user is None or user["Role"] != "volunteer":
                self.send_json({"success": False, "message": "Only volunteers can join incidents."}, status=403)
                return

            already_joined = any(
                record["Incident_id"] == incident_id and record["User_id"] == user_id
                for record in database["Volunteer_help"]
            )

            if not already_joined:
                database["Volunteer_help"].append(
                    {
                        "id": len(database["Volunteer_help"]) + 1001,
                        "User_id": user_id,
                        "Incident_id": incident_id,
                        "Created_at": None,
                        "Update_at": None,
                        "Ended_at": None,
                        "Response_Time_Seconds": None,
                    }
                )
                incident["Volunteers_helped"] += 1

            self.send_json(
                {
                    "success": True,
                    "message": "Volunteer joined incident.",
                    "incident": serialize_incident(incident),
                }
            )
            return

        self.send_json({"message": "Route not found."}, status=404)

    def do_OPTIONS(self):
        self.send_response(204)
        self.add_cors_headers()
        self.end_headers()

    def read_json(self):
        content_length = int(self.headers.get("Content-Length", 0))

        if content_length == 0:
            return {}

        body = self.rfile.read(content_length).decode("utf-8")
        return json.loads(body)

    def parse_id(self, path, prefix):
        value = path.removeprefix(prefix).strip("/")
        return int(value)

    def send_json(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.add_cors_headers()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def add_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def serve_static(self, path):
        requested = path.strip("/") or "index.html"
        file_path = DIST_DIR / requested

        if not file_path.exists() or file_path.is_dir():
            file_path = DIST_DIR / "index.html"

        if not file_path.exists():
            self.send_json(
                {"message": "Frontend build not found. Run npm run build first."},
                status=404,
            )
            return

        content = file_path.read_bytes()
        mime_type = mimetypes.guess_type(file_path)[0] or "application/octet-stream"

        self.send_response(200)
        self.send_header("Content-Type", mime_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)


def run():
    port = int(os.getenv("PORT", "0"))
    server = ThreadingHTTPServer(("0.0.0.0", port), PlymouthApiHandler)
    actual_port = server.server_address[1]
    print(f"Plymouth API server running at http://localhost:{actual_port}")
    server.serve_forever()


if __name__ == "__main__":
    run()
