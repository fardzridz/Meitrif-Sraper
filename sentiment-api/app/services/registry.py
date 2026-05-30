"""
Model registry — maps model_id strings to analyzer instances.

Analyzers are cached (singleton) so the heavy IndoBERT model is loaded only
once per process and reused across requests.
"""

from __future__ import annotations

from .base import SentimentAnalyzer
from .indobert import IndoBertAnalyzer

_CACHE: dict[str, SentimentAnalyzer] = {}


def get_analyzer(model_id: str) -> SentimentAnalyzer:
    """
    Return a loaded analyzer for the given model_id.

    Currently all model_ids resolve to IndoBERT (with lexicon fallback). OpenAI
    and Google analyzers can be added here behind the same interface once their
    adapters are implemented.
    """
    # Normalize external models to IndoBERT for now; external adapters TBD.
    resolved = "indobert"

    if resolved not in _CACHE:
        analyzer = IndoBertAnalyzer()
        analyzer.load()
        _CACHE[resolved] = analyzer

    return _CACHE[resolved]
