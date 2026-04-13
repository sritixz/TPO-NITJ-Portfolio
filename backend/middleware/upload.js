import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/sop/",
  filename: (req, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files allowed"), false);
};

export const uploadSOP = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});