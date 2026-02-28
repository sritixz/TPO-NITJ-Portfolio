//jobprofile
import JobProfile from "../models/jobprofile.js";
import Student from "../models/user_model/student.js";
import Recuiter from "../models/user_model/recuiter.js";
import Professor from "../models/user_model/professor.js";
import { error } from "console";
import SummerInternship from "../models/summer_internship.js";
import SummerInternTracker from "../models/summer_intern_tracker.js";
import Suggestion from "../models/suggestion.js";
import SharedExperience from "../models/sharedexperience.js";
import Noc from "../models/noc.js";
import Suggestions from "../models/suggestion.js";
import { json } from "express";

//for the job profile management
export const getAllJobProfiles = async (req, res) => {
  try {
 
    const jobProfiles = await JobProfile.find().populate("Applied_Students");
    res.status(200).json(jobProfiles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching job profiles", error });
  }
};

// export const addJobProfile = async (req, res) => {
//   const newJobProfile = new JobProfile(req.body);
//   // console.log(newJobProfile);
//   try {
//     const savedJobProfile = await newJobProfile.save();
//     const fromDB = await JobProfile.findById(savedJobProfile._id).lean();
// console.log("Fetched fresh from DB:", fromDB);
//     // console.log("saved"+savedJobProfile);
//     // console.log("Saved from DB:", savedJobProfile.toObject());
//     res.status(201).json(savedJobProfile);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating job profile", error });
//   }
// };
export const addJobProfile = async (req, res) =>
   { const newJobProfile = new JobProfile(req.body); 
 
     try { const savedJobProfile = await newJobProfile.save();
   
       res.status(201).json(savedJobProfile); } 
       catch (error) 
       { res.status(500).json({ message: "Error creating job profile", error });
       } };


export const updateJobProfile = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
  
    try {
      const updatedProfile = await JobProfile.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      if (!updatedProfile) {
        return res.status(404).json({ message: "Job profile not found" });
      }
      res.status(200).json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: "Error updating job profile", error });
    }
  };

  export const deleteJobProfile = async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedProfile = await JobProfile.findByIdAndDelete(id);
      if (!deletedProfile) {
        return res.status(404).json({ message: "Job profile not found" });
      }
      res.status(200).json({ message: "Job profile deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting job profile", error });
    }
  };

  export const bulkDeleteJobProfiles = async (req, res) => {
    const { ids } = req.body;
  
    try {
      await JobProfile.deleteMany({ _id: { $in: ids } });
      res.status(200).json({ message: "Bulk deletion successful" });
    } catch (error) {
      res.status(500).json({ message: "Error during bulk deletion", error });
    }
  };

  export const toggleJobProfileVisibility = async (req, res) => {
    const { id } = req.params;
    const { show } = req.body;
  
    try {
      const updatedProfile = await JobProfile.findByIdAndUpdate(
        id,
        { show: !show },
        { new: true }
      );
      if (!updatedProfile) {
        return res.status(404).json({ message: "Job profile not found" });
      }
      res.status(200).json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: "Error toggling visibility", error });
    }
  };
// export const getJobProfiledetails = async (req, res) => {
//   try {
//     const { _id } = req.params;
//     const job = await JobProfile.findById(_id)
//     // .populate("Applied_Students", "name email rollno department")
//     //   .populate("final_shortlisted_students", "name email rollno department")
//     //   .populate("Hiring_Workflow.eligible_students", "name email rollno")
//     //   .populate("Hiring_Workflow.shortlisted_students", "name email rollno");

