import React, { useEffect, useState,useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function RepresentativeApplication() {
const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [token, setToken] = useState(null);
  const [type, setType] = useState(null);
  const [eligible, setEligible] = useState(true);
  const [loading, setLoading] = useState(true);
const [isFinalSubmit, setIsFinalSubmit] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
const[applicationId,setApplicationId]=useState(null);
const [deadline, setDeadline] = useState(null);
const [semester, setSemester] = useState("");
  /* ---------- PERSONAL ---------- */
  const [personal, setPersonal] = useState({
  Name: "",
  RollNumber: "",
  Department: "",
  Program: "",
  Semester: "",
  Contact: "",
  Email: ""
});
  /* ---------- ACADEMIC ---------- */
  const [academic, setAcademic] = useState({
  CGPA: "",
  Carry: "",
  Disciplinary: ""
});

  /* ---------- ACTIVITIES ---------- */
  const [activities, setActivities] = useState([
    { description: "", role: "", duration: "" }
  ]);

  /* ---------- SOP FILE ---------- */
  const [sop, setsop] = useState(null);

  const [declarationAccepted, setDeclarationAccepted] = useState(false);
//   if (data.alreadySubmitted) {
//   setAlreadySubmitted(true);
//   setSopPath(data.sop);
//   setApplicationId(data.applicationId);
// }

  /* ---------- LOAD TOKEN + EXISTING ---------- */
  useEffect(() => {
    axios
      .post(
        `${import.meta.env.REACT_APP_BASE_URL}/api/representative/generate-token`,
        {},
        { withCredentials: true }
      )
      .then(res => {
// console.log("API RESPONSE:", res.data);
        setToken(res.data.token);
        setType(res.data.type);
setDeadline(res.data.deadline);
        /* ⭐ If already submitted */
        if (res.data.application) {
          const app = res.data.application;

          setPersonal(app.personal);
          setAcademic(app.academic);
          setActivities(app.activities);
          setDeclarationAccepted(app.declarationAccepted);
setApplicationId(app._id);
          setIsEditing(false); // view mode first
        
 if (app.status === "submitted") {
          setAlreadySubmitted(true);
          setIsEditing(false);
        } else {
          setIsEditing(true);
        }
      }
        if (res.data.message) toast.success(res.data.message);

      })
      .catch(err => {
        toast.error(err.response?.data?.message || "Not eligible");
        setEligible(false);
      })
      .finally(() => setLoading(false));
  }, []);
  const isExpired =
  deadline && new Date() > new Date(deadline);


const handleSubmit = async (isFinalSubmit) => {
   if (!declarationAccepted) {
      toast.error("Please accept declaration.");
      return;
    }
    const sem = Number(semester);

if (!sem || sem < 1 || sem > 10) {
  toast.error("Enter a valid semester (1–10)");
  return;
}
const formData = new FormData();

  formData.append("token", token);
  formData.append("type", type);
  formData.append("activities", JSON.stringify(activities));
  formData.append("declarationAccepted", declarationAccepted);
  formData.append("isFinalSubmit", isFinalSubmit);
formData.append("semester", semester); 
  if (sop) formData.append("sop", sop);
  const res = await axios.post(
    `${import.meta.env.REACT_APP_BASE_URL}/api/representative/submit`,
    formData,
    { withCredentials: true }
  );

  toast.success(res.data.message);
 if (res.data.alreadySubmitted) {
    setAlreadySubmitted(true);
    setApplicationId(res.data.applicationId);
    setIsEditing(false);
    return;
  }

  if (isFinalSubmit) {
    setApplicationId(res.data.applicationId);
    setAlreadySubmitted(true);  
    setIsEditing(false);
  }
};
  /* ---------- HANDLERS ---------- */
const handleDeleteApplication = async () => {
  if (!window.confirm("Delete your submitted application?")) return;

  try {
    const res = await axios.delete(

      `${import.meta.env.REACT_APP_BASE_URL}/api/representative/delete-application`,
      {
        data: { type },
        withCredentials: true
      }
    );

    alert(res.data.message || "Application deleted");

    setAlreadySubmitted(false);
    setApplicationId(null);
    setsop(null);

  } catch (err) {
    alert(err.response?.data?.message || "Delete failed");
  }

};
  const handlePersonal = (f, v) =>
    setPersonal({ ...personal, [f]: v });

  const handleAcademic = (f, v) =>
    setAcademic({ ...academic, [f]: v });

  const handleActivityChange = (i, f, v) => {
    const updated = [...activities];
    updated[i][f] = v;
    setActivities(updated);
  };

  const addActivity = () =>
    setActivities([...activities, { description: "", role: "", duration: "" }]);

  const removeActivity = (i) =>
    setActivities(activities.filter((_, idx) => idx !== i));



  if (loading) return <div className="p-10">Loading...
  
  </div>;

  if (!eligible)
    return (
      <div className="p-10 text-red-600 font-semibold">
        You are not eligible to apply.
      </div>
    );

  /* ---------- UI ---------- */
if (alreadySubmitted) {
  return (
    <div className="max-w-xl mx-auto p-8 bg-white border rounded shadow text-center">

      <h2 className="text-2xl font-bold mb-4">
        Application Already Submitted
      </h2>

      <p className="mb-6 text-gray-600">
        You have already submitted your application.
      </p>

      {/* 📄 DOWNLOAD PDF */}
      {applicationId && (
        <button
          onClick={() =>
            window.open(
              `${import.meta.env.REACT_APP_BASE_URL}/api/representative/pdf/${applicationId}`,
              "_blank"
            )
          }
          className="bg-indigo-600 text-white px-6 py-2 rounded mr-4"
        >
          Download Application PDF
        </button>
      )}

      {/* 🗑 DELETE (Testing only) */}
      {/* <button
        onClick={handleDeleteApplication}
        className="bg-red-600 text-white px-6 py-2 rounded"
      >
        Delete / Reset
      </button> */}

    </div>
  );
}
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white border rounded shadow-sm">
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
  <p className="text-sm text-blue-700 font-medium">
    Submission Deadline
  </p>

  <p className="text-lg font-semibold text-blue-900">
    {deadline
      ? new Date(deadline).toLocaleString()
      : "Not set"}
  </p>
</div> {isExpired && (
    <p className="text-red-600 font-semibold mb-4">
      Submission deadline has passed.
    </p>
  )}

      <h2 className="text-2xl font-bold text-center mb-8">
        {type?.toUpperCase()} Representative Application
      </h2>

      {!isEditing && (
        <div className="text-center mb-6">
          <button
            onClick={() => setIsEditing(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Edit Application
          </button>
        </div>
      )}

         <div>
          <div className="mb-4">
  <label className="block font-semibold mb-1">Current Semester</label>
  <input
    type="number"
    min="1"
    max="10"
    className="border p-2 rounded w-full"
    value={semester}
    disabled={!isEditing}
    onChange={(e) => setSemester(e.target.value)}
    required
  />
</div>
          <h3 className="font-semibold mb-3">
            Co-curricular / Extra-curricular
          </h3>

          {activities.map((activity, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 mb-3">
              <input
                type="text"
                placeholder="Activity Description"
                className="border p-2 rounded"
                value={activity.description}
                onChange={(e) =>
                  handleActivityChange(index, "description", e.target.value)
                }
                required
              />
              <input
                type="text"
                placeholder="Role"
                className="border p-2 rounded"
                value={activity.role}
                onChange={(e) =>
                  handleActivityChange(index, "role", e.target.value)
                }
                required
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Duration"
                  className="border p-2 rounded w-full"
                  value={activity.duration}
                  onChange={(e) =>
                    handleActivityChange(index, "duration", e.target.value)
                  }
                  required
                />
                {activities.length > 0 && (
                  <button
                    type="button"
                    onClick={() => removeActivity(index)}
                    className="bg-red-500 text-white px-3 rounded"
                  >
                    X
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addActivity}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          >
            Add Activity
          </button>
        </div>
        {/* SOP */}
        <Section title="Statement of Purpose (Upload)">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            disabled={!isEditing}
            onChange={(e) => setsop(e.target.files[0])}
          />
        </Section>

        {/* DECLARATION */}
        <div className="border p-4 rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Declaration</h3>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              required
              disabled={!isEditing}
              checked={declarationAccepted}
              onChange={(e) =>
                setDeclarationAccepted(e.target.checked)
              }
            />

            <label className="text-sm">
              The information provided above is true to the best of my
              knowledge. I understand that any false information may
              lead to the cancellation of my candidature.
            </label>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-4">

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="bg-gray-500 text-white px-6 py-2 rounded"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
             disabled={isExpired}
  className={`px-6 py-2 rounded ${
    isExpired
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-green-600 text-white"
  }`}
        
          >
            Submit Application
          </button>
{applicationId &&(
  <>
  <button
    onClick={() =>
      window.open(
        `${import.meta.env.REACT_APP_BASE_URL}/api/representative/pdf/${applicationId}`,
         "_blank"
      )
    }
    className="bg-indigo-600 text-white px-4 py-2 rounded"
  >
    Download Application PDF
  </button>
    </>
  
)}
        </div>
  
 
    </div>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

const Section = ({ title, children }) => (
  <div>
    <h3 className="font-bold mb-3">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const Input = ({ label, value, onChange, disabled, required = true }) => (
  <div className="flex items-center gap-4">
    <span className="w-64">
      {label}
      {required && <span className="text-red-600 ml-1">*</span>}:
    </span>

    <input
      disabled={disabled}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 border-b px-2 py-1 outline-none"
    />
  </div>
);