// import { useEffect, useState } from "react";
// const Suggestions = () => {
//   const [suggestions, setSuggestions] = useState([]);
//   const [activeTab, setActiveTab] = useState("not_contacted");
// const [showModal, setShowModal] = useState(false);
// const [selectedSuggestion, setSelectedSuggestion] = useState(null);
// // const [invalidFields, setInvalidFields] = useState([]);

// const [response, setResponse] = useState("");
// const [otherResponse, setOtherResponse] = useState("");
// const [additionalInfo, setAdditionalInfo] = useState("");
// const [showToStudent, setShowToStudent] = useState(false);

//   // const token = localStorage.getItem("token");
//   const handleDelete = async (suggestion) => {
//     console.log("Delete suggestion:", suggestion);
//     const res = await fetch(
//       `${import.meta.env.REACT_APP_BASE_URL}/psuggestions/deletesuggestion`,
//       {
//         method: "PATCH",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//           //  Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify({ id: suggestion._id }),
//       }
//     );
//     if (!res.ok) {
//       throw new Error("Failed to delete suggestion");
//     }
//   setSuggestions((prev) =>
//     prev.map((s) =>
//       s._id === suggestion._id
//         ? { ...s, status: "Rejected" }
//         : s
//     )
//   );
//   };
//   const handleUpdate = async (suggestion) => {
//     console.log("Update suggestion:", suggestion);
//      const emptyFields = [];
   
//   const finalResponse =
//     response === "Other" ? otherResponse : response;

//   // if (!response || response.trim() === "") {
//   //   emptyFields.push("response");
//   // }

//   // if (!additionalInfo || additionalInfo.trim() === "") {
//   //   emptyFields.push("additionalInfo");
//   // }

//   // if (emptyFields.length > 0) {
//   //   setInvalidFields(emptyFields);
//   //   return;
//   // }

//   // setInvalidFields([]);

//     const res = await fetch(
//       `${import.meta.env.REACT_APP_BASE_URL}/psuggestions/updatesuggestion`,
//       {
//         method: "PATCH",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
        
//         },
//         body: JSON.stringify({ id: selectedSuggestion._id ,option:response,Other_info:additionalInfo,show_info:showToStudent}),
//       }
//     );
//     if (!res.ok) {
//       throw new Error("Failed to update suggestion");
//     }
//     setSuggestions((prev) =>
//       prev.map((s) => (s._id === selectedSuggestion._id ? { ...s, status: "Contacted" } : s))
//     );
//     setShowModal(false);
//   setResponse("");
//   setAdditionalInfo("");
//   setSelectedSuggestion(null);
//     setInvalidFields([]);
//   };
//   useEffect(() => {
//     // if (!token) return;
//     const fetchSuggestions = async () => {
//       try {
//         const res = await fetch(
//           `${import.meta.env.REACT_APP_BASE_URL}/psuggestions/fetchsuggestions`,
//           {
//             method: "GET",
//             credentials: "include",
//             headers: {
//               "Content-Type": "application/json",
//               //  Authorization: `Bearer ${token}`
//             },
//           }
//         );
//         const data = await res.json();
//         console.log("Data",data)
//         setSuggestions(data);
//       } catch (error) {
//         console.error("Error fetching suggestions:", error);
//       }
//     };

//     fetchSuggestions();
//   }, []);
//   const filteredSuggestions = suggestions.filter((s) => {
//   if (activeTab === "contacted") return s.status === "Contacted";
//   if (activeTab === "rejected") return s.status === "Rejected";
//   return s.status === "Not Contacted";
// });


//   return (
//     <div className="space-y-6">
//       <div className="mb-6">
//         <div className="grid grid-cols-3 bg-gray-100 rounded-xl p-1 w-full max-w-8xl">
//           <button
//             onClick={() => setActiveTab("not_contacted")}
//             className={`py-3 rounded-lg text-sm font-medium transition-all ${
//               activeTab === "not_contacted"
//                 ? "bg-white text-gray-900 shadow-sm"
//                 : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             Not Contacted
//           </button>

