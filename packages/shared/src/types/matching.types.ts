/**
 * Match result interface
 */
export interface MatchResult {
  talentId: string;
  jobId: string;
  score: number;
  breakdown: MatchScoreBreakdown;
  matchedAt: Date;
}

/**
 * Match score breakdown
 */
export interface MatchScoreBreakdown {
  skillOverlap: number;
  categoryMatch: number;
  experienceMatch: number;
  engagementMatch?: number;
  total: number;
}

/**
 * Matching options
 */
export interface MatchingOptions {
  minScore?: number;
  limit?: number;
  includeBreakdown?: boolean;
}




