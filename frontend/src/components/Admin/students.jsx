import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlasses, faUsers } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Plus,
  Trash2,
  Edit,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Switch,
  FormHelperText,
} from "@mui/material";
import * as XLSX from "xlsx";

const StudentManager = () => {
  const [excelFile, setExcelFile] = useState(null);
  const [excelPreviewData, setExcelPreviewData] = useState([]);
  const [isExcelReady, setIsExcelReady] = useState(false);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [excelStage, setExcelStage] = useState("idle");
  const [existingStudents, setExistingStudents] = useState([]);
  const [showExcelPreviewModal, setShowExcelPreviewModal] = useState(false);
  const [updatingExisting, setUpdatingExisting] = useState(false);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [editProfile, setEditProfile] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false,
    type: "", 
    studentId: null,
    rollNoConfirmation: "",
    studentRollNo: "",
  });
  const [deactivateConfirmModal, setDeactivateConfirmModal] = useState({
    isOpen: false,
    studentId: null,
    rollNoConfirmation: "",
    studentRollNo: "",
    currentStatus: false,
  });
  const [filters, setFilters] = useState({
    department: "",
    course: "",
    placementstatus: "",
    minCgpa: "",
    gender: "",
    category: "",
    internshipstatus: "",
    batch: "",
    address: "",
    phone: "",
    email: "",
    name: "",
    rollno: "",
    cgpa: "",
    personalEmail: "",
    dob: "",
    Xth: "",
    XIIth: "",
    linkedin: "",
    isInterested: "",
    backlogs_history: "",
    debarred: "",
    disability: "",
    account_deactivate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 100;

  const departments = [
    "INTEGRATED TEACHER EDUCATION PROGRAMME", "BIO TECHNOLOGY", "CHEMICAL ENGINEERING", "CIVIL ENGINEERING",
    "COMPUTER SCIENCE AND ENGINEERING", "ELECTRICAL ENGINEERING", "ELECTRONICS AND COMMUNICATION ENGINEERING",
    "INDUSTRIAL AND PRODUCTION ENGINEERING", "INFORMATION TECHNOLOGY", "INSTRUMENTATION AND CONTROL ENGINEERING",
    "MECHANICAL ENGINEERING", "TEXTILE TECHNOLOGY", "DATA SCIENCE AND ENGINEERING", "ELECTRONICS AND VLSI ENGINEERING",
    "MATHEMATICS AND COMPUTING", "CHEMISTRY", "MATHEMATICS", "PHYSICS", "ARTIFICIAL INTELLIGENCE",
    "COMPUTER SCIENCE AND ENGINEERING (INFORMATION SECURITY)", "CONTROL AND INSTRUMENTATION ENGINEERING",
    "DATA ANALYTICS", "DESIGN ENGINEERING", "ELECTRIC VEHICLE DESIGN", "GEOTECHNICAL AND GEO-ENVIRONMENTAL ENGINEERING",
    "INDUSTRIAL ENGINEERING AND DATA ANALYTICS", "POWER SYSTEMS AND RELIABILITY", "RENEWABLE ENERGY",
    "SIGNAL PROCESSING AND MACHINE LEARNING", "STRUCTURAL AND CONSTRUCTION ENGINEERING", "TEXTILE ENGINEERING AND MANAGEMENT",
    "VLSI DESIGN", "MACHINE INTELLIGENCE AND AUTOMATION", "THERMAL AND ENERGY ENGINEERING", "HUMANITIES AND MANAGEMENT",
  ];

  const courses = ["B.Tech", "M.Tech", "MBA", "M.Sc.", "PHD", "B.Sc.-B.Ed."];
  const placementStatuses = ["Not Placed", "Below Dream", "Dream", "Super Dream"];
  const internshipStatuses = ["No Intern", "2m Intern", "6m Intern", "11m Intern"];
  const genders = ["Male", "Female", "Other"];
  const categories = ["General", "GEN-EWS", "SC", "ST", "OBC-NCL", "OBC"];

  const [filterInterestedPlacementBatch, setFilterInterestedPlacementBatch] = useState("");
  const [filterInterestedPlacementCourse, setFilterInterestedPlacementCourse] = useState("");
  const [interestedValue, setInterestedValue] = useState(true);
  const [bulkInterestLoading, setBulkInterestLoading] = useState(false);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/admin/students`, { withCredentials: true });
      setStudents(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch students");
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const url = editProfile._id
        ? `${import.meta.env.REACT_APP_BASE_URL}/admin/students/${editProfile._id}`
        : `${import.meta.env.REACT_APP_BASE_URL}/admin/students`;
      const method = editProfile._id ? axios.put : axios.post;
      await method(url, editProfile, { withCredentials: true });
      fetchStudents();
      setOpenEditDialog(false);
      toast.success(editProfile._id ? "Student updated successfully" : "Student added successfully");
    } catch (error) {
      toast.error(`Failed to ${editProfile._id ? "update" : "add"} student`);
    }
  };

  const handleExportJSON = () => {
    try {
      const dataToExport = applyFilters();
      const dateKeys = new Set(["createdAt", "updatedAt", "dob", "erpLastUpdated"]);

      // Logic from your HEAD (Your Version) for clean JSON formatting
      const formatExtendedJSON = (value, key = "") => {
        if (Array.isArray(value)) return value.map((item) => formatExtendedJSON(item));
        if (value && typeof value === "object") {
          if (value instanceof Date) return { $date: value.toISOString() };
          return Object.keys(value).reduce((acc, k) => {
            acc[k] = formatExtendedJSON(value[k], k);
            return acc;
          }, {});
        }
        if (key === "_id" && typeof value === "string") return { $oid: value };
        if (dateKeys.has(key) && typeof value === "string") return { $date: value };
        return value;
      };
      
      const exportData = dataToExport.length > 0 
        ? formatExtendedJSON(dataToExport) 
        : [{ name: "", email: "", rollno: "" }]; // Template if empty

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date().toISOString().split("T")[0];
      link.download = `students_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(dataToExport.length === 0 ? "Exported model template" : `Exported ${dataToExport.length} students`);
    } catch (error) {
      toast.error("Failed to export JSON");
    }
  };

  const handleBulkPlacementInterest = async () => {
    if (!filterInterestedPlacementBatch || !filterInterestedPlacementCourse) {
      toast.error("Please select batch and course");
      return;
    }
    if (!window.confirm(`Mark ${filterInterestedPlacementBatch} ${filterInterestedPlacementCourse} as ${interestedValue ? "Interested" : "Not Interested"}?`)) return;
    try {
      setBulkInterestLoading(true);
      const res = await axios.put(`${import.meta.env.REACT_APP_BASE_URL}/admin/students/placementInterest/update`, 
        { batch: filterInterestedPlacementBatch, isInterested: interestedValue, course: filterInterestedPlacementCourse }, 
        { withCredentials: true });
      toast.success(`Updated ${res.data.modifiedCount} students`);
      await fetchStudents();
    } catch (error) {
      toast.error("Failed to update interest");
    } finally { setBulkInterestLoading(false); }
  };

  // ... (Rest of logic: handleExcelSelect, handleExcelUpload, applyFilters etc. same as your file)
  // Ensure applyFilters includes your sir's new logic for erpLastUpdated and dob if needed.

  return (
    <div className="container mx-auto p-4">
       {/* UI code exactly as in your version, but without the <<<<<< HEAD marks */}
       {/* Ensure the Export JSON button calls the fixed handleExportJSON above */}
    </div>
  );
};

export default StudentManager;