import PlacementRegistration from '../models/placement-registration.js';
import Student from '../models/user_model/student.js';
import PlacementRegistrationDeadline from "../models/placement-registration-deadline.js";

// Create a new placement registration
export const createPlacementRegistration = async (req, res) => {
  try {
     const d = await PlacementRegistrationDeadline.findOne().sort({ createdAt: -1 });
    if (!d || !d.allowed) {
      return res.status(403).json({
        success: false,
        message: 'Placement registration is currently closed',
      });
    }
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



//deadline

export const createDeadline = async (req, res) => {
  try {
    const { allowed, deadlinetoshow } = req.body;
    const d = await PlacementRegistrationDeadline.create({ allowed, deadlinetoshow });
    res.status(201).json({ success: true, data: d });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const editDeadline = async (req, res) => {
  try {
    const { id } = req.params;
    const { allowed, deadlinetoshow } = req.body;
    const d = await PlacementRegistrationDeadline.findByIdAndUpdate(
      id,
      { allowed, deadlinetoshow },
      { new: true }
    );
    if (!d) return res.status(404).json({ success: false, message: "Deadline not found" });
    res.status(200).json({ success: true, data: d });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const checkopen = async (req, res) => {
  try {
    const d = await PlacementRegistrationDeadline.findOne().sort({ createdAt: -1 });

    if (!d) {
      return res.status(200).json({
        success: false,
        message: "Deadline not set",
        data: null
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: d._id,
        allowed: d.allowed,
        deadlinetoshow: d.deadlinetoshow
      }
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message,
      data: null
    });
  }
};
