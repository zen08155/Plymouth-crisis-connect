from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.routes.user import router as user_router

app = FastAPI()
app.include_router(user_router)

