import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Bell, Plus, Trash2, Edit, X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";

const AlertManager = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const [editAlert, setEditAlert] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    type: "", // 'bulk' or 'single'
    alertId: null,
  });
  const [filters, setFilters] = useState({ title: "", type: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const alertsPerPage = 20;

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.REACT_APP_BASE_URL}/admin/alert`,
        { withCredentials: true }
      );
      setAlerts(response.data.alerts || response.data);
    } catch (error) {
      toast.error("Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const url = editAlert._id
        ? `${import.meta.env.REACT_APP_BASE_URL}/admin/alert/${editAlert._id}`
        : `${import.meta.env.REACT_APP_BASE_URL}/admin/alert`;

      const method = editAlert._id ? axios.put : axios.post;
      const response = await method(url, editAlert, { withCredentials: true });

      toast.success(editAlert._id ? "Alert updated successfully" : "Alert added successfully");
      setOpenEditDialog(false);
      fetchAlerts();
    } catch (error) {
      toast.error(`Failed to ${editAlert._id ? "update" : "create"} alert`);
    }
  };

  const handleDelete = async () => {
    try {
      const idsToDelete =
        deleteConfirm.type === "bulk"
          ? selectedAlerts
          : [deleteConfirm.alertId];

      for (const id of idsToDelete) {
        await axios.delete(
          `${import.meta.env.REACT_APP_BASE_URL}/admin/alert/${id}`,
          { withCredentials: true }
        );
      }

      toast.success("Alert(s) deleted successfully");
      setDeleteConfirm({ open: false, type: "", alertId: null });
      setSelectedAlerts([]);
      fetchAlerts();
    } catch (error) {
      toast.error("Failed to delete alert(s)");
    }
  };

  const openEditModal = (alert = null) => {
    setEditAlert(
      alert || {
        title: "",
        message: "",
        type: "info",
        isActive: false,
        showOnLoad: true,
      }
    );
    setOpenEditDialog(true);
  };

  const filteredAlerts = alerts.filter(
    (a) =>
      (!filters.title ||
        a.title.toLowerCase().includes(filters.title.toLowerCase())) &&
      (!filters.type || a.type === filters.type)
  );

  const indexOfLast = currentPage * alertsPerPage;
  const indexOfFirst = indexOfLast - alertsPerPage;
  const currentAlerts = filteredAlerts.slice(indexOfFirst, indexOfLast);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleExportJSON = () => {
    try {
      const dataToExport = currentAlerts;

      // If no data, export empty array with model structure as template
      const exportData = dataToExport.length > 0 
        ? dataToExport 
        : [
            {
              _id: "",
              title: "",
              message: "",
              type: "info",
              isActive: false,
              showOnLoad: true,
              startDate: new Date().toISOString(),
              endDate: null
            }
          ];

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      link.download = `alerts_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (dataToExport.length === 0) {
        toast.success("Exported empty JSON file with model template");
      } else {
        toast.success(`Exported ${dataToExport.length} alert(s) to JSON`);
      }
    } catch (error) {
      toast.error("Failed to export JSON");
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Delete Confirmation Modal */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Confirm Deletion</h2>
              <button
                onClick={() =>
                  setDeleteConfirm({ open: false, type: "", alertId: null })
                }
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <p className="mb-4">
              {deleteConfirm.type === "bulk"
                ? `Are you sure you want to delete ${selectedAlerts.length} selected alerts?`
                : "Are you sure you want to delete this alert?"}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() =>
                  setDeleteConfirm({ open: false, type: "", alertId: null })
                }
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold flex items-center mb-2 md:mb-0">
          <Bell className="mr-3" />
          Alert Management
        </h1>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <button
            onClick={() => openEditModal()}
            className="bg-green-500 text-white px-4 py-2 rounded flex items-center justify-center"
          >
            <Plus className="mr-2" /> Add Alert
          </button>
          <button
            onClick={handleExportJSON}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center"
          >
            <Download className="mr-2" /> Export JSON
          </button>
          {selectedAlerts.length > 0 && (
            <button
              onClick={() => setDeleteConfirm({ open: true, type: "bulk" })}
              className="bg-red-500 text-white px-4 py-2 rounded flex items-center justify-center"
            >
              <Trash2 className="mr-2" /> Delete Selected
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
        <TextField
          label="Title"
          value={filters.title}
          onChange={(e) => {
            setFilters({ ...filters, title: e.target.value });
            setCurrentPage(1);
          }}
          fullWidth
        />
        <TextField
          label="Type"
          select
          value={filters.type}
          onChange={(e) => {
            setFilters({ ...filters, type: e.target.value });
            setCurrentPage(1);
          }}
          fullWidth
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="info">Info</MenuItem>
          <MenuItem value="success">Success</MenuItem>
          <MenuItem value="warning">Warning</MenuItem>
          <MenuItem value="error">Error</MenuItem>
        </TextField>
      </div>

      {/* Table */}
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
                      checked={selectedAlerts.length === currentAlerts.length}
                      onChange={() =>
                        setSelectedAlerts(
                          selectedAlerts.length === currentAlerts.length
                            ? []
                            : currentAlerts.map((a) => a._id)
                        )
                      }
                    />
                  </th>
                  <th className="border p-2">Title</th>
                  <th className="border p-2">Type</th>
                  <th className="border p-2">Active</th>
                  <th className="border p-2">Show On Load</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentAlerts.map((alert) => (
                  <tr key={alert._id} className="hover:bg-gray-50">
                    <td className="border p-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedAlerts.includes(alert._id)}
                        onChange={() =>
                          setSelectedAlerts((prev) =>
                            prev.includes(alert._id)
                              ? prev.filter((id) => id !== alert._id)
                              : [...prev, alert._id]
                          )
                        }
                      />
                    </td>
                    <td className="border p-2">{alert.title}</td>
                    <td className="border p-2 capitalize">{alert.type}</td>
                    <td className="border p-2 text-center">
                      {alert.isActive ? "✅" : "❌"}
                    </td>
                    <td className="border p-2 text-center">
                      {alert.showOnLoad ? "✅" : "❌"}
                    </td>
                    <td className="border p-2 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(alert)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              open: true,
                              type: "single",
                              alertId: alert._id,
                            })
                          }
                          className="text-red-500 hover:text-red-700"
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
              Showing {indexOfFirst + 1} to{" "}
              {Math.min(indexOfLast, filteredAlerts.length)} of{" "}
              {filteredAlerts.length} alerts
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
                Page {currentPage} of{" "}
                {Math.ceil(filteredAlerts.length / alertsPerPage)}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={
                  currentPage >=
                  Math.ceil(filteredAlerts.length / alertsPerPage)
                }
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editAlert?._id ? "Edit Alert" : "Add Alert"}
        </DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-1 gap-4">
            <TextField
              label="Title"
              value={editAlert?.title || ""}
              onChange={(e) =>
                setEditAlert({ ...editAlert, title: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Message"
              value={editAlert?.message || ""}
              onChange={(e) =>
                setEditAlert({ ...editAlert, message: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
              required
            />
            <TextField
              label="Type"
              select
              value={editAlert?.type || "info"}
              onChange={(e) =>
                setEditAlert({ ...editAlert, type: e.target.value })
              }
              fullWidth
            >
              <MenuItem value="info">Info</MenuItem>
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="error">Error</MenuItem>
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  checked={editAlert?.isActive || false}
                  onChange={(e) =>
                    setEditAlert({ ...editAlert, isActive: e.target.checked })
                  }
                />
              }
              label="Active"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editAlert?.showOnLoad || false}
                  onChange={(e) =>
                    setEditAlert({ ...editAlert, showOnLoad: e.target.checked })
                  }
                />
              }
              label="Show on Load"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            {editAlert?._id ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AlertManager;
