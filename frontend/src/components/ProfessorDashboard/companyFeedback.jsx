import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import BouncingLoader from "../BouncingLoader";

const RatingView = ({ label, value }) => (
  <div className="mb-4">
    <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((r) => (
        <div
          key={r}
          className={`w-7 h-7 flex items-center justify-center rounded-full text-xs
            ${
              r === value
                ? "bg-custom-blue text-white"
                : "bg-gray-200 text-gray-600"
            }`}
        >
          {r}
        </div>
      ))}
    </div>
  </div>
);

const RecruiterFeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.REACT_APP_BASE_URL}/recruiterFeedback`
        );
        setFeedbacks(res.data);
      } catch (err) {
        console.error("Failed to fetch feedbacks", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-custom-blue rounded-full animate-spin" />
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      setDeleting(true);

      await axios.post(
        `${import.meta.env.REACT_APP_BASE_URL}/recruiterFeedback/delete/${deleteTarget}`,
        {},
        {
          withCredentials: true,
        }
      );

      setFeedbacks((prev) => prev.filter((fb) => fb._id !== deleteTarget));

      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeleting(false);
    }
  };
  const ratingFields = [
    {
      label: "Technical Knowledge",
      path: "studentEvaluation.technicalKnowledge",
    },
    {
      label: "Problem Solving",
      path: "studentEvaluation.problemSolvingSkills",
    },
    {
      label: "Programming / Core Skills",
      path: "studentEvaluation.programmingOrCoreSkills",
    },
    {
      label: "Communication Skills",
      path: "studentEvaluation.communicationSkills",
    },
    {
      label: "Recruitment Facilities",
      path: "infrastructureFeedback.recruitmentFacilities",
    },
    { label: "IT Support", path: "infrastructureFeedback.itSupport" },
    {
      label: "Guest House Accommodation",
      path: "stayAndHospitalityFeedback.guestHouseAccomodation",
    },
    {
      label: "Cleanliness & Comfort",
      path: "stayAndHospitalityFeedback.cleanlinessAndComfort",
    },
    {
      label: "Food & Meal Quality",
      path: "stayAndHospitalityFeedback.foodAndMealQuality",
    },
    {
      label: "Hospitality & Support Staff",
      path: "stayAndHospitalityFeedback.hospitalityAndSupportStaff",
    },
  ];

  const getValue = (obj, path) =>
    path.split(".").reduce((acc, key) => acc?.[key], obj);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="flex justify-between items-center max-w-6xl mx-auto mb-10">
        <h1 className="text-3xl font-bold">
          Recruiter <span className="text-custom-blue">Feedbacks</span>
        </h1>

        <button
          onClick={() => setShowAnalytics(true)}
          className="bg-custom-blue hover:bg-blue-600
               text-white px-4 py-2 rounded-lg
               text-sm font-medium"
        >
          View Analytics
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {feedbacks.map((fb, idx) => {
          const isOpen = expandedIndex === idx;

          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl shadow-lg p-6 cursor-pointer
                transition-all duration-300
                ${isOpen ? "border-2 border-custom-blue" : ""}
              `}
              onClick={() => setExpandedIndex(isOpen ? null : idx)}
            >
              {/* SUMMARY CARD */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                <div>
                  <p className="text-xs text-gray-500">Company</p>
                  <p className="font-semibold">{fb.companyName}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Recruiter</p>
                  <p>{fb.recruiterNames}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Mode</p>
                  <p>{fb.modeOfRecruitment}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Programs</p>
                  <p>{fb.programsVisited?.join(", ")}</p>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setDeleteTarget(fb._id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
              {/* EXPANDED VIEW */}
              {isOpen && (
                <div className="mt-8 border-t pt-6 space-y-8">
                  {/* Student Evaluation */}
                  <div>
                    {fb.email && (
                      <div>
                        <span className="text-gray-500">
                          Recruiter Email:
                        </span>{" "}
                        {fb.email}
                      </div>
                    )}
                    {fb.contactNumber && (
                      <div>
                        <span className="text-gray-500">
                          Recruiter Contact:
                        </span>{" "}
                        {fb.contactNumber}
                      </div>
                    )}
                    <h3 className="mt-10 text-lg font-semibold mb-4">
                      Student Evaluation
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <RatingView
                        label="Technical Knowledge"
                        value={fb.studentEvaluation?.technicalKnowledge}
                      />
                      <RatingView
                        label="Problem Solving"
                        value={fb.studentEvaluation?.problemSolvingSkills}
                      />
                      <RatingView
                        label="Programming / Core Skills"
                        value={fb.studentEvaluation?.programmingOrCoreSkills}
                      />
                      <RatingView
                        label="Communication Skills"
                        value={fb.studentEvaluation?.communicationSkills}
                      />
                    </div>
                  </div>

                  {/* Infrastructure */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Infrastructure & Coordination
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <RatingView
                        label="Recruitment Facilities"
                        value={fb.infrastructureFeedback?.recruitmentFacilities}
                      />
                      <RatingView
                        label="IT Support"
                        value={fb.infrastructureFeedback?.itSupport}
                      />
                    </div>
                  </div>

                  {/* Stay & Hospitality */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Stay & Hospitality
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <RatingView
                        label="Guest House Accommodation"
                        value={
                          fb.stayAndHospitalityFeedback?.guestHouseAccomodation
                        }
                      />
                      <RatingView
                        label="Cleanliness & Comfort"
                        value={
                          fb.stayAndHospitalityFeedback?.cleanlinessAndComfort
                        }
                      />
                      <RatingView
                        label="Food & Meal Quality"
                        value={
                          fb.stayAndHospitalityFeedback?.foodAndMealQuality
                        }
                      />
                      <RatingView
                        label="Hospitality & Support Staff"
                        value={
                          fb.stayAndHospitalityFeedback
                            ?.hospitalityAndSupportStaff
                        }
                      />
                    </div>
                  </div>

                  {/* Text Feedback */}
                  <div className="space-y-2 text-sm text-gray-700">
                    {fb.strengthsObserved && (
                      <p>
                        <b>Strengths:</b> {fb.strengthsObserved}
                      </p>
                    )}
                    {fb.skillGapsObserved && (
                      <p>
                        <b>Skill Gaps:</b> {fb.skillGapsObserved}
                      </p>
                    )}
                    {fb.suggestionsForImprovement && (
                      <p>
                        <b>Suggestions:</b> {fb.suggestionsForImprovement}
                      </p>
                    )}
                    {fb.suggestionsForSpecificDepartment && (
                      <p>
                        <b>Department Suggestions:</b>{" "}
                        {fb.suggestionsForSpecificDepartment}
                      </p>
                    )}
                    {fb.additionalRemarks && (
                      <p>
                        <b>Remarks:</b> {fb.additionalRemarks}
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                    <span>
                      Revisit NITJ: <b>{fb.revisitNITJalandhar}</b>
                    </span>
                    <span>
                      Collaboration:{" "}
                      <b>{fb.interestedInCollaboration ? "Yes" : "No"}</b>
                    </span>
                    <span>
                      Overall Rating: <b>{fb.overallRating}/5</b>
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm text-center shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-red-600">
              Confirm Delete
            </h2>
            <p className="text-sm text-gray-700 mb-6">
              Are you sure you want to delete this feedback?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg bg-gray-300 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAnalytics && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div
            className="bg-white rounded-2xl p-6 sm:p-8
                    w-[95%] max-w-6xl
                    max-h-[90vh] overflow-y-auto shadow-lg"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-custom-blue">
                Feedback Analytics
              </h2>

              <button
                onClick={() => setShowAnalytics(false)}
                className="text-gray-500 hover:text-gray-800 text-sm"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-10">
              {ratingFields.map((field) => {
                const chartData = feedbacks
                  .map((fb) => ({
                    company: fb.companyName,
                    rating: getValue(fb, field.path),
                  }))
                  .filter((d) => d.rating !== undefined);

                //Calculate Average
                const avgRating =
                  chartData.length > 0
                    ? (
                        chartData.reduce((sum, item) => sum + item.rating, 0) /
                        chartData.length
                      ).toFixed(2)
                    : "N/A";

                return (
                  <div key={field.label}>
                    <h3 className="text-lg font-semibold mb-4">
                      {field.label}{" "}
                      <span className="text-sm text-gray-500">
                        [Avg: {avgRating}]
                      </span>
                    </h3>

                    <div className="w-full h-64">
                      <ResponsiveContainer>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="none"
                            tick={{ fontSize: 12 }}
                            interval={0}
                            angle={-20}
                            textAnchor="end"
                          />
                          <YAxis domain={[0, 5]} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="rating"
                            stroke="#2563eb"
                            strokeWidth={3}
                            dot={{ r: 2 }}
                            activeDot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterFeedbackList;
