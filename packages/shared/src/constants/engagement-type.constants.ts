/**
 * Engagement types for jobs
 */
export enum EngagementType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  FREELANCE = 'FREELANCE',
  PROJECT_BASED = 'PROJECT_BASED',
}

/**
 * Engagement type display names
 */
export const EngagementTypeLabels: Record<EngagementType, string> = {
  [EngagementType.FULL_TIME]: 'Full-time',
  [EngagementType.PART_TIME]: 'Part-time',
  [EngagementType.CONTRACT]: 'Contract',
  [EngagementType.FREELANCE]: 'Freelance',
  [EngagementType.PROJECT_BASED]: 'Project-based',
};




