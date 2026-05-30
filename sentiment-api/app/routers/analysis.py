"""
Analysis endpoints — create, get, list, delete, cancel analyses.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sse_starlette.sse import EventSourceResponse

from ..auth import get_current_user
from ..database import get_supabase
from ..models import AnalyzeRequest, ApiResponse
from ..services.pipeline import run_analysis

router = APIRouter()


@router.post("/analyze")
async def create_analysis(
    body: AnalyzeRequest,
    background_tasks: BackgroundTasks,
    owner_id: str = Depends(get_current_user),
):
    """Start a new sentiment analysis job."""
    db = get_supabase()

    # Determine total texts based on source
    total_texts = 0
    if body.source_type == "manual":
        texts = body.source_config.get("texts", [])
        if not texts or len(texts) == 0:
            raise HTTPException(status_code=400, detail="No texts provided")
        if len(texts) > 100:
            raise HTTPException(status_code=400, detail="Maximum 100 texts per manual input")
        total_texts = len(texts)
    elif body.source_type == "scraping":
        # Count reviews from database with the same filters the pipeline uses.
        product_ids = body.source_config.get("product_ids", [])
        rating_filter = body.source_config.get("rating_filter")
        date_from = body.source_config.get("date_from")
        date_to = body.source_config.get("date_to")

        query = db.table("reviews").select("id", count="exact").eq("owner_id", owner_id)
        if product_ids:
            query = query.in_("product_id", product_ids)
        if rating_filter:
            try:
                query = query.eq("rating", int(rating_filter))
            except (TypeError, ValueError):
                pass
        if date_from:
            query = query.gte("created_at", date_from)
        if date_to:
            query = query.lte("created_at", f"{date_to}T23:59:59")

        result = query.execute()
        total_texts = result.count or 0
        if total_texts == 0:
            raise HTTPException(status_code=400, detail="No reviews found for the selected filters")
    elif body.source_type == "upload":
        dataset_id = body.source_config.get("dataset_id")
        if not dataset_id:
            raise HTTPException(status_code=400, detail="dataset_id is required for upload source")
        result = (
            db.table("uploaded_datasets")
            .select("total_rows")
            .eq("id", dataset_id)
            .eq("owner_id", owner_id)
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Dataset not found")
        total_texts = result.data["total_rows"]
    elif body.source_type == "url":
        total_texts = 1  # Will be determined after scraping
    else:
        raise HTTPException(status_code=400, detail="Invalid source_type")

    # Create analysis record
    analysis_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    # Persist topic_count inside source_filter so the pipeline can read it.
    source_config = dict(body.source_config)
    source_config["topic_count"] = body.topic_count

    analysis_data = {
        "id": analysis_id,
        "owner_id": owner_id,
        "title": body.title,
        "source_type": body.source_type,
        "source_filter": source_config,
        "model_used": body.model,
        "analysis_types": body.analysis_types,
        "status": "queued",
        "total_texts": total_texts,
        "processed_texts": 0,
        "created_at": now,
    }

    if body.source_type == "upload":
        analysis_data["dataset_id"] = body.source_config.get("dataset_id")

    db.table("sentiment_analyses").insert(analysis_data).execute()

    # Dispatch processing in the background. In production this would be a Celery
    # task; for now FastAPI BackgroundTasks runs it after the response is sent.
    background_tasks.add_task(run_analysis, analysis_id, owner_id)

    return ApiResponse(
        success=True,
        data={
            "analysis_id": analysis_id,
            "status": "queued",
            "total_texts": total_texts,
            "stream_url": f"/analysis/{analysis_id}/stream",
        },
    )


@router.get("/analysis/{analysis_id}")
async def get_analysis(
    analysis_id: str,
    owner_id: str = Depends(get_current_user),
):
    """Get analysis details."""
    db = get_supabase()
    result = (
        db.table("sentiment_analyses")
        .select("*")
        .eq("id", analysis_id)
        .eq("owner_id", owner_id)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return ApiResponse(success=True, data=result.data)


@router.get("/analyses")
async def list_analyses(
    owner_id: str = Depends(get_current_user),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    status: Optional[str] = Query(default=None),
):
    """List all analyses for the current user."""
    db = get_supabase()
    offset = (page - 1) * limit

    query = (
        db.table("sentiment_analyses")
        .select("*", count="exact")
        .eq("owner_id", owner_id)
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
    )

    if status:
        query = query.eq("status", status)

    result = query.execute()
    total = result.count or 0

    return ApiResponse(
        success=True,
        data={
            "results": result.data or [],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "total_pages": (total + limit - 1) // limit if total > 0 else 0,
            },
        },
    )


@router.delete("/analysis/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    owner_id: str = Depends(get_current_user),
):
    """Delete an analysis and all its results."""
    db = get_supabase()

    # Verify ownership
    check = (
        db.table("sentiment_analyses")
        .select("id")
        .eq("id", analysis_id)
        .eq("owner_id", owner_id)
        .single()
        .execute()
    )
    if not check.data:
        raise HTTPException(status_code=404, detail="Analysis not found")

    # Delete results first (cascade should handle this, but explicit is safer)
    db.table("sentiment_results").delete().eq("analysis_id", analysis_id).execute()
    db.table("sentiment_analyses").delete().eq("id", analysis_id).execute()

    return ApiResponse(success=True, data={"deleted": True})


@router.post("/analysis/{analysis_id}/cancel")
async def cancel_analysis(
    analysis_id: str,
    owner_id: str = Depends(get_current_user),
):
    """Cancel a running or queued analysis."""
    db = get_supabase()

    result = (
        db.table("sentiment_analyses")
        .select("status")
        .eq("id", analysis_id)
        .eq("owner_id", owner_id)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Analysis not found")

    current_status = result.data["status"]
    if current_status not in ("queued", "loading", "processing"):
        raise HTTPException(status_code=400, detail=f"Cannot cancel analysis with status: {current_status}")

    db.table("sentiment_analyses").update({"status": "cancelled"}).eq("id", analysis_id).execute()

    # TODO: Send cancel signal to Celery worker

    return ApiResponse(success=True, data={"status": "cancelled"})


@router.get("/analysis/{analysis_id}/results")
async def get_analysis_results(
    analysis_id: str,
    owner_id: str = Depends(get_current_user),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=200),
    sentiment: Optional[str] = Query(default=None),
    emotion: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
):
    """Get per-text results for an analysis."""
    db = get_supabase()
    offset = (page - 1) * limit

    # Verify ownership of the analysis
    check = (
        db.table("sentiment_analyses")
        .select("id")
        .eq("id", analysis_id)
        .eq("owner_id", owner_id)
        .single()
        .execute()
    )
    if not check.data:
        raise HTTPException(status_code=404, detail="Analysis not found")

    query = (
        db.table("sentiment_results")
        .select("*", count="exact")
        .eq("analysis_id", analysis_id)
        .eq("owner_id", owner_id)
        .order("created_at", desc=False)
        .range(offset, offset + limit - 1)
    )

    if sentiment:
        query = query.eq("sentiment_label", sentiment)
    if emotion:
        query = query.eq("dominant_emotion", emotion)
    if search:
        query = query.ilike("original_text", f"%{search}%")

    result = query.execute()
    total = result.count or 0

    return ApiResponse(
        success=True,
        data={
            "results": result.data or [],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "total_pages": (total + limit - 1) // limit if total > 0 else 0,
            },
        },
    )


@router.get("/analysis/{analysis_id}/stream")
async def stream_analysis(
    analysis_id: str,
    owner_id: str = Depends(get_current_user),
):
    """SSE endpoint for real-time analysis progress."""
    import asyncio
    import json

    db = get_supabase()

    # Verify ownership
    check = (
        db.table("sentiment_analyses")
        .select("id, status")
        .eq("id", analysis_id)
        .eq("owner_id", owner_id)
        .single()
        .execute()
    )
    if not check.data:
        raise HTTPException(status_code=404, detail="Analysis not found")

    async def event_generator():
        """Poll analysis status and yield SSE events."""
        last_processed = 0

        while True:
            result = (
                db.table("sentiment_analyses")
                .select("status, processed_texts, total_texts, summary, error_message")
                .eq("id", analysis_id)
                .single()
                .execute()
            )

            if not result.data:
                yield {
                    "event": "error",
                    "data": json.dumps({"message": "Analysis not found"}),
                }
                break

            data = result.data
            status = data["status"]
            processed = data["processed_texts"] or 0
            total = data["total_texts"] or 0

            # Send progress update if processed count changed
            if processed > last_processed:
                yield {
                    "event": "progress",
                    "data": json.dumps(
                        {
                            "step": "analyzing",
                            "message": f"Menganalisis sentiment... ({processed}/{total})",
                            "current": processed,
                            "total": total,
                        }
                    ),
                }
                last_processed = processed

            if status == "completed":
                yield {
                    "event": "done",
                    "data": json.dumps(
                        {"analysis_id": analysis_id, "status": "completed"}
                    ),
                }
                break
            elif status in ("failed", "cancelled"):
                yield {
                    "event": "error",
                    "data": json.dumps(
                        {
                            "message": data.get("error_message", f"Analysis {status}"),
                            "status": status,
                        }
                    ),
                }
                break

            await asyncio.sleep(2)

    return EventSourceResponse(event_generator())
