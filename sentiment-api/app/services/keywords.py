"""
Keyword extraction and simple topic clustering.

Keyword extraction uses term frequency with Indonesian stopword removal. This is
dependency-free and fast. If you want higher quality keyphrases, swap in KeyBERT
(already in requirements.txt) behind the same function signature.

Topic "modeling" here is a lightweight keyword-cluster approach: group texts by
their most distinctive shared keywords. For production-grade topics, swap in
BERTopic.
"""

from __future__ import annotations

import re
from collections import Counter

# Common Indonesian stopwords (subset, sufficient for review text).
STOPWORDS = {
    "yang", "untuk", "dengan", "ini", "itu", "dari", "akan", "pada", "juga", "saya",
    "ada", "tidak", "sudah", "saja", "ke", "di", "dan", "atau", "tapi", "karena",
    "aku", "kamu", "dia", "kami", "kita", "mereka", "nya", "ya", "sih", "deh", "kok",
    "aja", "udah", "udh", "gak", "ga", "nggak", "banget", "bgt", "buat", "jadi",
    "lagi", "biar", "kalau", "kalo", "klo", "punya", "bisa", "mau", "lebih", "masih",
    "kayak", "kaya", "gitu", "gini", "dong", "nih", "loh", "lho", "pun", "agak",
    "sangat", "sekali", "banget", "cukup", "begitu", "sama", "semua", "setiap",
    "produk", "produknya", "barang", "barangnya", "beli", "pakai", "pake", "review",
}

_TOKEN_RE = re.compile(r"[a-zA-Z\u00C0-\u017F]{3,}")


def _tokenize(text: str) -> list[str]:
    return [t for t in _TOKEN_RE.findall(text.lower()) if t not in STOPWORDS]


def extract_keywords_single(text: str, top_n: int = 5) -> list[str]:
    """Top keywords for a single text by frequency."""
    tokens = _tokenize(text)
    if not tokens:
        return []
    counts = Counter(tokens)
    return [word for word, _ in counts.most_common(top_n)]


def extract_keywords_corpus(texts: list[str], top_n: int = 20) -> list[str]:
    """Top keywords across the whole corpus."""
    counter: Counter[str] = Counter()
    for text in texts:
        counter.update(set(_tokenize(text)))  # set() → document frequency
    return [word for word, _ in counter.most_common(top_n)]


def simple_topics(texts: list[str], topic_count: int = 5) -> list[dict]:
    """
    Cluster texts into topics using the most frequent corpus keywords as seeds.

    Returns a list of {id, label, count} and assigns each text to a topic
    (returned separately via assign_topics).
    """
    seeds = extract_keywords_corpus(texts, top_n=topic_count)
    topics = []
    for i, seed in enumerate(seeds):
        topics.append({"id": i, "label": seed.capitalize(), "seed": seed})
    return topics


def assign_topics(text: str, topics: list[dict]) -> tuple[int | None, str | None]:
    """Assign a text to the first topic whose seed keyword it contains."""
    tokens = set(_tokenize(text))
    for topic in topics:
        if topic["seed"] in tokens:
            return topic["id"], topic["label"]
    return None, None
