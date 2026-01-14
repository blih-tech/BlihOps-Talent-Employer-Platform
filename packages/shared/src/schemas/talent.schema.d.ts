import { z } from 'zod';
import { ServiceCategory, ExperienceLevel, EngagementType, TalentStatus, AvailabilityStatus } from '../constants';
/**
 * Talent creation schema
 */
export declare const CreateTalentSchema: z.ZodObject<{
    telegramId: z.ZodUnion<[z.ZodBigInt, z.ZodNumber]>;
    name: z.ZodString;
    serviceCategory: z.ZodUnion<[z.ZodNativeEnum<typeof ServiceCategory>, z.ZodArray<z.ZodNativeEnum<typeof ServiceCategory>, "many">]>;
    roleSpecialization: z.ZodOptional<z.ZodString>;
    skills: z.ZodArray<z.ZodString, "many">;
    experienceLevel: z.ZodNativeEnum<typeof ExperienceLevel>;
    availability: z.ZodNativeEnum<typeof AvailabilityStatus>;
    engagementPreference: z.ZodOptional<z.ZodUnion<[z.ZodNativeEnum<typeof EngagementType>, z.ZodArray<z.ZodNativeEnum<typeof EngagementType>, "many">]>>;
    cvUrl: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    telegramId: number | bigint;
    serviceCategory: ServiceCategory | ServiceCategory[];
    skills: string[];
    experienceLevel: ExperienceLevel;
    availability: AvailabilityStatus;
    roleSpecialization?: string | undefined;
    engagementPreference?: EngagementType | EngagementType[] | undefined;
    cvUrl?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    name: string;
    telegramId: number | bigint;
    serviceCategory: ServiceCategory | ServiceCategory[];
    skills: string[];
    experienceLevel: ExperienceLevel;
    availability: AvailabilityStatus;
    roleSpecialization?: string | undefined;
    engagementPreference?: EngagementType | EngagementType[] | undefined;
    cvUrl?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
/**
 * Talent update schema
 */
export declare const UpdateTalentSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    serviceCategory: z.ZodOptional<z.ZodUnion<[z.ZodNativeEnum<typeof ServiceCategory>, z.ZodArray<z.ZodNativeEnum<typeof ServiceCategory>, "many">]>>;
    roleSpecialization: z.ZodOptional<z.ZodString>;
    skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    experienceLevel: z.ZodOptional<z.ZodNativeEnum<typeof ExperienceLevel>>;
    availability: z.ZodOptional<z.ZodNativeEnum<typeof AvailabilityStatus>>;
    engagementPreference: z.ZodOptional<z.ZodUnion<[z.ZodNativeEnum<typeof EngagementType>, z.ZodArray<z.ZodNativeEnum<typeof EngagementType>, "many">]>>;
    cvUrl: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    serviceCategory?: ServiceCategory | ServiceCategory[] | undefined;
    roleSpecialization?: string | undefined;
    skills?: string[] | undefined;
    experienceLevel?: ExperienceLevel | undefined;
    availability?: AvailabilityStatus | undefined;
    engagementPreference?: EngagementType | EngagementType[] | undefined;
    cvUrl?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    name?: string | undefined;
    serviceCategory?: ServiceCategory | ServiceCategory[] | undefined;
    roleSpecialization?: string | undefined;
    skills?: string[] | undefined;
    experienceLevel?: ExperienceLevel | undefined;
    availability?: AvailabilityStatus | undefined;
    engagementPreference?: EngagementType | EngagementType[] | undefined;
    cvUrl?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
/**
 * Talent filter schema
 */
export declare const FilterTalentSchema: z.ZodObject<{
    serviceCategory: z.ZodOptional<z.ZodUnion<[z.ZodNativeEnum<typeof ServiceCategory>, z.ZodArray<z.ZodNativeEnum<typeof ServiceCategory>, "many">]>>;
    experienceLevel: z.ZodOptional<z.ZodUnion<[z.ZodNativeEnum<typeof ExperienceLevel>, z.ZodArray<z.ZodNativeEnum<typeof ExperienceLevel>, "many">]>>;
    availability: z.ZodOptional<z.ZodNativeEnum<typeof AvailabilityStatus>>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof TalentStatus>>;
    skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    search: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: TalentStatus | undefined;
    serviceCategory?: ServiceCategory | ServiceCategory[] | undefined;
    skills?: string[] | undefined;
    experienceLevel?: ExperienceLevel | ExperienceLevel[] | undefined;
    availability?: AvailabilityStatus | undefined;
    search?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}, {
    status?: TalentStatus | undefined;
    serviceCategory?: ServiceCategory | ServiceCategory[] | undefined;
    skills?: string[] | undefined;
    experienceLevel?: ExperienceLevel | ExperienceLevel[] | undefined;
    availability?: AvailabilityStatus | undefined;
    search?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
/**
 * Type inference from schemas
 */
export type CreateTalentInput = z.infer<typeof CreateTalentSchema>;
export type UpdateTalentInput = z.infer<typeof UpdateTalentSchema>;
export type FilterTalentInput = z.infer<typeof FilterTalentSchema>;
//# sourceMappingURL=talent.schema.d.ts.map