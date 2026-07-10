// import React, { useState } from "react";
// import axios from "axios";

// const OfferAdder = ({ onDone }) => {
//   const [company, setCompany] = useState("");
//   const [batch, setBatch] = useState("2026");
//   const [course, setCourse] = useState("B.Tech");
//   const [resultDate, setResultDate] = useState("");
//   const [offerMode, setOfferMode] = useState("PPO");
//   const [offerSector, setOfferSector] = useState("Private");
//   const [offerCategory, setOfferCategory] = useState("A");
//   const [rollText, setRollText] = useState("");
//   const [sList, setSList] = useState([]);
//   const [g, setG] = useState({ job_type: "FTE", job_role: "", ctc: "", stipend: "", intern_duration: "" });
//   const [applyAll, setApplyAll] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [msg, setMsg] = useState(null);

//   function parseRolls(txt) {
//     return Array.from(new Set(
//       txt
//         .split(/[,\n\s]+/)
//         .map(s => s.trim())
//         .filter(Boolean)
//     ));
//   }

//   async function fetchOne(roll) {
//     try {
//       const res = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/offer-add/get/${encodeURIComponent(roll)}`, { withCredentials: true });
//       return { roll, found: true, student: res.data };
//     } catch (error) {
//       return { roll, found: false };
//     }
//   }

//   async function handleFetch() {
//     const rolls = parseRolls(rollText);
//     if (!rolls.length) return setMsg("Paste at least one roll number.");
//     setLoading(true);
//     setMsg(null);
//     const arr = rolls.map(r => ({ roll: r, loading: true, found: false, student: null, override: { job_type: "", job_role: "", ctc: "", stipend: "", intern_duration: "" } }));
//     setSList(arr);
//     const res = await Promise.all(rolls.map(r => fetchOne(r)));
//     const merged = res.map(r => ({
//       roll: r.roll,
//       loading: false,
//       found: !!r.found,
//       student: r.student || null,
//       override: { job_type: "", job_role: "", ctc: "", stipend: "", intern_duration: "" }
//     }));
//     setSList(merged);
//     setRollText(""); // Clear the textarea after fetching
//     setLoading(false);
//   }

//   function setStudentField(i, k, v) {
//     setSList(s => {
//       const t = [...s];
//       t[i] = { ...t[i], override: { ...t[i].override, [k]: v } };
//       return t;
//     });
//   }

//   function applyGlobalToAll() {
//     setSList(s => s.map(x => ({ ...x, override: { ...g } })));
//   }

//   function removeRow(i) {
//     setSList(s => s.filter((_, idx) => idx !== i));
//   }

//   async function handleSubmit() {
//     if (!company) return setMsg("Company name required");
//     if (!batch) return setMsg("Batch required");
//     if (!course) return setMsg("Course required");
//     if(!offerMode) return setMsg("Offer mode required");
//     if (!sList.length) return setMsg("No students added");
//     const payload = {
//       company_name: company,
//       batch,
//       course,
//       result_date: resultDate,
//       offer_mode: offerMode,
//       offer_category: offerCategory,
//       offer_sector: offerSector,
//       shortlisted_students: sList.map(x => ({
//         studentId: x.student?._id || null,
//         name: x.student?.name || "",
//         gender: x.student?.gender || "",
//         department: x.student?.department || "",
//         category: x.student?.category || "",
//         job_type: x.override.job_type || g.job_type,
//         job_role: x.override.job_role || g.job_role,
//         ctc: x.override.ctc || g.ctc,
//         stipend: x.override.stipend || g.stipend,
//         intern_duration: g.job_type === 'FTE' ? undefined : (x.override.intern_duration || g.intern_duration)
//       }))
//     };
//     setLoading(true);
//     try {
//       const res =  await axios.post(`${import.meta.env.REACT_APP_BASE_URL}/offer-add/add`,payload, { withCredentials: true });
//       setMsg('Saved successfully');
//       setCompany(''); setBatch('2026'); setCourse('B.Tech'); setRollText(''); setSList([]); setG({ job_type: "Intern", job_role: "", ctc: "", stipend: "", intern_duration: "" });
//       if (onDone) onDone(res.data);
//     } catch (error) {
//       setMsg('Save failed');
//     }
//     setLoading(false);
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-6xl mx-auto px-4">

//         {/* Offer Details */}
//         <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Offer Details</h2>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
//               <input
//                 placeholder="Enter company name"
//                 value={company}
//                 onChange={e => setCompany(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
//               <select
//                 value={batch}
//                 onChange={e => setBatch(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="2026">2026</option>
//                 <option value="2027">2027</option>
//                 <option value="2028">2028</option>
//                 <option value="2029">2029</option>
//                 <option value="2030">2030</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
//               <select
//                 value={course}
//                 onChange={e => setCourse(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="B.Tech">B.Tech</option>
//                 <option value="M.Tech">M.Tech</option>
//                 <option value="M.Sc.">M.Sc.</option>
//                 <option value="MBA">MBA</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Offer Mode</label>
//               <select
//                 value={offerMode}
//                 onChange={e => setOfferMode(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="PPO">PPO</option>
//                 <option value="On-Campus">On-Campus</option>
//                 <option value="Off-Campus">Off-Campus</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Offer Sector</label>
//               <select
//                 value={offerSector}
//                 onChange={e => setOfferSector(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="Private">Private</option>
//                 <option value="PSU">PSU</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Offer Category</label>
//               <select
//                 value={offerCategory}
//                 onChange={e => setOfferCategory(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="A">A</option>
//                 <option value="B">B</option>
//                 <option value="C">C</option>
//                 <option value="D">D</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Result Date</label>
//               <input
//                 type="date"
//                 value={resultDate}
//                 onChange={e => setResultDate(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//           </div>
//         </div>

