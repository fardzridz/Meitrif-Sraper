"""
Metrif Sentiment Analysis API — FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .models import ApiResponse
from .routers import analysis, api_keys, export, models, upload

app = FastAPI(
    title="Metrif Sentiment API",
    description="API untuk analisis sentimen profesional berbahasa Indonesia.",
    version="0.1.0",
)

# CORS
origins = [origin.strip() for origin in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(analysis.router, tags=["Analysis"])
app.include_router(models.router, tags=["Models"])
app.include_router(api_keys.router, tags=["API Keys"])
app.include_router(upload.router, tags=["Upload"])
app.include_router(export.router, tags=["Export"])


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return ApiResponse(success=True, data={"status": "healthy", "version": "0.1.0"})


@app.get("/")
async def root():
    """Root endpoint."""
    return ApiResponse(
        success=True,
        data={
            "name": "Metrif Sentiment API",
            "version": "0.1.0",
            "docs": "/docs",
        },
    )
