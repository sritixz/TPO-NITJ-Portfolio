import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import useragent from 'express-useragent';
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { restrictTo } from "./utils/restrict.js";
import { checkAuth } from "./controller/checkauth.js";
import {logMiddleware} from "./utils/logs.js";

import authroutes from "./routes/auth.js";
import interviewroutes from "./routes/interview.js";
import oaroutes from "./routes/oa.js";
import gdroutes from "./routes/gd.js";
import profileroutes from "./routes/profile.js";
import devteamroutes from "./routes/devteam.js";
import jobprofileroutes from "./routes/jobprofile.js";
import formTemplateroutes from "./routes/formTemplate.js";
import sharedexperienceroutes from "./routes/sharedexperience.js";
import placementroutes from "./routes/placement.js";
import internshiptroutes from "./routes/internship.js";
import reqhelproutes from "./routes/reqhelp.js";
import jobEventroutes from "./routes/jobEvents.js"
import feedbackRoutes from "./routes/feedbackRoutes.js";
import jafRoutes from "./routes/jaf.js";
import travelplannerRoutes from "./routes/travelplanner.js";
import studentanalysisRoutes from "./routes/studentanalysis.js";
import companiesanalysisRoutes from "./routes/companiesanalysis.js";
import contactusRoutes from "./routes/contactus.js";
import conversationRoutes from "./routes/conversation.js";
import pplacementReportroutes from "./routes/pplacementReportRoute.js";
import otherRoutes from "./routes/other.js";
import notificationRoutes from "./routes/notification.js";
import nodemailerRoutes from "./routes/nodemailer.js";
import adminRoutes from "./routes/admin.js";
import captchaRoutes from "./routes/captcha.js";
import addRecruiterRoutes from "./routes/addrecruiter.js";
import questionbankRoutes from "./routes/questionbank.js";
import brochureRoutes from "./routes/Brochure.js";
import nocRoutes from "./routes/noc.js";
import eventRoutes from "./routes/Event.js";
import cgpaCheckerRoutes from "./routes/cgpaChecker.js";
import withdrawRoutes from "./routes/withdraw.js";
import placementRegistrationRoutes from "./routes/placement-registration.js";

import { mkdir } from 'fs/promises';
try {
  await mkdir('uploads/pdfs', { recursive: true });
} catch (err) {
  console.error('Error creating uploads directory:', err);
}

const app = express();

dotenv.config();

app.use(cors({credentials: true, origin: process.env.CLIENT_URL}));
app.set('trust proxy', true);
app.use(useragent.express());
app.use(cookieParser());
// app.use(express.json());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));



const authenticate = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    }
    catch (err) {
      return res.status(401).json({ message: 'Invalid or Expired token' });
    }
  };



mongoose.connect(process.env.MONGO_URI)
.then(()=>{
 console.log("Connected to MongoDB");
})
.catch((err)=>{
 console.error("Error connecting to MongoDB:", err);
})


app.get('/check-auth', authenticate, checkAuth );


app.use('/uploads', express.static('uploads'));

// app.use(logMiddleware);

//Public routes
app.use('/auth', logMiddleware, authroutes);
app.use('/captcha', logMiddleware, captchaRoutes);
app.use('/devteam', logMiddleware, devteamroutes);
app.use('/brochure', logMiddleware, brochureRoutes);
app.use("/placements", logMiddleware, placementroutes);
app.use("/internships", logMiddleware, internshiptroutes);

//Student routes
app.use('/interview',authenticate, restrictTo('Student'),logMiddleware, interviewroutes);
app.use('/oa',authenticate, restrictTo('Student'),logMiddleware, oaroutes);
app.use('/gd',authenticate, restrictTo('Student'), logMiddleware, gdroutes);
app.use('/others',authenticate, restrictTo('Student'),logMiddleware, otherRoutes);
app.use('/question-bank', authenticate,restrictTo('Student'),logMiddleware, questionbankRoutes);
app.use('/withdraw',authenticate, restrictTo('Student'),logMiddleware, withdrawRoutes);

//Professor routes
app.use('/pplacementReport',authenticate, restrictTo('Professor'),logMiddleware, pplacementReportroutes);
app.use("/student-analysis",authenticate, restrictTo('Professor'),logMiddleware, studentanalysisRoutes);
app.use("/companies-analysis",authenticate,restrictTo('Professor'),logMiddleware, companiesanalysisRoutes);
app.use('/conversations',authenticate, restrictTo('Professor'),logMiddleware, conversationRoutes);
app.use('/nodemailer',authenticate, restrictTo('Professor'),logMiddleware, nodemailerRoutes);
app.use('/add-recruiter', authenticate,restrictTo('Professor'),logMiddleware, addRecruiterRoutes);
app.use('/cgpa-checker',authenticate, restrictTo('Professor'),logMiddleware, cgpaCheckerRoutes);

//Admin routes
app.use('/admin',authenticate,restrictTo('Admin'),logMiddleware,adminRoutes);

//Protected inside routes
app.use('/jobprofile',authenticate,logMiddleware,jobprofileroutes);
app.use("/feedback",authenticate,logMiddleware,feedbackRoutes);
app.use('/sharedexperience',authenticate,logMiddleware,sharedexperienceroutes);
app.use("/jaf",authenticate,logMiddleware,jafRoutes);
app.use('/profile',authenticate,logMiddleware, profileroutes);
app.use("/reqhelp",authenticate, logMiddleware,reqhelproutes);
app.use('/contactus',logMiddleware,contactusRoutes);
app.use('/api',authenticate,logMiddleware, formTemplateroutes);
app.use('/noc',authenticate, logMiddleware,nocRoutes);
app.use('/admin/brochure',authenticate, logMiddleware,brochureRoutes);
app.use("/job-events",authenticate, logMiddleware, jobEventroutes);
app.use("/travel-planner",authenticate, logMiddleware,travelplannerRoutes);
app.use("/placement-registration",authenticate, logMiddleware, placementRegistrationRoutes);

//mix routes
app.use('/notification',authenticate,restrictTo('Student','Professor'),logMiddleware,notificationRoutes);
app.use('/events',authenticate,restrictTo('Professor','Department','Admin'),logMiddleware,eventRoutes);


// app.use('/api/pdfs', authenticate, pdfroutes);
// app.use('/resume',authenticate, resumeroutes);

// app.use('/mock-assessment',authenticate,mockassessmentRoutes);
// app.use('/attempt/:assessment',authenticate,mockassessmentRoutes);

const port = process.env.PORT || 7000;
app.listen(port,'0.0.0.0', () => {
  console.log("App running on port: ", port);
});