//           <button
//             onClick={() => setActiveTab("contacted")}
//             className={`py-3 rounded-lg text-sm font-medium transition-all ${
//               activeTab === "contacted"
//                 ? "bg-white text-gray-900 shadow-sm"
//                 : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             Contacted
//           </button>
//           <button
//   onClick={() => setActiveTab("rejected")}
//   className={`py-3 rounded-lg text-sm font-medium transition-all ${
//     activeTab === "rejected"
//       ? "bg-white text-gray-900 shadow-sm"
//       : "text-gray-500 hover:text-gray-700"
//   }`}
// >
//   Rejected
// </button>
//         </div>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredSuggestions.length === 0 && (
//           <p className="text-gray-500 text-sm col-span-full">
//             No suggestions in this category.
//           </p>
//         )}

//         {filteredSuggestions.map((suggestion) => (
//           <div
//             key={suggestion._id}
//             className="bg-white border rounded-xl shadow-sm p-6 flex flex-col justify-between"
//           >
//             {/* Company Name */}
//             <h4 className="text-xl font-semibold text-gray-800 mb-2">
//               {suggestion.company_name}
//             </h4>

// {/* Date */}
//             <p className="text-xs text-gray-400 mb-2">
//   Added on:{" "}
//   {new Date(suggestion.createdAt).toLocaleDateString("en-IN", {
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//   })}
// </p>

//             {/* Details */}
//             <div className="text-sm text-gray-600 space-y-1">
//               <p>
//                 <span className="font-medium text-gray-700">
//                   Company LinkedIn:
//                 </span>{" "}
//                 <a
//                   href={suggestion.company_linkedin}
//                   className="text-blue-600 underline"
//                 >
//                   View Profile
//                 </a>
//               </p>

//               <p>
//                 <span className="font-medium text-gray-700">HR Name:</span>{" "}
//                 {suggestion.Hr_name}
//               </p>

//               <p>
//                 <span className="font-medium text-gray-700">HR Contact:</span>{" "}
//                 {suggestion.Hr_contact}
//               </p>

//               <p>
//                 <span className="font-medium text-gray-700">HR Email:</span>{" "}
//                 {suggestion.HR_email}
//               </p>

//               {suggestion.Additional_Info && (
//                 <p>
//                   <span className="font-medium text-gray-700">
//                     Additional Info:
//                   </span>{" "}
//                   {suggestion.Additional_Info}
//                 </p>            
//               )}
//               {suggestion.company_type && (
//     <p>
//       <span className="font-medium text-gray-700">Company Type:</span>{" "}
//       {suggestion.company_type}
//     </p>
//   )}

//   {suggestion.sector && (
//     <p>
//       <span className="font-medium text-gray-700">Sector:</span>{" "}
//       {suggestion.sector}
//     </p>
//   )}
//     {suggestion.hiring_status && (
//     <p>
//       <span className="font-medium text-gray-700">Hiring Status:</span>{" "}
//       {suggestion.hiring_status === "Active"
//         ? "Actively Hiring"
//         : "Not Actively Hiring"}
//     </p>
//   )}
//   {/* Student Info */}
// {suggestion.student_id && (
//   <p>
//     <span className="font-medium text-gray-700">Student Details:</span>{" "}
//     {suggestion.student_id.name} ({suggestion.student_id.rollno})
//   </p>
// )}
//             </div>


//             <div className="mt-6 flex items-center justify-between">
//               {/* Status Badge */}
//           <span
//   className={`px-3 py-1 text-xs font-semibold rounded-full ${
//     suggestion.status === "Contacted"
//       ? "bg-green-100 text-green-700"
//       : suggestion.status === "Rejected"
//       ? "bg-red-100 text-red-700"
//       : "bg-yellow-100 text-yellow-700"
//   }`}
// >
//   {suggestion.status}
// </span>


