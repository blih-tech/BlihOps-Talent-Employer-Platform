"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterJobSchema = exports.UpdateJobSchema = exports.CreateJobSchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("../constants");
/**
 * Job creation schema
 */
exports.CreateJobSchema = zod_1.z.object({
    serviceCategory: zod_1.z.nativeEnum(constants_1.ServiceCategory),
    title: zod_1.z.string().min(1).max(255),
    description: zod_1.z.string().min(1),
    requiredSkills: zod_1.z.array(zod_1.z.string().min(1)).min(1),
    engagementType: zod_1.z.nativeEnum(constants_1.EngagementType),
    duration: zod_1.z.string().max(255).optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
/**
 * Job update schema
 */
exports.UpdateJobSchema = zod_1.z.object({
    serviceCategory: zod_1.z.nativeEnum(constants_1.ServiceCategory).optional(),
    title: zod_1.z.string().min(1).max(255).optional(),
    description: zod_1.z.string().min(1).optional(),
    requiredSkills: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    engagementType: zod_1.z.nativeEnum(constants_1.EngagementType).optional(),
    duration: zod_1.z.string().max(255).optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
/**
 * Job filter schema
 */
exports.FilterJobSchema = zod_1.z.object({
    serviceCategory: zod_1.z.union([
        zod_1.z.nativeEnum(constants_1.ServiceCategory),
        zod_1.z.array(zod_1.z.nativeEnum(constants_1.ServiceCategory)),
    ]).optional(),
    engagementType: zod_1.z.union([
        zod_1.z.nativeEnum(constants_1.EngagementType),
        zod_1.z.array(zod_1.z.nativeEnum(constants_1.EngagementType)),
    ]).optional(),
    status: zod_1.z.nativeEnum(constants_1.JobStatus).optional(),
    requiredSkills: zod_1.z.array(zod_1.z.string()).optional(),
    createdBy: zod_1.z.string().uuid().optional(),
    search: zod_1.z.string().optional(),
    limit: zod_1.z.number().int().positive().max(100).optional(),
    offset: zod_1.z.number().int().nonnegative().optional(),
});
//# sourceMappingURL=job.schema.js.map