import mongoose from "mongoose";


const workoutLogSchema = new mongoose.Schema({
     user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    workout: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workout",
        required: true
    },
    totalWeight: {
        type: Number,
        required: true
    },
   
    totalReps: {
        type: Number,
        required: true
    },
    totalTime:{
        type: Number,
        required: true
    },
    exercises: [{
    exerciseName: { type: String },
    sets: [{
        reps: { type: Number },
        weight: { type: Number }
    }]
}]
   
    
},{
    timestamps: true
})

const workoutLog = mongoose.model("WorkoutLog", workoutLogSchema);
export default workoutLog;