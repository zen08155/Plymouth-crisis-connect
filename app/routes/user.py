from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.repositories.user_account import UserAccount
from datetime import date

router = APIRouter()
service = UserAccount()

@router.get("/michael")
def test():
    return {"success" : True, "message" : "Heeee heeee"}

#region register users
@router.post("/register")
def register(
    firstname: str,
    surname: str,
    password: str,
    email: str,
    phone_nr: str,
    birthday: date,
    role: str = "volunteer"
):
    success = service.create_account(
        firstname,
        surname,
        password,
        email,
        phone_nr,
        birthday,
        role
    )

    if not success:
        raise HTTPException(500, "User registration failed")
    return {"success": True, "message": "Account created"}

#endregion

#region login
class LoginRequests(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(data: LoginRequests):
    user = service.log_in(data.email, data.password)
    if user is None: 
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return user
#endregion

#region setskills
class UserSkills(BaseModel):
    user_id: int
    title: str
    description: str
    skill_type: str

    skill_description: str | None = None
    proof_of_certificate: str | None = None
    name_of_certificate: str | None = None
    expiration_date_certificate: date | None = None
    course_taken_at: date | None = None

@router.post("/skills")
def set_skills(skills: UserSkills):
    success = service.set_skills(skills.user_id, skills)
    if not success:
        raise HTTPException(500, "Setting skills failed")
    return {"success": True, "message" : "Skills set"}
#endregion

#region volunteer for team
class Volunteer(BaseModel):
    user_id: int
    incident_id: int

@router.post("/volunteer")
def volunteer_for(data: Volunteer):
    success = service.volunteer_for(data.user_id, data.incident_id)
    if not success: 
        raise HTTPException(500, "Volunteering for incident failed")
    return {"message": "Volunteered successfully"}

    
#endregion