from datetime import datetime, timezone
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field
from typing import Literal
from decimal import Decimal
from app.repositories.coordinator_repository import CoordinatorRepository
from app.repositories.user_account import UserAccount
from app.security import verify_access_token



service = CoordinatorRepository()
user_service = UserAccount()
router = APIRouter()

class Incident(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=10)
    incident_type: Literal[
        "Flood",
        "Fire",
        "Medical",
        "Storm",
        "Shelter",
        "Relief",
        "Infrastructure",
        "Search and Rescue",
    ]
    important_data: str = Field(max_length=255)
    important_data_extra: str = Field(max_length=255)
    latitude: Decimal = Field(ge=Decimal("50.32"), le=Decimal("50.45"))
    longitude: Decimal = Field(ge=Decimal("-4.25"), le=Decimal("-4.02"))
    priority: Literal["low", "normal", "high", "critical"]
    required_certificate: Literal[
        "First Aid",
        "Water Rescue",
        "Safeguarding",
        "Manual Handling",
        "Working at Height",
    ] | None = None
    status: bool = True
    created_at : datetime | None = None
    available_at: datetime | None = None
    created_by : int | None = None
    ended_at : datetime | None = None
    ended_by : int | None = None


class priority_update(BaseModel):
    priority: str | None = None

class update_des(BaseModel):
    description: str | None = None

def serialize_incident(incident: dict):
    available_at = incident["availableAt"]
    if available_at is not None and available_at.tzinfo is None:
        available_at = available_at.replace(tzinfo=timezone.utc)

    result = {
        "id": incident["incidentId"],
        "incidentId": incident["incidentId"],
        "title": incident["title"],
        "description": incident["description"],
        "type": incident["type"],
        "latitude": float(incident["latitude"]),
        "longitude": float(incident["longitude"]),
        "priority": incident["priority"],
        "requiredCertificate": incident["requiredCertificate"],
        "status": "closed" if incident["endedAt"] else "open",
        "createdAt": incident["createdAt"],
        "availableAt": available_at,
        "createdBy": incident["createdBy"],
    }
    if "joinedAt" in incident:
        result["joinedAt"] = incident["joinedAt"]
        result["participationStatus"] = incident["participationStatus"]
    return result


@router.get("/incidents")
def get_incidents():
    try:
        return [
            serialize_incident(incident)
            for incident in service.list_active_incidents()
        ]
    except Exception as error:
        raise HTTPException(500, "Failed to load incidents") from error


@router.get("/incidents/mine/active")
def get_my_active_incidents(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Authentication is required")

    user_id = verify_access_token(authorization.removeprefix("Bearer ").strip())
    if user_id is None:
        raise HTTPException(401, "Your session is invalid or has expired")
    if user_service.get_user_role(user_id) != "volunteer":
        raise HTTPException(403, "Only volunteers have joined task lists")

    try:
        return [
            serialize_incident(incident)
            for incident in user_service.list_active_incidents_for_volunteer(user_id)
        ]
    except Exception as error:
        raise HTTPException(500, "Failed to load your active tasks") from error


@router.get("/incidents/{incident_id}")
def get_incident(incident_id: int):
    try:
        incident = service.get_incident(incident_id)
    except Exception as error:
        raise HTTPException(500, "Failed to load incident") from error

    if incident is None:
        raise HTTPException(404, "Incident not found")

    return serialize_incident(incident)

#create
#FIXME: convert location to coords method has no endpoint yet.
@router.post("/incidents", status_code=201)
def create_incident(incident: Incident, authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Authentication is required")

    coordinator_id = verify_access_token(authorization.removeprefix("Bearer ").strip())
    if coordinator_id is None:
        raise HTTPException(401, "Your session is invalid or has expired")

    if not user_service.can_create_incidents(coordinator_id):
        raise HTTPException(403, "Only an active coordinator can create incidents")

    incident_id = service.create_incident(incident, coordinator_id)
    if incident_id is None:
        raise HTTPException(500, "Failed to create incident")

    return {
        "success": True,
        "message": "Incident created",
        "incidentId": incident_id,
    }

#update description
@router.patch("/incidents/{incident_id}")
def update_incident_description(incident_id: int, update: update_des):
    if update.description is None:
        raise HTTPException(400, "Description is required")
    
    success = service.update_description(incident_id , update.description)
    if not success:
        raise HTTPException(400, "Incident not found")
    
    return {"success": True, "message": "Description updated successfully"}
 
#update priority
@router.patch("/incidents/{incident_id}/priority")
def update_incident_priority(incident_id: int, update: priority_update):
    if update.priority is None:
        raise HTTPException(400, "Priority is required")

    success = service.update_priority(incident_id, update.priority)
    if not success:
        raise HTTPException(400, "Incident not found")
    
    return {"success": True, "message": "Priority updated successfully"}


@router.post("/incidents/{incident_id}/join")
def join_incident(
    incident_id: int,
    authorization: str | None = Header(default=None),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Authentication is required")

    user_id = verify_access_token(authorization.removeprefix("Bearer ").strip())
    if user_id is None:
        raise HTTPException(401, "Your session is invalid or has expired")
    if user_service.get_user_role(user_id) != "volunteer":
        raise HTTPException(403, "Only volunteers can join incidents")

    incident = service.get_incident(incident_id)
    if incident is None:
        raise HTTPException(404, "Incident not found")
    if incident["endedAt"] is not None or not incident["status"]:
        raise HTTPException(409, "This incident has ended")
    available_at = incident["availableAt"]
    if available_at is not None and available_at > datetime.now(timezone.utc).replace(tzinfo=None):
        raise HTTPException(409, "This incident is not available yet")

    required_certificate = incident["requiredCertificate"]
    if (
        required_certificate
        and not user_service.has_verified_certificate(user_id, required_certificate)
    ):
        raise HTTPException(
            403,
            f"This incident requires a verified {required_certificate} certificate",
        )

    if not user_service.volunteer_for(user_id, incident_id):
        raise HTTPException(409, "Unable to volunteer for this incident")

    return {"success": True, "message": "Volunteered successfully"}


@router.post("/incidents/{incident_id}/close")
def close_incident(
    incident_id: int,
    authorization: str | None = Header(default=None),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Authentication is required")

    user_id = verify_access_token(authorization.removeprefix("Bearer ").strip())
    if user_id is None:
        raise HTTPException(401, "Your session is invalid or has expired")

    role = user_service.get_user_role(user_id)
    if role not in {"coordinator", "system_manager"}:
        raise HTTPException(
            403,
            "Only coordinators and system managers can end incidents",
        )

    incident = service.get_incident(incident_id)
    if incident is None:
        raise HTTPException(404, "Incident not found")
    if incident["endedAt"] is not None or not incident["status"]:
        raise HTTPException(409, "Incident has already ended")
    if role == "coordinator" and incident["createdBy"] != user_id:
        raise HTTPException(403, "Coordinators can only end incidents they created")

    try:
        closed = service.close_incident(
            user_id,
            incident_id,
            allow_any_incident=role == "system_manager",
        )
    except Exception as error:
        raise HTTPException(500, "Failed to end incident") from error

    if not closed:
        raise HTTPException(409, "Incident could not be ended")

    return {"success": True, "message": "Incident ended"}
