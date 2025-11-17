import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = `${import.meta.env.REACT_APP_BASE_URL}/admin/placement-calendar`;

export default function PlacementCalendarManager() {
  const [calendars, setCalendars] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);
  const [filters, setFilters] = useState({ 
    company: "", 
    startDate: "", 
    endDate: "", 
    dayStatus: ""
  });
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showCompanies, setShowCompanies] = useState(null);
  const [showAddCompanyForm, setShowAddCompanyForm] = useState(false);
  const [form, setForm] = useState({ date: "", dayStatus: "" });
  const [companyForm, setCompanyForm] = useState({
    company: "",
    process: "",
    timeIn: "",
    timeOut: "",
    visitStatus: "",
    status: "",
    branches: "",
    ctc: ""
  });
  const [saving, setSaving] = useState(false);
  const [addingCompany, setAddingCompany] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, ids: [] });

  // fetch all with pagination and filters
  const fetchCalendars = async (page = 1) => {
    setLoading(true);
    try {
      const params = { 
        ...filters, 
        page: page || currentPage, 
        limit 
      };
      const res = await axios.get(API_BASE, { params, withCredentials: true });
      setCalendars(res.data.calendars || []);
      setTotal(res.data.total || 0);
      setCurrentPage(res.data.page || 1);
    } catch (err) {
      console.error("Error fetching calendars:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendars();
  }, []);

  const toggleSelect = (id) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const selectAll = (checked) => {
    if (checked) {
      setSelected(calendars.map(c => c._id));
    } else {
      setSelected([]);
    }
  };

  // delete one or bulk
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await axios.delete(`${API_BASE}/${id}`, { withCredentials: true });
      fetchCalendars();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const handleBulkDelete = () => {
    if (!selected.length) return;
    setDeleteConfirm({ open: true, ids: selected });
  };

  const confirmBulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.length} selected entries?`)) return;
    try {
      await axios.post(`${API_BASE}/delete-many`, { ids: selected }, { withCredentials: true });
      setSelected([]);
      setDeleteConfirm({ open: false, ids: [] });
      fetchCalendars();
    } catch (err) {
      console.error("Error bulk deleting:", err);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchCalendars(1);
  };

  const clearFilters = () => {
    setFilters({ company: "", startDate: "", endDate: "", dayStatus: "" });
    setCurrentPage(1);
    fetchCalendars(1);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // create or update
  const handleFormSubmit = async () => {
    setSaving(true);
    try {
      if (editItem) {
        await axios.put(`${API_BASE}/${editItem._id}`, form, { withCredentials: true });
      } else {
        await axios.post(API_BASE, form, { withCredentials: true });
      }
      fetchCalendars();
      setShowForm(false);
      setEditItem(null);
      setForm({ date: "", dayStatus: "" });
    } catch (error) {
      console.error("Error saving calendar:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCompanyFormChange = (e) => {
    setCompanyForm({ ...companyForm, [e.target.name]: e.target.value });
  };

  const handleAddCompany = async () => {
    if (!showCompanies) return;
    setAddingCompany(true);
    try {
      await axios.post(`${API_BASE}/add-company/${showCompanies.date}`, companyForm, { withCredentials: true });
      fetchCalendars();
      setCompanyForm({
        company: "",
        process: "",
        timeIn: "",
        timeOut: "",
        visitStatus: "",
        status: "",
        branches: "",
        ctc: ""
      });
      setShowAddCompanyForm(false);
    } catch (error) {
      console.error("Error adding company:", error);
    } finally {
      setAddingCompany(false);
    }
  };

  const handleRemoveCompany = async (date, companyId) => {
    if (!window.confirm("Remove this company?")) return;
    try {
      await axios.delete(`${API_BASE}/remove-company/${date}/${companyId}`, { withCredentials: true });
      fetchCalendars();
    } catch (err) {
      console.error("Error removing company:", err);
    }
  };

  const handlePageChange = (page) => {
    fetchCalendars(page);
  };

  const closeModal = (setter) => setter(false);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Placement Calendar Entries</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Entry
          </button>
          <button
            onClick={() => fetchCalendars()}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Refresh
          </button>
          {selected.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete ({selected.length})
            </button>
          )}
        </div>
      </div>

      {/* Filters - Simple */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded">
        <input
          placeholder="Company"
          name="company"
          value={filters.company}
          onChange={handleFilterChange}
          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          placeholder="Day Status"
          name="dayStatus"
          value={filters.dayStatus}
          onChange={handleFilterChange}
          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex-1"
          >
            Apply
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex-1"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded border">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : calendars.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No entries found.</div>
        ) : (
          <>
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">
                    <input
                      type="checkbox"
                      checked={selected.length === calendars.length && calendars.length > 0}
                      onChange={(e) => selectAll(e.target.checked)}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                  <th className="px-4 py-2 text-left font-medium">Day Status</th>
                  <th className="px-4 py-2 text-left font-medium">Companies</th>
                  <th className="px-4 py-2 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {calendars.map((item) => (
                  <tr key={item._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selected.includes(item._id)}
                        onChange={() => toggleSelect(item._id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-2 font-medium">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {item.dayStatus || "Regular"}
                    </td>
                    <td className="px-4 py-2">
                      {item.companies?.length || 0}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowCompanies(item)}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setEditItem(item);
                            setForm({
                              date: item.date.toISOString().split("T")[0],
                              dayStatus: item.dayStatus || "",
                            });
                            setShowForm(true);
                          }}
                          className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {total > limit && (
              <div className="flex justify-between items-center p-4 border-t">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, total)} of {total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1">{currentPage} / {Math.ceil(total / limit)}</span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === Math.ceil(total / limit)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bulk Delete Confirm */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p>Delete {deleteConfirm.ids.length} entries?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setDeleteConfirm({ open: false, ids: [] })}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editItem ? "Edit Entry" : "Add Entry"}
            </h2>
            <div className="space-y-4">
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                placeholder="Day Status"
                name="dayStatus"
                value={form.dayStatus}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => closeModal(setShowForm)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFormSubmit}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Companies Modal */}
      {showCompanies && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Companies on {new Date(showCompanies.date).toLocaleDateString()}
            </h2>
            <button
              onClick={() => setShowAddCompanyForm(!showAddCompanyForm)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-4"
            >
              {showAddCompanyForm ? "Cancel" : "Add Company"}
            </button>
            {showAddCompanyForm && (
              <div className="space-y-2 p-4 bg-gray-50 rounded mb-4">
                <input
                  placeholder="Company"
                  name="company"
                  value={companyForm.company}
                  onChange={handleCompanyFormChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <input
                  placeholder="Process"
                  name="process"
                  value={companyForm.process}
                  onChange={handleCompanyFormChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input type="time" name="timeIn" value={companyForm.timeIn} onChange={handleCompanyFormChange} className="w-full px-3 py-2 border rounded" />
                  <input type="time" name="timeOut" value={companyForm.timeOut} onChange={handleCompanyFormChange} className="w-full px-3 py-2 border rounded" />
                </div>
                <input placeholder="Status" name="status" value={companyForm.status} onChange={handleCompanyFormChange} className="w-full px-3 py-2 border rounded" />
                <input placeholder="Branches" name="branches" value={companyForm.branches} onChange={handleCompanyFormChange} className="w-full px-3 py-2 border rounded" />
                <input placeholder="CTC" name="ctc" value={companyForm.ctc} onChange={handleCompanyFormChange} className="w-full px-3 py-2 border rounded" />
                <input placeholder="Visit Status" name="visitStatus" value={companyForm.visitStatus} onChange={handleCompanyFormChange} className="w-full px-3 py-2 border rounded" />
                <button
                  onClick={handleAddCompany}
                  disabled={addingCompany}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {addingCompany ? "Adding..." : "Add"}
                </button>
              </div>
            )}
            <div className="space-y-3">
              {showCompanies.companies?.length ? (
                showCompanies.companies.map((c) => (
                  <div key={c._id} className="border rounded p-3 flex justify-between items-start">
                    <div>
                      <p className="font-medium">{c.company}</p>
                      <p className="text-sm text-gray-600">
                        {c.process} | {c.status || "Pending"} | {c.ctc || "N/A"} | {c.branches || "All"}
                      </p>
                      <p className="text-sm text-gray-500">Time: {c.timeIn} - {c.timeOut} | Visit: {c.visitStatus}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveCompany(showCompanies.date, c._id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No companies.</p>
              )}
            </div>
            <button
              onClick={() => setShowCompanies(null)}
              className="w-full mt-4 px-4 py-2 border rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}