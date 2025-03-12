import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Recipient

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Sender

    type: {
      type: String,
      enum: [
        "message",
        "friend_request",
        "friend_accept",
        "forum_post",
        "forum_comment",
        "like",
        "mention",
        "forum_join",
        "forum_leave",
      ],
      required: true,
    },

    message: { type: String, required: true }, // Notification text

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "refModel", // ✅ Dynamic reference to the related entity
      default: null,
    },

    refModel: {
      type: String,
      enum: ["Message", "Post", "Forum", "Comment"],
      default: null,
    },

    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null }, // ✅ Changed for clarity
  },
  { timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);
