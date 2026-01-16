import { Conversation } from '@grammyjs/conversations';
import {
  ServiceCategory,
  ExperienceLevel,
  EngagementType,
} from '@blihops/shared';
import { MyContext } from '../middleware/session';
import { apiClient } from '../api/api-client';

/**
 * Type for conversation context
 */
type MyConversation = Conversation<MyContext>;

/**
 * Job creation conversation
 * Guides admin through creating a new job posting
 */
export async function jobCreationConversation(
  conversation: MyConversation,
  ctx: MyContext
) {
  // Verify admin role
  if (ctx.session.role !== 'admin') {
    await ctx.reply('❌ This command is only available to admins.');
    return;
  }

  // Service Category
  await ctx.reply(
    'Let\'s create a new job!\n\n' +
    'What service category?\n\n' +
    '1️⃣ Information Technology Outsourcing (ITO)\n' +
    '2️⃣ AI & Intelligent Solutions\n' +
    '3️⃣ Business Automation Services\n' +
    '4️⃣ Data & Analytics Services\n\n' +
    'Send the number:'
  );

  const categoryMsg = await conversation.waitFor(':text');
  const categoryMap: Record<string, ServiceCategory> = {
    '1': ServiceCategory.ITO,
    '2': ServiceCategory.AI,
    '3': ServiceCategory.AUTOMATION,
    '4': ServiceCategory.DATA_ANALYTICS,
  };
  const categoryInput = categoryMsg.message!.text!.trim();
  const serviceCategory = categoryMap[categoryInput];

  if (!serviceCategory) {
    await ctx.reply('❌ Invalid category. Please start over with /create_job');
    return;
  }

  // Job Title
  await ctx.reply('Job title:');
  const titleMsg = await conversation.waitFor(':text');
  const title = titleMsg.message!.text!.trim();

  if (!title) {
    await ctx.reply('❌ Title cannot be empty. Please start over with /create_job');
    return;
  }

  // Job Description
  await ctx.reply('Job description (you can write multiple paragraphs):');
  const descMsg = await conversation.waitFor(':text');
  const description = descMsg.message!.text!.trim();

  if (!description) {
    await ctx.reply('❌ Description cannot be empty. Please start over with /create_job');
    return;
  }

  // Required Skills
  await ctx.reply('Required skills (separate with commas):');
  const skillsMsg = await conversation.waitFor(':text');
  const requiredSkills = skillsMsg.message!.text!
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (requiredSkills.length === 0) {
    await ctx.reply('❌ At least one skill is required. Please start over with /create_job');
    return;
  }

  // Experience Level
  await ctx.reply(
    'Required experience level?\n\n' +
    '1️⃣ Junior (0-2 years)\n' +
    '2️⃣ Mid-level (2-5 years)\n' +
    '3️⃣ Senior (5-8 years)\n' +
    '4️⃣ Lead (8+ years)\n' +
    '5️⃣ Architect (10+ years)\n\n' +
    'Send the number:'
  );
  const expMsg = await conversation.waitFor(':text');
  const expMap: Record<string, ExperienceLevel> = {
    '1': ExperienceLevel.JUNIOR,
    '2': ExperienceLevel.MID,
    '3': ExperienceLevel.SENIOR,
    '4': ExperienceLevel.LEAD,
    '5': ExperienceLevel.ARCHITECT,
  };
  const expInput = expMsg.message!.text!.trim();
  const experienceLevel = expMap[expInput];

  if (!experienceLevel) {
    await ctx.reply('❌ Invalid experience level. Please start over with /create_job');
    return;
  }

  // Engagement Type
  await ctx.reply(
    'Engagement type?\n\n' +
    '1️⃣ Full-time\n' +
    '2️⃣ Part-time\n' +
    '3️⃣ Contract\n' +
    '4️⃣ Freelance\n' +
    '5️⃣ Project-based\n\n' +
    'Send the number:'
  );
  const engMsg = await conversation.waitFor(':text');
  const engMap: Record<string, EngagementType> = {
    '1': EngagementType.FULL_TIME,
    '2': EngagementType.PART_TIME,
    '3': EngagementType.CONTRACT,
    '4': EngagementType.FREELANCE,
    '5': EngagementType.PROJECT_BASED,
  };
  const engInput = engMsg.message!.text!.trim();
  const engagementType = engMap[engInput];

  if (!engagementType) {
    await ctx.reply('❌ Invalid engagement type. Please start over with /create_job');
    return;
  }

  // Duration (optional)
  await ctx.reply('Duration/scope (optional, or send /skip):');
  const durCtx = await conversation.wait();
  const duration =
    durCtx.message?.text === '/skip' || durCtx.message?.text?.toLowerCase() === 'skip'
      ? undefined
      : durCtx.message?.text?.trim();

  // Review & Submit
  const categoryLabels: Record<ServiceCategory, string> = {
    [ServiceCategory.ITO]: 'Information Technology Outsourcing',
    [ServiceCategory.AI]: 'AI & Intelligent Solutions',
    [ServiceCategory.AUTOMATION]: 'Business Automation Services',
    [ServiceCategory.DATA_ANALYTICS]: 'Data & Analytics Services',
  };

  const expLabels: Record<ExperienceLevel, string> = {
    [ExperienceLevel.JUNIOR]: 'Junior (0-2 years)',
    [ExperienceLevel.MID]: 'Mid-level (2-5 years)',
    [ExperienceLevel.SENIOR]: 'Senior (5-8 years)',
    [ExperienceLevel.LEAD]: 'Lead (8+ years)',
    [ExperienceLevel.ARCHITECT]: 'Architect (10+ years)',
  };

  const engLabels: Record<EngagementType, string> = {
    [EngagementType.FULL_TIME]: 'Full-time',
    [EngagementType.PART_TIME]: 'Part-time',
    [EngagementType.CONTRACT]: 'Contract',
    [EngagementType.FREELANCE]: 'Freelance',
    [EngagementType.PROJECT_BASED]: 'Project-based',
  };

  await ctx.reply(
    '📋 Review job posting:\n\n' +
    `Title: ${title}\n` +
    `Category: ${categoryLabels[serviceCategory]}\n` +
    `Experience: ${expLabels[experienceLevel]}\n` +
    `Type: ${engLabels[engagementType]}\n` +
    `${duration ? `Duration: ${duration}\n` : ''}` +
    `Skills: ${requiredSkills.join(', ')}\n\n` +
    `Description: ${description}\n\n` +
    'Submit? (Yes/No)'
  );

  const confirmMsg = await conversation.waitFor(':text');
  if (!confirmMsg.message?.text?.toLowerCase().startsWith('y')) {
    await ctx.reply('Job creation cancelled.');
    return;
  }

  // Submit to API
  try {
    // Store experienceLevel in metadata since it's not in CreateJobDto
    const job = await apiClient.createJob({
      title,
      description,
      serviceCategory,
      requiredSkills,
      engagementType,
      duration,
      metadata: {
        experienceLevel,
      },
    });

    await ctx.reply(
      '✅ Job created successfully!\n\n' +
      `Job ID: ${job.id}\n` +
      'The job is pending approval. It will be published once approved.\n\n' +
      'Use /my_jobs to view your jobs.'
    );
  } catch (error) {
    await ctx.reply(
      '❌ Failed to create job. Please try again or contact support if the issue persists.'
    );
    console.error('Job creation error:', error);
  }
}

