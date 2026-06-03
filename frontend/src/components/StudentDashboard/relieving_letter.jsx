import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  FaPlus,
  FaEye,
  FaDownload,
  FaEdit,
  FaLock,
  FaTrash,
} from "react-icons/fa";
import GenerateNOC from "./generate-relieving";
import NOCPreview from "./relieving_letter_preview";
import { Info } from "lucide-react";

const relieving_letter = () => {
  const { userData } = useSelector((state) => state.auth);
  const [nocs, setNocs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedNoc, setSelectedNoc] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const [internshipFromError, setInternshipFromError] = useState("");
  const [internshipToError, setInternshipToError] = useState("");
  const [startupEstablishedError, setStartupEstablishedError] = useState("");
  const [companyAgeError, setCompanyAgeError] = useState("");
  const [companyTurnoverError, setCompanyTurnoverError] = useState("");
  const [stipendError, setStipendError] = useState("");
  const [existingFiles, setExistingFiles] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});
  const semesterOptions = {
    "1st": ["1st", "2nd"],
    "2nd": ["3rd", "4th"],
    "3rd": ["5th", "6th"],
    "4th": ["7th", "8th"],
  };
  const [formData, setFormData] = useState({
    companyName: "",
    respondentEmail: userData?.email || "",
    salutation: userData?.gender === "Female" ? "Ms." : "Mr.",
    studentName: userData?.name || "",
    rollNo: userData?.rollno || "",
    course: userData?.course || "",
    batch: userData?.batch || "",
    year: "",
    semester: "",
    department: userData?.department || "",
    internshipFrom: "",
    internshipTo: "",
    internshipDuration: "",
    internshipMode: "",
    contactPersonName: "",
    contactPersonDesignation: "",
    contactPersonPhone: "",
    contactPersonEmail: "",
    companyminAgeis3: "",
    companyTurnoverLastFY: "",
    companyType: "",
    stipend: "",
    bankdetails: {
      bankName: "",
      accountNumber: "",
      accountHolderName: "",
      ifscCode: "",
    },
    startupEstablishedDate: "",
    businessRegistrationType: "",
    panNo: "",
    gstNo: "",
    MSMERegistrationCategory: "",
    startupBankDetails: {
      bankName: "",
      accountNumber: "",
      accountHolderName: "",
      ifscCode: "",
    },
    dateOfJoining: "",
    purpose: "",
  });
  const [files, setFiles] = useState({
    offerLetter: null,
    turnoverReport: null,
    mailScreenshot: null,
    startupIndiaRecognitionCertificate: null,
    signature: null,
  });
  const [decl1, setDecl1] = useState(false);
  const [decl2, setDecl2] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const isEligible =
    formData.course === "M.Tech" ||
    (formData.course === "B.Tech" && formData.year === "4th");
  const needsExtra =
    isEligible &&
    formData.internshipMode &&
    formData.internshipMode !== "On-Campus";
  const baseURL = import.meta.env.REACT_APP_BASE_URL;

  // Cleanup preview URLs on unmount
  // useEffect(() => {
  //   return () => {
  //     Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
  //   };
  // }, [previewUrls]);

  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const resetFormData = () => {
    Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls({});
    setFormData({
      companyName: "",
      respondentEmail: userData?.email || "",
      salutation: userData?.gender === "Female" ? "Ms." : "Mr.",
      studentName: userData?.name || "",
      rollNo: userData?.rollno || "",
      course: userData?.course || "",
      batch: userData?.batch || "",
      year: "",
      semester: "",
      department: userData?.department || "",
      internshipFrom: "",
      internshipTo: "",
      internshipDuration: "",
      internshipMode: "",
      contactPersonName: "",
      contactPersonDesignation: "",
      contactPersonPhone: "",
      contactPersonEmail: "",
      companyminAgeis3: "",
      companyTurnoverLastFY: "",
      companyType: "",
      stipend: "",
      bankdetails: {
        bankName: "",
        accountNumber: "",
        accountHolderName: "",
        ifscCode: "",
      },
      startupEstablishedDate: "",
      businessRegistrationType: "",
      panNo: "",
      gstNo: "",
      MSMERegistrationCategory: "",
      startupBankDetails: {
        bankName: "",
        accountNumber: "",
        accountHolderName: "",
        ifscCode: "",
      },
      dateOfJoining: "",
      purpose: "",
    });
    setFiles({
      offerLetter: null,
      turnoverReport: null,
      mailScreenshot: null,
      startupIndiaRecognitionCertificate: null,
      signature: null,
    });
    setExistingFiles({});
    setDecl1(false);
    setDecl2(false);
    setInternshipFromError("");
    setInternshipToError("");
    setStartupEstablishedError("");
    setCompanyAgeError("");
    setCompanyTurnoverError("");
    setStipendError("");
  };

  // Fetch all NOCs
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${import.meta.env.REACT_APP_BASE_URL}/relieving`, {
        withCredentials: true,
      })
      .then((response) => {
        setNocs(response.data);
        console.log(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching Relievings:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (formData.purpose === "FTE") {
      setFormData((prev) => ({
        ...prev,
        internshipFrom: "",
        internshipTo: "",
        internshipDuration: "",
        internshipMode: "",
        contactPersonName: "",
        contactPersonDesignation: "",
        contactPersonPhone: "",
        contactPersonEmail: "",
        companyminAgeis3: "",
        companyTurnoverLastFY: "",
        companyType: "",
        stipend: "",
        bankdetails: {
          bankName: "",
          accountNumber: "",
          accountHolderName: "",
          ifscCode: "",
        },
        startupEstablishedDate: "",
        businessRegistrationType: "",
        panNo: "",
        gstNo: "",
        MSMERegistrationCategory: "",
        startupBankDetails: {
          bankName: "",
          accountNumber: "",
          accountHolderName: "",
          ifscCode: "",
        },
      }));

      setFiles({
        offerLetter: null,
        turnoverReport: null,
        mailScreenshot: null,
        startupIndiaRecognitionCertificate: null,
        signature: null,
      });
    }
  }, [formData.purpose]);

  // Auto-calculate internship duration
  useEffect(() => {
    if (formData.purpose !== "Internship") return;
    if (formData.internshipFrom && formData.internshipTo) {
      const from = new Date(formData.internshipFrom);
      const to = new Date(formData.internshipTo);
      if (to > from) {
        const diffTime = to - from;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setFormData((prev) => ({
          ...prev,
          internshipDuration: `${diffDays} days`,
        }));
      } else {
        setFormData((prev) => ({ ...prev, internshipDuration: "" }));
      }
    } else {
      setFormData((prev) => ({ ...prev, internshipDuration: "" }));
    }
  }, [formData.internshipFrom, formData.internshipTo, formData.purpose]);

  // Update agreed state
  useEffect(() => {
    setAgreed(decl1 && decl2);
  }, [decl1, decl2]);

  // Revalidate stipend when company type changes
  useEffect(() => {
    if (formData.stipend.trim() !== "" && formData.companyType !== "") {
      const e = { target: { name: "stipend", value: formData.stipend } };
      handleInputChange(e);
    }
  }, [formData.companyType]);

  // Clear fields based on mode
  useEffect(() => {
    if (formData.internshipMode !== "Off-Campus") {
      setFormData((prev) => ({
        ...prev,
        contactPersonName: "",
        contactPersonDesignation: "",
        contactPersonPhone: "",
        contactPersonEmail: "",
        companyminAgeis3: "",
        companyTurnoverLastFY: "",
        companyType: "",
        stipend: "",
        bankdetails: {
          bankName: "",
          accountNumber: "",
          accountHolderName: "",
          ifscCode: "",
        },
      }));
      setFiles((prev) => ({
        ...prev,
        offerLetter: null,
        turnoverReport: null,
        mailScreenshot: null,
      }));
      setCompanyAgeError("");
      setCompanyTurnoverError("");
      setStipendError("");
    }
    if (formData.internshipMode !== "Own Startup") {
      setFormData((prev) => ({
        ...prev,
        startupEstablishedDate: "",
        businessRegistrationType: "",
        panNo: "",
        gstNo: "",
        MSMERegistrationCategory: "",
        startupBankDetails: {
          bankName: "",
          accountNumber: "",
          accountHolderName: "",
          ifscCode: "",
        },
      }));
      setFiles((prev) => ({
        ...prev,
        startupIndiaRecognitionCertificate: null,
      }));
      setStartupEstablishedError("");
    }
  }, [formData.internshipMode]);

  // Validate dates against batch cutoff
  const validateDate = (dateValue, setter, fieldName) => {
    if (!dateValue) {
      setter("");
      return true;
    }
    const selectedDate = new Date(dateValue);
    const batchYear = parseInt(formData.batch);
    if (isNaN(batchYear)) {
      setter("Invalid batch year. Please contact support.");
      return false;
    }
    const cutoff = new Date(batchYear, 5, 11); // June 11 (month 5 is June)
    cutoff.setHours(23, 59, 59, 999); // End of day for comparison
    if (selectedDate > cutoff) {
      setter(
        `Please select any date before or on June 11, ${batchYear} for ${fieldName}`,
      );
      return false;
    } else {
      setter("");
      return true;
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "year") {
      setFormData((prev) => ({ ...prev, [name]: value, semester: "" }));
      return;
    }
    if (name === "companyminAgeis3") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (value === "No") {
        setCompanyAgeError("Company must be at least 3 years old.");
      } else {
        setCompanyAgeError("");
      }
    } else if (name === "companyTurnoverLastFY") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (value.trim() === "") {
        setCompanyTurnoverError("");
      } else {
        const val = parseFloat(value);
        if (isNaN(val) || val < 1) {
          setCompanyTurnoverError("Company turnover must be at least 1 crore.");
        } else {
          setCompanyTurnoverError("");
        }
      }
    } else if (name === "stipend") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (value.trim() === "") {
        setStipendError("");
      } else {
        const companyType = formData.companyType;
        if (companyType !== "") {
          const minStipend = companyType === "IT Company" ? 25000 : 10000;
          const val = parseFloat(value);
          if (isNaN(val) || val < minStipend) {
            setStipendError(
              `Stipend must be at least ${minStipend} for ${companyType}.`,
            );
          } else {
            setStipendError("");
          }
        }
      }
    } else if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (name === "internshipFrom") {
      validateDate(value, setInternshipFromError, "Internship From");
    } else if (name === "internshipTo") {
      validateDate(value, setInternshipToError, "Internship To");
    }
    if (
      name === "startupEstablishedDate" &&
      formData.internshipMode === "Own Startup"
    ) {
      if (value === "") {
        setStartupEstablishedError("");
      } else {
        const date = new Date(value);
        const now = new Date();
        const threeYearsAgo = new Date(
          now.getFullYear() - 3,
          now.getMonth(),
          now.getDate(),
        );
        if (date > now || date > threeYearsAgo) {
          setStartupEstablishedError(
            `Startup must be established at least 3 years ago (on or before ${threeYearsAgo.toISOString().split("T")[0]}).`,
          );
        } else {
          setStartupEstablishedError("");
        }
      }
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

  // Validate form
  const validateForm = () => {
    let basicFields = ["companyName", "year", "semester"];

    if (formData.purpose === "Internship") {
      basicFields.push(
        "internshipFrom",
        "internshipTo",
        "internshipDuration",
        "internshipMode",
      );
    }

    if (formData.purpose === "FTE") {
      basicFields.push("dateOfJoining");
    }

    const basicFilled = basicFields.every(
      (key) => String(formData[key] || "").trim() !== "",
    );

    if (formData.purpose === "Internship") {
      if (!basicFilled || internshipFromError || internshipToError) {
        return false;
      }
    }

    if (formData.purpose === "FTE") {
      return basicFilled;
    }

    if (formData.purpose === "FTE") return true;
    if (formData.internshipMode === "Off-Campus") {
      const contactFields = [
        "contactPersonName",
        "contactPersonDesignation",
        "contactPersonPhone",
        "contactPersonEmail",
      ];
      const contactFilled = contactFields.every(
        (key) => String(formData[key] || "").trim() !== "",
      );
      if (!contactFilled) return false;
      if (!needsExtra) return true;
      if (formData.companyminAgeis3 === "") return false;
      if (formData.companyminAgeis3 !== "Yes") return false;
      if (formData.companyTurnoverLastFY.trim() === "") return false;
      const turnover = parseFloat(formData.companyTurnoverLastFY);
      if (isNaN(turnover) || turnover < 1) return false;
      if (formData.companyType.trim() === "") return false;
      if (formData.stipend.trim() === "") return false;
      const minStipend = formData.companyType === "IT Company" ? 25000 : 10000;
      const stip = parseFloat(formData.stipend);
      if (isNaN(stip) || stip < minStipend) return false;
      const bankFilled = Object.values(formData.bankdetails).every(
        (v) => v.toString().trim() !== "",
      );
      if (!bankFilled) return false;
      if (
        !(files.offerLetter || existingFiles.offerLetter) ||
        !(files.turnoverReport || existingFiles.turnoverReport) ||
        !(files.mailScreenshot || existingFiles.mailScreenshot)
      )
        return false;
    } else if (formData.internshipMode === "Own Startup") {
      if (!needsExtra) return true;
      if (formData.startupEstablishedDate.trim() === "") return false;
      const date = new Date(formData.startupEstablishedDate);
      const now = new Date();
      const threeYearsAgo = new Date(
        now.getFullYear() - 3,
        now.getMonth(),
        now.getDate(),
      );
      if (isNaN(date.getTime()) || date > now || date > threeYearsAgo)
        return false;
      if (formData.businessRegistrationType.trim() === "") return false;
      if (formData.panNo.trim() === "") return false;
      if (formData.gstNo.trim() === "") return false;
      if (formData.MSMERegistrationCategory.trim() === "") return false;
      const startupBankFilled = Object.values(
        formData.startupBankDetails,
      ).every((v) => v.toString().trim() !== "");
      if (!startupBankFilled) return false;
      if (
        !(
          files.startupIndiaRecognitionCertificate ||
          existingFiles.startupIndiaRecognitionCertificate
        )
      )
        return false;
    }
    if (needsExtra && !(decl1 && decl2)) return false;
    if (needsExtra && !(files.signature || existingFiles.signature))
      return false;
    return true;
  };

  // Show toast
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "info" }),
      3000,
    );
  };

  // Submit or update NOC
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast(
        "Please fill out all the fields and correct any errors before submitting! 😎",
        "error",
      );
      return;
    }
    setIsSubmitting(true);
    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "bankdetails" || key === "startupBankDetails") {
        Object.entries(value).forEach(([subkey, subval]) => {
          submitData.append(`${key}[${subkey}]`, subval);
        });
      } else {
        submitData.append(key, value);
      }
    });
    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        submitData.append(key, file);
      }
    });
    const url = editingId ? `/relieving/${editingId}` : `/relieving`;
    const method = editingId ? axios.put : axios.post;
    try {
      const response = await method(
        `${import.meta.env.REACT_APP_BASE_URL}${url}`,
        submitData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );
      if (editingId) {
        setNocs(
          nocs.map((noc) =>
            noc._id === editingId ? { ...noc, ...formData } : noc,
          ),
        );
        setEditingId(null);
      } else {
        setNocs([...nocs, response.data]);
      }
      resetFormData();
      setShowForm(false);
    } catch (error) {
      console.error("Error submitting Relieving:", error);
      const backendMessage = error?.response?.data?.message;

      if (backendMessage) {
        showToast(backendMessage, "error");
      } else {
        showToast("Oops! Something went wrong. Try again later! 😅", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (noc) => {
    const formatDate = (date) =>
      date ? new Date(date).toISOString().split("T")[0] : "";
    setFormData({
      ...noc,
      internshipFrom: formatDate(noc.internshipFrom),
      internshipTo: formatDate(noc.internshipTo),
      startupEstablishedDate: noc.startupEstablishedDate
        ? formatDate(noc.startupEstablishedDate)
        : "",
      companyminAgeis3:
        noc.internshipMode === "Off-Campus"
          ? noc.companyminAgeis3
            ? "Yes"
            : "No"
          : "",
      bankdetails: noc.bankdetails || {
        bankName: "",
        accountNumber: "",
        accountHolderName: "",
        ifscCode: "",
      },
      startupBankDetails: noc.startupBankDetails || {
        bankName: "",
        accountNumber: "",
        accountHolderName: "",
        ifscCode: "",
      },
    });
    setExistingFiles({
      offerLetter: noc.offerLetter || null,
      turnoverReport: noc.turnoverReport || null,
      mailScreenshot: noc.mailScreenshot || null,
      startupIndiaRecognitionCertificate:
        noc.startupIndiaRecognitionCertificate || null,
      signature: noc.signature || null,
    });
    Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls({});
    setFiles({
      offerLetter: null,
      turnoverReport: null,
      mailScreenshot: null,
      startupIndiaRecognitionCertificate: null,
      signature: null,
    });
    setDecl1(true);
    setDecl2(true);
    setInternshipFromError("");
    setInternshipToError("");
    setStartupEstablishedError("");
    setCompanyAgeError("");
    setCompanyTurnoverError("");
    setStipendError("");
    setEditingId(noc._id);
    setShowForm(true);
  };

  // Handle lock
  const handleLock = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.REACT_APP_BASE_URL}/relieving/lock/${id}`,
        {},
        { withCredentials: true },
      );
      setNocs((prev) =>
        prev.map((n) => (n._id === id ? { ...n, locked: true } : n)),
      );
      showToast("Relieving Letter locked successfully!", "success");
    } catch (error) {
      console.error("Error locking Relieving Letter:", error);
      showToast("Failed to lock Relieving Letter. Try again!", "error");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this Relieving Letter? This action cannot be undone.",
      )
    )
      return;
    try {
      await axios.delete(
        `${import.meta.env.REACT_APP_BASE_URL}/relieving/${id}`,
        {
          withCredentials: true,
        },
      );
      setNocs((prev) => prev.filter((n) => n._id !== id));
      showToast("Relieving Letter deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting Relieving Letter:", error);
      showToast("Failed to delete Relieving Letter. Try again!", "error");
    }
  };

  // Handle preview
  const handlePreview = (noc) => {
    setSelectedNoc(noc);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setSelectedNoc(null);
  };

  const [isDownloading, setIsDownloading] = useState(false);

  // 1. Add 'async' here
