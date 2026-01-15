import {
  ServiceCategory,
  ExperienceLevel,
  EngagementType,
  TalentStatus,
  AvailabilityStatus,
} from '../constants';

/**
 * Talent profile interface
 */
export interface Talent {
  id: string;
  telegramId: bigint | number;
  name: string;
  serviceCategory: ServiceCategory | ServiceCategory[];
  roleSpecialization?: string;
  skills: string[];
  experienceLevel: ExperienceLevel;
  availability: AvailabilityStatus;
  engagementPreference?: EngagementType | EngagementType[];
  cvUrl?: string;
  status: TalentStatus;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create talent DTO
 */
export interface CreateTalentDto {
  telegramId: bigint | number;
  name: string;
  serviceCategory: ServiceCategory | ServiceCategory[];
  roleSpecialization?: string;
  skills: string[];
  experienceLevel: ExperienceLevel;
  availability: AvailabilityStatus;
  engagementPreference?: EngagementType | EngagementType[];
  cvUrl?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Update talent DTO
 */
export interface UpdateTalentDto {
  name?: string;
  serviceCategory?: ServiceCategory | ServiceCategory[];
  roleSpecialization?: string;
  skills?: string[];
  experienceLevel?: ExperienceLevel;
  availability?: AvailabilityStatus;
  engagementPreference?: EngagementType | EngagementType[];
  cvUrl?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Talent filter DTO
 */
export interface FilterTalentDto {
  serviceCategory?: ServiceCategory | ServiceCategory[];
  experienceLevel?: ExperienceLevel | ExperienceLevel[];
  availability?: AvailabilityStatus;
  status?: TalentStatus;
  skills?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}




