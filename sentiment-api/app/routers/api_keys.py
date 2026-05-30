"""
API Keys management — save, list, delete user API keys.
"""

from fastapi import APIRouter, Depends, HTTPException

from ..auth import get_current_user
from ..database import get_supabase
from ..models import ApiKeyRequest, ApiResponse

router = APIRouter()


@router.get("/api-keys")
async def list_api_keys(owner_id: str = Depends(get_current_user)):
    """List user's saved API keys (hints only)."""
    db = get_supabase()
    result = (
        db.table("user_api_keys")
        .select("id, provider, key_hint, is_active, updated_at")
        .eq("owner_id", owner_id)
        .execute()
    )
    return ApiResponse(success=True, data=result.data or [])


@router.post("/api-keys")
async def save_api_key(
    body: ApiKeyRequest,
    owner_id: str = Depends(get_current_user),
):
    """Save or update an API key for a provider."""
    db = get_supabase()

    # Create key hint (last 4 chars)
    key_hint = body.api_key[-4:] if len(body.api_key) >= 4 else body.api_key

    # TODO: Encrypt the key before storing (use pgcrypto or application-level encryption)
    # For now, store as-is (NOT production-safe)
    encrypted_key = body.api_key

    # Upsert (unique constraint on owner_id + provider)
    data = {
        "owner_id": owner_id,
        "provider": body.provider,
        "encrypted_key": encrypted_key,
        "key_hint": key_hint,
        "is_active": True,
    }

    # Check if exists
    existing = (
        db.table("user_api_keys")
        .select("id")
        .eq("owner_id", owner_id)
        .eq("provider", body.provider)
        .execute()
    )

    if existing.data:
        db.table("user_api_keys").update(
            {"encrypted_key": encrypted_key, "key_hint": key_hint, "is_active": True}
        ).eq("owner_id", owner_id).eq("provider", body.provider).execute()
    else:
        db.table("user_api_keys").insert(data).execute()

    return ApiResponse(
        success=True,
        data={
            "provider": body.provider,
            "key_hint": key_hint,
            "is_active": True,
        },
    )


@router.delete("/api-keys/{provider}")
async def delete_api_key(
    provider: str,
    owner_id: str = Depends(get_current_user),
):
    """Delete a saved API key."""
    if provider not in ("openai", "google"):
        raise HTTPException(status_code=400, detail="Invalid provider")

    db = get_supabase()
    db.table("user_api_keys").delete().eq("owner_id", owner_id).eq("provider", provider).execute()

    return ApiResponse(success=True, data={"deleted": True})
