import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

interface ContactFormData {
  fullName: string;
  email: string;
  subjectLevel: string;
  message: string;
}

// Initialize SendGrid if API key is provided
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Create Nodemailer transporter if SMTP config is provided
const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
const createContactEmailHTML = (data: ContactFormData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Contact Form Submission - Pentamaths</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4FC3D7 0%, #2E5984 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #2E5984; }
    .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; border-left: 3px solid #F5C842; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🎓 New Contact Form Submission</h2>
      <p>Pentamaths - Premium Mathematics Tuition</p>
    </div>

    <div class="content">
      <div class="field">
        <div class="label">👤 Full Name:</div>
        <div class="value">${data.fullName}</div>
      </div>

      <div class="field">
        <div class="label">📧 Email:</div>
        <div class="value">${data.email}</div>
      </div>

      <div class="field">
        <div class="label">📚 Subject Level:</div>
        <div class="value">${data.subjectLevel === 'h2-maths' ? 'H2 Mathematics (JC)' :
                           data.subjectLevel === 'h1-maths' ? 'H1 Mathematics (JC)' :
                           data.subjectLevel === 'a-maths' ? 'A Mathematics (Sec 3-4)' :
                           data.subjectLevel}</div>
      </div>

      <div class="field">
        <div class="label">💬 Message:</div>
        <div class="value">${data.message.replace(/\n/g, '<br>')}</div>
      </div>

      <div class="footer">
        <p>📅 Received: ${new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}</p>
        <p>🛡️ This submission passed all spam protection checks</p>
        <p>🚀 Powered by Pentamaths Contact System</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

const createContactEmailText = (data: ContactFormData) => `
New Contact Form Submission - Pentamaths

Full Name: ${data.fullName}
Email: ${data.email}
Subject Level: ${data.subjectLevel === 'h2-maths' ? 'H2 Mathematics (JC)' :
               data.subjectLevel === 'h1-maths' ? 'H1 Mathematics (JC)' :
               data.subjectLevel === 'a-maths' ? 'A Mathematics (Sec 3-4)' :
               data.subjectLevel}

Message:
${data.message}

---
Received: ${new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}
This submission passed all spam protection checks.
`;

// Auto-reply email template
const createAutoReplyHTML = (data: ContactFormData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Thank you for contacting Pentamaths</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4FC3D7 0%, #2E5984 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .highlight { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #F5C842; margin: 15px 0; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🎓 Thank You, ${data.fullName}!</h2>
      <p>We've received your inquiry about ${data.subjectLevel === 'h2-maths' ? 'H2 Mathematics' :
                                           data.subjectLevel === 'h1-maths' ? 'H1 Mathematics' :
                                           data.subjectLevel === 'a-maths' ? 'A Mathematics' :
                                           'Mathematics'} tuition</p>
    </div>

    <div class="content">
      <p>Dear ${data.fullName},</p>

      <p>Thank you for your interest in Pentamaths! We've successfully received your inquiry and Mr Wu will review it personally.</p>

      <div class="highlight">
        <p><strong>📞 What happens next?</strong></p>
        <ul>
          <li>We'll review your message within 24 hours</li>
          <li>Mr Wu will contact you directly to discuss your learning goals</li>
          <li>We'll arrange a trial lesson if you're interested</li>
        </ul>
      </div>

      <p>In the meantime, feel free to check out our sample teaching videos on the website to get a feel for Mr Wu's teaching style.</p>

      <div class="footer">
        <p><strong>📧 Email:</strong> ask@pentamaths.sg</p>
        <p><strong>📱 Phone:</strong> +65 8349 3435</p>
        <p><strong>📍 Address:</strong> 17 Simon Road, #02-01, Singapore</p>
        <p><strong>🌐 Facebook:</strong> facebook.com/pentamathsfb</p>

        <p style="margin-top: 20px; font-size: 12px;">
          This is an automated response. Please do not reply to this email directly.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export async function sendContactEmail(data: ContactFormData): Promise<boolean> {
  const toEmail = process.env.CONTACT_EMAIL_TO || 'ask@pentamaths.sg';
  const fromEmail = process.env.CONTACT_EMAIL_FROM || 'noreply@pentamaths.sg';

  try {
    // Option 1: Try SendGrid first
    if (process.env.SENDGRID_API_KEY) {
      const msg = {
        to: toEmail,
        from: fromEmail,
        subject: `New Contact: ${data.fullName} - ${data.subjectLevel}`,
        text: createContactEmailText(data),
        html: createContactEmailHTML(data),
      };

      await sgMail.send(msg);
      console.log('Contact email sent via SendGrid');

      // Send auto-reply
      const autoReplyMsg = {
        to: data.email,
        from: fromEmail,
        subject: 'Thank you for contacting Pentamaths!',
        html: createAutoReplyHTML(data),
      };

      await sgMail.send(autoReplyMsg);
      console.log('Auto-reply sent via SendGrid');

      return true;
    }

    // Option 2: Try SMTP with Nodemailer
    const transporter = createTransporter();
    if (transporter) {
      // Send notification email
      await transporter.sendMail({
        from: fromEmail,
        to: toEmail,
        subject: `New Contact: ${data.fullName} - ${data.subjectLevel}`,
        text: createContactEmailText(data),
        html: createContactEmailHTML(data),
      });

      // Send auto-reply
      await transporter.sendMail({
        from: fromEmail,
        to: data.email,
        subject: 'Thank you for contacting Pentamaths!',
        html: createAutoReplyHTML(data),
      });

      console.log('Emails sent via SMTP');
      return true;
    }

    console.error('No email service configured');
    return false;

  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}