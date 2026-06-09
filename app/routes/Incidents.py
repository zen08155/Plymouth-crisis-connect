from decimal import *
from datetime import datetime
from fastapi import APIRouter, FastAPI
from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from app.repositories.coordinator_repository import CoordinatorRepository



incident_service = CoordinatorRepository()
router = APIRouter()

class Incident(BaseModel):
    title : str
    description: str
    incident_type: str
    important_data: str
    important_data_extra : str
    latitude : Decimal
    longitude : Decimal
    priority : str
    created_at : datetime | None = None
    created_by : int | None = None
    ended_at : datetime | None = None
    ended_by : int | None = None
    notification_id : int | None = None
    incident_id : int | None = None




@router.post("/incidents")
def create_incident(incident: Incident, coordinator_id: int):
    success = incident_service.create_incident(incident, coordinator_id)

    if not success:
        return {"success": False, "message": "Incident creation failed"}

    return {"success": True, "message": "Incident created"}






