import PlacementSettings from "../../models/placementSettings.js";

/**
 * Get current placement settings
 */
export const getPlacementSettings = async (req, res) => {
  try {
    let settings = await PlacementSettings.findOne();
    if (!settings) {
      // Create default settings if they don't exist
      settings = await PlacementSettings.create({
        allow7thSem1_5x: false,
      });
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching placement settings",
      error: error.message,
    });
  }
};

/**
 * Update placement settings (admin only)
 */
export const updatePlacementSettings = async (req, res) => {
  try {
    const { allow7thSem1_5x } = req.body;

    let settings = await PlacementSettings.findOne();
    if (!settings) {
      settings = await PlacementSettings.create({
        allow7thSem1_5x: allow7thSem1_5x ?? false,
      });
    } else {
      if (typeof allow7thSem1_5x === "boolean") {
        settings.allow7thSem1_5x = allow7thSem1_5x;
      }
      await settings.save();
    }

    res.status(200).json({
      message: "Placement settings updated successfully",
      settings,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating placement settings",
      error: error.message,
    });
  }
};

/**
 * Toggle the 7th Sem 1.5x setting
 */
export const toggle7thSem1_5x = async (req, res) => {
  try {
    let settings = await PlacementSettings.findOne();
    if (!settings) {
      settings = await PlacementSettings.create({
        allow7thSem1_5x: true,
      });
    } else {
      settings.allow7thSem1_5x = !settings.allow7thSem1_5x;
      await settings.save();
    }

    res.status(200).json({
      message: `7th Sem 1.5x eligibility ${settings.allow7thSem1_5x ? "enabled" : "disabled"}`,
      allow7thSem1_5x: settings.allow7thSem1_5x,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error toggling 7th Sem 1.5x setting",
      error: error.message,
    });
  }
};
