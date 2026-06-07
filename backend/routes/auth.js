import express from "express";
import { login, registerUser } from "../controllers/authController.js";



const router = express.Router();

router.post("/register", registerUser);  // http://localhost:3000/api/auth/register
router.post("/login",login);  // http://localhost:3000/api/auth/login

export default router;