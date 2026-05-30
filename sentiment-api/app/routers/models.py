"""
Models endpoint — list available NLP models.
"""

from fastapi import APIRouter

from ..models import ApiResponse, ModelInfo

router = APIRouter()

AVAILABLE_MODELS: list[dict] = [
    {
        "id": "indobert",
        "name": "IndoBERT",
        "provider": "local",
        "language": "id",
        "capabilities": ["sentiment", "emotion"],
        "requires_api_key": False,
        "description": "Model lokal untuk Bahasa Indonesia. Gratis, tidak butuh API key.",
    },
    {
        "id": "openai-gpt4o-mini",
        "name": "OpenAI GPT-4o Mini",
        "provider": "openai",
        "language": "multi",
        "capabilities": ["sentiment", "emotion", "aspect", "keyword", "topic"],
        "requires_api_key": True,
        "description": "Model OpenAI. Akurasi tinggi, butuh API key, berbayar per request.",
    },
    {
        "id": "openai-gpt4o",
        "name": "OpenAI GPT-4o",
        "provider": "openai",
        "language": "multi",
        "capabilities": ["sentiment", "emotion", "aspect", "keyword", "topic"],
        "requires_api_key": True,
        "description": "Model OpenAI terkuat. Akurasi tertinggi, butuh API key, berbayar per request.",
    },
    {
        "id": "google-nlp",
        "name": "Google Cloud NLP",
        "provider": "google",
        "language": "multi",
        "capabilities": ["sentiment", "emotion"],
        "requires_api_key": True,
        "description": "Google Natural Language API. Butuh service account key.",
    },
]


@router.get("/models")
async def list_models():
    """List all available analysis models."""
    return ApiResponse(success=True, data=AVAILABLE_MODELS)
