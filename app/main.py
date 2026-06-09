from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.controllers.auth_controller import router as auth_router
from app.controllers.system_manager_controller import router as system_manager_router
from app.controllers.user_controller import router as user_router


app = FastAPI(
    title="Plymouth Crisis Connect API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(system_manager_router)
app.include_router(user_router)
app.include_router(auth_router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
