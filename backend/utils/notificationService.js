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
