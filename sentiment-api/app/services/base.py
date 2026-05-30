"""
Base interfaces for sentiment analyzers.

Every analyzer (local or external API) implements the same interface so the
pipeline can treat them interchangeably. This keeps the model choice fully
pluggable: IndoBERT, OpenAI, and Google NLP all return the same shape.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class AspectSentiment:
    aspect: str
    sentiment: str  # positive | negative | neutral
    score: float


@dataclass
class TextAnalysis:
    """Result of analyzing a single text."""

    original_text: str
    sentiment_label: str  # positive | negative | neutral
    sentiment_score: float
    emotions: Optional[dict[str, float]] = None
    dominant_emotion: Optional[str] = None
    aspects: Optional[list[AspectSentiment]] = None
    keywords: Optional[list[str]] = None
    topic_id: Optional[int] = None
    topic_label: Optional[str] = None

    def to_row(self, owner_id: str, analysis_id: str, review_id: Optional[str] = None) -> dict:
        """Convert to a Supabase row for the sentiment_results table."""
        return {
            "owner_id": owner_id,
            "analysis_id": analysis_id,
            "review_id": review_id,
            "original_text": self.original_text,
            "sentiment_label": self.sentiment_label,
            "sentiment_score": round(self.sentiment_score, 4),
            "emotions": self.emotions,
            "dominant_emotion": self.dominant_emotion,
            "aspects": (
                [
                    {"aspect": a.aspect, "sentiment": a.sentiment, "score": round(a.score, 4)}
                    for a in self.aspects
                ]
                if self.aspects
                else None
            ),
            "keywords": self.keywords,
            "topic_id": self.topic_id,
            "topic_label": self.topic_label,
        }


class SentimentAnalyzer(ABC):
    """Abstract base for sentiment analysis models."""

    #: Identifier used by the frontend / registry.
    model_id: str = "base"

    @abstractmethod
    def load(self) -> None:
        """Load any heavy resources (models). Called once before analyze()."""

    @abstractmethod
    def analyze_sentiment(self, text: str) -> tuple[str, float]:
        """Return (label, confidence) for a single text."""

    def analyze_emotion(self, text: str) -> tuple[dict[str, float], str]:
        """Return (emotion_scores, dominant_emotion). Optional per model."""
        raise NotImplementedError

    def supports_emotion(self) -> bool:
        return False
