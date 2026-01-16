import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Bot } from 'grammy';
import { Redis } from 'ioredis';
import { onboardingConversation } from '../conversations/onboarding';
import { MyContext } from '../middleware/session';
import { apiClient } from '../api/api-client';
import { ServiceCategory, ExperienceLevel, AvailabilityStatus, EngagementType } from '@blihops/shared';

// Mock dependencies
vi.mock('../api/api-client');
vi.mock('ioredis');

describe('Talent Onboarding Integration Tests', () => {
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
        id: 123456789,
        username: 'newtalent',
        is_bot: false,
        first_name: 'New',
        last_name: 'Talent',
      },
      chat: {
        id: 123456789,
        type: 'private',
      },
      reply: vi.fn(),
      session: {
        role: 'talent',
      },
    };

    // Mock conversation with realistic flow
    let conversationStep = 0;
    const conversationResponses = [
      { message: { text: 'Yes' } }, // Consent
      { message: { text: 'John Doe' } }, // Name
      { message: { text: '1' } }, // Category: ITO
      { message: { text: 'Full-stack Developer' } }, // Role
      { message: { text: 'JavaScript, React, Node.js, TypeScript' } }, // Skills
      { message: { text: '3' } }, // Experience: Senior
      { message: { text: '1' } }, // Availability: Available
      { message: { text: '1' } }, // Engagement: Full-time
      { message: { text: 'Experienced developer with 7 years in web development' } }, // Bio
      { message: { text: '/skip' } }, // CV skip
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

  it('should complete full talent onboarding flow end-to-end', async () => {
    const mockTalent = {
      id: 'talent-123',
      telegramId: 123456789,
      name: 'John Doe',
      serviceCategory: ServiceCategory.ITO,
      roleSpecialization: 'Full-stack Developer',
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
      experienceLevel: ExperienceLevel.SENIOR,
      availability: AvailabilityStatus.AVAILABLE,
      engagementPreference: EngagementType.FULL_TIME,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(apiClient.createTalent).mockResolvedValue(mockTalent as any);

    await onboardingConversation(mockConversation, mockContext as MyContext);

    // Verify API was called with correct data
    expect(apiClient.createTalent).toHaveBeenCalledWith({
      telegramId: 123456789,
      name: 'John Doe',
      serviceCategory: ServiceCategory.ITO,
      roleSpecialization: 'Full-stack Developer',
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
      experienceLevel: ExperienceLevel.SENIOR,
      availability: AvailabilityStatus.AVAILABLE,
      engagementPreference: EngagementType.FULL_TIME,
      cvUrl: undefined,
      metadata: {
        bio: 'Experienced developer with 7 years in web development',
      },
    });

    // Verify success message was sent
    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('Profile submitted successfully')
    );
  });

  it('should handle API integration errors gracefully', async () => {
    // Reset conversation step
    let conversationStep = 0;
    const conversationResponses = [
      { message: { text: 'Yes' } },
      { message: { text: 'John Doe' } },
      { message: { text: '1' } },
      { message: { text: '/skip' } },
      { message: { text: 'JavaScript' } },
      { message: { text: '3' } },
      { message: { text: '1' } },
      { message: { text: '/skip' } },
      { message: { text: '/skip' } },
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
    vi.mocked(apiClient.createTalent).mockRejectedValue(
      new Error('API Error (500): Internal server error')
    );

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await onboardingConversation(mockConversation, mockContext as MyContext);

    // Verify error handling
    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('Failed to submit profile')
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
        { message: { text: 'Yes' } },
        { message: { text: 'Test User' } },
        { message: { text: category.input } },
        { message: { text: '/skip' } },
        { message: { text: 'JavaScript' } },
        { message: { text: '3' } },
        { message: { text: '1' } },
        { message: { text: '/skip' } },
        { message: { text: '/skip' } },
        { message: { text: '/skip' } },
        { message: { text: 'Yes' } },
      ];

      mockConversation.waitFor = vi.fn(() => Promise.resolve(responses[step++]));
      mockConversation.wait = vi.fn(() => Promise.resolve(responses[step++]));

      vi.mocked(apiClient.createTalent).mockResolvedValue({
        id: 'talent-1',
        serviceCategory: category.expected,
      } as any);

      await onboardingConversation(mockConversation, mockContext as MyContext);

      expect(apiClient.createTalent).toHaveBeenCalledWith(
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
        { message: { text: 'Yes' } },
        { message: { text: 'Test User' } },
        { message: { text: '1' } },
        { message: { text: '/skip' } },
        { message: { text: 'JavaScript' } },
        { message: { text: exp.input } },
        { message: { text: '1' } },
        { message: { text: '/skip' } },
        { message: { text: '/skip' } },
        { message: { text: '/skip' } },
        { message: { text: 'Yes' } },
      ];

      mockConversation.waitFor = vi.fn(() => Promise.resolve(responses[step++]));
      mockConversation.wait = vi.fn(() => Promise.resolve(responses[step++]));

      vi.mocked(apiClient.createTalent).mockResolvedValue({
        id: 'talent-1',
        experienceLevel: exp.expected,
      } as any);

      await onboardingConversation(mockConversation, mockContext as MyContext);

      expect(apiClient.createTalent).toHaveBeenCalledWith(
        expect.objectContaining({
          experienceLevel: exp.expected,
        })
      );

      vi.clearAllMocks();
    }
  });

  it('should handle optional fields being skipped', async () => {
    let step = 0;
    const responses = [
      { message: { text: 'Yes' } },
      { message: { text: 'Minimal User' } },
      { message: { text: '1' } },
      { message: { text: '/skip' } }, // Role
      { message: { text: 'JavaScript' } },
      { message: { text: '3' } },
      { message: { text: '1' } },
      { message: { text: '/skip' } }, // Engagement
      { message: { text: '/skip' } }, // Bio
      { message: { text: '/skip' } }, // CV
      { message: { text: 'Yes' } },
    ];

    mockConversation.waitFor = vi.fn(() => Promise.resolve(responses[step++]));
    mockConversation.wait = vi.fn(() => Promise.resolve(responses[step++]));

    vi.mocked(apiClient.createTalent).mockResolvedValue({
      id: 'talent-1',
    } as any);

    await onboardingConversation(mockConversation, mockContext as MyContext);

    expect(apiClient.createTalent).toHaveBeenCalledWith(
      expect.objectContaining({
        roleSpecialization: undefined,
        engagementPreference: undefined,
        cvUrl: undefined,
        metadata: undefined,
      })
    );
  });
});