//     res.status(200).json({job});
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }
export const addAppliedStudent = async (req, res) => {
  const { studentId } = req.body;
  
 try {


    const job = await JobProfile.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

   
    if (job.final_shortlisted_students.includes(studentId)) {
      return res.status(400).json({
        error: "Student is already final shortlisted",
      });
    }
    const alreadyInWorkflow = job.Hiring_Workflow.some(step =>
      step.eligible_students.includes(studentId) ||
      step.shortlisted_students.includes(studentId) ||
      step.absent_students?.includes(studentId)
    );

    if (alreadyInWorkflow) {
      return res.status(400).json({
        error: "Student already exists in hiring workflow",
      });
    }
   job.Applied_Students.addToSet(studentId);
    await job.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const removeAppliedStudent = async (req, res) => {
  const { studentId } = req.body;

  try {
    await JobProfile.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          Applied_Students: studentId,
          final_shortlisted_students: studentId,
        },
      }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const addFinalShortlisted = async (req, res) => {
  const { studentId } = req.body;

  try {

    const job = await JobProfile.findById(req.params.id);

    if (!job.Applied_Students.includes(studentId)) {
      return res.status(400).json({
        message: "Student must be applied before final shortlisting",
      });
    }

    await JobProfile.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { final_shortlisted_students: studentId } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const removeFinalShortlisted = async (req, res) => {
  const { studentId } = req.body;

  try {

    await JobProfile.findByIdAndUpdate(
      req.params.id,
      { $pull: { final_shortlisted_students: studentId } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getJobProfileDetails = async (req, res) => {
  try {
    const { id } = req.params; // ✅ FIX

    const job = await JobProfile.findById(id)
      .populate("Applied_Students", "name email rollno department")
      .populate("final_shortlisted_students", "name email rollno department")
      .populate("Hiring_Workflow.eligible_students", "name email rollno department")
      .populate("Hiring_Workflow.shortlisted_students", "name email rollno department");

     
    res.status(200).json({ job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const moveStudentForward = async (req, res) => {
  const { jobId, studentId, stepIndex, bypassWorkflow } = req.body;

  const job = await JobProfile.findById(jobId);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }
if (job.Hiring_Workflow.length === 0 && !bypassWorkflow) {
  return res.status(400).json({
    error: "The hiring workflow is not defined for this job",
  });
}

  if (bypassWorkflow === true) {
    job.Applied_Students.pull(studentId);

    job.Hiring_Workflow.forEach(step => {
      step.eligible_students.pull(studentId);
     step.shortlisted_students.addToSet(studentId);
      step.absent_students?.pull(studentId);
    });

    job.final_shortlisted_students.addToSet(studentId);
    await job.save();

    return res.json({ movedTo: "final", bypassed: true });
  }

  
  if (stepIndex === -1) {
    if (!job.Applied_Students.includes(studentId)) {
      return res.status(400).json({ error: "Student not in applied state" });
    }

    job.Applied_Students.pull(studentId);
    job.Hiring_Workflow[0].eligible_students.addToSet(studentId);

    await job.save();
    return res.json({ movedTo: job.Hiring_Workflow[0].step_type });
  }

  
  const step = job.Hiring_Workflow[stepIndex];
  if (!step) {
    return res.status(400).json({ error: "Invalid step index" });
  }

  // 1Remove from CURRENT eligible
  step.eligible_students.pull(studentId);


  step.shortlisted_students.addToSet(studentId);

  
  if (stepIndex === job.Hiring_Workflow.length - 1) {
    job.final_shortlisted_students.addToSet(studentId);
    await job.save();
    return res.json({ movedTo: "final" });
  }


  job.Hiring_Workflow[stepIndex + 1].eligible_students.addToSet(studentId);

  await job.save();
  return res.json({
    movedTo: job.Hiring_Workflow[stepIndex + 1].step_type,
  });
};

  
//for student management
export const getAllStudents = async (req, res) => {
  try {
 
    const studentProfiles = await Student.find();
    res.status(200).json(studentProfiles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student profiles", error });
  }
};

export const updateStudentProfile = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedProfile = await Student.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedProfile) {
      return res.status(404).json({ message: "Student profile not found" });
    }
    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: "Error updating student profile", error });
  }
};

export const deleteStudentProfiles = async (req, res) => {
  const { studentIds } = req.body;

  // Validation
  if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({ message: "Invalid student IDs provided" });
  }

  try {
    //for any amount of delete
    const deleteResult = await Student.deleteMany({ 
      _id: { $in: studentIds } 
    });

    //Checking for successful delete
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ 
        message: "No student profiles found to delete" 
      });
    }

    //return success response with details of deletion
    res.status(200).json({ 
      message: `Successfully deleted ${deleteResult.deletedCount} student profile(s)`,
      deletedCount: deleteResult.deletedCount
    });
  } catch (error) {
    console.error('Error deleting student profiles:', error);
    res.status(500).json({ 
      message: "Error deleting student profiles", 
      error: error.message 
    });
  }
};

export const deactivateStudentProfiles = async (req, res) => {
  const studentId = req.params.id;
  const {deactivate} = req.body;

  // Validation
  if (!studentId|| studentId.length === 0) {
    return res.status(400).json({ message: "Invalid student ID provided" });
  }

  try {
    //for any amount of delete
    const deactivatedProfile = await Student.findByIdAndUpdate(studentId, 
      {account_deactivate:deactivate},
      {new:true}
    )

    //Checking for successful delete
    if (!deactivatedProfile) {
      return res.status(404).json({ 
        message: "No student profiles found to delete" 
      });
    }

    //return success response with details of deletion
    res.status(200).json({ 
      message: `Successfully deactivated ${deactivatedProfile}`
    });
  } catch (error) {
    console.error('Error deactivating student profiles:', error);
    res.status(500).json({ 
      message: "Error deactivating student profiles", 
      error: error.message 
    });
  }
};

export const addNewStudent = async (req, res) => {
  try {
    // Create a new student document using the request body
    const newStudent = new Student(req.body);

    // Save the new student to the database
    const savedStudent = await newStudent.save();

    // Respond with the created student and 201 (Created) status
    res.status(201).json(savedStudent);
  } catch (error) {
    // Handle validation errors or database errors
    if (error.name === 'ValidationError') {
      // If there are validation errors (e.g., required fields missing)
      return res.status(400).json({ 
        message: "Invalid student data", 
        errors: error.errors 
      });
    }

    // Handle duplicate key errors (if you have unique constraints)
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: "A student with this identifier already exists" 
      });
    }

    // Generic server error for other types of errors
    res.status(500).json({ 
      message: "Error creating new student profile", 
      error: error.message 
    });
  }
};