//               <div className="flex gap-2">
//                 {/* Update / Mark Contacted */}
//              {suggestion.status === "Not Contacted" && (
//   <button className=" px-3 py-1 text-xs font-semibold rounded-lg bg-green-700 text-white hover:bg-green-100 hover:text-green-700"onClick={() => {
//     setSelectedSuggestion(suggestion);
//     setShowModal(true);
//   }}>
//     Mark Contacted
//   </button>
// )}


//                 {/* Reject */}
//             {suggestion.status === "Not Contacted" && (
//   <button
//     className="px-3 py-1.5 text-sm rounded-lg text-red-600 border border-red-500 hover:bg-red-50"
//     onClick={() => handleDelete(suggestion)}
//   >
//     Reject
//   </button>
// )}

//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     {showModal && (
//   <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//     <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
//       <h3 className="text-lg font-semibold mb-4">
//         Company Response
//       </h3>

//       {/* Radio Options */}
//       <div className="space-y-2 mb-4">
//         {[
//           "Interested",
//           "Not Interested",
//           "Does Not Meet Policy",
//           "Not Able to Contact",
//           "No Vacancy",
//           "Position Closed",
//           "No Response",
//           "Other"
//         ].map((option) => (
//           <label key={option} className="flex items-center gap-2">
//             <input
//               type="radio"
//               name="response"
//               value={option}
//               checked={response === option}
//               onChange={(e) => setResponse(e.target.value)}
//             />
//             <span className="text-sm text-gray-700">{option}</span>
//           </label>
//         ))}
//       </div>

//       {/* Other Input */}
//       {response === "Other" && (
//         <input
//           type="text"
//           placeholder="Enter custom response"
//           className="w-full border rounded-lg p-2 text-sm mb-4"
//           value={otherResponse}
//           onChange={(e) => setOtherResponse(e.target.value)}
//         />
//       )}

//       {/* Additional Info */}
//       <textarea
//         placeholder="Additional Info (optional)"
//         className="w-full border rounded-lg p-2 text-sm mb-4"
//         rows={3}
//         value={additionalInfo}
//         onChange={(e) => setAdditionalInfo(e.target.value)}
//       />

//       {/* Toggle */}
//       <div className="flex items-center justify-between mb-4">
//         <span className="text-sm font-medium text-gray-700">
//           Show response to student
//         </span>

//         <button
//           type="button"
//           onClick={() => setShowToStudent((prev) => !prev)}
//           className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
//             showToStudent ? "bg-green-500" : "bg-gray-300"
//           }`}
//         >
//           <div
//             className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
//               showToStudent ? "translate-x-6" : "translate-x-0"
//             }`}
//           />
//         </button>
//       </div>

//       {/* Actions */}
//       <div className="flex justify-end gap-3">
//         <button
//           onClick={() => setShowModal(false)}
//           className="px-4 py-2 text-sm rounded-lg border"
//         >
//           Cancel
//         </button>

//         <button
//           onClick={handleUpdate}
//           className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
//         >
//           Submit
//         </button>
//       </div>
//     </div>
//   </div>
// )}

//     </div>
//   );
// };

// export default Suggestions;

import { useEffect, useState } from "react";
import { Download, RotateCcw, MessageSquare } from "lucide-react";
import * as XLSX from "xlsx";

const Suggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState("not_contacted");
  const [showModal, setShowModal] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  const [response, setResponse] = useState("");
  const [otherResponse, setOtherResponse] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [showToStudent, setShowToStudent] = useState(false);

  // Requirement: Excel Export with 3 Sheets (Contacted, Rejected, Non-Contacted)
  const exportToExcel = () => {
    const formatData = (list) => list.map((s) => ({
      "Company Name": s.company_name,
"Suggested By": s.professor_id?.name 
    ? `Prof. ${s.professor_id.name}` 
    : (s.faculty_id?.name || "N/A"),
          "HR Name": s.Hr_name,
      "HR Email": s.HR_email,
      "Current Status": s.status,
      "Student": s.student_id ? `${s.student_id.name} (${s.student_id.rollno})` : "N/A",
      "Professor Decision": s.option || "N/A",
      "Professor Comment": s.Other_info || "N/A",
    }));

    const contactedData = suggestions.filter(s => s.status === "Contacted");
    const rejectedData = suggestions.filter(s => s.status === "Rejected");
    const pendingData = suggestions.filter(s => s.status === "Not Contacted");

    const workbook = XLSX.utils.book_new();

    const contactedSheet = XLSX.utils.json_to_sheet(formatData(contactedData));
    const rejectedSheet = XLSX.utils.json_to_sheet(formatData(rejectedData));
    const pendingSheet = XLSX.utils.json_to_sheet(formatData(pendingData));

    XLSX.utils.book_append_sheet(workbook, contactedSheet, "Contacted");
    XLSX.utils.book_append_sheet(workbook, rejectedSheet, "Rejected");
    XLSX.utils.book_append_sheet(workbook, pendingSheet, "Non-Contacted");

    XLSX.writeFile(workbook, "TPO_Suggestions_Report.xlsx");
  };

  // Revert Logic
  const handleRevertToPending = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/psuggestions/updatesuggestion`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id, 
          status: "Not Contacted", 
          option: "", 
          Other_info: "",
          show_response: false
        }),
      });
      if (!res.ok) throw new Error("Failed to revert status");
      
      setSuggestions((prev) =>
        prev.map((s) => (s._id === id ? { ...s, status: "Not Contacted", option: "", Other_info: "" } : s))
      );
    } catch (err) {
      console.error("Revert Error:", err);
    }
  };

  // Update Logic (Step 5)
  const handleUpdate = async () => {
    if (!selectedSuggestion || !selectedSuggestion._id) return;

    const finalResponse = response === "Other" ? otherResponse : response;
    const visibilityString = showToStudent ? "true" : "false";

    try {
      const res = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/psuggestions/updatesuggestion`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: selectedSuggestion._id,
          option: finalResponse,
          Other_info: additionalInfo,
          show_info: visibilityString
        }),
      });

      if (res.ok) {
        setSuggestions((prev) =>
          prev.map((s) =>
            s._id === selectedSuggestion._id
              ? { ...s, status: "Contacted", response: finalResponse, Other_info: additionalInfo }
              : s
          )
        );
        setShowModal(false);
        setResponse("");
        setOtherResponse("");
        setAdditionalInfo("");
        setSelectedSuggestion(null);
      }
    } catch (error) {
      console.error("Update Error:", error);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/psuggestions/fetchsuggestions`, {
          method: "GET",
          credentials: "include"
        });
        const data = await res.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };
    fetchSuggestions();
  }, []);

  const filteredSuggestions = suggestions.filter((s) => {
    if (activeTab === "contacted") return s.status === "Contacted";
    if (activeTab === "rejected") return s.status === "Rejected";
    return s.status === "Not Contacted";
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        {/* Requirement: Uses 'text-custom-blue' from Navbar/Dashboard */}
        <h2 className="text-xl font-bold text-custom-blue">Company Suggestions</h2>
        
        {/* Requirement: Uses 'bg-custom-blue' from Dashboard Sidebar */}
        <button 
          onClick={exportToExcel} 
          className="flex items-center gap-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium shadow-sm"
        >
          <Download size={16} /> Export to Excel
        </button>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-3 bg-gray-100 rounded-xl p-1 w-full max-w-8xl">
          {["not_contacted", "contacted", "rejected"].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`py-3 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuggestions.map((suggestion) => (
          <div key={suggestion._id} className="bg-white border rounded-xl shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <h4 className="text-xl font-semibold text-gray-800 mb-2">{suggestion.company_name}</h4>
                <p className="text-[10px] text-gray-400">
                  {suggestion.createdAt ? new Date(suggestion.createdAt).toLocaleDateString("en-IN") : "N/A"}
                </p>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                {/* LinkedIn link using the custom blue */}
                <p><span className="font-medium text-gray-700">LinkedIn:</span> <a href={suggestion.company_linkedin} target="_blank" rel="noreferrer" className="text-custom-blue underline">View Profile</a></p>
                <p><span className="font-medium text-gray-700">HR:</span> {suggestion.Hr_name} | {suggestion.Hr_contact}</p>
                <p><span className="font-medium text-gray-700">Email:</span> {suggestion.HR_email}</p>
             <div className="pt-2 border-t mt-2">
  {/* Priority 1: Professor */}
  {suggestion.professor_id?.name && (
    <p className="text-xs font-bold text-custom-blue">
      Suggested By: Prof. {suggestion.professor_id.name}
    </p>
  )}

    {/* Show Student if it exists (e.g., 28... style) */}
    {suggestion.student_id?.name && (
      <p className="text-[10px] text-gray-500 italic">
        Submitted By: {suggestion.student_id.name} ({suggestion.student_id.rollno})
      </p>
    )}
  </div>
</div>
              {(suggestion.status === "Contacted" || suggestion.status === "Rejected") && (
                /* Requirement: Remarks section using light blue-50 background and custom-blue icons */
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare size={14} className="text-custom-blue" />
                    <span className="text-[10px] font-bold text-custom-blue uppercase">Professor Remarks</span>
                  </div>
                  <p className="text-sm text-gray-700 italic">"{suggestion.Other_info || "No comments."}"</p>
                  {suggestion.option && (
                    <span className="mt-2 inline-block text-[10px] bg-white text-custom-blue border border-blue-100 px-2 py-0.5 rounded font-semibold">
                      Decision: {suggestion.option}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${suggestion.status === "Contacted" ? "bg-green-100 text-green-700" : suggestion.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{suggestion.status}</span>
              <div className="flex gap-2">
                {suggestion.status === "Not Contacted" ? (
                  <>
                    <button className="px-3 py-1 text-xs font-semibold rounded-lg bg-green-700 text-white hover:bg-green-800" onClick={() => { setSelectedSuggestion(suggestion); setShowModal(true); }}>Mark Contacted</button>
                    <button className="px-3 py-1 text-xs font-semibold rounded-lg border border-red-500 text-red-600 hover:bg-red-50" onClick={() => handleDelete(suggestion)}>Reject</button>
                  </>
                ) : (
                  <button onClick={() => handleRevertToPending(suggestion._id)} className="p-2 text-gray-400 hover:text-custom-blue rounded-lg transition-colors"><RotateCcw size={18} /></button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-custom-blue">Company Response</h3>
            <div className="space-y-2 mb-4">
              {["Interested", "Not Interested", "Does Not Meet Policy", "Not Able to Contact", "No Vacancy", "Position Closed", "No Response", "Other"].map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="response" value={opt} checked={response === opt} onChange={(e) => setResponse(e.target.value)} className="accent-custom-blue" />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
            {response === "Other" && (
              <input type="text" placeholder="Specify response" className="w-full border rounded-lg p-2 text-sm mb-4 outline-none focus:ring-1 focus:ring-custom-blue" value={otherResponse} onChange={(e) => setOtherResponse(e.target.value)} />
            )}
            <textarea placeholder="Professor Remarks (Optional)" className="w-full border rounded-lg p-2 text-sm mb-4 outline-none focus:ring-1 focus:ring-custom-blue" rows={3} value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} />
            
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-gray-700">Show result to student</span>
              <button onClick={() => setShowToStudent(!showToStudent)} className={`w-12 h-6 flex items-center rounded-full p-1 transition ${showToStudent ? "bg-green-500" : "bg-gray-300"}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${showToStudent ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">Cancel</button>
              <button onClick={handleUpdate} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suggestions;