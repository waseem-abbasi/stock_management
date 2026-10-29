const nodemailer = require('nodemailer');

/**
 * Create and configure Nodemailer transporter
 */
const createTransporter = () => {
  const service = process.env.EMAIL_SERVICE || 'gmail';
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!user || !pass) {
    const errorMsg =
      'Email credentials missing. Please set EMAIL_USER and EMAIL_PASS (or SMTP_USER and SMTP_PASS) in backend/.env.';
    console.error(`[EMAIL ERROR] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // If using Gmail service directly
  if (service.toLowerCase() === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  // Generic SMTP transport
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Send Password Reset Verification Code Email
 * @param {string} toEmail - Recipient email
 * @param {string} userName - Recipient name
 * @param {string} resetCode - 6-digit verification code
 */
const sendPasswordResetEmail = async (toEmail, userName, resetCode) => {
  try {
    const transporter = createTransporter();
    const fromAddress =
      process.env.EMAIL_FROM ||
      `"StockMaster Support" <${process.env.EMAIL_USER || process.env.SMTP_USER || 'no-reply@stockmaster.com'}>`;

    const mailOptions = {
      from: fromAddress,
      to: toEmail,
      subject: `Your StockMaster Password Reset Verification Code: ${resetCode}`,
      text: `Hello ${userName || 'User'},\n\n` +
        `We received a request to reset your password for your StockMaster account.\n\n` +
        `Your 6-digit verification code is: ${resetCode}\n\n` +
        `This code will expire in 15 minutes.\n\n` +
        `If you did not request a password reset, please ignore this email.\n\n` +
        `Best regards,\nStockMaster Security Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; }
            .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
            .header { background: #0d6efd; padding: 28px 24px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
            .content { padding: 32px 28px; color: #333333; line-height: 1.6; }
            .code-box { background: #f0f4ff; border: 2px dashed #0d6efd; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0; }
            .code-text { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0d6efd; font-family: monospace; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; border-top: 1px solid #eeeeee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 StockMaster</h1>
              <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Password Reset Request</p>
            </div>
            <div class="content">
              <p>Hello <strong>${userName || 'User'}</strong>,</p>
              <p>We received a request to reset the password associated with your account (<strong>${toEmail}</strong>).</p>
              <p>Please use the following 6-digit verification code to complete your password reset:</p>
              <div class="code-box">
                <div class="code-text">${resetCode}</div>
              </div>
              <p style="font-size: 13px; color: #6c757d;">
                ⏱️ This verification code is valid for <strong>15 minutes</strong>. If you did not make this request, you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} StockMaster Inventory Management. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
    };

    console.log(`[EMAIL] Attempting to send verification code email to ${toEmail}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT] Successfully sent email to ${toEmail}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${toEmail}:`, error.message);
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail,
};
