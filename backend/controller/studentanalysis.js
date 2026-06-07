import Student from "../models/user_model/student.js";
import JobProfile from "../models/jobprofile.js";
import OfferTracker from "../models/offertracker.js";
import SummerInternTracker from "../models/summer_intern_tracker.js";
import mongoose from "mongoose";
import axios from "axios";
import { encryptValue, decryptValue } from "../utils/security.js";
import SummerIntern from "../models/summer_internship.js";
import Offer from "../models/offer.js";

const normalize = (v) =>
  String(v || "")
    .trim()
    .toUpperCase();

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export const getStudentAnalytics = async (req, res) => {
  try {
    const {
      department,
      course,
      batch,
      cgpa,
      gender,
      rollno,
      debarred,
      active_backlogs,
      backlogs_history,
      name,
      placementstatus,
      category,
      internshipstatus,
    } = req.query;

    const filter = {};

    if (department && department !== "All") filter.department = department;
    if (course && course !== "All") filter.course = course;
    if (batch && batch !== "All") filter.batch = batch;
    if (cgpa && cgpa !== "All")
      filter.cgpa = { $gt: parseFloat(cgpa.replace("> ", "")) };
    if (gender && gender !== "All") filter.gender = gender;
    if (debarred && debarred !== "All") filter.debarred = debarred === "true";
    if (active_backlogs && active_backlogs !== "All")
      filter.active_backlogs = active_backlogs === "true";
    if (backlogs_history && backlogs_history !== "All")
      filter.backlogs_history = backlogs_history === "true";
    if (rollno) filter.rollno = { $regex: rollno, $options: "i" };
    if (name) filter.name = { $regex: name, $options: "i" };
    if (placementstatus && placementstatus !== "All")
      filter.placementstatus = placementstatus;
    if (category && category !== "All") filter.category = category;
    if (internshipstatus && internshipstatus !== "All")
      filter.internshipstatus = internshipstatus;

    const students = await Student.find(filter);
    const jobProfiles = await JobProfile.find();

    // const rollNumbers = students.map(s => s.rollno);
    // const erpDataMap = new Map();

    // // Batch size for ERP calls — you can tune this as needed
    // const BATCH_SIZE = 100;
    // const batches = chunkArray(rollNumbers, BATCH_SIZE);

    // // try {
    // //   // Option 1: Sequential fetching (safer)
    // //   for (const batch of batches) {
    // //     const payload = { rollNumbers: batch, portalKey: process.env.ERP_IDENTITY_SECRET };
    // //     const encrypted = encryptValue(JSON.stringify(payload));
    // //     const response = await axios.post(
    // //       process.env.ERP_SERVER,
    // //       encrypted,
    // //       { timeout: 20000 }  // 20 seconds per batch
    // //     );
    // //     const erpStudents = JSON.parse(decryptValue(response.data.data)) || [];
    // //     erpStudents.forEach(es => {
    // //       erpDataMap.set(es.rollno, {
    // //         ...es,
    // //         active_backlogs: es.active_backlogs === 'true',
    // //         backlogs_history: es.backlogs_history === 'true',
    // //         activeBacklogCount: es.activeBacklogCount
    // //       });
    // //     });
    // //   }

    //   // Option 2: Parallel fetching with concurrency limit
    //   // Uncomment this block if ERP can handle multiple requests at once

    //   const CONCURRENCY = 5;
    //   const executing = new Set();
    //   const enqueue = async (batch) => {
    //     const payload = { rollNumbers: batch, portalKey: process.env.ERP_IDENTITY_SECRET };
    //     const encrypted = encryptValue(JSON.stringify(payload));
    //     const p = axios.post(process.env.ERP_SERVER, encrypted, { timeout: 20000 })
    //       .then(resp => {
    //         const erpStudents = JSON.parse(decryptValue(resp.data.data)) || [];
    //         erpStudents.forEach(es => {
    //           erpDataMap.set(es.rollno, {
    //             ...es,
    //             active_backlogs: es.active_backlogs === 'true',
    //             backlogs_history: es.backlogs_history === 'true',
    //             activeBacklogCount: es.activeBacklogCount
    //           });
    //         });
    //       })
    //       .catch(err => {
    //         console.error("ERP batch error:", err.message);
    //       })
    //       .finally(() => executing.delete(p));
    //     executing.add(p);
    //     if (executing.size >= CONCURRENCY) {
    //       await Promise.race(executing);
    //     }
    //   };

    //   for (const batch of batches) {
    //     await enqueue(batch);
    //   }
    //   await Promise.all(executing);

    // } catch (erpErr) {
    //   console.error("Error fetching ERP data:", erpErr.message);
    //   // Proceed without ERP data
    // }

    const rollNumbers = students.map((s) => normalize(s.rollno));
    const erpDataMap = new Map();

    // Safer for prod
    const BATCH_SIZE = 50;
    const CONCURRENCY = process.env.NODE_ENV === "production" ? 1 : 5;

    const batches = chunkArray(rollNumbers, BATCH_SIZE);
    const executing = new Set();

    const enqueue = async (batch) => {
      const payload = {
        rollNumbers: batch,
        portalKey: process.env.ERP_IDENTITY_SECRET,
      };

      const encrypted = encryptValue(JSON.stringify(payload));

      const p = axios
        .post(process.env.ERP_SERVER, encrypted, {
          timeout: 40000, // increased timeout
        })
        .then((resp) => {
          const decrypted = decryptValue(resp.data.data);
          const erpStudents = JSON.parse(decrypted) || [];

          erpStudents.forEach((es) => {
            erpDataMap.set(normalize(es.rollno), {
              ...es,
              cgpa: Number(es.cgpa) || 0,
              active_backlogs: es.active_backlogs === "true",
              backlogs_history: es.backlogs_history === "true",
              activeBacklogCount: Number(es.activeBacklogCount) || 0,
            });
          });
        })
        .catch((err) => {
          console.error(
            "❌ ERP batch failed:",
            err.response?.status,
            err.message,
          );
        })
        .finally(() => executing.delete(p));

      executing.add(p);

      if (executing.size >= CONCURRENCY) {
        await Promise.race(executing);
      }
    };

    for (const batch of batches) {
      await enqueue(batch);
    }

    await Promise.all(executing);

    console.log(
      ` ERP fetch done. Received ${erpDataMap.size}/${rollNumbers.length}`,
    );

    const studentsAnalytics = await Promise.all(
      students.map(async (student) => {
        try {
          const erpData = erpDataMap.get(normalize(student.rollno));
          const courseDurations = {
            "B.Tech": 4,
            "M.Tech": 2,
            "B.Sc.-B.Ed.": 4,
            MBA: 2,
            "M.Sc.": 2,
          };
          const adjustment = courseDurations[student.course] || 0;

          let adjustedBatch = student.batch;
          if (erpData?.batch && !isNaN(Number(erpData.batch))) {
            adjustedBatch = String(Number(erpData.batch) + adjustment);
          }

          const offers = await OfferTracker.findOne({ studentId: student._id });

          const offersWithCompany = await Promise.all(
            offers.offer.map(async (o) => {
              const offerDoc = await Offer.findOne({
                shortlisted_students: {
                  $elemMatch: {
                    studentId: student._id,
                    job_type: o.offer_type,
                    ctc: o.offer_ctc,
                  },
                },
              }).select("company_name");

              return {
                ...o.toObject(),
                company_name: offerDoc?.company_name || "Unknown",
              };
            }),
          );

          const data = {
            _id: student._id,
            name: student.name || "",
            email: student.email || "",
            phone: student.phone || "",
            rollno: student.rollno || "",
            department: student.department || "",
            course: student.course || "",
            batch: adjustedBatch,
            gender: student.gender || "",
            category: student.category || "",
            cgpa: Number(erpData?.cgpa ?? student.cgpa ?? 0),
            disability: student.disability || false,
            placementstatus: student.placementstatus || "Not Placed",
            internshipstatus: student.internshipstatus || "No Intern",
            debarred: student.debarred ?? false,
            image: student.image || "",
            active_backlogs:
              erpData?.active_backlogs ?? student.active_backlogs ?? false,
            backlogs_history:
              erpData?.backlogs_history ?? student.backlogs_history ?? false,
            activeBacklogCount:
              erpData?.activeBacklogCount ?? student.activeBacklogCount ?? 0,
            Xth: student.Xth || "",
            XIIth: student.XIIth || "",
            dob: student.dob || "",
            personalEmail: student.personalEmail || "",
            linkedin: student.linkedin || "",
            address: student.address || "",
            offers: offers?.offer || [],
            offersWithCompany: offersWithCompany,
            isInterested: student.isInterested || false,
            applications: { total: 0, jobProfiles: [] },
            assessments: {
              resumeshortlisting: { total: 0, shortlisted: 0, rejected: 0 },
              oa: { total: 0, shortlisted: 0, rejected: 0, absent: 0 },
              interview: { total: 0, shortlisted: 0, rejected: 0, absent: 0 },
              gd: { total: 0, shortlisted: 0, rejected: 0, absent: 0 },
              others: { total: 0, shortlisted: 0, rejected: 0, absent: 0 },
            },
          };

          for (const job of jobProfiles) {
            const hasApplied = job.Applied_Students?.includes(student._id);
            if (hasApplied) {
              data.applications.total += 1;
              data.applications.jobProfiles.push({
                job_id: job.job_id || "",
                company_name: job.company_name || "",
                job_role: job.job_role || "",
                job_type: job.job_type || "",
                job_class: job.job_class || "",
              });
            }

            job.Hiring_Workflow?.forEach((step) => {
              const type = (step.step_type || "others")
                .toLowerCase()
                .replace(/\s+/g, "");
              if (step.eligible_students?.includes(student._id)) {
                const as = data.assessments[type] || data.assessments.others;
                as.total++;
                if (step.shortlisted_students?.includes(student._id)) {
                  as.shortlisted++;
                } else if (step.absent_students?.includes(student._id)) {
                  as.absent++;
                } else {
                  as.rejected++;
                }
              }
            });
          }

          Object.values(data.assessments).forEach((as) => {
            if (as.total > 0) {
              as.successRate =
                ((as.shortlisted / as.total) * 100).toFixed(2) + "%";
            }
          });

          return data;
        } catch (err) {
          console.error(
            `Error processing student ${student.rollno}:`,
            err.message,
          );
          return {
            _id: student._id,
            rollno: student.rollno,
            name: student.name || "Unknown",
            error: err.message,
          };
        }
      }),
    );

    return res.status(200).json({
      success: true,
      message: "Student analytics retrieved successfully",
      data: studentsAnalytics,
      summary: {
        totalStudents: students.length,
        placementStatus: {
          notPlaced: students.filter((s) => s.placementstatus === "Not Placed")
            .length,
          belowDream: students.filter(
            (s) => s.placementstatus === "Below Dream",
          ).length,
          dream: students.filter((s) => s.placementstatus === "Dream").length,
          superDream: students.filter(
            (s) => s.placementstatus === "Super Dream",
          ).length,
        },
      },
    });
  } catch (error) {
    console.error("Error in getStudentAnalytics:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving student analytics",
      error: error.message,
    });
  }
};
// export const getStudentAnalytics = async (req, res) => {
//     try {
//         // Extract filter query parameters
//         const {
//             department,
//             course,
//             batch,
//             cgpa,
//             gender,
//             rollno,
//             debarred,
//             active_backlogs,
//             backlogs_history,
//             name,
//             placementstatus,
//             category,
//             internshipstatus
//         } = req.query;