export const bulkUpdatePlacementInterest = async (req, res) => {
  try {
    const {course, batch, isInterested } = req.body;

    if (!batch) {
      return res.status(400).json({
        success: false,
        message: "Batch is required",
      });
    }
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course is required",
      });
    }

    if (typeof isInterested !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isInterested must be true or false",
      });
    }

    const result = await Student.updateMany(
      { batch, course },
      { $set: { isInterested } }
    );
    return res.status(200).json({
      success: true,
      message: "Placement interest updated successfully",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });

  } catch (error) {
    console.error("Bulk placement update error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//for recruiter management
export const getAllRecruiters = async (req, res) => {
  try {
 
    const recruiterProfiles = await Recuiter.find();
    res.status(200).json(recruiterProfiles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student profiles", error });
  }
};

export const updateRecruiterProfile = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedProfile = await Recuiter.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedProfile) {
      return res.status(404).json({ message: "Recruiter profile not found" });
    }
    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: "Error updating recruiter profile", error });
  }
};

export const deleteRecruiterProfiles = async (req, res) => {
  const { recruiterIds } = req.body;

  // Validation
  if (!recruiterIds || !Array.isArray(recruiterIds) || recruiterIds.length === 0) {
    return res.status(400).json({ message: "Invalid recruiter IDs provided" });
  }

  try {
    //for any amount of delete
    const deleteResult = await Recuiter.deleteMany({ 
      _id: { $in: recruiterIds } 
    });

    //Checking for successful delete
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ 
        message: "No recruiter profiles found to delete" 
      });
    }

    //return success response with details of deletion
    res.status(200).json({ 
      message: `Successfully deleted ${deleteResult.deletedCount} recruiter profile(s)`,
      deletedCount: deleteResult.deletedCount
    });
  } catch (error) {
    console.error('Error deleting recruiter profiles:', error);
    res.status(500).json({ 
      message: "Error deleting recruiter profiles", 
      error: error.message 
    });
  }
};

