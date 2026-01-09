import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Devteam",
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String, // storing image URL/path
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
