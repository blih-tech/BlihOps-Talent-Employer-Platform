/**
 * API Client Types
 * Additional types for API client that aren't in @blihops/shared
 */

import { Talent } from '@blihops/shared';

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  data: T;
}

/**
 * Paginated API Response
 */
export interface PaginatedApiResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Application (Applicant) type
 */
export interface Application {
  id: string;
  jobId: string;
  talentId: string;
  status: 'NEW' | 'SHORTLISTED' | 'HIRED' | 'REJECTED';
  matchScore?: number;
  matchBreakdown?: Record<string, unknown>;
  notes?: string;
  rejectionReason?: string;
  appliedAt: Date;
  shortlistedAt?: Date;
  hiredAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  talent?: Talent;
}

/**
 * Application action DTO
 */
export interface ApplicationActionDto {
  notes?: string;
  reason?: string;
  hireDate?: string;
}

/**
 * Reject job DTO
 */
export interface RejectJobDto {
  reason?: string;
}

