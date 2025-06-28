import { Job, Worker } from 'bullmq';
import { emailQueueConfig } from './email.config';
import { sendEmail } from '../../utils/send-mail.util';
import { EmailData } from '../interfaces/email-data.interface';

export const emailWorker = new Worker(
  'emailQueue',
  async (job: Job) => {
    console.log(`📩 Processing job ${job.id}`);
    const { email, subject, html } = job.data as EmailData;
    try {
      await sendEmail(email, subject, html);
      console.log(`✅ Email sent to ${email}`);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
    }
  },
  emailQueueConfig,
);
