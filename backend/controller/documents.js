import Document from '../models/documents.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises'; // For async file operations
import { existsSync, mkdirSync } from 'fs'; // Import synchronous methods

// Ensure the uploads/documents directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
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

// Get all documents
export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find();
    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching documents',
      error: error.message,
    });
  }
};

// Add new document with file upload
export const addDocument = [
  upload.single('document_file'),
  async (req, res) => {
    try {
      const { document_name} = req.body;

      // Validate required fields
      if (!document_name || !req.file) {
        return res.status(400).json({
          success: false,
          message: 'All fields and PDF file are required',
        });
      }

      const document_link = `/uploads/documents/${req.file.filename}`;
      console.log('Saving file to:', path.join(uploadDir, req.file.filename)); // Debug log

      const newDocument = await Document.create({
        document_name,
        document_link,
      });

      res.status(201).json({
        success: true,
        data: newDocument,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error creating document',
        error: error.message,
      });
    }
  },
];

// Update existing document
export const updateDocument = [
  upload.single('document_file'),
  async (req, res) => {
    try {
      const documentId = req.params.id;
      const { document_name, document_link } = req.body;
      const updateData = { document_name, document_link };

      // Find the existing document
      const existingDocument = await Document.findById(documentId);
      if (!existingDocument) {
        return res.status(404).json({
          success: false,
          message: 'Document not found',
        });
      }

      // If a new file is uploaded, delete the old file and update document_link
      if (req.file) {
        if (existingDocument.document_link) {
          const oldFilePath = path.join(process.cwd(), existingDocument.document_link.slice(1));
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
        updateData.document_link = `/uploads/documents/${req.file.filename}`;
        console.log('Updating file to:', path.join(uploadDir, req.file.filename));
      }

      const updatedDocument = await Document.findByIdAndUpdate(
        documentId,
        updateData,
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        data: updatedDocument,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error updating document',
        error: error.message,
      });
    }
  },
];

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const { documentIds } = req.body;

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No document IDs provided',
      });
    }

    // Delete files from storage
    const documents = await Document.find({ _id: { $in: documentIds } });
    for (const document of documents) {
      if (document.document_link) {
        const filePath = path.join(process.cwd(), document.document_link.slice(1));
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

    const result = await Document.deleteMany({ _id: { $in: documentIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} document(s) deleted successfully`,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error deleting documents',
      error: error.message,
    });
  }
};
