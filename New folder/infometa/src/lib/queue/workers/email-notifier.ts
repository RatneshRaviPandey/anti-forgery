import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { sendAlertEmail } from '@/lib/email';
import type { EmailNotifierJob } from '@/lib/queue';

const redisUrl = process.env.REDIS_URL;
const connection = redisUrl ? new IORedis(redisUrl, { maxRetriesPerRequest: null }) : null;

export const emailNotifierWorker = connection
  ? new Worker<EmailNotifierJob>(
      'email-notifier',
      async (job) => {
        const { to, template, data } = job.data;

        switch (template) {
          case 'alert':
            await sendAlertEmail(
              to,
              `Alert: ${data.alertType as string} — ${data.productName as string}`,
              `<p><strong>Alert Type:</strong> ${data.alertType as string}</p><p><strong>Product:</strong> ${data.productName as string}</p><p>${data.details as string}</p>`
            );
            break;

          case 'welcome':
            // Welcome email could be handled here
            console.log(`[email-notifier] Welcome email to ${to}`);
            break;

          case 'weekly_report':
            // Weekly report email
            console.log(`[email-notifier] Weekly report to ${to}`);
            break;
        }
      },
      { connection, concurrency: 3 }
    )
  : null;

if (emailNotifierWorker) {
  emailNotifierWorker.on('completed', (job) => {
    console.log(`[email-notifier] Completed job ${job.id}`);
  });
  emailNotifierWorker.on('failed', (job, err) => {
    console.error(`[email-notifier] Failed job ${job?.id}:`, err.message);
  });
}
