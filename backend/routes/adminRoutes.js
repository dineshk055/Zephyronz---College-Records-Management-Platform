import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  adminOnly,

  (req, res) => {

    res.status(200).json({
      success: true,
      msg: "Welcome Admin",
      user: req.user,
    });

  }
);

export default router;

// http://localhost:3000/api/admin/dashboard