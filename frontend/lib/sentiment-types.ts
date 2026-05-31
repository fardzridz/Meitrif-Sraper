export type AnalysisStatus =
  | "queued"
  | "loading"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export type SentimentLabel = "positive" | "negative" | "neutral";

export type SourceType = "scraping" | "upload" | "manual" | "url";

export type ModelId = "indobert" | "openai-gpt4o-mini" | "openai-gpt4o" | "google-nlp" | "textblob";

export type AnalysisType = "sentiment" | "emotion" | "aspect" | "keyword" | "topic";

export type EmotionScores = {
  joy: number;
  anger: number;
  sadness: number;
  fear: number;
  surprise: number;
  disgust: number;
};

export type AspectResult = {
  aspect: string;
  sentiment: SentimentLabel;
  score: number;
};

export type SentimentDistribution = {
  positive: number;
  negative: number;
  neutral: number;
};

export type TopicInfo = {
  id: number;
  label: string;
  count: number;
};

export type AnalysisSummary = {
  sentiment_distribution: SentimentDistribution;
  sentiment_percentage: SentimentDistribution;
  dominant_sentiment: SentimentLabel;
  emotion_distribution: Record<string, number>;
  dominant_emotion: string;
  top_aspects: Array<{ aspect: string; positive: number; negative: number }>;
  top_keywords: string[];
  topics: TopicInfo[];
  auto_insight: string;
  processing_time_seconds: number;
  model_used: string;
  /** Engine that actually produced the results. Differs from model_used when
   * IndoBERT silently fell back to the rule-based lexicon. */
  actual_backend?: string;
  is_fallback?: boolean;
};

export type SentimentAnalysis = {
  id: string;
  title: string;
  source_type: SourceType;
  model_used: ModelId;
  analysis_types: AnalysisType[];
  status: AnalysisStatus;
  total_texts: number;
  processed_texts: number;
  summary: AnalysisSummary | null;
  error_message?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
};

export type SentimentResult = {
  id: string;
  original_text: string;
  sentiment_label: SentimentLabel;
  sentiment_score: number;
  emotions: EmotionScores | null;
  dominant_emotion: string | null;
  aspects: AspectResult[] | null;
  keywords: string[] | null;
  topic_id: number | null;
  topic_label: string | null;
};

export type UploadedDataset = {
  id: string;
  filename: string;
  total_rows: number;
  text_column: string;
  columns: string[];
  status: "uploaded" | "validated" | "error";
  error_message?: string | null;
  created_at: string;
};

export type UserApiKey = {
  id: string;
  provider: "openai" | "google";
  key_hint: string;
  is_active: boolean;
  updated_at: string;
};

export type ModelInfo = {
  id: ModelId;
  name: string;
  provider: "local" | "openai" | "google";
  language: string;
  capabilities: AnalysisType[];
  requires_api_key: boolean;
  description: string;
};

export type AnalysisProgressEvent = {
  step: string;
  message: string;
  current: number;
  total: number;
};

export type AnalysisPreviewEvent = {
  positive: number;
  negative: number;
  neutral: number;
};

export type AnalysisLogEntry = {
  ts: string;
  level: "info" | "success" | "warn" | "error";
  message: string;
  progress?: { current: number; total: number };
};

export type PaginatedResponse<T> = {
  results: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};
