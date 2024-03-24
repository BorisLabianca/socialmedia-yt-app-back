const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    comment: { type: String, required: true },
    from: { type: String, required: true },
    likes: [{ type: String }],
    replies: [
      {
        replyId: { type: mongoose.Schema.Types.ObjectId },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        from: { type: String },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now() },
        updatedAt: { type: Date, default: Date.now() },
        like: [{ type: String }],
      },
    ],
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
