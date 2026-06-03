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
  FaFastBackward,
  FaFastForward,
} from "react-icons/fa";
import { Info } from "lucide-react";
import GenerateNOC from "./generate_relieving";
import NOCPreview from "./relieving_preview";

const RelievingManagement = () => {
  const { userData } = useSelector((state) => state.auth);
  const [allNocs, setAllNocs] = useState([]);
  const [displayedNocs, setDisplayedNocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedNoc, setSelectedNoc] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internshipFromError, setInternshipFromError] = useState("");
  const [internshipToError, setInternshipToError] = useState("");
  const [startupEstablishedError, setStartupEstablishedError] = useState("");
  const [companyAgeError, setCompanyAgeError] = useState("");
  const [companyTurnoverError, setCompanyTurnoverError] = useState("");
  const [stipendError, setStipendError] = useState("");
  const [existingFiles, setExistingFiles] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});
  // const [activeMainTab, setActiveMainTab] = useState("tpo");
  const [activeSubTab, setActiveSubTab] = useState("on-campus");
  const [activeStatus, setActiveStatus] = useState("pending");
  const nocsPerPage = 50;
  const HIGH_LIMIT = 10000; // Fetch a high limit to get all records for client-side filtering/pagination

  const [purposeFilter, setPurposeFilter] = useState("all");
  // const [isBusy, setIsBusy] = useState(false);

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
    purpose: "",
    dateOfJoining: "",
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
      purpose: "",
      dateOfJoining: "",
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

  // Fetch all NOCs once
  useEffect(() => {
    const fetchAllNOCs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.REACT_APP_BASE_URL}/relieving/professor/locked`,
          {
            params: { page: 1, limit: HIGH_LIMIT },
            withCredentials: true,
          },
        );
        setAllNocs(response.data.nocs || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Relieving Letters:", error);
        showToast(
          "Failed to fetch Relieving Letters. Please try again!",
          "error",
        );
        setLoading(false);
      }
    };
    fetchAllNOCs();
  }, []);

  // Reset page and update displayed NOCs when tabs change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    //activeMainTab,
    activeSubTab,
    activeStatus,
    allNocs,
  ]);

  useEffect(() => {
    updateDisplayedNocs();
  }, [
    currentPage,
    // activeMainTab,
    activeSubTab,
    activeStatus,
    allNocs,
    purposeFilter,
  ]);

  const updateDisplayedNocs = () => {
    // Filter for main tabs

    // const isLowYearBTech = (noc) => {
    //   const yearLower = noc.year?.toLowerCase() || "";
    //   return (
    //     ["1st", "2nd", "3rd"].some((y) => yearLower.includes(y)) &&
    //     noc.course?.toLowerCase() === "b.tech"
    //   );
    // };
    // const departmentNocs = allNocs.filter(isLowYearBTech);
    // const tpoNocs = allNocs.filter((noc) => !isLowYearBTech(noc));

    // let statusFiltered = [];

    // if (activeMainTab === "department") {
    //   statusFiltered = departmentNocs.filter(
    //     (noc) => noc.nocStatus?.toLowerCase() === activeStatus,
    //   );
    // } else {
    //   // TPO sub-filter
    //   let subFiltered = [];
    //   if (activeSubTab === "on-campus") {
    //     subFiltered = tpoNocs.filter(
    //       (noc) => noc.internshipMode?.toLowerCase() === "on-campus",
    //     );
    //   } else if (activeSubTab === "off-campus") {
    //     subFiltered = tpoNocs.filter(
    //       (noc) => noc.internshipMode?.toLowerCase() === "off-campus",
    //     );
    //   } else if (activeSubTab === "own-startup") {
    //     subFiltered = tpoNocs.filter(
    //       (noc) => noc.internshipMode?.toLowerCase() === "own startup",
    //     );
    //   }
    //   statusFiltered = subFiltered.filter(
    //     (noc) => noc.nocStatus?.toLowerCase() === activeStatus,
    //   );
    // }

    // if (activeMainTab === "tpo" && purposeFilter !== "all") {
    //   statusFiltered = statusFiltered.filter(
    //     (noc) => noc.purpose === purposeFilter,
    //   );
    // }

    let filteredData = [...allNocs];

    filteredData = filteredData.filter((noc) => {
      if (noc.purpose === "FTE") return true; 

      const currentTabMode =
        activeSubTab === "own-startup" ? "own startup" : activeSubTab;
      return noc.internshipMode?.toLowerCase() === currentTabMode;
    });

    if (purposeFilter !== "all") {
      filteredData = filteredData.filter(
        (noc) => noc.purpose === purposeFilter,
      );
    }

    const statusFiltered = filteredData.filter(
      (noc) => noc.nocStatus?.toLowerCase() === activeStatus,
    );

    // Client-side pagination
    const total = statusFiltered.length;

    setTotalPages(Math.ceil(total / nocsPerPage));

    const startIdx = (currentPage - 1) * nocsPerPage;
    const endIdx = startIdx + nocsPerPage;

    setDisplayedNocs(statusFiltered.slice(startIdx, endIdx));
  };

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
  }, [formData.internshipFrom, formData.internshipTo]);

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
    if (formData.purpose !== "Internship") return;
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
    if (!formData.purpose) return false;

    if (formData.purpose === "Internship") {
      if (
        !formData.internshipFrom ||
        !formData.internshipTo ||
        !formData.internshipDuration ||
        !formData.internshipMode
      )
        return false;
    }

    if (formData.purpose === "FTE") {
      if (!formData.dateOfJoining) return false;
    }
    const basicFields = ["companyName", "year", "semester"];
    const basicFilled = basicFields.every(
      (key) => formData[key].toString().trim() !== "",
    );
    if (!basicFilled || internshipFromError || internshipToError) {
      return false;
    }
    if (formData.purpose === "Internship") {
      if (formData.internshipMode === "Off-Campus") {
        const contactFields = [
          "contactPersonName",
          "contactPersonDesignation",
          "contactPersonPhone",
          "contactPersonEmail",
        ];
        const contactFilled = contactFields.every(
          (key) => formData[key].toString().trim() !== "",
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
        const minStipend =
          formData.companyType === "IT Company" ? 25000 : 10000;
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
    const url = editingId
      ? `/relieving/professor/edit/${editingId}`
      : `/relieving`;
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
        setAllNocs(
          allNocs.map((noc) =>
            noc._id === editingId ? { ...noc, ...formData } : noc,
          ),
        );
        setEditingId(null);
      } else {
        setAllNocs([...allNocs, response.data]);
      }
      resetFormData();
      setShowForm(false);
    } catch (error) {
      console.error("Error submitting Relieving Letter:", error);
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
      purpose: noc.purpose || "",
      dateOfJoining: noc.dateOfJoining ? formatDate(noc.dateOfJoining) : "",
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

  // Handle status update
  const handleStatusUpdate = async (nocId, newStatus) => {
    if (
      !window.confirm(
        `Are you sure you want to ${newStatus === "Issued" ? "issue" : newStatus === "Rejected" ? "reject" : "withdraw"} this application?`,
      )
    )
      return;
    try {
      await axios.put(
        `${import.meta.env.REACT_APP_BASE_URL}/relieving/professor/${nocId}/change-status/${newStatus}`,
        {},
        { withCredentials: true },
      );
      setAllNocs((prev) =>
        prev.map((n) =>
          n._id === nocId
            ? {
                ...n,
                nocStatus:
                  newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
              }
            : n,
        ),
      );
      showToast(`Relieving Letter ${newStatus} successfully!`, "success");
    } catch (error) {
      console.error("Error updating Relieving Letter status:", error);
      showToast(
        "Failed to update Relieving Letter status. Try again!",
        "error",
      );
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

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle jump to page
  const handleJumpToPage = (e) => {
    const page = parseInt(e.target.value, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderSubAndStatusTabs = () => (
    <div className="space-y-4">
      {/* Status Tabs - Centered */}
      {
        //activeMainTab === "tpo" &&
        <div className="flex justify-center items-center space-x-5 mb-3 text-xl">
          <button
            onClick={() => setPurposeFilter("all")}
            className={
              purposeFilter === "all"
                ? "border-b-2 border-custom-blue text-custom-blue"
                : "text-gray-500 hover:text-gray-700"
            }
          >
            {" "}
            All
          </button>
          <button
            onClick={() => setPurposeFilter("Internship")}
            className={
              purposeFilter === "Internship"
                ? "border-b-2 border-custom-blue text-custom-blue"
                : "text-gray-500 hover:text-gray-700"
            }
          >
            Internship
          </button>
          <button
            onClick={() => setPurposeFilter("FTE")}
            className={
              purposeFilter === "FTE"
                ? "border-b-2 border-custom-blue text-custom-blue"
                : "text-gray-500 hover:text-gray-700"
            }
          >
            FTE
          </button>
        </div>
      }
      <div
        // className={`flex justify-center space-x-1 ${activeMainTab === "tpo" ? "ml-8 pl-4" : "ml-4"}`}
        className={`flex justify-center space-x-1 ${"ml-8 pl-4"}`}
      >
        {["pending", "issued", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`py-2 px-4 font-medium text-sm rounded-t-lg transition-colors ${
              activeStatus === status
                ? "border-b-2 border-custom-blue text-custom-blue"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
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

  const renderForm = () => (
    <div className="bg-white shadow-lg rounded-lg p-8 mb-8 border border-gray-200 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-700">
          Edit <span className="text-custom-blue">Relieving Letter</span>
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
          {/* PURPOSE FIELD */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Purpose <span className="text-red-500">*</span>
            </label>
            <select
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              required
            >
              <option value="" disabled hidden>
                Select Purpose
              </option>
              <option value="Internship">Internship</option>
              <option value="FTE">Full Time Employment</option>
            </select>
          </div>
          {/* INTERNSHIP FIELDS */}
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
                  className="mt-1 w-full p-3 border rounded-md"
                />
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
                  className="mt-1 w-full p-3 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Internship Duration
                </label>
                <input
                  type="text"
                  value={formData.internshipDuration}
                  readOnly
                  className="mt-1 w-full p-3 border bg-gray-100"
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

          {/* FTE FIELD */}
          {formData.purpose === "FTE" && (
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Date of Joining <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleInputChange}
                className="mt-1 w-full p-3 border rounded-md"
              />
            </div>
          )}
        </div>
        {formData.internshipMode === "Off-Campus" && (
          <>
            <div className="mt-6 p-6 border-2 border-blue-100 rounded-lg">
              <h4 className="text-lg font-semibold mb-4">
                Contact Person Details <span className="text-red-500">*</span>
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
                    Contact Person Phone <span className="text-red-500">*</span>
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
                    Contact Person Email <span className="text-red-500">*</span>
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
            {needsExtra && (
              <>
                <div className="mt-6 p-6 border-2 border-blue-100 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4">
                    Company Details <span className="text-red-500">*</span>
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
                        Company Type <span className="text-red-500">*</span>
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
                    Bank Account Details <span className="text-red-500">*</span>
                    <div className="group relative cursor-pointer">
                      <div className="w-5 h-5 flex items-center justify-center rounded-full text-gray-600">
                        <Info size={14} />
                      </div>
                      <div className="absolute hidden group-hover:block bg-gray-800 text-white text-sm px-3 py-2 rounded-md shadow-lg whitespace-normal w-64 sm:w-72 md:w-80 lg:w-96 z-50 left-1/2 -translate-x-1/2 top-full mt-2 sm:left-6 sm:top-1/2 sm:-translate-y-1/2 sm:translate-x-0 sm:mt-0">
                        Share your saving bank account details where you will
                        receive the stipend during your internship period. To
                        modify your bank details later, you can contact the TPO.
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
                        onChange={(e) => handleFileChange(e, "offerLetter")}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {files.offerLetter && (
                        <p className="text-sm text-green-600 mt-1">
                          Selected: {files.offerLetter.name}
                        </p>
                      )}
                      {renderFilePreview("offerLetter")}
                      {existingFiles.offerLetter && !files.offerLetter && (
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
                        onChange={(e) => handleFileChange(e, "turnoverReport")}
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
                              {existingFiles.turnoverReport.split("/").pop()}
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
                        onChange={(e) => handleFileChange(e, "mailScreenshot")}
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
                              {existingFiles.mailScreenshot.split("/").pop()}
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
        {formData.internshipMode === "Own Startup" && needsExtra && (
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
                    <option value="Partnership Firm">Partnership Firm</option>
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
                  <div className="absolute hidden group-hover:block bg-gray-800 text-white text-sm px-3 py-2 rounded-md shadow-lg whitespace-normal w-64 sm:w-72 md:w-80 lg:w-96 z-50 left-1/2 -translate-x-1/2 top-full mt-2 sm:left-6 sm:top-1/2 sm:-translate-y-1/2 sm:translate-x-0 sm:mt-0">
                    Provide the bank account details of your startup where you
                    receive all official payments. Ensure the account is active
                    and registered under the startup’s name. If any changes are
                    needed later, you may update them by contacting the TPO.
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
              <h4 className="text-lg font-semibold mb-4">Upload Documents</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Startup India Recognition Certificate
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) =>
                      handleFileChange(e, "startupIndiaRecognitionCertificate")
                    }
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {files.startupIndiaRecognitionCertificate && (
                    <p className="text-sm text-green-600 mt-1">
                      Selected: {files.startupIndiaRecognitionCertificate.name}
                    </p>
                  )}
                  {renderFilePreview("startupIndiaRecognitionCertificate")}
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
        {needsExtra && (
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
                <label htmlFor="decl1" className="ml-2 text-sm leading-relaxed">
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
                <label htmlFor="decl2" className="ml-2 text-sm leading-relaxed">
                  2. I confirm that all the information I have provided is true,
                  correct, and complete to the best of my knowledge. I fully
                  understand that if any information is found to be incorrect,
                  false, or misleading, the Training & Placement Office (TPO)
                  has the right to take disciplinary action against me, which
                  may include cancellation of my internship approval and may
                  also lead to cancellation of my degree.
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
          {isSubmitting ? "Updating..." : "Update Relieving Letter"}
        </button>
      </form>
    </div>
  );

  const renderNOCList = () => {
    const startRange = (currentPage - 1) * nocsPerPage + 1;
    const endRange = Math.min(currentPage * nocsPerPage, displayedNocs.length);
    const totalItems = displayedNocs.length; // Client-side total

    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);
    let startPage = Math.max(1, currentPage - halfPagesToShow);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Main Header with TPO/Department Tabs */}
        <div className="flex sm:flex-row flex-col justify-between items-center p-2 rounded-t-lg">
          <h2 className="text-3xl font-bold flex items-center space-x-3 text-gray-900">
            <span>
              Relieving Letter{" "}
              <span className="text-custom-blue">Management</span>
            </span>
          </h2>
          <div className="flex items-center space-x-3">
            {
              //activeMainTab === "tpo" &&
              <div className="pl-4 flex justify-start">
                <div className="flex border border-gray-300 rounded-3xl bg-white">
                  <button
                    className={`px-4 py-2 rounded-3xl ${
                      activeSubTab === "on-campus"
                        ? "bg-custom-blue text-white"
                        : "bg-white text-gray-700"
                    }`}
                    onClick={() => {
                      setActiveSubTab("on-campus");
                      setActiveStatus("pending");
                    }}
                  >
                    On-Campus
                  </button>
                  <button
                    className={`px-4 py-2 rounded-3xl ${
                      activeSubTab === "off-campus"
                        ? "bg-custom-blue text-white"
                        : "bg-white text-gray-700"
                    }`}
                    onClick={() => {
                      setActiveSubTab("off-campus");
                      setActiveStatus("pending");
                    }}
                  >
                    Off-Campus
                  </button>
                  <button
                    className={`px-4 py-2 rounded-3xl ${
                      activeSubTab === "own-startup"
                        ? "bg-custom-blue text-white"
                        : "bg-white text-gray-700"
                    }`}
                    onClick={() => {
                      setActiveSubTab("own-startup");
                      setActiveStatus("pending");
                    }}
                  >
                    Own Startup
                  </button>
                </div>
              </div>
            }
            <div className="flex border border-gray-300 rounded-3xl bg-white">
              {/* <button
                className={`px-4 py-2 rounded-3xl ${                  
                    "bg-custom-blue text-white"
                }`}
                // className={`px-4 py-2 rounded-3xl ${
                //   activeMainTab === "tpo"
                //     ? "bg-custom-blue text-white"
                //     : "bg-white text-gray-700"
                // }`}
                onClick={() => {
                  setActiveMainTab("tpo");
                  setActiveSubTab("on-campus");
                  setActiveStatus("pending");
                }}
              >
                TPO
              </button> */}
              {/* <button
                className={`px-4 py-2 rounded-3xl ${
                  activeMainTab === "department"
                    ? "bg-custom-blue text-white"
                    : "bg-white text-gray-700"
                }`}
                onClick={() => {
                  setActiveMainTab("department");
                  setActiveStatus("pending");
                }}
              >
                Department
              </button> */}
            </div>
          </div>
        </div>

        {renderSubAndStatusTabs()}

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-blue"></div>
          </div>
        ) : displayedNocs.length === 0 ? (
          <p className="text-gray-600 italic">
            No applications available for the selected filters.
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayedNocs.map((noc) => (
                <div
                  key={noc._id}
                  className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100 relative"
                >
                  {/* Download Icon Top Right */}
                  <button
                    onClick={() => handleDownload(noc)}
                    disabled={isDownloading}
                    className="absolute top-3 right-3 text-custom-blue hover:text-blue-700"
                  >
                    {isDownloading ? (
                      <span className="animate-spin text-xs">⏳</span>
                    ) : (
                      <FaDownload size={18} />
                    )}
                  </button>

                  <p className="text-lg font-semibold text-gray-900">
                    {noc.companyName}
                  </p>

                  <p className="text-xs text-custom-blue bg-custom-blue/10 p-1 rounded-lg inline-block font-semibold mt-1">
                    # {noc.nocId}
                  </p>

                  <p className="text-xs text-gray-600 mt-2">
                    Student: {noc.studentName}
                  </p>

                  <p className="text-xs text-gray-600 mt-1">
                    Email: {noc.respondentEmail}
                  </p>

                  <p className="text-xs text-gray-600 mt-1">
                    Submitted:{" "}
                    {new Date(noc.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>

                  {/* 2 Buttons Per Row */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {/* Preview */}
                    <button
                      onClick={() => handlePreview(noc)}
                      className="w-full flex items-center justify-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
                    >
                      <FaEye />
                      <span>Preview</span>
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => handleEdit(noc)}
                      className="w-full flex items-center justify-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </button>

                    {/* Pending → Issue / Reject */}
                    {activeStatus === "pending" && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(noc._id, "Issued")}
                          className="w-full flex items-center justify-center space-x-1 text-sm text-green-600 hover:text-white px-3 py-1 rounded-md border border-green-600 hover:bg-green-600 transition duration-300"
                        >
                          Issue
                        </button>

                        <button
                          onClick={() =>
                            handleStatusUpdate(noc._id, "Rejected")
                          }
                          className="w-full flex items-center justify-center space-x-1 text-sm text-red-600 hover:text-white px-3 py-1 rounded-md border border-red-600 hover:bg-red-600 transition duration-300"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {/* Issued → Withdraw Issue */}
                    {activeStatus === "issued" && (
                      <button
                        onClick={() => handleStatusUpdate(noc._id, "Pending")}
                        className="w-full flex items-center justify-center space-x-1 text-sm text-yellow-600 hover:text-white px-3 py-1 rounded-md border border-yellow-600 hover:bg-yellow-600 transition duration-300 col-span-2"
                      >
                        Withdraw Issue
                      </button>
                    )}

                    {/* Rejected → Withdraw Rejection */}
                    {activeStatus === "rejected" && (
                      <button
                        onClick={() => handleStatusUpdate(noc._id, "Pending")}
                        className="w-full flex items-center justify-center space-x-1 text-sm text-yellow-600 hover:text-white px-3 py-1 rounded-md border border-yellow-600 hover:bg-yellow-600 transition duration-300 col-span-2"
                      >
                        Withdraw Rejection
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <span className="text-gray-600">
                {startRange} - {endRange} / {totalItems}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={`px-2 py-1 rounded-md ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-custom-blue hover:bg-custom-blue/10"
                  }`}
                >
                  <FaFastBackward />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-2 py-1 rounded-md ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-custom-blue hover:bg-blue-100"
                  }`}
                >
                  ◄
                </button>
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                        ? "border border-custom-blue text-custom-blue"
                        : "text-custom-blue hover:bg-custom-blue/10"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-2 py-1 rounded-md ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-custom-blue hover:bg-blue-100"
                  }`}
                >
                  ►
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-2 py-1 rounded-md ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-custom-blue hover:bg-blue-100"
                  }`}
                >
                  <FaFastForward />
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Jump to</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={handleJumpToPage}
                    className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-blue"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = (nocData) => {
    if (isDownloading) return;
    setIsDownloading(true);

    setTimeout(async () => {
      try {
        await GenerateNOC(nocData);
      } catch (err) {
        console.error("Download Error:", err);
      } finally {
        setIsDownloading(false);
      }
    }, 100);
  };

  return (
    <div className="container mx-auto p-6 min-h-screen">
      {toast.show && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg animate-fade-in-out z-[1000] ${
            toast.type === "error"
              ? "bg-white border border-red-500 text-red-500"
              : toast.type === "success"
                ? "bg-white border border-green-500 text-green-500"
                : "bg-white border border-custom-blue text-custom-blue"
          }`}
        >
          {toast.message}
        </div>
      )}
      {showPreview && selectedNoc ? (
        <NOCPreview noc={selectedNoc} onClose={handleClosePreview} />
      ) : showForm ? (
        renderForm()
      ) : (
        renderNOCList()
      )}
    </div>
  );
};

export default RelievingManagement;
