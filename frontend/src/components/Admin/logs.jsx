import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Filter, RefreshCw, Calendar, Globe, Monitor, User, Activity, Download } from "lucide-react";

const LogsTable = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("ALL");
  const [filterUserType, setFilterUserType] = useState("ALL");

  const fetchLogs = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(
        `${import.meta.env.REACT_APP_BASE_URL}/admin/getlogs?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );
      setLogs(res.data.logs);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError("Failed to fetch logs.");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.includes(searchTerm) ||
      (log.userId && log.userId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMethod = filterMethod === "ALL" || log.method === filterMethod;
    const matchesUserType = filterUserType === "ALL" || log.userType === filterUserType;

    return matchesSearch && matchesMethod && matchesUserType;
  });

  const getMethodBadgeColor = (method) => {
    const colors = {
      GET: "bg-blue-100 text-blue-700",
      POST: "bg-green-100 text-green-700",
      PUT: "bg-yellow-100 text-yellow-700",
      DELETE: "bg-red-100 text-red-700",
      PATCH: "bg-purple-100 text-purple-700",
    };
    return colors[method] || "bg-gray-100 text-gray-700";
  };

  const getUserTypeBadgeColor = (userType) => {
    const colors = {
      admin: "bg-purple-100 text-purple-700",
      user: "bg-blue-100 text-blue-700",
      guest: "bg-gray-100 text-gray-700",
    };
    return colors[userType] || "bg-gray-100 text-gray-700";
  };

  const handleExportJSON = () => {
    try {
      const dataToExport = filteredLogs;
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
            userId: { $oid: "" }, 
            userType: "",
            url: "",
            method: "",
            deviceInfo: {
              browser: "",
              os: "",
              deviceType: ""
            },
            ip: "",
            userAgent: "",
            createdAt: { $date: "" },
            updatedAt: { $date: "" },
            __v: 0
          }
        ];

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      link.download = `logs_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (dataToExport.length === 0) {
        toast.success("Exported empty JSON file with model template");
      } else {
        toast.success(`Exported ${dataToExport.length} log(s) to JSON`);
      }
    } catch (error) {
      toast.error("Failed to export JSON");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-custom-blue" />
            <h1 className="text-3xl font-bold text-slate-800">Activity Logs</h1>
          </div>
          <p className="text-slate-600">Monitor and track all user activities in real-time</p>
          <button
            onClick={handleExportJSON}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center"
            >
            <Download className="mr-2" /> Export JSON
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Controls Bar */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by URL, IP, or User ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    value={filterMethod}
                    onChange={(e) => setFilterMethod(e.target.value)}
                    className="pl-9 pr-8 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
                  >
                    <option value="ALL">All Methods</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>

                <select
                  value={filterUserType}
                  onChange={(e) => setFilterUserType(e.target.value)}
                  className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
                >
                  <option value="ALL">All Users</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="guest">Guest</option>
                </select>

                <button
                  onClick={fetchLogs}
                  disabled={loading}
                  className="px-4 py-2.5 bg-custom-blue text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <RefreshCw className="w-12 h-12 text-custom-blue animate-spin mb-4" />
                <p className="text-slate-600 text-lg">Loading logs...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="bg-red-50 text-red-600 px-6 py-4 rounded-lg border border-red-200">
                  <p className="font-semibold">{error}</p>
                </div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Activity className="w-16 h-16 text-slate-300 mb-4" />
                <p className="text-slate-600 text-lg">No logs found</p>
                <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            User
                          </div>
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Method</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Endpoint
                          </div>
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">
                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4" />
                            Device
                          </div>
                        </th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">IP Address</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Timestamp
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log, index) => (
                        <tr
                          key={log._id}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium text-slate-900">
                                {log.userId || "Anonymous"}
                              </span>
                              {log.userType && (
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium w-fit ${getUserTypeBadgeColor(
                                    log.userType
                                  )}`}
                                >
                                  {log.userType}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getMethodBadgeColor(
                                log.method
                              )}`}
                            >
                              {log.method}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-slate-700 font-mono">{log.url}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-slate-600">
                              <div>{log.deviceInfo?.browser || "Unknown"}</div>
                              <div className="text-xs text-slate-400">{log.deviceInfo?.os || "Unknown OS"}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-slate-700 font-mono">{log.ip}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-slate-600">
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
                  <div className="text-sm text-slate-600">
                    Showing <span className="font-semibold">{filteredLogs.length}</span> of{" "}
                    <span className="font-semibold">{logs.length}</span> logs
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-2">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }

                        return (
                          <button
                            key={i}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                              page === pageNum
                                ? "bg-custom-blue text-white"
                                : "text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogsTable;