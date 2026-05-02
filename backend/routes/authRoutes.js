import express from "express";
import {
    getMe,
    login,
    logout,
    signup,
    update,
} from "../controllers/authController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protectRoute, getMe);
router.put("/update", protectRoute, update);

export default router;
