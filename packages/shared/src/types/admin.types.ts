import { AdminRole } from '../constants';

/**
 * Admin user interface
 */
export interface Admin {
  id: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  telegramIds?: bigint[] | number[];
  preferences?: Record<string, unknown>;
  createdAt: Date;
  lastLoginAt?: Date;
}

/**
 * Create admin DTO
 */
export interface CreateAdminDto {
  email: string;
  password: string;
  role: AdminRole;
  telegramIds?: bigint[] | number[];
  preferences?: Record<string, unknown>;
}

/**
 * Update admin DTO
 */
export interface UpdateAdminDto {
  email?: string;
  password?: string;
  role?: AdminRole;
  telegramIds?: bigint[] | number[];
  preferences?: Record<string, unknown>;
}




