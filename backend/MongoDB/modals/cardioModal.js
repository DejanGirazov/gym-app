import mongoose from "mongoose";

const cardioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["running", "cycling", "swimming", "walking", "hiking", "hiit"],
    },
    totalCalories: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    distance: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const cardioModal = mongoose.model("Cardio", cardioSchema);

export default cardioModal;
