import bcrypt from "bcryptjs";
import User from "../MongoDB/modals/userModal.js";
import { generateTokenAndSetCookie } from "../utils/generateWebToken.js";

export const signup = async (req, res) => {
  try {
    const { email, password, gender, height, weight, age, username } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    const existingUsername = await User.findOne({ username: username });
    if (existingUsername) {
      return res.status(400).json({ error: "Username already exists" });
    }
    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }
    if (
      !password ||
      !email ||
      !username ||
      !gender ||
      !height ||
      !weight ||
      !age
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      gender,
      height,
      weight,
      age,
      goal: null,
      activityLevel: null,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      res.status(200).json({
        message: "User created successfully",
        _id: newUser._id,
        gender: newUser.gender,
        username: newUser.username,
        email: newUser.email,
        weight: newUser.weight,
        height: newUser.height,
        age: newUser.age,
        goal: null,
        activityLevel: null,
      });
    } else {
      res.status(400).json({ error: "User not created" });
    }
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
    generateTokenAndSetCookie(user._id, res);
    res.status(200).json({
      message: "User logged in successfully",
      _id: user._id,
      gender: user.gender,
      username: user.username,
      email: user.email,
      weight: user.weight,
      height: user.height,
      age: user.age,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Server error", errorMessage: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("error logging out:", error.message);
    res.status(500).json({ error: "Server error" });
  }
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
    } = req.body;
    const user = await User.findOne(req.user._id);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
    }

    user.username = username;
    user.email = email;
    user.age = age;
    user.height = height;
    user.weight = weight;
    user.gender = gender;
    user.goal = goal;
    user.activityLevel = activityLevel;
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
