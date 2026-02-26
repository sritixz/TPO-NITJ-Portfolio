// src/components/SummerInternTracker.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function SummerInternTracker() {
  const [trackers, setTrackers] = useState([]);
  const [loading, setLoading] = useState(false);

  const BASE = import.meta.env.REACT_APP_BASE_URL; // keep your existing env variable

  const fetchTrackers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE}/admin/summerInternTracker`, { withCredentials: true });
      setTrackers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load trackers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackers();
  }, []);

  const handleRemoveStudent = async (docId, studentId, studentName) => {
    const confirmMsg = `Remove "${studentName || studentId}" from this summer-intern list? This allows the student to apply elsewhere.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      // optimistic UI: update locally first (immediate feedback)
      setTrackers(prev => prev.map(t => {
        if (String(t._id) !== String(docId)) return t;
        return { ...t, studentsId: t.studentsId.filter(s => String(s._id || s) !== String(studentId)) };
      }));

      const res = await axios.delete(`${BASE}/admin/summerInternTracker/${docId}/student/${studentId}`, { withCredentials: true });

      toast.success(res.data?.message || "Student removed");
      // ensure server state is reflected (in case server modified data differently)
      if (res.data?.tracker) {
        setTrackers(prev => prev.map(t => t._id === res.data.tracker._id ? res.data.tracker : t));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove student");
      // rollback: re-fetch trackers
      fetchTrackers();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-800">Summer Intern Tracker</h2>
          <p className="text-sm text-slate-600">Remove student from a summer-intern list so they can apply elsewhere.</p>
        </div>

        <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-sm">
                  <th className="px-4 py-3 text-left">Batch</th>
                  <th className="px-4 py-3 text-left">Course</th>
                  <th className="px-4 py-3 text-left">Students</th>
                  <th className="px-4 py-3 text-left">Created</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
                ) : trackers.length === 0 ? (
                  <tr><td colSpan="4" className="px-4 py-12 text-center text-slate-500">No tracker entries</td></tr>
                ) : (
                  trackers.map(t => (
                    <tr key={t._id} className="border-t">
                      <td className="px-4 py-4 align-top text-sm font-medium text-slate-800">{t.batch || "-"}</td>
                      <td className="px-4 py-4 align-top text-sm text-slate-700">{t.course || "-"}</td>

                      <td className="px-4 py-4 align-top">
                        {t.studentsId && t.studentsId.length > 0 ? (
                          <div className="space-y-2">
                            {t.studentsId.map(s => {
                              // s may be populated object or just an ID
                              const id = s._id || s;
                              const name = s.name || s?.studentName || (s._id ? (s.name || s.email) : String(s));
                              return (
                                <div key={String(id)} className="flex items-center justify-between gap-4 p-2 rounded-md border border-slate-100 bg-white">
                                  <div className="text-sm text-slate-800 truncate">
                                    {name}
                                    <div className="text-xs text-slate-500">{s.department || s.course ? `${s.department || ""}${s.course ? ` • ${s.course}` : ""}` : ""}</div>
                                  </div>
                                  <div>
                                    <button
                                      onClick={() => handleRemoveStudent(t._id, id, name)}
                                      className="flex items-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md text-sm"
                                      title="Remove student from this list"
                                    >
                                      <Trash2 size={14} />
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm italic text-slate-400">No students</p>
                        )}
                      </td>

                      <td className="px-4 py-4 align-top text-sm text-slate-500">
                        {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}