from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime

from app.repositories.message_repository import MessageRepository

router = APIRouter()
service = MessageRepository()

#region get all messages in team-chat
@router.get("/messages/{team_id}")
def getMessages(team_id : int):
    return service.get_all_messages(team_id)
#endregion

#region send message
class Message(BaseModel):
    team_id : int
    sent_by : int
    content : str
    send_at : datetime = datetime.now()
    edited_at :  datetime | None = None

@router.post("/messages/send")
def sendMessage(msg : Message):
    success = service.send_message(msg)
    if not success: 
        return {"success": False, "message" : "Sending message failed"}
    return {"success": True, "message" : "Message sent!"}
#endregion

#region edit message 
class EditedMessage(BaseModel):
    id : int
    new_content: str

@router.post("messages/{id}")
def editMessage(msg : EditedMessage):
    success = service.edit_message(msg.msg_id, msg.new_content)
    if not success:
        return {"success": False, "message" : "Editing message failed"}
    return {"success" : True, "message" : "Message updated!"}
#endregion