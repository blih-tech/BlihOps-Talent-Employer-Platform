import {
  ServiceCategory,
  EngagementType,
  JobStatus,
} from '../constants';

/**
 * Job posting interface
 */
export interface Job {
  id: string;
  createdBy: string; // Admin ID
  serviceCategory: ServiceCategory;
  title: string;
  description: string;
  requiredSkills: string[];
  engagementType: EngagementType;
  duration?: string;
  status: JobStatus;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create job DTO
 */
export interface CreateJobDto {
  serviceCategory: ServiceCategory;
  title: string;
  description: string;
  requiredSkills: string[];
  engagementType: EngagementType;
  duration?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Update job DTO
 */
export interface UpdateJobDto {
  serviceCategory?: ServiceCategory;
  title?: string;
  description?: string;
  requiredSkills?: string[];
  engagementType?: EngagementType;
  duration?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Job filter DTO
 */
export interface FilterJobDto {
  serviceCategory?: ServiceCategory | ServiceCategory[];
  engagementType?: EngagementType | EngagementType[];
  status?: JobStatus;
  requiredSkills?: string[];
  createdBy?: string;
  search?: string;
  limit?: number;
  offset?: number;
}





