import mongoose from 'mongoose';
import User from '../models/User.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Run one-time email normalization migration on startup
    try {
      const users = await User.find();
      let migratedCount = 0;
      for (const user of users) {
        if (!user.email) continue;
        const normalized = user.email.trim().toLowerCase();
        if (user.email !== normalized) {
          user.email = normalized;
          await user.save();
          migratedCount++;
        }
      }
      if (migratedCount > 0) {
        console.log(`[Migration] Normalized email casing/trim for ${migratedCount} existing user(s).`);
      }
    } catch (migrationError) {
      console.error("[Migration] Email normalization failed:", migrationError.message);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;