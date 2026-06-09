from datetime import datetime

class Message:
    def __init__(self,
                 team_id : int,
                 sent_by : int,
                 content : str,
                 send_at : datetime = datetime.now(),
                 edited_at : datetime | None = None
                 ):
        self.team_id = team_id,
        self.sent_by = sent_by,
        self.content = content,
        self.send_at = send_at,
        self.edited_at = edited_at