import workoutModal from "../MongoDB/modals/workoutModal.js";
import workoutLogModal from "../MongoDB/modals/workoutLogModal.js";

export const newWorkout = async (req, res) => {

    try{
        const {title, exercises} = req.body;
        const user = req.user._id;

        const newWorkout = await workoutModal.create({title, exercises, user});
        res.status(200).json(newWorkout);
    }
    catch(err){
        console.log(err.message);
        res.status(500).json({error:"Server error", errorMessage:err.message});
    }        
   
}

export const updateWorkout = async (req, res) => {
    try{
        const {title, exercises} = req.body;
        const user = req.user._id;
        const id = req.params.id
        const workout = await workoutModal.findById(id);
        if(!workout){
        return res.status(404).json({error:"Workout not found"});
        }
         if(workout.user.toString() !== user.toString()){
         return res.status(401).json({error: "Unauthorized"})
}
        const updatedWorkout = await workoutModal.findByIdAndUpdate(id, {title, exercises, user}, {new:true});
        res.status(200).json(updatedWorkout);
    }
    catch(err){
        console.log(err.message);
        res.status(500).json({error:"Server error", errorMessage:err.message});
    }
    
}   

export const deleteWorkout = async (req, res) => {
    try{
        const id = req.params.id;
        const user = req.user._id;
        const workout = await workoutModal.findById(id);
        if(!workout){
            return res.status(404).json({error:"Workout not found"});
        }
        if(workout.user.toString() !== user.toString()){
            return res.status(401).json({error: "Unauthorized"})
        }
        await workoutModal.findByIdAndDelete(id);
        res.status(200).json({message:"Workout deleted successfully"});
    }
    catch(err){
        console.log(err.message);
        res.status(500).json({error:"Server error", errorMessage:err.message});
    }
}

export const getWorkout = async (req, res) => {
    try{
        const id = req.params.id;
        const user = req.user._id;
        const workout = await workoutModal.findById(id);
        if(!workout){
            return res.status(404).json({error:"Workout not found"});
        }
        if(workout.user.toString() !== user.toString()){
            return res.status(401).json({error: "Unauthorized"})
        }
        res.status(200).json(workout);
    }
    catch(err){
        console.log(err.message);
        res.status(500).json({error:"Server error", errorMessage:err.message});
    }
    
}

export const updateLogs = async (req, res) => {
    try{
        const {totalReps, totalWeight, exercises, totalTime} = req.body;
        const id = req.params.id 
        const user = req.user._id;
        const workout = await workoutModal.findById(id);
        if(!workout){
            return res.status(404).json({error:"Workout not found"});
        }
        if(workout.user.toString() !== user.toString()){
            return res.status(401).json({error: "Unauthorized"})
        }
        const log = await workoutLogModal.create({user, workout, totalReps, totalWeight, totalTime, exercises});
         await workoutModal.findByIdAndUpdate(id, { exercises })

        res.status(200).json(log);
    }
    catch(err){
        console.log(err.message);
        res.status(500).json({error:"Server error", errorMessage:err.message});
    }
    
}

export const getLogs = async (req, res) => {
    try {
        const user = req.user._id
        const { weeks } = req.query // pass as query param e.g. /getLogs?weeks=4

            let logs;
            if(weeks){
                const startDate = new Date()
                startDate.setDate(startDate.getDate() - (weeks * 7))
                logs = await workoutLogModal.find({
                 user,
                 createdAt: { $gte: startDate }
             }).sort({ createdAt: 1 })
        } else {
            logs = await workoutLogModal.find({user}).sort({ createdAt: 1 })
}

        res.status(200).json(logs)
    } catch(err) {
        console.log(err.message)
        res.status(500).json({ error: "Server error", errorMessage: err.message })
    }
}

export const getWorkouts = async (req, res) => {
    try{
        const user = req.user._id;
        const workouts = await workoutModal.find({user});
        res.status(200).json(workouts);
    }
    catch(err){
        console.log(err.message);
        res.status(500).json({error:"Server error", errorMessage:err.message});
    }
    
}