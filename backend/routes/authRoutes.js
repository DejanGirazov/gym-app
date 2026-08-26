import express from "express";
import {
    getMe,
    login,
    logout,
    signup,
    update,
    googleAuth,
    verifyOtp,
} from "../controllers/authController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/logout", logout);
router.get("/me", protectRoute, getMe);
router.put("/update", protectRoute, update);
router.post("/google", googleAuth);

export default router;
