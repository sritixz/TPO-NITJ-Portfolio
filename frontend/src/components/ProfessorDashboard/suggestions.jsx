import  { useEffect, useState } from "react";
const Suggestions= ()=>{
     const [suggestions, setSuggestions] = useState([]);
     const [activeTab, setActiveTab] = useState("not_contacted");

     const token = localStorage.getItem("token");
     const handleDelete= async (suggestion)=>{
        console.log("Delete suggestion:", suggestion);
        const res=await fetch("http://localhost:7000/psuggestions/deletesuggestion",{
            method: "DELETE",
              credentials: "include",
            headers: {
              "Content-Type": "application/json",
              //  Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({id:suggestion._id}),
        });
        if (!res.ok) {
          throw new Error("Failed to delete suggestion");
        }
         setSuggestions(prev => prev.filter(s => s._id !== suggestion._id));
     }
     const handleUpdate= async (suggestion)=>{
       
        console.log("Update suggestion:", suggestion);
        const res=await fetch("http://localhost:7000/psuggestions/updatesuggestion",{
            method: "PATCH",
              credentials: "include",
            headers: {
              "Content-Type": "application/json",
              //  Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({id:suggestion._id}),
        });
        if (!res.ok) {
          throw new Error("Failed to update suggestion");
        }
         setSuggestions(prev =>
      prev.map(s =>
        s._id === suggestion._id ? { ...s, status: true } : s
      )
    );
     }
 useEffect(() => {
    if (!token) return;
    const fetchSuggestions = async () => {
      try {
        const res = await fetch("http://localhost:7000/psuggestions/fetchsuggestions",{
            method: "GET",
              credentials: "include",
            headers: {
              "Content-Type": "application/json",
              //  Authorization: `Bearer ${token}`
            },  

        });
        const data = await res.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };

    fetchSuggestions();
  }, [token]);
  const filteredSuggestions = suggestions.filter((s) =>
  activeTab === "contacted" ? s.status === true : s.status === false
);

    return(
      <div className="space-y-6">
        
  <div className="flex gap-4 mb-6">
  <button
    onClick={() => setActiveTab("not_contacted")}
    className={`px-5 py-2 rounded-lg text-sm font-medium border transition
      ${
        activeTab === "not_contacted"
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
      }
    `}
  >
    Not Contacted
  </button>

  <button
    onClick={() => setActiveTab("contacted")}
    className={`px-5 py-2 rounded-lg text-sm font-medium border transition
      ${
        activeTab === "contacted"
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
      }
    `}
  >
    Contacted
  </button>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{filteredSuggestions.length === 0 && (
  <p className="text-gray-500 text-sm col-span-full">
    No suggestions in this category.
  </p>
)}

  {filteredSuggestions.map((suggestion) => (
   
   <div  key={suggestion._id} className="bg-white border rounded-xl shadow-sm p-6 flex flex-col justify-between">
      
      {/* Company Name */}
      <h4 className="text-xl font-semibold text-gray-800 mb-2">
        {suggestion.company_name}
      </h4>

      {/* Details */}
      <div className="text-sm text-gray-600 space-y-1">
        <p>
          <span className="font-medium text-gray-700">Company LinkedIn:</span>{" "}
          <a
            href={suggestion.company_linkedin}
           
            className="text-blue-600 underline"
          >
            View Profile
          </a>
        </p>

        <p>
          <span className="font-medium text-gray-700">HR Name:</span>{" "}
          {suggestion.Hr_name}
        </p>

        <p>
          <span className="font-medium text-gray-700">HR Contact:</span>{" "}
          {suggestion.Hr_contact}
        </p>

        <p>
          <span className="font-medium text-gray-700">HR Email:</span>{" "}
          {suggestion.HR_email}
        </p>

        {suggestion.Additional_Info && (
          <p>
            <span className="font-medium text-gray-700">
              Additional Info:
            </span>{" "}
            {suggestion.Additional_Info}
          </p>
        )}
      </div>

   
      
        
      
<div className="mt-6 flex items-center justify-between">
  
  {/* Status Badge */}
  <span
    className={`px-3 py-1 text-xs font-semibold rounded-full ${
      suggestion.status
        ? "bg-green-100 text-green-700"
        : "bg-gray-100 text-gray-600"
    }`}
  >
    {suggestion.status ? "Contacted" : "Not Contacted"}
  </span>

 
  <div className="flex gap-2">
    
    {/* Update / Mark Contacted */}
     {suggestion.status ? "" : <button
      className={`px-4 py-1.5 text-sm rounded-lg font-medium border 
        // suggestion.status
        //   ? "border-blue-600 text-blue-600 hover:bg-blue-50" :
           border-green-600 text-green-600 hover:bg-green-50
      }`}
      onClick={() => handleUpdate(suggestion)}
    >
      {suggestion.status ? "" : "Mark Contacted"}
    </button>}

    {/* Delete */}
    <button
      className="px-3 py-1.5 text-sm rounded-lg text-red-600 border border-red-500 hover:bg-red-50"
      onClick={() => handleDelete(suggestion)}
    >
      Delete
    </button>

  </div>
</div>

       
    </div>
    ))}
</div>
 
</div>
    )

}

export default Suggestions;