//         // console.log('Query parameters:', req.query);

//         // Build the filter object for MongoDB query
//         const filter = {};

//         if (department && department !== 'All') {
//             filter.department = department;
//         }
//         if (course && course !== 'All') {
//             filter.course = course;
//         }
//         if (batch && batch !== 'All') {
//             filter.batch = batch;
//         }
//         if (cgpa && cgpa !== 'All') {
//             filter.cgpa = { $gt: parseFloat(cgpa.replace('> ', '')) };
//         }
//         if (gender && gender !== 'All') {
//             filter.gender = gender;
//         }
//         if (debarred && debarred !== 'All') {
//             filter.debarred = debarred === 'true';
//         }
//         if (active_backlogs && active_backlogs !== 'All') {
//             filter.active_backlogs = active_backlogs === 'true';
//         }
//         if (backlogs_history && backlogs_history !== 'All') {
//             filter.backlogs_history = backlogs_history === 'true';
//         }
//         if (rollno) {
//             filter.rollno = { $regex: rollno, $options: 'i' }; // Case-insensitive partial match
//         }
//         if (name) {
//             filter.name = { $regex: name, $options: 'i' }; // Case-insensitive partial match
//         }
//         if (placementstatus && placementstatus !== 'All') {
//             filter.placementstatus = placementstatus;
//         }
//         if (category && category !== 'All') {
//             filter.category = category;
//         }
//         if (internshipstatus && internshipstatus !== 'All') {
//             filter.internshipstatus = internshipstatus;
//         }

//         // Fetch students with applied filters
//         const students = await Student.find(filter);

//         const jobProfiles = await JobProfile.find();

//         const rollNumbers = students.map(student => student.rollno);
//         console.log(rollNumbers);
//         let erpDataMap = new Map();
//          const payload = {rollNumbers, portalKey: process.env.ERP_IDENTITY_SECRET};
//          const encryptedData = encryptValue(JSON.stringify(payload));
//         // Attempt to fetch ERP data, but continue even if it fails
//         try {
//             const response = await axios.post(`${process.env.ERP_SERVER}`, encryptedData);
//             const erpStudents = JSON.parse(decryptValue(response.data.data))|| [];
//             console.log(erpStudents);
//             erpStudents.forEach(erpStudent => {
//                 erpDataMap.set(erpStudent.rollno, {
//                     ...erpStudent,
//                     batch: erpStudent.batch,
//                     active_backlogs: erpStudent.active_backlogs === 'true',
//                     backlogs_history: erpStudent.backlogs_history === 'true',
//                     activeBacklogCount: erpStudent.activeBacklogCount
//                 });
//             });
//         } catch (error) {
//             console.error("Error fetching ERP data:", error.message);
//             // Continue without ERP data, relying on database
//         }

//         const studentsAnalytics = await Promise.all(
//             students.map(async (student) => {
//                 try {
//                     const erpData = erpDataMap.get(student.rollno);
//                     const course = student.course;
//                     const courseDurations = {
//                         "B.Tech": 4,
//                         "M.Tech": 2,
//                         "B.Sc.-B.Ed.": 4,
//                         "MBA": 2,
//                         "M.Sc.": 2
//                     };
//                     const adjustment = courseDurations[course] || 0;
//                     let adjustedBatch = student.batch;
//                     if (erpData && erpData.batch && !isNaN(Number(erpData.batch))) {
//                         adjustedBatch = String(Number(erpData.batch) + adjustment);
//                     }

