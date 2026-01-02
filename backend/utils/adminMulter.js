// for excelUpload
import multer from "multer";
import bcrypt from "bcrypt";

// utils/generatePassword.js
import crypto from "crypto";
const storage = multer.memoryStorage();

const generateRandomPassword = () => {
  return crypto.randomBytes(6).toString("hex"); // 12 chars
};

const COURSE_DURATION = {
  "B.Tech": 4,
  "B.Sc.-B.Ed.": 4,
  "M.Tech": 2,
  "M.Sc.": 2,
  "MBA": 2,
};

const calculateEndYear = (batch, course) => {
  const admissionYear = Number(batch);
  const duration = COURSE_DURATION[course];

  if (!Number.isFinite(admissionYear) || !duration) {
    return String(batch); // fallback (do not break upload)
  }

  return String(admissionYear + duration);
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


const yesNoToBoolean = (value) => {
  if (typeof value !== "string") return false;
  return value.trim().toLowerCase() === "yes";
};

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
  ];

  for (const field of requiredFields) {
    if (!row[field] || String(row[field]).trim() === "") {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  const rawPassword = generateRandomPassword();
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  return {
    /* ================= REQUIRED ================= */
    rollno: String(row.rollno).trim(),
    name: String(row.name).trim(),
    email: String(row.email).trim(),
    password: hashedPassword,

    department: String(row.department).trim(),
    course: String(row.course).trim(),
    batch: calculateEndYear(row.batch, row.course),
    gender: String(row.gender).trim(),
    category: String(row.category).trim(),

    /* ================= EXCEL OPTIONAL ================= */
    cgpa: row.cgpa ? String(row.cgpa).trim() : "",

    /* ================= FLAGS ================= */
    disability: yesNoToBoolean(row.disability), // FIXED

    /* ================= DEFAULT SYSTEM FIELDS ================= */
    placementstatus: "Not Placed",
    internshipstatus: "No Intern",

    isInterested: false,
    debarred: false,
    backlogs_history: false,
    active_backlogs: false,
    activeBacklogCount: "0",
    account_deactivate: false,

    image: "",
    offerLetter: "",
    otp: "",
    erpLastUpdated: null,
  };
};

