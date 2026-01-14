/**
 * Talent profile status
 */
export enum TalentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Job posting status
 */
export enum JobStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING', // Awaiting approval
  PUBLISHED = 'PUBLISHED', // Live and accepting applications
  REJECTED = 'REJECTED', // Review and make adjustments
  CLOSED = 'CLOSED', // No longer accepting applications
  EXPIRED = 'EXPIRED', // Expired job posting
}

/**
 * Admin user roles
 */
export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

/**
 * Availability status for talents
 */
export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  UNAVAILABLE = 'UNAVAILABLE',
}

