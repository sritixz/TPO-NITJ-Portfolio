import { useEffect, useState } from "react";
import axios from "axios";

const FILTERS = {
  SHORT: "lte2month",
  LONG: "gte3month",
};

const STATUSES = ["pending", "verified", "rejected"];

export default function InternshipsManagement() {
  const [internships, setInternships] = useState([]);
  const [activeFilter, setActiveFilter] = useState(FILTERS.SHORT);
  const [activeStatus, setActiveStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  /* ===== LTE DEADLINE STATE ===== */
  const [lteDeadline, setLteDeadline] = useState(null);
  const [lteDeadlineStatus, setLteDeadlineStatus] = useState(null);
  const [deadlineInput, setDeadlineInput] = useState("");
  const [deadlineLoading, setDeadlineLoading] = useState(false);

  const BASE_URL = import.meta.env.REACT_APP_BASE_URL;

  /* ================= FETCH INTERNSHIPS ================= */
  const fetchInternships = async (filter) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/outsource-internships/${filter}/get/data`,
        { withCredentials: true }
      );
      setInternships(res.data?.data || []);
    } catch (err) {
      console.error("Fetch error", err);
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= CHANGE STATUS ================= */
  const changeStatus = async (id, status) => {
    try {
      await axios.post(
        `${BASE_URL}/outsource-internships/${activeFilter}/post/changeStatus/${id}`,
        { status },
        { withCredentials: true }
      );
      fetchInternships(activeFilter);
    } catch (err) {
      console.error("Status change error", err);
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
    } catch (err) {
      console.error("Deadline update error", err);
    } finally {
      setDeadlineLoading(false);
    }
  };

  /* ===== CLOSE NOW (Irrespective of Deadline) ===== */
  const closeLteNow = async () => {
    const pastDate = new Date(Date.now() - 1000).toISOString();
    await updateLteDeadline(pastDate);
  };

  /* ================= EFFECT ================= */
  useEffect(() => {
    fetchInternships(activeFilter);

    if (activeFilter === FILTERS.SHORT) {
      fetchLteDeadlineStatus();
    }
  }, [activeFilter]);

  const filteredInternships = internships.filter(
    (item) => item.status === activeStatus
  );

  return (
    <div className="p-6">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Internship Applications</h2>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter(FILTERS.SHORT)}
            className={`px-4 py-2 rounded ${
              activeFilter === FILTERS.SHORT
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Winter / Summer
          </button>

          <button
            onClick={() => setActiveFilter(FILTERS.LONG)}
            className={`px-4 py-2 rounded ${
              activeFilter === FILTERS.LONG
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Long Term
          </button>
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
                  : "bg-blue-600 hover:bg-blue-700"
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

      {/* ================= STATUS TABS ================= */}
      <div className="flex gap-3 mb-6">
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-4 py-2 rounded text-sm font-medium ${
              activeStatus === status
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {status.toUpperCase()}
          </button>
        ))}
      </div>

      {loading && <p className="text-center">Loading...</p>}

      {!loading && filteredInternships.length === 0 && (
        <p className="text-center text-gray-500">
          No {activeStatus} applications.
        </p>
      )}

      {/* ================= CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredInternships.map((item) => (
          <div
            key={item._id}
            className="bg-white shadow rounded-xl p-5 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold">
                {activeFilter === FILTERS.SHORT
                  ? item.name
                  : item.ApplicantName}
              </h3>

              <p className="text-sm text-gray-600">
                Dept:{" "}
                {activeFilter === FILTERS.SHORT
                  ? item.departmentAppliedFor
                  : item.department}
              </p>

              <p className="text-sm text-gray-600 mb-2">
                Faculty:{" "}
                {activeFilter === FILTERS.SHORT
                  ? item.proposedFacultyMember
                  : item.facultySupervisor}
              </p>

              <span
                className={`text-xs px-2 py-1 rounded ${
                  item.status === "verified"
                    ? "bg-green-100 text-green-700"
                    : item.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {item.status}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => setSelectedItem(item)}
                className="text-blue-600 text-sm hover:underline block"
              >
                View Details
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => changeStatus(item._id, "pending")}
                  className="px-2 py-1 text-xs bg-yellow-500 text-white rounded"
                >
                  Pending
                </button>
                <button
                  onClick={() => changeStatus(item._id, "verified")}
                  className="px-2 py-1 text-xs bg-green-600 text-white rounded"
                >
                  Verify
                </button>
                <button
                  onClick={() => changeStatus(item._id, "rejected")}
                  className="px-2 py-1 text-xs bg-red-600 text-white rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
