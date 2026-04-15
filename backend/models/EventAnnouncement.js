import mongoose from "mongoose";

const eventAnnouncementSchema = new mongoose.Schema({
  title: { type: String,},
  description: { type: String, },
  date: { type: Date,},
  location: { type: String },
  type: { type: String, enum: ['event', 'announcement'], default: 'event' },
  image: { type: String } // Stores the filename/path
}, { timestamps: true });

export default mongoose.model("EventAnnouncement", eventAnnouncementSchema);