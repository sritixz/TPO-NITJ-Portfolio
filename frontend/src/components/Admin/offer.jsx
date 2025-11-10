// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function Offer() {
//   const [data, setData] = useState([]);
//   const [form, setForm] = useState({
//     company_name: "",
//     batch: "",
//     course: "",
//     offer_mode: "On-Campus",
//     offer_sector: "Private",
//     result_date: "",
//   });
//   const [selected, setSelected] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);

//   const fetchData = async () => {
//     setIsLoading(true);
//     try {
//       const res = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/admin/offers/`, { withCredentials: true });
//       setData(res.data);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//     setIsLoading(false);
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleAdd = async () => {
//     if (!form.company_name || !form.batch || !form.course) {
//       alert("Please fill in all required fields");
//       return;
//     }
    
//     try {
//       await axios.post(`${import.meta.env.REACT_APP_BASE_URL}/admin/offers/`, form, { withCredentials: true });
//       setForm({
//         company_name: "",
//         batch: "",
//         course: "",
//         offer_mode: "On-Campus",
//         offer_sector: "Private",
//         result_date: "",
//       });
//       fetchData();
//     } catch (error) {
//       console.error("Error adding offer:", error);
//     }
//   };

//   const handleUpdate = async (id, updates) => {
//     try {
//       await axios.put(`${import.meta.env.REACT_APP_BASE_URL}/admin/offers/${id}`, updates, { withCredentials: true });
//       fetchData();
//     } catch (error) {
//       console.error("Error updating offer:", error);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Are you sure you want to delete this offer?")) return;
    
//     try {
//       await axios.delete(`${import.meta.env.REACT_APP_BASE_URL}/admin/offers/${id}`, { withCredentials: true });
//       fetchData();
//     } catch (error) {
//       console.error("Error deleting offer:", error);
//     }
//   };

//   const handleBulkDelete = async () => {
//     if (!confirm(`Are you sure you want to delete ${selected.length} selected offer(s)?`)) return;
    
//     try {
//       await axios.post(`${import.meta.env.REACT_APP_BASE_URL}/admin/offers/bulk-delete`, { ids: selected }, { withCredentials: true });
//       setSelected([]);
//       fetchData();
//     } catch (error) {
//       console.error("Error bulk deleting:", error);
//     }
//   };

//   const toggleSelect = (id) => {
//     setSelected((prev) =>
//       prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
//     );
//   };

//   const toggleSelectAll = () => {
//     if (selected.length === data.length) {
//       setSelected([]);
//     } else {
//       setSelected(data.map(d => d._id));
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-slate-800 mb-2">Offers <span className="text-custom-blue">Management</span></h1>
//           <p className="text-slate-600">Manage campus placement offers and student shortlists</p>
//         </div>

//         {/* Add Form Card */}
//         <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-slate-200">
//           <h2 className="text-lg font-semibold text-slate-700 mb-4">Add New Offer</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
//               <input
//                 type="text"
//                 placeholder="Enter company name"
//                 value={form.company_name}
//                 onChange={(e) => setForm({ ...form, company_name: e.target.value })}
//                 className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">Batch *</label>
//               <input
//                 type="text"
//                 placeholder="e.g., 2024"
//                 value={form.batch}
//                 onChange={(e) => setForm({ ...form, batch: e.target.value })}
//                 className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">Course *</label>
//               <input
//                 type="text"
//                 placeholder="e.g., B.Tech CSE"
//                 value={form.course}
//                 onChange={(e) => setForm({ ...form, course: e.target.value })}
//                 className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">Offer Mode</label>
//               <select
//                 value={form.offer_mode}
//                 onChange={(e) => setForm({ ...form, offer_mode: e.target.value })}
//                 className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//               >
//                 <option value="On-Campus">On-Campus</option>
//                 <option value="Off-Campus">Off-Campus</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">Sector</label>
//               <select
//                 value={form.offer_sector}
//                 onChange={(e) => setForm({ ...form, offer_sector: e.target.value })}
//                 className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//               >
//                 <option value="Private">Private</option>
//                 <option value="Public">Public</option>
//                 <option value="Government">Government</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">Result Date</label>
//               <input
//                 type="date"
//                 value={form.result_date}
//                 onChange={(e) => setForm({ ...form, result_date: e.target.value })}
//                 className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//               />
//             </div>
//           </div>
//           <div className="flex gap-3 mt-6">
//             <button
//               onClick={handleAdd}
//               className="bg-custom-blue hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
//             >
//               Add Offer
//             </button>
//             {selected.length > 0 && (
//               <button
//                 onClick={handleBulkDelete}
//                 className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
//               >
//                 Delete {selected.length} Selected
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Table Card */}
//         <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
//           <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
//             <h2 className="text-lg font-semibold text-slate-700">All Offers ({data.length})</h2>
//           </div>
          
