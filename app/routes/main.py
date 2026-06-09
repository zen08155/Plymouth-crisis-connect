from fastapi import FastAPI
from app.routes.user import router as user_router
from app.routes.Incidents import router as incident_router
from app.routes.Updater import router as update_router
from app.routes.message import router as message_router

app = FastAPI()
app.include_router(user_router)
app.include_router(incident_router)
app.include_router(update_router)
app.include_router(message_router)
