import enum
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


def enum_values(enum_class):
    return [item.value for item in enum_class]


class UserRole(str, enum.Enum):
    SYSTEM_MANAGER = "system_manager"
    COORDINATOR = "coordinator"
    VOLUNTEER = "volunteer"


class IncidentPriority(str, enum.Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"


class IncidentStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"


class ParticipationStatus(str, enum.Enum):
    JOINED = "joined"
    ACTIVE = "active"
    COMPLETED = "completed"
    REMOVED = "removed"
    LEFT = "left"


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    role: Mapped[UserRole] = mapped_column(
        Enum(
            UserRole,
            name="user_role",
            values_callable=enum_values,
        ),
        default=UserRole.VOLUNTEER,
        index=True,
    )
    phone_number: Mapped[str | None] = mapped_column(String(32))
    date_of_birth: Mapped[date | None] = mapped_column(Date)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    on_call: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    availability_status: Mapped[str] = mapped_column(
        String(32),
        default="unavailable",
    )
    average_response_time_seconds: Mapped[int | None] = mapped_column(Integer)

    created_incidents: Mapped[list["Incident"]] = relationship(
        foreign_keys="Incident.created_by_id",
        back_populates="created_by",
    )
    volunteer_skills: Mapped[list["VolunteerSkill"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    sessions: Mapped[list["UserSession"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(150), unique=True)
    description: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(100), index=True)
    requires_certificate: Mapped[bool] = mapped_column(Boolean, default=False)

    volunteers: Mapped[list["VolunteerSkill"]] = relationship(
        back_populates="skill",
        cascade="all, delete-orphan",
    )


class VolunteerSkill(Base):
    __tablename__ = "volunteer_skills"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "skill_id",
            name="uq_volunteer_skills_user_skill",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    skill_id: Mapped[int] = mapped_column(
        ForeignKey("skills.id", ondelete="CASCADE"),
        index=True,
    )
    description: Mapped[str | None] = mapped_column(Text)
    is_certified: Mapped[bool] = mapped_column(Boolean, default=False)
    certificate_name: Mapped[str | None] = mapped_column(String(255))
    certificate_url: Mapped[str | None] = mapped_column(String(500))
    certificate_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )
    course_taken_at: Mapped[date | None] = mapped_column(Date)

    user: Mapped[User] = relationship(back_populates="volunteer_skills")
    skill: Mapped[Skill] = relationship(back_populates="volunteers")


class Incident(TimestampMixin, Base):
    __tablename__ = "incidents"
    __table_args__ = (
        CheckConstraint(
            "progress_percent >= 0 AND progress_percent <= 100",
            name="progress_percent_range",
        ),
        Index(
            "ix_incidents_dashboard_filters",
            "status",
            "priority",
            "incident_type",
            "is_project",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    incident_type: Mapped[str] = mapped_column(String(100), index=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    priority: Mapped[IncidentPriority] = mapped_column(
        Enum(
            IncidentPriority,
            name="incident_priority",
            values_callable=enum_values,
        ),
        default=IncidentPriority.NORMAL,
        index=True,
    )
    status: Mapped[IncidentStatus] = mapped_column(
        Enum(
            IncidentStatus,
            name="incident_status",
            values_callable=enum_values,
        ),
        default=IncidentStatus.OPEN,
        index=True,
    )
    created_by_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        index=True,
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    ended_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    is_project: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        index=True,
    )
    project_name: Mapped[str | None] = mapped_column(String(200))
    progress_percent: Mapped[int] = mapped_column(Integer, default=0)

    created_by: Mapped[User] = relationship(
        foreign_keys=[created_by_id],
        back_populates="created_incidents",
    )
    ended_by: Mapped[User | None] = relationship(
        foreign_keys=[ended_by_id]
    )
    participations: Mapped[list["Participation"]] = relationship(
        back_populates="incident",
        cascade="all, delete-orphan",
    )
    teams: Mapped[list["Team"]] = relationship(
        back_populates="incident",
        cascade="all, delete-orphan",
    )


class Participation(Base):
    __tablename__ = "participations"
    __table_args__ = (
        UniqueConstraint(
            "volunteer_id",
            "incident_id",
            name="uq_participations_volunteer_incident",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    volunteer_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        index=True,
    )
    incident_id: Mapped[int] = mapped_column(
        ForeignKey("incidents.id", ondelete="CASCADE"),
        index=True,
    )
    status: Mapped[ParticipationStatus] = mapped_column(
        Enum(
            ParticipationStatus,
            name="participation_status",
            values_callable=enum_values,
        ),
        default=ParticipationStatus.JOINED,
        index=True,
    )
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    responded_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    removed_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    removal_reason: Mapped[str | None] = mapped_column(Text)

    volunteer: Mapped[User] = relationship(foreign_keys=[volunteer_id])
    incident: Mapped[Incident] = relationship(back_populates="participations")
    removed_by: Mapped[User | None] = relationship(
        foreign_keys=[removed_by_id]
    )


class Team(TimestampMixin, Base):
    __tablename__ = "teams"

    id: Mapped[int] = mapped_column(primary_key=True)
    incident_id: Mapped[int] = mapped_column(
        ForeignKey("incidents.id", ondelete="CASCADE"),
        index=True,
    )
    name: Mapped[str] = mapped_column(String(150))
    coordinator_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        index=True,
    )
    team_leader_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    task: Mapped[str | None] = mapped_column(Text)

    incident: Mapped[Incident] = relationship(back_populates="teams")
    coordinator: Mapped[User] = relationship(
        foreign_keys=[coordinator_id]
    )
    team_leader: Mapped[User | None] = relationship(
        foreign_keys=[team_leader_id]
    )
    memberships: Mapped[list["TeamMembership"]] = relationship(
        back_populates="team",
        cascade="all, delete-orphan",
    )


class TeamMembership(Base):
    __tablename__ = "team_memberships"
    __table_args__ = (
        UniqueConstraint(
            "team_id",
            "volunteer_id",
            name="uq_team_memberships_team_volunteer",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    team_id: Mapped[int] = mapped_column(
        ForeignKey("teams.id", ondelete="CASCADE"),
        index=True,
    )
    volunteer_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        index=True,
    )
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    team: Mapped[Team] = relationship(back_populates="memberships")
    volunteer: Mapped[User] = relationship()


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    title: Mapped[str] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(Text)
    notification_type: Mapped[str] = mapped_column(String(50), index=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    user: Mapped[User] = relationship()


class UserSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_token_hash: Mapped[str] = mapped_column(
        String(64),
        unique=True,
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    last_used_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        index=True,
    )

    user: Mapped[User] = relationship(back_populates="sessions")
