import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  FaPlus,
  FaEye,
  FaDownload,
  FaEdit,
  FaTrash,
  FaLock,
} from "react-icons/fa";
import { Info } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import GTE3MonthApplicationPDF from "./GTE3MonthApplicationPDF"; // Assuming this PDF component exists or will be created similarly
const GTE3MonthForm = () => {
  const { userData } = useSelector((state) => state.auth);
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingActions, setLoadingActions] = useState(new Set());
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const [existingFiles, setExistingFiles] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});
  const [showDocumentsTooltip, setShowDocumentsTooltip] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [formData, setFormData] = useState({
    homeUniversityName: "",
    homeUniversityAddress: "",
    durationFrom: "",
    durationTo: "",
    nonDegreeActivities: "",
    internshipType: "",
    ApplicantName: userData?.name || "",
    fathersName: userData?.fathersName || "",
    mothersName: "",
    dateOfBirth: userData?.dob
      ? new Date(userData.dob).toISOString().split("T")[0]
      : "",
    birthCity: "",
    birthCountry: "",
    maritalStatus: "",
    nationality: userData?.nationality || "",
    passportNo: "",
    passportIssueDate: "",
    passportIssuePlace: "",
    passportValidUpTo: "",
    correspondenceAddress: "",
    phone: userData?.mobile || "",
    email: userData?.email || "",
    hostelNeeded: false,
    facultySupervisor: "",
    facultySupervisorDepartment: "",
    department: "",
    degree: "",
    academicYear: "",
    academicSemester: "",
    languagesKnown: "", // Changed to string for direct input
    declarationAccepted: false,
  });
  const [files, setFiles] = useState({
    photo: null,
    signature: null,
    documents: null,
  });
  const maritalStatusOptions = ["Single", "Married", "Divorced", "Widowed"];
  const departments = [
    "Biotechnology",
    "Chemistry",
    "Chemical Engineering",
    "Civil Engineering",
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Electrical Engineering",
    "Humanities and Management",
    "Industrial and Production Engineering",
    "Information Technology",
    "Instrumentation and Control Engineering",
    "Mathematics and Computing",
    "Mechanical Engineering",
    "Physics",
    "Center for Artificial Intelligence",
    "Center for Continuing Education",
    "Center for Energy and Environment",
    "Sports and Healthcare Research Centre",
    "Skill Development Centre",
  ];
  const baseURL = import.meta.env.REACT_APP_BASE_URL;
  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);
  // Reset form data
  const resetFormData = () => {
    Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls({});
    setFormData({
      homeUniversityName: "",
      homeUniversityAddress: "",
      durationFrom: "",
      durationTo: "",
      nonDegreeActivities: "",
      internshipType: "",
      ApplicantName: userData?.name || "",
      fathersName: userData?.fathersName || "",
      mothersName: "",
      dateOfBirth: userData?.dob
        ? new Date(userData.dob).toISOString().split("T")[0]
        : "",
      birthCity: "",
      birthCountry: "",
      maritalStatus: "",
      nationality: userData?.nationality || "",
      passportNo: "",
      passportIssueDate: "",
      passportIssuePlace: "",
      passportValidUpTo: "",
      correspondenceAddress: "",
      phone: userData?.mobile || "",
      email: userData?.email || "",
      hostelNeeded: false,
      facultySupervisor: "",
      facultySupervisorDepartment: "",
      department: "",
      degree: "",
      academicYear: "",
      academicSemester: "",
      languagesKnown: "", // String reset
      declarationAccepted: false,
    });
    setFiles({
      photo: null,
      signature: null,
      documents: null,
    });
    setExistingFiles({});
  };
  // Fetch all applications
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${baseURL}/outsource-internships/gte3month`, {
        withCredentials: true,
      })
      .then((response) => {
        setApplications(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching applications:", error);
        setLoading(false);
      });
  }, [baseURL]);
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  // Handle file changes
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Revoke previous URL if exists
      if (previewUrls[type]) {
        URL.revokeObjectURL(previewUrls[type]);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrls((prev) => ({ ...prev, [type]: url }));
    }
    setFiles((prev) => ({ ...prev, [type]: file }));
  };
  // Parse languages for validation and submission
  const parseLanguages = (inputString) => {
    return inputString
      .split(",")
      .map((lang) => lang.trim())
      .filter((lang) => lang);
  };
  // Validate form
  const validateForm = () => {
    const requiredFields = [
      "homeUniversityName",
      "homeUniversityAddress",
      "durationFrom",
      "durationTo",
      "internshipType",
      "ApplicantName",
      "fathersName",
      "mothersName",
      "dateOfBirth",
      "birthCity",
      "birthCountry",
      "maritalStatus",
      "nationality",
      "correspondenceAddress",
      "phone",
      "email",
      "facultySupervisor",
      "facultySupervisorDepartment",
      "department",
      "degree",
      "academicYear",
      "academicSemester",
    ];
    const stringFields = requiredFields;
    const basicFilled =
      stringFields.every((key) => formData[key].toString().trim() !== "") &&
      parseLanguages(formData.languagesKnown).length > 0 &&
      formData.declarationAccepted;
    if (!basicFilled) return false;
    // Check files
    if (!files.photo && !existingFiles.photo) return false;
    if (!files.signature && !existingFiles.signature) return false;
    if (!files.documents && !existingFiles.documents) return false;
    return true;
  };
  // Show toast
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "info" }),
      3000
    );
  };
  // Submit or update application
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast(
        "Please fill out all the fields and upload required files before submitting! 😎",
        "error"
      );
      return;
    }
    setIsSubmitting(true);
    const submitData = new FormData();
    const languages = parseLanguages(formData.languagesKnown);
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "languagesKnown") {
        submitData.append(key, JSON.stringify(languages)); // Send parsed array as JSON string
      } else {
        submitData.append(key, value);
      }
    });
    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        submitData.append(key, file);
      }
    });
    const url = editingId
      ? `/outsource-internships/gte3month/${editingId}`
      : `/outsource-internships/gte3month`;
    const method = editingId ? axios.put : axios.post;
    try {
      const response = await method(`${baseURL}${url}`, submitData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      if (editingId) {
        setApplications(
          applications.map((app) =>
            app._id === editingId ? { ...app, ...formData } : app
          )
        );
        setEditingId(null);
      } else {
        setApplications([...applications, response.data]);
      }
      resetFormData();
      setShowForm(false);
      showToast("Application submitted successfully!", "success");
    } catch (error) {
      console.error("Error submitting application:", error);
      const backendMessage = error?.response?.data?.message;
      showToast(
        backendMessage || "Oops! Something went wrong. Try again later! 😅",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  // Handle edit
  const handleEdit = (app) => {
    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toISOString().split("T")[0];
    };
    setFormData({
      ...app,
      dateOfBirth: formatDate(app.dateOfBirth),
      durationFrom: formatDate(app.durationFrom),
      durationTo: formatDate(app.durationTo),
      passportIssueDate: formatDate(app.passportIssueDate),
      passportValidUpTo: formatDate(app.passportValidUpTo),
      languagesKnown: app.languagesKnown ? app.languagesKnown.join(", ") : "", // Join array to string for editing
      hostelNeeded: app.hostelNeeded || false,
      declarationAccepted: app.declarationAccepted || false,
    });
    setExistingFiles({
      photo: app.photo || null,
      signature: app.signature || null,
      documents: app.documents || null,
    });
    Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls({});
    setFiles({
      photo: null,
      signature: null,
      documents: null,
    });
    setEditingId(app._id);
    setShowForm(true);
  };
  // Confirmation modal action performer
  const performConfirmAction = useCallback(async () => {
    if (confirmAction === "delete" && confirmId) {
      const deleteKey = `delete-${confirmId}`;
      setLoadingActions((prev) => new Set([...prev, deleteKey]));
      try {
        await axios.delete(
          `${baseURL}/outsource-internships/gte3month/${confirmId}`,
          { withCredentials: true }
        );
        setApplications((prev) => prev.filter((a) => a._id !== confirmId));
        showToast("Application deleted successfully!", "success");
      } catch (error) {
        console.error("Error deleting application:", error);
        showToast("Failed to delete application. Try again!", "error");
      } finally {
        setLoadingActions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(deleteKey);
          return newSet;
        });
      }
    } else if (confirmAction === "lock" && confirmId) {
      const lockKey = `lock-${confirmId}`;
      setLoadingActions((prev) => new Set([...prev, lockKey]));
      try {
        const app = applications.find((a) => a._id === confirmId);
        if (!app) {
          throw new Error("Application not found");
        }

        const photoUrl = app.photo ? `${baseURL}/${app.photo}` : null;
        const signatureUrl = app.signature
          ? `${baseURL}/${app.signature}`
          : null;

        const appWithImages = {
          ...app,
          photo: photoUrl,
          signature: signatureUrl,
        };

        const doc = (
          <GTE3MonthApplicationPDF
            application={appWithImages}
            baseURL={baseURL}
          />
        );
        const blob = await pdf(doc).toBlob();
        const filename = `GTE3Month_Application_${app._id.slice(-6)}.pdf`;
        const pdfFile = new File([blob], filename, { type: "application/pdf" });
        const submitData = new FormData();
        submitData.append("pdf", pdfFile);
        await axios.put(
          `${baseURL}/outsource-internships/gte3month/lock/${confirmId}`,
          submitData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );
        setApplications((prev) =>
          prev.map((a) => (a._id === confirmId ? { ...a, locked: true } : a))
        );
        showToast("Application Locked successfully!", "success");
      } catch (error) {
        console.error("Error locking application:", error);
        showToast("Failed to lock application. Try again!", "error");
      } finally {
        setLoadingActions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(lockKey);
          return newSet;
        });
      }
    }
  }, [confirmAction, confirmId, applications, baseURL]);
  // Handle delete
  const handleDelete = (id) => {
    setConfirmAction("delete");
    setConfirmId(id);
    setShowConfirm(true);
  };
  // Handle lock
  const handleLock = (id) => {
    setConfirmAction("lock");
    setConfirmId(id);
    setShowConfirm(true);
  };
  // Handle download
  const handleDownload = async (app) => {
    const downloadKey = `download-${app._id}`;
    setLoadingActions((prev) => new Set([...prev, downloadKey]));
    try {
      console.log("Starting download for app:", app._id);
      console.log("baseURL:", baseURL);

      const photoUrl = app.photo ? `${baseURL}/${app.photo}` : null;
      const signatureUrl = app.signature ? `${baseURL}/${app.signature}` : null;

      console.log("photoUrl:", photoUrl);
      console.log("signatureUrl:", signatureUrl);

      const appWithImages = {
        ...app,
        photo: photoUrl,
        signature: signatureUrl,
      };

      const doc = (
        <GTE3MonthApplicationPDF
          application={appWithImages}
          baseURL={baseURL}
        />
      );
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GTE3Month_Application_${app._id.slice(-6)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("PDF downloaded successfully!", "success");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast("Failed to download PDF. Try again!", "error");
    } finally {
      setLoadingActions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(downloadKey);
        return newSet;
      });
    }
  };
  // Handle preview (simple view, no modal for now)
  const handlePreview = (app) => {
    setSelectedApp(app);
    // Could open a modal here similar to NOCPreview
    console.log("Preview:", app); // Placeholder
  };
  const renderApplicationList = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold flex items-center space-x-3 text-gray-900">
          <span>
            Long Term <span className="text-custom-blue">Internship</span> (more
            than 3 Months) Application
          </span>
        </h2>
        <div className="flex items-center gap-4 flex-1 justify-end">
          <button
            onClick={() => {
              setShowForm(true);
              resetFormData();
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-custom-blue text-white rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-600 transition duration-300"
          >
            <FaPlus />
            <span>Apply Now</span>
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : applications.length === 0 ? (
        <p className="text-gray-600 italic">No applications available.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => {
            const isLocked = app.locked || false;
            const deleteKey = `delete-${app._id}`;
            const lockKey = `lock-${app._id}`;
            const downloadKey = `download-${app._id}`;

            const statusLabel = app.status
              ? app.status.charAt(0).toUpperCase() + app.status.slice(1)
              : "Pending";

            return (
              <div
                key={app._id}
                className="p-6 bg-white rounded-xl shadow-lg cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-semibold text-gray-900">
                    Faculty:{" "}
                    <span className="text-gray-500">
                      {app.facultySupervisor}
                    </span>
                  </p>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded-full ${
                      app.status === "verified"
                        ? "bg-green-100 text-green-800"
                        : app.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {statusLabel}
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-900">
                  Department:{" "}
                  <span className="text-gray-500">
                    {app.facultySupervisorDepartment}
                  </span>
                </p>
                {/* <p className="bg-custom-blue/10 rounded-lg p-1 text-custom-blue text-xs font-semibold inline-block"># {app._id.slice(-6)}</p> */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {!isLocked && (
                    <button
                      onClick={() => handleEdit(app)}
                      className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </button>
                  )}
                  {/* <button
                    onClick={() => handlePreview(app)}
                    className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
                  >
                    <FaEye />
                    <span>Preview</span>
                  </button> */}
                  {!isLocked ? (
                    <>
                      <button
                        onClick={() => handleLock(app._id)}
                        disabled={loadingActions.has(lockKey)}
                        className={`flex items-center space-x-1 text-sm px-3 py-1 rounded-md border transition duration-300 ${
                          loadingActions.has(lockKey)
                            ? "text-gray-400 border-gray-300 cursor-not-allowed"
                            : "text-custom-blue hover:text-white border-custom-blue hover:bg-custom-blue"
                        }`}
                      >
                        <FaLock />
                        <span>
                          {loadingActions.has(lockKey) ? "Locking..." : "Lock"}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDelete(app._id)}
                        disabled={loadingActions.has(deleteKey)}
                        className={`flex items-center space-x-1 text-sm px-3 py-1 rounded-md border transition duration-300 ${
                          loadingActions.has(deleteKey)
                            ? "text-gray-400 border-gray-300 cursor-not-allowed"
                            : "text-red-500 hover:text-white border-red-500 hover:bg-red-500"
                        }`}
                      >
                        <FaTrash />
                        <span>
                          {loadingActions.has(deleteKey)
                            ? "Deleting..."
                            : "Delete"}
                        </span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleDownload(app)}
                      disabled={loadingActions.has(downloadKey)}
                      className={`flex items-center space-x-1 text-sm px-3 py-1 rounded-md border transition duration-300 ${
                        loadingActions.has(downloadKey)
                          ? "text-gray-400 border-gray-300 cursor-not-allowed"
                          : "text-green-600 hover:text-white border-green-600 hover:bg-green-600"
                      }`}
                    >
                      <FaDownload />
                      <span>
                        {loadingActions.has(downloadKey)
                          ? "Downloading..."
                          : "Download PDF"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
  const renderFilePreview = (type) =>
    previewUrls[type] && (
      <div className="mt-1">
        {type === "photo" || type === "signature" ? (
          <img
            src={previewUrls[type]}
            alt={`${type} Preview`}
            className="max-w-48 max-h-24 object-contain border rounded"
          />
        ) : (
          <a
            href={previewUrls[type]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline text-sm hover:text-blue-700"
          >
            View Selected File
          </a>
        )}
      </div>
    );
  // Confirmation Modal
  const renderConfirmModal = () =>
    showConfirm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm {confirmAction === "delete" ? "Delete" : "Lock"}{" "}
              Application
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to {confirmAction} this application? This
              action cannot be undone and will{" "}
              {confirmAction === "delete" ? "permanently remove" : "finalize"}{" "}
              your submission.
            </p>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmAction(null);
                  setConfirmId(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  performConfirmAction();
                  setShowConfirm(false);
                  setConfirmAction(null);
                  setConfirmId(null);
                }}
                className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition duration-200"
              >
                {confirmAction === "delete" ? "Delete" : "Lock"} Application
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  return (
    <div className="container mx-auto p-6 min-h-screen">
      {toast.show && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg animate-fade-in-out z-[1000] ${
            toast.type === "error"
              ? "bg-white border border-red-500 text-red-500"
              : toast.type === "success"
                ? "bg-white border border-green-500 text-green-500"
                : "bg-white border border-blue-500 text-blue-500"
          }`}
        >
          {toast.message}
        </div>
      )}
      {renderConfirmModal()}
      {!showForm ? (
        renderApplicationList()
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-8 mb-8 border border-gray-200 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              Apply for{" "}
              <span className="text-custom-blue">
                Long Term Internship (more than 3 Months)
              </span>
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                resetFormData();
              }}
              className="text-gray-600 hover:text-gray-800 text-xl font-bold"
            >
              ×
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Home University / College Name{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="homeUniversityName"
                  value={formData.homeUniversityName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Home University / College Address{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="homeUniversityAddress"
                  value={formData.homeUniversityAddress}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Duration From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="durationFrom"
                  value={formData.durationFrom}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Duration To <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="durationTo"
                  value={formData.durationTo}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Intended activities during stay as non-degree student{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nonDegreeActivities"
                  value={formData.nonDegreeActivities}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Internship Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="internshipType"
                  value={formData.internshipType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Applicant Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ApplicantName"
                  value={formData.ApplicantName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Father's Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fathersName"
                  value={formData.fathersName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Mother's Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="mothersName"
                  value={formData.mothersName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Birth City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="birthCity"
                  value={formData.birthCity}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Birth Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="birthCountry"
                  value={formData.birthCountry}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Marital Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="" disabled hidden>
                    Select Status
                  </option>
                  {maritalStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Nationality <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Applicant's Phone no. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Applicant's Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Applicant's Department (at Home University/College){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Applicant's Degree (at Home University/College){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleInputChange}
                  placeholder="e.g., B.Tech"
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Applicant's Academic Year{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                  placeholder="e.g.,5th Semester"
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Applicant's Academic Semester{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="academicSemester"
                  value={formData.academicSemester}
                  onChange={handleInputChange}
                  placeholder="e.g.,5th Semester"
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Languages Known (comma-separated){" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="languagesKnown"
                  value={formData.languagesKnown}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="e.g., English, Hindi, French"
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-600">
                  Correspondence Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="correspondenceAddress"
                  value={formData.correspondenceAddress}
                  onChange={handleInputChange}
                  rows={2}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Faculty Supervisor at NIT Jalandhar (if intended for
                  Research/Dissertation/Project Work){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="facultySupervisor"
                  value={formData.facultySupervisor}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Faculty Supervisor's Department{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  name="facultySupervisorDepartment"
                  value={formData.facultySupervisorDepartment}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="" disabled hidden>
                    Select Department
                  </option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                  Passport Details
                  <div className="group relative cursor-pointer">
                    <div className="w-5 h-5 flex items-center justify-center rounded-full text-gray-600">
                      <Info size={14} />
                    </div>
                    <div
                      className="
                        absolute
                        hidden group-hover:block
                        bg-gray-800 text-white text-sm px-3 py-2 rounded-md shadow-lg
                        whitespace-normal w-64 sm:w-62 md:w-70 lg:w-86
                        z-50
                        left-1/2 -translate-x-1/2 top-full mt-2
                        sm:left-6 sm:top-1/2 sm:-translate-y-1/2 sm:translate-x-0 sm:mt-0
                      "
                    >
                      Mandatory for foreign students only
                    </div>
                  </div>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Passport No.
                    </label>
                    <input
                      type="text"
                      name="passportNo"
                      value={formData.passportNo}
                      onChange={handleInputChange}
                      className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Passport Issue Date
                    </label>
                    <input
                      type="date"
                      name="passportIssueDate"
                      value={formData.passportIssueDate}
                      onChange={handleInputChange}
                      className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Passport Issue Place
                    </label>
                    <input
                      type="text"
                      name="passportIssuePlace"
                      value={formData.passportIssuePlace}
                      onChange={handleInputChange}
                      className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Passport Valid Up To
                    </label>
                    <input
                      type="date"
                      name="passportValidUpTo"
                      value={formData.passportValidUpTo}
                      onChange={handleInputChange}
                      className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600">
                  Hostel Needed <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="hostelNeeded"
                    checked={formData.hostelNeeded}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm">
                    Yes, I need hostel accommodation
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4">
                Upload Documents <span className="text-red-500">*</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Photograph
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "photo")}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {files.photo && (
                    <p className="text-sm text-green-600 mt-1">
                      Selected: {files.photo.name}
                    </p>
                  )}
                  {renderFilePreview("photo")}
                  {existingFiles.photo && !files.photo && (
                    <p className="text-sm text-blue-600 mt-1">
                      <a
                        href={`${baseURL}/${existingFiles.photo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-800"
                      >
                        View Current
                      </a>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Signature
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "signature")}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {files.signature && (
                    <p className="text-sm text-green-600 mt-1">
                      Selected: {files.signature.name}
                    </p>
                  )}
                  {renderFilePreview("signature")}
                  {existingFiles.signature && !files.signature && (
                    <p className="text-sm text-blue-600 mt-1">
                      <a
                        href={`${baseURL}/${existingFiles.signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-800"
                      >
                        View Current
                      </a>
                    </p>
                  )}
                </div>
                <div className="relative">
                  <label className="flex items-center text-sm font-medium text-gray-600 cursor-pointer">
                    Documents (Combined PDF, max 5MB)
                    <Info
                      className="ml-2 h-4 w-4 text-blue-500 cursor-pointer"
                      onClick={() =>
                        setShowDocumentsTooltip(!showDocumentsTooltip)
                      }
                    />
                  </label>
                  {showDocumentsTooltip && (
                    <ul className="absolute top-full left-0 mt-1 z-10 bg-white border border-gray-200 rounded-md shadow-lg p-3 w-64 text-xs text-gray-700 space-y-1 list-disc list-inside">
                      <li>Recommendation from Home University</li>
                      <li>Proof of registration at Home University</li>
                      <li>Academic Record till last semester</li>
                      <li>
                        Academic Record (Transcripts) for foreign students
                      </li>
                      <li>Statement of purpose</li>
                      <li>
                        Acceptance letter / Recommendation of Supervisor from
                        NIT Jalandhar
                      </li>
                      <li>
                        Copy of Passport (for foreign nationals, subject to MEA
                        clearance)
                      </li>
                    </ul>
                  )}
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleFileChange(e, "documents")}
                    className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {files.documents && (
                    <p className="text-sm text-green-600 mt-1">
                      Selected: {files.documents.name}
                    </p>
                  )}
                  {renderFilePreview("documents")}
                  {existingFiles.documents && !files.documents && (
                    <p className="text-sm text-blue-600 mt-1">
                      <a
                        href={`${baseURL}/${existingFiles.documents}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-800"
                      >
                        View Current
                      </a>
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-600">
                  Declaration <span className="text-red-500">*</span>
                </label>
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="declarationAccepted"
                    checked={formData.declarationAccepted}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    required
                  />
                  <label className="text-sm leading-relaxed">
                    I hereby declare that the statement made in this application
                    are true, complete and correct to the best of my knowledge
                    and belief. I understand that if any false information is
                    found or if any required document is not uploaded, my
                    internship application can be canceled at any time.
                  </label>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !validateForm()}
              className={`w-full p-3 rounded-md transition duration-300 ${
                isSubmitting || !validateForm()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-custom-blue text-white hover:bg-blue-700"
              }`}
            >
              {isSubmitting
                ? "Submitting..."
                : editingId
                  ? "Update Application"
                  : "Submit Application"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
export default GTE3MonthForm;
