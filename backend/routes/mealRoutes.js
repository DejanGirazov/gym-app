import express from "express";
import {
  createLog,
  deleteMeal,
  getAllMeals,
  getMeal,
  searchMeal,
  updateMeal,
  searchMealById,
  lookupBarcode,
} from "../controllers/mealController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/create", protectRoute, createLog);
router.get("/getLogs", protectRoute, getAllMeals);
router.get("/getLog/:id", protectRoute, getMeal);
router.put("/update/:id", protectRoute, updateMeal);
router.delete("/delete/:id", protectRoute, deleteMeal);
router.get("/search", protectRoute, searchMeal);
router.get("/search/:id", protectRoute, searchMealById);
router.get("/lookupBarcode/:code", protectRoute, lookupBarcode);

export default router;
