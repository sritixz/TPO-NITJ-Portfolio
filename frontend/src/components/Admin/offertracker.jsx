import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Plus, CheckSquare, Square, Pencil, X } from "lucide-react";

export default function OfferTracker() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    studentId: "",
    offer_type: "",
    offer_category: "",
    offer_sector: "Private",
    offer_ctc: "0",
    offer_intern_duration: "",
  });
  const [selected, setSelected] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    offer_type: "",
    offer_category: "",
    offer_sector: "Private",
    offer_ctc: "0",
    offer_intern_duration: "",
  });

  const fetchData = async () => {
    const res = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/admin/offertracker`, { withCredentials: true });
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    await axios.post(`${import.meta.env.REACT_APP_BASE_URL}/admin/offertracker`, {
      studentId: form.studentId,
      offer: [
        {
          offer_type: form.offer_type,
          offer_category: form.offer_category,
          offer_sector: form.offer_sector,
          offer_ctc: form.offer_ctc,
          offer_intern_duration: form.offer_intern_duration,
        },
      ],
    }, { withCredentials: true });
    setForm({
      studentId: "",
      offer_type: "",
      offer_category: "",
      offer_sector: "Private",
      offer_ctc: "0",
      offer_intern_duration: "",
    });
    fetchData();
  };

  const handleUpdate = async (id, updates) => {
    await axios.put(`${import.meta.env.REACT_APP_BASE_URL}/admin/offertracker/${id}`, updates, { withCredentials: true });
    fetchData();
  };

  const handleDelete = async (id) => {
    await axios.delete(`${import.meta.env.REACT_APP_BASE_URL}/admin/offertracker/${id}`, { withCredentials: true });
    fetchData();
  };

  const handleBulkDelete = async () => {
    await axios.post(`${import.meta.env.REACT_APP_BASE_URL}/admin/offertracker/bulk-delete`, { ids: selected }, { withCredentials: true });
    setSelected([]);
    fetchData();
  };

  const startEdit = (d) => {
    setEditingId(d._id);
    setEditForm({
      offer_type: d.offer?.[0]?.offer_type || "",
      offer_category: d.offer?.[0]?.offer_category || "",
      offer_sector: d.offer?.[0]?.offer_sector || "Private",
      offer_ctc: d.offer?.[0]?.offer_ctc || "0",
      offer_intern_duration: d.offer?.[0]?.offer_intern_duration || "",
    });
  };

  const handleEditSave = async () => {
    await handleUpdate(editingId, {
      offer: [
        {
          offer_type: editForm.offer_type,
          offer_category: editForm.offer_category,
          offer_sector: editForm.offer_sector,
          offer_ctc: editForm.offer_ctc,
          offer_intern_duration: editForm.offer_intern_duration,
        },
      ],
    });
    setEditingId(null);
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === data.length) {
      setSelected([]);
    } else {
      setSelected(data.map(d => d._id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Offer <span className="text-custom-blue">Tracker</span></h1>
          <p className="text-slate-600">Manage student placement offers and track recruitment progress</p>
        </div>

        {/* Add Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Add New Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Student ID</label>
              <input
                type="text"
                placeholder="Enter student ID"
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-custom-blue focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Offer Type</label>
              <select
                value={form.offer_type}
                onChange={(e) => setForm({ ...form, offer_type: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-custom-blue focus:border-transparent transition bg-white"
              >
                <option value="Intern">Intern</option>
                <option value="Intern+PPO">Intern+PPO</option>
                <option value="Intern+FTE">Intern+FTE</option>
                <option value="FTE">FTE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Offer Category</label>
              <select
                value={form.offer_category}
                onChange={(e) => setForm({ ...form, offer_category: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-custom-blue focus:border-transparent transition bg-white"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Offer Sector</label>
              <select
                value={form.offer_sector}
                onChange={(e) => setForm({ ...form, offer_sector: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-custom-blue focus:border-transparent transition bg-white"
              >
                <option value="Private">Private</option>
                <option value="PSU">PSU</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Offer CTC (in LPA)</label>
              <input
                type="number"
                placeholder="0"
                value={form.offer_ctc}
                onChange={(e) => setForm({ ...form, offer_ctc: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-custom-blue focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Intern Duration</label>
              <input
                type="text"
                placeholder="e.g., 6 months"
                value={form.offer_intern_duration}
                onChange={(e) => setForm({ ...form, offer_intern_duration: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-custom-blue focus:border-transparent transition"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-custom-blue hover:bg-custom-blue text-white px-6 py-2.5 rounded-lg font-medium transition shadow-sm"
            >
              <Plus size={18} />
              Add Offer
            </button>
            {selected.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition shadow-sm"
              >
                <Trash2 size={18} />
                Delete Selected ({selected.length})
              </button>
            )}
          </div>
        </div>

        {/* Data Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-4 text-left">
                    <button onClick={toggleSelectAll} className="hover:text-custom-blue transition">
                      {selected.length === data.length && data.length > 0 ? (
                        <CheckSquare size={20} className="text-custom-blue" />
                      ) : (
                        <Square size={20} className="text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">Student</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">Offer Type</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">Category</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">Sector</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">CTC</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">Duration</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">Created At</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-12 text-center text-slate-500">
                      No offers found. Add your first offer above.
                    </td>
                  </tr>
                ) : (
                  data.map((d) => (
                    <tr key={d._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="px-4 py-4">
                        <button onClick={() => toggleSelect(d._id)} className="hover:text-custom-blue transition">
                          {selected.includes(d._id) ? (
                            <CheckSquare size={20} className="text-custom-blue" />
                          ) : (
                            <Square size={20} className="text-slate-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-800">
                        {d.studentId?.name || d.studentId}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {d.offer?.[0]?.offer_type || "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {d.offer?.[0]?.offer_category || "-"}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-custom-blue">
                          {d.offer?.[0]?.offer_sector || "Private"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                        ₹{d.offer?.[0]?.offer_ctc || "0"} LPA
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {d.offer?.[0]?.offer_intern_duration || "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500">
                        {new Date(d.createdAt).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(d)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(d._id)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {editingId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Edit Offer</h2>
                <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-700">
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Offer Type</label>
                  <select
                    value={editForm.offer_type}
                    onChange={(e) => setEditForm({ ...editForm, offer_type: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-custom-blue focus:border-transparent transition bg-white"
                  >
                    <option value="Intern">Intern</option>
                    <option value="Intern+PPO">Intern+PPO</option>
                    <option value="Intern+FTE">Intern+FTE</option>
                    <option value="FTE">FTE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Offer Category</label>
                  <select
                    value={editForm.offer_category}
                    onChange={(e) => setEditForm({ ...editForm, offer_category: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-custom-blue focus:border-transparent transition bg-white"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Offer Sector</label>
                  <select
                    value={editForm.offer_sector}
                    onChange={(e) => setEditForm({ ...editForm, offer_sector: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-custom-blue focus:border-transparent transition bg-white"
                  >
                    <option value="Private">Private</option>
                    <option value="PSU">PSU</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Offer CTC (in LPA)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={editForm.offer_ctc}
                    onChange={(e) => setEditForm({ ...editForm, offer_ctc: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-custom-blue focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Intern Duration</label>
                  <input
                    type="text"
                    placeholder="e.g., 6 months"
                    value={editForm.offer_intern_duration}
                    onChange={(e) => setEditForm({ ...editForm, offer_intern_duration: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-custom-blue focus:border-transparent transition"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditingId(null)}
                  className="px-6 py-2.5 rounded-lg font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  className="flex items-center gap-2 bg-custom-blue hover:bg-custom-blue text-white px-6 py-2.5 rounded-lg font-medium transition shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Footer */}
        {data.length > 0 && (
          <div className="mt-6 flex justify-between items-center text-sm text-slate-600">
            <div>Total Offers: <span className="font-semibold text-slate-800">{data.length}</span></div>
            <div>Selected: <span className="font-semibold text-slate-800">{selected.length}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}