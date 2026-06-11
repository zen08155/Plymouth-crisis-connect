from decimal import *
from datetime import datetime

class Incident:
    def __init__(
            self,
            title : str,
            description: str,
            incident_type: str,
            important_data: str,
            important_data_extra : str,
            latitude : Decimal,
            longitude : Decimal,
            priority : str,
            required_certificate: str | None = None,
            status : bool = True,
            created_at : datetime | None = None,
            available_at: datetime | None = None,
            created_by : int | None = None,
            ended_at : datetime | None = None,
            ended_by : int | None = None,
    ):
        self.title = title
        self.description = description
        self.incident_type = incident_type
        self.important_data = important_data
        self.important_data_extra = important_data_extra
        self.latitude = latitude
        self.longitude = longitude
        self.priority = priority
        self.required_certificate = required_certificate
        self.status = status
        self.created_at = created_at
        self.available_at = available_at
        self.created_by = created_by
        self.ended_at = ended_at
        self.ended_by = ended_by
