/**
 * Emotion display utilities — emoji + label mapping for sentiment analysis.
 */

export const EMOTION_EMOJI: Record<string, string> = {
  joy: "😊",
  anger: "😠",
  sadness: "😢",
  fear: "😨",
  surprise: "😲",
  disgust: "🤢",
};

export const EMOTION_LABEL: Record<string, string> = {
  joy: "Senang",
  anger: "Marah",
  sadness: "Sedih",
  fear: "Takut",
  surprise: "Terkejut",
  disgust: "Jijik",
};

export const SENTIMENT_EMOJI: Record<string, string> = {
  positive: "😊",
  negative: "😞",
  neutral: "😐",
};

export const SENTIMENT_LABEL: Record<string, string> = {
  positive: "Positif",
  negative: "Negatif",
  neutral: "Netral",
};

/**
 * Get emoji + label for an emotion key.
 * e.g. formatEmotion("joy") → "😊 Senang"
 */
export function formatEmotion(emotion: string): string {
  const emoji = EMOTION_EMOJI[emotion] ?? "❓";
  const label = EMOTION_LABEL[emotion] ?? emotion;
  return `${emoji} ${label}`;
}

/**
 * Get emoji + label for a sentiment key.
 * e.g. formatSentiment("positive") → "😊 Positif"
 */
export function formatSentiment(sentiment: string): string {
  const emoji = SENTIMENT_EMOJI[sentiment] ?? "❓";
  const label = SENTIMENT_LABEL[sentiment] ?? sentiment;
  return `${emoji} ${label}`;
}
