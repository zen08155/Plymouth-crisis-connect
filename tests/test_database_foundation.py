from sqlalchemy import CheckConstraint, UniqueConstraint

from app.database.base import Base
from app.models import sql_models  # noqa: F401


EXPECTED_TABLES = {
    "users",
    "skills",
    "volunteer_skills",
    "incidents",
    "participations",
    "teams",
    "team_memberships",
    "notifications",
    "user_sessions",
}


def test_sql_metadata_contains_the_initial_schema():
    assert EXPECTED_TABLES == set(Base.metadata.tables)


def test_phone_number_is_stored_as_text():
    column = Base.metadata.tables["users"].c.phone_number

    assert column.type.length == 32


def test_incident_progress_has_a_database_constraint():
    constraints = Base.metadata.tables["incidents"].constraints

    assert any(
        isinstance(constraint, CheckConstraint)
        and constraint.name == "ck_incidents_progress_percent_range"
        for constraint in constraints
    )


def test_join_tables_prevent_duplicate_memberships():
    expected_constraints = {
        "volunteer_skills": "uq_volunteer_skills_user_skill",
        "participations": "uq_participations_volunteer_incident",
        "team_memberships": "uq_team_memberships_team_volunteer",
    }

    for table_name, constraint_name in expected_constraints.items():
        constraints = Base.metadata.tables[table_name].constraints
        assert any(
            isinstance(constraint, UniqueConstraint)
            and constraint.name == constraint_name
            for constraint in constraints
        )