//         {/* Global Defaults */}
//         <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center space-x-3">
//               <input
//                 type="checkbox"
//                 checked={applyAll}
//                 onChange={e => setApplyAll(e.target.checked)}
//                 className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//               />
//               <h2 className="text-lg font-semibold text-gray-900">Global Defaults</h2>
//             </div>
//             <button
//               onClick={applyGlobalToAll}
//               className="px-4 py-2 bg-custom-blue hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
//             >
//               Apply to All Students
//             </button>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
//               <select
//                 value={g.job_type}
//                 onChange={e => setG(s => ({ ...s, job_type: e.target.value }))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="Intern">Intern</option>
//                 <option value="Intern+FTE">Intern+FTE</option>
//                 <option value="FTE">FTE</option>
//                 <option value="Intern+PPO">Intern+PPO</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
//               <input
//                 placeholder="e.g., Backend Developer"
//                 value={g.job_role}
//                 onChange={e => setG(s => ({ ...s, job_role: e.target.value }))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">CTC</label>
//               <input
//                 placeholder="e.g., 12 LPA"
//                 value={g.ctc}
//                 onChange={e => setG(s => ({ ...s, ctc: e.target.value }))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//             {g.job_type !== 'FTE' && (
//   <div>
//     <label className="block text-sm font-medium text-gray-700 mb-1">Stipend</label>
//     <input
//       placeholder="e.g., 50,000"
//       value={g.stipend}
//       onChange={e => setG(s => ({ ...s, stipend: e.target.value }))}
//       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//     />
//   </div>
// )}

//             {g.job_type === 'FTE' ? (
//               <div className="flex items-center justify-center bg-gray-50 rounded-md p-3">
//                 <span className="text-sm text-gray-500">No internship duration and stipend for FTE</span>
//               </div>
//             ) : (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Intern Duration</label>
//                 <input
//                   placeholder="e.g., 6 months"
//                   value={g.intern_duration}
//                   onChange={e => setG(s => ({ ...s, intern_duration: e.target.value }))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Roll Numbers Input */}
//         <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Students</h2>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Roll Numbers (comma, space, or newline separated)
//               </label>
//               <textarea
//                 value={rollText}
//                 onChange={e => setRollText(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
//                 placeholder="Enter roll numbers here..."
//               />
//             </div>
//             <div className="flex flex-wrap gap-3">
//               <button
//                 onClick={handleFetch}
//                 disabled={loading}
//                 className="inline-flex items-center px-4 py-2 bg-custom-blue hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
//               >
//                 {loading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                     Fetching...
//                   </>
//                 ) : (
//                   'Fetch Students'
//                 )}
//               </button>

//               <button
//                 onClick={() => { setRollText(''); setSList([]); }}
//                 className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md border border-gray-300 transition-colors"
//               >
//                 Clear All
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Students List */}
//         {sList.length > 0 && (
//           <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">
//               Students ({sList.length})
//             </h2>

//             <div className="space-y-4">
//               {sList.map((s, i) => (
//                 <div key={i} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
//                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
//                     {/* Roll Number */}
//                     <div className="lg:col-span-2">
//                       <label className="block text-xs font-medium text-gray-600 mb-1">Roll Number</label>
//                       <input
//                         value={s.roll}
//                         onChange={e => setSList(arr => {
//                           const t=[...arr];
//                           t[i].roll=e.target.value;
//                           t[i].found=false;
//                           t[i].student=null;
//                           return t;
//                         })}
//                         className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
//                         placeholder="Roll no."
//                       />
//                     </div>

//                     {/* Student Info */}
//                     <div className="lg:col-span-2">
//                       <label className="block text-xs font-medium text-gray-600 mb-1">Student Info</label>
//                       <div className="text-sm">
//                         {s.loading ? (
//                           <div className="flex items-center text-blue-600">
//                             <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
//                             Loading...
//                           </div>
//                         ) : s.found ? (
//                           <div>
//                             <div className="font-medium text-gray-900">{s.student?.name || '-'}</div>
//                             <div className="text-gray-500 text-xs">{s.student?.department || '-'}</div>
//                           </div>
//                         ) : (
//                           <div className="text-red-600 text-xs">Student not found</div>
//                         )}
//                       </div>
//                     </div>

//                     {/* Job Details */}
//                     <div className="lg:col-span-6 grid grid-cols-2 lg:grid-cols-4 gap-2">
//                       <select
//                         value={s.override.job_type || (applyAll ? g.job_type : '')}
//                         onChange={e => setStudentField(i, 'job_type', e.target.value)}
//                         className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
//                       >
//                         <option value="">Select job type</option>
//                         <option value="Intern">Intern</option>
//                         <option value="Intern+FTE">Intern+FTE</option>
//                         <option value="FTE">FTE</option>
//                         <option value="Intern+PPO">Intern+PPO</option>
//                       </select>
//                       <input
//                         placeholder="Job role"
//                         value={s.override.job_role || (applyAll ? g.job_role : '')}
//                         onChange={e => setStudentField(i, 'job_role', e.target.value)}
//                         className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
//                       />
//                       <input
//                         placeholder="CTC"
//                         value={s.override.ctc || (applyAll ? g.ctc : '')}
//                         onChange={e => setStudentField(i, 'ctc', e.target.value)}
//                         className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
//                       />
//                       <input
//                         placeholder="Stipend"
//                         value={s.override.stipend || (applyAll ? g.stipend : '')}
//                         onChange={e => setStudentField(i, 'stipend', e.target.value)}
//                         className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
//                       />
//                     </div>

