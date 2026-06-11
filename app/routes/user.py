from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field
from typing import Literal
from app.repositories.user_account import UserAccount
from datetime import date
from app.security import create_access_token, verify_access_token

router = APIRouter()
service = UserAccount()

CERTIFICATE_TYPES = Literal[
    "First Aid",
    "Water Rescue",
    "Safeguarding",
    "Manual Handling",
    "Working at Height",
]


def authenticated_user_id(authorization: str | None) -> int:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Authentication is required")

    user_id = verify_access_token(authorization.removeprefix("Bearer ").strip())
    if user_id is None:
        raise HTTPException(401, "Your session is invalid or has expired")
    return user_id

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
        "token": create_access_token(user.user_id),
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
        "token": create_access_token(user.user_id),
        "user": {
            "id": user.user_id,
            "firstName": user.name,
            "surname": user.surname,
            "email": user.email,
            "role": user.role,
        }
    }
#endregion


class CertificateSubmission(BaseModel):
    certificate_type: CERTIFICATE_TYPES
    description: str = Field(min_length=3, max_length=255)
    file_name: str = Field(min_length=1, max_length=255)


class CertificateReview(BaseModel):
    status: Literal["verified", "rejected"]


def serialize_certificate(certificate: dict):
    return {
        "id": certificate["skillId"],
        "type": certificate["title"],
        "description": certificate["description"],
        "fileName": certificate["certificateName"],
        "status": certificate["verificationStatus"],
        "reviewedAt": certificate["reviewedAt"],
    }


@router.post("/certificates", status_code=201)
def submit_certificate(
    submission: CertificateSubmission,
    authorization: str | None = Header(default=None),
):
    user_id = authenticated_user_id(authorization)
    if service.get_user_role(user_id) != "volunteer":
        raise HTTPException(403, "Only volunteers can submit certificates")

    certificate_id = service.submit_certificate(
        user_id,
        submission.certificate_type,
        submission.description.strip(),
        submission.file_name.strip(),
    )
    return {
        "success": True,
        "certificateId": certificate_id,
        "message": "Certificate submitted for review",
    }


@router.get("/certificates/me")
def my_certificates(authorization: str | None = Header(default=None)):
    user_id = authenticated_user_id(authorization)
    return [
        serialize_certificate(certificate)
        for certificate in service.list_user_certificates(user_id)
    ]


@router.get("/certificate-submissions")
def certificate_submissions(authorization: str | None = Header(default=None)):
    reviewer_id = authenticated_user_id(authorization)
    if service.get_user_role(reviewer_id) not in {"coordinator", "system_manager"}:
        raise HTTPException(403, "Only coordinators and system managers can review certificates")

    return [
        {
            **serialize_certificate(certificate),
            "user": {
                "id": certificate["userId"],
                "name": f"{certificate['name']} {certificate['surname']}",
                "email": certificate["email"],
            },
        }
        for certificate in service.list_certificate_submissions()
    ]


@router.patch("/certificate-submissions/{certificate_id}")
def review_certificate(
    certificate_id: int,
    review: CertificateReview,
    authorization: str | None = Header(default=None),
):
    reviewer_id = authenticated_user_id(authorization)
    if service.get_user_role(reviewer_id) not in {"coordinator", "system_manager"}:
        raise HTTPException(403, "Only coordinators and system managers can review certificates")

    if not service.review_certificate(certificate_id, reviewer_id, review.status):
        raise HTTPException(404, "Certificate submission not found")
    return {"success": True, "status": review.status}

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
