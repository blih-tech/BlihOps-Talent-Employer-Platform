"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTalentProfile = formatTalentProfile;
exports.formatJobPosting = formatJobPosting;
exports.formatSkillsList = formatSkillsList;
exports.formatMatchScore = formatMatchScore;
const constants_1 = require("../constants");
/**
 * Format talent profile for display
 */
function formatTalentProfile(talent) {
    const categories = Array.isArray(talent.serviceCategory)
        ? talent.serviceCategory.map((c) => constants_1.ServiceCategoryLabels[c]).join(', ')
        : constants_1.ServiceCategoryLabels[talent.serviceCategory];
    const engagement = talent.engagementPreference
        ? Array.isArray(talent.engagementPreference)
            ? talent.engagementPreference.map((e) => constants_1.EngagementTypeLabels[e]).join(', ')
            : constants_1.EngagementTypeLabels[talent.engagementPreference]
        : 'Not specified';
    return `
Name: ${talent.name}
Category: ${categories}
Role: ${talent.roleSpecialization || 'Not specified'}
Experience: ${constants_1.ExperienceLevelLabels[talent.experienceLevel]}
Skills: ${talent.skills.join(', ')}
Availability: ${talent.availability}
Engagement Preference: ${engagement}
Status: ${talent.status}
  `.trim();
}
/**
 * Format job posting for display
 */
function formatJobPosting(job) {
    return `
Title: ${job.title}
Category: ${constants_1.ServiceCategoryLabels[job.serviceCategory]}
Engagement: ${constants_1.EngagementTypeLabels[job.engagementType]}
Duration: ${job.duration || 'Not specified'}
Required Skills: ${job.requiredSkills.join(', ')}
Description: ${job.description}
Status: ${job.status}
  `.trim();
}
/**
 * Format skills list for display
 */
function formatSkillsList(skills) {
    return skills.join(', ');
}
/**
 * Format match score for display
 */
function formatMatchScore(score) {
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
//# sourceMappingURL=formatting.util.js.map