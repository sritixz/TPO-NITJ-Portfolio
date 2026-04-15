import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaCheckCircle, FaTimes } from "react-icons/fa";

const RequestHelpManager = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [comment, setComment] = useState("");
  const [resolving, setResolving] = useState(false);

  const [filter, setFilter] = useState("Pending"); // Pending | Resolved | All
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.REACT_APP_BASE_URL}/reqhelp/get-all-issue`,
        { withCredentials: true }
      );
      setIssues(response.data.data || []);
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (issue, detail) => {
    setSelectedIssue(issue);
    setSelectedDetail(detail);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedIssue(null);
    setSelectedDetail(null);
    setComment("");
  };

  const resolveIssueDetail = async () => {
    if (!selectedIssue || !selectedDetail || resolving) return;

    setResolving(true);

    try {
      await axios.put(
        `${import.meta.env.REACT_APP_BASE_URL}/reqhelp/resolve/${selectedIssue._id}/${selectedDetail._id}`,
        { comment },
        { withCredentials: true }
      );

      toast.success("Issue Resolved Successfully");

      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue._id === selectedIssue._id
            ? {
                ...issue,
                details: issue.details.map((d) =>
                  d._id === selectedDetail._id
                    ? { ...d, status: "Resolved", comment }
                    : d
                ),
              }
            : issue
        )
      );

      closeModal();
    } catch (error) {
      console.error("Error resolving issue detail:", error);
      toast.error("Failed to Resolve Issue");
    } finally {
      setResolving(false);
    }
  };

  const getFilteredIssues = () => {
    return issues
      .map((issue) => {
        const filteredDetails = issue.details.filter((detail) => {
          const matchesFilter =
            filter === "All" || detail.status === filter;

          const searchTarget = `${issue.title} ${detail.description} ${detail.userId?.name} ${detail.userId?.email}`.toLowerCase();

          const matchesSearch = searchTarget.includes(
            searchText.toLowerCase()
          );

          return matchesFilter && matchesSearch;
        });

        return { ...issue, details: filteredDetails };
      })
      .filter((issue) => issue.details.length > 0);
  };

  const filteredIssues = getFilteredIssues();
  console.log(filteredIssues)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <h1 className="text-4xl font-bold mb-6 text-center">
          Issue <span className="text-custom-blue">Manager</span>
        </h1>

        {/* 🔍 SEARCH */}
        <input
          type="text"
          placeholder="Search by title, description, name, email..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full mb-4 p-3 border rounded-lg"
        />

        {/* 🔘 FILTER BUTTONS */}
        <div className="flex gap-3 mb-6 justify-center">
          {["Pending", "Resolved", "All"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg ${
                filter === f
                  ? "bg-custom-blue text-white"
                  : "bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        {filteredIssues.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            No issues found.
          </p>
        ) : (
          <div className="space-y-6">
            {filteredIssues.map((issue) => (
              <div
                key={issue._id}
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <h3 className="text-2xl font-semibold text-custom-blue mb-4">
                  {issue.title}
                </h3>

                {issue.details.map((detail) => (
                  <div
                    key={detail._id}
                    className="p-4 border rounded-lg mb-3 bg-gray-50"
                  >
                    {/* DESCRIPTION */}
                    <p className="text-gray-800 mb-2">
                      {detail.description}
                    </p>

                    {/* STATUS */}
                    <p
                      className={`text-sm font-semibold ${
                        detail.status === "Resolved"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {detail.status}
                    </p>

                    {/* FOOTER */}
                    <div className="mt-2 text-sm text-gray-600">
                      <p>
                        Raised by:{" "}
                        <span className="font-medium">
                          {detail.userId?.name}
                        </span>{" "}
                        ({detail.userId?.email})
                      </p>
                      <p>Contact: {detail.contact || "N/A"}</p>
                      <p>Type: {detail.onModel}</p>
                    </div>

                    {/* RESOLVE BUTTON */}
                    {detail.status === "Pending" && (
                      <button
                        onClick={() => openModal(issue, detail)}
                        className="mt-3 flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        <FaCheckCircle /> Resolve
                      </button>
                    )}

                    {/* COMMENT */}
                    {detail.status === "Resolved" && detail.comment && (
                      <p className="mt-2 text-sm text-gray-700">
                        <b>Comment:</b> {detail.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Resolve Issue</h2>
              <button onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            <textarea
              className="w-full p-3 border rounded-lg"
              placeholder="Enter comment (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className="flex justify-end gap-4 mt-4">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded">
                Cancel
              </button>

              <button
                onClick={resolveIssueDetail}
                disabled={resolving}
                className={`px-4 py-2 text-white rounded ${
                  resolving ? "bg-blue-300" : "bg-custom-blue"
                }`}
              >
                {resolving ? "Resolving..." : "Resolve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestHelpManager;