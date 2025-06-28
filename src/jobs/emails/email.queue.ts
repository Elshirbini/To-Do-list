import { Queue } from 'bullmq';
import { emailQueueConfig } from './email.config';

export const emailQueue = new Queue('emailQueue', emailQueueConfig);