const handleDownload = async (nocData) => { 
  if (isDownloading) return;
  setIsDownloading(true);

  try {
    const response = await axios.get(
      `${import.meta.env.REACT_APP_BASE_URL}/relieving/download-verify/${nocData._id}`,
      { withCredentials: true }
    );

    const verifiedNocData = response.data;

    setTimeout(async () => {
      try {
        await GenerateNOC(verifiedNocData);
      } catch (err) {
        console.error("PDF Generation Error:", err);
      } finally {
        setIsDownloading(false);
      }
    }, 100);
    
  } catch (err) {
    console.error("Verification failed:", err);
    const message = err.response?.data?.message || "Verification failed. Try again.";
    
    alert(message); 
    setIsDownloading(false);
  }
};

  const renderNOCList = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold flex items-center space-x-3 text-gray-900">
          <span>Relieving Letter</span>
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
            <span>Apply for Relieving Letter</span>
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : nocs.length === 0 ? (
        <p className="text-gray-600 italic">No Relieving Letter available.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {nocs.map((noc) => (
            <div
              key={noc._id}
              className="p-6 bg-white rounded-xl shadow-lg cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-lg font-semibold text-gray-900">
                  {noc.companyName}
                </p>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded-full ${
                    noc.nocStatus === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : noc.nocStatus === "Rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                  }`}
                >
                  {noc.nocStatus}
                </span>
              </div>
              <p className="bg-custom-blue/10 rounded-lg p-1 text-custom-blue text-xs font-semibold inline-block">
                # {noc.nocId}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {!noc.locked ? (
                  <>
                    <button
                      onClick={() => handleEdit(noc)}
                      className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleLock(noc._id)}
                      className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
                    >
                      <FaLock />
                      <span>Lock</span>
                    </button>
                    <button
                      onClick={() => handleDelete(noc._id)}
                      className="flex items-center space-x-1 text-sm text-red-500 hover:text-white px-3 py-1 rounded-md border border-red-500 hover:bg-red-500 transition duration-300"
                    >
                      <FaTrash />
                      <span>Delete</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handlePreview(noc)}
                      className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
                    >
                      <FaEye />
                      <span>Preview</span>
                    </button>
                    {/* {noc.nocStatus === "Issued" && (
                      <button
                        onClick={() => handleDownload(noc)}
                        disabled={isDownloading}
                        className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
                      >
                        <FaDownload />
                        <span>
                          {isDownloading
                            ? "Generating..."
                            : "Download Relieving Letter"}
                        </span>
                      </button>
                    )} */}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFilePreview = (type) =>
    previewUrls[type] && (
      <div className="mt-1">
        {type === "signature" ? (
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
      {!showForm ? (
        showPreview && selectedNoc ? (
          <NOCPreview noc={selectedNoc} onClose={handleClosePreview} />
        ) : (
          renderNOCList()
        )
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-8 mb-8 border border-gray-200 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              Apply for{" "}
              <span className="text-custom-blue">Relieving Letter</span>
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
                  Student Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Roll No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Course <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Department <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Respondent Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="respondentEmail"
                  value={formData.respondentEmail}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Year <span className="text-red-500">*</span>
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${formData.year === "" ? "text-gray-600" : "text-black"}`}
                  required
                >
                  <option value="" disabled hidden>
                    Select Year
                  </option>
                  <option value="1st">1st</option>
                  <option value="2nd">2nd</option>
                  <option value="3rd">3rd</option>
                  <option value="4th">4th</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  disabled={!formData.year}
                  className={`mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${!formData.year || formData.semester === "" ? "text-gray-600 bg-gray-100" : "text-black"}`}
                  required
                >
                  <option value="" disabled hidden>
                    Select Year First
                  </option>
                  {semesterOptions[formData.year]?.map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Purpose<span className="text-red-500">*</span>
                </label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black`}
                  required
                >
                  <option value="">Select Purpose</option>
                  <option value="Internship">Internship</option>
                  <option value="FTE">FTE</option>
                </select>
              </div>
              {formData.purpose === "Internship" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Internship From <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="internshipFrom"
                      value={formData.internshipFrom}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full p-3 border ${internshipFromError ? "border-red-500" : "border-gray-300"} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                    {internshipFromError && (
                      <p className="text-red-500 text-sm mt-1">
                        {internshipFromError}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Internship To <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="internshipTo"
                      value={formData.internshipTo}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full p-3 border ${internshipToError ? "border-red-500" : "border-gray-300"} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                    {internshipToError && (
                      <p className="text-red-500 text-sm mt-1">
                        {internshipToError}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Internship Duration{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="internshipDuration"
                      value={formData.internshipDuration}
                      readOnly
                      className="mt-1 block w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Internship Mode <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="internshipMode"
                      value={formData.internshipMode}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${formData.internshipMode === "" ? "text-gray-600" : "text-black"}`}
                      required
                    >
                      <option value="" disabled hidden>
                        Select Mode
                      </option>
                      <option value="On-Campus">On-Campus</option>
                      <option value="Off-Campus">Off-Campus</option>
                      <option value="Own Startup">Own Startup</option>
                    </select>
                  </div>
                </>
              )}

              {formData.purpose === "FTE" && (
                <div>
                  <label
                    name="dateofjoining"
                    className="block text-sm font-medium text-gray-600"
                  >
                    Date of Joining <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfJoining"
                    value={formData.dateOfJoining}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    required
                  />
                </div>
              )}
            </div>
            {formData.purpose === "Internship" &&
              formData.internshipMode === "Off-Campus" && (
                <>
                  <div className="mt-6 p-6 border-2 border-blue-100 rounded-lg">
                    <h4 className="text-lg font-semibold mb-4">
                      Contact Person Details{" "}
                      <span className="text-red-500">*</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Name of Contact Person from Company{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="contactPersonName"
                          value={formData.contactPersonName}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Contact Person Designation{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="contactPersonDesignation"
                          value={formData.contactPersonDesignation}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Contact Person Phone{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="contactPersonPhone"
                          value={formData.contactPersonPhone}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Contact Person Email{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="contactPersonEmail"
                          value={formData.contactPersonEmail}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  {formData.purpose === "Internship" && needsExtra && (
                    <>
                      <div className="mt-6 p-6 border-2 border-blue-100 rounded-lg">
                        <h4 className="text-lg font-semibold mb-4">
                          Company Details{" "}
                          <span className="text-red-500">*</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-600">
                              Is the company minimum 3-years old?{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="companyminAgeis3"
                              value={formData.companyminAgeis3}
                              onChange={handleInputChange}
                              className={`mt-1 block w-full p-3 border ${companyAgeError ? "border-red-500" : "border-gray-300"} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                              required
                            >
                              <option value="">Select</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                            {companyAgeError && (
                              <p className="text-red-500 text-sm mt-1">
                                {companyAgeError}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600">
                              Company Turnover in Last FY (in crore){" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="companyTurnoverLastFY"
                              value={formData.companyTurnoverLastFY}
                              onChange={handleInputChange}
                              placeholder="e.g., 10"
                              className={`mt-1 block w-full p-3 border ${companyTurnoverError ? "border-red-500" : "border-gray-300"} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                              required
                            />
                            {companyTurnoverError && (
                              <p className="text-red-500 text-sm mt-1">
                                {companyTurnoverError}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600">
                              Company Type{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="companyType"
                              value={formData.companyType}
                              onChange={handleInputChange}
                              className={`mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${formData.companyType === "" ? "text-gray-600" : "text-black"}`}
                              required
                            >
                              <option value="" disabled hidden>
                                Select Type
                              </option>
                              <option value="IT Company">IT Company</option>
                              <option value="Core Company">Core Company</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600">
                              Stipend (per month){" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="stipend"
                              value={formData.stipend}
                              onChange={handleInputChange}
                              placeholder="e.g., 10000"
                              disabled={formData.companyType === ""}
                              className={`mt-1 block w-full p-3 border ${stipendError ? "border-red-500" : "border-gray-300"} rounded-md focus:ring-blue-500 focus:border-blue-500 ${formData.companyType === "" ? "bg-gray-100" : ""}`}
                              required
                            />
                            {stipendError && (
                              <p className="text-red-500 text-sm mt-1">
                                {stipendError}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 p-6 border-2 border-blue-100 rounded-lg">
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          Bank Account Details{" "}
                          <span className="text-red-500">*</span>
                          <div className="group relative cursor-pointer">
                            <div className="w-5 h-5 flex items-center justify-center rounded-full text-gray-600">
                              <Info size={14} />
                            </div>
                            <div
                              className="
                              absolute 
                              hidden group-hover:block 
                              bg-gray-800 text-white text-sm px-3 py-2 rounded-md shadow-lg
                              whitespace-normal w-64 sm:w-72 md:w-80 lg:w-96 
                              z-50
                              left-1/2 -translate-x-1/2 top-full mt-2
                              sm:left-6 sm:top-1/2 sm:-translate-y-1/2 sm:translate-x-0 sm:mt-0
                            "
                            >
                              Share your saving bank account details where you
                              will receive the stipend during your internship
                              period. To modify your bank details later, you can
                              contact the TPO.
                            </div>
                          </div>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-600">
                              Bank Name
                            </label>
                            <input
                              type="text"
                              name="bankdetails.bankName"
                              value={formData.bankdetails.bankName}
                              onChange={handleInputChange}
                              className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600">
                              Account Number
                            </label>
                            <input
                              type="text"
                              name="bankdetails.accountNumber"
                              value={formData.bankdetails.accountNumber}
                              onChange={handleInputChange}
                              className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600">
                              Account Holder Name
                            </label>
                            <input
                              type="text"
                              name="bankdetails.accountHolderName"
                              value={formData.bankdetails.accountHolderName}
                              onChange={handleInputChange}
                              className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600">
                              IFSC Code
                            </label>
                            <input
                              type="text"
                              name="bankdetails.ifscCode"
                              value={formData.bankdetails.ifscCode}
                              onChange={handleInputChange}
                              className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-6">
                        <h4 className="text-lg font-semibold mb-4">
                          Upload Documents
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-600">
                              Offer Letter
                            </label>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) =>
                                handleFileChange(e, "offerLetter")
                              }
                              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {files.offerLetter && (
                              <p className="text-sm text-green-600 mt-1">
                                Selected: {files.offerLetter.name}
                              </p>
                            )}
                            {renderFilePreview("offerLetter")}
                            {existingFiles.offerLetter &&
                              !files.offerLetter && (
                                <p className="text-sm text-blue-600 mt-1">
                                  <a
                                    href={`${baseURL}/${existingFiles.offerLetter}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:text-blue-800"
                                  >
                                    View Current:{" "}
                                    {existingFiles.offerLetter.split("/").pop()}
                                  </a>
                                </p>
                              )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600">
                              Company Turnover Report
                            </label>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) =>
                                handleFileChange(e, "turnoverReport")
                              }
                              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {files.turnoverReport && (
                              <p className="text-sm text-green-600 mt-1">
                                Selected: {files.turnoverReport.name}
                              </p>
                            )}
                            {renderFilePreview("turnoverReport")}
                            {existingFiles.turnoverReport &&
                              !files.turnoverReport && (
                                <p className="text-sm text-blue-600 mt-1">
                                  <a
                                    href={`${baseURL}/${existingFiles.turnoverReport}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:text-blue-800"
                                  >
                                    View Current:{" "}
                                    {existingFiles.turnoverReport
                                      .split("/")
                                      .pop()}
                                  </a>
                                </p>
                              )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600">
                              Mail Screenshot
                            </label>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) =>
                                handleFileChange(e, "mailScreenshot")
                              }
                              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {files.mailScreenshot && (
                              <p className="text-sm text-green-600 mt-1">
                                Selected: {files.mailScreenshot.name}
                              </p>
                            )}
                            {renderFilePreview("mailScreenshot")}
                            {existingFiles.mailScreenshot &&
                              !files.mailScreenshot && (
                                <p className="text-sm text-blue-600 mt-1">
                                  <a
                                    href={`${baseURL}/${existingFiles.mailScreenshot}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:text-blue-800"
                                  >
                                    View Current:{" "}
                                    {existingFiles.mailScreenshot
                                      .split("/")
                                      .pop()}
                                  </a>
                                </p>
                              )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            {formData.purpose === "Internship" &&
              formData.internshipMode === "Own Startup" &&
              needsExtra && (
                <>
                  <div className="mt-6 p-6 border-2 border-blue-100 rounded-lg">
                    <h4 className="text-lg font-semibold mb-4">
                      Startup Details <span className="text-red-500">*</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Startup Established Date{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="startupEstablishedDate"
                          value={formData.startupEstablishedDate}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full p-3 border ${startupEstablishedError ? "border-red-500" : "border-gray-300"} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                          required
                        />
                        {startupEstablishedError && (
                          <p className="text-red-500 text-sm mt-1">
                            {startupEstablishedError}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Business Registration Type{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="businessRegistrationType"
                          value={formData.businessRegistrationType}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${formData.businessRegistrationType === "" ? "text-gray-600" : "text-black"}`}
                          required
                        >
                          <option value="" disabled hidden>
                            Select Type
                          </option>
                          <option value="Partnership Firm">
                            Partnership Firm
                          </option>
                          <option value="Private Limited Company">
                            Private Limited Company
                          </option>
                          <option value="Limited Liability Partnership">
                            Limited Liability Partnership
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          PAN No <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="panNo"
                          value={formData.panNo}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          GST No <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="gstNo"
                          value={formData.gstNo}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          MSME Registration Category{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="MSMERegistrationCategory"
                          value={formData.MSMERegistrationCategory}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${formData.MSMERegistrationCategory === "" ? "text-gray-600" : "text-black"}`}
                          required
                        >
                          <option value="" disabled hidden>
                            Select Category
                          </option>
                          <option value="Micro">Micro</option>
                          <option value="Small">Small</option>
                          <option value="Medium">Medium</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-6 border-2 border-blue-100 rounded-lg">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      Startup Bank Account Details{" "}
                      <span className="text-red-500">*</span>
                      <div className="group relative cursor-pointer">
                        <div className="w-5 h-5 flex items-center justify-center rounded-full text-gray-600">
                          <Info size={14} />
                        </div>
                        <div
                          className="
                          absolute 
                          hidden group-hover:block 
                          bg-gray-800 text-white text-sm px-3 py-2 rounded-md shadow-lg
                          whitespace-normal w-64 sm:w-72 md:w-80 lg:w-96 
                          z-50
                          left-1/2 -translate-x-1/2 top-full mt-2
                          sm:left-6 sm:top-1/2 sm:-translate-y-1/2 sm:translate-x-0 sm:mt-0
                        "
                        >
                          Provide the bank account details of your startup where
                          you receive all official payments. Ensure the account
                          is active and registered under the startup’s name. If
                          any changes are needed later, you may update them by
                          contacting the TPO.
                        </div>
                      </div>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          name="startupBankDetails.bankName"
                          value={formData.startupBankDetails.bankName}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Account Number
                        </label>
                        <input
                          type="text"
                          name="startupBankDetails.accountNumber"
                          value={formData.startupBankDetails.accountNumber}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Account Holder Name
                        </label>
                        <input
                          type="text"
                          name="startupBankDetails.accountHolderName"
                          value={formData.startupBankDetails.accountHolderName}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          IFSC Code
                        </label>
                        <input
                          type="text"
                          name="startupBankDetails.ifscCode"
                          value={formData.startupBankDetails.ifscCode}
                          onChange={handleInputChange}
                          className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-4">
                      Upload Documents
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Startup India Recognition Certificate
                        </label>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) =>
                            handleFileChange(
                              e,
                              "startupIndiaRecognitionCertificate",
                            )
                          }
                          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {files.startupIndiaRecognitionCertificate && (
                          <p className="text-sm text-green-600 mt-1">
                            Selected:{" "}
                            {files.startupIndiaRecognitionCertificate.name}
                          </p>
                        )}
                        {renderFilePreview(
                          "startupIndiaRecognitionCertificate",
                        )}
                        {existingFiles.startupIndiaRecognitionCertificate &&
                          !files.startupIndiaRecognitionCertificate && (
                            <p className="text-sm text-blue-600 mt-1">
                              <a
                                href={`${baseURL}/${existingFiles.startupIndiaRecognitionCertificate}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-blue-800"
                              >
                                View Current:{" "}
                                {existingFiles.startupIndiaRecognitionCertificate
                                  .split("/")
                                  .pop()}
                              </a>
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            {formData.purpose === "Internship" && needsExtra && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">
                  Declarations <span className="text-red-500">*</span>
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Please read and agree to the following declarations:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="decl1"
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={decl1}
                      onChange={(e) => setDecl1(e.target.checked)}
                    />
                    <label
                      htmlFor="decl1"
                      className="ml-2 text-sm leading-relaxed"
                    >
                      {formData.internshipMode === "Off-Campus"
                        ? "1. I declare that I will not stay in the college hostel during the internship period even if the company offers work from home facility or is situated near NIT Jalandhar campus"
                        : "1. I declare that I will not apply for or participate in any on-campus internship or placement drive during my internship period."}
                    </label>
                  </div>
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="decl2"
                      className=" mt-1 h-8 w-8 scale-110 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={decl2}
                      onChange={(e) => setDecl2(e.target.checked)}
                    />
                    <label
                      htmlFor="decl2"
                      className="ml-2 text-sm leading-relaxed"
                    >
                      2. I confirm that all the information I have provided is
                      true, correct, and complete to the best of my knowledge. I
                      fully understand that if any information is found to be
                      incorrect, false, or misleading, the Training & Placement
                      Office (TPO) has the right to take disciplinary action
                      against me, which may include cancellation of my
                      internship approval and may also lead to cancellation of
                      my degree.
                    </label>
                  </div>
                </div>
                {agreed && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Student Signature Upload
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "signature")}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {files.signature && (
                      <p className="text-sm text-green-600 mt-1">
                        Selected: {files.signature.name}
                      </p>
                    )}
                    {renderFilePreview("signature")}
                    {existingFiles.signature && !files.signature && (
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Current Signature:
                        </p>
                        <img
                          src={`${baseURL}/${existingFiles.signature}`}
                          alt="Signature Preview"
                          className="max-w-48 max-h-24 object-contain border rounded"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
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
                  ? "Update Relieving Letter"
                  : "Apply for Relieving Letter"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default relieving_letter;
