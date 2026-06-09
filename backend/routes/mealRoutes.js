import express from "express";
import {
    createLog,
    getAllMeals,
    updateMeal,
    deleteMeal,
    getMeal
} from "../controllers/mealController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/create",protectRoute, createLog);
router.get("/getLogs", protectRoute, getAllMeals);
router.get("/getLog/:id", protectRoute, getMeal);
router.put("/update/:id", protectRoute, updateMeal);
router.delete("/delete/:id", protectRoute, deleteMeal);

export default router;