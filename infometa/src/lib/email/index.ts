import { Resend } from 'resend';

function createResendClient() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export const resend = createResendClient();

const FROM = process.env.EMAIL_FROM || 'alerts@infometa.in';

export async function sendAlertEmail(to: string, subject: string, html: string) {
  if (!resend) return null;
  return resend.emails.send({ from: FROM, to, subject, html });
}

export async function sendWelcomeEmail(to: string, brandName: string) {
  if (!resend) return null;
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Welcome to Infometa — ${brandName}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0F766E;">Welcome to Infometa Technologies</h1>
        <p>Hi there,</p>
        <p>Thank you for registering <strong>${brandName}</strong> on the Infometa platform.</p>
        <p>You can now start protecting your products with QR-based authentication.</p>
        <a href="https://infometa.in/admin" style="display: inline-block; background: #0F766E; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">Go to Dashboard</a>
        <p style="margin-top: 24px; color: #475569; font-size: 14px;">— The Infometa Team</p>
      </div>
    `,
  });
}
