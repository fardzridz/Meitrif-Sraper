"""
Summary & auto-insight generation.

Aggregates per-text results into the `summary` JSON stored on the analysis,
including a human-readable Indonesian insight sentence.
"""

from __future__ import annotations

from collections import Counter, defaultdict

from .base import TextAnalysis

_SENTIMENT_LABEL_ID = {
    "positive": "positif",
    "negative": "negatif",
    "neutral": "netral",
}


def build_summary(
    analyses: list[TextAnalysis],
    corpus_keywords: list[str],
    topics: list[dict],
    model_used: str,
    processing_time: float,
    actual_backend: str | None = None,
) -> dict:
    total = len(analyses)
    if total == 0:
        return {}

    # Sentiment distribution.
    sentiment_counts = Counter(a.sentiment_label for a in analyses)
    distribution = {
        "positive": sentiment_counts.get("positive", 0),
        "negative": sentiment_counts.get("negative", 0),
        "neutral": sentiment_counts.get("neutral", 0),
    }
    percentage = {
        key: round(value / total * 100, 1) for key, value in distribution.items()
    }
    dominant_sentiment = max(distribution, key=distribution.get)

    # Emotion distribution.
    emotion_counts: Counter[str] = Counter()
    for a in analyses:
        if a.dominant_emotion:
            emotion_counts[a.dominant_emotion] += 1
    dominant_emotion = emotion_counts.most_common(1)[0][0] if emotion_counts else "—"

    # Aspect aggregation.
    aspect_agg: dict[str, dict[str, int]] = defaultdict(lambda: {"positive": 0, "negative": 0})
    for a in analyses:
        if not a.aspects:
            continue
        for asp in a.aspects:
            if asp.sentiment == "positive":
                aspect_agg[asp.aspect]["positive"] += 1
            elif asp.sentiment == "negative":
                aspect_agg[asp.aspect]["negative"] += 1

    top_aspects = [
        {"aspect": aspect, "positive": counts["positive"], "negative": counts["negative"]}
        for aspect, counts in sorted(
            aspect_agg.items(),
            key=lambda x: x[1]["positive"] + x[1]["negative"],
            reverse=True,
        )
    ][:8]

    summary = {
        "sentiment_distribution": distribution,
        "sentiment_percentage": percentage,
        "dominant_sentiment": dominant_sentiment,
        "emotion_distribution": dict(emotion_counts),
        "dominant_emotion": dominant_emotion,
        "top_aspects": top_aspects,
        "top_keywords": corpus_keywords,
        "topics": topics,
        "auto_insight": _build_insight(
            percentage, dominant_emotion, top_aspects, emotion_counts, total
        ),
        "processing_time_seconds": round(processing_time, 1),
        "model_used": model_used,
        # The engine that actually produced these results. May differ from
        # model_used when IndoBERT falls back to the lexicon. Lets the UI warn
        # the user instead of silently presenting lexicon output as IndoBERT.
        "actual_backend": actual_backend or model_used,
        "is_fallback": actual_backend == "lexicon-fallback",
    }
    return summary


def _build_insight(
    percentage: dict[str, float],
    dominant_emotion: str,
    top_aspects: list[dict],
    emotion_counts: Counter,
    total: int,
) -> str:
    """Compose an Indonesian insight sentence from the aggregates."""
    parts: list[str] = []

    pos = percentage["positive"]
    neg = percentage["negative"]
    parts.append(f"{pos:.0f}% review positif")
    if neg > 0:
        parts.append(f"{neg:.0f}% negatif")

    insight = ", ".join(parts) + "."

    # Highlight the most negative aspect, if any.
    negative_aspects = [a for a in top_aspects if a["negative"] > a["positive"]]
    if negative_aspects:
        worst = max(negative_aspects, key=lambda a: a["negative"])
        total_aspect = worst["positive"] + worst["negative"]
        if total_aspect > 0:
            neg_pct = worst["negative"] / total_aspect * 100
            insight += f" Keluhan utama pada aspek {worst['aspect']} ({neg_pct:.0f}% negatif)."

    # Highlight the most positive aspect.
    positive_aspects = [a for a in top_aspects if a["positive"] > a["negative"]]
    if positive_aspects:
        best = max(positive_aspects, key=lambda a: a["positive"])
        insight += f" Aspek {best['aspect']} paling diapresiasi."

    if dominant_emotion and dominant_emotion != "—" and total > 0:
        emo_pct = emotion_counts.get(dominant_emotion, 0) / total * 100
        insight += f" Emosi dominan: {dominant_emotion} ({emo_pct:.0f}%)."

    return insight
