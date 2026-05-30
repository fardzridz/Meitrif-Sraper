"""
Supabase database client for the Sentiment API.
Uses the service role key for server-side operations (bypasses RLS).
"""

import base64
import json
import logging

from supabase import create_client, Client

from .config import settings

logger = logging.getLogger(__name__)

_client: Client | None = None


def _warn_if_not_service_role(key: str) -> None:
    """
    Decode the JWT payload (without verifying) to check the `role` claim.

    The Sentiment API MUST use the `service_role` key so it can write rows on
    behalf of any verified user. If an `anon` key is configured, every insert
    will fail with an RLS error (42501), which is confusing to debug — so we
    surface a clear warning at startup instead.
    """
    try:
        payload_segment = key.split(".")[1]
        # Pad base64 to a multiple of 4.
        padded = payload_segment + "=" * (-len(payload_segment) % 4)
        decoded = json.loads(base64.urlsafe_b64decode(padded))
        role = decoded.get("role")
        if role != "service_role":
            logger.warning(
                "SUPABASE_SERVICE_ROLE_KEY has role=%r, expected 'service_role'. "
                "Inserts will fail RLS. Use the service_role (secret) key from "
                "Supabase > Project Settings > API.",
                role,
            )
    except Exception:
        logger.warning("Could not decode SUPABASE_SERVICE_ROLE_KEY to verify its role.")


def get_supabase() -> Client:
    """Get or create the Supabase client (service role)."""
    global _client
    if _client is None:
        if not settings.supabase_url or not settings.supabase_service_role_key:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured."
            )
        _warn_if_not_service_role(settings.supabase_service_role_key)
        _client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _client
