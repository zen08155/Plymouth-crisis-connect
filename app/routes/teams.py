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
    teamId:int
    incidentid: int
    coordinatorId:int
    teamLeaderid: int
    name: str
    task:str
    created_at : datetime | None = None
    isActive: bool | None = None




@router.post("/teams")
def create_team(team: Teams):
    success = team_service.create_team(team)

    if not success:
        return {"success": False, "message": "Team creation failed"}

    return {"success": True, "message": "Team created"}

@router.post("/teams/add_volunteer")
def add_volunteer_to_team(volunteer_id : int, team_id : int):
    success = team_service.add_volunteer_to_team(volunteer_id, team_id)

    if not success:
        return {"success": False, "message": "Failed to add volunteer to team"}

    return {"success": True, "message": "Volunteer added to team"}

@router.post("/teams/remove_volunteer")
def remove_volunteer_from_team(volunteer_id : int, team_id : int):
    success = team_service.remove_volunteer_from_team(volunteer_id, team_id)

    if not success:
        return {"success": False, "message": "Failed to remove volunteer from team"}

    return {"success": True, "message": "Volunteer removed from team"}
    



def appoint_team_lead(volunteer_id : int, team_id : int):
    success = team_service.appoint_team_lead(team_id, volunteer_id)

    if not success:
        return {"success": False, "message": "Failed to appoint team lead"}

    return {"success": True, "message": "Team lead appointed"}


