import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    pages: {
      type: [String],
      default: [],
    },
    originalName: {
      type: String,
      default: "",
    },
    size: {
      type: Number,
      default: 0,
    },
    mimetype: {
      type: String,
      default: "",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const File = mongoose.model("File", fileSchema);

export default File;