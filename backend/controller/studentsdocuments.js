import StudentDocument from '../models/studentsdocuments.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises'; // For async file operations
import { existsSync, mkdirSync } from 'fs'; // Import synchronous methods

// Ensure the uploads/student-documents directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'student-documents');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to allow only PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

// Get all student documents
export const getStudentDocuments = async (req, res) => {
  try {
    const studentDocuments = await StudentDocument.find();
    res.status(200).json({
      success: true,
      data: studentDocuments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student documents',
      error: error.message,
    });
  }
};

// Add new student document with file upload
export const addStudentDocument = [
  upload.single('document_file'),
  async (req, res) => {
    try {
      const { document_name } = req.body;

      // Validate required fields
      if (!document_name || !req.file) {
        return res.status(400).json({
          success: false,
          message: 'All fields and PDF file are required',
        });
      }

      const document_link = `/uploads/student-documents/${req.file.filename}`;
      console.log('Saving file to:', path.join(uploadDir, req.file.filename)); // Debug log

      const newStudentDocument = await StudentDocument.create({
        document_name,
        document_link,
      });

      res.status(201).json({
        success: true,
        data: newStudentDocument,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error creating student document',
        error: error.message,
      });
    }
  },
];

// Update existing student document
export const updateStudentDocument = [
  upload.single('document_file'),
  async (req, res) => {
    try {
      const documentId = req.params.id;
      const { document_name, document_link } = req.body;
      const updateData = { document_name, document_link };

      // Find the existing student document
      const existingStudentDocument = await StudentDocument.findById(documentId);
      if (!existingStudentDocument) {
        return res.status(404).json({
          success: false,
          message: 'Student document not found',
        });
      }

      // If a new file is uploaded, delete the old file and update document_link
      if (req.file) {
        if (existingStudentDocument.document_link) {
          const oldFilePath = path.join(process.cwd(), existingStudentDocument.document_link.slice(1));
          try {
            await fs.access(oldFilePath);
            await fs.unlink(oldFilePath);
            console.log(`Deleted old file: ${oldFilePath}`);
          } catch (err) {
            if (err.code === 'ENOENT') {
              console.warn(`Old file not found, skipping deletion: ${oldFilePath}`);
            } else {
              console.error(`Error deleting old file ${oldFilePath}:`, err);
            }
          }
        }
        updateData.document_link = `/uploads/student-documents/${req.file.filename}`;
        console.log('Updating file to:', path.join(uploadDir, req.file.filename));
      }

      const updatedStudentDocument = await StudentDocument.findByIdAndUpdate(
        documentId,
        updateData,
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        data: updatedStudentDocument,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error updating student document',
        error: error.message,
      });
    }
  },
];

// Delete student document(s)
export const deleteStudentDocument = async (req, res) => {
  try {
    const { documentIds } = req.body;

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No document IDs provided',
      });
    }

    // Delete files from storage
    const studentDocuments = await StudentDocument.find({ _id: { $in: documentIds } });
    for (const doc of studentDocuments) {
      if (doc.document_link) {
        const filePath = path.join(process.cwd(), doc.document_link.slice(1));
        try {
          await fs.access(filePath);
          await fs.unlink(filePath);
          console.log(`Deleted file: ${filePath}`);
        } catch (err) {
          if (err.code === 'ENOENT') {
            console.warn(`File not found, skipping deletion: ${filePath}`);
          } else {
            console.error(`Error deleting file ${filePath}:`, err);
          }
        }
      }
    }

    const result = await StudentDocument.deleteMany({ _id: { $in: documentIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} student document(s) deleted successfully`,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error deleting student documents',
      error: error.message,
    });
  }
};
