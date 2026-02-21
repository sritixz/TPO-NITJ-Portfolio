import { useEffect, useState } from "react";
import axios from "axios";
import { Lock, Unlock, Trash2, Search, AlertCircle, Clock, Mail, Monitor, Download } from "lucide-react";

export default function LoginAttempts() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ email: "", ip: "" });
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/admin/loginattempts/`, { withCredentials: true });
      setData(res.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    if (!form.email || !form.ip) return;
    await axios.post(`${import.meta.env.REACT_APP_BASE_URL}/admin/loginattempts`, form, { withCredentials: true });
    setForm({ email: "", ip: "" });
    fetchData();
  };

  const handleUpdate = async (id, updates) => {
    await axios.put(`${import.meta.env.REACT_APP_BASE_URL}/admin/loginattempts/${id}`, updates, { withCredentials: true });
    fetchData();
  };

  const handleDelete = async (id) => {
    await axios.delete(`${import.meta.env.REACT_APP_BASE_URL}/admin/loginattempts/${id}`, { withCredentials: true });
    fetchData();
  };

  const handleBulkDelete = async () => {
    await axios.post(`${import.meta.env.REACT_APP_BASE_URL}/admin/loginattempts/bulk-delete`, { ids: selected }, { withCredentials: true });
    setSelected([]);
    fetchData();
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === filteredData.length) {
      setSelected([]);
    } else {
      setSelected(filteredData.map(d => d._id));
    }
  };

  const filteredData = data.filter(d => 
    d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.ip?.includes(searchTerm)
  );

  const stats = {
    total: data.length,
    locked: data.filter(d => d.isLocked).length,
    active: data.filter(d => !d.isLocked).length,
  };

  const handleExportJSON = () => {
    try {
      const dataToExport = filteredData;
      const dateKeys = new Set(["createdAt", "updatedAt", "dob", "dateOfJoining"]); 
    
      const formatExtendedJSON = (value, key = "") => {
        if (Array.isArray(value)) {
          return value.map((item) => formatExtendedJSON(item));
        }
        if (value && typeof value === "object") {
          if (value instanceof Date) {
            return { $date: value.toISOString() };
          }
          return Object.keys(value).reduce((acc, k) => {
            acc[k] = formatExtendedJSON(value[k], k);
            return acc;
          }, {});
        }
        if (key === "_id" && typeof value === "string") {
          return { $oid: value };
        }
        if (dateKeys.has(key) && typeof value === "string") {
          return { $date: value };
        }
        return value;
      };

      // If no data, export empty array with model structure as template
      const exportData = dataToExport.length > 0
      ? formatExtendedJSON(dataToExport)
      : [
          {
            _id: { $oid: "" },
            email: "",
            isLocked: false,
            loginAttempts: 0,
            otp: "",
            otpExpires: { $date: "" },
            otpAttempts: 0,
            ip: "",
            timestamp: { $date: "" }, 
            __v: 0
          }
        ];

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      link.download = `login_attempts_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (dataToExport.length === 0) {
        toast.success("Exported empty JSON file with model template");
      } else {
        toast.success(`Exported ${dataToExport.length} login attempt(s) to JSON`);
      }
    } catch (error) {
      toast.error("Failed to export JSON");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Login <span className="text-custom-blue">Attempts</span></h1>
          <p className="text-sm text-slate-600">Monitor and manage login security attempts</p>
          <button
            onClick={handleExportJSON}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center"
          >
            <Download className="mr-2" /> Export JSON
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Attempts</p>
                <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Locked Accounts</p>
                <p className="text-3xl font-bold text-red-600">{stats.locked}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <Lock className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Active Accounts</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Unlock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Add Form & Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-slate-200">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="user@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">IP Address</label>
              <input
                type="text"
                placeholder="192.168.1.1"
                value={form.ip}
                onChange={(e) => setForm({ ...form, ip: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            
            <button
              onClick={handleAdd}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-sm"
            >
              Add Entry
            </button>
          </div>
        </div>

        {/* Search & Bulk Actions */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-slate-200">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by email or IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            
            {selected.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">{selected.length} selected</span>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition shadow-sm flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading...</div>
          ) : filteredData.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No login attempts found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selected.length === filteredData.length && filteredData.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">IP Address</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Attempts</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Timestamp</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredData.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selected.includes(d._id)}
                          onChange={() => toggleSelect(d._id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700">{d.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700 font-mono">{d.ip}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {d.isLocked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            <Lock className="w-3 h-3" />
                            Locked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            <Unlock className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                          d.loginAttempts >= 5 ? 'bg-red-100 text-red-700' : 
                          d.loginAttempts >= 3 ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {d.loginAttempts}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {new Date(d.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(d._id, { isLocked: !d.isLocked })}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition shadow-sm ${
                              d.isLocked 
                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            }`}
                          >
                            {d.isLocked ? 'Unlock' : 'Lock'}
                          </button>
                          <button
                            onClick={() => handleDelete(d._id)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
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
      </div>
    </div>
  );
}