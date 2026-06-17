import express from "express";
import { login, registerUser, sendOtp } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);  // http://localhost:3000/api/auth/register
router.post("/login", login);  // http://localhost:3000/api/auth/login
router.post("/send-otp", sendOtp);  // http://localhost:3000/api/auth/send-otp

export default router;