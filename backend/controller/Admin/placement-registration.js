// controllers/placementRegistrationController.js
import PlacementRegistration from '../../models/placement-registration.js'; // Adjust path as needed

// Create a new placement registration
export const createPlacementRegistration = async (req, res) => {
  try {
    const placementData = req.body;
    const newPlacement = new PlacementRegistration(placementData);
    const savedPlacement = await newPlacement.save();
    res.status(201).json(savedPlacement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Fetch all placement registrations
export const getAllPlacementRegistrations = async (req, res) => {
  try {
    const placements = await PlacementRegistration.find().populate('studentId', 'name rollno'); // Optional: populate student details
    res.status(200).json(placements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch a single placement registration by ID
export const getPlacementRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;
    const placement = await PlacementRegistration.findById(id).populate('studentId', 'name rollno'); // Optional: populate
    if (!placement) {
      return res.status(404).json({ message: 'Placement registration not found' });
    }
    res.status(200).json(placement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update (edit) a placement registration by ID
export const updatePlacementRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPlacement = await PlacementRegistration.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedPlacement) {
      return res.status(404).json({ message: 'Placement registration not found' });
    }
    res.status(200).json(updatedPlacement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a placement registration by ID
export const deletePlacementRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPlacement = await PlacementRegistration.findByIdAndDelete(id);
    if (!deletedPlacement) {
      return res.status(404).json({ message: 'Placement registration not found' });
    }
    res.status(200).json({ message: 'Placement registration deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete multiple placement registrations by IDs
export const deleteManyPlacementRegistrations = async (req, res) => {
  try {
    const { ids } = req.body; // Expect array of IDs in request body
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Provide an array of IDs' });
    }
    const deletedPlacements = await PlacementRegistration.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ message: `${deletedPlacements.deletedCount} placement registrations deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};