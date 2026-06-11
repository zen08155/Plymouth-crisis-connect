from decimal import *
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from app.repositories.coordinator_repository import CoordinatorRepository

team_service = CoordinatorRepository()
router = APIRouter()

# TODO: Add verification, some urls are only accessible for coordinators etc..
# TODO: Remove volunteer from incident if removed from MAIN-team

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

#create team
@router.post("/teams")
def create_team(team: Teams):
    success = team_service.create_team(team.incident_id, team.coordinator_id, team.name, team.team_leader_id, team.task, team.created_at, team.is_active)

    if not success:
        raise HTTPException(500, "Team creation failed")

    return {"success": True, "message": "Team created"}

#add volunteer from team
@router.post("/teams/{team_id}/volunteers")
def add_volunteer_to_team(data : VolunteerModel, team_id : int):
    success = team_service.add_volunteer_to_team(data.volunteer_id, team_id)

    if not success:
        raise HTTPException(500, "Failed to add volunteer to team")

    return {"success": True, "message": "Volunteer added to team"}

#remove volunteer from team
@router.delete("/teams/{team_id}/remove/{volunteer_id}")
def remove_volunteer_from_team(volunteer_id : int, team_id :int):
    success = team_service.remove_volunteer_from_team(volunteer_id, team_id)

    if not success:
        raise HTTPException(500, "Failed to remove volunteer from team")

    return {"success": True, "message": "Volunteer removed from team"}

#appoint new teamlead
@router.patch("/teams/{team_id}")
def appoint_team_lead(team_id: int, data: VolunteerModel):
    success = team_service.appoint_team_lead(team_id, data.volunteer_id)

    if not success:
        raise HTTPException(500, "Failed to appoint team lead")

    return {"success": True, "message": "Team lead appointed"}


