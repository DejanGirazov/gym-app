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
        sets:[{
            reps:{type: Number, default: 0 },
            weight:{type: Number, default: 0 }
        }],

    }]
}, {
    timestamps: true
});

const Workout = mongoose.model('Workout', workoutSchema);
export default Workout