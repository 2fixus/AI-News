
export enum PoliticalBias {
  REPUBLICAN = "Republican",
  DEMOCRATIC = "Democratic",
  NEUTRAL = "Neutral",
  UNKNOWN = "Unknown" // Added for stories not yet analyzed
}

export interface NewsStory {
  id: number; // Changed to number as it's likely a primary key from DB
  title: string;
  summary?: string; // Summary might be optional or generated
  link: string; // Direct link to the original article from RSS
  sourceName: string; // Name of the news source
  publishedDate: string; // ISO 8601 date string from RSS
  category?: string; // Optional category
  
  // AI Analysis fields - populated by the backend after analysis
  analyzedPoliticalBias?: PoliticalBias;
  analyzedTruthfulnessScore?: number; // 0-100
  analysisTimestamp?: string; // When the analysis was performed

  // Fields previously used, kept for reference or potential future use if structure aligns
  // originalArticleUrl: string; // This is now 'link'
  // politicalBias: PoliticalBias; // This is now 'analyzedPoliticalBias'
  // truthfulnessScore: number; // This is now 'analyzedTruthfulnessScore'
  // timestamp: string; // This is now 'publishedDate' or 'analysisTimestamp'
}
