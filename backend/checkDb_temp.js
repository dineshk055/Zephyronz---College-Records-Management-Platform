import mongoose from "mongoose";
import dotenv from "dotenv";
import File from "./models/File.js";
import User from "./models/User.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB Connected!");
    
    const filesCount = await File.countDocuments();
    const usersCount = await User.countDocuments();
    console.log("Files count in DB:", filesCount);
    console.log("Users count in DB:", usersCount);
    
    const files = await File.find().populate("uploadedBy", "name email");
    console.log("Files:", JSON.stringify(files, null, 2));

    const users = await User.find();
    console.log("Users:", users.map(u => ({ email: u.email, role: u.role, status: u.status })));
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

run();
