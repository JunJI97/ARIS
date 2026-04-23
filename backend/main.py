from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.assets import router as assets_router
from app.api.bonds import router as bonds_router
from app.api.credit_risk import router as credit_risk_router
from app.api.health import router as health_router
from app.api.market_risk import router as market_risk_router
from app.api.projects import router as projects_router

app = FastAPI(title="ARIS Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(assets_router)
app.include_router(bonds_router)
app.include_router(credit_risk_router)
app.include_router(market_risk_router)
app.include_router(projects_router)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "ARIS backend is running"}
