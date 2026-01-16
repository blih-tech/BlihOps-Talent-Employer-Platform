import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Bot } from 'grammy';
import { Redis } from 'ioredis';
import { jobCreationConversation } from '../conversations/job-creation';
import { MyContext } from '../middleware/session';
import { apiClient } from '../api/api-client';
import { ServiceCategory, ExperienceLevel, EngagementType } from '@blihops/shared';

// Mock dependencies
vi.mock('../api/api-client');
vi.mock('ioredis');

describe('Job Creation Integration Tests', () => {
  let mockRedis: any;
  let mockContext: Partial<MyContext>;
  let mockConversation: any;

  beforeEach(() => {
    mockRedis = {
      get: vi.fn(),
      setex: vi.fn(),
      del: vi.fn(),
      incr: vi.fn().mockResolvedValue(1),
      expire: vi.fn(),
    };

    mockContext = {
      from: {
        id: 987654321, // Admin ID
        username: 'admin',
        is_bot: false,
        first_name: 'Admin',
      },
      chat: {
        id: 987654321,
        type: 'private',
      },
      reply: vi.fn(),
      session: {
        role: 'admin',
      },
    };

    // Mock conversation with realistic flow
    let conversationStep = 0;
    const conversationResponses = [
      { message: { text: '1' } }, // Category: ITO
      { message: { text: 'Senior Full-Stack Developer' } }, // Title
      { message: { text: 'We are looking for an experienced full-stack developer to join our team.' } }, // Description
      { message: { text: 'JavaScript, TypeScript, React, Node.js, PostgreSQL' } }, // Skills
      { message: { text: '3' } }, // Experience: Senior
      { message: { text: '1' } }, // Engagement: Full-time
      { message: { text: '6 months initial contract, possibility to extend' } }, // Duration
      { message: { text: 'Yes' } }, // Confirmation
    ];

    mockConversation = {
      waitFor: vi.fn((filter: string) => {
        const response = conversationResponses[conversationStep++];
        return Promise.resolve(response);
      }),
      wait: vi.fn(() => {
        const response = conversationResponses[conversationStep++];
        return Promise.resolve(response);
      }),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full job creation flow end-to-end', async () => {
    const mockJob = {
      id: 'job-123',
      title: 'Senior Full-Stack Developer',
      description: 'We are looking for an experienced full-stack developer to join our team.',
      serviceCategory: ServiceCategory.ITO,
      requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
      engagementType: EngagementType.FULL_TIME,
      duration: '6 months initial contract, possibility to extend',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(apiClient.createJob).mockResolvedValue(mockJob as any);

    await jobCreationConversation(mockConversation, mockContext as MyContext);

    // Verify API was called with correct data
    expect(apiClient.createJob).toHaveBeenCalledWith({
      title: 'Senior Full-Stack Developer',
      description: 'We are looking for an experienced full-stack developer to join our team.',
      serviceCategory: ServiceCategory.ITO,
      requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
      engagementType: EngagementType.FULL_TIME,
      duration: '6 months initial contract, possibility to extend',
      metadata: {
        experienceLevel: ExperienceLevel.SENIOR,
      },
    });

    // Verify success message was sent
    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('Job created successfully')
    );
    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('job-123')
    );
  });

  it('should handle API integration errors gracefully', async () => {
    // Reset conversation step
    let conversationStep = 0;
    const conversationResponses = [
      { message: { text: '1' } },
      { message: { text: 'Test Job' } },
      { message: { text: 'Test description' } },
      { message: { text: 'JavaScript' } },
      { message: { text: '3' } },
      { message: { text: '1' } },
      { message: { text: '/skip' } },
      { message: { text: 'Yes' } },
    ];

    mockConversation.waitFor = vi.fn((filter: string) => {
      const response = conversationResponses[conversationStep++];
      return Promise.resolve(response);
    });
    mockConversation.wait = vi.fn(() => {
      const response = conversationResponses[conversationStep++];
      return Promise.resolve(response);
    });

    // Simulate API error
    vi.mocked(apiClient.createJob).mockRejectedValue(
      new Error('API Error (500): Internal server error')
    );

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await jobCreationConversation(mockConversation, mockContext as MyContext);

    // Verify error handling
    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('Failed to create job')
    );
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should handle all service categories correctly', async () => {
    const categories = [
      { input: '1', expected: ServiceCategory.ITO },
      { input: '2', expected: ServiceCategory.AI },
      { input: '3', expected: ServiceCategory.AUTOMATION },
      { input: '4', expected: ServiceCategory.DATA_ANALYTICS },
    ];

    for (const category of categories) {
      let step = 0;
      const responses = [
        { message: { text: category.input } },
        { message: { text: 'Test Job' } },
        { message: { text: 'Test description' } },
        { message: { text: 'JavaScript' } },
        { message: { text: '3' } },
        { message: { text: '1' } },
        { message: { text: '/skip' } },
        { message: { text: 'Yes' } },
      ];

      mockConversation.waitFor = vi.fn(() => Promise.resolve(responses[step++]));
      mockConversation.wait = vi.fn(() => Promise.resolve(responses[step++]));

      vi.mocked(apiClient.createJob).mockResolvedValue({
        id: 'job-1',
        serviceCategory: category.expected,
      } as any);

      await jobCreationConversation(mockConversation, mockContext as MyContext);

      expect(apiClient.createJob).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceCategory: category.expected,
        })
      );

      vi.clearAllMocks();
    }
  });

  it('should handle all experience levels correctly', async () => {
    const experienceLevels = [
      { input: '1', expected: ExperienceLevel.JUNIOR },
      { input: '2', expected: ExperienceLevel.MID },
      { input: '3', expected: ExperienceLevel.SENIOR },
      { input: '4', expected: ExperienceLevel.LEAD },
      { input: '5', expected: ExperienceLevel.ARCHITECT },
    ];

    for (const exp of experienceLevels) {
      let step = 0;
      const responses = [
        { message: { text: '1' } },
        { message: { text: 'Test Job' } },
        { message: { text: 'Test description' } },
        { message: { text: 'JavaScript' } },
        { message: { text: exp.input } },
        { message: { text: '1' } },
        { message: { text: '/skip' } },
        { message: { text: 'Yes' } },
      ];

      mockConversation.waitFor = vi.fn(() => Promise.resolve(responses[step++]));
      mockConversation.wait = vi.fn(() => Promise.resolve(responses[step++]));

      vi.mocked(apiClient.createJob).mockResolvedValue({
        id: 'job-1',
      } as any);

      await jobCreationConversation(mockConversation, mockContext as MyContext);

      expect(apiClient.createJob).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            experienceLevel: exp.expected,
          },
        })
      );

      vi.clearAllMocks();
    }
  });

  it('should handle all engagement types correctly', async () => {
    const engagementTypes = [
      { input: '1', expected: EngagementType.FULL_TIME },
      { input: '2', expected: EngagementType.PART_TIME },
      { input: '3', expected: EngagementType.CONTRACT },
      { input: '4', expected: EngagementType.FREELANCE },
      { input: '5', expected: EngagementType.PROJECT_BASED },
    ];

    for (const eng of engagementTypes) {
      let step = 0;
      const responses = [
        { message: { text: '1' } },
        { message: { text: 'Test Job' } },
        { message: { text: 'Test description' } },
        { message: { text: 'JavaScript' } },
        { message: { text: '3' } },
        { message: { text: eng.input } },
        { message: { text: '/skip' } },
        { message: { text: 'Yes' } },
      ];

      mockConversation.waitFor = vi.fn(() => Promise.resolve(responses[step++]));
      mockConversation.wait = vi.fn(() => Promise.resolve(responses[step++]));

      vi.mocked(apiClient.createJob).mockResolvedValue({
        id: 'job-1',
        engagementType: eng.expected,
      } as any);

      await jobCreationConversation(mockConversation, mockContext as MyContext);

      expect(apiClient.createJob).toHaveBeenCalledWith(
        expect.objectContaining({
          engagementType: eng.expected,
        })
      );

      vi.clearAllMocks();
    }
  });

  it('should handle optional duration field', async () => {
    let step = 0;
    const responses = [
      { message: { text: '1' } },
      { message: { text: 'Test Job' } },
      { message: { text: 'Test description' } },
      { message: { text: 'JavaScript' } },
      { message: { text: '3' } },
      { message: { text: '1' } },
      { message: { text: '/skip' } }, // Duration skipped
      { message: { text: 'Yes' } },
    ];

    mockConversation.waitFor = vi.fn(() => Promise.resolve(responses[step++]));
    mockConversation.wait = vi.fn(() => Promise.resolve(responses[step++]));

    vi.mocked(apiClient.createJob).mockResolvedValue({
      id: 'job-1',
    } as any);

    await jobCreationConversation(mockConversation, mockContext as MyContext);

    expect(apiClient.createJob).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: undefined,
      })
    );
  });

  it('should enforce admin-only access', async () => {
    const nonAdminContext = {
      ...mockContext,
      session: {
        role: 'talent', // Not admin
      },
    };

    await jobCreationConversation(mockConversation, nonAdminContext as MyContext);

    expect(nonAdminContext.reply).toHaveBeenCalledWith(
      '❌ This command is only available to admins.'
    );
    expect(apiClient.createJob).not.toHaveBeenCalled();
  });
});


