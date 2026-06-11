from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime

from app.repositories.message_repository import MessageRepository

router = APIRouter()
service = MessageRepository()

class Message(BaseModel):
    team_id : int
    sent_by : int
    content : str
    send_at : datetime = datetime.now()
    edited_at :  datetime | None = None

class EditedMessage(BaseModel):
    new_content: str

#get all messages
@router.get("/messages/{team_id}")
def getMessages(team_id : int):
    return service.get_all_messages(team_id)

#send message
@router.post("/messages/send")
def sendMessage(msg : Message):
    success = service.send_message(msg)
    if not success: 
        raise HTTPException(500, "Sending message failed")
    return {"success": True, "message" : "Message sent!"}

#edit message
@router.patch("/messages/{message_id}")
def editMessage(msg : EditedMessage, message_id : int):
    if msg.new_content is None:
        raise HTTPException(400, "New message content required")

    success = service.edit_message(message_id, msg.new_content)
    if not success:
        raise HTTPException(500, "Editing message failed")
    
    return {"success" : True, "message" : "Message updated!"}
#endregion