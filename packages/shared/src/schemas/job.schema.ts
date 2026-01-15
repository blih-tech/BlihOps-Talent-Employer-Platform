import { z } from 'zod';
import {
  ServiceCategory,
  EngagementType,
  JobStatus,
} from '../constants';

/**
 * Job creation schema
 */
export const CreateJobSchema = z.object({
  serviceCategory: z.nativeEnum(ServiceCategory),
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  requiredSkills: z.array(z.string().min(1)).min(1),
  engagementType: z.nativeEnum(EngagementType),
  duration: z.string().max(255).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Job update schema
 */
export const UpdateJobSchema = z.object({
  serviceCategory: z.nativeEnum(ServiceCategory).optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  requiredSkills: z.array(z.string().min(1)).optional(),
  engagementType: z.nativeEnum(EngagementType).optional(),
  duration: z.string().max(255).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Job filter schema
 */
export const FilterJobSchema = z.object({
  serviceCategory: z.union([
    z.nativeEnum(ServiceCategory),
    z.array(z.nativeEnum(ServiceCategory)),
  ]).optional(),
  engagementType: z.union([
    z.nativeEnum(EngagementType),
    z.array(z.nativeEnum(EngagementType)),
  ]).optional(),
  status: z.nativeEnum(JobStatus).optional(),
  requiredSkills: z.array(z.string()).optional(),
  createdBy: z.string().uuid().optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
});

/**
 * Type inference from schemas
 */
export type CreateJobInput = z.infer<typeof CreateJobSchema>;
export type UpdateJobInput = z.infer<typeof UpdateJobSchema>;
export type FilterJobInput = z.infer<typeof FilterJobSchema>;