//                     const offers = await OfferTracker.findOne({ studentId: student._id });

//                     const studentData = {
//                         _id: student._id,
//                         name: student.name || '',
//                         email: student.email || '',
//                         phone: student.phone || '',
//                         rollno: student.rollno || '',
//                         department: student.department || '',
//                         course: student.course || '',
//                         batch: adjustedBatch,
//                         gender: student.gender || '',
//                         category: student.category || '',
//                         cgpa: erpData?.cgpa ?? student.cgpa ?? 0,
//                         disability: student.disability || false,
//                         placementstatus: student.placementstatus || 'Not Placed',
//                         internshipstatus: student.internshipstatus || 'No Intern',
//                         debarred: student.debarred ?? false,
//                         image: student.image || '',
//                         active_backlogs: erpData?.active_backlogs ?? student.active_backlogs ?? false,
//                         backlogs_history: erpData?.backlogs_history ?? student.backlogs_history ?? false,
//                         activeBacklogCount: erpData?.activeBacklogCount ?? student.activeBacklogCount ?? 0,
//                         Xth:student.Xth || '',
//                         XIIth:student.XIIth || '',
//                         dob: student.dob || '',
//                         personalEmail: student.personalEmail || '',
//                         linkedin: student.linkedin || '',
//                         address: student.address || '',
//                         offers:  offers? offers?.offer : [],
//                         isInterested: student.isInterested || false,
//                         applications: {
//                             total: 0,
//                             jobProfiles: []
//                         },
//                         assessments: {
//                             resumeshortlisting: {
//                                 total: 0,
//                                 shortlisted: 0,
//                                 rejected: 0
//                             },
//                             oa: {
//                                 total: 0,
//                                 shortlisted: 0,
//                                 rejected: 0,
//                                 absent: 0
//                             },
//                             interview: {
//                                 total: 0,
//                                 shortlisted: 0,
//                                 rejected: 0,
//                                 absent: 0
//                             },
//                             gd: {
//                                 total: 0,
//                                 shortlisted: 0,
//                                 rejected: 0,
//                                 absent: 0
//                             },
//                             others: {
//                                 total: 0,
//                                 shortlisted: 0,
//                                 rejected: 0,
//                                 absent: 0
//                             }
//                         }
//                     };

