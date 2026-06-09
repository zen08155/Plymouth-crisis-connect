from decimal import *
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel
from app.repositories.coordinator_repository import CoordinatorRepository


update_data_service = CoordinatorRepository()
router = APIRouter()
class priority_update(BaseModel):
    priority: Optional[str] = None

class update_des(BaseModel):
    description: Optional[str] = None
    
@router.patch("/incidents/{incident_id}")
def update_incident_description(incident_id: str, update: update_des):
    if update.description is not None:
        success = update_data_service.update_description(int(incident_id), update.description)
        if not success:
            return {"success": False, "message": "Failed to update description"}
    return {"success": True, "message": "Description updated successfully"}


@router.patch("/incidents/{incident_id}/priority")

def update_incident_priority(incident_id: str, update: priority_update):
    if update.priority is not None:
        success = update_data_service.update_priority(int(incident_id), update.priority)
        if not success:
            return {"success": False, "message": "Failed to update priority"}
    return {"success": True, "message": "Priority updated successfully"}
