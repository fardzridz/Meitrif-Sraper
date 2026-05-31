"""
Lightweight Indonesian sentiment & emotion lexicon.

Used as:
  1. A fallback when IndoBERT/transformers can't be loaded.
  2. The emotion detector (IndoBERT only does polarity).

This is intentionally simple and rule-based. It is NOT meant to compete with a
trained model on accuracy, but it keeps the full pipeline functional offline and
gives reasonable emotion signals for Bahasa Indonesia reviews.
"""

from __future__ import annotations

import re

# ─── Sentiment lexicon ────────────────────────────────────────────────────────

POSITIVE_WORDS = {
    "bagus", "baik", "mantap", "keren", "suka", "puas", "recommended", "rekomendasi",
    "enak", "nyaman", "murah", "cepat", "ramah", "memuaskan", "berkualitas", "worth",
    "oke", "ok", "top", "terbaik", "hebat", "cinta", "love", "cocok", "lembut",
    "wangi", "halus", "cantik", "glowing", "ampuh", "manjur", "berhasil", "senang",
    "happy", "amazing", "perfect", "sempurna", "favorit", "andalan", "juara",
}

NEGATIVE_WORDS = {
    "jelek", "buruk", "kecewa", "mengecewakan", "lama", "lambat", "mahal", "rusak",
    "cacat", "palsu", "bohong", "menipu", "tipu", "kasar", "parah", "gagal", "sakit",
    "iritasi", "alergi", "breakout", "jerawat", "kering", "lengket", "bau", "aneh",
    "kotor", "basi", "expired", "kadaluarsa", "sedih", "marah", "benci", "hate",
    "worst", "terrible", "bad", "susah", "menyesal", "rugi",
}

# Pure negators are handled as polarity-flippers, not as negative words on their
# own (e.g. "nggak jelek" should lean positive, not double-negative).
NEGATORS = {"tidak", "tdk", "ga", "gak", "nggak", "bukan", "kurang", "belum", "jangan"}

# ─── Emotion lexicon ──────────────────────────────────────────────────────────

EMOTION_WORDS: dict[str, set[str]] = {
    "joy": {
        "senang", "happy", "suka", "cinta", "love", "puas", "bahagia", "gembira",
        "bagus", "mantap", "keren", "amazing", "wangi", "glowing", "favorit",
    },
    "anger": {
        "marah", "kesal", "kecewa", "jengkel", "benci", "hate", "parah", "menipu",
        "tipu", "bohong", "kasar", "emosi", "sebel", "nyebelin",
    },
    "sadness": {
        "sedih", "kecewa", "menyesal", "nyesel", "rugi", "gagal", "patah", "galau",
    },
    "fear": {
        "takut", "khawatir", "cemas", "ngeri", "was-was", "ragu", "iritasi", "alergi",
    },
    "surprise": {
        "kaget", "terkejut", "wow", "tak menyangka", "ternyata", "ajaib", "ampuh",
    },
    "disgust": {
        "jijik", "bau", "basi", "kotor", "menjijikkan", "geli", "najis", "aneh",
    },
}

_TOKEN_RE = re.compile(r"[a-zA-Z\u00C0-\u017F]+")


def _tokenize(text: str) -> list[str]:
    return _TOKEN_RE.findall(text.lower())


def lexicon_sentiment(text: str) -> tuple[str, float]:
    """Rule-based sentiment with simple negation handling."""
    tokens = _tokenize(text)
    if not tokens:
        return "neutral", 0.0

    score = 0
    hits = 0
    for i, token in enumerate(tokens):
        weight = 0
        if token in POSITIVE_WORDS:
            weight = 1
        elif token in NEGATIVE_WORDS:
            weight = -1

        if weight != 0:
            hits += 1
            # Flip polarity if preceded by a negator within 2 tokens.
            window = tokens[max(0, i - 2):i]
            if any(w in NEGATORS for w in window):
                weight *= -1
            score += weight

    if hits == 0:
        # No polarity words found → neutral with low confidence.
        return "neutral", 0.55

    # Scale confidence based on how many polarity words were found and how
    # strongly they lean one way. More hits + stronger lean = higher confidence.
    magnitude = abs(score)
    # Base 0.55, each net hit adds ~0.08, capped at 0.95.
    confidence = min(0.55 + 0.08 * magnitude + 0.02 * hits, 0.95)

    if score > 0:
        return "positive", round(confidence, 2)
    if score < 0:
        return "negative", round(confidence, 2)

    # Equal positive and negative hits → neutral, moderate confidence.
    return "neutral", round(0.5 + 0.03 * hits, 2)


def lexicon_emotion(text: str) -> tuple[dict[str, float], str]:
    """Score 6 basic emotions from word matches, normalized to sum ~1."""
    tokens = _tokenize(text)
    raw: dict[str, float] = {emotion: 0.0 for emotion in EMOTION_WORDS}

    for token in tokens:
        for emotion, words in EMOTION_WORDS.items():
            if token in words:
                raw[emotion] += 1.0

    total = sum(raw.values())
    if total == 0:
        # Default to a mild neutral-joy baseline.
        scores = {emotion: 0.0 for emotion in EMOTION_WORDS}
        scores["joy"] = 0.34
        return scores, "joy"

    scores = {emotion: round(value / total, 4) for emotion, value in raw.items()}
    dominant = max(scores, key=scores.get)
    return scores, dominant
