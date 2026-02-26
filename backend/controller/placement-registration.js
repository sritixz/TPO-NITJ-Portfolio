import PlacementRegistration from "../models/placement-registration.js";
import Student from "../models/user_model/student.js";
import PlacementRegistrationDeadline from "../models/placement-registration-deadline.js";

const toBoolean = (v) => {
  return v === true || v === "true" || v === 1 || v === "1";
};

const pickPlacementFields = (body) => {
  const {
    name,
    rollno,
    department,
    course,
    batch,
    fatherName,
    motherName,
    category,
    gender,
    dateOfBirth,
    physicallyDisabled,
    disabilityType,
    permanentAddress,
    mobileNo,
    emailNitj,
    emailPersonal,
    aadharCardNo,
    interested,
    description,
    preferredSector,
    privateType,
    nonTechType,
    otherNonTechRole,
    trainingRequired,
    trainingPlatform,
  } = body;

  const parsedDateOfBirth = dateOfBirth ? new Date(dateOfBirth) : undefined;

  return {
    ...(name !== undefined && { name }),
    ...(rollno !== undefined && { rollno }),
    ...(department !== undefined && { department }),
    ...(course !== undefined && { course }),
    ...(batch !== undefined && { batch }),
    ...(fatherName !== undefined && { fatherName }),
    ...(motherName !== undefined && { motherName }),
    ...(category !== undefined && { category }),
    ...(gender !== undefined && { gender }),
    ...(parsedDateOfBirth !== undefined && { dateOfBirth: parsedDateOfBirth }),
    ...(physicallyDisabled !== undefined && {
      physicallyDisabled: toBoolean(physicallyDisabled),
    }),
    ...(disabilityType !== undefined && { disabilityType }),
    ...(permanentAddress !== undefined && { permanentAddress }),
    ...(mobileNo !== undefined && { mobileNo }),
    ...(emailNitj !== undefined && { emailNitj }),
    ...(emailPersonal !== undefined && { emailPersonal }),
    ...(aadharCardNo !== undefined && { aadharCardNo }),
    ...(interested !== undefined && { interested: toBoolean(interested) }),
    ...(description !== undefined && { description }),
    ...(preferredSector !== undefined && { preferredSector }),
    ...(privateType !== undefined && { privateType }),
    ...(nonTechType !== undefined && {
      nonTechType: Array.isArray(nonTechType) ? nonTechType : [],
    }),
    ...(otherNonTechRole !== undefined && { otherNonTechRole }),
    ...(trainingRequired !== undefined && {
      trainingRequired: toBoolean(trainingRequired),
    }),
    ...(trainingPlatform !== undefined && { trainingPlatform }),
  };
};

