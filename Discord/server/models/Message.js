import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String, // Stores file/image URL
      default: "",
    },
  },
  { timestamps: true }
);

// Ensure either message or fileUrl is present
MessageSchema.pre("validate", function (next) {
  if (!this.message && !this.fileUrl) {
    next(new Error("Message content or file is required"));
  } else {
    next();
  }
});

export default mongoose.model("Message", MessageSchema);
