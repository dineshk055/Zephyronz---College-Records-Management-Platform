import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // count users
    const usersCount = await User.countDocuments();

    let role = "user";
    let isApproved = false;

    // first user becomes admin (auto-approved)
    if (usersCount === 0) {
      role = "admin";
      isApproved = true;
    }

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isApproved,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please wait for admin approval.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check empty fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Please fill all fields",
      });
    }

    // check user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        msg: "Invalid email or password",
      });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        msg: "Invalid email or password",
      });
    }

    // CHECK APPROVAL - This is the key!
    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        msg: "Your account is pending admin approval. Please wait for approval.",
      });
    }

    // generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // success response
    return res.status(200).json({
      success: true,
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });

  } catch (error) {
    console.log("error in login controller", error);
    return res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};