import express from "express";
import mealModal from "../MongoDB/modals/mealModal.js";

export const createLog = async (req, res) => {
    try{
        const{foods,type}=req.body;
        if(!foods || !type || !Array.isArray(foods)){
            return res.status(400).json({error:"Foods and type are required"});
        }
        const calories = foods.reduce((sum, f) => sum + (f.calories || 0), 0);
        const proteins = foods.reduce((sum, f) => sum + (f.protein || 0), 0);
        const carbs = foods.reduce((sum, f) => sum + (f.carbs || 0), 0);
        const fats = foods.reduce((sum, f) => sum + (f.fat || 0), 0);
        const meal = new mealModal({
            user: req.user._id,
            type,
            totalCalories: calories,
            totalProteins: proteins,
            totalCarbohydrates: carbs,
            totalFats: fats,
            foods
        });
        await meal.save();
        res.status(200).json(meal);

    }catch(err){
        console.log(err.message);
        res.status(500).json({error:"Server error", errorMessage:err.message});
    }
}
export const getAllMeals = async (req, res) => {
    try{
        const user= req.user._id;
        const meals = await mealModal.find({user}).sort({ createdAt: -1 });
        res.status(200).json(meals);
        
    }catch(err){
        console.log(err.message);
        res.status(500).json({error:"Server error", errorMessage:err.message});
    }
}
export const updateMeal = async (req, res) => {
    try {
        const { foods, type } = req.body;

        if (!foods || !type || !Array.isArray(foods)) {
            return res.status(400).json({ error: "Foods and type are required" });
        }

        const id = req.params.id;

        const calories = foods.reduce((sum, f) => sum + (f.calories || 0), 0);
        const proteins = foods.reduce((sum, f) => sum + (f.protein || 0), 0);
        const carbs = foods.reduce((sum, f) => sum + (f.carbs || 0), 0);
        const fats = foods.reduce((sum, f) => sum + (f.fat || 0), 0);

        const meal = await mealModal.findOneAndUpdate(
            { _id: id, user: req.user._id },
            {
                type,
                totalCalories: calories,
                totalProteins: proteins,
                totalCarbohydrates: carbs,
                totalFats: fats,
                foods
            },
            { new: true }
        );

        if (!meal) {
            return res.status(404).json({ error: "Meal not found" });
        }

        return res.status(200).json(meal);

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            error: "Server error",
            errorMessage: err.message
        });
    }
};
export const deleteMeal = async (req, res) => {
    try{
        const id = req.params.id;
        const meal = await mealModal.findOneAndDelete({
            _id: id,
            user: req.user._id
        });
        if(!meal){
            return res.status(404).json({error:"Meal not found"});
        }
        res.status(200).json({message: "Meal deleted successfully"});
    }catch(err){
        console.log(err.message);
        res.status(500).json({error:"Server error", errorMessage:err.message});
    }
}
export const getMeal = async (req, res) => {
    try{   
        const id = req.params.id;
        const user = req.user._id;
        const meal = await mealModal.findOne({
            _id: id,
            user: req.user._id
        });
        if(!meal){
            return res.status(404).json({error:"Meal not found"});
        }
        if(meal.user.toString() !== user.toString()){
            return res.status(401).json({error: "Unauthorized"})
        }
        res.status(200).json(meal);
     }catch(err){
        console.log(err.message);
        res.status(500).json({error:"Server error", errorMessage:err.message});
    }
}
