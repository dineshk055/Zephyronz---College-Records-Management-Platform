import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {

    let token;

    // check token exists
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {

      token = req.headers.authorization.split(" ")[1];

      // verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      // attach user
      req.user = await User.findById(decoded.id)
        .select("-password");

      next();

    } else {

      return res.status(401).json({
        success: false,
        msg: "No token provided",
      });

    }

  } catch (error) {

    return res.status(401).json({
      success: false,
      msg: "Invalid token",
    });

  }
};