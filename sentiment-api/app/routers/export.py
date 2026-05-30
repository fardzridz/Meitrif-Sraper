"""
Export endpoints — CSV, Excel, PDF export of analysis results.
"""

import io
from typing import Optional

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse

from ..auth import get_current_user
from ..database import get_supabase

router = APIRouter()


@router.get("/export/{analysis_id}/csv")
async def export_csv(
    analysis_id: str,
    owner_id: str = Depends(get_current_user),
    include_emotions: bool = Query(default=True),
    include_aspects: bool = Query(default=True),
    include_keywords: bool = Query(default=True),
):
    """Export analysis results as CSV."""
    db = get_supabase()

    # Verify ownership
    check = (
        db.table("sentiment_analyses")
        .select("id, title")
        .eq("id", analysis_id)
        .eq("owner_id", owner_id)
        .single()
        .execute()
    )
    if not check.data:
        raise HTTPException(status_code=404, detail="Analysis not found")

    # Fetch all results
    results = (
        db.table("sentiment_results")
        .select("*")
        .eq("analysis_id", analysis_id)
        .eq("owner_id", owner_id)
        .order("created_at")
        .execute()
    )

    if not results.data:
        raise HTTPException(status_code=404, detail="No results found")

    # Build DataFrame
    rows = []
    for r in results.data:
        row = {
            "text": r["original_text"],
            "sentiment": r["sentiment_label"],
            "confidence": r["sentiment_score"],
        }

        if include_emotions and r.get("emotions"):
            row["dominant_emotion"] = r.get("dominant_emotion", "")
            for emotion, score in r["emotions"].items():
                row[f"emotion_{emotion}"] = score

        if include_aspects and r.get("aspects"):
            aspects_str = "; ".join(
                f"{a['aspect']}:{a['sentiment']}({a['score']:.2f})"
                for a in r["aspects"]
            )
            row["aspects"] = aspects_str

        if include_keywords and r.get("keywords"):
            row["keywords"] = ", ".join(r["keywords"])

        if r.get("topic_label"):
            row["topic"] = r["topic_label"]

        rows.append(row)

    df = pd.DataFrame(rows)

    # Convert to CSV
    buffer = io.StringIO()
    df.to_csv(buffer, index=False, encoding="utf-8")
    buffer.seek(0)

    title = check.data.get("title", "analysis")
    filename = f"sentiment-{title[:30]}.csv"

    return StreamingResponse(
        io.BytesIO(buffer.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/export/{analysis_id}/excel")
async def export_excel(
    analysis_id: str,
    owner_id: str = Depends(get_current_user),
):
    """Export analysis results as Excel."""
    db = get_supabase()

    check = (
        db.table("sentiment_analyses")
        .select("id, title")
        .eq("id", analysis_id)
        .eq("owner_id", owner_id)
        .single()
        .execute()
    )
    if not check.data:
        raise HTTPException(status_code=404, detail="Analysis not found")

    results = (
        db.table("sentiment_results")
        .select("*")
        .eq("analysis_id", analysis_id)
        .eq("owner_id", owner_id)
        .order("created_at")
        .execute()
    )

    if not results.data:
        raise HTTPException(status_code=404, detail="No results found")

    rows = []
    for r in results.data:
        row = {
            "Teks": r["original_text"],
            "Sentiment": r["sentiment_label"],
            "Confidence": r["sentiment_score"],
            "Emosi Dominan": r.get("dominant_emotion", ""),
        }

        if r.get("aspects"):
            row["Aspek"] = "; ".join(
                f"{a['aspect']}:{a['sentiment']}" for a in r["aspects"]
            )

        if r.get("keywords"):
            row["Keywords"] = ", ".join(r["keywords"])

        if r.get("topic_label"):
            row["Topik"] = r["topic_label"]

        rows.append(row)

    df = pd.DataFrame(rows)

    buffer = io.BytesIO()
    df.to_excel(buffer, index=False, engine="openpyxl")
    buffer.seek(0)

    title = check.data.get("title", "analysis")
    filename = f"sentiment-{title[:30]}.xlsx"

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
