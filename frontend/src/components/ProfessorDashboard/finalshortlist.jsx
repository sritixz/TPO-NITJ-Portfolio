import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";

const FinalShortlistStudents = ({ jobId, onClose }) => {
  const [students, setStudents] = useState([]);
  const [starredFields, setStarredFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCombinations, setSelectedCombinations] = useState([]);
  const jobTypeOptions = [
    { value: "Intern", label: "Internship" },
    { value: "Intern+PPO", label: "Intern + Pre Placement Offer(PPO)" },
    { value: "Intern+FTE", label: "Intern + Full-Time Employment(FTE)" },
    { value: "FTE", label: "Full-Time Employment(FTE)" },
  ];

  const internshipDurationOptions = [
    { value: "2m Intern", label: "2 Months Internship" },
    { value: "6m Intern", label: "6 Months Internship" },
    { value: "11m Intern", label: "11 Months Internship" },
  ];

  useEffect(() => {
    const fetchEligibleStudents = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          `${import.meta.env.REACT_APP_BASE_URL}/jobprofile/final_eligible_students`,
          { jobId },
          { withCredentials: true },
        );
        const { eligibleStudents, starredFields } = response.data;
        const updatedStudents = eligibleStudents
          .map((student) => {
            const isShortlisted = student.shortlisted === true;

            return {
              ...student,
              shortlisted: isShortlisted,
              initiallyShortlisted: isShortlisted,
              job_type: student.job_type || "",
              job_role: student.job_role || "",
              ctc: student.ctc || "",
              stipend: student.stipend || "",
              intern_duration: student.intern_duration || "",
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));
        setStudents(updatedStudents);
        setStarredFields(starredFields || []);
      } catch (err) {
        console.error("Error fetching eligible students:", err);
        toast.error("Failed to fetch eligible students");
      } finally {
        setLoading(false);
      }
    };
    fetchEligibleStudents();
  }, [jobId]);

  const handleCheckboxChange = (index) => {
    const updatedStudents = [...students];
    updatedStudents[index].shortlisted = !updatedStudents[index].shortlisted;
    setStudents(updatedStudents);
  };

  const handleInputChange = (index, field, value) => {
    const updatedStudents = [...students];
    if (
      !updatedStudents[index].initiallyShortlisted ||
      !updatedStudents[index].shortlisted
    ) {
      updatedStudents[index][field] = value;
    }
    setStudents(updatedStudents);
  };

  const handleBulkAction = () => {
    const updatedStudents = students.map((student) => ({
      ...student,
      shortlisted: true,
    }));
    setStudents(updatedStudents);
  };

  const handleInitialSubmit = () => {
    const hasChanges = students.some(
      (student) => student.shortlisted !== student.initiallyShortlisted,
    );
    const shortlistedStudents = students.filter(
      (student) => student.shortlisted,
    );

    if (!hasChanges && shortlistedStudents.length === 0) {
      setShowConfirmModal(true);
      return;
    }

    for (const student of shortlistedStudents) {
      if (student.initiallyShortlisted) {
        continue;
      }
      if (!student.job_type) {
        toast.error(
          "Please select Job Type for all newly shortlisted students",
        );
        return;
      }
      if (student.job_type === "Intern") {
        if (!student.stipend || !student.intern_duration) {
          toast.error(
            "Please fill in Stipend and Internship Duration for Intern students",
          );
          return;
        }
      } else if (
        student.job_type === "Intern+PPO" ||
        student.job_type === "Intern+FTE"
      ) {
        if (!student.ctc || !student.stipend || !student.intern_duration) {
          toast.error(
            "Please fill in CTC, Stipend, and Internship Duration for Intern+PPO/FTE students",
          );
          return;
        }
      } else if (student.job_type === "FTE") {
        if (!student.ctc) {
          toast.error("Please fill in CTC for FTE students");
          return;
        }
      }
      if (!student.job_role) {
        toast.error(
          "Please fill in Job Role for all newly shortlisted students",
        );
        return;
      }
      if (!/^[0-9a-fA-F]{24}$/.test(student.studentId)) {
        toast.error(`Invalid student ID for ${student.name}`);
        return;
      }
    }

    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);

    try {
      const validCombos = selectedCombinations.filter(
        (c) => c.batch && c.course,
      );

      const updatedStudents = students
        .filter(
          (student) => student.shortlisted !== student.initiallyShortlisted,
        )
        .map((student) => ({
          studentId: student.studentId,
          action: student.shortlisted ? "add" : "remove",
          jobtype: student.shortlisted ? student.job_type : undefined,
          jobrole: student.shortlisted ? student.job_role : undefined,
          ctc:
            student.shortlisted && student.job_type !== "Intern"
              ? student.ctc
              : undefined,
          stipend:
            student.shortlisted && student.job_type.includes("Intern")
              ? student.stipend
              : undefined,
          internduration:
            student.shortlisted && student.job_type.includes("Intern")
              ? student.intern_duration
              : undefined,
        }));

      // =========================
      // NONE SHORTLISTED
      // =========================
      if (updatedStudents.length === 0) {
        if (validCombos.length === 0) {
          toast.error("Select at least one batch & course");
          setLoading(false);
          return;
        }

        const noneResponse = await axios.post(
          `${import.meta.env.REACT_APP_BASE_URL}/jobprofile/add-final-shortlist-students`,
          {
            jobId,
            students: [],
            combinations: validCombos,
          },
          { withCredentials: true },
        );

        toast.success("Marked as none shortlisted");
        if (noneResponse.data.emailSent) {
          toast.success("Thank-you email sent to HR successfully!");
        }
        onClose();
        return;
      }

      // =========================
      // NORMAL FLOW
      // =========================
      const response = await axios.post(
        `${import.meta.env.REACT_APP_BASE_URL}/jobprofile/add-final-shortlist-students`,
        {
          jobId,
          students: updatedStudents,
        },
        { withCredentials: true },
      );

      toast.success("Shortlist updated successfully!");
      if (response.data.emailSent) {
        toast.success("Thank-you email sent to HR successfully!");
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update shortlist.");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      starredFields.some((field) =>
        student[field.fieldName]
          ?.toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ) || student.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Determine if Stipend and Intern Duration columns should be shown
  const showInternColumns = students.some(
    (student) =>
      student.job_type === "Intern" ||
      student.job_type === "Intern+PPO" ||
      student.job_type === "Intern+FTE",
  );

  const isNoneShortlistedPreviously =
    students.length > 0 &&
    students.every((s) => s.initiallyShortlisted === false);

  const renderInputFields = (student, index) => {
    const isIntern = student.job_type === "Intern";
    const isInternPlus =
      student.job_type === "Intern+PPO" || student.job_type === "Intern+FTE";
    const isFTE = student.job_type === "FTE";
    const isDisabled = student.initiallyShortlisted && student.shortlisted;

    return (
      <>
        <td className="px-4 py-2 border text-center">
          <select
            value={student.job_type}
            onChange={(e) =>
              handleInputChange(
                students.findIndex((s) => s.studentId === student.studentId),
                "job_type",
                e.target.value,
              )
            }
            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            disabled={isDisabled}
          >
            <option value="">Select Job Type</option>
            {jobTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </td>
        {showInternColumns && (isIntern || isInternPlus) && (
          <>
            <td className="px-4 py-2 border text-center">
              <input
                type="text"
                value={student.stipend}
                onChange={(e) =>
                  handleInputChange(
                    students.findIndex(
                      (s) => s.studentId === student.studentId,
                    ),
                    "stipend",
                    e.target.value,
                  )
                }
                className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Enter Stipend"
                disabled={isDisabled}
              />
            </td>
            <td className="px-4 py-2 border text-center">
              {/* <select
                value={student.intern_duration}
                onChange={(e) => handleInputChange(students.findIndex((s) => s.studentId === student.studentId), 'intern_duration', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                disabled={isDisabled}
              >
                <option value="">Select Duration</option>
                {internshipDurationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select> */}
              <input
                type="Number"
                value={student.intern_duration}
                onChange={(e) =>
                  handleInputChange(
                    students.findIndex(
                      (s) => s.studentId === student.studentId,
                    ),
                    "intern_duration",
                    e.target.value,
                  )
                }
                className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Enter Intern Duration"
                disabled={isDisabled}
              />
            </td>
          </>
        )}
        {showInternColumns && !(isIntern || isInternPlus) && (
          <>
            <td className="px-4 py-2 border text-center"></td>
            <td className="px-4 py-2 border text-center"></td>
          </>
        )}
        {(isInternPlus || isFTE) && (
          <td className="px-4 py-2 border text-center">
            <input
              type="text"
              value={student.ctc}
              onChange={(e) =>
                handleInputChange(
                  students.findIndex((s) => s.studentId === student.studentId),
                  "ctc",
                  e.target.value,
                )
              }
              className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Enter CTC"
              disabled={isDisabled}
            />
          </td>
        )}
        {!(isInternPlus || isFTE) && (
          <td className="px-4 py-2 border text-center"></td>
        )}
        <td className="px-4 py-2 border text-center">
          <input
            type="text"
            value={student.job_role}
            onChange={(e) =>
              handleInputChange(
                students.findIndex((s) => s.studentId === student.studentId),
                "job_role",
                e.target.value,
              )
            }
            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="Enter Job Role"
            disabled={isDisabled}
          />
        </td>
      </>
    );
  };

  const renderConfirmFields = (student) => {
    const isIntern = student.job_type === "Intern";
    const isInternPlus =
      student.job_type === "Intern+PPO" || student.job_type === "Intern+FTE";
    const isFTE = student.job_type === "FTE";

    return (
      <>
        <td className="px-4 py-2 border text-center">
          {student.job_type || "N/A"}
        </td>
        {showInternColumns && (isIntern || isInternPlus) && (
          <>
            <td className="px-4 py-2 border text-center">
              {student.stipend || "N/A"}
            </td>
            <td className="px-4 py-2 border text-center">
              {student.intern_duration || "N/A"}
            </td>
          </>
        )}
        {showInternColumns && !(isIntern || isInternPlus) && (
          <>
            <td className="px-4 py-2 border text-center"></td>
            <td className="px-4 py-2 border text-center"></td>
          </>
        )}
        {(isInternPlus || isFTE) && (
          <td className="px-4 py-2 border text-center">
            {student.ctc || "N/A"}
          </td>
        )}
        {!(isInternPlus || isFTE) && (
          <td className="px-4 py-2 border text-center"></td>
        )}
        <td className="px-4 py-2 border text-center">
          {student.job_role || "N/A"}
        </td>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mt-2 ml-4">
        <button
          className="flex items-center text-blue-600 hover:text-blue-800"
          onClick={onClose}
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>
      </div>
      <div className="max-w-7xl mx-auto bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl">
        <div className="mb-4 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search students"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            onClick={handleBulkAction}
          >
            Shortlist All
          </button>
        </div>
        <div className="overflow-x-auto mb-6">
          {isNoneShortlistedPreviously && (
            <div className="mb-4 flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg border border-red-300">
              <span className="text-lg">⚠️</span>
              <span className="font-medium">
                No students were shortlisted for this job
              </span>
            </div>
          )}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading students...</p>
            </div>
          ) : filteredStudents.length > 0 ? (
            <table className="w-full text-sm text-left text-gray-500 border-collapse">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-1 py-2 border text-center">SNo.</th>
                  {starredFields.map((field, index) => (
                    <th key={index} className="px-4 py-2 border">
                      {field.fieldName}
                    </th>
                  ))}
                  <th className="px-4 py-2 border text-center">Job Type</th>
                  {showInternColumns && (
                    <>
                      <th className="px-4 py-2 border text-center">Stipend</th>
                      <th className="px-4 py-2 border text-center">
                        Intern Duration
                      </th>
                    </>
                  )}
                  <th className="px-4 py-2 border text-center">CTC (Lakhs)</th>
                  <th className="px-4 py-2 border text-center">Job Role</th>
                  <th className="px-4 py-2 border text-center">Shortlisted</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr
                    key={index}
                    className={`bg-white border-b ${student.initiallyShortlisted ? "bg-gray-50" : ""}`}
                  >
                    <td className="px-1 py-2 border text-center">
                      {index + 1}.
                    </td>
                    {starredFields.map((field, fieldIndex) => (
                      <td key={fieldIndex} className="px-4 py-2 border">
                        {student[field.fieldName] || "N/A"}
                      </td>
                    ))}
                    {renderInputFields(student, index)}
                    <td className="px-4 py-2 border text-center">
                      <input
                        type="checkbox"
                        checked={student.shortlisted}
                        onChange={() =>
                          handleCheckboxChange(
                            students.findIndex(
                              (s) => s.studentId === student.studentId,
                            ),
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No eligible students found.</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            onClick={() => {
              setStudents((prev) =>
                prev.map((s) => ({ ...s, shortlisted: false })),
              );
              setShowConfirmModal(true);
            }}
          >
            None Shortlisted
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            onClick={handleInitialSubmit}
            disabled={loading}
          >
            Proceed
          </button>
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>

        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                Confirm Shortlist Changes
              </h2>
              <p className="mb-4">
                Please review the changes to the shortlist before submitting:
              </p>
              {students.filter(
                (student) =>
                  student.shortlisted || student.initiallyShortlisted,
              ).length > 0 ? (
                <table className="w-full text-sm text-left text-gray-500 border-collapse mb-6">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                      <th className="px-1 py-2 border text-center">SNo.</th>
                      <th className="px-4 py-2 border">Name</th>
                      {starredFields.map((field, index) => (
                        <th key={index} className="px-4 py-2 border">
                          {field.fieldName}
                        </th>
                      ))}
                      <th className="px-4 py-2 border text-center">Job Type</th>
                      {showInternColumns && (
                        <>
                          <th className="px-4 py-2 border text-center">
                            Stipend
                          </th>
                          <th className="px-4 py-2 border text-center">
                            Intern Duration
                          </th>
                        </>
                      )}
                      <th className="px-4 py-2 border text-center">CTC</th>
                      <th className="px-4 py-2 border text-center">Job Role</th>
                      <th className="px-4 py-2 border text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students
                      .filter(
                        (student) =>
                          student.shortlisted || student.initiallyShortlisted,
                      )
                      .map((student, index) => (
                        <tr key={index} className="bg-white border-b">
                          <td className="px-4 py-2 border text-center">
                            {index + 1}.
                          </td>
                          <td className="px-4 py-2 border">{student.name}</td>
                          {starredFields.map((field, fieldIndex) => (
                            <td key={fieldIndex} className="px-4 py-2 border">
                              {student[field.fieldName] || "N/A"}
                            </td>
                          ))}
                          {renderConfirmFields(student)}
                          <td className="px-4 py-2 border text-center">
                            {student.shortlisted
                              ? "Shortlisted"
                              : "Unshortlisted"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <div className="mb-4">
                  <p className="text-gray-600 mb-4">
                    No students are currently shortlisted.
                  </p>
                  <h3 className="font-semibold mb-2">Select Batch & Course</h3>

                  <div className="flex gap-4">
                    {/* Batch */}
                    <select
                      onChange={(e) => {
                        const batch = e.target.value;
                        setSelectedCombinations((prev) => [
                          ...prev,
                          { batch, course: "" },
                        ]);
                      }}
                      className="border px-3 py-2 rounded"
                    >
                      <option value="">Select Batch</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                      <option value="2029">2029</option>
                    </select>

                    {/* Course */}
                    <select
                      onChange={(e) => {
                        const course = e.target.value;
                        setSelectedCombinations((prev) => {
                          const updated = [...prev];
                          updated[updated.length - 1].course = course;
                          return updated;
                        });
                      }}
                      className="border px-3 py-2 rounded"
                    >
                      <option value="">Select Course</option>
                      <option value="B.Tech">B.Tech</option>
                      <option value="M.Tech">M.Tech</option>
                      <option value="MBA">MBA</option>
                      <option value="M.Sc.">M.Sc.</option>
                      <option value="PHD">PHD</option>
                    </select>
                  </div>

                  {/* Selected List */}
                  <div className="mt-3">
                    {selectedCombinations.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-100 px-3 py-1 rounded mb-1"
                      >
                        <span className="text-sm">
                          {item.batch} - {item.course}
                        </span>

                        <button
                          className="text-red-500 hover:text-red-700 text-sm"
                          onClick={() => {
                            setSelectedCombinations((prev) =>
                              prev.filter((_, i) => i !== index),
                            );
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex space-x-4">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Confirm & Submit"}
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinalShortlistStudents;