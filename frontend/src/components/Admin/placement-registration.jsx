// components/admin/PlacementRegistrationAdmin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa'; // Assuming react-icons is installed

const baseURL = import.meta.env.REACT_APP_BASE_URL;

const PlacementRegistrationAdmin = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    rollno: '',
    department: '',
    course: '',
    batch: '',
    fatherName: '',
    motherName: '',
    category: '',
    gender: '',
    dateOfBirth: '',
    physicallyDisabled: false,
    disabilityType: '',
    permanentAddress: '',
    mobileNo: '',
    emailNitj: '',
    emailPersonal: '',
    aadharCardNo: '',
    interested: false,
    description: '',
    studentId: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Fetch all registrations
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/admin/placement-registration/`, { withCredentials: true });
      setRegistrations(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch registrations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Handle edit
  const handleEdit = (registration) => {
    setEditingId(registration._id);
    setFormData({
      ...registration,
      dateOfBirth: registration.dateOfBirth ? new Date(registration.dateOfBirth).toISOString().split('T')[0] : '',
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) return;
    try {
      await axios.delete(`${baseURL}/admin/placement-registration/${id}`, { withCredentials: true });
      fetchRegistrations(); // Refresh list
    } catch (err) {
      alert('Failed to delete registration');
      console.error(err);
    }
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      name: '',
      rollno: '',
      department: '',
      course: '',
      batch: '',
      fatherName: '',
      motherName: '',
      category: '',
      gender: '',
      dateOfBirth: '',
      physicallyDisabled: false,
      disabilityType: '',
      permanentAddress: '',
      mobileNo: '',
      emailNitj: '',
      emailPersonal: '',
      aadharCardNo: '',
      interested: false,
      description: '',
      studentId: '',
    });
    setShowForm(true);
  };

  // Handle form close and refresh
  const handleFormClose = () => {
    setShowForm(false);
    setEditingId(null);
    setEditingData(null);
    setFormError(null);
    fetchRegistrations();
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      if (editingId) {
        await axios.put(`${baseURL}/admin/placement-registration/${editingId}`, formData, { withCredentials: true });
      } else {
        await axios.post(`${baseURL}/admin/placement-registration/`, formData, { withCredentials: true });
      }
      handleFormClose();
    } catch (err) {
      setFormError('Failed to save registration');
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <div className="p-5 text-center">Loading...</div>;
  if (error) return <div className="p-5 text-red-500">Error: {error}</div>;

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">Placement Registrations</h2>
        <button
          onClick={handleAddNew}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
        >
          <FaPlus /> Add New Registration
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Father's Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mother's Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Physically Disabled</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disability Type</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permanent Address</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile No</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NITJ Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personal Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aadhaar No</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interested</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {registrations.map((reg) => (
              <tr key={reg._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{reg.name}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{reg.rollno}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{reg.department}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{reg.course}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{reg.batch}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{reg.fatherName}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{reg.motherName}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{reg.category}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{reg.gender}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                  {reg.dateOfBirth ? new Date(reg.dateOfBirth).toLocaleDateString() : ''}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{reg.physicallyDisabled ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{reg.disabilityType}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{reg.permanentAddress}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{reg.mobileNo}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{reg.emailNitj}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{reg.emailPersonal}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{reg.aadharCardNo}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{reg.interested ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{reg.description}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{reg.studentId?._id || reg.studentId}</td>
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
              <h3 className="text-xl font-semibold">
                {editingId ? 'Edit Registration' : 'Add New Registration'}
              </h3>
              <button onClick={handleFormClose} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6">
              {formError && <div className="text-red-500 mb-4">{formError}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  name="rollno"
                  placeholder="Roll No"
                  value={formData.rollno}
                  onChange={handleFormChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  name="department"
                  placeholder="Department"
                  value={formData.department}
                  onChange={handleFormChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  name="course"
                  placeholder="Course"
                  value={formData.course}
                  onChange={handleFormChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  name="batch"
                  placeholder="Batch"
                  value={formData.batch}
                  onChange={handleFormChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  name="fatherName"
                  placeholder="Father's Name"
                  value={formData.fatherName}
                  onChange={handleFormChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  name="motherName"
                  placeholder="Mother's Name"
                  value={formData.motherName}
                  onChange={handleFormChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  name="category"
                  placeholder="Category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleFormChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleFormChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <label className="flex items-center gap-2 col-span-full md:col-span-1">
                  <input
                    type="checkbox"
                    name="physicallyDisabled"
                    checked={formData.physicallyDisabled}
                    onChange={handleFormChange}
                    className="rounded"
                  />
                  <span className="text-sm">Physically Disabled</span>
                </label>
                <input
                  name="disabilityType"
                  placeholder="Disability Type"
                  value={formData.disabilityType}
                  onChange={handleFormChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  name="permanentAddress"
                  placeholder="Permanent Address"
                  value={formData.permanentAddress}
                  onChange={handleFormChange}
                  rows={3}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-full"
                  required
                />
                <input
                  name="mobileNo"
                  placeholder="Mobile No"
                  value={formData.mobileNo}
                  onChange={handleFormChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  name="emailNitj"
                  type="email"
                  placeholder="NITJ Email"
                  value={formData.emailNitj}
                  onChange={handleFormChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  name="emailPersonal"
                  type="email"
                  placeholder="Personal Email"
                  value={formData.emailPersonal}
                  onChange={handleFormChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  name="aadharCardNo"
                  placeholder="Aadhaar Card No"
                  value={formData.aadharCardNo}
                  onChange={handleFormChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <label className="flex items-center gap-2 col-span-full md:col-span-1">
                  <input
                    type="checkbox"
                    name="interested"
                    checked={formData.interested}
                    onChange={handleFormChange}
                    className="rounded"
                  />
                  <span className="text-sm">Interested</span>
                </label>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-full"
                />
                <input
                  name="studentId"
                  placeholder="Student ID"
                  value={formData.studentId}
                  onChange={handleFormChange}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={formLoading}
                className="mt-6 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full disabled:opacity-50"
              >
                {formLoading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementRegistrationAdmin;