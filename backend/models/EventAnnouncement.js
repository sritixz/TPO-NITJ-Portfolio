import mongoose from "mongoose";

const eventAnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String },
  type: { type: String, enum: ['event', 'announcement'], default: 'event' },
  image: { type: String } // Stores the filename/path
}, { timestamps: true });

export default mongoose.model("EventAnnouncement", eventAnnouncementSchema);