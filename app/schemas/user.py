from pydantic import BaseModel, Field, field_validator


class VolunteerRegistrationRequest(BaseModel):
    first_name: str = Field(min_length=1, max_length=80)
    surname: str = Field(min_length=1, max_length=80)
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=8, max_length=128)
    country_code: str = Field(min_length=2, max_length=5)
    phone: str = Field(min_length=5, max_length=30)
    date_of_birth: str
    home_address: str | None = Field(default=None, max_length=300)
    work_address: str | None = Field(default=None, max_length=300)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        normalized = value.strip().casefold()
        if "@" not in normalized or "." not in normalized.rsplit("@", 1)[-1]:
            raise ValueError("Enter a valid email address.")
        return normalized

    @field_validator("country_code")
    @classmethod
    def validate_country_code(cls, value: str) -> str:
        if not value.startswith("+") or not value[1:].isdigit():
            raise ValueError("Enter a valid country code.")
        return value
