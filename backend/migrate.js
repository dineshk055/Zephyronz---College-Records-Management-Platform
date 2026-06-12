import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB Connected!");
    
    // Update all users who are approved or admin to have status: "Approved"
    const approvedResult = await User.updateMany(
      { $or: [{ isApproved: true }, { role: "admin" }] },
      { $set: { status: "Approved", isApproved: true } }
    );
    console.log("Approved users migrated:", approvedResult);

    // Update all users who are not approved and have status undefined or Pending to status: "Pending"
    const pendingResult = await User.updateMany(
      { isApproved: false, role: { $ne: "admin" }, status: { $exists: false } },
      { $set: { status: "Pending" } }
    );
    console.log("Pending users migrated:", pendingResult);
    
    await mongoose.disconnect();
    console.log("DB Disconnected!");
  } catch (err) {
    console.error(err);
  }
};

run();
