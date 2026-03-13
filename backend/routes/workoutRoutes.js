import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { newWorkout, updateWorkout, deleteWorkout, getWorkout, updateLogs, getLogs, getWorkouts } from "../controllers/workoutController.js";

const router = express.Router();

router.post("/newWorkout", protectRoute, newWorkout);
router.put("/updateWorkout/:id", protectRoute, updateWorkout);
router.delete("/deleteWorkout/:id", protectRoute, deleteWorkout);
router.get("/getWorkout/:id", protectRoute, getWorkout);
router.post("/updateLogs/:id", protectRoute, updateLogs);
router.get("/getLogs", protectRoute, getLogs);
router.get("/getWorkouts", protectRoute, getWorkouts);


export default router;