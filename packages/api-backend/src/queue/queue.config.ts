// Queue names
export const QUEUE_NAMES = {
  PUBLISH_TALENT: 'publish-talent',
  PUBLISH_JOB: 'publish-job',
  NOTIFY_TALENT: 'notify-talent',
} as const;

// Queue options
export const QUEUE_OPTIONS = {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential' as const,
      delay: 2000,
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 500, // Keep last 500 failed jobs
  },
};


