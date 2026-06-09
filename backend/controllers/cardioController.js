import cardioModal from "../MongoDB/modals/cardioModal.js";
import calculateCalories from "../utils/calculateCalories.js";

export const createCardioLog = async (req, res) => {
    try{
        const {type, duration, distance} = req.body;
        const user= req.user._id;
        const weight = req.user.weight || 70;
        if(!type || !duration){
            return res.status(400).json({error:"Type and duration are required"});
        }
        const calories = calculateCalories(type, duration, weight);
        const cardioLog = new cardioModal({
            user,
            type: type.toLowerCase(),
            totalCalories: calories,
            duration,
            distance: distance || 0
        });
        await cardioLog.save();
        res.status(201).json(cardioLog);
    }
    catch(err){
        console.log(err.message);
        res.status(500).json({error:"Server error", errorMessage:err.message});
    }
}
export const getAllCardioLogs = async (req, res) => {
    try{
        const cardioLogs = await cardioModal.find({user: req.user._id}).sort({ createdAt: -1 });;
        res.status(200).json(cardioLogs);
    }
    catch(err){
        console.log(err.message);
        res.status(500).json({error:"Server error", errorMessage:err.message});
    }
}
export const getCardioLog = async (req, res) => {
    try{
        const id= req.params.id;
        const user = req.user._id;
        const cardioLog = await cardioModal.findOne({_id: id, user});
        if(!cardioLog){
            return res.status(404).json({error:"Cardio log not found"});
        }
        res.status(200).json(cardioLog);

    }
    catch(err){
        console.log(err.message);
        res.status(500).json({error:"Server error", errorMessage:err.message});
    }
}
export const deleteCardioLog = async (req, res) => {
    try{
        const id= req.params.id;
        const deletedLog = await cardioModal.findOneAndDelete({_id: id, user: req.user._id});
        if(!deletedLog){
            return res.status(404).json({error:"Cardio log not found"});
        }
        res.status(200).json({message:"Cardio log deleted successfully"});
    }
    catch(err){
        console.log(err.message);
        res.status(500).json({error:"Server error", errorMessage:err.message});
    }
}