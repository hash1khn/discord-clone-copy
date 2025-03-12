import mongoose from "mongoose";

const ForumSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Forum name is required"],
      trim: true,
      minlength: [3, "Forum name must be at least 3 characters"],
    },
    handle: {
      type: String,
      unique: true,
      required: [true, "Forum handle is required"],
      trim: true,
      lowercase: true,
      match: [/^@[a-zA-Z0-9_]+$/, "Forum handle must start with @ and contain letters/numbers"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Auto-add owner as admin & member on forum creation
ForumSchema.pre("save", function (next) {
  if (!this.admins.includes(this.owner)) {
    this.admins.push(this.owner);
  }
  if (!this.members.includes(this.owner)) {
    this.members.push(this.owner);
  }
  next();
});

export default mongoose.model("Forum", ForumSchema);
