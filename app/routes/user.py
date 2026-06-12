import base64
import binascii
import os
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import FileResponse
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


class ProfileUpdate(BaseModel):
    firstName: str = Field(min_length=1, max_length=255)
    surname: str = Field(min_length=1, max_length=255)
    email: str = Field(min_length=3, max_length=255)
    phone: str = Field(min_length=1, max_length=255)
    birthday: date
    password: str | None = Field(default=None, min_length=8, max_length=255)


def serialize_profile(user: dict):
    birthday = user["birthday"]
    return {
        "id": user["userId"],
        "firstName": user["name"],
        "surname": user["surname"],
        "email": user["email"],
        "role": user["role"],
        "phone": user["phoneNumber"],
        "birthday": birthday.date().isoformat()
        if hasattr(birthday, "date")
        else birthday.isoformat(),
    }


@router.get("/profile")
def profile(authorization: str | None = Header(default=None)):
    user_id = authenticated_user_id(authorization)
    user = service.get_profile(user_id)
    if user is None:
        raise HTTPException(404, "User account not found")
    return serialize_profile(user)


@router.patch("/profile")
def update_profile(
    profile_update: ProfileUpdate,
    authorization: str | None = Header(default=None),
):
    user_id = authenticated_user_id(authorization)
    name = profile_update.firstName.strip()
    surname = profile_update.surname.strip()
    email = profile_update.email.strip().lower()
    phone = profile_update.phone.strip()
    if not all((name, surname, email, phone)):
        raise HTTPException(422, "Name, surname, email, and phone are required.")

    try:
        user = service.update_profile(
            user_id=user_id,
            name=name,
            surname=surname,
            email=email,
            phone_number=phone,
            birthday=profile_update.birthday,
            password=profile_update.password,
        )
    except ValueError as error:
        if str(error) == "email_in_use":
            raise HTTPException(409, "An account with this email already exists.")
        raise

    if user is None:
        raise HTTPException(404, "User account not found")
    return serialize_profile(user)


@router.get("/system-manager/volunteers")
def system_manager_volunteers(authorization: str | None = Header(default=None)):
    manager_id = authenticated_user_id(authorization)
    if service.get_user_role(manager_id) != "system_manager":
        raise HTTPException(403, "Only system managers can manage volunteer roles")

    return [
        {
            "id": volunteer["userId"],
            "name": volunteer["name"],
            "surname": volunteer["surname"],
            "email": volunteer["email"],
            "status": volunteer["status"],
        }
        for volunteer in service.list_volunteers()
    ]


@router.patch("/system-manager/volunteers/{volunteer_id}/promote")
def promote_volunteer(
    volunteer_id: int,
    authorization: str | None = Header(default=None),
):
    manager_id = authenticated_user_id(authorization)
    if service.get_user_role(manager_id) != "system_manager":
        raise HTTPException(403, "Only system managers can promote volunteers")
    if manager_id == volunteer_id:
        raise HTTPException(400, "System managers cannot change their own role")

    volunteer = service.promote_volunteer(volunteer_id)
    if volunteer is None:
        raise HTTPException(409, "User is not an active volunteer")

    return {
        "success": True,
        "message": (
            f"{volunteer['name']} {volunteer['surname']} "
            "has been promoted to coordinator"
        ),
        "user": serialize_profile(volunteer),
    }


CertificateMimeType = Literal[
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
]


class CertificateFileSubmission(BaseModel):
    file_name: str = Field(min_length=1, max_length=255)
    file_data: str = Field(min_length=1)
    mime_type: CertificateMimeType


class CertificateSubmission(BaseModel):
    certificate_type: CERTIFICATE_TYPES
    description: str = Field(min_length=3, max_length=255)
    files: list[CertificateFileSubmission] = Field(min_length=1, max_length=5)


class CertificateReview(BaseModel):
    status: Literal["verified", "rejected"]


def serialize_certificate(certificate: dict):
    stored_path = certificate.get("proofOfCertificate")
    files = service.list_certificate_files(certificate["skillId"])
    serialized_files = [
        {
            "id": file["certificateFileId"],
            "name": file["originalName"],
            "mimeType": file["mimeType"],
            "available": Path(file["storedPath"]).is_file(),
        }
        for file in files
    ]
    if not serialized_files and stored_path and Path(stored_path).is_file():
        serialized_files.append(
            {
                "id": 0,
                "name": certificate["certificateName"],
                "mimeType": "",
                "available": True,
            }
        )
    return {
        "id": certificate["skillId"],
        "type": certificate["title"],
        "description": certificate["description"],
        "fileName": certificate["certificateName"],
        "status": certificate["verificationStatus"],
        "reviewedAt": certificate["reviewedAt"],
        "files": serialized_files,
        "fileAvailable": any(file["available"] for file in serialized_files),
    }


