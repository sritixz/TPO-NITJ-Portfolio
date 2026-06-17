import React, { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Users, FileText, Edit, Trash2, Plus, X, Pencil, Upload } from "lucide-react";
import Select from "react-select";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import AppliedStudents from "../ProfessorDashboard/appliedstudent";
import CreateApplicationform from "../ProfessorDashboard/createapplicationform";
import ViewApplicationForm from "../ProfessorDashboard/viewapplicationform";
import EditApplicationForm from "../ProfessorDashboard/editapplicationform";
import ShortlistStudents from "../ProfessorDashboard/shortliststudent";
import ViewShortlistStudents from "../ProfessorDashboard/viewshortlistedstudent";
import InterviewLinkManager from "../ProfessorDashboard/interviewlink";
import GDLinkManager from "../ProfessorDashboard/gdlink";
import OaLinkManager from "../ProfessorDashboard/oalink";
import OthersLinkManager from "../ProfessorDashboard/otherslink";
import FinalShortlistStudents from "../ProfessorDashboard/finalshortlist";

import { FaArrowLeft } from "react-icons/fa";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// readOnly = false: full professor view (edit/approve/manage)
// readOnly = true:  faculty view (view only, no edits, no student management)
const ViewJobDetails = ({ job, onClose, oneditingAllowedUpdate, readOnly = false }) => {
  const [viewingAppliedStudents, setViewingAppliedStudents] = useState(false);
  const [applicationFormexist, setApplicationFormexist] = useState(null);
  const [selectedJobForForm, setSelectedJobForForm] = useState(null);
  const [viewingApplicationForm, setViewingApplicationForm] = useState(false);
  const [editingApplicationForm, setEditingApplicationForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingStepIndex, setEditingStepIndex] = useState(null);
  const [editedJob, setEditedJob] = useState({
    ...job,
    eligibility_criteria: job.eligibility_criteria || [],
    job_salary: { ...job.job_salary, stipend: job.job_salary?.stipend || "0" },
    job_sector: job.job_sector || "Private",
    attachments: job.attachments || [],
  });
  const [editedWorkflow, setEditedWorkflow] = useState(
    job.Hiring_Workflow || []
  );
  const [viewingShortlist, setViewingShortlist] = useState(null);
  const [addingShortlist, setAddingShortlist] = useState(null);
  const [addingInterviewLink, setAddingInterviewLink] = useState(null);
  const [addingGDLink, setAddingGDLink] = useState(null);
  const [addingOALink, setAddingOALink] = useState(null);
  const [addingOthersLink, setAddingOthersLink] = useState(null);
  const [isDeleting, setisDeleting] = useState(false);
  const [editingAllowed, setEditingAllowed] = useState(
    editedJob.recruiter_editing_allowed || false
  );
  const [currentCriteriaIndex, setCurrentCriteriaIndex] = useState(0);
  const [editingCriteriaIndex, setEditingCriteriaIndex] = useState(null);
  const [addingFinalShortlist, setAddingFinalShortlist] = useState(false);
  const [openEmailStepIndex, setOpenEmailStepIndex] = useState(null);
  const [addingStep, setAddingStep] = useState(false);
  const [newStep, setNewStep] = useState({
    step_type: "",
    details: {},
  });
  const [stepEmailMessages, setStepEmailMessages] = useState({});
  const [stepEmailAttachments, setStepEmailAttachments] = useState({});
  const [sendingStepEmailIndex, setSendingStepEmailIndex] = useState(null);
  const [isSavingStep, setIsSavingStep] = useState(false);

  useEffect(() => {
    if (editedJob.job_type === "FTE" && editingSection === "basic") {
      setEditedJob((prev) => ({
        ...prev,
        internship_duration: "N/A",
        job_salary: {
          ...prev.job_salary,
          stipend: "0",
        },
      }));
    }
  }, [editedJob.job_type, editingSection]);

  const stepTypeOptions = [
    { value: "Resume Shortlisting", label: "Resume Shortlisting" },
    { value: "OA", label: "Online Assessment (OA)" },
    { value: "Interview", label: "Interview" },
    { value: "GD", label: "Group Discussion (GD)" },
    { value: "Others", label: "Others" },
  ];

  const handleAddStepChange = (field, value) => {
    if (field === "step_type") {
      let details = {};
      switch (value) {
        case "OA":
          details = { oa_date: "", oa_login_time: "", oa_duration: "", oa_info: "", oa_venue: "" };
          break;
        case "Interview":
          details = { interview_type: "", interview_date: "", interview_time: "", interview_info: "", interview_venue: "" };
          break;
        case "GD":
          details = { gd_date: "", gd_time: "", gd_info: "", gd_venue: "" };
          break;
        case "Others":
          details = { others_round_name: "", others_date: "", others_login_time: "", others_duration: "", others_info: "", others_venue: "" };
          break;
        case "Resume Shortlisting":
          details = {};
          break;
        default:
          details = {};
      }
      setNewStep({ step_type: value, details });
    } else {
      setNewStep((prev) => ({
        ...prev,
        details: { ...prev.details, [field]: value },
      }));
    }
  };

  const handleAddStepSubmit = async () => {
    try {
      setIsSavingStep(true);
      const updatedWorkflow = [
        ...editedWorkflow,
        {
          ...newStep,
          eligible_students: [],
          shortlisted_students: [],
          absent_students: [],
        },
      ];
      const response = await axios.put(
        `${import.meta.env.REACT_APP_BASE_URL}/jobprofile/updatejob/${job._id}`,
        { Hiring_Workflow: updatedWorkflow },
        { withCredentials: true },
      );
      if (response.data.success) {
        setEditedWorkflow(updatedWorkflow);
        setAddingStep(false);
        setNewStep({ step_type: "", details: {} });
        toast.success("Hiring step added successfully!");
      }
    } catch (error) {
      console.error("Error adding hiring step:", error);
      toast.error("Failed to add hiring step");
    } finally {
      setIsSavingStep(false);
    }
  };

  const handleAddStepCancel = () => {
    setAddingStep(false);
    setNewStep({ step_type: "", details: {} });
  };

  const handleSendStepEmail = async (stepIndex) => {
    const message = stepEmailMessages[stepIndex] ?? "";
    const files = stepEmailAttachments[stepIndex];
    if (!message.trim() && !files) {
      toast.error("Add a message and/or attachment to send email.");
      return;
    }
    setSendingStepEmailIndex(stepIndex);
    try {
      const formData = new FormData();
      formData.append("message", message);
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("files", file);
        });
      }
      await axios.post(
        `${import.meta.env.REACT_APP_BASE_URL}/jobprofile/send-step-email/${job._id}/${stepIndex}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      toast.success("Email sent to eligible students for this step");
    } catch (emailError) {
      console.error("Error sending step email:", emailError);
      toast.error(
        emailError.response?.data?.message || "Failed to send email for this step",
      );
    } finally {
      setSendingStepEmailIndex(null);
    }
  };

  const handleToggleEditing = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.REACT_APP_BASE_URL}/jobprofile/toggle-editing`,
        { _id: editedJob._id },
        { withCredentials: true }
      );
      if (response.data.success) {
        setEditingAllowed(response.data.editing_allowed);
        oneditingAllowedUpdate(response.data.editing_allowed);
        toast.success(
          `Editing ${response.data.editing_allowed ? "Enabled" : "Disabled"}`
        );
      }
    } catch (error) {
      console.error("Error toggling editing:", error);
      toast.error("Failed to toggle editing");
    }
  };

  const btechdepartmentOptions = [
    { label: "BIO TECHNOLOGY", options: [{ value: "BIO TECHNOLOGY", label: "BIO TECHNOLOGY" }] },
    { label: "CHEMICAL ENGINEERING", options: [{ value: "CHEMICAL ENGINEERING", label: "CHEMICAL ENGINEERING" }] },
    { label: "CIVIL ENGINEERING", options: [{ value: "CIVIL ENGINEERING", label: "CIVIL ENGINEERING" }] },
    {
      label: "COMPUTER SCIENCE AND ENGINEERING",
      options: [
        { value: "COMPUTER SCIENCE AND ENGINEERING", label: "COMPUTER SCIENCE AND ENGINEERING" },
        { value: "DATA SCIENCE AND ENGINEERING", label: "DATA SCIENCE AND ENGINEERING" },
      ],
    },
    { label: "ELECTRICAL ENGINEERING", options: [{ value: "ELECTRICAL ENGINEERING", label: "ELECTRICAL ENGINEERING" }] },
    {
      label: "ELECTRONICS AND COMMUNICATION ENGINEERING",
      options: [
        { value: "ELECTRONICS AND COMMUNICATION ENGINEERING", label: "ELECTRONICS AND COMMUNICATION ENGINEERING" },
        { value: "ELECTRONICS AND VLSI ENGINEERING", label: "ELECTRONICS AND VLSI ENGINEERING" },
      ],
    },
    { label: "INDUSTRIAL AND PRODUCTION ENGINEERING", options: [{ value: "INDUSTRIAL AND PRODUCTION ENGINEERING", label: "INDUSTRIAL AND PRODUCTION ENGINEERING" }] },
    { label: "INFORMATION TECHNOLOGY", options: [{ value: "INFORMATION TECHNOLOGY", label: "INFORMATION TECHNOLOGY" }] },
    { label: "INSTRUMENTATION AND CONTROL ENGINEERING", options: [{ value: "INSTRUMENTATION AND CONTROL ENGINEERING", label: "INSTRUMENTATION AND CONTROL ENGINEERING" }] },
    { label: "MATHEMATICS AND COMPUTING", options: [{ value: "MATHEMATICS AND COMPUTING", label: "MATHEMATICS AND COMPUTING" }] },
    { label: "MECHANICAL ENGINEERING", options: [{ value: "MECHANICAL ENGINEERING", label: "MECHANICAL ENGINEERING" }] },
    { label: "TEXTILE TECHNOLOGY", options: [{ value: "TEXTILE TECHNOLOGY", label: "TEXTILE TECHNOLOGY" }] },
  ];

  const mtechdepartmentOptions = [
    { label: "BIO TECHNOLOGY", options: [{ value: "BIO TECHNOLOGY", label: "BIO TECHNOLOGY" }] },
    { label: "CHEMICAL ENGINEERING", options: [{ value: "CHEMICAL ENGINEERING", label: "CHEMICAL ENGINEERING" }] },
    {
      label: "CIVIL ENGINEERING",
      options: [
        { value: "STRUCTURAL AND CONSTRUCTION ENGINEERING", label: "STRUCTURAL AND CONSTRUCTION ENGINEERING" },
        { value: "GEOTECHNICAL AND GEO-ENVIRONMENTAL ENGINEERING", label: "GEOTECHNICAL AND GEO-ENVIRONMENTAL ENGINEERING" },
        { value: "GEOTECHNICAL ENGINEERING AND INFRASTRUCTURE DESIGN", label: "GEOTECHNICAL ENGINEERING AND INFRASTRUCTURE DESIGN" },
      ],
    },
    {
      label: "COMPUTER SCIENCE AND ENGINEERING",
      options: [
        { value: "COMPUTER SCIENCE AND ENGINEERING", label: "COMPUTER SCIENCE AND ENGINEERING" },
        { value: "COMPUTER SCIENCE AND ENGINEERING (INFORMATION SECURITY)", label: "COMPUTER SCIENCE AND ENGINEERING (INFORMATION SECURITY)" },
        { value: "DATA SCIENCE AND ENGINEERING", label: "DATA SCIENCE AND ENGINEERING" },
      ],
    },
    { label: "ELECTRICAL ENGINEERING", options: [{ value: "ELECTRIC VEHICLE DESIGN", label: "ELECTRIC VEHICLE DESIGN" }] },
    {
      label: "ELECTRONICS AND COMMUNICATION ENGINEERING",
      options: [
        { value: "SIGNAL PROCESSING AND MACHINE LEARNING", label: "SIGNAL PROCESSING AND MACHINE LEARNING" },
        { value: "VLSI DESIGN", label: "VLSI DESIGN" },
      ],
    },
    { label: "INDUSTRIAL AND PRODUCTION ENGINEERING", options: [{ value: "INDUSTRIAL ENGINEERING AND DATA ANALYTICS", label: "INDUSTRIAL ENGINEERING AND DATA ANALYTICS" }] },
    { label: "INFORMATION TECHNOLOGY", options: [{ value: "DATA ANALYTICS", label: "DATA ANALYTICS" }] },
    {
      label: "CONTROL AND INSTRUMENTATION ENGINEERING",
      options: [
        { value: "CONTROL AND INSTRUMENTATION ENGINEERING", label: "CONTROL AND INSTRUMENTATION ENGINEERING" },
        { value: "MACHINE INTELLIGENCE AND AUTOMATION", label: "MACHINE INTELLIGENCE AND AUTOMATION" },
      ],
    },
    { label: "MATHEMATICS AND COMPUTING", options: [{ value: "MATHEMATICS AND COMPUTING", label: "MATHEMATICS AND COMPUTING" }] },
    {
      label: "MECHANICAL ENGINEERING",
      options: [
        { value: "DESIGN ENGINEERING", label: "DESIGN ENGINEERING" },
        { value: "THERMAL AND ENERGY ENGINEERING", label: "THERMAL AND ENERGY ENGINEERING" },
      ],
    },
    {
      label: "TEXTILE TECHNOLOGY",
      options: [
        { value: "TEXTILE TECHNOLOGY", label: "TEXTILE TECHNOLOGY" },
        { value: "TEXTILE ENGINEERING AND MANAGEMENT", label: "TEXTILE ENGINEERING AND MANAGEMENT" },
        { value: "RENEWABLE ENERGY", label: "RENEWABLE ENERGY" },
        { value: "ARTIFICIAL INTELLIGENCE", label: "ARTIFICIAL INTELLIGENCE" },
        { value: "POWER SYSTEMS AND RELIABILITY", label: "POWER SYSTEMS AND RELIABILITY" },
      ],
    },
  ];

  const mbadepartmentOptions = [{ value: "HUMANITIES AND MANAGEMENT", label: "HUMANITIES AND MANAGEMENT" }];
  const mscdepartmentOptions = [
    { value: "CHEMISTRY", label: "CHEMISTRY" },
    { value: "MATHEMATICS", label: "MATHEMATICS" },
    { value: "PHYSICS", label: "PHYSICS" },
  ];
  const phddepartmentOptions = [];

  const getDepartmentOptions = (course) => {
    switch (course) {
      case "B.Tech": return btechdepartmentOptions;
      case "M.Tech": return mtechdepartmentOptions;
      case "MBA": return mbadepartmentOptions;
      case "M.Sc.": return mscdepartmentOptions;
      case "PHD": return phddepartmentOptions;
      default: return [];
    }
  };

  const jobTypeOptions = [
    { value: "Intern", label: "Internship" },
    { value: "Intern+PPO", label: "Intern + Pre Placement Offer(PPO)" },
    { value: "Intern+FTE", label: "Intern + Full-Time Employment(FTE)" },
    { value: "FTE", label: "Full-Time Employment(FTE)" },
  ];

  const jobCategoryOptions = [
    { value: "Tech", label: "Tech" },
    { value: "Non-Tech", label: "Non-Tech" },
    { value: "Tech+Non-Tech", label: "Tech + Non-Tech" },
  ];

  const jobSectorOptions = [
    { value: "PSU", label: "PSU" },
    { value: "Private", label: "Private" },
  ];

  useEffect(() => {
    const checkApplicationFormExistence = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.REACT_APP_BASE_URL}/api/check-aft-exist/${job._id}`,
          { withCredentials: true }
        );
        setApplicationFormexist(response.data.exist);
      } catch (error) {
        console.error("Error checking application form existence:", error);
        setApplicationFormexist(false);
      }
    };
    if (job?._id) {
      checkApplicationFormExistence();
    }
  }, [job]);

  const handleEdit = (section, index = null) => {
    if (readOnly) return; // guard: no editing in readOnly mode
    setEditingSection(section);
    setEditingStepIndex(index);
    if (section === "eligibility") {
      setEditingCriteriaIndex(index !== null ? index : currentCriteriaIndex);
    }
  };

  const handleCancel = () => {
    setEditedJob({ 
      ...job, 
      eligibility_criteria: job.eligibility_criteria || [], 
      job_salary: { ...job.job_salary, stipend: job.job_salary?.stipend || "0" },
      job_sector: job.job_sector || "Private",
      attachments: job.attachments || [],
    });
    setEditedWorkflow(job.Hiring_Workflow || []);
    setEditingSection(null);
    setEditingStepIndex(null);
    setEditingCriteriaIndex(null);
  };

  const handleDeleteForm = () => {
    if (isDeleting) return;
    setisDeleting(true);
    Swal.fire({
      title: "Delete Application Form",
      text: "This action cannot be undone. Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      customClass: { popup: "rounded-lg", confirmButton: "px-4 py-2 rounded-md", cancelButton: "px-4 py-2 rounded-md" },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(
            `${import.meta.env.REACT_APP_BASE_URL}/api/delete-form-template/${job._id}`,
            {},
            { withCredentials: true }
          );
          setApplicationFormexist(false);
          toast.success("Application form deleted successfully");
        } catch (error) {
          console.error("Error deleting application form:", error);
          toast.error("Failed to delete application form");
        } finally {
          setisDeleting(false);
        }
      }
    });
  };

  const handleAddCriteria = () => {
    setEditedJob({
      ...editedJob,
      eligibility_criteria: [
        ...editedJob.eligibility_criteria,
        { department_allowed: [], gender_allowed: "Any", course_allowed: "", eligible_batch: "", minimum_cgpa: 0, active_backlogs: false, history_backlogs: false }
      ]
    });
    setCurrentCriteriaIndex(editedJob.eligibility_criteria.length);
    handleEdit("eligibility", editedJob.eligibility_criteria.length);
  };

  const handleDeleteCriteria = async (index) => {
    Swal.fire({
      title: "Delete Eligibility Criteria",
      text: "This action cannot be undone. Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const newCriteria = [...editedJob.eligibility_criteria];
          newCriteria.splice(index, 1);
          const response = await axios.put(
            `${import.meta.env.REACT_APP_BASE_URL}/jobprofile/updatejob/${job._id}`,
            { eligibility_criteria: newCriteria },
            { withCredentials: true }
          );
          if (response.data.success) {
            setEditedJob({ ...editedJob, eligibility_criteria: newCriteria });
            setCurrentCriteriaIndex(Math.max(0, currentCriteriaIndex - 1));
            toast.success("Criteria deleted successfully");
          } else {
            throw new Error("Failed to update database");
          }
        } catch (error) {
          console.error("Error deleting criteria:", error);
          toast.error("Failed to delete criteria");
        }
      }
    });
  };

  const handleSave = async (section) => {
    try {
      let updateData = {};
      if (section === "hiring_workflow") {
        updateData = { Hiring_Workflow: editedWorkflow };
      } else if (section === "eligibility") {
        updateData = { eligibility_criteria: editedJob.eligibility_criteria };
      } else if (section === "salary") {
        updateData = { 
          job_salary: {
            ctc: editedJob.job_salary.ctc,
            base_salary: editedJob.job_salary.base_salary,
            stipend: editedJob.job_salary.stipend
          }
        };
      } else if (section === "basic") {
        updateData = {
          company_name: editedJob.company_name,
          job_id: editedJob.job_id,
          job_role: editedJob.job_role,
          job_type: editedJob.job_type,
          internship_duration: editedJob.internship_duration,
          jobdescription: editedJob.jobdescription,
          joblocation: editedJob.joblocation,
          job_category: editedJob.job_category,
          job_class: editedJob.job_class,
          job_sector: editedJob.job_sector,
          deadline: editedJob.deadline,
        };
      }
      const response = await axios.put(
        `${import.meta.env.REACT_APP_BASE_URL}/jobprofile/updatejob/${job._id}`,
        updateData,
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success("Job updated successfully!");
        Object.assign(job, editedJob);
        setEditingSection(null);
        setEditingStepIndex(null);
        setEditingCriteriaIndex(null);
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to update job");
    }
  };

  const handleInputChange = (section, field, value, criteriaIndex = null) => {
    if (section === "hiring_workflow") {
      const updatedWorkflow = [...editedWorkflow];
      const [fieldPath, ...subFields] = field.split(".");
      if (subFields.length > 0) {
        updatedWorkflow[editingStepIndex].details[subFields.join(".")] = value;
      } else {
        updatedWorkflow[editingStepIndex][fieldPath] = value;
      }
      setEditedWorkflow(updatedWorkflow);
    } else if (section === "eligibility" && criteriaIndex !== null) {
      const updatedCriteria = [...editedJob.eligibility_criteria];
      updatedCriteria[criteriaIndex][field] = value;
      setEditedJob({ ...editedJob, eligibility_criteria: updatedCriteria });
    } else {
      const updatedJob = { ...editedJob };
      const fieldPath = field.split(".");
      let current = updatedJob;
      for (let i = 0; i < fieldPath.length - 1; i++) {
        if (!current[fieldPath[i]]) current[fieldPath[i]] = {};
        current = current[fieldPath[i]];
      }
      current[fieldPath[fieldPath.length - 1]] = value;
      setEditedJob(updatedJob);
    }
  };

  const handleUploadAttachment = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const formData = new FormData();
      formData.append("attachment", file);
      try {
        const response = await axios.post(
          `${import.meta.env.REACT_APP_BASE_URL}/jobprofile/upload-attachment/${job._id}`,
          formData,
          { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
        );
        if (response.data.success) {
          const newAttachment = response.data.attachment;
          setEditedJob((prev) => ({ ...prev, attachments: [...prev.attachments, newAttachment] }));
          job.attachments = [...job.attachments || [], newAttachment];
          toast.success(`Attachment "${file.name}" uploaded successfully!`);
        }
      } catch (error) {
        console.error("Error uploading attachment:", error);
        toast.error(`Failed to upload "${file.name}"`);
      }
    }
    e.target.value = "";
  };

  const handleRemoveAttachment = async (index) => {
    Swal.fire({
      title: "Delete Attachment",
      text: "This action cannot be undone. Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const attachment = editedJob.attachments[index];
        try {
          await axios.delete(
            `${import.meta.env.REACT_APP_BASE_URL}/jobprofile/delete-attachment/${job._id}/${attachment._id}`,
            { withCredentials: true }
          );
          const newAttachments = [...editedJob.attachments];
          newAttachments.splice(index, 1);
          setEditedJob((prev) => ({ ...prev, attachments: newAttachments }));
          job.attachments = newAttachments;
          toast.success("Attachment removed successfully");
        } catch (error) {
          console.error("Error removing attachment:", error);
          toast.error("Failed to remove attachment");
        }
      }
    });
  };

  // ─── Render Helpers ───────────────────────────────────────────────────────────

  const renderBasicDetails = () => (
    <div className="space-y-4 text-gray-700">
      {[
        { label: "Company Name", field: "company_name", type: "text" },
        { label: "Job Id", field: "job_id", type: "text" },
        { label: "Job Role", field: "job_role", type: "text" },
      ].map(({ label, field, type }) => (
        <div key={field} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
          <strong className="sm:w-1/3 text-gray-800">{label}:</strong>
          {editingSection === "basic" ? (
            <input
              type={type}
              value={editedJob[field] || ""}
              onChange={(e) => handleInputChange("basic", field, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          ) : (
            <span className="flex-1">{editedJob[field]}</span>
          )}
        </div>
      ))}

      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
        <strong className="sm:w-1/3 text-gray-800">Job Type:</strong>
        {editingSection === "basic" ? (
          <select
            value={editedJob.job_type || ""}
            onChange={(e) => handleInputChange("basic", "job_type", e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          >
            {jobTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <span className="flex-1">{editedJob.job_type}</span>
        )}
      </div>

      {["Intern", "Intern+PPO", "Intern+FTE"].includes(editedJob.job_type) && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
          <strong className="sm:w-1/3 text-gray-800">Internship Duration: <span className="text-sm text-red-500">(in months)</span></strong>
          {editingSection === "basic" ? (
            <input
              type="text"
              value={editedJob.internship_duration || ""}
              onChange={(e) => handleInputChange("basic", "internship_duration", e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          ) : (
            <span className="flex-1">{editedJob.internship_duration || "N/A"}</span>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
        <strong className="sm:w-1/3 text-gray-800">Job Category:</strong>
        {editingSection === "basic" ? (
          <select
            value={editedJob.job_category || ""}
            onChange={(e) => handleInputChange("basic", "job_category", e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          >
            {jobCategoryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <span className="flex-1">{editedJob.job_category}</span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
        <strong className="sm:w-1/3 text-gray-800">Job Sector:</strong>
        {editingSection === "basic" ? (
          <select
            value={editedJob.job_sector || "Private"}
            onChange={(e) => handleInputChange("basic", "job_sector", e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          >
            {jobSectorOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <span className="flex-1">{editedJob.job_sector || "Private"}</span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
        <strong className="sm:w-1/3 text-gray-800">Location:</strong>
        {editingSection === "basic" ? (
          <input
            type="text"
            value={editedJob.joblocation || ""}
            onChange={(e) => handleInputChange("basic", "joblocation", e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
        ) : (
          <span className="flex-1">{editedJob.joblocation}</span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0">
        <strong className="sm:w-1/3 text-gray-800">Description:</strong>
        {editingSection === "basic" ? (
          <div className="flex-1 min-w-0">
            <ReactQuill
              value={editedJob.jobdescription || ""}
              onChange={(value) => handleInputChange("basic", "jobdescription", value)}
              className="border border-gray-300 rounded-lg"
              theme="snow"
              modules={{
                toolbar: [
                  [{ header: [1, 2, false] }],
                  ["bold", "italic", "underline", "strike"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["link"],
                  ["clean"],
                ],
              }}
            />
          </div>
        ) : (
          <div className="flex-1 min-w-0 overflow-x-auto" dangerouslySetInnerHTML={{ __html: editedJob.jobdescription || "" }} />
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
        <strong className="sm:w-1/3 text-gray-800">Deadline:</strong>
        {editingSection === "basic" ? (
          <input
            type="datetime-local"
            value={
              editedJob.deadline
                ? new Date(new Date(editedJob.deadline).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                : ""
            }
            onChange={(e) => handleInputChange("basic", "deadline", e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
        ) : (
          <span className="flex-1">{formatDateTime(editedJob.deadline)}</span>
        )}
      </div>
    </div>
  );

  const renderSalaryDetails = () => (
    <div className="space-y-4 text-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
        <strong className="sm:w-1/3 text-gray-800">CTC: <span className="text-xs text-red-500">(in Lakhs)</span></strong>
        {editingSection === "salary" ? (
          <input
            type="text"
            value={editedJob.job_salary?.ctc || ""}
            onChange={(e) => handleInputChange("salary", "job_salary.ctc", e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
        ) : (
          <span className="flex-1">{editedJob.job_salary?.ctc || "N/A"}</span>
        )}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
        <strong className="sm:w-1/3 text-gray-800">Base Salary: <span className="text-xs text-red-500">(in Lakhs)</span></strong>
        {editingSection === "salary" ? (
          <input
            type="text"
            value={editedJob.job_salary?.base_salary || ""}
            onChange={(e) => handleInputChange("salary", "job_salary.base_salary", e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
        ) : (
          <span className="flex-1">{editedJob.job_salary?.base_salary || "N/A"}</span>
        )}
      </div>
      {["Intern", "Intern+PPO", "Intern+FTE"].includes(editedJob.job_type) && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
          <strong className="sm:w-1/3 text-gray-800">Stipend <span className="text-xs text-red-500">(in Thousands/month)</span>:</strong>
          {editingSection === "salary" ? (
            <input
              type="text"
              value={editedJob.job_salary?.stipend || ""}
              onChange={(e) => handleInputChange("salary", "job_salary.stipend", e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          ) : (
            <span className="flex-1">{editedJob.job_salary?.stipend || "N/A"}</span>
          )}
        </div>
      )}
    </div>
  );

  const renderAttachments = () => (
    <div className="space-y-6">
      {editedJob.attachments.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {editedJob.attachments.map((attachment, index) => (
            <li
              key={index}
              className="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <FileText className="h-6 w-6 text-custom-blue flex-shrink-0" />
                <a
                  href={`${import.meta.env.REACT_APP_BASE_URL}${attachment.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-gray-900 font-medium truncate"
                >
                  {attachment.name || `Attachment ${index + 1}`}
                </a>
              </div>
              {/* Only show delete button when NOT readOnly */}
              {!readOnly && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleRemoveAttachment(index)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors flex-shrink-0"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent><p>Remove attachment</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-center">No attachments uploaded yet.</p>
      )}
      {/* Upload button only for non-readOnly */}
      {!readOnly && (
        <div className="flex justify-center mt-6">
          <label
            htmlFor="attachment-upload"
            className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-6 py-3 rounded-2xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl cursor-pointer flex items-center space-x-2"
          >
            <Upload className="h-5 w-5" />
            <span>Upload Attachments</span>
          </label>
          <input id="attachment-upload" type="file" multiple onChange={handleUploadAttachment} className="hidden" />
        </div>
      )}
    </div>
  );

  /** Editable card — pencil icon is hidden in readOnly mode */
  const renderEditableCard = (title, content, section) => (
    <div className="p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 relative mt-8">
      {/* Pencil edit button — hidden for faculty (readOnly) */}
      {!readOnly && (
        <button
          className="absolute top-4 right-4 p-2 text-gray-600 hover:text-blue-600 transition-colors"
          onClick={() => handleEdit(section)}
        >
          <Pencil size={20} />
        </button>
      )}
      <h3 className="text-xl sm:text-2xl font-semibold text-custom-blue mb-6">{title}</h3>
      {content}
      {/* Save / Cancel only when actively editing and NOT readOnly */}
      {!readOnly && editingSection === section && (
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-2xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300"
            onClick={() => handleSave(section)}
          >
            Save
          </button>
          <button
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-2xl hover:from-gray-600 hover:to-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  const renderEligibilityCriteria = () => {
    const criteria = editedJob.eligibility_criteria[currentCriteriaIndex] || {};
    const isEditingThisCriteria = !readOnly && editingSection === "eligibility" && editingCriteriaIndex === currentCriteriaIndex;

    return (
      <div className="space-y-4 text-gray-700">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {editedJob.eligibility_criteria.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentCriteriaIndex(Math.max(0, currentCriteriaIndex - 1))}
                  disabled={currentCriteriaIndex === 0}
                  className="p-2 bg-gray-200 rounded-full disabled:opacity-50 hover:bg-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-medium">
                  {currentCriteriaIndex + 1} of {editedJob.eligibility_criteria.length}
                </span>
                <button
                  onClick={() => setCurrentCriteriaIndex(Math.min(editedJob.eligibility_criteria.length - 1, currentCriteriaIndex + 1))}
                  disabled={currentCriteriaIndex === editedJob.eligibility_criteria.length - 1}
                  className="p-2 bg-gray-200 rounded-full disabled:opacity-50 hover:bg-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
            {/* Add / Delete criteria — hidden in readOnly mode */}
            {!readOnly && (
              <>
                <button
                  onClick={handleAddCriteria}
                  className="border border-green-600 text-green-600 hover:text-white px-4 py-2 rounded-full hover:bg-green-600 flex items-center"
                >
                  <Plus className="h-5 w-5" />
                </button>
                {editedJob.eligibility_criteria.length > 0 && (
                  <button
                    onClick={() => handleDeleteCriteria(currentCriteriaIndex)}
                    className="text-red-600 hover:text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {editedJob.eligibility_criteria.length === 0 ? (
          <p className="text-gray-500">No eligibility criteria defined.</p>
        ) : (
          <>
            {/* Eligible Batch */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <strong className="sm:w-1/3 text-gray-800">Eligible Batch:</strong>
              {isEditingThisCriteria ? (
                <select
                  value={criteria.eligible_batch || ""}
                  onChange={(e) => handleInputChange("eligibility", "eligible_batch", e.target.value, currentCriteriaIndex)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
                >
                  <option value="">Select Batch</option>
                  {["2025","2026","2027","2028","2029","2030"].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              ) : (
                <span className="flex-1">{criteria.eligible_batch || "N/A"}</span>
              )}
            </div>

            {/* Course */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <strong className="sm:w-1/3 text-gray-800">Course Allowed:</strong>
              {isEditingThisCriteria ? (
                <select
                  value={criteria.course_allowed || ""}
                  onChange={(e) => handleInputChange("eligibility", "course_allowed", e.target.value, currentCriteriaIndex)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
                >
                  <option value="">Select Course</option>
                  {["B.Tech","M.Tech","MBA","M.Sc."].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <span className="flex-1">{criteria.course_allowed || "N/A"}</span>
              )}
            </div>

            {/* Departments */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <strong className="sm:w-1/3 text-gray-800">Departments Allowed:</strong>
              {isEditingThisCriteria ? (
                <div className="flex-1 min-w-0">
                  <Select
                    isMulti
                    options={getDepartmentOptions(criteria.course_allowed)}
                    value={
                      criteria.course_allowed === "B.Tech" || criteria.course_allowed === "M.Tech"
                        ? getDepartmentOptions(criteria.course_allowed).flatMap((g) => g.options).filter((o) => criteria.department_allowed?.includes(o.value))
                        : getDepartmentOptions(criteria.course_allowed).filter((o) => criteria.department_allowed?.includes(o.value))
                    }
                    onChange={(sel) => handleInputChange("eligibility", "department_allowed", sel ? sel.map((o) => o.value) : [], currentCriteriaIndex)}
                    isDisabled={!criteria.course_allowed}
                    className="w-full"
                  />
                </div>
              ) : (
                <span className="flex-1">{criteria.department_allowed?.join(", ") || "N/A"}</span>
              )}
            </div>

            {/* Gender */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <strong className="sm:w-1/3 text-gray-800">Gender Allowed:</strong>
              {isEditingThisCriteria ? (
                <select
                  value={criteria.gender_allowed || ""}
                  onChange={(e) => handleInputChange("eligibility", "gender_allowed", e.target.value, currentCriteriaIndex)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Any">All</option>
                </select>
              ) : (
                <span className="flex-1">{criteria.gender_allowed || "N/A"}</span>
              )}
            </div>

            {/* Active Backlogs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <strong className="sm:w-1/3 text-gray-800">Active Backlogs Allowed:</strong>
              {isEditingThisCriteria ? (
                <input
                  type="checkbox"
                  checked={criteria.active_backlogs || false}
                  onChange={(e) => handleInputChange("eligibility", "active_backlogs", e.target.checked, currentCriteriaIndex)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              ) : (
                <span className="flex-1">{criteria.active_backlogs ? "Yes" : "No"}</span>
              )}
            </div>

            {/* History Backlogs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <strong className="sm:w-1/3 text-gray-800">Backlogs History Allowed:</strong>
              {isEditingThisCriteria ? (
                <input
                  type="checkbox"
                  checked={criteria.history_backlogs || false}
                  onChange={(e) => handleInputChange("eligibility", "history_backlogs", e.target.checked, currentCriteriaIndex)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              ) : (
                <span className="flex-1">{criteria.history_backlogs ? "Yes" : "No"}</span>
              )}
            </div>

            {/* Min CGPA */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <strong className="sm:w-1/3 text-gray-800">Minimum CGPA:</strong>
              {isEditingThisCriteria ? (
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={criteria.minimum_cgpa || ""}
                  onChange={(e) => handleInputChange("eligibility", "minimum_cgpa", e.target.value, currentCriteriaIndex)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
                />
              ) : (
                <span className="flex-1">{criteria.minimum_cgpa || "N/A"}</span>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  // ─── Sub-page guards ──────────────────────────────────────────────────────────

  if (addingOthersLink) {
    return (
      <OthersLinkManager
        jobId={job._id}
        stepIndex={addingOthersLink.stepIndex}
        onClose={() => setAddingOthersLink(null)}
        othersLinks={job.Hiring_Workflow[addingOthersLink.stepIndex]?.details.others_link || []}
        onUpdateLinks={(updatedLinks) => {
          const updatedWorkflow = [...job.Hiring_Workflow];
          updatedWorkflow[addingOthersLink.stepIndex].details.others_link = updatedLinks;
          setEditedWorkflow(updatedWorkflow);
        }}
      />
    );
  }

  if (addingOALink) {
    return (
      <OaLinkManager
        jobId={job._id}
        stepIndex={addingOALink.stepIndex}
        onClose={() => setAddingOALink(null)}
        oaLinks={job.Hiring_Workflow[addingOALink.stepIndex]?.details.oa_link || []}
        onUpdateLinks={(updatedLinks) => {
          const updatedWorkflow = [...job.Hiring_Workflow];
          updatedWorkflow[addingOALink.stepIndex].details.oa_link = updatedLinks;
          setEditedWorkflow(updatedWorkflow);
        }}
      />
    );
  }

  if (addingInterviewLink) {
    return (
      <InterviewLinkManager
        jobId={job._id}
        stepIndex={addingInterviewLink.stepIndex}
        onClose={() => setAddingInterviewLink(null)}
        interviewLinks={job.Hiring_Workflow[addingInterviewLink.stepIndex]?.details.interview_link || []}
        onUpdateLinks={(updatedLinks) => {
          const updatedWorkflow = [...job.Hiring_Workflow];
          updatedWorkflow[addingInterviewLink.stepIndex].details.interview_link = updatedLinks;
          setEditedWorkflow(updatedWorkflow);
        }}
      />
    );
  }

  if (addingGDLink) {
    return (
      <GDLinkManager
        jobId={job._id}
        stepIndex={addingGDLink.stepIndex}
        onClose={() => setAddingGDLink(null)}
        gdLinks={job.Hiring_Workflow[addingGDLink.stepIndex]?.details.gd_link || []}
      />
    );
  }

  if (addingShortlist) {
    return <ShortlistStudents jobId={job._id} stepIndex={addingShortlist.stepIndex} onClose={() => setAddingShortlist(null)} />;
  }

  if (viewingShortlist) {
    return <ViewShortlistStudents jobId={job._id} stepIndex={viewingShortlist.stepIndex} onClose={() => setViewingShortlist(null)} />;
  }

  if (addingFinalShortlist) {
    return <FinalShortlistStudents jobId={job._id} onClose={() => setAddingFinalShortlist(false)} />;
  }

  if (viewingAppliedStudents) {
    return (
      <AppliedStudents
        jobId={job._id}
        company_name={editedJob.company_name}
        onClose={() => setViewingAppliedStudents(false)}
      />
    );
  }

  if (selectedJobForForm) {
    return (
      <div className="container mx-auto px-4 py-6">
        <CreateApplicationform
          jobId={selectedJobForForm}
          onClose={() => setSelectedJobForForm(null)}
          onSubmit={() => setApplicationFormexist(true)}
        />
      </div>
    );
  }

  if (viewingApplicationForm) {
    return (
      <div className="container mx-auto px-4 py-6">
        <ViewApplicationForm jobId={job._id} onHide={() => setViewingApplicationForm(false)} />
      </div>
    );
  }

  if (editingApplicationForm) {
    return (
      <div className="container mx-auto px-4 py-6">
        <EditApplicationForm jobId={job._id} onClose={() => setEditingApplicationForm(false)} />
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────────

  return (
    <>
      <div className="-mt-10 ml-4">
        <button className="flex items-center text-blue-600 hover:text-blue-800" onClick={onClose}>
          <FaArrowLeft className="mr-2" />
        </button>
      </div>

      <div className="bg-white sm:p-10 p-4 rounded-3xl shadow-2xl max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-custom-blue">Job Details</h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Applied Students — HIDDEN in readOnly (faculty) mode */}
            {!readOnly && job.Approved_Status && (
              <button
                className="bg-gradient-to-r from-[#0369A0] to-[#024873] text-white p-3 sm:px-8 sm:py-3 rounded-2xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                onClick={() => setViewingAppliedStudents(true)}
              >
                <Users className="mr-2 h-4 w-4 inline" />
                View Applied Students
              </button>
            )}

            {/* Recruiter editing toggle — HIDDEN in readOnly (faculty) mode */}
            {!readOnly && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className="inline-flex items-center cursor-pointer py-3 relative group">
                      <input type="checkbox" checked={editingAllowed} onChange={handleToggleEditing} className="hidden" />
                      <div className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${editingAllowed ? "bg-green-500" : "bg-red-500"}`}>
                        <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${editingAllowed ? "translate-x-6" : ""}`}></span>
                      </div>
                    </label>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-xl">
                    <p className="text-sm font-medium">{editingAllowed ? "Disable Recruiter Editing" : "Enable Recruiter Editing"}</p>
                    <p className="text-xs text-gray-300 mt-1">
                      {editingAllowed ? "Click to prevent recruiter from editing job details" : "Click to allow recruiter to edit job details"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {renderEditableCard("Basic Details", renderBasicDetails(), "basic")}

        {/* Attachments card */}
        <div className="p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 relative mt-8">
          <h3 className="text-xl sm:text-2xl font-semibold text-custom-blue mb-6">Attachments</h3>
          {renderAttachments()}
        </div>

        {renderEditableCard("Salary Details", renderSalaryDetails(), "salary")}
        {renderEditableCard("Eligibility Criteria", renderEligibilityCriteria(), "eligibility")}

        <h3 className="text-2xl sm:text-3xl font-bold text-custom-blue mt-10 mb-8">Hiring Workflow</h3>
        {renderHiringWorkflow()}

        {/* Application Form card */}
        <div className="p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 relative mt-8">
          <h3 className="text-xl sm:text-2xl font-semibold text-custom-blue mb-6">Application Form</h3>
          {applicationFormexist ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={() => setViewingApplicationForm(true)}>
                <FileText className="mr-2 h-4 w-4" />View Form
              </Button>
              {/* Edit & Delete only for non-readOnly */}
              {!readOnly && (
                <>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => setEditingApplicationForm(true)}>
                    <Edit className="mr-2 h-4 w-4" />Edit Form
                  </Button>
                  <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleDeleteForm} disabled={isDeleting}>
                    <Trash2 className="mr-2 h-4 w-4" />{isDeleting ? "Deleting..." : "Delete Form"}
                  </Button>
                </>
              )}
            </div>
          ) : (
            !readOnly && job.Approved_Status && (
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white" onClick={() => setSelectedJobForForm(job._id)}>
                <Plus className="mr-2 h-4 w-4 text-white" />Create Application Form
              </Button>
            )
          )}
          {readOnly && !applicationFormexist && (
            <p className="text-gray-500 text-center">No application form created yet.</p>
          )}
        </div>

        {/* Final Shortlist — hidden in readOnly */}
        {!readOnly && (
          <div className="p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 relative mt-8">
            <h3 className="text-xl sm:text-2xl font-semibold text-custom-blue mb-6">Final Shortlist</h3>
            <Button className="w-full bg-green-500 hover:bg-green-600 text-white" onClick={() => setAddingFinalShortlist(true)}>
              <Plus className="mr-2 h-4 w-4 text-white" />Manage Final Shortlist
            </Button>
          </div>
        )}
      </div>
    </>
  );

  // ─── Hiring Workflow renderer ─────────────────────────────────────────────────

  function renderHiringWorkflow() {
    const handleAddStepSubmit = async () => {
      try {
        setIsSavingStep(true);
        const updatedWorkflow = [
          ...editedWorkflow,
          { ...newStep, eligible_students: [], shortlisted_students: [], absent_students: [] },
        ];
        const response = await axios.put(
          `${import.meta.env.REACT_APP_BASE_URL}/jobprofile/updatejob/${job._id}`,
          { Hiring_Workflow: updatedWorkflow },
          { withCredentials: true },
        );
        if (response.data.success) {
          setEditedWorkflow(updatedWorkflow);
          Object.assign(job, { Hiring_Workflow: updatedWorkflow });
          setAddingStep(false);
          setNewStep({ step_type: "", details: {} });
          toast.success("Hiring step added successfully!");
        }
      } catch (error) {
        console.error("Error adding hiring step:", error);
        toast.error("Failed to add hiring step");
      } finally {
        setIsSavingStep(false);
      }
    };

    if (!readOnly && addingStep) {
      return (
        <div className="p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 mt-8">
          <h3 className="text-xl sm:text-2xl font-semibold text-custom-blue mb-6">Add New Hiring Step</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
              <strong className="sm:w-1/3 text-gray-800">Step Type:</strong>
              <select
                value={newStep.step_type}
                onChange={(e) => handleAddStepChange("step_type", e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="">Select Step Type</option>
                {stepTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {newStep.step_type && newStep.step_type !== "Resume Shortlisting" && (
              <>
                {newStep.step_type === "Interview" && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                    <strong className="sm:w-1/3 text-gray-800">Interview Type:</strong>
                    <input type="text" value={newStep.details.interview_type || ""} onChange={(e) => handleAddStepChange("interview_type", e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full" />
                  </div>
                )}
                {newStep.step_type === "Others" && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                    <strong className="sm:w-1/3 text-gray-800">Round Name:</strong>
                    <input type="text" value={newStep.details.others_round_name || ""} onChange={(e) => handleAddStepChange("others_round_name", e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full" />
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  <strong className="sm:w-1/3 text-gray-800">Date:</strong>
                  <input type="date" value={newStep.details[`${newStep.step_type.toLowerCase()}_date`] || ""} onChange={(e) => handleAddStepChange(`${newStep.step_type.toLowerCase()}_date`, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  <strong className="sm:w-1/3 text-gray-800">{["Others","OA"].includes(newStep.step_type) ? "Login Time" : "Time"}:</strong>
                  <input
                    type="text"
                    value={newStep.details[`${newStep.step_type.toLowerCase()}_${["Others","OA"].includes(newStep.step_type) ? "login_time" : "time"}`] || ""}
                    onChange={(e) => handleAddStepChange(`${newStep.step_type.toLowerCase()}_${["Others","OA"].includes(newStep.step_type) ? "login_time" : "time"}`, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
                {!["Interview","GD"].includes(newStep.step_type) && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                    <strong className="sm:w-1/3 text-gray-800">Duration:</strong>
                    <input type="text" value={newStep.details[`${newStep.step_type.toLowerCase()}_duration`] || ""} onChange={(e) => handleAddStepChange(`${newStep.step_type.toLowerCase()}_duration`, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full" />
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  <strong className="sm:w-1/3 text-gray-800">Info:</strong>
                  <input type="text" value={newStep.details[`${newStep.step_type.toLowerCase()}_info`] || ""} onChange={(e) => handleAddStepChange(`${newStep.step_type.toLowerCase()}_info`, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  <strong className="sm:w-1/3 text-gray-800">Venue:</strong>
                  <input type="text" value={newStep.details[`${newStep.step_type.toLowerCase()}_venue`] || ""} onChange={(e) => handleAddStepChange(`${newStep.step_type.toLowerCase()}_venue`, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full" />
                </div>
              </>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-2xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-60"
                onClick={handleAddStepSubmit}
                disabled={!newStep.step_type || isSavingStep}
              >
                {isSavingStep ? "Saving..." : "Save"}
              </button>
              <button
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-2xl hover:from-gray-600 hover:to-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300"
                onClick={handleAddStepCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
    }

    const handleDeleteLastStep = async () => {
      if (job.Hiring_Workflow.length === 0) return;
      Swal.fire({
        title: "Delete Last Hiring Step",
        text: "This action cannot be undone. Are you sure?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const updatedWorkflow = [...editedWorkflow];
            updatedWorkflow.pop();
            const response = await axios.put(
              `${import.meta.env.REACT_APP_BASE_URL}/jobprofile/updatejob/${job._id}`,
              { Hiring_Workflow: updatedWorkflow },
              { withCredentials: true }
            );
            if (response.data.success) {
              setEditedWorkflow(updatedWorkflow);
              Object.assign(job, { Hiring_Workflow: updatedWorkflow });
              toast.success("Last hiring step deleted successfully!");
            }
          } catch (error) {
            console.error("Error deleting hiring step:", error);
            toast.error("Failed to delete hiring step");
          }
        }
      });
    };

    return (
      <div className="mt-8 space-y-8">
        {/* Add / Delete step buttons — hidden in readOnly */}
        {!readOnly && (
          <div className="flex flex-wrap gap-3">
            <button
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-2xl hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              onClick={() => setAddingStep(true)}
            >
              Add Hiring Step
            </button>
            {job.Hiring_Workflow.length > 0 && (
              <button
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-2xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                onClick={handleDeleteLastStep}
              >
                Delete Last Hiring Step
              </button>
            )}
          </div>
        )}

        {job.Hiring_Workflow.length === 0 ? (
          <p className="text-gray-500">No hiring workflow defined.</p>
        ) : (
          job.Hiring_Workflow.map((step, index) => (
            <div key={index} className="p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
              {/* Pencil edit — hidden in readOnly */}
              {!readOnly && (
                <button
                  className="absolute top-4 right-4 p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  onClick={() => handleEdit("hiring_workflow", index)}
                >
                  <Pencil size={20} />
                </button>
              )}

              <h3 className="text-xl sm:text-2xl font-semibold text-custom-blue mb-6">{step.step_type} Step</h3>

              <ul className="space-y-4 text-gray-700">
                {Object.entries(step.details || {}).map(([key, value]) => {
                  if (
                    (step.step_type === "Interview" && key.toLowerCase().includes("interview_link")) ||
                    (step.step_type === "GD" && key.toLowerCase().includes("gd_link")) ||
                    (step.step_type === "OA" && key.toLowerCase().includes("oa_link")) ||
                    (step.step_type === "Others" && key.toLowerCase().includes("others_link"))
                  ) return null;

                  return (
                    <li key={key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                      <strong className="sm:w-1/3 text-gray-800 capitalize">{key.replace(/_/g, " ")}:</strong>
                      {!readOnly && editingStepIndex === index && editingSection === "hiring_workflow" ? (
                        key.toLowerCase().includes("date") ? (
                          <input
                            type="date"
                            value={editedWorkflow[index].details[key] ? new Date(editedWorkflow[index].details[key]).toISOString().slice(0, 10) : ""}
                            onChange={(e) => handleInputChange("hiring_workflow", `details.${key}`, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
                          />
                        ) : (
                          <input
                            type="text"
                            value={editedWorkflow[index].details[key] || ""}
                            onChange={(e) => handleInputChange("hiring_workflow", `details.${key}`, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full"
                          />
                        )
                      ) : (
                        <span className="flex-1">{key.toLowerCase().includes("date") ? formatDate(value) : value || "N/A"}</span>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Email modal — hidden in readOnly */}
              {!readOnly && openEmailStepIndex === index && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                  <div className="bg-white w-full max-w-xl p-6 rounded-2xl shadow-2xl relative">
                    <button className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-lg" onClick={() => setOpenEmailStepIndex(null)}>✕</button>
                    <h4 className="text-xl font-semibold text-custom-blue mb-4">Send Email to Eligible Students</h4>
                    <div className="flex flex-col space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
                        <textarea
                          value={stepEmailMessages[index] ?? ""}
                          onChange={(e) => setStepEmailMessages((prev) => ({ ...prev, [index]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Message to include in the email..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.xls,.xlsx,.csv,image/*"
                          onChange={(e) => {
                            const filesArray = Array.from(e.target.files || []);
                            setStepEmailAttachments((prev) => ({ ...prev, [index]: [...(prev[index] || []), ...filesArray] }));
                          }}
                          className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {(stepEmailAttachments[index] || []).length > 0 && (
                          <div className="mt-3 space-y-2">
                            {(stepEmailAttachments[index] || []).map((file, fileIndex) => (
                              <div key={fileIndex} className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
                                <span className="text-sm text-gray-700 truncate max-w-xs">{file.name || `Pasted Screenshot ${fileIndex + 1}`}</span>
                                <button
                                  type="button"
                                  className="text-red-500 hover:text-red-700 text-sm ml-2"
                                  onClick={() => setStepEmailAttachments((prev) => ({ ...prev, [index]: prev[index].filter((_, i) => i !== fileIndex) }))}
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-60"
                        onClick={() => handleSendStepEmail(index)}
                        disabled={sendingStepEmailIndex === index}
                      >
                        {sendingStepEmailIndex === index ? "Sending..." : "Send Email"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-8 flex flex-wrap gap-3">
                {/* Link management — hidden in readOnly */}
                {!readOnly && step.step_type === "Others" && (
                  <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg" onClick={() => setAddingOthersLink({ stepIndex: index, type: "Others" })}>
                    Manage Other Assessment Links
                  </button>
                )}
                {!readOnly && step.step_type === "OA" && (
                  <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg" onClick={() => setAddingOALink({ stepIndex: index, type: "OA" })}>
                    Manage OA Links
                  </button>
                )}
                {!readOnly && step.step_type === "GD" && (
                  <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg" onClick={() => setAddingGDLink({ stepIndex: index, type: "GD" })}>
                    Manage GD Links
                  </button>
                )}
                {!readOnly && step.step_type === "Interview" && (
                  <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg" onClick={() => setAddingInterviewLink({ stepIndex: index, type: "Interview" })}>
                    Manage Interview Links
                  </button>
                )}

                {/* Shortlist buttons — hidden in readOnly */}
                {!readOnly && (
                  <button
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg"
                    onClick={() => setAddingShortlist({ stepIndex: index })}
                  >
                    Add Shortlisted Students
                  </button>
                )}

                {/* View shortlist visible to all */}
                <button
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg"
                  onClick={() => setViewingShortlist({ stepIndex: index })}
                >
                  View Shortlisted Students
                </button>

                {/* Save/Cancel for step editing — hidden in readOnly */}
                {!readOnly && editingStepIndex === index && editingSection === "hiring_workflow" && (
                  <>
                    <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300" onClick={() => handleSave("hiring_workflow")}>
                      Save
                    </button>
                    <button className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300" onClick={handleCancel}>
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    );
  }
};

export default ViewJobDetails;
