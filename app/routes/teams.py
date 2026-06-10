from decimal import *
from datetime import datetime
from fastapi import APIRouter, FastAPI
from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from app.repositories.coordinator_repository import CoordinatorRepository

team_service = CoordinatorRepository()
router = APIRouter()


class Teams(BaseModel):
    team_id:int
    incident_id: int
    coordinator_id:int
    team_leader_id: int | None = None
    name: str
    task:str
    created_at : datetime | None = datetime.now()
    is_active: bool = True

class VolunteerModel(BaseModel):
    volunteer_id: int
    team_id: int

@router.post("/teams")
def create_team(team: Teams):
    success = team_service.create_team(team.incident_id, team.coordinator_id, team.name, team.team_leader_id, team.task, team.created_at, team.is_active)

    if not success:
        return {"success": False, "message": "Team creation failed"}

    return {"success": True, "message": "Team created"}


@router.post("/teams/add_volunteer")
def add_volunteer_to_team(data : VolunteerModel):
    success = team_service.add_volunteer_to_team(data.volunteer_id, data.team_id)

    if not success:
        return {"success": False, "message": "Failed to add volunteer to team"}

    return {"success": True, "message": "Volunteer added to team"}


@router.post("/teams/remove_volunteer")
def remove_volunteer_from_team(data : VolunteerModel):
    success = team_service.remove_volunteer_from_team(data.volunteer_id, data.team_id)

    if not success:
        return {"success": False, "message": "Failed to remove volunteer from team"}

    return {"success": True, "message": "Volunteer removed from team"}
    
@router.post("/teams/appoint_lead")
def appoint_team_lead(data : VolunteerModel):
    success = team_service.appoint_team_lead(data.team_id, data.volunteer_id)

    if not success:
        return {"success": False, "message": "Failed to appoint team lead"}

    return {"success": True, "message": "Team lead appointed"}


