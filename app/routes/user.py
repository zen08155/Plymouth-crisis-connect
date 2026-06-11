from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.repositories.user_account import UserAccount
from datetime import date

router = APIRouter()
service = UserAccount()

@router.get("/michael")
def test():
    return {"success" : True, "message" : "Heeee heeee"}

class RegisterRequest(BaseModel):
    firstname: str
    surname: str
    password: str
    email: str
    phone_nr: str
    birthday: date


@router.post("/register", status_code=201)
def register(data: RegisterRequest):
    success = service.create_account(
        data.firstname.strip(),
        data.surname.strip(),
        data.password,
        data.email.strip().lower(),
        data.phone_nr.strip(),
        data.birthday,
        "volunteer",
    )

    if not success:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists or registration failed.",
        )

    user = service.log_in(data.email.strip().lower(), data.password)
    if user is None:
        raise HTTPException(
            status_code=500,
            detail="Account created, but automatic login failed.",
        )

    return {
        "success": True,
        "message": "Account created",
        "user": {
            "id": user.user_id,
            "firstName": user.name,
            "surname": user.surname,
            "email": user.email,
            "role": user.role,
        },
    }

#region login
class LoginRequests(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(data: LoginRequests):
    user = service.log_in(data.email.strip().lower(), data.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {
        "user": {
            "id": user.user_id,
            "firstName": user.name,
            "surname": user.surname,
            "email": user.email,
            "role": user.role,
        }
    }
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
