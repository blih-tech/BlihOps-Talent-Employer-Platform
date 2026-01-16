import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Conversation } from '@grammyjs/conversations';
import { jobCreationConversation } from './job-creation';
import { MyContext } from '../middleware/session';
import { ServiceCategory, ExperienceLevel, EngagementType } from '@blihops/shared';

// Mock API client
vi.mock('../api/api-client', () => ({
  apiClient: {
    createJob: vi.fn(),
  },
}));

import { apiClient } from '../api/api-client';

describe('jobCreationConversation', () => {
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
        username: 'admin',
        is_bot: false,
        first_name: 'Admin',
      },
      reply: vi.fn(),
      session: {
        role: 'admin',
      },
    };

    // Reset API client mock
    vi.mocked(apiClient.createJob).mockClear();
  });

  it('should complete full job creation flow', async () => {
    // Category
    waitForMock.mockResolvedValueOnce({
      message: { text: '1' },
    });

    // Title
    waitForMock.mockResolvedValueOnce({
      message: { text: 'Senior Developer' },
    });

    // Description
    waitForMock.mockResolvedValueOnce({
      message: { text: 'We need a senior developer' },
    });

    // Skills
    waitForMock.mockResolvedValueOnce({
      message: { text: 'JavaScript, Node.js, React' },
    });

    // Experience
    waitForMock.mockResolvedValueOnce({
      message: { text: '3' },
    });

    // Engagement
    waitForMock.mockResolvedValueOnce({
      message: { text: '1' },
    });

    // Duration (skip)
    waitMock.mockResolvedValueOnce({
      message: { text: '/skip' },
    });

    // Confirmation
    waitForMock.mockResolvedValueOnce({
      message: { text: 'Yes' },
    });

    const mockJob = {
      id: 'job-1',
      title: 'Senior Developer',
      status: 'PENDING',
    };

    vi.mocked(apiClient.createJob).mockResolvedValue(mockJob as any);

    await jobCreationConversation(
      mockConversation as Conversation<MyContext>,
      mockContext as MyContext
    );

    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining("Let's create a new job")
    );
    expect(apiClient.createJob).toHaveBeenCalledWith({
      title: 'Senior Developer',
      description: 'We need a senior developer',
      serviceCategory: ServiceCategory.ITO,
      requiredSkills: ['JavaScript', 'Node.js', 'React'],
      engagementType: EngagementType.FULL_TIME,
      duration: undefined,
      metadata: {
        experienceLevel: ExperienceLevel.SENIOR,
      },
    });
    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('Job created successfully')
    );
  });

  it('should exit if user is not admin', async () => {
    const nonAdminContext = {
      ...mockContext,
      session: {
        role: 'talent',
      },
    };

    await jobCreationConversation(
      mockConversation as Conversation<MyContext>,
      nonAdminContext as MyContext
    );

    expect(nonAdminContext.reply).toHaveBeenCalledWith(
      '❌ This command is only available to admins.'
    );
    expect(apiClient.createJob).not.toHaveBeenCalled();
  });

  it('should exit if invalid category selected', async () => {
    waitForMock.mockResolvedValueOnce({
      message: { text: '99' }, // Invalid category
    });

    waitForMock.mockImplementation(() => {
      throw new Error('Should not continue after invalid category');
    });
    waitMock.mockImplementation(() => {
      throw new Error('Should not continue after invalid category');
    });

    await jobCreationConversation(
      mockConversation as Conversation<MyContext>,
      mockContext as MyContext
    );

    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('Invalid category')
    );
    expect(apiClient.createJob).not.toHaveBeenCalled();
  });

  it('should exit if title is empty', async () => {
    waitForMock.mockResolvedValueOnce({
      message: { text: '1' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: '   ' }, // Empty title
    });

    waitForMock.mockImplementation(() => {
      throw new Error('Should not continue after empty title');
    });
    waitMock.mockImplementation(() => {
      throw new Error('Should not continue after empty title');
    });

    await jobCreationConversation(
      mockConversation as Conversation<MyContext>,
      mockContext as MyContext
    );

    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('Title cannot be empty')
    );
    expect(apiClient.createJob).not.toHaveBeenCalled();
  });

  it('should exit if description is empty', async () => {
    waitForMock.mockResolvedValueOnce({
      message: { text: '1' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: 'Senior Developer' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: '   ' }, // Empty description
    });

    waitForMock.mockImplementation(() => {
      throw new Error('Should not continue after empty description');
    });
    waitMock.mockImplementation(() => {
      throw new Error('Should not continue after empty description');
    });

    await jobCreationConversation(
      mockConversation as Conversation<MyContext>,
      mockContext as MyContext
    );

    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('Description cannot be empty')
    );
    expect(apiClient.createJob).not.toHaveBeenCalled();
  });

  it('should exit if no skills provided', async () => {
    waitForMock.mockResolvedValueOnce({
      message: { text: '1' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: 'Senior Developer' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: 'Job description' },
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

    await jobCreationConversation(
      mockConversation as Conversation<MyContext>,
      mockContext as MyContext
    );

    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('At least one skill is required')
    );
    expect(apiClient.createJob).not.toHaveBeenCalled();
  });

  it('should exit if invalid experience level', async () => {
    waitForMock.mockResolvedValueOnce({
      message: { text: '1' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: 'Senior Developer' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: 'Job description' },
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

    await jobCreationConversation(
      mockConversation as Conversation<MyContext>,
      mockContext as MyContext
    );

    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('Invalid experience level')
    );
    expect(apiClient.createJob).not.toHaveBeenCalled();
  });

  it('should exit if invalid engagement type', async () => {
    waitForMock.mockResolvedValueOnce({
      message: { text: '1' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: 'Senior Developer' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: 'Job description' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: 'JavaScript' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: '3' },
    });

    waitForMock.mockResolvedValueOnce({
      message: { text: '99' }, // Invalid engagement
    });

    waitForMock.mockImplementation(() => {
      throw new Error('Should not continue after invalid engagement');
    });
    waitMock.mockImplementation(() => {
      throw new Error('Should not continue after invalid engagement');
    });

    await jobCreationConversation(
      mockConversation as Conversation<MyContext>,
      mockContext as MyContext
    );

    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('Invalid engagement type')
    );
    expect(apiClient.createJob).not.toHaveBeenCalled();
  });

  it('should exit if user declines confirmation', async () => {
    // Setup all valid inputs
    waitForMock.mockResolvedValueOnce({ message: { text: '1' } });
    waitForMock.mockResolvedValueOnce({ message: { text: 'Senior Developer' } });
    waitForMock.mockResolvedValueOnce({ message: { text: 'Job description' } });
    waitForMock.mockResolvedValueOnce({ message: { text: 'JavaScript' } });
    waitForMock.mockResolvedValueOnce({ message: { text: '3' } });
    waitForMock.mockResolvedValueOnce({ message: { text: '1' } });
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

    await jobCreationConversation(
      mockConversation as Conversation<MyContext>,
      mockContext as MyContext
    );

    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('Job creation cancelled')
    );
    expect(apiClient.createJob).not.toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    // Setup all valid inputs
    waitForMock.mockResolvedValueOnce({ message: { text: '1' } });
    waitForMock.mockResolvedValueOnce({ message: { text: 'Senior Developer' } });
    waitForMock.mockResolvedValueOnce({ message: { text: 'Job description' } });
    waitForMock.mockResolvedValueOnce({ message: { text: 'JavaScript' } });
    waitForMock.mockResolvedValueOnce({ message: { text: '3' } });
    waitForMock.mockResolvedValueOnce({ message: { text: '1' } });
    waitMock.mockResolvedValueOnce({ message: { text: '/skip' } });
    waitForMock.mockResolvedValueOnce({ message: { text: 'Yes' } });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(apiClient.createJob).mockRejectedValue(new Error('API Error'));

    await jobCreationConversation(
      mockConversation as Conversation<MyContext>,
      mockContext as MyContext
    );

    expect(mockContext.reply).toHaveBeenCalledWith(
      expect.stringContaining('Failed to create job')
    );
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should handle duration correctly', async () => {
    waitForMock.mockResolvedValueOnce({ message: { text: '1' } });
    waitForMock.mockResolvedValueOnce({ message: { text: 'Senior Developer' } });
    waitForMock.mockResolvedValueOnce({ message: { text: 'Job description' } });
    waitForMock.mockResolvedValueOnce({ message: { text: 'JavaScript' } });
    waitForMock.mockResolvedValueOnce({ message: { text: '3' } });
    waitForMock.mockResolvedValueOnce({ message: { text: '1' } });
    waitMock.mockResolvedValueOnce({ message: { text: '6 months' } }); // Duration provided
    waitForMock.mockResolvedValueOnce({ message: { text: 'Yes' } });

    const mockJob = {
      id: 'job-1',
      title: 'Senior Developer',
    };

    vi.mocked(apiClient.createJob).mockResolvedValue(mockJob as any);

    await jobCreationConversation(
      mockConversation as Conversation<MyContext>,
      mockContext as MyContext
    );

    expect(apiClient.createJob).toHaveBeenCalledWith({
      title: 'Senior Developer',
      description: 'Job description',
      serviceCategory: ServiceCategory.ITO,
      requiredSkills: ['JavaScript'],
      engagementType: EngagementType.FULL_TIME,
      duration: '6 months',
      metadata: {
        experienceLevel: ExperienceLevel.SENIOR,
      },
    });
  });

  it('should handle skip for duration', async () => {
    waitForMock.mockResolvedValueOnce({ message: { text: '1' } });
    waitForMock.mockResolvedValueOnce({ message: { text: 'Senior Developer' } });
    waitForMock.mockResolvedValueOnce({ message: { text: 'Job description' } });
    waitForMock.mockResolvedValueOnce({ message: { text: 'JavaScript' } });
    waitForMock.mockResolvedValueOnce({ message: { text: '3' } });
    waitForMock.mockResolvedValueOnce({ message: { text: '1' } });
    waitMock.mockResolvedValueOnce({ message: { text: 'skip' } }); // Lowercase skip
    waitForMock.mockResolvedValueOnce({ message: { text: 'Yes' } });

    const mockJob = {
      id: 'job-1',
      title: 'Senior Developer',
    };

    vi.mocked(apiClient.createJob).mockResolvedValue(mockJob as any);

    await jobCreationConversation(
      mockConversation as Conversation<MyContext>,
      mockContext as MyContext
    );

    expect(apiClient.createJob).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: undefined,
      })
    );
  });
});

