"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngagementTypeLabels = exports.EngagementType = void 0;
/**
 * Engagement types for jobs
 */
var EngagementType;
(function (EngagementType) {
    EngagementType["FULL_TIME"] = "FULL_TIME";
    EngagementType["PART_TIME"] = "PART_TIME";
    EngagementType["CONTRACT"] = "CONTRACT";
    EngagementType["FREELANCE"] = "FREELANCE";
    EngagementType["PROJECT_BASED"] = "PROJECT_BASED";
})(EngagementType || (exports.EngagementType = EngagementType = {}));
/**
 * Engagement type display names
 */
exports.EngagementTypeLabels = {
    [EngagementType.FULL_TIME]: 'Full-time',
    [EngagementType.PART_TIME]: 'Part-time',
    [EngagementType.CONTRACT]: 'Contract',
    [EngagementType.FREELANCE]: 'Freelance',
    [EngagementType.PROJECT_BASED]: 'Project-based',
};
//# sourceMappingURL=engagement-type.constants.js.map