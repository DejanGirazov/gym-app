import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import User from "../MongoDB/modals/userModal.js";
import { generateToken } from "../utils/generateWebToken.js";
import crypto from "crypto";
import { sendOtpEmail } from "../utils/sendOtpEmail.js"; // you'll build this w/ Nodemailer
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { email, password, gender, username } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    if (!password || !email || !username || !gender) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: "Username already exists" });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name: null,
      username,
      email,
      password: hashedPassword,
      gender,
      height: null,
      weight: null,
      age: null,
      goal: null,
      activityLevel: null,
    });
    await newUser.save();

    const token = generateToken(newUser._id);

    res.status(200).json({
      message: "User created successfully",
      token,
      user: {
        _id: newUser._id,
        gender: newUser.gender,
        username: newUser.username,
        email: newUser.email,
        weight: newUser.weight,
        height: newUser.height,
        age: newUser.age,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Server error", errorMessage: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(code, 10);

    user.otpCodeHash = codeHash;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    user.otpAttempts = 0;
    await user.save();
    await sendOtpEmail(user.email, code);

    // short-lived token identifying WHO is mid-verification, not a real session
    const pendingToken = jwt.sign(
      { userId: user._id, purpose: "otp" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );

    res.status(200).json({
      message: "Verification code sent to email",
      requires2FA: true,
      pendingToken,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Server error", errorMessage: err.message });
  }
};

// STEP 2 — new endpoint, checks the code, THEN issues the real JWT
export const verifyOtp = async (req, res) => {
  try {
    const { pendingToken, code } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(pendingToken, process.env.JWT_SECRET);
    } catch {
      return res
        .status(401)
        .json({ error: "Verification session expired, please log in again" });
    }
    if (decoded.purpose !== "otp") {
      return res.status(401).json({ error: "Invalid verification token" });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.otpCodeHash || !user.otpExpiresAt) {
      return res.status(400).json({ error: "No verification pending" });
    }
    if (user.otpExpiresAt < new Date()) {
      return res
        .status(400)
        .json({ error: "Code expired, please log in again" });
    }
    if (user.otpAttempts >= 5) {
      return res
        .status(429)
        .json({ error: "Too many attempts, please log in again" });
    }

    const isValid = await bcrypt.compare(code, user.otpCodeHash);
    if (!isValid) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ error: "Incorrect code" });
    }

    // success — clear the OTP fields, issue the real JWT
    user.otpCodeHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      message: "User logged in successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        gender: user.gender,
        username: user.username,
        email: user.email,
        weight: user.weight,
        height: user.height,
        age: user.age,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Server error", errorMessage: err.message });
  }
};

export const logout = async (req, res) => {
  // stateless JWT — nothing to invalidate server-side.
  // the client just deletes its stored token.
  res.status(200).json({ message: "Logged out successfully" });
};

export const update = async (req, res) => {
  try {
    const {
      email,
      username,
      newPassword,
      age,
      height,
      weight,
      gender,
      goal,
      activityLevel,
      name,
    } = req.body;
    const id = req.user._id;
    if (height < 50 || height > 250) {
      return res
        .status(400)
        .json({ error: "Height must be between 50 and 250 cm" });
    }
    if (weight < 20 || weight > 300) {
      return res
        .status(400)
        .json({ error: "Weight must be between 20 and 300 kg" });
    }
    if (age < 10 || age > 100) {
      return res.status(400).json({ error: "Age must be between 10 and 100" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
    }
    if (name !== undefined) user.name = name;
    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;
    if (age !== undefined) user.age = age;
    if (height !== undefined) user.height = height;
    if (weight !== undefined) user.weight = weight;
    if (gender !== undefined) user.gender = gender;
    if (goal !== undefined) user.goal = goal;
    if (activityLevel !== undefined) user.activityLevel = activityLevel;
    await user.save();
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Server error", errorMessage: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Server error", errorMessage: err.message });
  }
};

const client = new OAuth2Client();

export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    const ticket = await client.verifyIdToken({
      idToken,
      audience: [
        process.env.GOOGLE_WEB_CLIENT_ID,
        process.env.GOOGLE_IOS_CLIENT_ID,
        process.env.GOOGLE_ANDROID_CLIENT_ID,
      ],
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = new User({
        name: payload.name,
        username:
          payload.name.replace(/\s/g, "") + Math.floor(Math.random() * 1000),
        email,
        googleId,
        authProvider: "google",
        gender: null,
        height: null,
        weight: null,
        age: null,
        goal: null,
        activityLevel: null,
      });
      await user.save();
    } else if (!user.googleId) {
      // existing local account, same email -> link it
      user.googleId = googleId;
      user.authProvider = "google";
      await user.save();
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Logged in with Google",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        gender: user.gender,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Google auth failed" });
  }
};
