from decimal import *
from datetime import datetime
class Incident:
    def __init__(
            self,
            title : str,
            description: str,
            type: str,
            important_data: str,
            important_data_extra : str,
            latitude : Decimal,
            longitude : Decimal,
            priority : str,
            created_at : datetime | None = None,
            created_by : int | None = None,
            ended_at : datetime | None = None,
            ended_by : int | None = None,
            notification_id : int | None = None,
            incident_id : int | None = None
    ):
        self.title = title
        self.description = description
        self.type = type
        self.important_data = important_data
        self.important_data_extra = important_data_extra
        self.latitude = latitude
        self.longitude = longitude
        self.priority = priority
        self.created_at = created_at
        self.created_by = created_by
        self.ended_at = ended_at
        self.ended_by = ended_by
        self.notification_id = notification_id
        self.incident_id = incident_id

        