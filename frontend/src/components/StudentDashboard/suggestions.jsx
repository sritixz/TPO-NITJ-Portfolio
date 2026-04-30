import { useState,useEffect } from "react";
import toast from "react-hot-toast";

const Suggestions = () => {
const [recentSuggestions, setRecentSuggestions] = useState([]);
const [contactedCompanies, setContactedCompanies] = useState([]);
const [invalidFields, setInvalidFields] = useState([]);
const [activeTab, setActiveTab] = useState("not_contacted");
const [view, setView] = useState("create"); 
const [expandedId, setExpandedId] = useState(null);
const [companyType, setCompanyType] = useState("");


//  const token = localStorage.getItem("token");
 useEffect(()=>{
    // if (!token) return;
    const fetchRecentSuggestions = async () => {
      try {
        const res = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/suggestions/recentsuggestions`,{
            method: "GET",
              credentials: "include", 
            headers: {
              "Content-Type": "application/json",
              // Authorization: `Bearer ${token}`, 
            },  
        });
        const data = await res.json();
        setRecentSuggestions(data);
      } catch (error) {
        console.error("Error fetching recent suggestions:", error);
      }
    };
    fetchRecentSuggestions();
  }, []);
const filteredSuggestions = recentSuggestions.filter((item) => {
  if (activeTab === "contacted") return item.status === "Contacted";
  if (activeTab === "rejected") return item.status === "Rejected";
  return item.status === "Not Contacted";
});

const fetchContactedCompanies = async () => {
  try {
    const res = await fetch(
      `${import.meta.env.REACT_APP_BASE_URL}/suggestions/contacted`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();
    setContactedCompanies(data);
  } catch (err) {
    console.error("Error fetching contacted companies:", err);
  }
};

 const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

   
    const data = Object.fromEntries(formData.entries());
const requiredFields = [
  "company_name",
  "company_linkedin",
  "Hr_name",
  "Hr_contact",
  "HR_email",
  "company_type",
  "sector",
  "hiring_status",
  "Additional_Info",
];
const emptyFields = requiredFields.filter(
  (field) =>
    !data[field] || data[field].toString().trim() === ""
);

if (emptyFields.length > 0) {
  setInvalidFields(emptyFields);
  return;
}


  setInvalidFields([]);
    try {
      const res = await fetch(
        `${import.meta.env.REACT_APP_BASE_URL}/suggestions/suggestions`,
        {
          method: "POST",
            credentials: "include",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${token}`, // 👈 auth header
          },
          body: JSON.stringify(data),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to submit suggestion");
      }

      // const result = await res.json();
      // console.log("Success:", result);
        const result = await res.json();
    setRecentSuggestions((prev) => [result.suggestion, ...prev]);

      // alert("Suggestion submitted successfully!");
      toast.success("Suggestion submitted successfully!");

      e.target.reset();
    } catch (err) {
      console.error(err);
      // alert("Something went wrong");
      toast.success("Something went wrong!");

    }
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
<div className="mb-6 ">
  <div className="grid grid-cols-3 bg-gray-100 rounded-xl p-1 w-full max-w-8xl">
    <button
      onClick={() => setView("create")}
      className={`py-3 rounded-lg text-sm font-medium transition-all
        ${
          view === "create"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
    >
      Create New Suggestion
    </button>

    <button
      onClick={() => setView("recent")}
      className={`py-3 rounded-lg text-sm font-medium transition-all
        ${
          view === "recent"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
    >
      View Recent Suggestions
    </button>

    <button
  onClick={() => {
    setView("contactedCompanies");
    fetchContactedCompanies();
  }}
  className={`py-3 rounded-lg text-sm font-medium transition-all
    ${
      view === "contactedCompanies"
        ? "bg-white text-gray-900 shadow-sm"
        : "text-gray-500 hover:text-gray-700"
    }`}
>
  View Contacted Companies
</button>

  </div>
</div>

{/* Recent Suggestions Section */}
{view === "recent" && (
      
      <div className="bg-white rounded-xl shadow-md p-6 ">
  <h2 className="text-xl font-semibold mb-4">
    Your Recent Suggestions
  </h2>
{/* Sub Tabs */}
<div className="mb-6">
  <div className="grid grid-cols-3 bg-gray-100 rounded-xl p-1 w-full max-w-8xl">
    <button
      onClick={() => setActiveTab("not_contacted")}
      className={`py-3 rounded-lg text-sm font-medium transition-all ${
        activeTab === "not_contacted"
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      Not Contacted
    </button>

    <button
      onClick={() => setActiveTab("contacted")}
      className={`py-3 rounded-lg text-sm font-medium transition-all ${
        activeTab === "contacted"
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      Contacted
    </button>
     <button onClick={() => setActiveTab("rejected")} className={`py-3 rounded-lg text-sm font-medium transition-all ${
        activeTab === "rejected"
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-500 hover:text-gray-700"}`}>
    Rejected
  </button>
  </div>
</div>

{filteredSuggestions.length === 0 && (
  <p className="text-gray-500 text-sm">
    No suggestions in this category.
  </p>
)}

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
    {filteredSuggestions.map((item, index) => (
    <div
  key={index}
  className="border rounded-lg p-4 space-y-3 bg-white"
>
  {/* Top Row */}
  <div className="flex items-center justify-between">
    <div>
      <p className="font-medium text-gray-800">
        {item.company_name}
      </p>
      <p className="text-sm text-gray-500">
        Suggested on: {item.createdAt.slice(0, 10)}
      </p>
    </div>

 <span
  className={`px-3 py-1 text-sm rounded-full ${
    item.status === "Contacted"
      ? "bg-green-100 text-green-700"
      : item.status === "Rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700"
  }`}
>
  {item.status}
</span>

  </div>

  {/* View Response Button */}
  {item.status==="Contacted" && item.show_response==="true" && (
    <button
      onClick={() =>
        setExpandedId(expandedId === item._id ? null : item._id)
      }
      className="text-sm text-blue-600 hover:underline"
    >
      {expandedId === item._id ? "Hide Response" : "View Response"}
    </button>
  )}

  {/* Expanded Response Section */}
  {expandedId === item._id && (
    <div className="bg-gray-50 border rounded-lg p-3 text-sm space-y-2">
      <p>
        <span className="font-medium text-gray-700">
          Professor Response:
        </span>{" "}
        <span className="text-gray-800">
          {item.response || "—"}
        </span>
      </p>

      <p>
        <span className="font-medium text-gray-700">
          Additional Info:
        </span>{" "}
        <span className="text-gray-800">
          {item.Other_info || "No additional information"}
        </span>
      </p>
    </div>
  )}
</div>

    ))}
  </div>
</div>
)}
{/* View Contacted Companies */}
{view === "contactedCompanies" && (
  <div className="bg-white rounded-xl shadow-md p-6">
    <h2 className="text-xl font-semibold mb-4">
      Contacted Companies
    </h2>

    {contactedCompanies.length === 0 ? (
      <p className="text-gray-500 text-sm">
        No contacted companies yet.
      </p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contactedCompanies.map((item) => (
          <div
            key={item._id}
            className="border rounded-lg p-4 bg-white space-y-2"
          >
            <p className="font-medium text-gray-800">
              {item.company_name}
            </p>

            <p className="text-sm text-gray-600">
              <span className="font-medium">
                Professor Comment:
              </span>{" "}
              {item.response || "No response yet"}
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
)}
{/* Create new suggestion  */}
{view === "create" && (

      
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Suggest a Company</h2>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Company Name
            </label>
            <input
              type="text"
              name="company_name"
              placeholder="Enter company name"
              className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none   ${invalidFields.includes("company_name")
    ? "border-red-500 focus:ring-red-500"
    : "focus:ring-blue-500"}`}
    onChange={(e) =>
  setInvalidFields((prev) =>
    prev.filter((field) => field !== e.target.name)
  )
}

            />
          </div>

          {/* Company LinkedIn */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Company LinkedIn URL
            </label>
            <input
              type="url"
              name="company_linkedin"
              placeholder="https://linkedin.com/company/..."
              className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none  ${invalidFields.includes("company_linkedin")
    ? "border-red-500 focus:ring-red-500"
    : "focus:ring-blue-500"}`}
    onChange={(e) =>
  setInvalidFields((prev) =>
    prev.filter((field) => field !== e.target.name)
  )
}
            />
          </div>

          {/* HR Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              HR Name
            </label>
            <input
              type="text"
                name="Hr_name"
              placeholder="HR full name"
              className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none   ${invalidFields.includes("Hr_name")
    ? "border-red-500 focus:ring-red-500"
    : "focus:ring-blue-500"}`}
      onChange={(e) =>
  setInvalidFields((prev) =>
    prev.filter((field) => field !== e.target.name)
  )
}
            />
          </div>

          {/* HR Contact Number */}
          <div>
            <label className="block text-sm font-medium mb-1">
              HR Contact Number
            </label>
            <input
              type="tel"
              name="Hr_contact"
              placeholder="+91 XXXXX XXXXX"
              className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none   ${invalidFields.includes("Hr_contact")
    ? "border-red-500 focus:ring-red-500"
    : "focus:ring-blue-500"}`}
      onChange={(e) =>
  setInvalidFields((prev) =>
    prev.filter((field) => field !== e.target.name)
  )
}
            />
            
          </div>

          {/* HR Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              HR Email
            </label>
            <input
              type="email"
                name="HR_email"
              placeholder="hr@company.com"
              className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none   ${invalidFields.includes("HR_email")
    ? "border-red-500 focus:ring-red-500"
    : "focus:ring-blue-500"}`}
      onChange={(e) =>
  setInvalidFields((prev) =>
    prev.filter((field) => field !== e.target.name)
  )
}
            />
          </div>

          

        
          {/* Company Type */}
<div>
  <label className="block text-sm font-medium mb-1">
    Company Type
  </label>
  <select
    name="company_type"
    className={`w-full border rounded-lg px-4 py-2 ${
      invalidFields.includes("company_type")
        ? "border-red-500"
        : ""
    }`}
    onChange={(e) =>{
      setCompanyType(e.target.value);
      setInvalidFields((prev) =>
        prev.filter((field) => field !== e.target.name)
      )
    }}
  >
    <option value="">Select type</option>
    <option value="Core">Core</option>
    <option value="Tech">Tech</option>
    <option value="Non-tech">Non-tech</option>
    <option value="Other">Other</option>
  </select>
</div>
{companyType === "Other" && (
  <div>
    <label className="block text-sm font-medium mb-1">
      Specify Company Type
    </label>
    <input
      type="text"
      name="company_type_other"
      placeholder="Enter company type"
      className={`w-full border rounded-lg px-4 py-2 ${
        invalidFields.includes("company_type_other")
          ? "border-red-500"
          : ""
      }`}
      onChange={(e) =>
        setInvalidFields((prev) =>
          prev.filter((field) => field !== e.target.name)
        )
      }
    />
  </div>
)}

{/* Sector */}
<div>
  <label className="block text-sm font-medium mb-2">
    Sector
  </label>

  <div
    className={`flex gap-4 ${
      invalidFields.includes("sector")
        ? "border border-red-500 rounded-lg p-3"
        : ""
    }`}
  >
    {["PSU", "Private"].map((option) => (
      <label
        key={option}
        className="flex items-center gap-2 cursor-pointer"
      >
        <input
          type="radio"
          name="sector"
          value={option}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
          onChange={(e) =>
            setInvalidFields((prev) =>
              prev.filter((field) => field !== e.target.name)
            )
          }
        />
        <span className="text-sm text-gray-700">
          {option}
        </span>
      </label>
    ))}
  </div>


</div>


{/* Hiring Status */}
<div>
  <label className="block text-sm font-medium mb-2">
    Hiring Status
  </label>

  <div
    className={`flex gap-4 ${
      invalidFields.includes("hiring_status")
        ? "border border-red-500 rounded-lg p-3"
        : ""
    }`}
  >
    {[
      { label: "Actively Hiring", value: "Active" },
      { label: "Not Actively Hiring", value: "Inactive" },
    ].map((option) => (
      <label
        key={option.value}
        className="flex items-center gap-2 cursor-pointer"
      >
        <input
          type="radio"
          name="hiring_status"
          value={option.value}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
          onChange={(e) =>
            setInvalidFields((prev) =>
              prev.filter((field) => field !== e.target.name)
            )
          }
        />
        <span className="text-sm text-gray-700">
          {option.label}
        </span>
      </label>
    ))}
  </div>

 
</div>

  {/* Additional Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Additional Information
            </label>
            <textarea
              rows="4"
                name="Additional_Info"
              placeholder="Any useful details (CTC, hiring link, alumni reference...)"
              className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none ${invalidFields.includes("Additional_Info")
    ? "border-red-500 focus:ring-red-500"
    : "focus:ring-blue-500"}`}
      onChange={(e) =>
  setInvalidFields((prev) =>
    prev.filter((field) => field !== e.target.name)
  )
}
            ></textarea>
          </div>
          {invalidFields.length > 0 && (
  <div className="md:col-span-2 bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm">
    Please fill all details first
  </div>
)}

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Submit Suggestion
            </button>
          </div>

        </form>
      </div>
)}

    </div>
  );
};

export default Suggestions;
