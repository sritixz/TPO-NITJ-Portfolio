import Faculty from "../../models/user_model/faculty.js"; //
import * as XLSX from "xlsx";


// 1. GET (Read) - Fetch all faculty for the table
export const getAllFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find();
    res.status(200).json(faculties);
  } catch (error) {
    res.status(500).json({ message: "Error fetching faculty", error });
  }
};

// 2. POST (Create) - Add a new faculty member
export const addNewFaculty = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // REMOVED: bcrypt.genSalt and bcrypt.hash
    // Saving the password directly as plain text
    const newFaculty = new Faculty({ 
      name, 
      email, 
      password: password 
    });

    await newFaculty.save();
    res.status(201).json({ message: "Faculty added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding faculty", error: error.message });
  }
}

// 3. PUT (Update) - Edit existing faculty details
export const updateFacultyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // REMOVED: hashing logic for updates
    // If password is provided in req.body, it remains plain text
    await Faculty.findByIdAndUpdate(id, updateData);
    res.status(200).json({ message: "Faculty updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating faculty", error: error.message });
  }
};

// 4. DELETE (Delete) - Remove single or multiple faculty
export const deleteFacultyProfiles = async (req, res) => {
  try {
    const { facultyIds } = req.body; // Array of IDs from frontend
    await Faculty.deleteMany({ _id: { $in: facultyIds } });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error });
  }
};

// 5. POST - Bulk Upload from Excel
export const uploadFacultiesExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    // Normalize keys to lowercase and trim whitespace
    const rows = rawRows.map((row) => {
      const cleanRow = {};
      Object.keys(row).forEach((key) => {
        cleanRow[key.trim().toLowerCase()] = row[key];
      });
      return cleanRow;
    });

    // Map rows to schema
    const facultiesToProcess = rows.map(row => ({
      name: row.name || row.faculty_name || "",
      email: row.email || row.faculty_email || "",
      password: row.password || "faculty@123", // Reverting to plain text as requested
      userType: "Faculty"
    }));

    const validFaculties = facultiesToProcess.filter(f => f.name && f.email);
    const emails = validFaculties.map((f) => f.email);

    // Identify existing faculties to prevent duplicate key errors
    const existing = await Faculty.find({ email: { $in: emails } });
    const existingEmails = new Set(existing.map((f) => f.email));

    const newFaculties = [];
    const duplicatedInExcel = [];

    validFaculties.forEach((faculty) => {
      if (existingEmails.has(faculty.email)) {
        duplicatedInExcel.push(faculty);
      } else {
        newFaculties.push(faculty);
      }
    });

    if (newFaculties.length) {
      await Faculty.insertMany(newFaculties);
    }

    // returning existingStudents key to maintain frontend compatibility
    return res.status(200).json({
      insertedCount: newFaculties.length,
      existingStudents: duplicatedInExcel, 
    });
  } catch (error) {
    res.status(500).json({ message: "Excel upload failed", error: error.message });
  }
};

// 6. PUT - Update Existing records found during Excel upload
export const updateExistingFaculties = async (req, res) => {
  try {
    const { students: faculties } = req.body; // Matches frontend 'students' key

    if (!Array.isArray(faculties) || !faculties.length) {
      return res.status(400).json({ message: "No faculty data provided" });
    }

    let updatedCount = 0;
    for (const faculty of faculties) {
      if (!faculty.email) continue;

      const result = await Faculty.updateOne(
        { email: faculty.email.trim() },
        { $set: { name: faculty.name } },
        { runValidators: false }
      );

      if (result.modifiedCount > 0) updatedCount++;
    }

    return res.status(200).json({
      message: "Update completed",
      updatedCount,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update existing faculty" });
  }
};