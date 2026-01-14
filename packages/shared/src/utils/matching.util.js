"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSkillOverlap = calculateSkillOverlap;
exports.calculateCategoryMatch = calculateCategoryMatch;
exports.calculateExperienceMatch = calculateExperienceMatch;
exports.calculateEngagementMatch = calculateEngagementMatch;
exports.calculateMatchScore = calculateMatchScore;
const constants_1 = require("../constants");
/**
 * Calculate skill overlap between talent and job
 * Returns a value between 0 and 1
 */
function calculateSkillOverlap(talentSkills, jobSkills) {
    if (jobSkills.length === 0) {
        return 0;
    }
    // Normalize skills to lowercase for comparison
    const normalizedTalentSkills = talentSkills.map((s) => s.toLowerCase().trim());
    const normalizedJobSkills = jobSkills.map((s) => s.toLowerCase().trim());
    // Find matching skills
    const matchingSkills = normalizedJobSkills.filter((jobSkill) => normalizedTalentSkills.some((talentSkill) => talentSkill.includes(jobSkill) || jobSkill.includes(talentSkill)));
    // Calculate overlap percentage
    return matchingSkills.length / normalizedJobSkills.length;
}
/**
 * Calculate category match score
 * Returns 1 if categories match, 0 otherwise
 */
function calculateCategoryMatch(talentCategories, jobCategory) {
    if (Array.isArray(talentCategories)) {
        return talentCategories.includes(jobCategory) ? 1 : 0;
    }
    return talentCategories === jobCategory ? 1 : 0;
}
/**
 * Calculate experience level match score
 * Returns a value between 0 and 1 based on experience level compatibility
 */
function calculateExperienceMatch(talentLevel, jobLevel) {
    if (!jobLevel) {
        return 0.5; // Neutral score if job doesn't specify
    }
    // Define experience level hierarchy
    const levelHierarchy = {
        [constants_1.ExperienceLevel.JUNIOR]: 1,
        [constants_1.ExperienceLevel.MID]: 2,
        [constants_1.ExperienceLevel.SENIOR]: 3,
        [constants_1.ExperienceLevel.LEAD]: 4,
        [constants_1.ExperienceLevel.ARCHITECT]: 5,
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
function calculateEngagementMatch(talentPreference, jobEngagement) {
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
function calculateMatchScore(talent, job, weights = {}) {
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
    const engagementMatch = calculateEngagementMatch(talent.engagementPreference, job.engagementType);
    // Calculate weighted total
    const total = skillOverlap * finalWeights.skillOverlap +
        categoryMatch * finalWeights.categoryMatch +
        experienceMatch * finalWeights.experienceMatch +
        engagementMatch * finalWeights.engagementMatch;
    // Convert to percentage (0-100)
    const score = Math.round(total * 100);
    const breakdown = {
        skillOverlap: Math.round(skillOverlap * 100),
        categoryMatch: Math.round(categoryMatch * 100),
        experienceMatch: Math.round(experienceMatch * 100),
        engagementMatch: Math.round(engagementMatch * 100),
        total: score,
    };
    return { score, breakdown };
}
//# sourceMappingURL=matching.util.js.map