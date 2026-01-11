import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Devteam",
    },

    content: {
      type: String,
    },

    image: {
      type: String, // storing image URL/path
      default: null,
    },

    isActive: {
      type: Boolean,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
