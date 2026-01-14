import { Talent, Job } from '../types';
import {
  ServiceCategoryLabels,
  ExperienceLevelLabels,
  EngagementTypeLabels,
} from '../constants';

/**
 * Format talent profile for display
 */
export function formatTalentProfile(talent: Talent): string {
  const categories = Array.isArray(talent.serviceCategory)
    ? talent.serviceCategory.map((c) => ServiceCategoryLabels[c]).join(', ')
    : ServiceCategoryLabels[talent.serviceCategory];

  const engagement = talent.engagementPreference
    ? Array.isArray(talent.engagementPreference)
      ? talent.engagementPreference.map((e) => EngagementTypeLabels[e]).join(', ')
      : EngagementTypeLabels[talent.engagementPreference]
    : 'Not specified';

  return `
Name: ${talent.name}
Category: ${categories}
Role: ${talent.roleSpecialization || 'Not specified'}
Experience: ${ExperienceLevelLabels[talent.experienceLevel]}
Skills: ${talent.skills.join(', ')}
Availability: ${talent.availability}
Engagement Preference: ${engagement}
Status: ${talent.status}
  `.trim();
}

/**
 * Format job posting for display
 */
export function formatJobPosting(job: Job): string {
  return `
Title: ${job.title}
Category: ${ServiceCategoryLabels[job.serviceCategory]}
Engagement: ${EngagementTypeLabels[job.engagementType]}
Duration: ${job.duration || 'Not specified'}
Required Skills: ${job.requiredSkills.join(', ')}
Description: ${job.description}
Status: ${job.status}
  `.trim();
}

/**
 * Format skills list for display
 */
export function formatSkillsList(skills: string[]): string {
  return skills.join(', ');
}

/**
 * Format match score for display
 */
export function formatMatchScore(score: number): string {
  if (score >= 80) {
    return `Excellent match (${score}%)`;
  }
  if (score >= 60) {
    return `Good match (${score}%)`;
  }
  if (score >= 40) {
    return `Fair match (${score}%)`;
  }
  return `Poor match (${score}%)`;
}

