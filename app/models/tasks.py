from datetime import datetime
class Task:
    def __init__(
            self,
            teamId : int | None,
            name : str,
            description : str,
            priority: str,
            createdAt: datetime = datetime.now(),
            UpdatedAt: datetime | None = None,
            IsActive: bool = True
            ):
        self.team_id = teamId
        self.name = name
        self.description = description
        self.priority = priority
        self.created_at = createdAt
        self.updated_at = UpdatedAt
        self.is_active = IsActive

    
