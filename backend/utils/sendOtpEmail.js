import nodemailer from "nodemailer";

export const sendOtpEmail = async (toEmail, code) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"FitPro" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Your verification code",
      text: `Your verification code is ${code}. It expires in 5 minutes.`,
      html: `
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