@router.post("/certificates", status_code=201)
def submit_certificate(
    submission: CertificateSubmission,
    authorization: str | None = Header(default=None),
):
    user_id = authenticated_user_id(authorization)
    if service.get_user_role(user_id) != "volunteer":
        raise HTTPException(403, "Only volunteers can submit certificates")
    if service.has_certificate_submission(user_id, submission.certificate_type):
        raise HTTPException(
            409,
            f"You have already submitted a {submission.certificate_type} certificate",
        )

    signatures = {
        "application/pdf": lambda data: data.startswith(b"%PDF-"),
        "image/jpeg": lambda data: data.startswith(b"\xff\xd8\xff"),
        "image/png": lambda data: data.startswith(b"\x89PNG\r\n\x1a\n"),
        "image/gif": lambda data: data.startswith((b"GIF87a", b"GIF89a")),
        "image/webp": lambda data: data.startswith(b"RIFF") and data[8:12] == b"WEBP",
    }
    extensions = {
        "application/pdf": ".pdf",
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
        "image/webp": ".webp",
    }
    upload_dir = Path(
        os.getenv("CERTIFICATE_UPLOAD_DIR", "uploads/certificates")
    ).resolve()
    upload_dir.mkdir(parents=True, exist_ok=True)
    validated_files = []
    stored_files = []

    for submitted_file in submission.files:
        try:
            file_bytes = base64.b64decode(submitted_file.file_data, validate=True)
        except (binascii.Error, ValueError):
            raise HTTPException(422, f"{submitted_file.file_name} could not be read")

        if not file_bytes:
            raise HTTPException(422, f"{submitted_file.file_name} is empty")
        if len(file_bytes) > 5 * 1024 * 1024:
            raise HTTPException(413, "Each certificate file must be 5 MB or smaller")
        if not signatures[submitted_file.mime_type](file_bytes):
            raise HTTPException(
                422,
                f"{submitted_file.file_name} does not match its file type",
            )
        validated_files.append((submitted_file, file_bytes))

    for submitted_file, file_bytes in validated_files:
        stored_path = (
            upload_dir / f"{uuid4().hex}{extensions[submitted_file.mime_type]}"
        )
        stored_path.write_bytes(file_bytes)
        stored_files.append(
            {
                "stored_path": str(stored_path),
                "original_name": submitted_file.file_name.strip(),
                "mime_type": submitted_file.mime_type,
            }
        )

    try:
        certificate_id = service.submit_certificate(
            user_id,
            submission.certificate_type,
            submission.description.strip(),
            stored_files,
        )
    except ValueError as error:
        for stored_file in stored_files:
            Path(stored_file["stored_path"]).unlink(missing_ok=True)
        if str(error) == "certificate_type_already_submitted":
            raise HTTPException(
                409,
                f"You have already submitted a {submission.certificate_type} certificate",
            )
        raise
    except Exception:
        for stored_file in stored_files:
            Path(stored_file["stored_path"]).unlink(missing_ok=True)
        raise
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


@router.get("/certificate-submissions/{certificate_id}/file")
def certificate_submission_file(
    certificate_id: int,
    authorization: str | None = Header(default=None),
):
    user_id = authenticated_user_id(authorization)
    certificate = service.get_certificate_file(certificate_id)
    if certificate is None:
        raise HTTPException(404, "Certificate submission not found")

    role = service.get_user_role(user_id)
    if certificate["userId"] != user_id and role not in {"coordinator", "system_manager"}:
        raise HTTPException(403, "You do not have access to this certificate file")

    file_path = Path(certificate["proofOfCertificate"] or "")
    if not file_path.is_file():
        raise HTTPException(404, "No file is stored for this submission")

    return FileResponse(
        file_path,
        filename=certificate["certificateName"],
        content_disposition_type="inline",
    )


@router.get("/certificate-submissions/{certificate_id}/files/{file_id}")
def certificate_submission_attachment(
    certificate_id: int,
    file_id: int,
    authorization: str | None = Header(default=None),
):
    user_id = authenticated_user_id(authorization)
    certificate = service.get_certificate_attachment(certificate_id, file_id)
    if certificate is None:
        raise HTTPException(404, "Certificate file not found")

    role = service.get_user_role(user_id)
    if certificate["userId"] != user_id and role not in {"coordinator", "system_manager"}:
        raise HTTPException(403, "You do not have access to this certificate file")

    file_path = Path(certificate["storedPath"])
    if not file_path.is_file():
        raise HTTPException(404, "The certificate file is no longer available")

    return FileResponse(
        file_path,
        media_type=certificate["mimeType"],
        filename=certificate["originalName"],
        content_disposition_type="inline",
    )


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
