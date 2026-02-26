import { useEffect, useState } from "react";
import axios from "axios";
import { Download } from "lucide-react";

const BASE_URL = import.meta.env.REACT_APP_BASE_URL;

export default function SummerIntern() {
  const [interns, setInterns] = useState([]);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const emptyStudent = {
    studentId: "",
    name: "",
    gender: "",
    department: "",
    category: "",
    job_type: "",
    job_role: "Intern+PPO",
    ctc: "",
    stipend: "",
    intern_duration: "",
  };

  const [studentForm, setStudentForm] = useState(emptyStudent);
  const [editStudentId, setEditStudentId] = useState(null);

  /* ================= FETCH ================= */
  const fetchInterns = async () => {
    setLoading(true);
    const res = await axios.get(`${BASE_URL}/admin/summerIntern`, {
      withCredentials: true,
    });
    setInterns(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  /* ================= DELETE WHOLE OFFER ================= */
  const deleteIntern = async (id) => {
    if (!confirm("Delete Summer Internship Offer?")) return;

    await axios.delete(`${BASE_URL}/admin/summerIntern/${id}`, {
      withCredentials: true,
    });

    fetchInterns();
  };

  /* ================= DELETE PARTICULAR STUDENT ================= */
  const deleteStudent = async (studentId) => {
    if (!confirm("Remove student?")) return;

    await axios.delete(
      `${BASE_URL}/admin/summerIntern/${selectedIntern._id}/student/${studentId}`,
      { withCredentials: true }
    );

    setSelectedIntern((prev) => ({
      ...prev,
      shortlisted_students: prev.shortlisted_students.filter(
        (s) => s._id !== studentId
      ),
    }));

    fetchInterns();
  };

  /* ================= SAVE STUDENT ================= */
  const saveStudent = async () => {
    if (!studentForm.studentId || !studentForm.name) {
      alert("Student ID and Name required");
      return;
    }

    if (editStudentId) {
      await axios.put(
        `${BASE_URL}/admin/summerIntern/${selectedIntern._id}/student/${editStudentId}`,
        studentForm,
        { withCredentials: true }
      );
    } else {
      await axios.post(
        `${BASE_URL}/admin/summerIntern/${selectedIntern._id}/add-student`,
        studentForm,
        { withCredentials: true }
      );
    }

    setStudentForm(emptyStudent);
    setEditStudentId(null);

    const updated = (
      await axios.get(
        `${BASE_URL}/admin/summerIntern/${selectedIntern._id}`,
        { withCredentials: true }
      )
    ).data;

    setSelectedIntern(updated);
    fetchInterns();
  };

  /* ================= UI ================= */

  return (
    <div className="p-8 bg-slate-100 min-h-screen space-y-8">
      <h1 className="text-3xl font-bold">Summer Internship Trace</h1>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-200">
            <tr>
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-left">Batch</th>
              <th className="px-4 py-3 text-left">Students</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {interns.map((i) => (
              <tr key={i._id} className="border-t">
                <td className="px-4 py-3">{i.company_name}</td>
                <td className="px-4 py-3">{i.batch}</td>

                <td className="px-4 py-3">
                  <button
                    className="text-blue-600 underline"
                    onClick={async () => {
                      const res = await axios.get(
                        `${BASE_URL}/admin/summer-intern/${i._id}`,
                        { withCredentials: true }
                      );
                      setSelectedIntern(res.data);
                      setModalOpen(true);
                    }}
                  >
                    {i.shortlisted_students.length}
                  </button>
                </td>

                <td className="px-4 py-3">
                  <button
                    onClick={() => deleteIntern(i._id)}
                    className="text-red-600"
                  >
                    Delete Offer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {modalOpen && selectedIntern && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[95%] max-w-5xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {selectedIntern.company_name}
            </h2>

            {/* Student Table */}
            <table className="w-full text-sm border-t">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Job Role</th>
                  <th className="px-3 py-2 text-left">CTC</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedIntern.shortlisted_students.map((s) => (
                  <tr key={s._id} className="border-t">
                    <td className="px-3 py-2">{s.name}</td>
                    <td className="px-3 py-2">{s.job_role}</td>
                    <td className="px-3 py-2">{s.ctc}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => deleteStudent(s._id)}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={() => setModalOpen(false)}
              className="mt-4 text-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}