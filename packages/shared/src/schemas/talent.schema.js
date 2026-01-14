"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterTalentSchema = exports.UpdateTalentSchema = exports.CreateTalentSchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("../constants");
/**
 * Service category schema (single or array)
 */
const ServiceCategorySchema = zod_1.z.union([
    zod_1.z.nativeEnum(constants_1.ServiceCategory),
    zod_1.z.array(zod_1.z.nativeEnum(constants_1.ServiceCategory)),
]);
/**
 * Engagement preference schema (single or array)
 */
const EngagementPreferenceSchema = zod_1.z.union([
    zod_1.z.nativeEnum(constants_1.EngagementType),
    zod_1.z.array(zod_1.z.nativeEnum(constants_1.EngagementType)),
]).optional();
/**
 * Talent creation schema
 */
exports.CreateTalentSchema = zod_1.z.object({
    telegramId: zod_1.z.union([zod_1.z.bigint(), zod_1.z.number().int().positive()]),
    name: zod_1.z.string().min(1).max(255),
    serviceCategory: ServiceCategorySchema,
    roleSpecialization: zod_1.z.string().max(255).optional(),
    skills: zod_1.z.array(zod_1.z.string().min(1)).min(1),
    experienceLevel: zod_1.z.nativeEnum(constants_1.ExperienceLevel),
    availability: zod_1.z.nativeEnum(constants_1.AvailabilityStatus),
    engagementPreference: EngagementPreferenceSchema,
    cvUrl: zod_1.z.string().url().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
/**
 * Talent update schema
 */
exports.UpdateTalentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional(),
    serviceCategory: ServiceCategorySchema.optional(),
    roleSpecialization: zod_1.z.string().max(255).optional(),
    skills: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    experienceLevel: zod_1.z.nativeEnum(constants_1.ExperienceLevel).optional(),
    availability: zod_1.z.nativeEnum(constants_1.AvailabilityStatus).optional(),
    engagementPreference: EngagementPreferenceSchema,
    cvUrl: zod_1.z.string().url().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
/**
 * Talent filter schema
 */
exports.FilterTalentSchema = zod_1.z.object({
    serviceCategory: ServiceCategorySchema.optional(),
    experienceLevel: zod_1.z.union([
        zod_1.z.nativeEnum(constants_1.ExperienceLevel),
        zod_1.z.array(zod_1.z.nativeEnum(constants_1.ExperienceLevel)),
    ]).optional(),
    availability: zod_1.z.nativeEnum(constants_1.AvailabilityStatus).optional(),
    status: zod_1.z.nativeEnum(constants_1.TalentStatus).optional(),
    skills: zod_1.z.array(zod_1.z.string()).optional(),
    search: zod_1.z.string().optional(),
    limit: zod_1.z.number().int().positive().max(100).optional(),
    offset: zod_1.z.number().int().nonnegative().optional(),
});
//# sourceMappingURL=talent.schema.js.map