//                     for (const job of jobProfiles) {
//                         const hasApplied = job.Applied_Students?.includes(student._id) || false;
//                         if (hasApplied) {
//                             studentData.applications.total++;
//                             studentData.applications.jobProfiles.push({
//                                 job_id: job.job_id || '',
//                                 company_name: job.company_name || '',
//                                 job_role: job.job_role || '',
//                                 job_type: job.job_type || '',
//                                 job_class: job.job_class || ''
//                             });
//                         }
//                         job.Hiring_Workflow?.forEach(step => {
//                             const assessmentType = step.step_type?.toLowerCase().replace(/\s+/g, '') || 'others';
//                             if (step.eligible_students?.includes(student._id)) {
//                                 studentData.assessments[assessmentType].total++;
//                                 if (step.shortlisted_students?.includes(student._id)) {
//                                     studentData.assessments[assessmentType].shortlisted++;
//                                 } else if (step.absent_students?.includes(student._id)) {
//                                     studentData.assessments[assessmentType].absent++;
//                                 } else {
//                                     studentData.assessments[assessmentType].rejected++;
//                                 }
//                             }
//                         });
//                     }

//                     Object.keys(studentData.assessments).forEach(assessmentType => {
//                         const assessment = studentData.assessments[assessmentType];
//                         if (assessment.total > 0) {
//                             assessment.successRate = ((assessment.shortlisted / assessment.total) * 100).toFixed(2) + '%';
//                         }
//                     });

//                     return studentData;
//                 } catch (error) {
//                     console.error(`Error processing student ${student.rollno}:`, error.message);
//                     // Return a minimal student object to avoid failing the entire Promise.all
//                     return {
//                         _id: student._id,
//                         rollno: student.rollno || '',
//                         name: student.name || 'Unknown',
//                         error: `Failed to process: ${error.message}`
//                     };
//                 }
//             })
//         );

//         console.log(`Processed ${studentsAnalytics.length} students`);

//         return res.status(200).json({
//             success: true,
//             message: "Student analytics retrieved successfully",
//             data: studentsAnalytics,
//             summary: {
//                 totalStudents: students.length,
//                 placementStatus: {
//                     notPlaced: students.filter(s => s.placementstatus === 'Not Placed').length,
//                     belowDream: students.filter(s => s.placementstatus === 'Below Dream').length,
//                     dream: students.filter(s => s.placementstatus === 'Dream').length,
//                     superDream: students.filter(s => s.placementstatus === 'Super Dream').length
//                 }
//             }
//         });

//     } catch (error) {
//         console.error('Error in getStudentAnalytics:', error);
//         return res.status(500).json({
//             success: false,
//             message: "Error retrieving student analytics",
//             error: error.message
//         });
//     }
// };

