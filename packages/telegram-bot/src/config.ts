export const config = {
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  API_URL: process.env.API_URL || 'http://localhost:3000/api/v1',
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  USE_WEBHOOKS: process.env.USE_WEBHOOKS === 'true',
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || '',
  // Separate channels for jobs and talents
  TELEGRAM_CHANNEL_ID_JOBS: process.env.TELEGRAM_CHANNEL_ID_JOBS || '-1002985721031',
  TELEGRAM_CHANNEL_ID_TALENTS: process.env.TELEGRAM_CHANNEL_ID_TALENTS || '-1003451753461',
  // Legacy support - maps to jobs channel for backward compatibility
  TELEGRAM_CHANNEL_ID: process.env.TELEGRAM_CHANNEL_ID || process.env.TELEGRAM_CHANNEL_ID_JOBS || '-1002985721031',
  ADMIN_TELEGRAM_IDS: process.env.ADMIN_TELEGRAM_IDS?.split(',').map(id => id.trim()) || [],
};


