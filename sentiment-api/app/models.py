"""
Pydantic models for request/response validation.
"""

from typing import Any, Optional
from pydantic import BaseModel, Field


# ─── Request Models ───────────────────────────────────────────────────────────


class AnalyzeRequest(BaseModel):
    title: str = Field(..., max_length=200)
    source_type: str = Field(..., pattern=r"^(scraping|upload|manual|url)$")
    source_config: dict[str, Any] = Field(default_factory=dict)
    model: str = Field(default="indobert")
    analysis_types: list[str] = Field(default=["sentiment"])
    topic_count: int = Field(default=5, ge=3, le=10)


class ApiKeyRequest(BaseModel):
    provider: str = Field(..., pattern=r"^(openai|google)$")
    api_key: str = Field(..., min_length=1)


class UploadConfig(BaseModel):
    text_column: Optional[str] = None


# ─── Response Models ──────────────────────────────────────────────────────────


class ApiResponse(BaseModel):
    success: bool
    data: Any = None
    error: Optional[str] = None


class AnalyzeResponse(BaseModel):
    analysis_id: str
    status: str
    total_texts: int
    stream_url: str


class ModelInfo(BaseModel):
    id: str
    name: str
    provider: str
    language: str
    capabilities: list[str]
    requires_api_key: bool
    description: str
