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
   
    
},{
    timestamps: true
})

const workoutLog = mongoose.model("WorkoutLog", workoutLogSchema);
export default workoutLog;