import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
    user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
    type:{
        type: String,
        required: true
    },
    totalCalories: {
        type: Number,
        required: true,
        min: 0
    },
    totalProteins: {
        type: Number,
        required: true,
        min: 0
    },
    totalCarbohydrates: {
        type: Number,
        required: true,
        min: 0
    },
    totalFats: {
        type: Number,
        required: true,
        min: 0
    },
  foods: [{
        externalFoodId: {
            type: String,
            required: true
        },

        name: {
            type: String,
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 0
        },

        unit: {
            type: String,
            required: true
        },

        calories: {
            type: Number,
            required: true,
            min: 0
        },

        protein: {
            type: Number,
            required: true,
            min: 0
        },

        carbs: {
            type: Number,
            required: true,
            min: 0
        },

        fat: {
            type: Number,
            required: true,
            min: 0
        }
    }]


}, {
    timestamps: true
});

const mealModal = mongoose.model("Meal", mealSchema);

export default mealModal;