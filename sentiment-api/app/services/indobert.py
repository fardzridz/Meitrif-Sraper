"""
IndoBERT-based sentiment analyzer for Bahasa Indonesia.

Uses the `mdhugol/indonesia-bert-sentiment-classification` model which outputs
3 labels (positive / neutral / negative). Emotion detection uses a lightweight
lexicon approach as IndoBERT itself only does polarity.

The transformers model is loaded lazily on first use. If transformers/torch are
not installed or the model can't be downloaded, the analyzer falls back to a
rule-based lexicon so the rest of the pipeline still works in development.
"""

from __future__ import annotations

import logging

from .base import SentimentAnalyzer
from .lexicon import lexicon_emotion, lexicon_sentiment

logger = logging.getLogger(__name__)

# Label mapping from the mdhugol model output indices.
_LABEL_MAP = {
    "LABEL_0": "positive",
    "LABEL_1": "neutral",
    "LABEL_2": "negative",
}


class IndoBertAnalyzer(SentimentAnalyzer):
    model_id = "indobert"

    def __init__(self, model_name: str = "mdhugol/indonesia-bert-sentiment-classification"):
        self.model_name = model_name
        self._pipeline = None
        self._use_fallback = False

    @property
    def backend(self) -> str:
        """Which engine is actually serving predictions: the real transformer
        model ("indobert") or the rule-based lexicon ("lexicon-fallback").

        This is the source of truth — callers should use it instead of assuming
        IndoBERT is active just because the model was selected.
        """
        return "lexicon-fallback" if self._use_fallback else "indobert"

    def load(self) -> None:
        if self._pipeline is not None or self._use_fallback:
            return

        try:
            from transformers import (
                AutoModelForSequenceClassification,
                AutoTokenizer,
                pipeline,
            )

            tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            model = AutoModelForSequenceClassification.from_pretrained(self.model_name)
            self._pipeline = pipeline(
                "sentiment-analysis",
                model=model,
                tokenizer=tokenizer,
                truncation=True,
                max_length=512,
            )
            logger.info("IndoBERT model loaded: %s", self.model_name)
        except Exception as exc:  # pragma: no cover - depends on env
            logger.warning(
                "IndoBERT unavailable (%s). Falling back to lexicon analyzer.", exc
            )
            self._use_fallback = True

    def analyze_sentiment(self, text: str) -> tuple[str, float]:
        if not text or not text.strip():
            return "neutral", 0.0

        if self._use_fallback or self._pipeline is None:
            return lexicon_sentiment(text)

        try:
            # Let the pipeline handle truncation at the *token* level
            # (max_length=512). Slicing by characters here would cut long
            # reviews far too early (~80-100 words) and drop the sentiment-
            # bearing tail (e.g. "...tapi ujung-ujungnya bikin breakout").
            result = self._pipeline(text)[0]
            label = _LABEL_MAP.get(result["label"], "neutral")
            score = float(result["score"])
            return label, score
        except Exception as exc:  # pragma: no cover
            logger.warning("IndoBERT inference failed (%s), using lexicon.", exc)
            return lexicon_sentiment(text)

    def supports_emotion(self) -> bool:
        return True

    def analyze_emotion(self, text: str) -> tuple[dict[str, float], str]:
        # IndoBERT does not output emotions; use lexicon-based detection.
        return lexicon_emotion(text)
