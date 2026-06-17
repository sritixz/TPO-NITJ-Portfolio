import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  FaEye,
  FaFastBackward,
  FaFastForward,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { Info } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import LTE2MonthApplicationPDF from "../outsource-studentDashboard/LTE2MonthApplicationPDF";
import GTE3MonthApplicationPDF from "../outsource-studentDashboard/GTE3MonthApplicationPDF";

const FILTERS = {
  SHORT: "lte2month",
  LONG: "gte3month",
};

const STATUSES = ["pending", "approved", "rejected"];

export default function InternshipsManagement() {
  const [allInternships, setAllInternships] = useState([]);
  const [displayedInternships, setDisplayedInternships] = useState([]);
  const [activeFilter, setActiveFilter] = useState(FILTERS.SHORT);
  const [activeStatus, setActiveStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  /* ===== LTE DEADLINE STATE ===== */
  const [lteDeadline, setLteDeadline] = useState(null);
  const [lteDeadlineStatus, setLteDeadlineStatus] = useState(null);
  const [deadlineInput, setDeadlineInput] = useState("");
  const [deadlineLoading, setDeadlineLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const BASE_URL = import.meta.env.REACT_APP_BASE_URL;
  const internshipsPerPage = 9; // 3 per row on lg

  const [loadingActions, setLoadingActions] = useState(new Set());

  // Show toast
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "info" }),
      3000
    );
  };

  // Fetch all internships for client-side filtering/pagination
  const fetchAllInternships = async () => {
    setLoading(true);
    try {
      // Fetch without status filter to get all, then filter client-side
      const shortEndpoint = `${BASE_URL}/outsource-internships/lte2month/get/data/all`;
      const longEndpoint = `${BASE_URL}/outsource-internships/gte3month/get/data/all`;

      // Assuming backend supports /all or adjust if needed; for now, fetch both
      const [shortRes, longRes] = await Promise.all([
        axios.get(shortEndpoint, { withCredentials: true }),
        axios.get(longEndpoint, { withCredentials: true }),
      ]);

      const normalize = (s) =>
        typeof s === "string" ? s.trim().toLowerCase() : "pending";

      const allData = [
        ...(shortRes.data?.data || []).map((item) => ({
          ...item,
          status: normalize(item.status),
          filterType: FILTERS.SHORT,
        })),
        ...(longRes.data?.data || []).map((item) => ({
          ...item,
          status: normalize(item.status),
          filterType: FILTERS.LONG,
        })),
      ];

      setAllInternships(allData);
      console.log(allData);
    } catch (err) {
      console.error("Fetch error", err);
      showToast("Failed to fetch internships. Please try again!", "error");
      setAllInternships([]);
    } finally {
      setLoading(false);
    }
  };

  // Update displayed internships based on filters/search/page
  const updateDisplayedInternships = () => {
    let filtered = allInternships.filter(
      (item) => item.filterType === activeFilter
    );

    filtered = filtered.filter(
      (item) => (item.status ?? "").toLowerCase() === activeStatus.toLowerCase()
    );

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        [
          item.name,
          item.ApplicantName,
          item.departmentAppliedFor,
          item.department,
        ]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q))
      );
    }

    const total = filtered.length;
    setTotalPages(Math.max(1, Math.ceil(total / internshipsPerPage)));

    const startIdx = (currentPage - 1) * internshipsPerPage;
    const paginatedData = filtered.slice(
      startIdx,
      startIdx + internshipsPerPage
    );

    setDisplayedInternships(paginatedData);
    console.log("paginated", paginatedData);
    console.log("data", displayedInternships);
    // 🔥 STORE TOTAL COUNT FOR UI
    setTotalCount(total);
  };

  useEffect(() => {
    fetchAllInternships();
    fetchLteDeadlineStatus();
  }, []);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, activeStatus, searchQuery]);

  // Recalculate data when page OR data changes
  useEffect(() => {
    updateDisplayedInternships();
  }, [currentPage, allInternships, activeFilter, activeStatus, searchQuery]);

  /* ================= CHANGE STATUS ================= */
  const changeStatus = async (item, status) => {
    try {
      await axios.post(
        `${BASE_URL}/outsource-internships/${item.filterType}/post/changeStatus/${item._id}`,
        { status },
        { withCredentials: true }
      );

      setAllInternships((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, status } : i))
      );

      showToast(`Status updated to ${status}!`, "success");
    } catch (err) {
      showToast("Failed to update status", "error");
    }
  };

  /* ================= DEADLINE APIs ================= */
  const fetchLteDeadlineStatus = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/outsource-internships/lte2month/deadline/status`,
        { withCredentials: true }
      );
      setLteDeadline(res.data.deadline || null);
      setLteDeadlineStatus(res.data.status);
    } catch (err) {
      console.error("Deadline fetch error", err);
    }
  };

  const updateLteDeadline = async (deadlineValue) => {
    setDeadlineLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/outsource-internships/lte2month/deadline`,
        { deadline: deadlineValue },
        { withCredentials: true }
      );
      setDeadlineInput("");
      fetchLteDeadlineStatus();
      showToast("Deadline updated successfully!", "success");
    } catch (err) {
      console.error("Deadline update error", err);
      showToast("Failed to update deadline", "error");
    } finally {
      setDeadlineLoading(false);
    }
  };

  /* ===== CLOSE NOW (Irrespective of Deadline) ===== */
  const closeLteNow = async () => {
    if (!window.confirm("Are you sure you want to close applications now?"))
      return;
    const pastDate = new Date(Date.now() - 1000).toISOString();
    await updateLteDeadline(pastDate);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Show details popup
  const handleShowDetails = (item) => {
    setSelectedItem(item);
    setShowDetailsPopup(true);
  };

  // Close details popup
  const handleClosePopup = () => {
    setShowDetailsPopup(false);
    setSelectedItem(null);
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

  const getInternshipFieldValue = (item, shortField, longField) => {
    const isShort = item.filterType === FILTERS.SHORT;
    return isShort ? item[shortField] : item[longField];
  };

  const getFilteredInternshipsForExport = () => {
    let filtered = allInternships.filter(
      (item) => item.filterType === activeFilter
    );

    filtered = filtered.filter(
      (item) => (item.status ?? "").toLowerCase() === activeStatus.toLowerCase()
    );

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        [
          getInternshipFieldValue(item, "name", "ApplicantName"),
          getInternshipFieldValue(item, "departmentAppliedFor", "department"),
          getInternshipFieldValue(item, "proposedFacultyMember", "facultySupervisor"),
        ]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q))
      );
    }

    return filtered;
  };

  const handleExportExcel = () => {
    const exportRows = getFilteredInternshipsForExport().map((item) => ({
      "Applicant Name": getInternshipFieldValue(item, "name", "ApplicantName") || "",
      "Roll Number": item.rollNo || item.rollNumber || "",
      Department: getInternshipFieldValue(item, "departmentAppliedFor", "department") || "",
      "Supervisor / Faculty": getInternshipFieldValue(
        item,
        "proposedFacultyMember",
        "facultySupervisor"
      ) || "",
      "Internship Type": item.filterType === FILTERS.SHORT ? "Winter / Summer" : "Long Term",
      Company: item.companyName || item.company || item.organizationName || "",
      Status: (item.status || "").toUpperCase(),
      "Application Date": item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "",
    }));

    if (exportRows.length === 0) {
      showToast("No internship records match the current view.", "error");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Internships");

    const fileName = `Internship_Management_${activeFilter}_${activeStatus}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    showToast("Excel export generated successfully!", "success");
  };

  const renderStatusTabs = () => (
    <div
      className={`flex justify-center space-x-1 border-b border-gray-200 ${activeFilter === FILTERS.SHORT ? "ml-8 pl-4" : "ml-4"}`}
    >
      {STATUSES.map((status) => (
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
  );

  //Document Download
  const handleDocumentDownload = (docs) => {
    if (!docs) {
      showToast("No documents uploaded", "error");
      return;
    }

    const documentsArray = Array.isArray(docs) ? docs : [docs];

    documentsArray.forEach((docPath) => {
      const url = `${BASE_URL}/${docPath}`;
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.download = docPath.split("/").pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  //Handle APplication PDF Download
  const handleDownload = async (app) => {
    const downloadKey = `download-${app._id}`;
    setLoadingActions((prev) => new Set([...prev, downloadKey]));

    try {
      const photoUrl = app.photo ? `${BASE_URL}/${app.photo}` : null;
      const signatureUrl = app.signature
        ? `${BASE_URL}/${app.signature}`
        : null;

      const appWithImages = {
        ...app,
        photo: photoUrl,
        signature: signatureUrl,
      };

      // 🔥 Choose PDF based on internship type
      const doc =
        app.filterType === FILTERS.SHORT ? (
          <LTE2MonthApplicationPDF
            application={appWithImages}
            baseURL={BASE_URL}
          />
        ) : (
          <GTE3MonthApplicationPDF
            application={appWithImages}
            baseURL={BASE_URL}
          />
        );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${
        app.filterType === FILTERS.SHORT ? "LTE2Month" : "GTE3Month"
      }_Application_${app._id.slice(-6)}.pdf`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Application downloaded successfully!", "success");
    } catch (error) {
      console.error("PDF download error:", error);
      showToast("Failed to generate application PDF", "error");
    } finally {
      setLoadingActions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(downloadKey);
        return newSet;
      });
    }
  };

  const startRange = (currentPage - 1) * internshipsPerPage + 1;
  const endRange = Math.min(currentPage * internshipsPerPage, totalCount);

  const totalItems = displayedInternships.length;
  const maxPagesToShow = 50;
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

  const renderInternshipCard = (item) => {
    const isShort = item.filterType === FILTERS.SHORT;
    return (
      <div
        key={item._id}
        className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100 relative"
      >
        <span
          className={`absolute top-3 right-3 text-xs px-2 py-1 rounded ${
            item.status === "approved"
              ? "bg-green-100 text-green-700"
              : item.status === "rejected"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {item.status.toUpperCase()}
        </span>
        <h3 className="text-lg font-semibold text-gray-900">
          {isShort ? item.name : item.ApplicantName}
        </h3>
        <p className="text-xs text-gray-600 mt-2">
          Dept: {isShort ? item.departmentAppliedFor : item.department}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Faculty:{" "}
          {isShort ? item.proposedFacultyMember : item.facultySupervisor}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {/* STATUS CONTROLS */}
          <button
            onClick={() => changeStatus(item, "pending")}
            className="text-sm text-yellow-600 hover:text-white px-3 py-1 rounded-md border border-yellow-600 hover:bg-yellow-600 transition"
          >
            Pending
          </button>

          <button
            onClick={() => changeStatus(item, "approved")}
            className="text-sm text-green-600 hover:text-white px-3 py-1 rounded-md border border-green-600 hover:bg-green-600 transition"
          >
            Approve
          </button>

          <button
            onClick={() => changeStatus(item, "rejected")}
            className="text-sm text-red-600 hover:text-white px-3 py-1 rounded-md border border-red-600 hover:bg-red-600 transition"
          >
            Reject
          </button>

          {/* DOWNLOAD DOCUMENTS */}
          {item.documents && (
            <button
              onClick={() => handleDocumentDownload(item.documents)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-white px-3 py-1 rounded-md border border-blue-600 hover:bg-blue-600 transition"
            >
              <FaEye size={12} />
              Documents
            </button>
          )}

          {/* VIEW / DOWNLOAD APPLICATION */}
          <button
            onClick={() => handleDownload(item)}
            disabled={loadingActions.has(`download-${item._id}`)}
            className={`flex items-center gap-1 text-sm px-3 py-1 rounded-md border transition
      ${
        loadingActions.has(`download-${item._id}`)
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "text-purple-600 border-purple-600 hover:bg-purple-600 hover:text-white"
      }`}
          >
            <Info size={14} />
            {loadingActions.has(`download-${item._id}`)
              ? "Generating..."
              : "View Application"}
          </button>
        </div>
      </div>
    );
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

      {/* ================= HEADER ================= */}
      <div className="flex sm:flex-row flex-col justify-between items-center p-2 rounded-t-lg bg-white mb-6">
        <h2 className="text-3xl font-bold flex items-center space-x-3 text-gray-900">
          <span>
            Internship <span className="text-custom-blue">Management</span>
          </span>
        </h2>
        <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
          <div className="relative">
            <FaSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by Name or Dept..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-blue"
            />
          </div>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-md border border-custom-blue text-custom-blue hover:bg-custom-blue hover:text-white transition-colors"
          >
            Export Excel
          </button>
          <div className="flex border border-gray-300 rounded-3xl bg-white">
            <button
              onClick={() => setActiveFilter(FILTERS.SHORT)}
              className={`px-4 py-2 rounded-3xl ${
                activeFilter === FILTERS.SHORT
                  ? "bg-custom-blue text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              Winter / Summer
            </button>
            <button
              onClick={() => setActiveFilter(FILTERS.LONG)}
              className={`px-4 py-2 rounded-3xl ${
                activeFilter === FILTERS.LONG
                  ? "bg-custom-blue text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              Long Term
            </button>
          </div>
        </div>
      </div>

      {/* ================= LTE DEADLINE SETTER ================= */}
      {activeFilter === FILTERS.SHORT && (
        <div className="mb-6 p-4 rounded-lg border bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-medium">
              Application Status:{" "}
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  lteDeadlineStatus === "OPEN"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {lteDeadlineStatus || "CLOSED"}
              </span>
            </p>
            {lteDeadline && (
              <p className="text-xs text-gray-600 mt-1">
                Deadline: {new Date(lteDeadline).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="datetime-local"
              value={deadlineInput}
              onChange={(e) => setDeadlineInput(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            />

            <button
              onClick={() => updateLteDeadline(deadlineInput)}
              disabled={deadlineLoading || !deadlineInput}
              className={`px-4 py-2 text-sm rounded text-white ${
                deadlineLoading
                  ? "bg-gray-400"
                  : "bg-custom-blue hover:bg-blue-700"
              }`}
            >
              Set Deadline
            </button>

            <button
              onClick={closeLteNow}
              disabled={deadlineLoading}
              className="px-4 py-2 text-sm rounded text-white bg-red-600 hover:bg-red-700"
            >
              Close Now
            </button>
          </div>
        </div>
      )}

      {renderStatusTabs()}

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-blue"></div>
        </div>
      ) : displayedInternships.length === 0 ? (
        <p className="text-gray-600 italic text-center">
          No {activeStatus} applications available.
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedInternships.map(renderInternshipCard)}
          </div>
          <div className="flex items-center justify-between mt-6">
            <span className="text-gray-600">
              {startRange} -{" "}
              {Math.min(startRange + internshipsPerPage - 1, totalCount)} /{" "}
              {totalCount}
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
}