export const createPlacementRegistration = async (req, res) => {
  try {
    const d = await PlacementRegistrationDeadline.findOne().sort({
      createdAt: -1,
    });
    if (!d || !d.allowed) {
      return res.status(403).json({
        success: false,
        message: "Placement registration is currently closed",
      });
    }

    const studentId = req.user.userId;

    const existingRegistration = await PlacementRegistration.findOne({
      studentId,
    });
    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: "You have already registered for placement",
      });
    }

    const placementData = pickPlacementFields(req.body);

    const interested = placementData.interested;
    if (interested === undefined || interested === null) {
      return res.status(400).json({
        success: false,
        message: "Interested field is mandatory",
      });
    }
    if (interested === true) {
      if (!placementData.preferredSector) {
        return res.status(400).json({
          success: false,
          message: "Preferred sector is required",
        });
      }

      if (
        ["Private", "Both"].includes(placementData.preferredSector) &&
        !placementData.privateType
      ) {
        return res.status(400).json({
          success: false,
          message: "Private type is required",
        });
      }

      if (placementData.privateType === "Non-Tech") {
        if (
          !placementData.nonTechType ||
          placementData.nonTechType.length === 0
        ) {
          return res.status(400).json({
            success: false,
            message: "At least one Non-Tech role is required",
          });
        }

        if (
          placementData.nonTechType.includes("Other") &&
          (!placementData.otherNonTechRole ||
            placementData.otherNonTechRole.trim() === "")
        ) {
          return res.status(400).json({
            success: false,
            message: "Other Non-Tech role must be specified",
          });
        }
      }
      
      if (!["Private", "Both"].includes(placementData.preferredSector)) {
        placementData.privateType = null;
        placementData.nonTechType = [];
        placementData.otherNonTechRole = "";
      }

      if (placementData.privateType !== "Non-Tech") {
        placementData.nonTechType = [];
        placementData.otherNonTechRole = "";
      }
    }

    /* TRAINING ALWAYS REQUIRED */
    if (
      placementData.trainingRequired === undefined ||
      placementData.trainingRequired === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Training required field is mandatory",
      });
    }

    if (
      placementData.trainingRequired === true &&
      (!placementData.trainingPlatform ||
        placementData.trainingPlatform.trim() === "")
    ) {
      return res.status(400).json({
        success: false,
        message: "Training platform is required",
      });
    }

    /* Cleanup when not interested */
    if (interested === false) {
      placementData.preferredSector = null;
      placementData.privateType = null;
      placementData.nonTechType = [];
      placementData.otherNonTechRole = "";
    }

    placementData.studentId = studentId;

    // Update student's isInterested flag
    await Student.findByIdAndUpdate(
      studentId,
      { isInterested: interested },
      { new: true },
    ).catch(() => {
      /* non-fatal */
    });

    const newPlacement = new PlacementRegistration(placementData);
    const savedPlacement = await newPlacement.save();

    return res.status(201).json({
      success: true,
      message: "Placement registration created successfully",
      data: savedPlacement,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Registration already exists (race detected)",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Error creating placement registration",
      error: error.message,
    });
  }
};

export const editPlacementRegistration = async (req, res) => {
  try {
    const deadline = await PlacementRegistrationDeadline.findOne().sort({
      createdAt: -1,
    });
    if (!deadline || !deadline.allowed) {
      return res.status(403).json({
        success: false,
        message: "Placement registration is currently closed",
      });
    }

    const studentId = req.user.userId;

    const existingRegistration = await PlacementRegistration.findOne({
      studentId,
    });
    if (!existingRegistration) {
      return res.status(404).json({
        success: false,
        message: "No existing placement registration found",
      });
    }

    const updatePayload = pickPlacementFields(req.body);

    const interested =
      updatePayload.interested !== undefined
        ? updatePayload.interested
        : existingRegistration.interested;

    if (interested === undefined || interested === null) {
      return res.status(400).json({
        success: false,
        message: "Interested field is mandatory",
      });
    }
    const prefSector =
      updatePayload.preferredSector ?? existingRegistration.preferredSector;

    const privateType =
      updatePayload.privateType ?? existingRegistration.privateType;
    if (interested === true) {
      if (!prefSector) {
        return res.status(400).json({
          success: false,
          message: "Preferred sector is required",
        });
      }

      if (["Private", "Both"].includes(prefSector) && !privateType) {
        return res.status(400).json({
          success: false,
          message: "Private type is required",
        });
      }

      if (privateType === "Non-Tech") {
        const roles =
          updatePayload.nonTechType ?? existingRegistration.nonTechType;

        if (!roles || roles.length === 0) {
          return res.status(400).json({
            success: false,
            message: "At least one Non-Tech role is required",
          });
        }

        const otherRole =
          updatePayload.otherNonTechRole ??
          existingRegistration.otherNonTechRole;

        if (
          roles.includes("Other") &&
          (!otherRole || otherRole.trim() === "")
        ) {
          return res.status(400).json({
            success: false,
            message: "Other Non-Tech role must be specified",
          });
        }
      }
    }

    /* TRAINING ALWAYS REQUIRED */
    const trainingReq =
      updatePayload.trainingRequired !== undefined
        ? updatePayload.trainingRequired
        : existingRegistration.trainingRequired;

    const trainingPlatform =
      updatePayload.trainingPlatform !== undefined
        ? updatePayload.trainingPlatform
        : existingRegistration.trainingPlatform;

    if (trainingReq === undefined || trainingReq === null) {
      return res.status(400).json({
        success: false,
        message: "Training required field is mandatory",
      });
    }

    if (
      trainingReq === true &&
      (!trainingPlatform || trainingPlatform.trim() === "")
    ) {
      return res.status(400).json({
        success: false,
        message: "Training platform is required",
      });
    }

    /* Cleanup if switched to not interested */
    if (interested === false) {
      updatePayload.preferredSector = null;
      updatePayload.privateType = null;
      updatePayload.nonTechType = [];
      updatePayload.otherNonTechRole = "";
    }

    if (!["Private", "Both"].includes(prefSector)) {
      updatePayload.privateType = null;
      updatePayload.nonTechType = [];
      updatePayload.otherNonTechRole = "";
    }

    if (privateType !== "Non-Tech") {
      updatePayload.nonTechType = [];
      updatePayload.otherNonTechRole = "";
    }

    updatePayload.studentId = studentId;

    // Update student's isInterested flag
    await Student.findByIdAndUpdate(studentId, {
      isInterested: interested,
    }).catch(() => {
      /* non-fatal */
    });

    const updatedPlacement = await PlacementRegistration.findOneAndUpdate(
      { studentId },
      { $set: updatePayload },
      { new: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      message: "Placement registration updated successfully",
      data: updatedPlacement,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Error updating placement registration",
      error: error.message,
    });
  }
};

