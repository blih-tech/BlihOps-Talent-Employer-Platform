"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityStatus = exports.AdminRole = exports.JobStatus = exports.TalentStatus = void 0;
/**
 * Talent profile status
 */
var TalentStatus;
(function (TalentStatus) {
    TalentStatus["PENDING"] = "PENDING";
    TalentStatus["APPROVED"] = "APPROVED";
    TalentStatus["REJECTED"] = "REJECTED";
    TalentStatus["ARCHIVED"] = "ARCHIVED";
})(TalentStatus || (exports.TalentStatus = TalentStatus = {}));
/**
 * Job posting status
 */
var JobStatus;
(function (JobStatus) {
    JobStatus["DRAFT"] = "DRAFT";
    JobStatus["PENDING"] = "PENDING";
    JobStatus["PUBLISHED"] = "PUBLISHED";
    JobStatus["ARCHIVED"] = "ARCHIVED";
    JobStatus["CLOSED"] = "CLOSED";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
/**
 * Admin user roles
 */
var AdminRole;
(function (AdminRole) {
    AdminRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    AdminRole["ADMIN"] = "ADMIN";
    AdminRole["MODERATOR"] = "MODERATOR";
})(AdminRole || (exports.AdminRole = AdminRole = {}));
/**
 * Availability status for talents
 */
var AvailabilityStatus;
(function (AvailabilityStatus) {
    AvailabilityStatus["AVAILABLE"] = "AVAILABLE";
    AvailabilityStatus["BUSY"] = "BUSY";
    AvailabilityStatus["UNAVAILABLE"] = "UNAVAILABLE";
})(AvailabilityStatus || (exports.AvailabilityStatus = AvailabilityStatus = {}));
//# sourceMappingURL=status.constants.js.map