import * as nodemailer from 'nodemailer';
import { env } from 'src/config/env.config';

export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.MAIL_USER,
      pass: env.MAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"My App" <${env.MAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error('❌ Failed to send email:', err);
    throw new Error('Email send failed');
  }
}
