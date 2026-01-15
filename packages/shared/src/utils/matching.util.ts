import { Talent, Job, MatchScoreBreakdown } from '../types';
import { ServiceCategory, ExperienceLevel, EngagementType } from '../constants';

/**
 * Calculate skill overlap between talent and job
 * Returns a value between 0 and 1
 */
export function calculateSkillOverlap(
  talentSkills: string[],
  jobSkills: string[]
): number {
  if (jobSkills.length === 0) {
    return 0;
  }

  // Normalize skills to lowercase for comparison
  const normalizedTalentSkills = talentSkills.map((s) => s.toLowerCase().trim());
  const normalizedJobSkills = jobSkills.map((s) => s.toLowerCase().trim());

  // Find matching skills
  const matchingSkills = normalizedJobSkills.filter((jobSkill) =>
    normalizedTalentSkills.some((talentSkill) =>
      talentSkill.includes(jobSkill) || jobSkill.includes(talentSkill)
    )
  );

  // Calculate overlap percentage
  return matchingSkills.length / normalizedJobSkills.length;
}

/**
 * Calculate category match score
 * Returns 1 if categories match, 0 otherwise
 */
export function calculateCategoryMatch(
  talentCategories: ServiceCategory | ServiceCategory[],
  jobCategory: ServiceCategory
): number {
  if (Array.isArray(talentCategories)) {
    return talentCategories.includes(jobCategory) ? 1 : 0;
  }
  return talentCategories === jobCategory ? 1 : 0;
}

/**
 * Calculate experience level match score
 * Returns a value between 0 and 1 based on experience level compatibility
 */
export function calculateExperienceMatch(
  talentLevel: ExperienceLevel,
  jobLevel?: ExperienceLevel
): number {
  if (!jobLevel) {
    return 0.5; // Neutral score if job doesn't specify
  }

  // Define experience level hierarchy
  const levelHierarchy: Record<ExperienceLevel, number> = {
    [ExperienceLevel.JUNIOR]: 1,
    [ExperienceLevel.MID]: 2,
    [ExperienceLevel.SENIOR]: 3,
    [ExperienceLevel.LEAD]: 4,
    [ExperienceLevel.ARCHITECT]: 5,
  };

  const talentRank = levelHierarchy[talentLevel];
  const jobRank = levelHierarchy[jobLevel];

  // Perfect match
  if (talentRank === jobRank) {
    return 1;
  }

  // Talent is more experienced (good match)
  if (talentRank > jobRank) {
    const diff = talentRank - jobRank;
    // Reduce score slightly for over-qualification
    return Math.max(0.7, 1 - diff * 0.1);
  }

  // Talent is less experienced (poor match)
  const diff = jobRank - talentRank;
  return Math.max(0, 1 - diff * 0.3);
}

/**
 * Calculate engagement preference match
 * Returns 1 if preferences match, 0.5 if partial match, 0 if no match
 */
export function calculateEngagementMatch(
  talentPreference: EngagementType | EngagementType[] | undefined,
  jobEngagement: EngagementType
): number {
  if (!talentPreference) {
    return 0.5; // Neutral if talent hasn't specified
  }

  if (Array.isArray(talentPreference)) {
    return talentPreference.includes(jobEngagement) ? 1 : 0;
  }

  return talentPreference === jobEngagement ? 1 : 0;
}

/**
 * Calculate overall match score between talent and job
 * Returns a value between 0 and 100
 */
export function calculateMatchScore(
  talent: Talent,
  job: Job,
  weights: {
    skillOverlap?: number;
    categoryMatch?: number;
    experienceMatch?: number;
    engagementMatch?: number;
  } = {}
): { score: number; breakdown: MatchScoreBreakdown } {
  // Default weights
  const defaultWeights = {
    skillOverlap: 0.5,
    categoryMatch: 0.2,
    experienceMatch: 0.2,
    engagementMatch: 0.1,
  };

  const finalWeights = { ...defaultWeights, ...weights };

  // Calculate individual scores
  const skillOverlap = calculateSkillOverlap(talent.skills, job.requiredSkills);
  const categoryMatch = calculateCategoryMatch(talent.serviceCategory, job.serviceCategory);
  const experienceMatch = calculateExperienceMatch(talent.experienceLevel);
  const engagementMatch = calculateEngagementMatch(
    talent.engagementPreference,
    job.engagementType
  );

  // Calculate weighted total
  const total =
    skillOverlap * finalWeights.skillOverlap +
    categoryMatch * finalWeights.categoryMatch +
    experienceMatch * finalWeights.experienceMatch +
    engagementMatch * finalWeights.engagementMatch;

  // Convert to percentage (0-100)
  const score = Math.round(total * 100);

  const breakdown: MatchScoreBreakdown = {
    skillOverlap: Math.round(skillOverlap * 100),
    categoryMatch: Math.round(categoryMatch * 100),
    experienceMatch: Math.round(experienceMatch * 100),
    engagementMatch: Math.round(engagementMatch * 100),
    total: score,
  };

  return { score, breakdown };
}




