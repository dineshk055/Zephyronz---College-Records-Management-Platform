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

    // Run folder migration to seed Folder collection from existing File folders
    try {
      const File = (await import('../models/File.js')).default;
      const Folder = (await import('../models/Folder.js')).default;
      const uniqueFolders = await File.distinct("folder");
      let folderMigrationCount = 0;
      
      // Make sure a "General" folder exists as a fallback
      const hasGeneral = await Folder.findOne({ name: { $regex: /^general$/i } });
      if (!hasGeneral) {
        await Folder.create({ name: "General" });
        folderMigrationCount++;
      }

      for (let folderName of uniqueFolders) {
        if (!folderName) {
          folderName = "General";
        }
        folderName = folderName.trim();
        const existing = await Folder.findOne({ name: { $regex: new RegExp(`^${folderName}$`, "i") } });
        if (!existing) {
          await Folder.create({ name: folderName });
          folderMigrationCount++;
        }
      }
      if (folderMigrationCount > 0) {
        console.log(`[Migration] Created ${folderMigrationCount} new folder record(s) from existing file folders.`);
      }
    } catch (folderMigrationError) {
      console.error("[Migration] Folder migration failed:", folderMigrationError.message);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;