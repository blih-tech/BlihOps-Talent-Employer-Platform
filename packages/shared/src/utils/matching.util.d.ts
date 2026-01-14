import { Talent, Job, MatchScoreBreakdown } from '../types';
import { ServiceCategory, ExperienceLevel, EngagementType } from '../constants';
/**
 * Calculate skill overlap between talent and job
 * Returns a value between 0 and 1
 */
export declare function calculateSkillOverlap(talentSkills: string[], jobSkills: string[]): number;
/**
 * Calculate category match score
 * Returns 1 if categories match, 0 otherwise
 */
export declare function calculateCategoryMatch(talentCategories: ServiceCategory | ServiceCategory[], jobCategory: ServiceCategory): number;
/**
 * Calculate experience level match score
 * Returns a value between 0 and 1 based on experience level compatibility
 */
export declare function calculateExperienceMatch(talentLevel: ExperienceLevel, jobLevel?: ExperienceLevel): number;
/**
 * Calculate engagement preference match
 * Returns 1 if preferences match, 0.5 if partial match, 0 if no match
 */
export declare function calculateEngagementMatch(talentPreference: EngagementType | EngagementType[] | undefined, jobEngagement: EngagementType): number;
/**
 * Calculate overall match score between talent and job
 * Returns a value between 0 and 100
 */
export declare function calculateMatchScore(talent: Talent, job: Job, weights?: {
    skillOverlap?: number;
    categoryMatch?: number;
    experienceMatch?: number;
    engagementMatch?: number;
}): {
    score: number;
    breakdown: MatchScoreBreakdown;
};
//# sourceMappingURL=matching.util.d.ts.map