"""
Aspect-Based Sentiment Analysis (ABSA) for Indonesian product reviews.

Approach (rule-based, dependency-free):
  1. Detect which predefined aspects are mentioned via keyword groups.
  2. For each mentioned aspect, take the surrounding clause/sentence and run
     sentiment on that span only.

This is a pragmatic ABSA that works well for review-style text where each
aspect tends to appear in its own clause ("harganya mahal tapi kualitasnya bagus").
"""

from __future__ import annotations

import re
from typing import Callable

from .base import AspectSentiment

# Aspect → trigger keywords. Tuned for skincare/beauty reviews (FemaleDaily).
ASPECT_KEYWORDS: dict[str, set[str]] = {
    "harga": {"harga", "mahal", "murah", "worth", "value", "harganya", "kemahalan", "terjangkau", "promo", "diskon", "flashsale"},
    "kualitas": {"kualitas", "berkualitas", "awet", "tahan", "premium", "original", "asli"},
    "pengiriman": {"pengiriman", "kirim", "ongkir", "kurir", "paket", "sampai", "packing", "packaging", "ekspedisi"},
    "pelayanan": {"pelayanan", "cs", "admin", "seller", "respon", "ramah", "fast", "service"},
    "kemasan": {"kemasan", "botol", "tutup", "segel", "bocor", "kemasannya", "box"},
    "aroma": {"aroma", "wangi", "bau", "harum", "parfum", "scent", "baunya", "wanginya", "semerbak"},
    "tekstur": {"tekstur", "lengket", "lembut", "halus", "kasar", "cair", "kental", "creamy", "teksturnya", "lembuttt", "lembutt"},
    "hasil": {"hasil", "ampuh", "manjur", "glowing", "jerawat", "breakout", "iritasi", "alergi", "cocok", "efek", "cerah", "mencerahkan"},
}

_SENT_SPLIT_RE = re.compile(r"[.!?;,\n]| tapi | tetapi | namun | sedangkan | dan | serta ")


def extract_aspects(
    text: str,
    sentiment_fn: Callable[[str], tuple[str, float]],
) -> list[AspectSentiment]:
    """
    Find aspects mentioned in the text and score sentiment per aspect.

    `sentiment_fn` is the analyzer's analyze_sentiment so ABSA reuses the same
    model (IndoBERT or lexicon) on each clause.
    """
    lowered = text.lower()
    clauses = [c.strip() for c in _SENT_SPLIT_RE.split(lowered) if c.strip()]
    if not clauses:
        clauses = [lowered]

    results: list[AspectSentiment] = []
    seen: set[str] = set()

    for aspect, keywords in ASPECT_KEYWORDS.items():
        # Find a clause mentioning this aspect.
        matching_clause = None
        for clause in clauses:
            if any(kw in clause for kw in keywords):
                matching_clause = clause
                break

        if matching_clause is None:
            continue

        if aspect in seen:
            continue
        seen.add(aspect)

        label, score = sentiment_fn(matching_clause)
        results.append(AspectSentiment(aspect=aspect, sentiment=label, score=score))

    return results
