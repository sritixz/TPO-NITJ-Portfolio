// components/admin/PlacementRegistrationAdmin.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import { Download } from "lucide-react";
import toast from "react-hot-toast";

const baseURL = import.meta.env.REACT_APP_BASE_URL;

const defaultForm = {
  name: "",
  rollno: "",
  department: "",
  course: "",
  batch: "",
  fatherName: "",
  motherName: "",
  category: "",
  gender: "",
  dateOfBirth: "",
  physicallyDisabled: false,
  disabilityType: "",
  permanentAddress: "",
  mobileNo: "",
  emailNitj: "",
  emailPersonal: "",
  aadharCardNo: "",
  interested: false,
  description: "",
  studentId: "",
  // new fields
  preferredSector: "",
  privateType: "",
  trainingRequired: false,
  trainingPlatform: "",
};

const PlacementRegistrationAdmin = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/admin/placement-registration/`, {
        withCredentials: true,
      });
      // support both { data: [...] } and direct array
      const data = response.data?.data ?? response.data;
      setRegistrations(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch registrations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleEdit = (registration) => {
    setEditingId(registration._id);
    setFormData({
      name: registration.name || "",
      rollno: registration.rollno || "",
      department: registration.department || "",
      course: registration.course || "",
      batch: registration.batch || "",
      fatherName: registration.fatherName || "",
      motherName: registration.motherName || "",
      category: registration.category || "",
      gender: registration.gender || "",
      dateOfBirth: registration.dateOfBirth
        ? new Date(registration.dateOfBirth).toISOString().split("T")[0]
        : "",
      physicallyDisabled: Boolean(registration.physicallyDisabled),
      disabilityType: registration.disabilityType || "",
      permanentAddress: registration.permanentAddress || "",
      mobileNo: registration.mobileNo || "",
      emailNitj: registration.emailNitj || "",
      emailPersonal: registration.emailPersonal || "",
      aadharCardNo: registration.aadharCardNo || "",
      interested: Boolean(registration.interested),
      description: registration.description || "",
      studentId: registration.studentId?._id || registration.studentId || "",
      // new fields
      preferredSector: registration.preferredSector || "",
      privateType: registration.privateType || "",
      trainingRequired:
        registration.trainingRequired === true || registration.trainingRequired === "true",
      trainingPlatform: registration.trainingPlatform || "",
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this registration?")) return;
    try {
      await axios.delete(`${baseURL}/admin/placement-registration/${id}`, {
        withCredentials: true,
      });
      toast.success("Deleted registration");
      fetchRegistrations();
    } catch (err) {
      toast.error("Failed to delete registration");
      console.error(err);
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData(defaultForm);
    setFormError(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingId(null);
    setFormError(null);
    setFormData(defaultForm);
    fetchRegistrations();
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    // Prepare payload: convert date string to ISO or undefined
    const payload = {
      ...formData,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : undefined,
    };

    try {
      if (editingId) {
        await axios.put(
          `${baseURL}/admin/placement-registration/${editingId}`,
          payload,
          { withCredentials: true }
        );
        toast.success("Registration updated");
      } else {
        await axios.post(`${baseURL}/admin/placement-registration/`, payload, {
          withCredentials: true,
        });
        toast.success("Registration created");
      }
      handleFormClose();
    } catch (err) {
      console.error(err);
      setFormError("Failed to save registration");
      toast.error("Failed to save registration");
    } finally {
      setFormLoading(false);
    }
  };

  const handleExportJSON = () => {
    try {
      const dataToExport = registrations;

      const exportData = dataToExport.length > 0
        ? dataToExport
        : [
            {
              _id: "",
              studentId: "",
              name: "",
              rollno: "",
              department: "",
              course: "",
              batch: "",
              fatherName: "",
              motherName: "",
              category: "",
              gender: "",
              dateOfBirth: "",
              physicallyDisabled: false,
              disabilityType: "",
              permanentAddress: "",
              mobileNo: "",
              emailNitj: "",
              emailPersonal: "",
              aadharCardNo: "",
              interested: true,
              description: "",
              preferredSector: "",
              privateType: "",
              trainingRequired: false,
              trainingPlatform: "",
            },
          ];

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
      link.download = `placement_registrations_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (dataToExport.length === 0) {
        toast.success("Exported empty JSON file with model template");
      } else {
        toast.success(`Exported ${dataToExport.length} placement registration(s) to JSON`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to export JSON");
    }
  };

  if (loading) return <div className="p-5 text-center">Loading...</div>;
  if (error) return <div className="p-5 text-red-500">Error: {error}</div>;

  return (
    <div className="p-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5">
        <h2 className="text-2xl font-bold">Placement Registrations</h2>
        <div className="flex gap-2">
          <button
            onClick={handleAddNew}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
          >
            <FaPlus /> Add New Registration
          </button>
          <button
            onClick={handleExportJSON}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center"
          >
            <Download className="mr-2" /> Export JSON
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">DOB</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Physically Disabled</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Disability Type</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">NITJ Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Personal Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aadhaar</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Interested</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Preferred Sector</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Private Type</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Training Req</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Training Platform</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {registrations.map((reg) => (
              <tr key={reg._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-900">{reg.name}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{reg.rollno}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{reg.department}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{reg.course}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{reg.batch}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{reg.gender}</td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {reg.dateOfBirth ? new Date(reg.dateOfBirth).toLocaleDateString() : ""}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">{reg.physicallyDisabled ? "Yes" : "No"}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{reg.disabilityType || ""}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{reg.mobileNo}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{reg.emailNitj}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{reg.emailPersonal}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{reg.aadharCardNo}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{reg.interested ? "Yes" : "No"}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{reg.preferredSector || ""}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{reg.privateType || ""}</td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {reg.trainingRequired === true || reg.trainingRequired === "true" ? "Yes" : "No"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">{reg.trainingPlatform || ""}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(reg)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white p-1 rounded"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(reg._id)}
                      className="bg-red-500 hover:bg-red-700 text-white p-1 rounded"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold">{editingId ? "Edit Registration" : "Add New Registration"}</h3>
              <button onClick={handleFormClose} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6">
              {formError && <div className="text-red-500 mb-4">{formError}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input name="name" placeholder="Name" value={formData.name} onChange={handleFormChange} className="p-2 border rounded" required />
                <input name="rollno" placeholder="Roll No" value={formData.rollno} onChange={handleFormChange} className="p-2 border rounded" required />
                <input name="department" placeholder="Department" value={formData.department} onChange={handleFormChange} className="p-2 border rounded" required />
                <input name="course" placeholder="Course" value={formData.course} onChange={handleFormChange} className="p-2 border rounded" required />
                <input name="batch" placeholder="Batch" value={formData.batch} onChange={handleFormChange} className="p-2 border rounded" required />
                <input name="fatherName" placeholder="Father's Name" value={formData.fatherName} onChange={handleFormChange} className="p-2 border rounded" />
                <input name="motherName" placeholder="Mother's Name" value={formData.motherName} onChange={handleFormChange} className="p-2 border rounded" />
                <input name="category" placeholder="Category" value={formData.category} onChange={handleFormChange} className="p-2 border rounded" />
                <select name="gender" value={formData.gender} onChange={handleFormChange} className="p-2 border rounded" required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleFormChange} className="p-2 border rounded" />
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="physicallyDisabled" checked={formData.physicallyDisabled} onChange={handleFormChange} />
                  <span className="text-sm">Physically Disabled</span>
                </label>
                <input name="disabilityType" placeholder="Disability Type" value={formData.disabilityType} onChange={handleFormChange} className="p-2 border rounded" />

                <textarea name="permanentAddress" placeholder="Permanent Address" value={formData.permanentAddress} onChange={handleFormChange} rows={3} className="p-2 border rounded col-span-full" />
                <input name="mobileNo" placeholder="Mobile No" value={formData.mobileNo} onChange={handleFormChange} className="p-2 border rounded" />
                <input name="emailNitj" type="email" placeholder="NITJ Email" value={formData.emailNitj} onChange={handleFormChange} className="p-2 border rounded" />
                <input name="emailPersonal" type="email" placeholder="Personal Email" value={formData.emailPersonal} onChange={handleFormChange} className="p-2 border rounded" />
                <input name="aadharCardNo" placeholder="Aadhaar Card No" value={formData.aadharCardNo} onChange={handleFormChange} className="p-2 border rounded" />
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="interested" checked={formData.interested} onChange={handleFormChange} />
                  <span className="text-sm">Interested</span>
                </label>

                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleFormChange} rows={3} className="p-2 border rounded col-span-full" />

                <input name="studentId" placeholder="Student ID" value={formData.studentId} onChange={handleFormChange} className="p-2 border rounded" />

                {/* NEW FIELDS */}
                <div className="col-span-full md:col-span-1">
                  <label className="block text-sm mb-1">Preferred Sector</label>
                  <select name="preferredSector" value={formData.preferredSector} onChange={handleFormChange} className="p-2 border rounded w-full">
                    <option value="">Select sector</option>
                    <option value="PSU">PSU</option>
                    <option value="Private">Private</option>
                  </select>
                </div>

                {formData.preferredSector === "Private" && (
                  <div>
                    <label className="block text-sm mb-1">Private Type</label>
                    <select name="privateType" value={formData.privateType} onChange={handleFormChange} className="p-2 border rounded w-full">
                      <option value="">Select type</option>
                      <option value="Tech">Tech</option>
                      <option value="Non-Tech">Non-Tech</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="trainingRequired" checked={formData.trainingRequired} onChange={handleFormChange} />
                    <span className="text-sm">Training Required</span>
                  </label>
                </div>

                {formData.trainingRequired && (
                  <input
                    name="trainingPlatform"
                    placeholder="Training Platform (Coursera, NPTEL ...)"
                    value={formData.trainingPlatform}
                    onChange={handleFormChange}
                    className="p-2 border rounded col-span-full"
                  />
                )}
              </div>

              <button type="submit" disabled={formLoading} className="mt-6 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full disabled:opacity-50">
                {formLoading ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementRegistrationAdmin;
