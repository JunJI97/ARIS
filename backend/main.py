from fastapi import FastAPI

from app.api.health import router as health_router

app = FastAPI(title="ARIS Backend")

app.include_router(health_router)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "ARIS backend is running"}
