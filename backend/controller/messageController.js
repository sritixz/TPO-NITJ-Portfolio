import Message from "../models/headmessages.js";
import Devteam from "../models/devteam.js";

export const getMessages = async (req, res) => {
  const messages = await Message.find()
    .populate("author")
    .sort({ createdAt: 1 });

  res.json(messages);
};

export const createMessage = async (req, res) => {
 
const isallowed= req.user.designation?.toLowerCase().includes("head") ||
    req.user.role === "Coordinator"

  const { authorId, content } = req.body;

  if (!authorId || !content) {
    return res.status(400).json({ message: "authorId and content required" });
  }

  const dev = await Devteam.findById(authorId);
  if (!dev) {
    return res.status(400).json({ message: "Author profile not found" });
  }

  const message = await Message.create({
    author: dev._id,        // IMPORTANT
    content,
    image: dev.image,       // optional
    isActive: true,
  });

  res.status(201).json(message);
};


export const updateMessage = async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) return res.status(404).json({ message: "Not found" });

  message.content = req.body.content;
  await message.save();

  res.json(message);
};

export const deleteMessage = async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) return res.status(404).json({ message: "Not found" });

  // const isOwner = message.authorEmail === req.user.email;
 
  await message.deleteOne();
  res.sendStatus(204);
};