//           {isLoading ? (
//             <div className="flex justify-center items-center py-12">
//               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
//             </div>
//           ) : data.length === 0 ? (
//             <div className="text-center py-12 text-slate-500">
//               No offers found. Add your first offer above.
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-slate-50 border-b border-slate-200">
//                   <tr>
//                     <th className="px-4 py-3 text-left">
//                       <input
//                         type="checkbox"
//                         checked={selected.length === data.length && data.length > 0}
//                         onChange={toggleSelectAll}
//                         className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
//                       />
//                     </th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Company</th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Batch</th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Course</th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Mode</th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Sector</th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Result Date</th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Students</th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-200">
//                   {data.map((d) => (
//                     <tr key={d._id} className="hover:bg-slate-50 transition">
//                       <td className="px-4 py-4">
//                         <input
//                           type="checkbox"
//                           checked={selected.includes(d._id)}
//                           onChange={() => toggleSelect(d._id)}
//                           className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
//                         />
//                       </td>
//                       <td className="px-4 py-4 font-medium text-slate-800">{d.company_name}</td>
//                       <td className="px-4 py-4 text-slate-600">{d.batch}</td>
//                       <td className="px-4 py-4 text-slate-600">{d.course}</td>
//                       <td className="px-4 py-4">
//                         <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
//                           d.offer_mode === 'On-Campus' 
//                             ? 'bg-green-100 text-green-700' 
//                             : 'bg-purple-100 text-purple-700'
//                         }`}>
//                           {d.offer_mode}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4">
//                         <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
//                           d.offer_sector === 'Private' 
//                             ? 'bg-blue-100 text-blue-700' 
//                             : d.offer_sector === 'Government'
//                             ? 'bg-amber-100 text-amber-700'
//                             : 'bg-slate-100 text-slate-700'
//                         }`}>
//                           {d.offer_sector}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4 text-slate-600">
//                         {d.result_date ? new Date(d.result_date).toLocaleDateString() : "-"}
//                       </td>
//                       <td className="px-4 py-4">
//                         {d.shortlisted_students?.length > 0 ? (
//                           <div className="max-w-xs">
//                             <details className="cursor-pointer">
//                               <summary className="text-blue-600 font-medium hover:text-blue-700">
//                                 {d.shortlisted_students.length} student{d.shortlisted_students.length !== 1 ? 's' : ''}
//                               </summary>
//                               <ul className="mt-2 space-y-1 text-sm text-slate-600">
//                                 {d.shortlisted_students.map((s) => (
//                                   <li key={s._id} className="pl-2">
//                                     • {s.name} {s.job_role && `(${s.job_role})`}
//                                   </li>
//                                 ))}
//                               </ul>
//                             </details>
//                           </div>
//                         ) : (
//                           <span className="text-slate-400 text-sm">No students</span>
//                         )}
//                       </td>
//                       <td className="px-4 py-4">
//                         <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
//                           d.visibility 
//                             ? 'bg-emerald-100 text-emerald-700' 
//                             : 'bg-slate-100 text-slate-700'
//                         }`}>
//                           {d.visibility ? "Visible" : "Hidden"}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4">
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => handleUpdate(d._id, { visibility: !d.visibility })}
//                             className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition"
//                           >
//                             {d.visibility ? 'Hide' : 'Show'}
//                           </button>
//                           <button
//                             onClick={() => handleDelete(d._id)}
//                             className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition"
//                           >
//                             Delete
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import axios from "axios";

