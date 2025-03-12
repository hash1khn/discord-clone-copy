import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [20, "Username cannot exceed 20 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    handle: {
      type: String,
      unique: true,
      required: [true, "Handle is required"],
      trim: true,
      lowercase: true,
      match: [
        /^@[a-zA-Z0-9_.-]+$/,
        "Handle must start with @ and contain only letters, numbers, dots, underscores, or dashes",
      ],
    },
    avatar: {
      type: String,
      default: "https://example.com/default-avatar.png", // Set default avatar URL
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friendRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// ✅ Indexing for fast lookup
UserSchema.index({ email: 1, handle: 1 });

export default mongoose.model("User", UserSchema);
