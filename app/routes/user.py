from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.repositories.user_account import UserAccount
from datetime import date

router = APIRouter()
user_service = UserAccount()

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
    success = user_service.create_account(
        firstname,
        surname,
        password,
        email,
        phone_nr,
        birthday,
        role
    )

    if not success:
        return {"success": False, "message": "Registration failed"}

    return {"success": True, "message": "Account created"}

#endregion

#region login
class LoginRequests(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(data: LoginRequests):
    user = user_service.log_in(data.email, data.password)
    if user is None: 
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return user
#endregion

#region setskills
class UserSkills(BaseModel):
    id: int | None = None
    title: str
    description: str
    skill_type: str

    skill_description: str | None = None
    proof_of_certificate: str | None = None
    name_of_certificate: str | None = None
    expiration_date_certificate: date | None = None
    course_taken_at: date | None = None

@router.post("user/skills")
def set_skills(skills: UserSkills)
#endregion
