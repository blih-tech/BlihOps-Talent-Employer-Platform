import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config';
import {
  CreateTalentDto,
  UpdateTalentDto,
  Talent,
  CreateJobDto,
  UpdateJobDto,
  Job,
} from '@blihops/shared';
import {
  ApiResponse,
  PaginatedApiResponse,
  Application,
  ApplicationActionDto,
  RejectJobDto,
} from './types';
import { parseError } from '../utils/error-handler';

/**
 * API Client for backend communication
 * Handles all HTTP requests to the backend API
 */
export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.API_URL,
      timeout: 30000, // Increased timeout to 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Use enhanced error handler
        const parsed = parseError(error);
        
        // Create enhanced error with more context
        const enhancedError = new Error(parsed.message);
        (enhancedError as any).type = parsed.type;
        (enhancedError as any).statusCode = parsed.statusCode;
        (enhancedError as any).userMessage = parsed.userMessage;
        (enhancedError as any).originalError = parsed.originalError;
        
        return Promise.reject(enhancedError);
      }
    );
  }

  // ==========================================
  // Talent endpoints
  // ==========================================

  /**
   * Create a new talent profile
   */
  async createTalent(data: CreateTalentDto): Promise<Talent> {
    const response = await this.client.post<ApiResponse<Talent>>('/talents', data);
    return response.data.data;
  }

  /**
   * Get talent by ID
   */
  async getTalent(id: string): Promise<Talent> {
    const response = await this.client.get<ApiResponse<Talent>>(`/talents/${id}`);
    return response.data.data;
  }

  /**
   * Get talent by Telegram ID
   * Note: This queries the list endpoint and finds the matching talent
   */
  async getTalentByTelegramId(telegramId: string | number): Promise<Talent | null> {
    try {
      // Query talents list and filter by telegramId
      // The API may not have direct endpoint, so we query all and filter client-side
      // This is a fallback - ideally the API should have /talents?telegramId=xxx
      const response = await this.client.get<PaginatedApiResponse<Talent>>('/talents', {
        params: {
          limit: 100, // Get enough to find the match
        },
      });

      const talent = response.data.data.find(
        (t) => t.telegramId.toString() === telegramId.toString()
      );

      return talent || null;
    } catch (error) {
      // If error is 404 or similar, return null
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Update talent profile
   */
  async updateTalent(id: string, data: UpdateTalentDto): Promise<Talent> {
    const response = await this.client.patch<ApiResponse<Talent>>(`/talents/${id}`, data);
    return response.data.data;
  }

  // ==========================================
  // Job endpoints
  // ==========================================

  /**
   * Create a new job posting
   */
  async createJob(data: CreateJobDto): Promise<Job> {
    const response = await this.client.post<ApiResponse<Job>>('/jobs', data);
    return response.data.data;
  }

  /**
   * Get job by ID
   */
  async getJob(id: string): Promise<Job> {
    const response = await this.client.get<ApiResponse<Job>>(`/jobs/${id}`);
    return response.data.data;
  }

  /**
   * Update job posting
   */
  async updateJob(id: string, data: UpdateJobDto): Promise<Job> {
    const response = await this.client.patch<ApiResponse<Job>>(`/jobs/${id}`, data);
    return response.data.data;
  }

  /**
   * Publish a pending job
   */
  async publishJob(id: string): Promise<Job> {
    const response = await this.client.post<ApiResponse<Job>>(`/jobs/${id}/publish`);
    return response.data.data;
  }

  /**
   * Reject a pending job
   */
  async rejectJob(id: string, reason?: string): Promise<Job> {
    const dto: RejectJobDto = reason ? { reason } : {};
    const response = await this.client.post<ApiResponse<Job>>(`/jobs/${id}/reject`, dto);
    return response.data.data;
  }

  /**
   * Close a published job
   */
  async closeJob(id: string): Promise<Job> {
    const response = await this.client.post<ApiResponse<Job>>(`/jobs/${id}/close`);
    return response.data.data;
  }

  /**
   * Reopen a closed job
   * Note: This endpoint may not exist yet - it should publish the job again
   */
  async reopenJob(id: string): Promise<Job> {
    // If reopen endpoint doesn't exist, try to publish it
    // This might need to be adjusted based on actual API implementation
    const response = await this.client.post<ApiResponse<Job>>(`/jobs/${id}/reopen`);
    return response.data.data;
  }

  /**
   * Get jobs by admin (creator)
   * Uses the jobs list endpoint with createdBy filter
   */
  async getJobsByAdmin(adminId: string, status?: string): Promise<Job[]> {
    const params: Record<string, string> = {};
    
    // Note: The API might use 'createdBy' or 'createdById' parameter
    // Adjust based on actual API implementation
    // For now, we'll use a query that the API might support
    // If the API doesn't support filtering by creator in the list endpoint,
    // we may need to get all jobs and filter client-side
    
    if (status) {
      params.status = status;
    }

    const response = await this.client.get<PaginatedApiResponse<Job>>('/jobs', {
      params,
    });

    // Filter by creator client-side if API doesn't support it
    // In production, this should be done server-side
    const jobs = response.data.data.filter((job) => job.createdBy === adminId);
    
    return jobs;
  }

  // ==========================================
  // Applicant endpoints
  // ==========================================

  /**
   * Get all applicants for a job
   */
  async getJobApplicants(jobId: string): Promise<Application[]> {
    const response = await this.client.get<PaginatedApiResponse<Application>>(
      `/jobs/${jobId}/applicants`
    );
    return response.data.data;
  }

  /**
   * Get a specific applicant/application
   */
  async getApplicant(jobId: string, applicantId: string): Promise<Application> {
    const response = await this.client.get<ApiResponse<Application>>(
      `/jobs/${jobId}/applicants/${applicantId}`
    );
    return response.data.data;
  }

  /**
   * Shortlist an applicant
   */
  async shortlistApplicant(
    jobId: string,
    applicantId: string,
    notes?: string
  ): Promise<Application> {
    const dto: ApplicationActionDto = notes ? { notes } : {};
    const response = await this.client.post<ApiResponse<Application>>(
      `/jobs/${jobId}/applicants/${applicantId}/shortlist`,
      dto
    );
    return response.data.data;
  }

  /**
   * Hire an applicant
   */
  async hireApplicant(
    jobId: string,
    applicantId: string,
    hireDate?: string,
    notes?: string
  ): Promise<Application> {
    const dto: ApplicationActionDto = {
      ...(hireDate && { hireDate }),
      ...(notes && { notes }),
    };
    const response = await this.client.post<ApiResponse<Application>>(
      `/jobs/${jobId}/applicants/${applicantId}/hire`,
      dto
    );
    return response.data.data;
  }

  /**
   * Reject an applicant
   */
  async rejectApplicant(
    jobId: string,
    applicantId: string,
    reason?: string
  ): Promise<Application> {
    const dto: ApplicationActionDto = reason ? { reason } : {};
    const response = await this.client.post<ApiResponse<Application>>(
      `/jobs/${jobId}/applicants/${applicantId}/reject`,
      dto
    );
    return response.data.data;
  }

  // ==========================================
  // Matching endpoints
  // ==========================================

  /**
   * Get matching talents for a job
   */
  async getMatchingTalentsForJob(jobId: string): Promise<Array<{ talent: Talent; matchScore: number }>> {
    const response = await this.client.get<ApiResponse<Array<{ talent: Talent; matchScore: number }>>>(
      `/matching/jobs/${jobId}/talents`
    );
    return response.data.data;
  }

  /**
   * Get matching jobs for a talent
   */
  async getMatchingJobsForTalent(talentId: string): Promise<Array<{ job: Job; matchScore: number }>> {
    const response = await this.client.get<ApiResponse<Array<{ job: Job; matchScore: number }>>>(
      `/matching/talents/${talentId}/jobs`
    );
    return response.data.data;
  }

  // ==========================================
  // Application endpoints
  // ==========================================

  /**
   * Create a new application
   * Note: Uses the jobs/:jobId/applicants endpoint as per actual API structure
   */
  async createApplication(jobId: string, talentId: string, matchScore?: number): Promise<Application> {
    const dto: { talentId: string; matchScore?: number } = { talentId };
    if (matchScore !== undefined) {
      dto.matchScore = matchScore;
    }
    const response = await this.client.post<ApiResponse<Application>>(
      `/jobs/${jobId}/applicants`,
      dto
    );
    return response.data.data;
  }

  /**
   * Get applications by talent ID
   * Note: The API currently uses job-based endpoints (/jobs/:jobId/applicants)
   * This method tries to query /applications?talentId first, but falls back to
   * querying all jobs if that endpoint doesn't exist
   */
  async getApplicationsByTalent(talentId: string): Promise<Application[]> {
    // Try to use a general applications endpoint if it exists
    try {
      const response = await this.client.get<PaginatedApiResponse<Application>>('/applications', {
        params: { talentId },
      });
      return response.data.data;
    } catch (error) {
      // If /applications endpoint doesn't exist, we need an alternative approach
      // The application service has findByTalent method, but the controller doesn't expose it
      // For now, query jobs and aggregate their applicants
      // TODO: Add /applications?talentId endpoint to the backend API
      
      // Fallback: Query all jobs and filter applicants by talentId
      // This is not ideal for performance but works as a temporary solution
      const response = await this.client.get<PaginatedApiResponse<Job>>('/jobs', {
        params: { limit: 100 },
      });
      
      const allApplications: Application[] = [];
      for (const job of response.data.data) {
        try {
          const applicants = await this.getJobApplicants(job.id);
          const talentApplications = applicants.filter((app) => app.talentId === talentId);
          allApplications.push(...talentApplications);
        } catch (err) {
          // Skip jobs that fail
          continue;
        }
      }
      
      return allApplications;
    }
  }

  // ==========================================
  // File upload endpoints
  // ==========================================

  /**
   * Upload CV file for a talent
   * Note: Requires 'form-data' package to be installed
   */
  async uploadCV(file: Buffer, talentId: string, filename: string): Promise<{ cvPath: string; message: string }> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', file, {
      filename,
      contentType: this.getContentType(filename),
    });
    formData.append('talentId', talentId);

    const response = await this.client.post<ApiResponse<{ cvPath: string; message: string }>>(
      '/files/upload-cv',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );
    return response.data.data;
  }

  /**
   * Get content type from filename extension
   */
  private getContentType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        return 'application/pdf';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default:
        return 'application/octet-stream';
    }
  }

  // ==========================================
  // Admin dashboard endpoints
  // ==========================================

  /**
   * Get admin statistics
   */
  async getAdminStatistics(): Promise<{
    talents: { total: number; pending: number; approved: number };
    jobs: { total: number; pending: number; published: number };
    applications: { total: number };
  }> {
    const response = await this.client.get<ApiResponse<{
      talents: { total: number; pending: number; approved: number };
      jobs: { total: number; pending: number; published: number };
      applications: { total: number };
    }>>('/admin/stats');
    return response.data.data;
  }

  /**
   * Get admin analytics
   */
  async getAdminAnalytics(): Promise<{
    conversionRates: {
      talentApprovalRate: number;
      jobPublishRate: number;
      applicationHireRate: number;
    };
  }> {
    const response = await this.client.get<ApiResponse<{
      conversionRates: {
        talentApprovalRate: number;
        jobPublishRate: number;
        applicationHireRate: number;
      };
    }>>('/admin/analytics');
    return response.data.data;
  }

  /**
   * Get admin key metrics
   */
  async getAdminMetrics(): Promise<{
    recentActivity: {
      newTalents: number;
      newJobs: number;
      newApplications: number;
    };
  }> {
    const response = await this.client.get<ApiResponse<{
      recentActivity: {
        newTalents: number;
        newJobs: number;
        newApplications: number;
      };
    }>>('/admin/metrics');
    return response.data.data;
  }

  // ==========================================
  // Talent management endpoints
  // ==========================================

  /**
   * Approve a talent profile
   */
  async approveTalent(id: string, adminId: string): Promise<Talent> {
    const response = await this.client.post<ApiResponse<Talent>>(
      `/talents/${id}/approve`,
      { adminId }
    );
    return response.data.data;
  }

  /**
   * Reject a talent profile
   */
  async rejectTalent(id: string, adminId: string, reason?: string): Promise<Talent> {
    const dto: { adminId: string; reason?: string } = { adminId };
    if (reason) {
      dto.reason = reason;
    }
    const response = await this.client.post<ApiResponse<Talent>>(
      `/talents/${id}/reject`,
      dto
    );
    return response.data.data;
  }

  // ==========================================
  // Error handling
  // ==========================================

  /**
   * Handle API errors (kept for backward compatibility)
   * Enhanced error information is now added via interceptor
   * @deprecated Error handling is now done via interceptor, this method is kept for backward compatibility
   */
  // private handleError(error: unknown): Error {
  //   const parsed = parseError(error);
  //   
  //   // Create error with enhanced information
  //   const enhancedError = new Error(parsed.message);
  //   (enhancedError as any).type = parsed.type;
  //   (enhancedError as any).statusCode = parsed.statusCode;
  //   (enhancedError as any).userMessage = parsed.userMessage;
  //   
  //   return enhancedError;
  // }
}

/**
 * Singleton instance of API client
 */
export const apiClient = new ApiClient();

