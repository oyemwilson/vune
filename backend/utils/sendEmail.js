import nodemailer from 'nodemailer';

// Create transporter based on your email service
const createTransporter = () => {
  console.log("DEBUG ENV SERVICE:", process.env.EMAIL_SERVICE);
  if (process.env.EMAIL_SERVICE === 'gmail') {
    console.log("Using Gmail transporter 🚀");
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  console.log("Using SMTP transporter 🐌");
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};



const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

const mailOptions = {
  from: `"${process.env.EMAIL_FROM_NAME || 'Your App'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
  to: options.to || options.email,
  subject: options.subject,
  text: options.text || options.message,  // ✅ set the plain-text body
  html: options.html || undefined,        // ✅ set the HTML body
};

    if (!mailOptions.to) {
      console.error('❌ No recipient defined in sendEmail');
      throw new Error('No recipient defined');
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent: ' + info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error('Email could not be sent');
  }
};


// Pre-built email templates
export const emailTemplates = {
  verificationOTP: (name, otp) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #333; text-align: center;">Email Verification</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Please verify your email using the OTP below:</p>
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
        <h1 style="color: #007bff; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
      </div>
      <p>This OTP will expire in <strong>10 minutes</strong>.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #666; text-align: center;">This is an automated message, please do not reply.</p>
    </div>
  `,

  passwordResetOTP: (name, otp) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Use the OTP below to reset your password:</p>
      <div style="background-color: #fff3cd; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0; border: 1px solid #ffeaa7;">
        <h1 style="color: #856404; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
      </div>
      <p>This OTP will expire in <strong>10 minutes</strong>.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #666; text-align: center;">This is an automated message, please do not reply.</p>
    </div>
  `,

  welcomeEmail: (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #333; text-align: center;">Welcome to Our Store!</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Welcome to our e-commerce platform! We're excited to have you.</p>
      <p>Start browsing products and enjoy shopping with us.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/products" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Start Shopping</a>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #666; text-align: center;">This is an automated message, please do not reply.</p>
    </div>
  `,

  passwordChanged: (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #333; text-align: center;">Password Changed</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>This is a confirmation that your password has been successfully changed.</p>
      <p>If you did not perform this change, please reset your password immediately or contact our support.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #666; text-align: center;">This is an automated message, please do not reply.</p>
    </div>
  `
};

export default sendEmail;
