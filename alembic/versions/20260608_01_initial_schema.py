"""Create the initial Plymouth Crisis Connect schema."""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260608_01"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


user_role = sa.Enum(
    "system_manager",
    "coordinator",
    "volunteer",
    name="user_role",
)
incident_priority = sa.Enum(
    "low",
    "normal",
    "high",
    "critical",
    name="incident_priority",
)
incident_status = sa.Enum(
    "open",
    "in_progress",
    "closed",
    name="incident_status",
)
participation_status = sa.Enum(
    "joined",
    "active",
    "completed",
    "removed",
    "left",
    name="participation_status",
)


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("first_name", sa.String(length=100), nullable=False),
        sa.Column("last_name", sa.String(length=100), nullable=False),
        sa.Column("role", user_role, nullable=False),
        sa.Column("phone_number", sa.String(length=32), nullable=True),
        sa.Column("date_of_birth", sa.Date(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("on_call", sa.Boolean(), nullable=False),
        sa.Column("availability_status", sa.String(length=32), nullable=False),
        sa.Column(
            "average_response_time_seconds",
            sa.Integer(),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name="pk_users"),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_is_active", "users", ["is_active"])
    op.create_index("ix_users_on_call", "users", ["on_call"])
    op.create_index("ix_users_role", "users", ["role"])

    op.create_table(
        "skills",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=150), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("requires_certificate", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_skills"),
        sa.UniqueConstraint("title", name="uq_skills_title"),
    )
    op.create_index("ix_skills_category", "skills", ["category"])

    op.create_table(
        "incidents",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("incident_type", sa.String(length=100), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("priority", incident_priority, nullable=False),
        sa.Column("status", incident_status, nullable=False),
        sa.Column("created_by_id", sa.Integer(), nullable=False),
        sa.Column(
            "started_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ended_by_id", sa.Integer(), nullable=True),
        sa.Column("is_project", sa.Boolean(), nullable=False),
        sa.Column("project_name", sa.String(length=200), nullable=True),
        sa.Column("progress_percent", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "progress_percent >= 0 AND progress_percent <= 100",
            name="ck_incidents_progress_percent_range",
        ),
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"],
            name="fk_incidents_created_by_id_users",
        ),
        sa.ForeignKeyConstraint(
            ["ended_by_id"],
            ["users.id"],
            name="fk_incidents_ended_by_id_users",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_incidents"),
    )
    op.create_index(
        "ix_incidents_dashboard_filters",
        "incidents",
        ["status", "priority", "incident_type", "is_project"],
    )
    op.create_index(
        "ix_incidents_created_by_id",
        "incidents",
        ["created_by_id"],
    )
    op.create_index(
        "ix_incidents_incident_type",
        "incidents",
        ["incident_type"],
    )
    op.create_index("ix_incidents_is_project", "incidents", ["is_project"])
    op.create_index("ix_incidents_priority", "incidents", ["priority"])
    op.create_index("ix_incidents_status", "incidents", ["status"])

    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column(
            "notification_type",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column("is_read", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_notifications_user_id_users",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_notifications"),
    )
    op.create_index(
        "ix_notifications_is_read",
        "notifications",
        ["is_read"],
    )
    op.create_index(
        "ix_notifications_notification_type",
        "notifications",
        ["notification_type"],
    )
    op.create_index(
        "ix_notifications_user_id",
        "notifications",
        ["user_id"],
    )

    op.create_table(
        "participations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("volunteer_id", sa.Integer(), nullable=False),
        sa.Column("incident_id", sa.Integer(), nullable=False),
        sa.Column("status", participation_status, nullable=False),
        sa.Column(
            "joined_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("responded_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("removed_by_id", sa.Integer(), nullable=True),
        sa.Column("removal_reason", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(
            ["incident_id"],
            ["incidents.id"],
            name="fk_participations_incident_id_incidents",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["removed_by_id"],
            ["users.id"],
            name="fk_participations_removed_by_id_users",
        ),
        sa.ForeignKeyConstraint(
            ["volunteer_id"],
            ["users.id"],
            name="fk_participations_volunteer_id_users",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_participations"),
        sa.UniqueConstraint(
            "volunteer_id",
            "incident_id",
            name="uq_participations_volunteer_incident",
        ),
    )
    op.create_index(
        "ix_participations_incident_id",
        "participations",
        ["incident_id"],
    )
    op.create_index(
        "ix_participations_status",
        "participations",
        ["status"],
    )
    op.create_index(
        "ix_participations_volunteer_id",
        "participations",
        ["volunteer_id"],
    )

    op.create_table(
        "teams",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("incident_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("coordinator_id", sa.Integer(), nullable=False),
        sa.Column("team_leader_id", sa.Integer(), nullable=True),
        sa.Column("task", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["coordinator_id"],
            ["users.id"],
            name="fk_teams_coordinator_id_users",
        ),
        sa.ForeignKeyConstraint(
            ["incident_id"],
            ["incidents.id"],
            name="fk_teams_incident_id_incidents",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["team_leader_id"],
            ["users.id"],
            name="fk_teams_team_leader_id_users",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_teams"),
    )
    op.create_index(
        "ix_teams_coordinator_id",
        "teams",
        ["coordinator_id"],
    )
    op.create_index("ix_teams_incident_id", "teams", ["incident_id"])

    op.create_table(
        "user_sessions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "session_token_hash",
            sa.String(length=64),
            nullable=False,
        ),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column(
            "expires_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "last_used_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_user_sessions_user_id_users",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_user_sessions"),
        sa.UniqueConstraint(
            "session_token_hash",
            name="uq_user_sessions_session_token_hash",
        ),
    )
    op.create_index(
        "ix_user_sessions_expires_at",
        "user_sessions",
        ["expires_at"],
    )
    op.create_index(
        "ix_user_sessions_revoked_at",
        "user_sessions",
        ["revoked_at"],
    )
    op.create_index(
        "ix_user_sessions_user_id",
        "user_sessions",
        ["user_id"],
    )

    op.create_table(
        "volunteer_skills",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("skill_id", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_certified", sa.Boolean(), nullable=False),
        sa.Column("certificate_name", sa.String(length=255), nullable=True),
        sa.Column("certificate_url", sa.String(length=500), nullable=True),
        sa.Column(
            "certificate_expires_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.Column("course_taken_at", sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(
            ["skill_id"],
            ["skills.id"],
            name="fk_volunteer_skills_skill_id_skills",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_volunteer_skills_user_id_users",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_volunteer_skills"),
        sa.UniqueConstraint(
            "user_id",
            "skill_id",
            name="uq_volunteer_skills_user_skill",
        ),
    )
    op.create_index(
        "ix_volunteer_skills_skill_id",
        "volunteer_skills",
        ["skill_id"],
    )
    op.create_index(
        "ix_volunteer_skills_user_id",
        "volunteer_skills",
        ["user_id"],
    )

    op.create_table(
        "team_memberships",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("team_id", sa.Integer(), nullable=False),
        sa.Column("volunteer_id", sa.Integer(), nullable=False),
        sa.Column(
            "joined_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["team_id"],
            ["teams.id"],
            name="fk_team_memberships_team_id_teams",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["volunteer_id"],
            ["users.id"],
            name="fk_team_memberships_volunteer_id_users",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_team_memberships"),
        sa.UniqueConstraint(
            "team_id",
            "volunteer_id",
            name="uq_team_memberships_team_volunteer",
        ),
    )
    op.create_index(
        "ix_team_memberships_team_id",
        "team_memberships",
        ["team_id"],
    )
    op.create_index(
        "ix_team_memberships_volunteer_id",
        "team_memberships",
        ["volunteer_id"],
    )


def downgrade() -> None:
    op.drop_table("team_memberships")
    op.drop_table("volunteer_skills")
    op.drop_table("user_sessions")
    op.drop_table("teams")
    op.drop_table("participations")
    op.drop_table("notifications")
    op.drop_table("incidents")
    op.drop_table("skills")
    op.drop_table("users")

    bind = op.get_bind()
    participation_status.drop(bind, checkfirst=True)
    incident_status.drop(bind, checkfirst=True)
    incident_priority.drop(bind, checkfirst=True)
    user_role.drop(bind, checkfirst=True)
