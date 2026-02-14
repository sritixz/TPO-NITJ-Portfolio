import { useEffect, useState } from "react";
import axios from "axios";
import {
  DEGREE_OPTIONS,
  DEPARTMENT_OPTIONS,
  JOB_TYPE_OPTIONS,
  INTERNSHIP_DURATION_OPTIONS,
  JOB_CATEGORY_OPTIONS,
  JOB_SECTOR_OPTIONS,
} from "../../constants/jobConstants";
import {Download} from "lucide-react"

const BASE_URL = import.meta.env.REACT_APP_BASE_URL;
const BATCH_OPTIONS = ["2025", "2026", "2027", "2028", "2029", "2030", "2031"];

export default function Offer() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);

  /* ---------------- OFFER FORM ---------------- */

  const [offerForm, setOfferForm] = useState({
    company_name: "",
    batch: "",
    course: "",
    offer_mode: "On-Campus",
    offer_sector: "Private",
    result_date: "",
  });

  /* ---------------- STUDENT FORM ---------------- */

  const emptyStudent = {
    studentId: "",
    name: "",
    gender: "",
    degree: "",
    department: "",
    category: "",
    job_type: "",
    job_role: "",
    intern_duration: "",
    ctc: "",
    stipend: "",
  };

  const [studentForm, setStudentForm] = useState(emptyStudent);

  /* ---------------- FETCH ---------------- */

  const fetchOffers = async () => {
    setLoading(true);
    const res = await axios.get(`${BASE_URL}/admin/offers`, {
      withCredentials: true,
    });
    setOffers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  /* ---------------- OFFER CRUD ---------------- */

  const addOffer = async () => {
    if (!offerForm.company_name || !offerForm.batch || !offerForm.course) {
      alert("Company, Batch and Course are required");
      return;
    }

    await axios.post(`${BASE_URL}/admin/offers`, offerForm, {
      withCredentials: true,
    });

    setOfferForm({
      company_name: "",
      batch: "",
      course: "",
      offer_mode: "On-Campus",
      offer_sector: "Private",
      result_date: "",
    });

    fetchOffers();
  };

  const toggleVisibility = async (id, visibility) => {
    await axios.put(
      `${BASE_URL}/admin/offers/${id}`,
      { visibility: !visibility },
      { withCredentials: true }
    );
    fetchOffers();
  };

  const deleteOffer = async (id) => {
    if (!confirm("Delete offer?")) return;
    await axios.delete(`${BASE_URL}/admin/offers/${id}`, {
      withCredentials: true,
    });
    fetchOffers();
  };

  /* ---------------- STUDENT CRUD ---------------- */

  const saveStudent = async () => {
    if (
      !studentForm.studentId ||
      !studentForm.name ||
      !studentForm.gender ||
      !studentForm.job_type
    ) {
      alert("Student ID, Name, Gender and Job Type are required");
      return;
    }

    const payload = { ...studentForm };

    if (editStudentId) {
      await axios.put(
        `${BASE_URL}/admin/offers/${selectedOffer._id}/student/${editStudentId}`,
        payload,
        { withCredentials: true }
      );
    } else {
      await axios.post(
        `${BASE_URL}/admin/offers/${selectedOffer._id}/add-student`,
        payload,
        { withCredentials: true }
      );
    }

    setStudentForm(emptyStudent);
    setEditStudentId(null);

    const updated = (
      await axios.get(`${BASE_URL}/admin/offers/${selectedOffer._id}`, {
        withCredentials: true,
      })
    ).data;

    setSelectedOffer(updated);
    fetchOffers();
  };

  const deleteStudent = async (studentId) => {
    if (!confirm("Remove student?")) return;

    await axios.delete(
      `${BASE_URL}/admin/offers/${selectedOffer._id}/student/${studentId}`,
      { withCredentials: true }
    );

    setSelectedOffer((prev) => ({
      ...prev,
      shortlisted_students: prev.shortlisted_students.filter(
        (s) => s._id !== studentId
      ),
    }));

    fetchOffers();
  };

  const editStudent = (s) => {
    setStudentForm({
      studentId: s.studentId?._id || "",
      name: s.name,
      gender: s.gender,
      degree: s.degree,
      department: s.department,
      category: s.category,
      job_type: s.job_type,
      job_role: s.job_role,
      intern_duration: s.intern_duration,
      ctc: s.ctc,
      stipend: s.stipend,
    });
    setEditStudentId(s._id);
  };

  const input =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none";

    const handleExportJSON = () => {
    try {
      const dataToExport = offers;
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
            jobId: { $oid: "" },  
            company_name: "",
            batch: "",
            course: "",
            offer_mode: "On-Campus",
            offer_sector: "Private",
            result_date: { $date: "" },
            shortlisted_students: [
              {
                studentId: { $oid: "" }, 
                name: "",
                gender: "",
                department: "",
                category: "",
                job_type: "",
                job_role: "",
                ctc: "",
                stipend: "",
                intern_duration: ""
              }
            ],
            visibility: true,
            added: "Automatically",
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
      link.download = `offers_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (dataToExport.length === 0) {
        toast.success("Exported empty JSON file with model template");
      } else {
        toast.success(`Exported ${dataToExport.length} offer(s) to JSON`);
      }
    } catch (error) {
      toast.error("Failed to export JSON");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="p-8 bg-slate-100 min-h-screen space-y-8">
      <h1 className="text-3xl font-bold text-slate-800">
        Offers Management
      </h1>
      <button
        onClick={handleExportJSON}
        className="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center"
      >
        <Download className="mr-2" /> Export JSON
      </button>

      {/* ADD OFFER */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">
          Add Offer
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <input
            className={input}
            placeholder="Company Name"
            value={offerForm.company_name}
            onChange={(e) =>
              setOfferForm({ ...offerForm, company_name: e.target.value })
            }
          />

          <select
            className={input}
            value={offerForm.batch}
            onChange={(e) =>
              setOfferForm({ ...offerForm, batch: e.target.value })
            }
          >
            <option value="">Batch</option>
            {BATCH_OPTIONS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>

          <select
            className={input}
            value={offerForm.course}
            onChange={(e) =>
              setOfferForm({ ...offerForm, course: e.target.value })
            }
          >
            <option value="">Course</option>
            {DEGREE_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>

          <select
            className={input}
            value={offerForm.offer_mode}
            onChange={(e) =>
              setOfferForm({ ...offerForm, offer_mode: e.target.value })
            }
          >
            <option>On-Campus</option>
            <option>Off-Campus</option>
          </select>

          <select
            className={input}
            value={offerForm.offer_sector}
            onChange={(e) =>
              setOfferForm({ ...offerForm, offer_sector: e.target.value })
            }
          >
            {JOB_SECTOR_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <input
            type="date"
            className={input}
            value={offerForm.result_date}
            onChange={(e) =>
              setOfferForm({ ...offerForm, result_date: e.target.value })
            }
          />
        </div>

        <button
          onClick={addOffer}
          className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Add Offer
        </button>
      </div>

      {/* OFFERS TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-200 text-slate-700">
            <tr>
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-left">Batch</th>
              <th className="px-4 py-3 text-left">Course</th>
              <th className="px-4 py-3 text-left">Mode</th>
              <th className="px-4 py-3 text-left">Sector</th>
              <th className="px-4 py-3 text-left">Result Date</th>
              <th className="px-4 py-3 text-left">Added</th>
              <th className="px-4 py-3 text-left">Students</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((o) => (
              <tr key={o._id} className="border-t hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{o.company_name}</td>
                <td className="px-4 py-3">{o.batch}</td>
                <td className="px-4 py-3">{o.course}</td>
                <td className="px-4 py-3">{o.offer_mode}</td>
                <td className="px-4 py-3">{o.offer_sector}</td>
                <td className="px-4 py-3">
                  {o.result_date
                    ? new Date(o.result_date).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-4 py-3">{o.added}</td>
                <td className="px-4 py-3">
                  <button
                    className="text-blue-600 underline"
                    onClick={async () => {
                      const res = await axios.get(
                        `${BASE_URL}/admin/offers/${o._id}`,
                        { withCredentials: true }
                      );
                      setSelectedOffer(res.data);
                      setModalOpen(true);
                    }}
                  >
                    {o.shortlisted_students.length}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      o.visibility
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {o.visibility ? "Visible" : "Hidden"}
                  </span>
                </td>
                <td className="px-4 py-3 space-x-2">
                  <button
                    onClick={() => toggleVisibility(o._id, o.visibility)}
                    className="text-amber-600 hover:underline"
                  >
                    Toggle
                  </button>
                  <button
                    onClick={() => deleteOffer(o._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* STUDENT MODAL */}
      {modalOpen && selectedOffer && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[95%] max-w-6xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {selectedOffer.company_name}
            </h2>

            {/* STUDENT FORM */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <input
                className={input}
                placeholder="Student ID (required)"
                value={studentForm.studentId}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, studentId: e.target.value })
                }
              />

              <input
                className={input}
                placeholder="Name"
                value={studentForm.name}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, name: e.target.value })
                }
              />

              <select
                className={input}
                value={studentForm.gender}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, gender: e.target.value })
                }
              >
                <option value="">Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>

              <select
                className={input}
                value={studentForm.degree}
                onChange={(e) =>
                  setStudentForm({
                    ...studentForm,
                    degree: e.target.value,
                    department: "",
                  })
                }
              >
                <option value="">Degree</option>
                {DEGREE_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>

              <select
                className={input}
                disabled={!studentForm.degree}
                value={studentForm.department}
                onChange={(e) =>
                  setStudentForm({
                    ...studentForm,
                    department: e.target.value,
                  })
                }
              >
                <option value="">Department</option>
                {(DEPARTMENT_OPTIONS[studentForm.degree] || []).map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>

              <select
                className={input}
                value={studentForm.category}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, category: e.target.value })
                }
              >
                <option value="">Category</option>
                {JOB_CATEGORY_OPTIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <select
                className={input}
                value={studentForm.job_type}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, job_type: e.target.value })
                }
              >
                <option value="">Job Type</option>
                {JOB_TYPE_OPTIONS.map((j) => (
                  <option key={j}>{j}</option>
                ))}
              </select>

              <input
                className={input}
                placeholder="Job Role"
                value={studentForm.job_role}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, job_role: e.target.value })
                }
              />

              <select
                className={input}
                value={studentForm.intern_duration}
                onChange={(e) =>
                  setStudentForm({
                    ...studentForm,
                    intern_duration: e.target.value,
                  })
                }
              >
                <option value="">Intern Duration</option>
                {INTERNSHIP_DURATION_OPTIONS.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>

              <input
                className={input}
                placeholder="CTC"
                value={studentForm.ctc}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, ctc: e.target.value })
                }
              />

              <input
                className={input}
                placeholder="Stipend"
                value={studentForm.stipend}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, stipend: e.target.value })
                }
              />
            </div>

            <button
              onClick={saveStudent}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded mb-6"
            >
              {editStudentId ? "Update Student" : "Add Student"}
            </button>

            {/* STUDENT TABLE */}
            <table className="w-full border-t text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Gender</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-left">Job Type</th>
                  <th className="px-3 py-2 text-left">Job Role</th>
                  <th className="px-3 py-2 text-left">CTC</th>
                  <th className="px-3 py-2 text-left">Stipend</th>
                  <th className="px-3 py-2 text-left">Intern Duration</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedOffer.shortlisted_students.map((s) => (
                  <tr key={s._id} className="border-t hover:bg-slate-50">
                    <td className="px-3 py-2">{s.name}</td>
                    <td className="px-3 py-2">{s.gender}</td>
                    <td className="px-3 py-2">{s.department}</td>
                    <td className="px-3 py-2">{s.category}</td>
                    <td className="px-3 py-2">{s.job_type}</td>
                    <td className="px-3 py-2">{s.job_role}</td>
                    <td className="px-3 py-2">{s.ctc}</td>
                    <td className="px-3 py-2">{s.stipend}</td>
                    <td className="px-3 py-2">{s.intern_duration}</td>
                    <td className="px-3 py-2 space-x-2">
                      <button
                        onClick={() => editStudent(s)}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
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
