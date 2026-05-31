"""
Aspect-Based Sentiment Analysis (ABSA) for Indonesian product reviews.

Approach:
  1. Detect which predefined aspects are mentioned via keyword groups.
  2. For each mentioned aspect, take the surrounding context (not just one clause)
     and run sentiment on that span.
  3. Apply negation detection: if negation words appear near the aspect keyword,
     flip the sentiment result.

This handles cases like "wanginya kurang awet" where IndoBERT might see "wangi"
and say positive, but the negation "kurang" makes it actually negative.
"""

from __future__ import annotations

import re
from typing import Callable

from .base import AspectSentiment

# Aspect → trigger keywords. Tuned for skincare/beauty reviews (FemaleDaily).
ASPECT_KEYWORDS: dict[str, set[str]] = {
    "harga": {"harga", "mahal", "murah", "worth", "value", "harganya", "kemahalan", "terjangkau", "promo", "diskon", "flashsale", "pricey", "affordable"},
    "kualitas": {"kualitas", "berkualitas", "awet", "premium", "original", "asli", "boros", "habis", "cepet", "cepat"},
    "pengiriman": {"pengiriman", "kirim", "ongkir", "kurir", "ekspedisi"},
    "pelayanan": {"pelayanan", "cs", "admin", "seller", "respon", "ramah", "fast", "service"},
    "kemasan": {"kemasan", "botol", "tutup", "segel", "bocor", "kemasannya", "box", "packaging", "packagingnya", "packing"},
    "aroma": {"aroma", "wangi", "bau", "harum", "parfum", "scent", "baunya", "wanginya", "semerbak", "wangiii", "wangii"},
    "tekstur": {"tekstur", "lengket", "lembut", "halus", "kasar", "cair", "kental", "creamy", "teksturnya", "lembuttt", "lembutt", "licin", "scrub", "scrubnya"},
    "hasil": {"hasil", "ampuh", "manjur", "glowing", "jerawat", "breakout", "iritasi", "alergi", "cocok", "efek", "cerah", "mencerahkan", "brightening", "memutihkan", "ngefek"},
}

# Words that negate sentiment in Indonesian
NEGATION_WORDS = {
    "tidak", "tdk", "ga", "gak", "nggak", "ngga", "gk", "bukan", "kurang",
    "belum", "jangan", "tanpa", "blm", "gaada", "gada", "engga", "enggak",
}

# Clause splitters — split on sentence boundaries but keep "tapi/namun" as separate clauses
_CLAUSE_SPLIT_RE = re.compile(r"[.!?\n]+")
_SUB_CLAUSE_SPLIT_RE = re.compile(r"\s+(?:tapi|tetapi|namun|cuma|cuman|sayangnya|sayang|hanya)\s+")


def _find_aspect_context(text_lower: str, keywords: set[str]) -> str | None:
    """
    Find the best context window around an aspect keyword.
    Returns a substring that includes enough context for sentiment analysis.
    """
    # First split into sentences
    sentences = [s.strip() for s in _CLAUSE_SPLIT_RE.split(text_lower) if s.strip()]
    if not sentences:
        return None

    # Find which sentence contains the keyword
    for i, sentence in enumerate(sentences):
        if any(kw in sentence for kw in keywords):
            # Check if there's a sub-clause with contrast (tapi/namun)
            sub_clauses = _SUB_CLAUSE_SPLIT_RE.split(sentence)
            if len(sub_clauses) > 1:
                # Find which sub-clause has the keyword
                for sub in sub_clauses:
                    if any(kw in sub for kw in keywords):
                        # If sub-clause is too short, use the whole sentence
                        if len(sub.split()) >= 4:
                            return sub.strip()
                        break

            # Return the whole sentence (better context than a tiny clause)
            return sentence

    return None


def _has_negation_near_keyword(context: str, keywords: set[str]) -> bool:
    """
    Check if there's a negation word within 3 words of any aspect keyword.
    E.g., "wanginya KURANG awet" → negation near "wangi"
    """
    words = context.lower().split()
    keyword_positions = []
    negation_positions = []

    for i, word in enumerate(words):
        # Strip common suffixes for matching
        clean = re.sub(r"[^a-z]", "", word)
        if clean in NEGATION_WORDS:
            negation_positions.append(i)
        if any(kw in word for kw in keywords):
            keyword_positions.append(i)

    # Check if any negation is within 3 words of a keyword
    for kp in keyword_positions:
        for np in negation_positions:
            if abs(kp - np) <= 3:
                return True

    return False


def extract_aspects(
    text: str,
    sentiment_fn: Callable[[str], tuple[str, float]],
) -> list[AspectSentiment]:
    """
    Find aspects mentioned in the text and score sentiment per aspect.

    Uses a combination of:
    1. Context-aware clause extraction (not just comma-split)
    2. IndoBERT/lexicon sentiment on the relevant context
    3. Negation detection to flip false-positives
    """
    lowered = text.lower()

    results: list[AspectSentiment] = []
    seen: set[str] = set()

    for aspect, keywords in ASPECT_KEYWORDS.items():
        # Check if this aspect is even mentioned
        if not any(kw in lowered for kw in keywords):
            continue

        if aspect in seen:
            continue
        seen.add(aspect)

        # Get the best context window for this aspect
        context = _find_aspect_context(lowered, keywords)
        if not context:
            continue

        # Run sentiment on the context
        label, score = sentiment_fn(context)

        # Apply negation correction: if there's a negation near the keyword
        # and the model says positive, flip it to negative
        has_negation = _has_negation_near_keyword(context, keywords)

        if has_negation and label == "positive":
            label = "negative"
            # Reduce confidence slightly since we're overriding the model
            score = max(score * 0.85, 0.5)
        elif has_negation and label == "neutral":
            label = "negative"
            score = 0.6

        results.append(AspectSentiment(aspect=aspect, sentiment=label, score=score))

    return results
