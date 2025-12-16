import { useState } from "react";
import axios from "axios";
import Lottie from "lottie-react";
import foldedHands from "../components/ui/folded-hands.json"

const Rating = ({ label, value, onChange }) => (
  <div className="mb-6">
    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="flex flex-wrap gap-10">
      {[1, 2, 3, 4, 5].map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border text-sm sm:text-base
            transition-all duration-200
            ${
              value === r
                ? "bg-custom-blue text-white border-custom-blue"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            }
          `}
        >
          {r}
        </button>
      ))}
    </div>
  </div>
);

const CompanyFeedbackForm = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState("success");
  const [popupMessage, setPopupMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    recruiterNames: "",
    email: "",
    contactNumber: "",
    modeOfRecruitment: "On-campus",
    programsVisited: [],
    studentEvaluation: {},
    infrastructureFeedback: {},
    stayAndHospitalityFeedback: {},
    strengthsObserved: "",
    skillGapsObserved: "",
    suggestionsForImprovement: "",
    suggestionsForSpecificDepartment: "",
    revisitNITJalandhar: "Yes",
    interestedInCollaboration: false,
    overallRating: 1,
    additionalRemarks: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post(
        `${import.meta.env.REACT_APP_BASE_URL}/recruiterFeedback`,
        form,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setIsLoading(false);
      setShowPopup(false);
      setShowThankYou(true); 
    } catch (error) {
      setIsLoading(false);
      setPopupType("error");
      setPopupMessage(
        error.response?.data?.message || "Error submitting feedback"
      );
      setShowPopup(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {showThankYou? 
        (<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-[90%] max-w-md text-center shadow-lg">
            {/* Lottie Animation */}
            <div className="w-28 sm:w-32 mx-auto mb-4">
              <Lottie animationData={foldedHands} loop />
            </div>

            <h2 className="text-2xl font-bold text-custom-blue mb-2">
              Thank You!
            </h2>

            <p className="text-gray-700 text-sm sm:text-base mb-6">
              Thanks for sharing your valuable feedback. Your response has been
              successfully recorded.
            </p>

            <button
              onClick={() => {
                setShowThankYou(false);

                // 🔄 Reset form completely
                setForm({
                  companyName: "",
                  recruiterNames: "",
                  email: "",
                  contactNumber: "",
                  modeOfRecruitment: "On-campus",
                  programsVisited: [],
                  studentEvaluation: {},
                  infrastructureFeedback: {},
                  stayAndHospitalityFeedback: {},
                  strengthsObserved: "",
                  skillGapsObserved: "",
                  suggestionsForImprovement: "",
                  suggestionsForSpecificDepartment: "",
                  revisitNITJalandhar: "Yes",
                  interestedInCollaboration: false,
                  overallRating: 1,
                  additionalRemarks: "",
                });
              }}
              className="bg-custom-blue hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm sm:text-base"
            >
              Submit Another Response
            </button>
          </div>
        </div>)
      :(
        <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto bg-white
                 p-4 sm:p-6 md:p-8
                 rounded-2xl shadow-lg"
    >
      <h1 className="text-3xl font-bold sm:text-4xl mb-8 text-center">
        Recruiter <span className="text-custom-blue">Feedback Form</span>
      </h1>

      {/* Company Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-700">
            Company Name
          </label>
          <input
            type="text"
            required
            className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300
                       bg-gray-100 text-gray-800
                       focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter company name"
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-700">
            Recruiter Name
          </label>
          <input
            type="text"
            required
            className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300
                       bg-gray-100 text-gray-800
                       focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter Your Name"
            onChange={(e) =>
              setForm({ ...form, recruiterNames: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300
                       bg-gray-100 text-gray-800
                       focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="example@company.com"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-700">
            Contact Number
          </label>
          <input
            type="tel"
            className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300
                       bg-gray-100 text-gray-800
                       focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="+91XXXXXXXXXX"
            onChange={(e) =>
              setForm({ ...form, contactNumber: e.target.value })
            }
          />
        </div>
      </div>

      {/* Mode of Recruitment */}
      <div className="mt-8">
        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-3">
          Mode of Recruitment
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          {["Campus Visit", "Hybrid", "Virtual"].map((mode) => (
            <label
              key={mode}
              className="flex items-center gap-2 text-sm sm:text-base cursor-pointer"
            >
              <input
                type="radio"
                name="modeOfRecruitment"
                value={mode}
                checked={form.modeOfRecruitment === mode}
                onChange={(e) =>
                  setForm({ ...form, modeOfRecruitment: e.target.value })
                }
              />
              {mode}
            </label>
          ))}
        </div>
      </div>

      {/* Programs Visited */}
      <div className="mt-8">
        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-3">
          Programs Visited
        </label>

        <div className="flex flex-wrap gap-6">
          {["B.Tech", "M.Tech", "Ph.D"].map((program) => (
            <label
              key={program}
              className="flex items-center gap-2 text-sm sm:text-base cursor-pointer"
            >
              <input
                type="checkbox"
                value={program}
                checked={form.programsVisited.includes(program)}
                onChange={(e) => {
                  const checked = e.target.checked;

                  setForm({
                    ...form,
                    programsVisited: checked
                      ? [...form.programsVisited, program]
                      : form.programsVisited.filter((item) => item !== program),
                  });
                }}
                className="accent-blue-600"
              />
              {program}
            </label>
          ))}
        </div>
      </div>

      {/* Student Evaluation */}
      <h2 className="text-lg sm:text-xl font-semibold mt-10 mb-6">
        Student Evaluation
      </h2>

      <Rating
        label="Technical Knowledge"
        value={form.studentEvaluation.technicalKnowledge}
        onChange={(v) =>
          setForm({
            ...form,
            studentEvaluation: {
              ...form.studentEvaluation,
              technicalKnowledge: v,
            },
          })
        }
      />

      <Rating
        label="Problem Solving Skills"
        value={form.studentEvaluation.problemSolvingSkills}
        onChange={(v) =>
          setForm({
            ...form,
            studentEvaluation: {
              ...form.studentEvaluation,
              problemSolvingSkills: v,
            },
          })
        }
      />

      <Rating
        label="Programming / Core Skills"
        value={form.studentEvaluation.programmingOrCoreSkills}
        onChange={(v) =>
          setForm({
            ...form,
            studentEvaluation: {
              ...form.studentEvaluation,
              programmingOrCoreSkills: v,
            },
          })
        }
      />

      <Rating
        label="Communication Skills"
        value={form.studentEvaluation.communicationSkills}
        onChange={(v) =>
          setForm({
            ...form,
            studentEvaluation: {
              ...form.studentEvaluation,
              communicationSkills: v,
            },
          })
        }
      />

      {/* Infrastructure */}
      <h2 className="text-lg sm:text-xl font-semibold mt-10 mb-6">
        Infrastructure & Coordination
      </h2>

      <Rating
        label="Recruitment Facilities"
        value={form.infrastructureFeedback.recruitmentFacilities}
        onChange={(v) =>
          setForm({
            ...form,
            infrastructureFeedback: {
              ...form.infrastructureFeedback,
              recruitmentFacilities: v,
            },
          })
        }
      />

      <Rating
        label="IT Support"
        value={form.infrastructureFeedback.itSupport}
        onChange={(v) =>
          setForm({
            ...form,
            infrastructureFeedback: {
              ...form.infrastructureFeedback,
              itSupport: v,
            },
          })
        }
      />
      {/* Stay and Hospitality */}
      <h2 className="text-lg sm:text-xl font-semibold mt-10 mb-6">
        Stay & Hospitality Feedback
      </h2>

      <Rating
        label="Guest House Accommodation"
        value={form.stayAndHospitalityFeedback?.guestHouseAccomodation}
        onChange={(v) =>
          setForm({
            ...form,
            stayAndHospitalityFeedback: {
              ...form.stayAndHospitalityFeedback,
              guestHouseAccomodation: v,
            },
          })
        }
      />

      <Rating
        label="Cleanliness & Comfort"
        value={form.stayAndHospitalityFeedback?.cleanlinessAndComfort}
        onChange={(v) =>
          setForm({
            ...form,
            stayAndHospitalityFeedback: {
              ...form.stayAndHospitalityFeedback,
              cleanlinessAndComfort: v,
            },
          })
        }
      />

      <Rating
        label="Food & Meal Quality"
        value={form.stayAndHospitalityFeedback?.foodAndMealQuality}
        onChange={(v) =>
          setForm({
            ...form,
            stayAndHospitalityFeedback: {
              ...form.stayAndHospitalityFeedback,
              foodAndMealQuality: v,
            },
          })
        }
      />

      <Rating
        label="Hospitality & Support Staff"
        value={form.stayAndHospitalityFeedback?.hospitalityAndSupportStaff}
        onChange={(v) =>
          setForm({
            ...form,
            stayAndHospitalityFeedback: {
              ...form.stayAndHospitalityFeedback,
              hospitalityAndSupportStaff: v,
            },
          })
        }
      />

      {/* Text Areas */}
      {[
        ["Strengths Observed in Students", "strengthsObserved"],
        ["Skill Gaps Observed", "skillGapsObserved"],
        ["Suggestions for Improvement", "suggestionsForImprovement"],
        [
          "Suggestions for Any Specific Department",
          "suggestionsForAnySpecificDepartment",
        ],
        ["Additional Remarks", "additionalRemarks"],
      ].map(([label, key]) => (
        <div key={key} className="mt-8">
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm sm:text-base font-medium text-gray-700">
              {label}
            </label>

            {key === "suggestionsForAnySpecificDepartment" && (
              <div className="relative group">
                {/* Info Icon */}
                <span
                  className="w-4 h-4 flex items-center justify-center
                           rounded-full border border-gray-400
                           text-xs text-gray-600 cursor-pointer"
                >
                  i
                </span>

                {/* Tooltip */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-7
                          w-56 p-2 rounded-md
                          bg-gray-800 text-white text-xs
                          opacity-0 scale-95
                          group-hover:opacity-100 group-hover:scale-100
                          transition-all duration-200
                          pointer-events-none z-10"
                >
                  For e.g. any particular skill, technology, or
                  department-specific improvement.
                </div>
              </div>
            )}
          </div>

          <textarea
            rows="3"
            className="w-full px-4 py-2 rounded-lg border border-gray-300
                 bg-gray-100 text-gray-800
                 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        </div>
      ))}

      {/* Overall Rating */}
      <Rating
        label="Overall Experience Rating"
        value={form.overallRating}
        onChange={(v) => setForm({ ...form, overallRating: v })}
      />

      {/* Revisit */}
      <div className="mt-10">
        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-3">
          Would you like to visit NIT Jalandhar again?
        </label>
        <div className="flex gap-6">
          {["Yes", "No", "Maybe"].map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2 text-sm sm:text-base cursor-pointer"
            >
              <input
                type="radio"
                name="revisitNITJalandhar"
                value={opt}
                checked={form.revisitNITJalandhar === opt}
                onChange={(e) =>
                  setForm({
                    ...form,
                    revisitNITJalandhar: e.target.value,
                  })
                }
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Collaboration */}
      <label className="flex items-center gap-2 mt-8 text-sm sm:text-base cursor-pointer">
        <input
          type="checkbox"
          onChange={(e) =>
            setForm({
              ...form,
              interestedInCollaboration: e.target.checked,
            })
          }
        />
        Interested in future collaboration with NIT Jalandhar
      </label>

      <button
        type="submit"
        disabled={isLoading}
        className={`mt-10 w-full sm:w-auto
    px-8 py-2 rounded-lg
    text-sm sm:text-base font-medium text-white
    ${
      isLoading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-custom-blue hover:bg-blue-600"
    }
  `}
      >
        {isLoading ? "Submitting..." : "Submit Feedback"}
      </button>
      </form>)
      }
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm text-center shadow-lg">
            <h2
              className={`text-lg font-semibold mb-2 ${
                popupType === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {popupType === "success" ? "Success" : "Error"}
            </h2>

            <p className="text-gray-700 mb-4">{popupMessage}</p>

            <button
              onClick={() => setShowPopup(false)}
              className={`px-4 py-2 rounded-lg text-white text-sm
          ${
            popupType === "success"
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          }
        `}
            >
              OK
            </button>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm text-center shadow-lg">
            {/* Spinner */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 border-4 border-gray-300 border-t-custom-blue rounded-full animate-spin" />
            </div>

            <p className="text-gray-700 text-sm sm:text-base">
              Submitting your feedback...
            </p>
          </div>
        </div>
      )}
    </div>
)
}
export default CompanyFeedbackForm;
