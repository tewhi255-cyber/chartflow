import nodemailer from 'nodemailer';
import config from '../config';
import logger from '../config/logger';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"ChartFlow" <${config.smtp.from}>`,
      ...options,
    });
    logger.info(`Email sent to ${options.to}`);
  } catch (error) {
    logger.error('Email send failed:', error);
  }
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const url = `${config.frontendUrl}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Verify your ChartFlow account',
    html: `
      <h2>Welcome to ChartFlow!</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${url}" style="padding:10px 20px;background:#6366f1;color:#fff;text-decoration:none;border-radius:5px;">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const url = `${config.frontendUrl}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Reset your ChartFlow password',
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${url}" style="padding:10px 20px;background:#6366f1;color:#fff;text-decoration:none;border-radius:5px;">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
};

export const sendTeamInviteEmail = async (email: string, teamName: string, inviterName: string, token: string) => {
  const url = `${config.frontendUrl}/join-team?token=${token}`;
  await sendEmail({
    to: email,
    subject: `You're invited to join ${teamName} on ChartFlow`,
    html: `
      <h2>Team Invitation</h2>
      <p>${inviterName} has invited you to join <strong>${teamName}</strong> on ChartFlow.</p>
      <a href="${url}" style="padding:10px 20px;background:#6366f1;color:#fff;text-decoration:none;border-radius:5px;">Accept Invitation</a>
    `,
  });
};
