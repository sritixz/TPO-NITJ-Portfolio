import PlacementRegistration from '../models/placement-registration.js';
import Student from '../models/user_model/student.js';

// Create a new placement registration
export const createPlacementRegistration = async (req, res) => {
  try {
    const studentId= req.user.userId;
    const existingRegistration = await PlacementRegistration.findOne({ studentId });
    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for placement',
      });
    }

    const { interested } = req.body;
    await Student.findByIdAndUpdate(studentId, {
      isInterested: interested,
    });

      const placementData = {
      ...req.body,
      studentId,
    };
    const newPlacement = new PlacementRegistration(placementData);
    const savedPlacement = await newPlacement.save();
    res.status(201).json({
      success: true,
      message: 'Placement registration created successfully',
      data: savedPlacement
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating placement registration',
      error: error.message
    });
  }
};

export const checkStudentPlacementRegistration = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const existing = await PlacementRegistration.findOne({ studentId });

    if (existing) {
      return res.status(200).json({
        success: true,
        registered: true,
        message: 'Student has already registered for placement',
      });
    } else {
      return res.status(200).json({
        success: true,
        registered: false,
        message: 'Student has not registered yet',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking registration status',
      error: error.message,
    });
  }
};


export const getPlacementRegistrationExportData = async (req, res) => {
  try {
    const { batch, course, department } = req.query;

    const query = {};
    if (batch) query.batch = batch;
    if (course) query.course = course;
    if (department) query.department = department;

    const students = await PlacementRegistration.find(query).lean();

    res.status(200).json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error fetching student data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student data',
      error: error.message
    });
  }
};