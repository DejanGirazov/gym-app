import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    exercises:[{
        exerciseId: {
            type: String, 
            required: true
        },
        exerciseName:{
            type: String,
            required: true
        },
        sets:{
            type: Number,
            required: true
        },
        reps: {
            type: Number,
            required: true
        },
        weight: {
            type: Number,
            required: true, 
            default: 0
        }

    }]
}, {
    timestamps: true
});

const Workout = mongoose.model('Workout', workoutSchema);
export default Workout