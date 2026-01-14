import { z } from 'zod';
import {
  ServiceCategory,
  ExperienceLevel,
  EngagementType,
  TalentStatus,
  AvailabilityStatus,
} from '../constants';

/**
 * Service category schema (single or array)
 */
const ServiceCategorySchema = z.union([
  z.nativeEnum(ServiceCategory),
  z.array(z.nativeEnum(ServiceCategory)),
]);

/**
 * Engagement preference schema (single or array)
 */
const EngagementPreferenceSchema = z.union([
  z.nativeEnum(EngagementType),
  z.array(z.nativeEnum(EngagementType)),
]).optional();

/**
 * Talent creation schema
 */
export const CreateTalentSchema = z.object({
  telegramId: z.union([z.bigint(), z.number().int().positive()]),
  name: z.string().min(1).max(255),
  serviceCategory: ServiceCategorySchema,
  roleSpecialization: z.string().max(255).optional(),
  skills: z.array(z.string().min(1)).min(1),
  experienceLevel: z.nativeEnum(ExperienceLevel),
  availability: z.nativeEnum(AvailabilityStatus),
  engagementPreference: EngagementPreferenceSchema,
  cvUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Talent update schema
 */
export const UpdateTalentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  serviceCategory: ServiceCategorySchema.optional(),
  roleSpecialization: z.string().max(255).optional(),
  skills: z.array(z.string().min(1)).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  availability: z.nativeEnum(AvailabilityStatus).optional(),
  engagementPreference: EngagementPreferenceSchema,
  cvUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Talent filter schema
 */
export const FilterTalentSchema = z.object({
  serviceCategory: ServiceCategorySchema.optional(),
  experienceLevel: z.union([
    z.nativeEnum(ExperienceLevel),
    z.array(z.nativeEnum(ExperienceLevel)),
  ]).optional(),
  availability: z.nativeEnum(AvailabilityStatus).optional(),
  status: z.nativeEnum(TalentStatus).optional(),
  skills: z.array(z.string()).optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
});

/**
 * Type inference from schemas
 */
export type CreateTalentInput = z.infer<typeof CreateTalentSchema>;
export type UpdateTalentInput = z.infer<typeof UpdateTalentSchema>;
export type FilterTalentInput = z.infer<typeof FilterTalentSchema>;

