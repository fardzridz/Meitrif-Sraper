"""
Analysis pipeline — orchestrates the full sentiment analysis flow.

Responsibilities:
  1. Collect texts from the source (manual / scraping / upload).
  2. Run the selected analyses (sentiment, emotion, aspect, keyword, topic).
  3. Persist per-text results to `sentiment_results`.
  4. Update `sentiment_analyses` progress so the SSE stream can report it.
  5. Build and store the summary insight.

The pipeline updates `processed_texts` periodically so the SSE poller in
routers/analysis.py reflects real progress. It is written to run either inline
(BackgroundTasks) or inside a Celery worker without modification.
"""

from __future__ import annotations

import logging
from collections import Counter
from datetime import datetime, timezone
from typing import Optional

from ..database import get_supabase
from .aspects import extract_aspects
from .base import TextAnalysis
from .keywords import (
    assign_topics,
    extract_keywords_corpus,
    extract_keywords_single,
    simple_topics,
)
from .registry import get_analyzer
from .summary import build_summary

logger = logging.getLogger(__name__)

# How often to flush progress to the DB (every N texts).
PROGRESS_BATCH = 10


def _collect_texts(analysis: dict, owner_id: str) -> list[tuple[str, Optional[str]]]:
    """
    Return a list of (text, review_id) tuples for the analysis source.
    review_id is set only for the 'scraping' source.
    """
    db = get_supabase()
    source_type = analysis["source_type"]
    config = analysis.get("source_filter") or {}

    if source_type == "manual":
        return [(t, None) for t in config.get("texts", []) if t and t.strip()]

    if source_type == "scraping":
        product_ids = config.get("product_ids", [])
        rating_filter = config.get("rating_filter")
        date_from = config.get("date_from")
        date_to = config.get("date_to")

        query = (
            db.table("reviews")
            .select("id, review_text, rating, review_date, created_at")
            .eq("owner_id", owner_id)
        )
        if product_ids:
            query = query.in_("product_id", product_ids)
        if rating_filter:
            try:
                query = query.eq("rating", int(rating_filter))
            except (TypeError, ValueError):
                pass
        # Date filters apply to created_at (when the review was scraped/stored).
        if date_from:
            query = query.gte("created_at", date_from)
        if date_to:
            # Include the whole end day.
            query = query.lte("created_at", f"{date_to}T23:59:59")

        result = query.execute()
        return [
            (r["review_text"], r["id"])
            for r in (result.data or [])
            if r.get("review_text", "").strip()
        ]

    if source_type == "upload":
        # Upload texts would be loaded from the stored file. For now, return
        # what's referenced; full file re-parsing is handled by the worker.
        dataset_id = analysis.get("dataset_id")
        if not dataset_id:
            return []
        # Texts are expected to be pre-extracted into source_filter['texts']
        # when the analysis is created from an uploaded dataset.
        return [(t, None) for t in config.get("texts", []) if t and t.strip()]

    if source_type == "url":
        return [(t, None) for t in config.get("texts", []) if t and t.strip()]

    return []


def run_analysis(analysis_id: str, owner_id: str) -> None:
    """Execute the full analysis. Safe to call from a background task/worker."""
    db = get_supabase()

    # Load the analysis record.
    record = (
        db.table("sentiment_analyses")
        .select("*")
        .eq("id", analysis_id)
        .eq("owner_id", owner_id)
        .single()
        .execute()
    )
    if not record.data:
        logger.error("Analysis %s not found for owner %s", analysis_id, owner_id)
        return

    analysis = record.data
    analysis_types = set(analysis.get("analysis_types") or ["sentiment"])
    started = datetime.now(timezone.utc)

    try:
        db.table("sentiment_analyses").update(
            {"status": "loading", "started_at": started.isoformat()}
        ).eq("id", analysis_id).execute()

        # 1. Collect texts.
        texts = _collect_texts(analysis, owner_id)
        total = len(texts)
        if total == 0:
            raise ValueError("Tidak ada teks untuk dianalisis.")

        db.table("sentiment_analyses").update(
            {"status": "processing", "total_texts": total, "processed_texts": 0}
        ).eq("id", analysis_id).execute()

        # 2. Load analyzer.
        analyzer = get_analyzer(analysis["model_used"])

        # 3. Prepare topic seeds if requested (needs the corpus up front).
        topics: list[dict] = []
        if "topic" in analysis_types:
            topic_count = (analysis.get("source_filter") or {}).get("topic_count", 5)
            topics = simple_topics([t for t, _ in texts], topic_count=topic_count)

        # 4. Analyze each text.
        analyses: list[TextAnalysis] = []
        rows_buffer: list[dict] = []
        processed = 0

        for text, review_id in texts:
            label, score = analyzer.analyze_sentiment(text)
            result = TextAnalysis(
                original_text=text,
                sentiment_label=label,
                sentiment_score=score,
            )

            if "emotion" in analysis_types and analyzer.supports_emotion():
                emotions, dominant = analyzer.analyze_emotion(text)
                result.emotions = emotions
                result.dominant_emotion = dominant

            if "aspect" in analysis_types:
                result.aspects = extract_aspects(text, analyzer.analyze_sentiment)

            if "keyword" in analysis_types:
                result.keywords = extract_keywords_single(text, top_n=5)

            if "topic" in analysis_types and topics:
                topic_id, topic_label = assign_topics(text, topics)
                result.topic_id = topic_id
                result.topic_label = topic_label

            analyses.append(result)
            rows_buffer.append(result.to_row(owner_id, analysis_id, review_id))
            processed += 1

            # Flush progress + rows periodically.
            if processed % PROGRESS_BATCH == 0:
                db.table("sentiment_results").insert(rows_buffer).execute()
                rows_buffer = []
                db.table("sentiment_analyses").update(
                    {"processed_texts": processed}
                ).eq("id", analysis_id).execute()

                # Check for cancellation.
                status_check = (
                    db.table("sentiment_analyses")
                    .select("status")
                    .eq("id", analysis_id)
                    .single()
                    .execute()
                )
                if status_check.data and status_check.data["status"] == "cancelled":
                    logger.info("Analysis %s cancelled mid-run", analysis_id)
                    return

        # Flush remaining rows.
        if rows_buffer:
            db.table("sentiment_results").insert(rows_buffer).execute()

        # 5. Build summary.
        corpus_keywords = (
            extract_keywords_corpus([t for t, _ in texts], top_n=15)
            if "keyword" in analysis_types
            else []
        )
        topic_counts = Counter(
            a.topic_label for a in analyses if a.topic_label
        )
        topics_summary = [
            {"id": t["id"], "label": t["label"], "count": topic_counts.get(t["label"], 0)}
            for t in topics
        ]

        elapsed = (datetime.now(timezone.utc) - started).total_seconds()
        summary = build_summary(
            analyses,
            corpus_keywords=corpus_keywords,
            topics=topics_summary,
            model_used=analysis["model_used"],
            processing_time=elapsed,
        )

        db.table("sentiment_analyses").update(
            {
                "status": "completed",
                "processed_texts": processed,
                "summary": summary,
                "completed_at": datetime.now(timezone.utc).isoformat(),
            }
        ).eq("id", analysis_id).execute()

        logger.info("Analysis %s completed: %d texts in %.1fs", analysis_id, total, elapsed)

    except Exception as exc:
        logger.exception("Analysis %s failed", analysis_id)
        db.table("sentiment_analyses").update(
            {
                "status": "failed",
                "error_message": str(exc),
                "completed_at": datetime.now(timezone.utc).isoformat(),
            }
        ).eq("id", analysis_id).execute()
