import express from 'express';
const router = express.Router();
import { restrictTo } from '../utils/restrict.js';
import {sprofile,updatesProfile,handlesProfilePhoto,changepass} from '../controller/profile.js';
import Student from '../models/user_model/student.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.join(__dirname, '..');
const uploadsDir = path.join(baseDir, 'uploads','profile');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: async function (req, file, cb) {
        try {
            const student = await Student.findOne({ _id: req.user.userId });
            if (!student || !student.rollno) {
                return cb(new Error('Student or roll number not found'));
            }
           console.log("student info",student);
            const rollNo = student.rollno;
            const baseFilename = `${rollNo}_profilepic`;
            const newFilename = `${baseFilename}${path.extname(file.originalname)}`;
            const filePath = path.join(uploadsDir, newFilename);
            const existingFiles = fs.readdirSync(uploadsDir).filter(file => 
                file.startsWith(baseFilename)
            );
            for (const oldFile of existingFiles) {
                fs.unlinkSync(path.join(uploadsDir, oldFile));
            }
            cb(null, newFilename);
        } catch (error) {
            cb(error);
        }
    }
});
const upload = multer({ storage: storage });


router.get('/get',restrictTo('Student'), sprofile);
router.put('/update',restrictTo('Student'),updatesProfile);
router.post('/change-pass',restrictTo('Student'),changepass);
router.put('/update-picture',restrictTo('Student','Professor'), upload.single("file"),handlesProfilePhoto);

export default router;