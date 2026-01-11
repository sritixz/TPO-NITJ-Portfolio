import { useState,useEffect } from "react";
import toast from "react-hot-toast";

const Suggestions = () => {
const [recentSuggestions, setRecentSuggestions] = useState([]);
const [invalidFields, setInvalidFields] = useState([]);
const [activeTab, setActiveTab] = useState("not_contacted");
const [view, setView] = useState("create"); 


 const token = localStorage.getItem("token");
 useEffect(()=>{
    if (!token) return;
    const fetchRecentSuggestions = async () => {
      try {
        const res = await fetch("http://localhost:7000/suggestions/recentsuggestions",{
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
  }, [token]);
const filteredSuggestions = recentSuggestions.filter((item) => {
  if (activeTab === "contacted") return item.status === true;
  return item.status === false;
});

 const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

   
    const data = Object.fromEntries(formData.entries());

    const emptyFields = Object.entries(data)
    .filter(([_, value]) => value.trim() === "")
    .map(([key]) => key);

  if (emptyFields.length > 0) {
    setInvalidFields(emptyFields);
    return;
  }

  setInvalidFields([]);
    try {
      const res = await fetch(
        "http://localhost:7000/suggestions/suggestions",
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
  <div className="grid grid-cols-2 bg-gray-100 rounded-xl p-1 w-full max-w-8xl">
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
  <div className="grid grid-cols-2 bg-gray-100 rounded-xl p-1 w-full max-w-8xl">
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
        className="flex items-center justify-between border rounded-lg p-4"
      >
        {/* Left content */}
        <div>
          <p className="font-medium text-gray-800">
            {item.company_name}
          </p>
          <p className="text-sm text-gray-500">
            Suggested on: {item.createdAt.slice(0, 10)}
          </p>
        </div>

        {/* Status badge */}
        <span
          className={`px-3 py-1 text-sm rounded-full ${
            item.status 
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {item.status
            ? "Contacted"
            : "Not Contacted"}
        </span>
      </div>
    ))}
  </div>
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
