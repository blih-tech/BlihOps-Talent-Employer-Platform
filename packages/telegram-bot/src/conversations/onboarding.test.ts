import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Conversation } from '@grammyjs/conversations';
import { onboardingConversation } from './onboarding';
import { MyContext } from '../middleware/session';
import { ServiceCategory, ExperienceLevel, AvailabilityStatus, EngagementType } from '@blihops/shared';

// Mock API client
vi.mock('../api/api-client', () => ({
  apiClient: {
    createTalent: vi.fn(),
  },
}));

import { apiClient } from '../api/api-client';

describe('onboardingConversation', () => {
  let mockConversation: Partial<Conversation<MyContext>>;
  let mockContext: Partial<MyContext>;
  let waitForMock: ReturnType<typeof vi.fn>;
  let waitMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    waitForMock = vi.fn();
    waitMock = vi.fn();

    mockConversation = {
      waitFor: waitForMock,
      wait: waitMock,
    };

    mockContext = {
      from: {
        id: 123456789,
        username: 'testuser',
        is_bot: false,
        first_name: 'Test',
      },
      reply: vi.fn(),
      session: {},
    };

    // Reset API client mock
    vi.mocked(apiClient.createTalent).mockClear();
  });

  it('should complete full onboarding flow', async () => {
    // Consent
    waitForMock.mockResolvedValueOnce({
      message: { text: 'Yes' },
    });

    // Name
    waitForMock.mockResolvedValueOnce({
      message: { text: 'John Doe' },
    });

    // Category
    waitForMock.mockResolvedValueOnce({
      message: { text: '1' },
    });

    // Role (skip)
    waitMock.mockResolvedValueOnce({
      message: { text: '/skip' },
    });

    // Skills
    waitForMock.mockResolvedValueOnce({
      message: { text: 'JavaScript, React, Node.js' },
    });

    // Experience
    waitForMock.mockResolvedValueOnce({
      message: { text: '3' },
    });

    // Availability
    waitForMock.mockResolvedValueOnce({
      message: { text: '1' },
    });

    // Engagement (skip)
    waitMock.mockResolvedValueOnce({
      message: { text: '/skip' },
    });

    // Bio (skip)
    waitMock.mockResolvedValueOnce({
      message: { text: '/skip' },
    });

    // CV (skip)
    waitMock.mockResolvedValueOnce({
      message: { text: '/skip' },
    });

    // Confirmation
    waitForMock.mockResolvedValueOnce({
      message: { text: 'Yes' },
    });

    const mockTalent = {
      id: 'talent-1',
      telegramId: 123456789,
      name: 'John Doe',
      status: 'PENDING',
    };

    vi.mocked(apiClient.createTalent).mockResolvedValue(mockTalent as any);

    await onboardingConversation(
      mockConversation as Conversation<MyContext>,
      mockContext as MyContext
    );

    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('Welcome to BlihOps Talent Platform')
    );
    expect(apiClient.createTalent).toHaveBeenCalledWith({
      telegramId: 123456789,
      name: 'John Doe',
      serviceCategory: ServiceCategory.ITO,
      roleSpecialization: undefined,
      skills: ['JavaScript', 'React', 'Node.js'],
      experienceLevel: ExperienceLevel.SENIOR,
      availability: AvailabilityStatus.AVAILABLE,
      engagementPreference: undefined,
      cvUrl: undefined,
      metadata: undefined,
    });
    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('Profile submitted successfully')
    );
  });

  it('should exit if user declines consent', async () => {
    waitForMock.mockResolvedValueOnce({
      message: { text: 'No' },
    });

    // Don't provide any more responses - conversation should exit
    waitForMock.mockImplementation(() => {
      throw new Error('Should not continue after decline');
    });
    waitMock.mockImplementation(() => {
      throw new Error('Should not continue after decline');
    });

    await onboardingConversation(
      mockConversation as Conversation<MyContext>,
      mockContext as MyContext
    );

    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining("No problem! Send /start when you're ready")
    );
    expect(apiClient.createTalent).not.toHaveBeenCalled();
  });

  it('should exit if name is empty', async () => {
    waitForMock.mockResolvedValueOnce({
      message: { text: 'Yes' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: '   ' }, // Empty name
    });

    // Don't provide any more responses - conversation should exit
    waitForMock.mockImplementation(() => {
      throw new Error('Should not continue after empty name');
    });
    waitMock.mockImplementation(() => {
      throw new Error('Should not continue after empty name');
    });

    await onboardingConversation(
      mockConversation as Conversation<MyContext>,
      mockContext as MyContext
    );

    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('Name cannot be empty')
    );
    expect(apiClient.createTalent).not.toHaveBeenCalled();
  });

  it('should exit if invalid category selected', async () => {
    waitForMock.mockResolvedValueOnce({
      message: { text: 'Yes' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: 'John Doe' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: '99' }, // Invalid category
    });

    waitForMock.mockImplementation(() => {
      throw new Error('Should not continue after invalid category');
    });
    waitMock.mockImplementation(() => {
      throw new Error('Should not continue after invalid category');
    });

    await onboardingConversation(
      mockConversation as Conversation<MyContext>,
      mockContext as MyContext
    );

    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('Invalid choice')
    );
    expect(apiClient.createTalent).not.toHaveBeenCalled();
  });

  it('should exit if no skills provided', async () => {
    waitForMock.mockResolvedValueOnce({
      message: { text: 'Yes' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: 'John Doe' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: '1' },
    });

    waitMock.mockResolvedValueOnce({
      message: { text: '/skip' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: '' }, // Empty skills
    });

    waitForMock.mockImplementation(() => {
      throw new Error('Should not continue after empty skills');
    });
    waitMock.mockImplementation(() => {
      throw new Error('Should not continue after empty skills');
    });

    await onboardingConversation(
      mockConversation as Conversation<MyContext>,
      mockContext as MyContext
    );

    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('Please provide at least one skill')
    );
    expect(apiClient.createTalent).not.toHaveBeenCalled();
  });

  it('should exit if invalid experience level', async () => {
    waitForMock.mockResolvedValueOnce({
      message: { text: 'Yes' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: 'John Doe' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: '1' },
    });

    waitMock.mockResolvedValueOnce({
      message: { text: '/skip' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: 'JavaScript' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: '99' }, // Invalid experience
    });

    waitForMock.mockImplementation(() => {
      throw new Error('Should not continue after invalid experience');
    });
    waitMock.mockImplementation(() => {
      throw new Error('Should not continue after invalid experience');
    });

    await onboardingConversation(
      mockConversation as Conversation<MyContext>,
      mockContext as MyContext
    );

    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('Invalid choice')
    );
    expect(apiClient.createTalent).not.toHaveBeenCalled();
  });

  it('should exit if invalid availability', async () => {
    waitForMock.mockResolvedValueOnce({
      message: { text: 'Yes' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: 'John Doe' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: '1' },
    });

    waitMock.mockResolvedValueOnce({
      message: { text: '/skip' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: 'JavaScript' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: '3' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: '99' }, // Invalid availability
    });

    waitForMock.mockImplementation(() => {
      throw new Error('Should not continue after invalid availability');
    });
    waitMock.mockImplementation(() => {
      throw new Error('Should not continue after invalid availability');
    });

    await onboardingConversation(
      mockConversation as Conversation<MyContext>,
      mockContext as MyContext
    );

    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('Invalid choice')
    );
    expect(apiClient.createTalent).not.toHaveBeenCalled();
  });

  it('should exit if user declines confirmation', async () => {
    // Setup all valid inputs
    waitForMock.mockResolvedValueOnce({ message: { text: 'Yes' } });
    waitForMock.mockResolvedValueOnce({ message: { text: 'John Doe' } });
    waitForMock.mockResolvedValueOnce({ message: { text: '1' } });
    waitMock.mockResolvedValueOnce({ message: { text: '/skip' } });
    waitForMock.mockResolvedValueOnce({ message: { text: 'JavaScript' } });
    waitForMock.mockResolvedValueOnce({ message: { text: '3' } });
    waitForMock.mockResolvedValueOnce({ message: { text: '1' } });
    waitMock.mockResolvedValueOnce({ message: { text: '/skip' } });
    waitMock.mockResolvedValueOnce({ message: { text: '/skip' } });
    waitMock.mockResolvedValueOnce({ message: { text: '/skip' } });

    // User declines
    waitForMock.mockResolvedValueOnce({
      message: { text: 'No' },
    });

    waitForMock.mockImplementation(() => {
      throw new Error('Should not continue after decline');
    });
    waitMock.mockImplementation(() => {
      throw new Error('Should not continue after decline');
    });

    await onboardingConversation(
      mockConversation as Conversation<MyContext>,
      mockContext as MyContext
    );

    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining("Let's start over")
    );
    expect(apiClient.createTalent).not.toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    // Setup all valid inputs
    waitForMock.mockResolvedValueOnce({ message: { text: 'Yes' } });
    waitForMock.mockResolvedValueOnce({ message: { text: 'John Doe' } });
    waitForMock.mockResolvedValueOnce({ message: { text: '1' } });
    waitMock.mockResolvedValueOnce({ message: { text: '/skip' } });
    waitForMock.mockResolvedValueOnce({ message: { text: 'JavaScript' } });
    waitForMock.mockResolvedValueOnce({ message: { text: '3' } });
    waitForMock.mockResolvedValueOnce({ message: { text: '1' } });
    waitMock.mockResolvedValueOnce({ message: { text: '/skip' } });
    waitMock.mockResolvedValueOnce({ message: { text: '/skip' } });
    waitMock.mockResolvedValueOnce({ message: { text: '/skip' } });
    waitForMock.mockResolvedValueOnce({ message: { text: 'Yes' } });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(apiClient.createTalent).mockRejectedValue(new Error('API Error'));

    await onboardingConversation(
      mockConversation as Conversation<MyContext>,
      mockContext as MyContext
    );

    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('Failed to submit profile')
    );
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should handle optional fields correctly', async () => {
    waitForMock.mockResolvedValueOnce({ message: { text: 'Yes' } });
    waitForMock.mockResolvedValueOnce({ message: { text: 'John Doe' } });
    waitForMock.mockResolvedValueOnce({ message: { text: '1' } });
    waitMock.mockResolvedValueOnce({ message: { text: 'Full-stack Developer' } }); // Role provided
    waitForMock.mockResolvedValueOnce({ message: { text: 'JavaScript' } });
    waitForMock.mockResolvedValueOnce({ message: { text: '3' } });
    waitForMock.mockResolvedValueOnce({ message: { text: '1' } });
    waitMock.mockResolvedValueOnce({ message: { text: '1' } }); // Engagement provided
    waitMock.mockResolvedValueOnce({ message: { text: 'I am a developer' } }); // Bio provided
    waitMock.mockResolvedValueOnce({ message: { text: '/skip' } });
    waitForMock.mockResolvedValueOnce({ message: { text: 'Yes' } });

    const mockTalent = {
      id: 'talent-1',
      telegramId: 123456789,
      name: 'John Doe',
    };

    vi.mocked(apiClient.createTalent).mockResolvedValue(mockTalent as any);

    await onboardingConversation(
      mockConversation as Conversation<MyContext>,
      mockContext as MyContext
    );

    expect(apiClient.createTalent).toHaveBeenCalledWith({
      telegramId: 123456789,
      name: 'John Doe',
      serviceCategory: ServiceCategory.ITO,
      roleSpecialization: 'Full-stack Developer',
      skills: ['JavaScript'],
      experienceLevel: ExperienceLevel.SENIOR,
      availability: AvailabilityStatus.AVAILABLE,
      engagementPreference: EngagementType.FULL_TIME,
      cvUrl: undefined,
      metadata: {
        bio: 'I am a developer',
      },
    });
  });
});