export const addNewRecruiter = async (req, res) => {
  try {
    //create a new recruiter document
    const newRecruiter = new Recuiter(req.body);

    //save the new recruiter to the database
    const savedRecruiter = await newRecruiter.save();

    //respond with the created student
    res.status(201).json(savedRecruiter);
  } catch (error) {
    //handle validation errors or database errors
    if (error.name === 'ValidationError') {
      //if there are validation errors
      return res.status(400).json({ 
        message: "Invalid recruiter data", 
        errors: error.errors 
      });
    }

    //handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: "A recruiter with this identifier already exists" 
      });
    }

    //server error for other types of errors
    res.status(500).json({ 
      message: "Error creating new recruiter profile", 
      error: error.message 
    });
  }
};

export const getAllProfessors = async (req, res) => {
  try {
    const professors = await Professor.find();
    res.status(200).json(professors);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching professor profiles",
      error: error.message,
    });
  }
};

export const updateProfessorProfile = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedProfile = await Professor.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedProfile) {
      return res.status(404).json({ message: "Professor profile not found" });
    }
    console.log(updatedProfile)
    res.status(200).json(updatedProfile);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error updating professor profile", error });
  }
};

export const deleteProfessorProfiles = async (req, res) => {
  const { professorIds } = req.body;

  // Validation
  if (!professorIds || !Array.isArray(professorIds) || professorIds.length === 0) {
    return res.status(400).json({ message: "Invalid professor IDs provided" });
  }

  try {
    //for any amount of delete
    const deleteResult = await Professor.deleteMany({ 
      _id: { $in: professorIds } 
    });

    //Checking for successful delete
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ 
        message: "No professor profiles found to delete" 
      });
    }

    //return success response with details of deletion
    res.status(200).json({ 
      message: `Successfully deleted ${deleteResult.deletedCount} professor profile(s)`,
      deletedCount: deleteResult.deletedCount
    });
  } catch (error) {
    console.error('Error deleting professor profiles:', error);
    res.status(500).json({ 
      message: "Error deleting professor profiles", 
      error: error.message 
    });
  }
};

export const addNewProfessor = async (req, res) => {
  try {
    //create a new professor document
    const newProfessor = new Professor(req.body);

    //save the new professor to the database
    const savedProfessor = await newProfessor.save();

    //respond with the created student
    res.status(201).json(savedProfessor);
  } catch (error) {
    //handle validation errors or database errors
    if (error.name === 'ValidationError') {
      //if there are validation errors
      return res.status(400).json({ 
        message: "Invalid professor data", 
        errors: error.errors 
      });
    }

    //handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: "A professor with this identifier already exists" 
      });
    }

    //server error for other types of errors
    res.status(500).json({ 
      message: "Error creating new professor profile", 
      error: error.message 
    });
  }
};

export const getProfessorById = async (req, res) => {
  const { id } = req.params;

  try {
    const professorProfile = await Professor.findById(id);
    if (!professorProfile) {
      return res.status(404).json({ message: "Professor profile not found" });
    }
    res.status(200).json(professorProfile);
  } catch (error) {
    res.status(500).json({ message: "Error fetching professor profile", error });
  }
};

// Helper function to get model by collection name
const getModelByCollectionName = (collectionName) => {
  const modelMap = {
    summerinterns: SummerInternship,
    summerinterntrackers: SummerInternTracker,
    suggestions: Suggestion,
    sharedexperiences: SharedExperience,
    nocs: Noc
  };
  
  return modelMap[collectionName] || null;
};

export const getDatabaseRecords = async (req, res) => {
  const { collectionName } = req.params;
  try {
    const Model = getModelByCollectionName(collectionName);
    if (!Model) {
      return res.status(400).json({ message: "Invalid collection name" });
    }
    const schema = Model.schema.obj;
    const records = await Model.find();
    res.status(200).json({
      records: records,
      schema: Object.keys(schema)
    });
  }
  catch (error) {
    console.log("Error fetching database records:", error);
    res.status(500).json({ message: "Error fetching database records", error });
  }
}