export default function Offer() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    company_name: "",
    batch: "",
    course: "",
    offer_mode: "On-Campus",
    offer_sector: "Private",
    result_date: "",
  });
  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filterJobType, setFilterJobType] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/admin/offers/`, { withCredentials: true });
      setData(res.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    if (!form.company_name || !form.batch || !form.course) {
      alert("Please fill in all required fields");
      return;
    }
    try {
      await axios.post(`${import.meta.env.REACT_APP_BASE_URL}/admin/offers/`, form, { withCredentials: true });
      setForm({
        company_name: "",
        batch: "",
        course: "",
        offer_mode: "On-Campus",
        offer_sector: "Private",
        result_date: "",
      });
      fetchData();
    } catch (error) {
      console.error("Error adding offer:", error);
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await axios.put(`${import.meta.env.REACT_APP_BASE_URL}/admin/offers/${id}`, updates, { withCredentials: true });
      fetchData();
    } catch (error) {
      console.error("Error updating offer:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    try {
      await axios.delete(`${import.meta.env.REACT_APP_BASE_URL}/admin/offers/${id}`, { withCredentials: true });
      fetchData();
    } catch (error) {
      console.error("Error deleting offer:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selected.length} selected offer(s)?`)) return;
    try {
      await axios.post(`${import.meta.env.REACT_APP_BASE_URL}/admin/offers/bulk-delete`, { ids: selected }, { withCredentials: true });
      setSelected([]);
      fetchData();
    } catch (error) {
      console.error("Error bulk deleting:", error);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selected.length === data.length) {
      setSelected([]);
    } else {
      setSelected(data.map((d) => d._id));
    }
  };

  const openModal = (offer) => {
    setSelectedOffer(offer);
    setModalOpen(true);
    setSortConfig({ key: null, direction: "asc" });
    setFilterJobType("");
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOffer(null);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedStudents = (students) => {
    if (sortConfig.key) {
      students = [...students].sort((a, b) => {
        const valA = a[sortConfig.key] || "";
        const valB = b[sortConfig.key] || "";
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return students;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-800 mb-3">
            Offers <span className="text-blue-600">Management</span>
          </h1>
          <p className="text-slate-600 text-lg">Manage campus placement offers and student shortlists efficiently</p>
        </div>

        {/* Add Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Add New Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Company Name *</label>
              <input
                type="text"
                placeholder="Enter company name"
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Batch *</label>
              <input
                type="text"
                placeholder="e.g., 2024"
                value={form.batch}
                onChange={(e) => setForm({ ...form, batch: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Course *</label>
              <input
                type="text"
                placeholder="e.g., B.Tech CSE"
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Offer Mode</label>
              <select
                value={form.offer_mode}
                onChange={(e) => setForm({ ...form, offer_mode: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="On-Campus">On-Campus</option>
                <option value="Off-Campus">Off-Campus</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sector</label>
              <select
                value={form.offer_sector}
                onChange={(e) => setForm({ ...form, offer_sector: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="Private">Private</option>
                <option value="Public">Public</option>
                <option value="Government">Government</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Result Date</label>
              <input
                type="date"
                value={form.result_date}
                onChange={(e) => setForm({ ...form, result_date: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Add Offer
            </button>
            {selected.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Delete {selected.length} Selected
              </button>
            )}
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200 bg-slate-50">
            <h2 className="text-xl font-semibold text-slate-800">All Offers ({data.length})</h2>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-lg">
              No offers found. Add your first offer above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selected.length === data.length && data.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Company</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Batch</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Course</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Mode</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Sector</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Result Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Added</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Students</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selected.includes(d._id)}
                          onChange={() => toggleSelect(d._id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">{d.company_name}</td>
                      <td className="px-6 py-4 text-slate-600">{d.batch}</td>
                      <td className="px-6 py-4 text-slate-600">{d.course}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            d.offer_mode === "On-Campus" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {d.offer_mode}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            d.offer_sector === "Private"
                              ? "bg-blue-100 text-blue-700"
                              : d.offer_sector === "Government"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {d.offer_sector}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {d.result_date ? new Date(d.result_date).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            d.added === "Automatically" ? "bg-teal-100 text-teal-700" : "bg-indigo-100 text-indigo-700"
                          }`}
                        >
                          {d.added}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {d.shortlisted_students?.length > 0 ? (
                          <button
                            onClick={() => openModal(d)}
                            className="text-blue-600 font-medium hover:text-blue-700 underline"
                          >
                            {d.shortlisted_students.length} student{d.shortlisted_students.length !== 1 ? "s" : ""}
                          </button>
                        ) : (
                          <span className="text-slate-400 text-sm">No students</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            d.visibility ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {d.visibility ? "Visible" : "Hidden"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleUpdate(d._id, { visibility: !d.visibility })}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                          >
                            {d.visibility ? "Hide" : "Show"}
                          </button>
                          <button
                            onClick={() => handleDelete(d._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal for Student Details */}
        {modalOpen && selectedOffer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-8 relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-slate-600 hover:text-slate-800"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                Students for <span className="text-custom-blue">{selectedOffer.company_name}</span> (<span className="text-custom-blue">{selectedOffer.shortlisted_students.length}</span>)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th
                        onClick={() => handleSort("name")}
                        className="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer"
                      >
                        Name {sortConfig.key === "name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        onClick={() => handleSort("gender")}
                        className="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer"
                      >
                        Gender {sortConfig.key === "gender" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        onClick={() => handleSort("department")}
                        className="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer"
                      >
                        Department {sortConfig.key === "department" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        onClick={() => handleSort("category")}
                        className="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer"
                      >
                        Category {sortConfig.key === "category" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        onClick={() => handleSort("job_type")}
                        className="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer"
                      >
                        Job Type {sortConfig.key === "job_type" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        onClick={() => handleSort("job_role")}
                        className="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer"
                      >
                        Job Role {sortConfig.key === "job_role" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        onClick={() => handleSort("ctc")}
                        className="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer"
                      >
                        CTC {sortConfig.key === "ctc" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        onClick={() => handleSort("stipend")}
                        className="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer"
                      >
                        Stipend {sortConfig.key === "stipend" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        onClick={() => handleSort("intern_duration")}
                        className="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer"
                      >
                        Intern Duration {sortConfig.key === "intern_duration" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sortedStudents(selectedOffer.shortlisted_students).map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-medium text-slate-800">{s.name || "-"}</td>
                        <td className="px-4 py-3 text-slate-600">{s.gender || "-"}</td>
                        <td className="px-4 py-3 text-slate-600">{s.department || "-"}</td>
                        <td className="px-4 py-3 text-slate-600">{s.category || "-"}</td>
                        <td className="px-4 py-3 text-slate-600">{s.job_type || "-"}</td>
                        <td className="px-4 py-3 text-slate-600">{s.job_role || "-"}</td>
                        <td className="px-4 py-3 text-slate-600">{s.ctc || "-"}</td>
                        <td className="px-4 py-3 text-slate-600">{s.stipend || "-"}</td>
                        <td className="px-4 py-3 text-slate-600">{s.intern_duration || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}