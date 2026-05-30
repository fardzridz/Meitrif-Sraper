"""
Supabase database client for the Sentiment API.
Uses service role key for server-side operations.
"""

from supabase import create_client, Client

from .config import settings

_client: Client | None = None


def get_supabase() -> Client:
    """Get or create the Supabase client (service role)."""
    global _client
    if _client is None:
        _client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _client