//                     {/* Intern Duration & Actions */}
//                     <div className="lg:col-span-2 flex gap-2">
//                       {((s.override.job_type || (applyAll ? g.job_type : '')) !== 'FTE') && (
//                         <input
//                           placeholder="Duration"
//                           value={s.override.intern_duration || (applyAll ? g.intern_duration : '')}
//                           onChange={e => setStudentField(i, 'intern_duration', e.target.value)}
//                           className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
//                         />
//                       )}
//                       <button
//                         onClick={async () => {
//                           setSList(a => { const t=[...a]; t[i].loading=true; return t; });
//                           const r = await fetchOne(s.roll);
//                           setSList(a => { const t=[...a]; t[i] = { ...t[i], loading:false, found: !!r.found, student: r.student || null }; return t; });
//                         }}
//                         className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border"
//                         title="Refetch student data"
//                       >
//                         ↻
//                       </button>
//                       <button
//                         onClick={() => removeRow(i)}
//                         className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded border border-red-200"
//                         title="Remove student"
//                       >
//                         ×
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Actions */}
//         <div className="bg-white rounded-lg shadow-sm border p-6">
//           <div className="flex flex-wrap gap-3 items-center justify-between">
//             <div className="flex gap-3">
//               <button
//                 onClick={handleSubmit}
//                 disabled={loading}
//                 className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-md transition-colors"
//               >
//                 {loading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                     Saving...
//                   </>
//                 ) : (
//                   'Save Offer'
//                 )}
//               </button>
//               <button
//                 onClick={() => { setSList([]); setRollText(''); }}
//                 className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-md border border-gray-300 transition-colors"
//               >
//                 Reset Students
//               </button>
//             </div>

//             {msg && (
//               <div className={`px-4 py-2 rounded-md text-sm font-medium ${
//                 msg.includes('success')
//                   ? 'bg-green-100 text-green-800 border border-green-200'
//                   : 'bg-red-100 text-red-800 border border-red-200'
//               }`}>
//                 {msg}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OfferAdder;

import React, { useState, useEffect } from "react";
import axios from "axios";

function validateFetchedStudentCourses(
  selectedCourse,
  students,
  setCourseError,
) {
  const fetchedStudents = students.filter((s) => s.found && s.student?.course);

  if (!fetchedStudents.length) {
    setCourseError(null);
    return true;
  }

  const mismatch = fetchedStudents.some(
    (s) => s.student.course !== selectedCourse,
  );

  if (mismatch) {
    setCourseError("All fetched students must belong to the selected course");
    return false;
  }

  setCourseError(null);
  return true;
}