export const checkStudentPlacementRegistration = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const existing = await PlacementRegistration.findOne({ studentId });

    if (existing) {
      return res.status(200).json({
        data: existing,
        success: true,
        registered: true,
        message: "Student has already registered for placement",
      });
    }

    return res.status(200).json({
      success: true,
      registered: false,
      message: "Student has not registered yet",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking registration status",
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

    return res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error("Error fetching student data:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching student data",
      error: error.message,
    });
  }
};

/**
 * Deadline management
 */
export const createDeadline = async (req, res) => {
  try {
    const { allowed, deadlinetoshow } = req.body;

    const dt = deadlinetoshow ? new Date(deadlinetoshow) : null;
    if (deadlinetoshow && isNaN(dt.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid deadlinetoshow format" });
    }

    // If deadline provided and it's in the past, force allowed = false (autoclose)
    const now = new Date();
    const effectiveAllowed = Boolean(allowed) && (!dt || dt > now);

    const d = await PlacementRegistrationDeadline.create({
      allowed: effectiveAllowed,
      deadlinetoshow: dt,
    });

    // if created with a past deadline (shouldn't normally happen because effectiveAllowed would be false),
    // just ensure DB stores the date and allowed=false.
    return res.status(201).json({ success: true, data: d });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * Edit an existing deadline (id in req.params)
 * Accepts allowed and deadlinetoshow (ISO string)
 */
export const editDeadline = async (req, res) => {
  try {
    const { id } = req.params;
    const { allowed, deadlinetoshow } = req.body;

    const dt = deadlinetoshow ? new Date(deadlinetoshow) : null;
    if (deadlinetoshow && isNaN(dt.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid deadlinetoshow format" });
    }

    // If new deadline is in the past, autoclose regardless of requested `allowed`.
    const now = new Date();
    const effectiveAllowed = Boolean(allowed) && (!dt || dt > now);

    const d = await PlacementRegistrationDeadline.findByIdAndUpdate(
      id,
      { allowed: effectiveAllowed, deadlinetoshow: dt },
      { new: true },
    );

    if (!d)
      return res
        .status(404)
        .json({ success: false, message: "Deadline not found" });

    return res.status(200).json({ success: true, data: d });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * Return the latest deadline. If the deadline has passed and allowed is true,
 * flip allowed to false and persist (autoclose).
 */
export const checkopen = async (req, res) => {
  try {
    const d = await PlacementRegistrationDeadline.findOne().sort({
      createdAt: -1,
    });

    if (!d) {
      return res.status(200).json({
        success: false,
        message: "Deadline not set",
        data: null,
      });
    }

    // If allowed is true but deadline time is in the past => autoclose and persist change
    if (d.allowed && d.deadlinetoshow) {
      const now = new Date();
      const deadlineDate = new Date(d.deadlinetoshow);
      if (!isNaN(deadlineDate.getTime()) && deadlineDate <= now) {
        d.allowed = false;
        await d.save();
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: d._id,
        allowed: d.allowed,
        deadlinetoshow: d.deadlinetoshow,
      },
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message,
      data: null,
    });
  }
};
