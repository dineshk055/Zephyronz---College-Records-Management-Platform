import nodemailer from "nodemailer";

export const sendRegistrationEmail = async (userData) => {
  try {
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
    const port = process.env.SMTP_PORT || process.env.EMAIL_PORT || 587;
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || user;

    if (!host || !user || !pass) {
      console.warn("SMTP email settings are not fully configured in environment variables. Skipping registration email dispatch.");
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: port == 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: `"Zephyronz Security" <${from}>`,
      to: userData.email,
      subject: "Registration Received - Pending Admin Approval",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <h2 style="color: #4f46e5; text-align: center; margin-bottom: 20px;">Account Registration Received</h2>
          <p>Hello <strong>${userData.name}</strong>,</p>
          <p>Thank you for registering on our platform. Your account is currently <strong>Pending Admin Approval</strong>.</p>
          <p>Our administrators have been notified of your registration request. You will receive access once your account has been reviewed and approved.</p>
          <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 12px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #475569;"><strong>Registered Details:</strong></p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #475569;">Name: ${userData.name}</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #475569;">Email: ${userData.email}</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">This is an automated security notification. Please do not reply directly to this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Registration confirmation email sent successfully: %s", info.messageId);
  } catch (error) {
    console.error("Failed to send registration email:", error.message);
  }
};

export const sendOtpEmail = async (email, otp) => {
  try {
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
    const port = process.env.SMTP_PORT || process.env.EMAIL_PORT || 587;
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || user;

    console.log(`--------------------------------------------------`);
    console.log(`[OTP VERIFICATION] OTP for ${email} is: ${otp}`);
    console.log(`--------------------------------------------------`);

    if (!host || !user || !pass) {
      console.warn("SMTP email settings are not fully configured. Printed OTP to console for local testing.");
      return true; // Return true so it doesn't fail the API call
    }

    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: port == 465,
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: `"Zephyronz Security" <${from}>`,
      to: email,
      subject: "Your Registration Verification Code - Zephyronz",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 12px; border-radius: 12px; margin-bottom: 16px;">
              <span style="color: #ffffff; font-size: 24px; font-weight: bold;">Z</span>
            </div>
            <h2 style="color: #1e293b; margin: 0; font-size: 24px; font-weight: 700;">Verify Your Email</h2>
            <p style="color: #64748b; margin: 8px 0 0 0; font-size: 14px;">Please use the following verification code to complete your registration.</p>
          </div>
          
          <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4f46e5; font-family: monospace;">${otp}</span>
            <p style="margin: 12px 0 0 0; font-size: 12px; color: #94a3b8;">This code is valid for 10 minutes</p>
          </div>

          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            If you did not initiate this request, please ignore this email or contact support if you have security concerns.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
            This is an automated security notification from Zephyronz. Please do not reply directly.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send OTP email, falling back to test OTP:", error.message);
    return false;
  }
};

export const sendPasswordResetOtpEmail = async (email, otp) => {
  try {
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
    const port = process.env.SMTP_PORT || process.env.EMAIL_PORT || 587;
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || user;

    console.log(`--------------------------------------------------`);
    console.log(`[PASSWORD RESET] OTP for ${email} is: ${otp}`);
    console.log(`--------------------------------------------------`);

    if (!host || !user || !pass) {
      console.warn("SMTP email settings are not fully configured. Printed password reset OTP to console for local testing.");
      return true;
    }

    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: port == 465,
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: `"Zephyronz Security" <${from}>`,
      to: email,
      subject: "Password Reset Verification Code - Zephyronz",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 12px; border-radius: 12px; margin-bottom: 16px;">
              <span style="color: #ffffff; font-size: 24px; font-weight: bold;">Z</span>
            </div>
            <h2 style="color: #1e293b; margin: 0; font-size: 24px; font-weight: 700;">Reset Your Password</h2>
            <p style="color: #64748b; margin: 8px 0 0 0; font-size: 14px;">Please use the following verification code to reset your account password.</p>
          </div>
          
          <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #dc2626; font-family: monospace;">${otp}</span>
            <p style="margin: 12px 0 0 0; font-size: 12px; color: #94a3b8;">This code is valid for 5 minutes</p>
          </div>

          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            If you did not request a password reset, please change your password immediately or contact support as someone may be trying to access your account.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
            This is an automated security notification from Zephyronz. Please do not reply directly.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset OTP email sent successfully: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send password reset OTP email, falling back to test OTP:", error.message);
    return false;
  }
};

export const sendOtpSms = async (phone, otp) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNum = process.env.TWILIO_PHONE_NUMBER;

    console.log(`--------------------------------------------------`);
    console.log(`[SMS VERIFICATION] OTP for ${phone} is: ${otp}`);
    console.log(`--------------------------------------------------`);

    if (!accountSid || !authToken || !fromNum) {
      console.warn("Twilio SMS settings are not fully configured. Printed OTP to console for local testing.");
      return false; // Return false so it falls back to test OTP
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: phone,
        From: fromNum,
        Body: `Your Zephyronz verification code is: ${otp}. It is valid for 5 minutes.`
      })
    });

    if (response.ok) {
      console.log(`OTP SMS sent successfully to ${phone}`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`Twilio SMS dispatch failed: ${response.status} - ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error("Failed to send OTP SMS, falling back to test OTP:", error.message);
    return false;
  }
};
