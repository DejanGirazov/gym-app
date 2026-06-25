import express from "express";
import {nutritionSummary} from "../controllers/aiController.js"
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/nutritionSummary",protectRoute, nutritionSummary);


export default router;
