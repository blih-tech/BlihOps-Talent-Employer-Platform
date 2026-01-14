/**
 * Experience levels for talents
 */
export enum ExperienceLevel {
  JUNIOR = 'JUNIOR',
  MID = 'MID',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
  ARCHITECT = 'ARCHITECT',
}

/**
 * Experience level display names
 */
export const ExperienceLevelLabels: Record<ExperienceLevel, string> = {
  [ExperienceLevel.JUNIOR]: 'Junior (0-2 years)',
  [ExperienceLevel.MID]: 'Mid-level (2-5 years)',
  [ExperienceLevel.SENIOR]: 'Senior (5-8 years)',
  [ExperienceLevel.LEAD]: 'Lead (8+ years)',
  [ExperienceLevel.ARCHITECT]: 'Architect (10+ years)',
};

