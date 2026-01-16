import { Conversation } from '@grammyjs/conversations';
import { InlineKeyboard } from 'grammy';
import { apiClient } from '../api/api-client';
import {
  ServiceCategory,
  ExperienceLevel,
  AvailabilityStatus,
  EngagementType,
} from '@blihops/shared';
import { MyContext } from '../middleware/session';
import { validateCVFile, downloadTelegramFile } from '../utils/file-handler';

/**
 * Type for conversation context
 */
type MyConversation = Conversation<MyContext>;

/**
 * Onboarding conversation for new talent users
 * Guides users through creating their talent profile step by step
 */
export async function onboardingConversation(
  conversation: MyConversation,
  ctx: MyContext
) {
  // Welcome & Consent
  const consentKeyboard = new InlineKeyboard()
    .text('✅ Yes', 'onboarding:consent:yes')
    .text('❌ No', 'onboarding:consent:no');

  const welcomeMessage = 
    '👋 Welcome to BlihOps Talent Platform!\n\n' +
    "I'll help you create your talent profile. This will take about 5 minutes.\n\n" +
    'By continuing, you agree to our Terms & Conditions.\n\n' +
    'Ready to start?';

  // Ensure we're in a private chat (required for inline keyboards)
  if (ctx.chat?.type !== 'private') {
    await ctx.reply('This bot only works in private chats. Please start a private conversation.');
    return;
  }

  // Send message with inline keyboard
  // Use explicit API call to ensure keyboard is sent
  try {
    const message = await ctx.api.sendMessage(ctx.chat.id, welcomeMessage, {
      reply_markup: consentKeyboard,
    });
    console.log('Welcome message sent with keyboard, message ID:', message.message_id);
  } catch (error) {
    console.error('Error sending welcome message:', error);
    // Fallback: try ctx.reply
    await ctx.reply(welcomeMessage, {
      reply_markup: consentKeyboard,
    });
  }

  // Wait for either button click or text response
  const consent = await conversation.wait();
  let consentGiven = false;

  // Handle callback query (button click) - check update.callback_query
  if (consent.update.callback_query) {
    const callbackData = consent.update.callback_query.data;
    if (callbackData === 'onboarding:consent:yes') {
      await consent.answerCallbackQuery();
      consentGiven = true;
    } else if (callbackData === 'onboarding:consent:no') {
      await consent.answerCallbackQuery();
      await ctx.reply("No problem! Send /start when you're ready.");
      return;
    }
  } 
  // Handle text message (backward compatibility)
  else if (consent.message?.text) {
    if (consent.message.text.toLowerCase().startsWith('y')) {
      consentGiven = true;
    } else {
      await ctx.reply("No problem! Send /start when you're ready.");
      return;
    }
  } else {
    // Invalid input, ask again
    await ctx.reply(
      'Please select Yes or No using the buttons, or type "Yes" or "No":',
      { reply_markup: consentKeyboard }
    );
    // Wait again
    const retryConsent = await conversation.wait();
    if (retryConsent.update.callback_query?.data === 'onboarding:consent:yes') {
      await retryConsent.answerCallbackQuery();
      consentGiven = true;
    } else if (retryConsent.update.callback_query?.data === 'onboarding:consent:no') {
      await retryConsent.answerCallbackQuery();
      await ctx.reply("No problem! Send /start when you're ready.");
      return;
    } else if (retryConsent.message?.text?.toLowerCase().startsWith('y')) {
      consentGiven = true;
    } else {
      await ctx.reply("No problem! Send /start when you're ready.");
      return;
    }
  }

  if (!consentGiven) {
    await ctx.reply("No problem! Send /start when you're ready.");
    return;
  }

  // Personal Info - Name
  await ctx.reply('Great! Let\'s start with your name:');
  const nameMsg = await conversation.waitFor(':text');
  const name = nameMsg.message!.text!;

  if (!name || name.trim().length === 0) {
    await ctx.reply('Name cannot be empty. Please try again with /start.');
    return;
  }

  // Service Category
  await ctx.reply(
    'What service category best describes your skills?\n\n' +
      '1️⃣ Information Technology Outsourcing (ITO)\n' +
      '2️⃣ AI & Intelligent Solutions\n' +
      '3️⃣ Business Automation Services\n' +
      '4️⃣ Data & Analytics Services\n\n' +
      'Send the number of your choice:'
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
    await ctx.reply('Invalid choice. Please try again with /start.');
    return;
  }

  // Role Specialization (optional)
  await ctx.reply(
    'What is your role specialization? (optional, or send /skip)\n\n' +
      'Example: Full-stack Developer, Data Scientist, UI/UX Designer'
  );
  const roleCtx = await conversation.wait();
  const roleSpecialization =
    roleCtx.message?.text === '/skip' ? undefined : roleCtx.message?.text;

  // Skills
  await ctx.reply(
    'What are your key skills? (Separate with commas)\n\nExample: JavaScript, React, Node.js'
  );
  const skillsMsg = await conversation.waitFor(':text');
  const skills = skillsMsg.message!.text!
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (skills.length === 0) {
    await ctx.reply('Please provide at least one skill. Try again with /start.');
    return;
  }

  // Experience Level
  await ctx.reply(
    'What is your experience level?\n\n' +
      '1️⃣ Junior (0-2 years)\n' +
      '2️⃣ Mid-level (2-5 years)\n' +
      '3️⃣ Senior (5-8 years)\n' +
      '4️⃣ Lead (8+ years)\n' +
      '5️⃣ Architect (10+ years)\n\n' +
      'Send the number of your choice:'
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
    await ctx.reply('Invalid choice. Please try again with /start.');
    return;
  }

  // Availability
  await ctx.reply(
    'What is your current availability?\n\n' +
      '1️⃣ Available\n' +
      '2️⃣ Busy\n' +
      '3️⃣ Unavailable\n\n' +
      'Send the number of your choice:'
  );

  const availMsg = await conversation.waitFor(':text');
  const availMap: Record<string, AvailabilityStatus> = {
    '1': AvailabilityStatus.AVAILABLE,
    '2': AvailabilityStatus.BUSY,
    '3': AvailabilityStatus.UNAVAILABLE,
  };
  const availInput = availMsg.message!.text!.trim();
  const availability = availMap[availInput];

  if (!availability) {
    await ctx.reply('Invalid choice. Please try again with /start.');
    return;
  }

  // Engagement Preference (optional)
  await ctx.reply(
    'What is your preferred engagement type? (optional, or send /skip)\n\n' +
      '1️⃣ Full-time\n' +
      '2️⃣ Part-time\n' +
      '3️⃣ Contract\n' +
      '4️⃣ Freelance\n\n' +
      'Send the number or /skip:'
  );
  const engagementCtx = await conversation.wait();
  let engagementPreference: EngagementType | undefined = undefined;
  if (engagementCtx.message?.text !== '/skip') {
    const engagementMap: Record<string, EngagementType> = {
      '1': EngagementType.FULL_TIME,
      '2': EngagementType.PART_TIME,
      '3': EngagementType.CONTRACT,
      '4': EngagementType.FREELANCE,
    };
    const engagementInput = engagementCtx.message?.text?.trim();
    if (engagementInput && engagementMap[engagementInput]) {
      engagementPreference = engagementMap[engagementInput];
    }
  }

  // Bio (optional - stored in metadata)
  await ctx.reply('Tell us about yourself (optional, or send /skip):');
  const bioCtx = await conversation.wait();
  const bio = bioCtx.message?.text === '/skip' ? undefined : bioCtx.message?.text;

  // CV Upload (optional)
  await ctx.reply(
    'Upload your CV (optional, or send /skip):\n\nSupported formats: PDF, DOC, DOCX (max 10MB)'
  );
  const cvCtx = await conversation.wait();
  let cvFileData: { fileId: string; filename: string; fileSize: number } | undefined = undefined;

  if (cvCtx.message?.document) {
    const doc = cvCtx.message.document;
    const filename = doc.file_name || 'cv.pdf';
    const fileSize = doc.file_size || 0;

    // Validate file
    const validation = validateCVFile(filename, fileSize);
    if (!validation.isValid) {
      await ctx.reply(
        `❌ ${validation.error}\n\nPlease try again with a valid CV file or send /skip to continue without CV.`
      );
      // Wait for retry or skip
      const retryCtx = await conversation.wait();
      if (retryCtx.message?.document) {
        const retryDoc = retryCtx.message.document;
        const retryFilename = retryDoc.file_name || 'cv.pdf';
        const retryFileSize = retryDoc.file_size || 0;
        const retryValidation = validateCVFile(retryFilename, retryFileSize);
        if (retryValidation.isValid && retryDoc.file_id) {
          cvFileData = {
            fileId: retryDoc.file_id,
            filename: retryFilename,
            fileSize: retryFileSize,
          };
        }
      } else if (retryCtx.message?.text?.toLowerCase() === '/skip') {
        // User skipped, continue without CV
      } else {
        await ctx.reply('CV upload skipped. Continuing without CV...');
      }
    } else if (doc.file_id) {
      cvFileData = {
        fileId: doc.file_id,
        filename,
        fileSize,
      };
    }
  }

  // Review & Submit
  const reviewText =
    '📋 Review your profile:\n\n' +
    `Name: ${name}\n` +
    `Category: ${serviceCategory}\n` +
    `${roleSpecialization ? `Role: ${roleSpecialization}\n` : ''}` +
    `Skills: ${skills.join(', ')}\n` +
    `Experience: ${experienceLevel}\n` +
    `Availability: ${availability}\n` +
    `${engagementPreference ? `Engagement: ${engagementPreference}\n` : ''}` +
    `${bio ? `Bio: ${bio.substring(0, 100)}${bio.length > 100 ? '...' : ''}\n` : ''}` +
    `${cvFileData ? 'CV: Will be uploaded\n' : ''}` +
    '\nIs this correct?';

  const confirmKeyboard = new InlineKeyboard()
    .text('✅ Yes, Submit', 'onboarding:confirm:yes')
    .text('❌ No, Start Over', 'onboarding:confirm:no');

  // Send review message with inline keyboard
  try {
    await ctx.api.sendMessage(ctx.chat!.id, reviewText, {
      reply_markup: confirmKeyboard,
    });
  } catch (error) {
    console.error('Error sending review message:', error);
    // Fallback: try ctx.reply
    await ctx.reply(reviewText, {
      reply_markup: confirmKeyboard,
    });
  }

  // Wait for either button click or text response
  const confirmMsg = await conversation.wait();
  let confirmed = false;

  // Handle callback query (button click) - check update.callback_query
  if (confirmMsg.update.callback_query) {
    const callbackData = confirmMsg.update.callback_query.data;
    if (callbackData === 'onboarding:confirm:yes') {
      await confirmMsg.answerCallbackQuery();
      confirmed = true;
    } else if (callbackData === 'onboarding:confirm:no') {
      await confirmMsg.answerCallbackQuery();
      await ctx.reply("Let's start over. Send /start to begin again.");
      return;
    }
  } 
  // Handle text message (backward compatibility)
  else if (confirmMsg.message?.text) {
    if (confirmMsg.message.text.toLowerCase().startsWith('y')) {
      confirmed = true;
    } else {
      await ctx.reply("Let's start over. Send /start to begin again.");
      return;
    }
  } else {
    // Invalid input, ask again
    await ctx.reply(
      'Please select Yes or No using the buttons, or type "Yes" or "No":',
      { reply_markup: confirmKeyboard }
    );
    // Wait again
    const retryConfirm = await conversation.wait();
    if (retryConfirm.update.callback_query?.data === 'onboarding:confirm:yes') {
      await retryConfirm.answerCallbackQuery();
      confirmed = true;
    } else if (retryConfirm.update.callback_query?.data === 'onboarding:confirm:no') {
      await retryConfirm.answerCallbackQuery();
      await ctx.reply("Let's start over. Send /start to begin again.");
      return;
    } else if (retryConfirm.message?.text?.toLowerCase().startsWith('y')) {
      confirmed = true;
    } else {
      await ctx.reply("Let's start over. Send /start to begin again.");
      return;
    }
  }

  if (!confirmed) {
    await ctx.reply("Let's start over. Send /start to begin again.");
    return;
  }

  // Submit to API
  try {
    const metadata: Record<string, unknown> = {};
    if (bio) {
      metadata.bio = bio;
    }

    // Create talent profile first (CV will be uploaded after if provided)
    const talent = await apiClient.createTalent({
      telegramId: ctx.from!.id,
      name: name.trim(),
      serviceCategory,
      roleSpecialization,
      skills,
      experienceLevel,
      availability,
      engagementPreference,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    });

    // Upload CV if provided
    if (cvFileData) {
      try {
        await ctx.reply('📄 Uploading your CV...');
        
        // Download file from Telegram
        const fileBuffer = await downloadTelegramFile(ctx.api, cvFileData.fileId);
        
        // Upload to backend
        await apiClient.uploadCV(
          fileBuffer,
          talent.id,
          cvFileData.filename
        );

        await ctx.reply(
          '✅ Profile submitted successfully!\n\n' +
            '📄 CV uploaded successfully!\n\n' +
            "Your profile is pending approval. You'll be notified when it's approved.\n\n" +
            'Use /profile to view your profile anytime.'
        );
      } catch (cvError) {
        console.error('CV upload error:', cvError);
        await ctx.reply(
          '✅ Profile submitted successfully!\n\n' +
            '⚠️ CV upload failed. You can upload your CV later using /upload_cv command.\n\n' +
            "Your profile is pending approval. You'll be notified when it's approved.\n\n" +
            'Use /profile to view your profile anytime.'
        );
      }
    } else {
      await ctx.reply(
        '✅ Profile submitted successfully!\n\n' +
          "Your profile is pending approval. You'll be notified when it's approved.\n\n" +
          'Use /profile to view your profile anytime.'
      );
    }
  } catch (error) {
    await ctx.reply(
      '❌ Failed to submit profile. Please try again later.\n\n' +
        'If the problem persists, contact support.'
    );
    console.error('Profile submission error:', error);
  }
}

