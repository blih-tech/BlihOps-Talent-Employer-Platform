"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperienceLevelLabels = exports.ExperienceLevel = void 0;
/**
 * Experience levels for talents
 */
var ExperienceLevel;
(function (ExperienceLevel) {
    ExperienceLevel["JUNIOR"] = "JUNIOR";
    ExperienceLevel["MID"] = "MID";
    ExperienceLevel["SENIOR"] = "SENIOR";
    ExperienceLevel["LEAD"] = "LEAD";
    ExperienceLevel["ARCHITECT"] = "ARCHITECT";
})(ExperienceLevel || (exports.ExperienceLevel = ExperienceLevel = {}));
/**
 * Experience level display names
 */
exports.ExperienceLevelLabels = {
    [ExperienceLevel.JUNIOR]: 'Junior (0-2 years)',
    [ExperienceLevel.MID]: 'Mid-level (2-5 years)',
    [ExperienceLevel.SENIOR]: 'Senior (5-8 years)',
    [ExperienceLevel.LEAD]: 'Lead (8+ years)',
    [ExperienceLevel.ARCHITECT]: 'Architect (10+ years)',
};
//# sourceMappingURL=experience-level.constants.js.map