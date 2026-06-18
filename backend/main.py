from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from routers import salons, bookings, ai, owner

app = FastAPI(title="LushLife API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(salons.router)
app.include_router(bookings.router)
app.include_router(ai.router)
app.include_router(owner.router)

@app.get("/")
def root():
    return {"message": "LushLife API is running"}