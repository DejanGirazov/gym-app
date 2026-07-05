import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // only required for local signups
      },
    },
    age: {
      type: Number,
      default: null,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    height: {
      type: Number,
      default: null,
    },
    weight: {
      type: Number,
      default: null,
    },
    goal: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows many docs to have no googleId without violating uniqueness
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    activityLevel: {
      type: String,
      default: null,
      enum: [
        "sedentary",
        "light exercise",
        "moderate exercise",
        "heavy exercise",
        "athlete",
      ],
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
