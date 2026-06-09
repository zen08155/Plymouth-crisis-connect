from app.models.message import Message
from database.Connection import Database
from datetime import datetime
from typing import Any
import json

class MessageRepository:
    def send_message(msg : Message) -> bool:
        """inserts msg into db

        Args:
            msg (Message): message object

        Returns:
            bool: on success/failure
        """
        sql = "INSERT INTO message (teamId, sentBy, content, sendAt, editedAt)"

        try: 
            conn = Database.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, (msg.team_id, msg.sent_by, msg.content, msg.send_at, msg.edited_at))
            cursor.commit()
            return True
        except Exception as e:
            print(e)
            conn.rollback()
            return False

    def edit_message(msg_id : int, new_content : str) -> bool:
        """Edits message, updates in db with the new content and editedAt

        Args:
            msg_id (int): message_id
            new_content (str)

        Returns:
            bool: on success/failure
        """
        sql = "UPDATE message SET content = %s, editedAt = %s WHERE messageId = %s"

        try :
            conn = Database.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, (new_content, datetime.now(), msg_id))
            conn.commit()
            return True
        except Exception as e:
            print(e)
            conn.rollback()
            return False
        finally:
            if cursor: cursor.close()
            if conn: conn.close()

    def get_all_messages(team_id : int) -> Any :
        sql = "SELECT * FROM message WHERE teamId = %s"
        conn = Database.get_connection()
        cursor = conn.cursor()
        cursor.execute(sql, (team_id))
        msgs = cursor.fetchAll()
        return json.dump(msgs)
