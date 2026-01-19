import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const ERPStudentDashboard = () => {
  const [rollno, setRollno] = useState("");
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState(null);

  const fetchERPStudent = async () => {
    if (!rollno.trim()) {
      toast.error("Enter roll number");
      return;
    }

    try {
      setLoading(true);
      setStudent(null);

      const res = await axios.get(
        `${import.meta.env.REACT_APP_BASE_URL}/admin/erp/student`,
        {
          params: { rollno },
          withCredentials: true
        }
      );

      setStudent(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch ERP data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">ERP Student Dashboard</h1>

      {/* SEARCH */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Enter Roll Number"
          value={rollno}
          onChange={(e) => setRollno(e.target.value)}
          className="border p-2 rounded w-64"
        />
        <button
          onClick={fetchERPStudent}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {loading && <p>Fetching ERP data…</p>}

      {/* RESULT */}
      {student && (
        <div className="border rounded p-5 bg-gray-50">
          <h2 className="text-xl font-semibold mb-3">
            {student.name} ({student.rollno})
          </h2>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <p><b>Department:</b> {student.department}</p>
            <p><b>Course:</b> {student.course}</p>
            <p><b>Batch:</b> {student.batch}</p>
            <p><b>CGPA:</b> {student.cgpa}</p>
            <p><b>Gender:</b> {student.gender}</p>
            <p><b>Category:</b> {student.category}</p>
            <p><b>Active Backlogs:</b> {student.active_backlogs? "Yes":"No"}</p>
            <p><b>Backlogs History:</b> {student.backlogs_history? "Yes":"No"}</p>
            <p><b>Active Backlog Count:</b> {student.activeBacklogCount}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ERPStudentDashboard;
