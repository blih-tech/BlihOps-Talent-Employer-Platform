import { z } from 'zod';
import { ServiceCategory, EngagementType, JobStatus } from '../constants';
/**
 * Job creation schema
 */
export declare const CreateJobSchema: z.ZodObject<{
    serviceCategory: z.ZodNativeEnum<typeof ServiceCategory>;
    title: z.ZodString;
    description: z.ZodString;
    requiredSkills: z.ZodArray<z.ZodString, "many">;
    engagementType: z.ZodNativeEnum<typeof EngagementType>;
    duration: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    title: string;
    serviceCategory: ServiceCategory;
    requiredSkills: string[];
    engagementType: EngagementType;
    metadata?: Record<string, unknown> | undefined;
    duration?: string | undefined;
}, {
    description: string;
    title: string;
    serviceCategory: ServiceCategory;
    requiredSkills: string[];
    engagementType: EngagementType;
    metadata?: Record<string, unknown> | undefined;
    duration?: string | undefined;
}>;
/**
 * Job update schema
 */
export declare const UpdateJobSchema: z.ZodObject<{
    serviceCategory: z.ZodOptional<z.ZodNativeEnum<typeof ServiceCategory>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    requiredSkills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    engagementType: z.ZodOptional<z.ZodNativeEnum<typeof EngagementType>>;
    duration: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    title?: string | undefined;
    serviceCategory?: ServiceCategory | undefined;
    metadata?: Record<string, unknown> | undefined;
    requiredSkills?: string[] | undefined;
    engagementType?: EngagementType | undefined;
    duration?: string | undefined;
}, {
    description?: string | undefined;
    title?: string | undefined;
    serviceCategory?: ServiceCategory | undefined;
    metadata?: Record<string, unknown> | undefined;
    requiredSkills?: string[] | undefined;
    engagementType?: EngagementType | undefined;
    duration?: string | undefined;
}>;
/**
 * Job filter schema
 */
export declare const FilterJobSchema: z.ZodObject<{
    serviceCategory: z.ZodOptional<z.ZodUnion<[z.ZodNativeEnum<typeof ServiceCategory>, z.ZodArray<z.ZodNativeEnum<typeof ServiceCategory>, "many">]>>;
    engagementType: z.ZodOptional<z.ZodUnion<[z.ZodNativeEnum<typeof EngagementType>, z.ZodArray<z.ZodNativeEnum<typeof EngagementType>, "many">]>>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof JobStatus>>;
    requiredSkills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    createdBy: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: JobStatus | undefined;
    serviceCategory?: ServiceCategory | ServiceCategory[] | undefined;
    search?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    requiredSkills?: string[] | undefined;
    engagementType?: EngagementType | EngagementType[] | undefined;
    createdBy?: string | undefined;
}, {
    status?: JobStatus | undefined;
    serviceCategory?: ServiceCategory | ServiceCategory[] | undefined;
    search?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    requiredSkills?: string[] | undefined;
    engagementType?: EngagementType | EngagementType[] | undefined;
    createdBy?: string | undefined;
}>;
/**
 * Type inference from schemas
 */
export type CreateJobInput = z.infer<typeof CreateJobSchema>;
export type UpdateJobInput = z.infer<typeof UpdateJobSchema>;
export type FilterJobInput = z.infer<typeof FilterJobSchema>;
//# sourceMappingURL=job.schema.d.ts.map