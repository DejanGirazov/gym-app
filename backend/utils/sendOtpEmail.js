import { BrevoClient } from "@getbrevo/brevo";

export const sendOtpEmail = async (toEmail, code) => {
  const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
  });

  try {
    await brevo.transactionalEmails.sendTransacEmail({
      sender: { name: "FitPro", email: "fitprofitnessapp@gmail.com" },
      to: [{ email: toEmail }],
      subject: "Your verification code",
      textContent: `Your verification code is ${code}. It expires in 5 minutes.`,
      htmlContent: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Your verification code</h2>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">${code}</p>
          <p style="color: #8E8E93;">This code expires in 5 minutes. If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });
  } catch (err) {
    console.log("Error sending OTP email:", err.message);
    throw new Error("Failed to send verification email");
  }
};

export default sendOtpEmail;