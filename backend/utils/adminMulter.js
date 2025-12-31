// for excelUpload
import multer from "multer";
import bcrypt from "bcrypt";

// utils/generatePassword.js
import crypto from "crypto";
const storage = multer.memoryStorage();

export const generateRandomPassword = () => {
  return crypto.randomBytes(6).toString("hex"); // 12 chars
};

export const uploadExcel = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files allowed"), false);
    }
  },
});

// utils/normalizeStudent.js
export const normalizeStudent = async (row) => {
  const requiredFields = [
    "rollno",
    "name",
    "email",
    "department",
    "course",
    "batch",
    "gender",
    "category",
    "cgpa",
  ];

  for (const field of requiredFields) {
    if (
      row[field] === undefined ||
      row[field] === null ||
      String(row[field]).trim() === ""
    ) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  const rawPassword = generateRandomPassword();
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  return {
    name: row.name,
    email: row.email,
    password: hashedPassword,
    department: row.department,
    course: row.course,
    gender: row.gender,
    category: row.category,
    rollno: String(row.rollno).trim(),
    cgpa: String(row.cgpa).trim(),
    batch: String(row.batch).trim(),
    // Optional → defaulted
    Xth: row.Xth || "",
    XIIth: row.XIIth || "",
    linkedin: row.linkedin || "",
    address: row.address || "",
    personalEmail: row.personalEmail || "",
    phone: row.phone || "",

    placementstatus: row.placementstatus || "Not Placed",
    internshipstatus: row.internshipstatus || "No Intern",

    isInterested: false,
    debarred: false,
    account_deactivate: false,
  };
};
