import EventAnnouncement from "../models/EventAnnouncement.js";
import multer from "multer";
import path from "path";

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: "uploads/events/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const upload = multer({ storage });

export const getEventAnnouncements = async (req, res) => {
  try {
    const data = await EventAnnouncement.find().sort({ date: -1 });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEventAnnouncement = async (req, res) => {
  try {
    const { title, description, date, location, type } = req.body;
    const imageUrl = req.file ? `/uploads/events/${req.file.filename}` : null;

    const newEntry = new EventAnnouncement({
      title, description, date, location, type,
      image: imageUrl || "https://nitj.ac.in/files/1736402875155-6-11.jpg"
    });

    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Add these to your existing controller file
export const updateEventAnnouncement = async (req, res) => {
  try {
    const updateData = req.file 
      ? { ...req.body, image: `/uploads/events/${req.file.filename}` } 
      : req.body;
    const updated = await EventAnnouncement.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteEventAnnouncement = async (req, res) => {
  try {
    await EventAnnouncement.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};