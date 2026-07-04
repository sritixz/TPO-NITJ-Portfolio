import mongoose from "mongoose";

const placementSettingsSchema = new mongoose.Schema(
  {
    // Batch 2027 specific settings
    allow7thSem1_5x: {
      type: Boolean,
      default: false,
      description: "Allow 7th semester students to apply to 1.5x dream companies in Phase I"
    },

    // Future settings can be added here
    // e.g., phase1StartDate, phase2StartDate, etc.
  },
  {
    timestamps: true,
  }
);

const PlacementSettings = mongoose.model("PlacementSettings", placementSettingsSchema);

export default PlacementSettings;
