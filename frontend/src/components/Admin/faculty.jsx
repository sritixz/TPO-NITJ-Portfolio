import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonChalkboard } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit, X, ChevronLeft, ChevronRight, Eye, EyeOff, Download, FileSpreadsheet } from "lucide-react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, InputAdornment, IconButton
} from "@mui/material";
import * as XLSX from "xlsx"; 

const FacultyManager = () => {
  // --- 1. State Management ---
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaculties, setSelectedFaculties] = useState([]);
  const [editProfile, setEditProfile] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [filters, setFilters] = useState({ name: '', email: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const facultiesPerPage = 10;

  // Excel Specific States
  const [excelFile, setExcelFile] = useState(null);
  const [excelPreviewData, setExcelPreviewData] = useState([]);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [excelStage, setExcelStage] = useState("idle");
  const [showExcelPreviewModal, setShowExcelPreviewModal] = useState(false);

  // Deletion State
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false,
    type: '', // 'bulk' or 'single'
    facultyId: null,
    confirmationInput: '',
    facultyEmail: ''
  });

  // --- 2. Data Fetching ---
  useEffect(() => { fetchFaculties(); }, []);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/admin/faculties`, { withCredentials: true });
      setFaculties(response.data);
    } catch (error) { 
      toast.error("Failed to fetch faculty members"); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- 3. CRUD Handlers ---
  const handleSave = async () => {
    try {
      const url = editProfile._id 
        ? `${import.meta.env.REACT_APP_BASE_URL}/admin/faculties/${editProfile._id}`
        : `${import.meta.env.REACT_APP_BASE_URL}/admin/faculties`;
      
      const method = editProfile._id ? axios.put : axios.post;
      await method(url, editProfile, { withCredentials: true });
      
      fetchFaculties();
      setOpenEditDialog(false);
      toast.success(editProfile._id ? "Faculty updated successfully" : "Faculty added successfully");
    } catch (error) {
      toast.error(`Failed to ${editProfile?._id ? 'update' : 'add'} faculty`);
    }
  };

  const handleDeleteFaculties = async () => {
    try {
      const idsToDelete = deleteConfirmModal.type === 'bulk' ? selectedFaculties : [deleteConfirmModal.facultyId];
      await axios.delete(`${import.meta.env.REACT_APP_BASE_URL}/admin/faculties`, {
        data: { facultyIds: idsToDelete },
        withCredentials: true
      });
      fetchFaculties();
      setSelectedFaculties([]);
      setDeleteConfirmModal({ ...deleteConfirmModal, isOpen: false });
      toast.success("Faculty deleted successfully");
    } catch (error) {
      toast.error("Failed to delete faculty");
    }
  };

  // --- 4. Excel Handlers ---
  const handleExcelSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
        if (!rows.length) return toast.error("Excel is empty");
        setExcelPreviewData(rows);
        setExcelStage("preview");
        setShowExcelPreviewModal(true);
      } catch { toast.error("Invalid Excel file"); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExcelUpload = async () => {
    try {
      setUploadingExcel(true);
      const formData = new FormData();
      formData.append("file", excelFile);
      const res = await axios.post(`${import.meta.env.REACT_APP_BASE_URL}/admin/faculties/excel/upload-excel`, formData, { withCredentials: true });
      toast.success(`${res.data.insertedCount} faculty added`);
      setShowExcelPreviewModal(false);
      fetchFaculties();
    } catch (err) { toast.error("Upload failed"); } 
    finally { setUploadingExcel(false); }
  };

  // --- 5. Helpers ---
  const openDeleteConfirmModal = (type, facultyId = null) => {
    const faculty = type === 'single' ? faculties.find(f => f._id === facultyId) : null;
    setDeleteConfirmModal({
      isOpen: true, type, facultyId, confirmationInput: '', facultyEmail: faculty ? faculty.email : ''
    });
  };

  const filteredFaculties = faculties.filter(f => 
    (!filters.name || f.name.toLowerCase().includes(filters.name.toLowerCase())) &&
    (!filters.email || f.email.toLowerCase().includes(filters.email.toLowerCase()))
  );

  const currentFaculties = filteredFaculties.slice((currentPage - 1) * facultiesPerPage, currentPage * facultiesPerPage);

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold flex items-center">
          <FontAwesomeIcon icon={faPersonChalkboard} className="mr-3" /> Faculty Management
        </h1>
        <div className="flex space-x-2">
          <button onClick={() => { setEditProfile({ name: '', email: '', password: '' }); setOpenEditDialog(true); }} className="bg-green-500 text-white px-4 py-2 rounded flex items-center">
            <Plus className="mr-2" size={18} /> Add Faculty
          </button>
          <input type="file" accept=".xlsx, .xls" id="excelInput" hidden onChange={handleExcelSelect} />
          <label htmlFor="excelInput" className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer flex items-center">
            <FileSpreadsheet className="mr-2" size={18} /> Select Excel
          </label>
          {selectedFaculties.length > 0 && (
            <button onClick={() => openDeleteConfirmModal('bulk')} className="bg-red-500 text-white px-4 py-2 rounded flex items-center">
              <Trash2 className="mr-2" size={18} /> Delete Selected
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
        <input type="text" placeholder="Search by Name" className="border p-2 rounded" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <input type="text" placeholder="Search by Email" className="border p-2 rounded" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase text-sm">
              <th className="border p-3 w-12 text-center">
                <input type="checkbox" onChange={(e) => setSelectedFaculties(e.target.checked ? currentFaculties.map(f => f._id) : [])} checked={selectedFaculties.length === currentFaculties.length && currentFaculties.length > 0} />
              </th>
              <th className="border p-3 text-left">Name</th>
              <th className="border p-3 text-left">Email</th>
              <th className="border p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentFaculties.map(faculty => (
              <tr key={faculty._id} className="hover:bg-gray-50 border-b">
                <td className="border p-3 text-center">
                  <input type="checkbox" checked={selectedFaculties.includes(faculty._id)} onChange={() => setSelectedFaculties(prev => prev.includes(faculty._id) ? prev.filter(i => i !== faculty._id) : [...prev, faculty._id])} />
                </td>
                <td className="border p-3 font-medium">{faculty.name}</td>
                <td className="border p-3">{faculty.email}</td>
                <td className="border p-3 text-center">
                  <div className="flex justify-center space-x-3">
                    <button onClick={() => { setEditProfile(faculty); setOpenEditDialog(true); }} className="text-blue-500"><Edit size={18} /></button>
                    <button onClick={() => openDeleteConfirmModal('single', faculty._id)} className="text-red-500"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editProfile?._id ? 'EDIT FACULTY' : 'ADD FACULTY'}</DialogTitle>
        <DialogContent className="space-y-4 pt-4">
          <TextField label="Name" fullWidth margin="normal" value={editProfile?.name || ''} onChange={(e) => setEditProfile({...editProfile, name: e.target.value})} />
          <TextField label="Email" fullWidth margin="normal" value={editProfile?.email || ''} onChange={(e) => setEditProfile({...editProfile, email: e.target.value})} />
          <TextField label="Password" type={showPassword ? "text" : "password"} fullWidth margin="normal" value={editProfile?.password || ''} onChange={(e) => setEditProfile({ ...editProfile, password: e.target.value })}
            InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</IconButton></InputAdornment>) }}
            helperText={editProfile?._id ? "Leave blank to keep existing password" : "Required for new faculty"} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>CANCEL</Button>
          <Button onClick={handleSave} color="primary" variant="contained">{editProfile?._id ? 'UPDATE' : 'ADD'}</Button>
        </DialogActions>
      </Dialog>

      {/* Excel Modal */}
      {showExcelPreviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white w-[90%] max-w-6xl max-h-[85vh] rounded-lg shadow-lg flex flex-col">
            <div className="flex justify-between items-center px-4 py-3 border-b">
              <h3 className="text-lg font-semibold">Faculty Excel Preview ({excelPreviewData.length} rows)</h3>
              <button onClick={() => setShowExcelPreviewModal(false)}><X size={22} /></button>
            </div>
            <div className="overflow-auto p-4">
              <table className="w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>{excelPreviewData.length > 0 && Object.keys(excelPreviewData[0]).map(key => <th key={key} className="border px-2 py-1 text-left">{key}</th>)}</tr>
                </thead>
                <tbody>
                  {excelPreviewData.map((row, idx) => (
                    <tr key={idx}>{Object.keys(excelPreviewData[0]).map(key => <td key={key} className="border px-2 py-1">{row[key]}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3 px-4 py-3 border-t">
              <Button onClick={() => setShowExcelPreviewModal(false)}>Cancel</Button>
              <Button variant="contained" color="success" onClick={handleExcelUpload} disabled={uploadingExcel}>{uploadingExcel ? "Uploading..." : "Upload Faculty"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-4 text-gray-600 text-sm">
              {deleteConfirmModal.type === 'bulk' ? `Are you sure you want to delete ${selectedFaculties.length} faculty members?` : `Are you sure you want to delete faculty with email: ${deleteConfirmModal.facultyEmail}?`}
            </p>
            <div className="mb-4">
              <label className="block text-sm mb-1">Type the email to confirm:</label>
              <input type="text" placeholder="Enter email" className="w-full border p-2 rounded text-sm" value={deleteConfirmModal.confirmationInput} onChange={(e) => setDeleteConfirmModal({...deleteConfirmModal, confirmationInput: e.target.value})} />
            </div>
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setDeleteConfirmModal({...deleteConfirmModal, isOpen: false})}>Cancel</Button>
              <Button variant="contained" color="error" disabled={deleteConfirmModal.type === 'single' && deleteConfirmModal.confirmationInput !== deleteConfirmModal.facultyEmail} onClick={handleDeleteFaculties}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyManager;