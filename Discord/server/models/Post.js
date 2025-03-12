import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: [true, "Comment cannot be empty"],
      trim: true,
      minlength: [1, "Comment must be at least 1 character"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // Prevents auto-generating unnecessary ObjectIDs for comments
);


const PostSchema = new mongoose.Schema(
  {
    forum: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Forum",
      required: true,
      index: true, // Index for faster lookups
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: [true, "Post content cannot be empty"],
      minlength: [3, "Post content must be at least 3 characters"],
    },
    imageUrl: {
      type: String,
      default: "", // Allows optional image uploads
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [CommentSchema], // Embedded comments
  },
  { timestamps: true }
);

// Ensure that each comment has a unique `_id`
PostSchema.path("comments").schema.add({ _id: false });

export default mongoose.model("Post", PostSchema);
