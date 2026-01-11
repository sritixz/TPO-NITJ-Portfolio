import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit, X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";

const DocumentManager = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [editDocument, setEditDocument] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false,
    type: "",
    documentId: null,
    confirmationInput: "",
    documentName: "",
  });
  const [filters, setFilters] = useState({
    document_name: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [file, setFile] = useState(null);
  const documentsPerPage = 10;

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/admin/documents/get`, {
        withCredentials: true,
      });
      setDocuments(Array.isArray(response.data.data) ? response.data.data : []);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch documents");
      setDocuments([]);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const url = editDocument?._id
        ? `${import.meta.env.REACT_APP_BASE_URL}/admin/documents/update/${editDocument._id}`
        : `${import.meta.env.REACT_APP_BASE_URL}/admin/documents/add`;

      const formData = new FormData();
      formData.append("document_name", editDocument.document_name);
      if (file) {
        formData.append("document_file", file);
      } else if (!editDocument?._id) {
        toast.error("PDF file is required for new documents");
        return;
      }

      const method = editDocument?._id ? axios.put : axios.post;

      await method(url, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchDocuments();
      setOpenEditDialog(false);
      setFile(null);
      toast.success(editDocument?._id ? "Document updated successfully" : "Document added successfully");
    } catch (error) {
      toast.error(`Failed to ${editDocument?._id ? "update" : "add"} document`);
    }
  };

  const updateDeleteConfirmation = useCallback((value) => {
    setDeleteConfirmModal((prev) => ({
      ...prev,
      confirmationInput: value,
    }));
  }, []);

  const openDeleteConfirmModal = (type, documentId = null) => {
    const documentToDelete = type === "single" ? documents.find((d) => d._id === documentId) : null;

    setDeleteConfirmModal({
      isOpen: true,
      type,
      documentId,
      confirmationInput: "",
      documentName: documentToDelete ? documentToDelete.document_name : "",
    });
  };

  const handleDeleteDocuments = async () => {
    try {
      const idsToDelete = deleteConfirmModal.type === "bulk" ? selectedDocuments : [deleteConfirmModal.documentId];

      await axios.delete(`${import.meta.env.REACT_APP_BASE_URL}/admin/documents/delete`, {
        data: { documentIds: idsToDelete },
        withCredentials: true,
      });

      setDocuments(documents.filter((doc) => !idsToDelete.includes(doc._id)));
      setSelectedDocuments([]);

      setDeleteConfirmModal((prev) => ({
        ...prev,
        isOpen: false,
        type: "",
        documentId: null,
        confirmationInput: "",
      }));

      toast.success("Documents deleted successfully");
    } catch (error) {
      toast.error("Failed to delete documents");
    }
  };

  const DeleteConfirmationModal = () => {
    if (!deleteConfirmModal.isOpen) return null;

    const documentToDelete = deleteConfirmModal.type === "single" ? documents.find((d) => d._id === deleteConfirmModal.documentId) : null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-96">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Confirm Deletion</h2>
            <button
              onClick={() =>
                setDeleteConfirmModal((prev) => ({
                  ...prev,
                  isOpen: false,
                  type: "",
                  documentId: null,
                  confirmationInput: "",
                }))
              }
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <p className="mb-4">
            {deleteConfirmModal.type === "bulk"
              ? `Are you sure you want to delete ${selectedDocuments.length} selected documents?`
              : `Are you sure you want to delete the document "${documentToDelete?.document_name}"?`}
          </p>

          <div className="mb-4">
            <label className="block mb-2">Type the document name to confirm:</label>
            <input
              type="text"
              value={deleteConfirmModal.confirmationInput}
              onChange={(e) => updateDeleteConfirmation(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Enter document name"
              autoFocus
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() =>
                setDeleteConfirmModal((prev) => ({
                  ...prev,
                  isOpen: false,
                  type: "",
                  documentId: null,
                  confirmationInput: "",
                }))
              }
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteDocuments}
              disabled={deleteConfirmModal.type === "single" ? deleteConfirmModal.confirmationInput !== documentToDelete?.document_name : false}
              className={`
                px-4 py-2 rounded text-white
                ${(deleteConfirmModal.type === "single" ? deleteConfirmModal.confirmationInput !== documentToDelete?.document_name : false)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"}
              `}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleSelectDocument = (documentId) => {
    setSelectedDocuments((prev) => (prev.includes(documentId) ? prev.filter((id) => id !== documentId) : [...prev, documentId]));
  };

  const openEditModal = (document = null) => {
    setEditDocument(
      document || {
        document_name: "",
        document_link: "",
      }
    );
    setFile(null);
    setOpenEditDialog(true);
  };

  const applyFilters = () => {
    if (!Array.isArray(documents)) {
      return [];
    }
    return documents.filter(
      (doc) =>
        !filters.document_name ||
        (doc.document_name && doc.document_name.toLowerCase().includes(filters.document_name.toLowerCase()))
    );
  };

  const filteredDocuments = applyFilters();
  const indexOfLastDocument = currentPage * documentsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
  const currentDocuments = filteredDocuments.slice(indexOfFirstDocument, indexOfLastDocument);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleExportJSON = () => {
    try {
      const dataToExport = applyFilters();

      // If no data, export empty array with model structure as template
      const exportData = dataToExport.length > 0 
        ? dataToExport 
        : [
            {
              _id: "",
              document_name: "",
              document_link: "",
            }
          ];

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      link.download = `documents_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (dataToExport.length === 0) {
        toast.success("Exported empty JSON file with model template");
      } else {
        toast.success(`Exported ${dataToExport.length} document(s) to JSON`);
      }
    } catch (error) {
      toast.error("Failed to export JSON");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <DeleteConfirmationModal />
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold flex items-center mb-2 md:mb-0">
          <FontAwesomeIcon icon={faFileAlt} className="mr-3" />
          Document Management
        </h1>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <button
            onClick={() => openEditModal()}
            className="bg-green-500 text-white px-4 py-2 rounded flex items-center justify-center"
          >
            <Plus className="mr-2" /> Add Document
          </button>
          <button
            onClick={handleExportJSON}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center"
          >
            <Download className="mr-2" /> Export JSON
          </button>
          {selectedDocuments.length > 0 && (
            <button
              onClick={() => openDeleteConfirmModal("bulk")}
              className="bg-red-500 text-white px-4 py-2 rounded flex items-center justify-center"
            >
              <Trash2 className="mr-2" /> Delete Selected
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Document Name"
          value={filters.document_name}
          onChange={(e) => {
            setFilters({ ...filters, document_name: e.target.value });
            setCurrentPage(1);
          }}
          className="border p-2 rounded w-full md:w-1/2"
        />
      </div>

      {/* Document Table */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.length === currentDocuments.length}
                      onChange={() =>
                        setSelectedDocuments(
                          selectedDocuments.length === currentDocuments.length ? [] : currentDocuments.map((doc) => doc._id)
                        )
                      }
                    />
                  </th>
                  <th className="border p-2">Document Name</th>
                  <th className="border p-2">Document</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentDocuments.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50">
                    <td className="border p-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(doc._id)}
                        onChange={() => handleSelectDocument(doc._id)}
                      />
                    </td>
                    <td className="border p-2">{doc.document_name}</td>
                    <td className="border p-2">
                      <a href={`${import.meta.env.REACT_APP_BASE_URL}${doc.document_link}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        View PDF
                      </a>
                    </td>
                    <td className="border p-2">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(doc)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteConfirmModal("single", doc._id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div>
              Showing {indexOfFirstDocument + 1} to {Math.min(indexOfLastDocument, filteredDocuments.length)} of {filteredDocuments.length} documents
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                <ChevronLeft />
              </button>
              <span>
                Page {currentPage} of {Math.ceil(filteredDocuments.length / documentsPerPage)}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage >= Math.ceil(filteredDocuments.length / documentsPerPage)}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Document Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editDocument?._id ? "Edit Document" : "Add Document"}</DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-1 gap-4">
            <TextField
              label="Document Name"
              fullWidth
              margin="normal"
              value={editDocument?.document_name || ""}
              onChange={(e) => setEditDocument({ ...editDocument, document_name: e.target.value })}
              required
            />
            <div className="mt-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                {editDocument?._id ? "Update Document PDF (optional)" : "Upload Document PDF"}
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {editDocument?.document_link && (
                <p className="mt-2 text-sm text-gray-600">
                  Current PDF: <a href={editDocument.document_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Current PDF</a>
                </p>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            {editDocument?._id ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DocumentManager;
