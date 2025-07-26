import React, { useEffect, useState } from "react";
import axios from "axios";

const LogsTable = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/admin/getlogs?page=${page}&limit=${limit}`,{withCredentials:true});
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

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">User Logs</h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : logs.length === 0 ? (
        <p>No logs found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100 text-sm">
                <tr>
                  <th className="p-2 border">User ID</th>
                  <th className="p-2 border">User Type</th>
                  <th className="p-2 border">Method</th>
                  <th className="p-2 border">URL</th>
                  <th className="p-2 border">Device</th>
                  <th className="p-2 border">IP</th>
                  <th className="p-2 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="text-sm hover:bg-gray-50">
                    <td className="p-2 border">{log.userId || "-"}</td>
                    <td className="p-2 border">{log.userType || "-"}</td>
                    <td className="p-2 border">{log.method}</td>
                    <td className="p-2 border">{log.url}</td>
                    <td className="p-2 border">
                      {log.deviceInfo?.browser || "?"} / {log.deviceInfo?.os || "?"}
                    </td>
                    <td className="p-2 border">{log.ip}</td>
                    <td className="p-2 border">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default LogsTable;
