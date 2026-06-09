import express from "express";
import {
    createCardioLog,
    getAllCardioLogs,
    getCardioLog,
    deleteCardioLog
} from "../controllers/cardioController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/create",protectRoute, createCardioLog);
router.get("/getLogs", protectRoute, getAllCardioLogs);
router.get("/getLog/:id", protectRoute, getCardioLog);
router.delete("/delete/:id", protectRoute, deleteCardioLog);

export default router;