"""
Authentication module — verifies Supabase JWT tokens.
Extracts user_id (owner_id) from the verified token.
"""

from fastapi import Depends, HTTPException, Request
from jose import JWTError, jwt
import httpx

from .config import settings

# Supabase JWT secret is derived from the service role key
# In production, you should use the JWT secret from Supabase dashboard
SUPABASE_JWT_SECRET = None


async def _get_jwt_secret() -> str:
    """
    Fetch the JWT secret from Supabase settings.
    For simplicity, we verify tokens by decoding with the anon key's JWT secret.
    Supabase uses the JWT secret shown in Project Settings > API.
    """
    global SUPABASE_JWT_SECRET
    if SUPABASE_JWT_SECRET:
        return SUPABASE_JWT_SECRET

    # Fallback: use service role key to verify via Supabase Auth API
    return settings.supabase_service_role_key


async def get_current_user(request: Request) -> str:
    """
    Extract and verify the Supabase access token from Authorization header.
    Returns the user_id (owner_id).
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = auth_header.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Empty token")

    # Verify token via Supabase Auth API
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.supabase_url}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": settings.supabase_service_role_key,
                },
            )

        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        user_data = response.json()
        user_id = user_data.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Could not extract user ID")

        return user_id

    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Auth service unavailable")
