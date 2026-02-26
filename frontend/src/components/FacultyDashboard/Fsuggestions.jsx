import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const Fsuggestions = () => {
  const [recentSuggestions, setRecentSuggestions] = useState([]);
  const [invalidFields, setInvalidFields] = useState([]);
  const [activeTab, setActiveTab] = useState("not_contacted");
  const [view, setView] = useState("create");
  const [expandedId, setExpandedId] = useState(null);
  const [companyType, setCompanyType] = useState("");

  const BASE_URL = import.meta.env.REACT_APP_BASE_URL;

  // Fetch only this Faculty member's history
  useEffect(() => {
    const fetchRecentSuggestions = async () => {
      try {
        const res = await fetch(`${BASE_URL}/faculty/my-suggestions`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        setRecentSuggestions(data);
      } catch (error) {
        console.error("Error fetching recent suggestions:", error);
      }
    };
    if (view === "recent") fetchRecentSuggestions();
  }, [view, BASE_URL]);

  const filteredSuggestions = recentSuggestions.filter((item) => {
    if (activeTab === "contacted") return item.status === "Contacted";
    if (activeTab === "rejected") return item.status === "Rejected";
    return item.status === "Not Contacted";
  });

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
      (field) => !data[field] || data[field].toString().trim() === ""
    );

    if (emptyFields.length > 0) {
      setInvalidFields(emptyFields);
      return;
    }

    setInvalidFields([]);
    try {
      const res = await fetch(`${BASE_URL}/faculty/suggestion`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to submit suggestion");

      const result = await res.json();
      setRecentSuggestions((prev) => [result.suggestion, ...prev]);
      toast.success("Suggestion submitted successfully!");
      e.target.reset();
      setView("recent"); // Automatically switch to history after success
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* View Switcher */}
      <div className="mb-6 ">
        <div className="grid grid-cols-2 bg-gray-100 rounded-xl p-1 w-full max-w-4xl mx-auto shadow-sm">
          <button
            onClick={() => setView("create")}
            className={`py-3 rounded-lg text-sm font-medium transition-all ${
              view === "create" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Create New Suggestion
          </button>
          <button
            onClick={() => setView("recent")}
            className={`py-3 rounded-lg text-sm font-medium transition-all ${
              view === "recent" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My Suggestions History
          </button>
        </div>
      </div>

      {/* History Section */}
      {view === "recent" && (
        <div className="bg-white rounded-xl shadow-md p-6 max-w-7xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Corporate Outreach History</h2>
          <div className="mb-6">
            <div className="grid grid-cols-3 bg-gray-100 rounded-xl p-1 w-full max-w-2xl mx-auto">
              {["not_contacted", "contacted", "rejected"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                    activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                  }`}
                >
                  {tab.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {filteredSuggestions.length === 0 ? (
            <p className="text-gray-500 text-center py-10 italic">No suggestions found in this category.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSuggestions.map((item) => (
                <div key={item._id} className="border border-gray-100 rounded-lg p-4 space-y-3 bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800 uppercase text-sm tracking-tight">{item.company_name}</p>
                      <p className="text-[10px] text-gray-400">Date: {new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                      item.status === "Contacted" ? "bg-green-50 text-green-600" : 
                      item.status === "Rejected" ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-600"
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {item.status === "Contacted" && item.show_response === "true" && (
                    <button onClick={() => setExpandedId(expandedId === item._id ? null : item._id)} className="text-xs text-blue-600 font-semibold hover:underline">
                      {expandedId === item._id ? "Hide TPO Response" : "View TPO Response"}
                    </button>
                  )}

                  {expandedId === item._id && (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-xs space-y-2 animate-in fade-in slide-in-from-top-1">
                      <p><span className="font-bold text-blue-800">TPO Feedback:</span> <span className="text-gray-700">{item.response || "In Review"}</span></p>
                      <p><span className="font-bold text-blue-800">Internal Notes:</span> <span className="text-gray-700">{item.Other_info || "—"}</span></p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Creation Form Section */}
      {view === "create" && (
        <div className="bg-white rounded-xl shadow-md p-8 max-w-4xl mx-auto">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800">Formal Company Suggestion</h2>
            <p className="text-sm text-gray-500">Provide details for potential placement/internship collaboration.</p>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            {/* Form inputs mirror the student suggestion structure */}
            {[
              { label: "Company Name", name: "company_name", type: "text", ph: "e.g. Google" },
              { label: "LinkedIn Profile", name: "company_linkedin", type: "url", ph: "Link to company page" },
              { label: "HR Full Name", name: "Hr_name", type: "text", ph: "Contact Person" },
              { label: "Contact Number", name: "Hr_contact", type: "tel", ph: "+91 XXXXX XXXXX" },
              { label: "Official HR Email", name: "HR_email", type: "email", ph: "hr@company.com" }
            ].map((input) => (
              <div key={input.name}>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{input.label}</label>
                <input
                  type={input.type}
                  name={input.name}
                  placeholder={input.ph}
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm transition-all outline-none ${
                    invalidFields.includes(input.name) ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-custom-blue"
                  }`}
                  onChange={(e) => setInvalidFields(prev => prev.filter(f => f !== e.target.name))}
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Company Type</label>
              <select
                name="company_type"
                className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none ${invalidFields.includes("company_type") ? "border-red-400" : "border-gray-200"}`}
                onChange={(e) => {
                  setCompanyType(e.target.value);
                  setInvalidFields(prev => prev.filter(f => f !== e.target.name));
                }}
              >
                <option value="">Select Category</option>
                <option value="Core">Core Engineering</option>
                <option value="Tech">IT/Software</option>
                <option value="Non-tech">Management/Consulting</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {companyType === "Other" && (
              <div className="animate-in slide-in-from-left-2">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Specify Type</label>
                <input
                  type="text"
                  name="company_type_other"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Sector</label>
              <div className={`flex gap-6 p-2 rounded-lg ${invalidFields.includes("sector") ? "bg-red-50 border border-red-200" : ""}`}>
                {["PSU", "Private"].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-600">
                    <input
                      type="radio"
                      name="sector"
                      value={option}
                      className="accent-custom-blue"
                      onChange={(e) => setInvalidFields(prev => prev.filter(f => f !== e.target.name))}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Current Hiring Status</label>
              <div className={`flex gap-6 p-2 rounded-lg ${invalidFields.includes("hiring_status") ? "bg-red-50 border border-red-200" : ""}`}>
                {[
                  { label: "Active", value: "Active" },
                  { label: "Not Active", value: "Inactive" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-600">
                    <input
                      type="radio"
                      name="hiring_status"
                      value={option.value}
                      className="accent-custom-blue"
                      onChange={(e) => setInvalidFields(prev => prev.filter(f => f !== e.target.name))}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Additional Information / References</label>
              <textarea
                rows="4"
                name="Additional_Info"
                placeholder="Details about stipend, job role, or existing alumni connections in the firm..."
                className={`w-full border rounded-lg px-4 py-3 text-sm outline-none transition-all ${
                  invalidFields.includes("Additional_Info") ? "border-red-400" : "border-gray-200 focus:border-custom-blue"
                }`}
                onChange={(e) => setInvalidFields(prev => prev.filter(f => f !== e.target.name))}
              ></textarea>
            </div>

            {invalidFields.length > 0 && (
              <div className="md:col-span-2 text-center text-red-500 text-xs font-bold py-2 bg-red-50 rounded-lg">
                ⚠️ All fields are mandatory for TPO processing.
              </div>
            )}

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-custom-blue text-white px-10 py-3 rounded-xl font-bold hover:brightness-110 transition shadow-lg shadow-blue-100"
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

export default Fsuggestions;