from decimal import *
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from app.repositories.coordinator_repository import CoordinatorRepository



service = CoordinatorRepository()
router = APIRouter()

class Incident(BaseModel):
    coordinator_id: int
    title : str
    description: str
    incident_type: str
    important_data: str
    important_data_extra : str
    latitude : Decimal
    longitude : Decimal
    priority : str
    status: bool = True
    created_at : datetime | None = None
    created_by : int | None = None
    ended_at : datetime | None = None
    ended_by : int | None = None


class priority_update(BaseModel):
    priority: str | None = None

class update_des(BaseModel):
    description: str | None = None
    

#create
#FIXME: convert location to coords method has no endpoint yet.
@router.post("/incidents")
def create_incident(incident: Incident):
    success = service.create_incident(incident, incident.coordinator_id)

    if not success:
        raise HTTPException(500, "Failed to create incident")

    return {"success": True, "message": "Incident created"}

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







