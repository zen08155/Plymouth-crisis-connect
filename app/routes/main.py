from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.routes.user import router as user_router
from app.routes.Incidents import router as incident_router
from app.routes.Updater import router as update_router
from app.routes.teams import router as teams_router


app = FastAPI()
app.include_router(user_router)
app.include_router(incident_router)
app.include_router(update_router)
app.include_router(teams_router)