export const Studentprofileupdate = async (req, res) => {
  try {
    const userId = req.params.id;
    const editedStudent = req.body;
    const {
      name,
      rollno,
      email,
      phone,
      department,
      batch,
      course,
      debarred,
      cgpa,
      gender,
      placementstatus,
      active_backlogs,
      backlogs_history,
    } = editedStudent;
    const student = await Student.findById(userId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (name != "") student.name = name;
    if (rollno != "") student.rollno = rollno;
    if (email != "") student.email = email;
    if (phone != "") student.phone = phone;
    if (department != "") student.department = department;
    if (batch != "") student.batch = batch;
    if (course != "") student.course = course;
    if (cgpa != "") student.cgpa = cgpa;
    if (gender != "") student.gender = gender;
    student.debarred = debarred;
    if (placementstatus != "") student.placementstatus = placementstatus;
    if (active_backlogs != "") student.active_backlogs = active_backlogs;
    if (backlogs_history != "") student.backlogs_history = backlogs_history;
    await student.save();
    console.log("Student profile updated successfully:", student);
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateOfferTracker = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { offer } = req.body;

    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Validate offer data
    if (!Array.isArray(offer)) {
      return res.status(400).json({ message: "Offer must be an array" });
    }

    const validOfferTypes = ["Intern", "Intern+PPO", "Intern+FTE", "FTE"];
    // const validCategories = ['Not Considered', 'Below Dream', 'Dream', 'Super Dream'];
    const validSectors = ["PSU", "Private"];

    for (const offerItem of offer) {
      if (!validOfferTypes.includes(offerItem.offer_type)) {
        return res
          .status(400)
          .json({ message: `Invalid offer type: ${offerItem.offer_type}` });
      }
      //   if (!validCategories.includes(offerItem.offer_category)) {
      //     return res.status(400).json({ message: `Invalid offer category: ${offerItem.offer_category}` });
      //   }
      if (!validSectors.includes(offerItem.offer_sector)) {
        return res
          .status(400)
          .json({ message: `Invalid offer sector: ${offerItem.offer_sector}` });
      }
      console.log(offerItem.jobId);
      if (
        offerItem.jobId &&
        !mongoose.Types.ObjectId.isValid(offerItem.jobId)
      ) {
        return res
          .status(400)
          .json({ message: `Invalid jobId: ${offerItem.jobId}` });
      }
      // Validate jobId exists
      if (offer.jobId) {
        const job = await JobProfile.findById(offerItem.jobId);
        if (!job) {
          return res.status(404).json({
            message: `Job profile not found for jobId: ${offerItem.jobId}`,
          });
        }
      }
    }

    // Update or create offer tracker
    let offerTracker = await OfferTracker.findOne({ studentId });

    if (offerTracker) {
      offerTracker.offer = offer;
      await offerTracker.save();
    } else {
      offerTracker = await OfferTracker.create({
        studentId,
        offer,
      });
    }

    res.status(200).json({
      message: "Offer tracker updated successfully",
      data: offerTracker,
    });
  } catch (error) {
    console.error("Error updating offer tracker:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateSummerInternTracker = async (req, res) => {
  try {
    const { batch, course, studentsId } = req.body;

    // Validate input
    if (!batch || !course || !Array.isArray(studentsId)) {
      return res
        .status(400)
        .json({ message: "Batch, course, and studentsId array are required" });
    }

    // Validate students exist
    for (const studentId of studentsId) {
      const student = await Student.findById(studentId);
      if (!student) {
        return res
          .status(404)
          .json({ message: `Student not found: ${studentId}` });
      }
      if (student.batch !== batch || student.course !== course) {
        return res.status(400).json({
          message: `Student ${studentId} does not match batch or course`,
        });
      }
    }

    // Update or create summer intern tracker
    let tracker = await SummerInternTracker.findOne({ batch, course });

    if (tracker) {
      tracker.studentsId = [...new Set([...tracker.studentsId, ...studentsId])]; // Avoid duplicates
      await tracker.save();
    } else {
      tracker = await SummerInternTracker.create({
        batch,
        course,
        studentsId,
      });
    }

    res.status(200).json({
      message: "Summer intern tracker updated successfully",
      data: tracker,
    });
  } catch (error) {
    console.error("Error updating summer intern tracker:", error);
    res.status(500).json({ message: "Server error" });
  }
};