const OfferEditor = ({ onClose }) => {
  const [offers, setOffers] = useState([]);
  const [summerIntern, setSummerIntern] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [courseError, setCourseError] = useState(null); // kept as-is
  const [filter, setFilter] = useState("Offers");
  useEffect(() => {
    fetchOffers();
    fetchSummerInterns();
  }, []);

  async function fetchOffers() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await axios.get(
        `${import.meta.env.REACT_APP_BASE_URL}/offer-add/get-all`,
        { withCredentials: true },
      );
      setOffers(res.data);
    } catch (error) {
      setMsg("Failed to load offers");
    }
    setLoading(false);
  }

  async function fetchSummerInterns() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await axios.get(
        `${import.meta.env.REACT_APP_BASE_URL}/offer-add/get-all-summerIntern`,
        { withCredentials: true },
      );
      setSummerIntern(res.data);
    } catch (error) {
      setMsg("Failed to load Summer Intern");
    }
    setLoading(false);
  }

  const filteredOffers = offers.filter(
    (o) =>
      o.company_name &&
      o.company_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selected =
    filter === "Summer Intern"
      ? summerIntern.find((o) => o._id === selectedId)
      : offers.find((o) => o._id === selectedId);

  if (loading) {
    return <div className="text-center py-8">Loading offers...</div>;
  }

  if (selected) {
    return (
      <EditForm
        offer={selected}
        type={filter === "Summer Intern" ? "Summer Internship" : "Placement"}
        onSave={() => {
          fetchOffers();
          fetchSummerInterns();
          setSelectedId(null);
        }}
        onCancel={() => setSelectedId(null)}
      />
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Existing Offers
            </h2>
            <button
              onClick={() => setFilter("Offers")}
              className={`px-4 py-2 font-medium rounded-md border transition-colors
    ${
      filter === "Offers"
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
    }`}
            >
              Offers
            </button>

            <button
              onClick={() => setFilter("Summer Intern")}
              className={`px-4 py-2 font-medium rounded-md border transition-colors
    ${
      filter === "Summer Intern"
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
    }`}
            >
              Summer Intern
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md border border-gray-300 transition-colors"
            >
              Close
            </button>
          </div>

          {msg && (
            <div className="mb-4 px-4 py-2 bg-red-100 text-red-800 border border-red-200 rounded-md">
              {msg}
            </div>
          )}

          {filter === "Summer Intern" ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sector
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Result Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Students
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {summerIntern.map((o) => (
                    <tr key={o._id}>
                      <td className="px-6 py-4 text-sm">{o.batch}</td>
                      <td className="px-6 py-4 text-sm">{o.course}</td>
                      <td className="px-6 py-4 text-sm">{o.company_name}</td>
                      <td className="px-6 py-4 text-sm">{o.offer_mode}</td>
                      <td className="px-6 py-4 text-sm">{o.offer_sector}</td>
                      <td className="px-6 py-4 text-sm">{o.offer_category}</td>
                      <td className="px-6 py-4 text-sm">
                        {o.result_date || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {o.shortlisted_students?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => setSelectedId(o._id)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search offers by company name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {filteredOffers.length === 0 ? (
                <p className="text-gray-500">
                  {searchTerm
                    ? "No offers match the search."
                    : "No offers found."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Batch
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Mode
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Sector
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Result Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Students
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOffers.map((o) => (
                        <tr key={o._id}>
                          <td className="px-6 py-4 text-sm">{o.batch}</td>
                          <td className="px-6 py-4 text-sm">{o.course}</td>
                          <td className="px-6 py-4 text-sm">
                            {o.company_name}
                          </td>
                          <td className="px-6 py-4 text-sm">{o.offer_mode}</td>
                          <td className="px-6 py-4 text-sm">
                            {o.offer_sector}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {o.offer_category}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {o.result_date || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {o.shortlisted_students?.length || 0}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => setSelectedId(o._id)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const EditForm = ({ offer, type, onSave, onCancel }) => {
  const [offerType] = useState(type);
  const [company, setCompany] = useState(offer.company_name || "");
  console.log("in edit form section", offer);
  const [batch, setBatch] = useState(offer.batch || "2026");
  const [course, setCourse] = useState(offer.course || "B.Tech");
  const [resultDate, setResultDate] = useState(
    offer.result_date ? offer.result_date.split("T")[0] : "",
  );
  const [offerMode, setOfferMode] = useState(offer.offer_mode || "PPO");
  const [offerSector, setOfferSector] = useState(
    offer.offer_sector || "Private",
  );
  const [offerCategory, setOfferCategory] = useState(
    offer.offer_category || "A",
  );
  const [rollText, setRollText] = useState("");
  const [sList, setSList] = useState(
    offer.shortlisted_students.map((s) => ({
      roll: s.roll,
      found: !!s.studentId,
      student: {
        _id: s.studentId,
        name: s.name,
        gender: s.gender,
        department: s.department,
        category: s.category,
        course: s.course, // 🔧 FIX
      },
      override: {
        job_type: s.job_type,
        job_role: s.job_role,
        ctc: s.ctc,
        stipend: s.stipend,
        intern_duration: s.intern_duration,
      },
      loading: false,
    })),
  );
  const [g, setG] = useState({
    job_type: "FTE",
    job_role: "",
    ctc: "",
    stipend: "",
    intern_duration: "",
  });
  const [applyAll, setApplyAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [courseError, setCourseError] = useState(null);

  function parseRolls(txt) {
    return Array.from(
      new Set(
        txt
          .split(/[,\n\s]+/)
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    );
  }

  async function fetchOne(roll) {
    try {
      const res = await axios.get(
        `${import.meta.env.REACT_APP_BASE_URL}/offer-add/get/${encodeURIComponent(
          roll,
        )}`,
        { withCredentials: true },
      );
      return { roll, found: true, student: res.data };
    } catch (error) {
      return { roll, found: false };
    }
  }

  async function handleFetch() {
    const newRolls = parseRolls(rollText).filter(
      (r) => !sList.some((x) => x.roll === r),
    );

    if (!newRolls.length) return setMsg("No new roll numbers or duplicates.");
    setLoading(true);
    setMsg(null);

    const arr = newRolls.map((r) => ({
      roll: r,
      loading: true,
      found: false,
      student: null,
      override: {
        job_type: "",
        job_role: "",
        ctc: "",
        stipend: "",
        intern_duration: "",
      },
    }));
    setSList((current) => [...current, ...arr]);

    const res = await Promise.all(newRolls.map((r) => fetchOne(r)));

    const merged = res.map((r) => ({
      roll: r.roll,
      loading: false,
      found: !!r.found,
      student: r.student
        ? { ...r.student, course: r.student.course } // 🔧 FIX
        : null,
      override: {
        job_type: "",
        job_role: "",
        ctc: "",
        stipend: "",
        intern_duration: "",
      },
    }));

    setSList((current) => {
      const updated = [...current.filter((x) => !x.loading), ...merged];
      validateFetchedStudentCourses(course, updated, setCourseError); // 🔧 FIX
      return updated;
    });

    setRollText("");
    setLoading(false);
  }

  function setStudentField(i, k, v) {
    setSList((s) => {
      const t = [...s];
      t[i] = { ...t[i], override: { ...t[i].override, [k]: v } };
      return t;
    });
  }

  function applyGlobalToAll() {
    setSList((s) => s.map((x) => ({ ...x, override: { ...g } })));
  }

  function removeRow(i) {
    setSList((s) => s.filter((_, idx) => idx !== i));
  }

  useEffect(() => {
    if (offerType === "Summer Internship") {
      setG((s) => ({ ...s, job_type: "Intern" }));
    }
  }, [offerType]);

  async function handleUpdate() {
    if (!validateFetchedStudentCourses(course, sList, setCourseError)) return;

    if (!company) return setMsg("Company name required");
    if (!batch) return setMsg("Batch required");
    if (!course) return setMsg("Course required");
    if (!offerMode) return setMsg("Offer mode required");
    if (!sList.length) return setMsg("No students added");

    const payload = {
      company_name: company,
      batch,
      course,
      result_date: resultDate,
      offer_mode: offerMode,
      offer_category: offerCategory,
      offer_sector: offerSector,
      shortlisted_students: sList.map((x) => {
        const studentJobType =
          offerType === "Summer Internship"
            ? "Intern"
            : x.override.job_type || g.job_type;

        return {
          studentId: x.student?._id || null,
          roll: x.roll,
          name: x.student?.name || "",
          gender: x.student?.gender || "",
          department: x.student?.department || "",
          category: x.student?.category || "",
          job_type: studentJobType,
          job_role: x.override.job_role || g.job_role,
          ctc: x.override.ctc || g.ctc,
          stipend: x.override.stipend || g.stipend,
          intern_duration:
            studentJobType === "Intern"
              ? x.override.intern_duration || g.intern_duration
              : undefined,
        };
      }),
    };

    const updateUrl =
      offerType === "Summer Internship"
        ? `${import.meta.env.REACT_APP_BASE_URL}/offer-add/update-summerIntern/${offer._id}`
        : `${import.meta.env.REACT_APP_BASE_URL}/offer-add/update/${offer._id}`;

    setLoading(true);
    try {
      await axios.put(updateUrl, payload, { withCredentials: true });
      setMsg("Updated successfully");
      if (onSave) onSave();
    } catch (error) {
      setMsg("Update failed");
    }
    setLoading(false);
  }

  useEffect(() => {
    validateFetchedStudentCourses(course, sList, setCourseError);
  }, [course, sList]);

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Offer Details */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Edit Offer Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                placeholder="Enter company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch
              </label>
              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
                <option value="2029">2029</option>
                <option value="2030">2030</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="B.Tech">B.Tech</option>
                <option value="M.Tech">M.Tech</option>
                <option value="M.Sc.">M.Sc.</option>
                <option value="MBA">MBA</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offer Mode
              </label>
              <select
                value={offerMode}
                onChange={(e) => setOfferMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PPO">PPO</option>
                <option value="On-Campus">On-Campus</option>
                <option value="Off-Campus">Off-Campus</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offer Sector
              </label>
              <select
                value={offerSector}
                onChange={(e) => setOfferSector(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Private">Private</option>
                <option value="PSU">PSU</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offer Category
              </label>
              <select
                value={offerCategory}
                onChange={(e) => setOfferCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {batch>=2027 && 
                    <>
                      <option value="Dream">Dream</option>
                      <option value="Non Dream">Non Dream</option>
                    </>
                  }
                  {batch<2027 &&
                    <>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </>
                  }
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Result Date
              </label>
              <input
                type="date"
                value={resultDate}
                onChange={(e) => setResultDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Global Defaults */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={applyAll}
                onChange={(e) => setApplyAll(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <h2 className="text-lg font-semibold text-gray-900">
                Global Defaults
              </h2>
            </div>
            <button
              onClick={applyGlobalToAll}
              className="px-4 py-2 bg-custom-blue hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              Apply to All Students
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Type
              </label>
              <select
                value={g.job_type}
                disabled={offerType === "Summer Internship"}
                onChange={(e) =>
                  setG((s) => ({ ...s, job_type: e.target.value }))
                }
              >
                {offerType === "Summer Internship" ? (
                  <option value="Intern">Intern</option>
                ) : (
                  <>
                    <option value="Intern">Intern</option>
                    <option value="Intern+FTE">Intern+FTE</option>
                    <option value="FTE">FTE</option>
                    <option value="Intern+PPO">Intern+PPO</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Role
              </label>
              <input
                placeholder="e.g., Backend Developer"
                value={g.job_role}
                onChange={(e) =>
                  setG((s) => ({ ...s, job_role: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CTC
              </label>
              <input
                placeholder="e.g., 12 LPA"
                value={g.ctc}
                onChange={(e) => setG((s) => ({ ...s, ctc: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {g.job_type !== "FTE" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stipend
                </label>
                <input
                  placeholder="e.g., 50,000"
                  value={g.stipend}
                  onChange={(e) =>
                    setG((s) => ({ ...s, stipend: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            {g.job_type === "FTE" ? (
              <div className="flex items-center justify-center bg-gray-50 rounded-md p-3">
                <span className="text-sm text-gray-500">
                  No internship duration and stipend for FTE
                </span>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intern Duration
                </label>
                <input
                  placeholder="e.g., 6 months"
                  value={g.intern_duration}
                  onChange={(e) =>
                    setG((s) => ({ ...s, intern_duration: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Roll Numbers Input */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Add More Students
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roll Numbers (comma, space, or newline separated)
              </label>
              <textarea
                value={rollText}
                onChange={(e) => setRollText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                placeholder="Enter roll numbers here..."
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleFetch}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-custom-blue hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Fetching...
                  </>
                ) : (
                  "Fetch Students"
                )}
              </button>

              <button
                onClick={() => {
                  setRollText("");
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md border border-gray-300 transition-colors"
              >
                Clear Input
              </button>
            </div>
          </div>
        </div>

        {/* Students List */}
        {sList.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Students ({sList.length})
            </h2>

            <div className="space-y-4">
              {sList.map((s, i) => {
                const currentJobType =
                  s.override.job_type || (applyAll ? g.job_type : "");
                return (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                      {/* Roll Number */}
                      <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Roll Number
                        </label>
                        <input
                          value={s.roll}
                          onChange={(e) =>
                            setSList((arr) => {
                              const t = [...arr];
                              t[i].roll = e.target.value;
                              t[i].found = false;
                              t[i].student = null;
                              return t;
                            })
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Roll no."
                        />
                      </div>

                      {/* Student Info */}
                      <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Student Info
                        </label>
                        <div className="text-sm">
                          {s.loading ? (
                            <div className="flex items-center text-blue-600">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                              Loading...
                            </div>
                          ) : s.found ? (
                            <div>
                              <div className="font-medium text-gray-900">
                                {s.student?.name || "-"}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {s.student?.department || "-"}
                              </div>
                            </div>
                          ) : (
                            <div className="text-red-600 text-xs">
                              Student not found
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="lg:col-span-6 grid grid-cols-2 lg:grid-cols-4 gap-2">
                        <select
                          value={
                            s.override.job_type || (applyAll ? g.job_type : "")
                          }
                          onChange={(e) =>
                            setStudentField(i, "job_type", e.target.value)
                          }
                          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select job type</option>
                          <option value="Intern">Intern</option>
                          <option value="Intern+FTE">Intern+FTE</option>
                          <option value="FTE">FTE</option>
                          <option value="Intern+PPO">Intern+PPO</option>
                        </select>
                        <input
                          placeholder="Job role"
                          value={
                            s.override.job_role || (applyAll ? g.job_role : "")
                          }
                          onChange={(e) =>
                            setStudentField(i, "job_role", e.target.value)
                          }
                          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          placeholder="CTC"
                          value={s.override.ctc || (applyAll ? g.ctc : "")}
                          onChange={(e) =>
                            setStudentField(i, "ctc", e.target.value)
                          }
                          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        {currentJobType !== "FTE" && (
                          <input
                            placeholder="Stipend"
                            value={
                              s.override.stipend || (applyAll ? g.stipend : "")
                            }
                            onChange={(e) =>
                              setStudentField(i, "stipend", e.target.value)
                            }
                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        )}
                      </div>

                      {/* Intern Duration & Actions */}
                      <div className="lg:col-span-2 flex gap-2">
                        {currentJobType !== "FTE" && (
                          <input
                            placeholder="Duration"
                            value={
                              s.override.intern_duration ||
                              (applyAll ? g.intern_duration : "")
                            }
                            onChange={(e) =>
                              setStudentField(
                                i,
                                "intern_duration",
                                e.target.value,
                              )
                            }
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        )}
                        <button
                          onClick={async () => {
                            setSList((a) => {
                              const t = [...a];
                              t[i].loading = true;
                              return t;
                            });
                            const r = await fetchOne(s.roll);
                            setSList((a) => {
                              const t = [...a];
                              t[i] = {
                                ...t[i],
                                loading: false,
                                found: !!r.found,
                                student: r.student || null,
                              };
                              return t;
                            });
                          }}
                          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border"
                          title="Refetch student data"
                        >
                          ↻
                        </button>
                        <button
                          onClick={() => removeRow(i)}
                          className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded border border-red-200"
                          title="Remove student"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={handleUpdate}
                disabled={loading || courseError}
                className={`px-6 py-3 font-semibold rounded-md transition-colors
    ${courseError ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}
  `}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                onClick={onCancel}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-md border border-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>

            {msg && (
              <div
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  msg.includes("success")
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {msg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const OfferAdder = ({ onDone }) => {
  const [company, setCompany] = useState("");
  const [batch, setBatch] = useState("2026");
  const [course, setCourse] = useState("B.Tech");
  const [resultDate, setResultDate] = useState("");
  const [offerMode, setOfferMode] = useState("PPO");
  const [offerSector, setOfferSector] = useState("Private");
  const [offerCategory, setOfferCategory] = useState("A");
  const [rollText, setRollText] = useState("");
  const [sList, setSList] = useState([]);
  const [courseError, setCourseError] = useState(null);
  const [type, setType] = useState("Placement (Internship + Job)");
  const [g, setG] = useState({
    job_type: "FTE",
    job_role: "",
    ctc: "",
    stipend: "",
    intern_duration: "",
  });
  const [applyAll, setApplyAll] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  function parseRolls(txt) {
    return Array.from(
      new Set(
        txt
          .split(/[,\n\s]+/)
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    );
  }

  async function fetchOne(roll) {
    try {
      const res = await axios.get(
        `${import.meta.env.REACT_APP_BASE_URL}/offer-add/get/${encodeURIComponent(
          roll,
        )}`,
        { withCredentials: true },
      );
      return { roll, found: true, student: res.data };
    } catch (error) {
      return { roll, found: false };
    }
  }

  async function handleFetch() {
    const rolls = parseRolls(rollText);
    if (!rolls.length) return setMsg("Paste at least one roll number.");
    setLoading(true);
    setMsg(null);

    const arr = rolls.map((r) => ({
      roll: r,
      loading: true,
      found: false,
      student: null,
      override: {
        job_type: "",
        job_role: "",
        ctc: "",
        stipend: "",
        intern_duration: "",
      },
    }));
    setSList(arr);

    const res = await Promise.all(rolls.map((r) => fetchOne(r)));

    const merged = res.map((r) => {
      console.log("RAW fetch result:", r);

      console.log("STUDENT before course inject:", r.student);

      console.log("STUDENT.course value:", r.student?.course);
      return {
        roll: r.roll,
        loading: false,
        found: !!r.found,
        student: r.student
          ? { ...r.student, course: r.student.course } // 🔧 FIX
          : null,
        override: {
          job_type: "",
          job_role: "",
          ctc: "",
          stipend: "",
          intern_duration: "",
        },
      };
    });

    setSList(merged);
    validateFetchedStudentCourses(course, merged, setCourseError); // 🔧 FIX
    setRollText("");
    setLoading(false);
  }

  function setStudentField(i, k, v) {
    setSList((s) => {
      const t = [...s];
      t[i] = { ...t[i], override: { ...t[i].override, [k]: v } };
      return t;
    });
  }

  function applyGlobalToAll() {
    setSList((s) => s.map((x) => ({ ...x, override: { ...g } })));
  }

  function removeRow(i) {
    setSList((s) => s.filter((_, idx) => idx !== i));
  }

  async function handleSubmit() {
    if (!validateFetchedStudentCourses(course, sList, setCourseError)) return;

    if (!company) return setMsg("Company name required");
    if (!batch) return setMsg("Batch required");
    if (!course) return setMsg("Course required");
    if (!offerMode) return setMsg("Offer mode required");
    if (!sList.length) return setMsg("No students added");

    const payload = {
      type: type,
      company_name: company,
      batch,
      course,
      result_date: resultDate,
      offer_mode: offerMode,
      offer_category: offerCategory,
      offer_sector: offerSector,
      shortlisted_students: sList.map((x) => {
        const studentJobType = x.override.job_type || g.job_type;
        return {
          studentId: x.student?._id || null,
          roll: x.roll,
          name: x.student?.name || "",
          gender: x.student?.gender || "",
          department: x.student?.department || "",
          category: x.student?.category || "",
          job_type: studentJobType,
          job_role: x.override.job_role || g.job_role,
          ctc: x.override.ctc || g.ctc,
          stipend: x.override.stipend || g.stipend,
          intern_duration:
            studentJobType === "FTE"
              ? undefined
              : x.override.intern_duration || g.intern_duration,
        };
      }),
    };

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.REACT_APP_BASE_URL}/offer-add/add`,
        payload,
        { withCredentials: true },
      );
      setMsg("Saved successfully");
      setCompany("");
      setBatch("2026");
      setCourse("B.Tech");
      setRollText("");
      setSList([]);
      setG({
        job_type: "Intern",
        job_role: "",
        ctc: "",
        stipend: "",
        intern_duration: "",
      });
      if (onDone) onDone(res.data);
    } catch (error) {
      setMsg("Save failed");
    }
    setLoading(false);
  }

  useEffect(() => {
    validateFetchedStudentCourses(course, sList, setCourseError);
  }, [course, sList]);

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Add New Offer
              </h1>
              <button
                onClick={() => setShowEditor(true)}
                className="px-6 py-3 bg-custom-blue hover:bg-blue-700 text-white font-semibold rounded-md transition-colors"
              >
                Edit Existing Offers
              </button>
            </div>
          </div>

          {/* Offer Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Offer Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Placement (Internship + Job)">
                    Placement (Internship + Job)
                  </option>
                  <option value="Summer Internship">Summer Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  placeholder="Enter company name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch
                </label>
                <select
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                  <option value="2030">2030</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="M.Sc.">M.Sc.</option>
                  <option value="MBA">MBA</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Mode
                </label>
                <select
                  value={offerMode}
                  onChange={(e) => setOfferMode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="PPO">PPO</option>
                  <option value="On-Campus">On-Campus</option>
                  <option value="Off-Campus">Off-Campus</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Sector
                </label>
                <select
                  value={offerSector}
                  onChange={(e) => setOfferSector(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Private">Private</option>
                  <option value="PSU">PSU</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Category
                </label>
                <select
                  value={offerCategory}
                  onChange={(e) => setOfferCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {batch>=2027 && 
                    <>
                      <option value="Dream">Dream</option>
                      <option value="Non Dream">Non Dream</option>
                    </>
                  }
                  {batch<2027 &&
                    <>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </>
                  }
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Result Date
                </label>
                <input
                  type="date"
                  value={resultDate}
                  onChange={(e) => setResultDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Global Defaults */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={applyAll}
                  onChange={(e) => setApplyAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <h2 className="text-lg font-semibold text-gray-900">
                  Global Defaults
                </h2>
              </div>
              <button
                onClick={applyGlobalToAll}
                className="px-4 py-2 bg-custom-blue hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              >
                Apply to All Students
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type
                </label>
                <select
                  value={g.job_type}
                  onChange={(e) =>
                    setG((s) => ({ ...s, job_type: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Intern">Intern</option>
                  <option value="Intern+FTE">Intern+FTE</option>
                  <option value="FTE">FTE</option>
                  <option value="Intern+PPO">Intern+PPO</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Role
                </label>
                <input
                  placeholder="e.g., Backend Developer"
                  value={g.job_role}
                  onChange={(e) =>
                    setG((s) => ({ ...s, job_role: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CTC
                </label>
                <input
                  placeholder="e.g., 12 LPA"
                  value={g.ctc}
                  onChange={(e) => setG((s) => ({ ...s, ctc: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {g.job_type !== "FTE" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stipend
                  </label>
                  <input
                    placeholder="e.g., 50,000"
                    value={g.stipend}
                    onChange={(e) =>
                      setG((s) => ({ ...s, stipend: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {g.job_type === "FTE" ? (
                <div className="flex items-center justify-center bg-gray-50 rounded-md p-3">
                  <span className="text-sm text-gray-500">
                    No internship duration and stipend for FTE
                  </span>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intern Duration
                  </label>
                  <input
                    placeholder="e.g., 6 months"
                    value={g.intern_duration}
                    onChange={(e) =>
                      setG((s) => ({ ...s, intern_duration: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Roll Numbers Input */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Add Students
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roll Numbers (comma, space, or newline separated)
                </label>
                <textarea
                  value={rollText}
                  onChange={(e) => setRollText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                  placeholder="Enter roll numbers here..."
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleFetch}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-custom-blue hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Fetching...
                    </>
                  ) : (
                    "Fetch Students"
                  )}
                </button>

                <button
                  onClick={() => {
                    setRollText("");
                    setSList([]);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md border border-gray-300 transition-colors"
                >
                  Clear All
                </button>
              </div>
              {courseError && (
                <div className="mb-4 px-4 py-2 bg-red-100 text-red-800 border border-red-200 rounded-md">
                  {courseError}
                </div>
              )}
            </div>
          </div>

          {/* Students List */}
          {sList.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Students ({sList.length})
              </h2>

              <div className="space-y-4">
                {sList.map((s, i) => {
                  const currentJobType =
                    s.override.job_type || (applyAll ? g.job_type : "");
                  return (
                    <div
                      key={i}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        {/* Roll Number */}
                        <div className="lg:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Roll Number
                          </label>
                          <input
                            value={s.roll}
                            onChange={(e) =>
                              setSList((arr) => {
                                const t = [...arr];
                                t[i].roll = e.target.value;
                                t[i].found = false;
                                t[i].student = null;
                                return t;
                              })
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Roll no."
                          />
                        </div>

                        {/* Student Info */}
                        <div className="lg:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Student Info
                          </label>
                          <div className="text-sm">
                            {s.loading ? (
                              <div className="flex items-center text-blue-600">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                                Loading...
                              </div>
                            ) : s.found ? (
                              <div>
                                <div className="font-medium text-gray-900">
                                  {s.student?.name || "-"}
                                </div>
                                <div className="text-gray-500 text-xs">
                                  {s.student?.department || "-"}
                                </div>
                              </div>
                            ) : (
                              <div className="text-red-600 text-xs">
                                Student not found
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Job Details */}
                        <div className="lg:col-span-6 grid grid-cols-2 lg:grid-cols-4 gap-2">
                          <select
                            value={
                              s.override.job_type ||
                              (applyAll ? g.job_type : "")
                            }
                            onChange={(e) =>
                              setStudentField(i, "job_type", e.target.value)
                            }
                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Select job type</option>
                            <option value="Intern">Intern</option>
                            <option value="Intern+FTE">Intern+FTE</option>
                            <option value="FTE">FTE</option>
                            <option value="Intern+PPO">Intern+PPO</option>
                          </select>
                          <input
                            placeholder="Job role"
                            value={
                              s.override.job_role ||
                              (applyAll ? g.job_role : "")
                            }
                            onChange={(e) =>
                              setStudentField(i, "job_role", e.target.value)
                            }
                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <input
                            placeholder="CTC"
                            value={s.override.ctc || (applyAll ? g.ctc : "")}
                            onChange={(e) =>
                              setStudentField(i, "ctc", e.target.value)
                            }
                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          {currentJobType !== "FTE" && (
                            <input
                              placeholder="Stipend"
                              value={
                                s.override.stipend ||
                                (applyAll ? g.stipend : "")
                              }
                              onChange={(e) =>
                                setStudentField(i, "stipend", e.target.value)
                              }
                              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          )}
                        </div>

                        {/* Intern Duration & Actions */}
                        <div className="lg:col-span-2 flex gap-2">
                          {currentJobType !== "FTE" && (
                            <input
                              placeholder="Duration"
                              value={
                                s.override.intern_duration ||
                                (applyAll ? g.intern_duration : "")
                              }
                              onChange={(e) =>
                                setStudentField(
                                  i,
                                  "intern_duration",
                                  e.target.value,
                                )
                              }
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          )}
                          <button
                            onClick={async () => {
                              setSList((a) => {
                                const t = [...a];
                                t[i].loading = true;
                                return t;
                              });
                              const r = await fetchOne(s.roll);
                              setSList((a) => {
                                const t = [...a];
                                t[i] = {
                                  ...t[i],
                                  loading: false,
                                  found: !!r.found,
                                  student: r.student || null,
                                };
                                return t;
                              });
                            }}
                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border"
                            title="Refetch student data"
                          >
                            ↻
                          </button>
                          <button
                            onClick={() => removeRow(i)}
                            className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded border border-red-200"
                            title="Remove student"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={loading || courseError}
                  className={`px-6 py-3 font-semibold rounded-md transition-colors
    ${courseError ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}
  `}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Offer"
                  )}
                </button>
                <button
                  onClick={() => {
                    setSList([]);
                    setRollText("");
                  }}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-md border border-gray-300 transition-colors"
                >
                  Reset Students
                </button>
              </div>

              {msg && (
                <div
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    msg.includes("success")
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  {msg}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white rounded-lg max-w-6xl w-full m-4 max-h-[90vh] overflow-auto">
            <OfferEditor onClose={() => setShowEditor(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default OfferAdder;
