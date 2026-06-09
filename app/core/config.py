import os
from dataclasses import dataclass
from functools import lru_cache


@dataclass(frozen=True)
class Settings:
    app_env: str
    database_url: str
    session_cookie_secure: bool
    session_duration_hours: int


def _as_bool(value: str) -> bool:
    return value.strip().lower() in {"1", "true", "yes", "on"}


@lru_cache
def get_settings() -> Settings:
    return Settings(
        app_env=os.getenv("APP_ENV", "development"),
        database_url=os.getenv(
            "DATABASE_URL",
            "postgresql+psycopg://plymouth:plymouth_dev_password"
            "@localhost:5432/plymouth_crisis_connect",
        ),
        session_cookie_secure=_as_bool(
            os.getenv("SESSION_COOKIE_SECURE", "false")
        ),
        session_duration_hours=int(os.getenv("SESSION_DURATION_HOURS", "8")),
    )
