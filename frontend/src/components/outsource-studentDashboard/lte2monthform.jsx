import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FaPlus, FaEye, FaDownload, FaEdit, FaTrash, FaLock } from 'react-icons/fa';
import { Info } from "lucide-react";
import { pdf } from '@react-pdf/renderer';
import LTE2MonthApplicationPDF from './LTE2MonthApplicationPDF';

const LTE2MonthForm = () => {
  const { userData } = useSelector((state) => state.auth);
  const [applications, setApplications] = useState([]);
  const [deadlineInfo, setDeadlineInfo] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingActions, setLoadingActions] = useState(new Set());
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [existingFiles, setExistingFiles] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});
  const [showDocumentsTooltip, setShowDocumentsTooltip] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [formData, setFormData] = useState({
    departmentAppliedFor: '',
    proposedFacultyMember: '',
    proposedFacultyMemberEmail: '',
    proposedFacultyMemberContact: '',
    name: userData?.name || '',
    institution: userData?.college || '',
    course: '',
    presentSemester: '',
    branch: userData?.branch || '',
    postalAddress: '',
    permanentAddress: '',
    mobileNo: userData?.mobile || '',
    email: userData?.email || '',
    fathersName: userData?.fathersName || '',
    gender: userData?.gender || '',
    dateOfBirth: userData?.dob ? new Date(userData.dob).toISOString().split('T')[0] : '',
    nationality: userData?.nationality || '',
    overallCGPA: '',
    declarationAccepted: false,
    educationQualifications: []
  });
  const [files, setFiles] = useState({
    photo: null,
    signature: null,
    documents: null
  });
  const semesterOptions = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
  const genderOptions = ['Male', 'Female'];
  const departments = [
    'Biotechnology',
    'Chemistry',
    'Chemical Engineering',
    'Civil Engineering',
    'Computer Science and Engineering',
    'Electronics and Communication Engineering',
    'Electrical Engineering',
    'Humanities and Management',
    'Industrial and Production Engineering',
    'Information Technology',
    'Instrumentation and Control Engineering',
    'Mathematics and Computing',
    'Mechanical Engineering',
    'Physics',
    'Center for Artificial Intelligence',
    'Center for Continuing Education',
    'Center for Energy and Environment',
    'Sports and Healthcare Research Centre',
    'Skill Development Centre'
  ];
  const baseURL = import.meta.env.REACT_APP_BASE_URL;

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // Fetch deadline status
  useEffect(() => {
    const fetchDeadline = async () => {
      try {
        const response = await axios.get(`${baseURL}/outsource-internships/lte2month/deadline/status`, { withCredentials: true });
        setDeadlineInfo(response.data);
      } catch (error) {
        console.error('Error fetching deadline:', error);
      }
    };
    fetchDeadline();
  }, [baseURL]);

  // Live countdown timer
  useEffect(() => {
    if (!deadlineInfo?.isOpen || !deadlineInfo?.deadline) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    setTimeLeft(getTimeRemaining(deadlineInfo.deadline));
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(deadlineInfo.deadline));
    }, 1000);

    return () => clearInterval(timer);
  }, [deadlineInfo?.deadline, deadlineInfo?.isOpen]);

  // Reset form data
  const resetFormData = () => {
    Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls({});
    setFormData({
      departmentAppliedFor: '',
      proposedFacultyMember: '',
      proposedFacultyMemberEmail: '',
      proposedFacultyMemberContact: '',
      name: userData?.name || '',
      institution: userData?.institution || userData?.college || '',
      course: '',
      presentSemester: '',
      branch: userData?.branch || '',
      postalAddress: '',
      permanentAddress: '',
      mobileNo: userData?.mobile || '',
      email: userData?.email || '',
      fathersName: userData?.fathersName || '',
      gender: userData?.gender || '',
      dateOfBirth: userData?.dob ? new Date(userData.dob).toISOString().split('T')[0] : '',
      nationality: userData?.nationality || '',
      overallCGPA: '',
      declarationAccepted: false,
      educationQualifications: []
    });
    setFiles({
      photo: null,
      signature: null,
      documents: null
    });
    setExistingFiles({});
  };

  // Fetch all applications
  useEffect(() => {
    setLoading(true);
    axios.get(`${baseURL}/outsource-internships/lte2month`, { withCredentials: true })
      .then(response => {
        setApplications(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching applications:', error);
        setLoading(false);
      });
  }, [baseURL]);

  // Updated getTimeRemaining function
  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, closed: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, closed: false };
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('educationQualifications.')) {
      const path = name.split('.');
      const index = parseInt(path[1]);
      const field = path[2];
      setFormData(prev => ({
        ...prev,
        educationQualifications: prev.educationQualifications.map((qual, i) =>
          i === index ? { ...qual, [field]: value } : qual
        )
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Add qualification with auto-assigned next semester
  const addQualification = () => {
    const currentSemNumbers = formData.educationQualifications.map(q => {
      const match = q.semester.match(/Sem (\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    const nextSemNumber = Math.max(0, ...currentSemNumbers) + 1;
    const nextSem = `Sem ${nextSemNumber}`;
    setFormData(prev => ({
      ...prev,
      educationQualifications: [...prev.educationQualifications, { semester: nextSem, yearOfPassing: '', percentageOrSGPA: '' }]
    }));
  };

  // Remove qualification (only the last one)
  const removeQualification = (index) => {
    if (index !== formData.educationQualifications.length - 1) return;
    setFormData(prev => ({
      ...prev,
      educationQualifications: prev.educationQualifications.filter((_, i) => i !== index)
    }));
  };

  // Handle file changes
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Revoke previous URL if exists
      if (previewUrls[type]) {
        URL.revokeObjectURL(previewUrls[type]);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => ({ ...prev, [type]: url }));
    }
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  // Validate form
  const validateForm = () => {
    const stringFields = [
      'departmentAppliedFor', 'proposedFacultyMember', 'proposedFacultyMemberEmail', 'proposedFacultyMemberContact',
      'name', 'institution', 'course', 'presentSemester', 'branch', 'postalAddress', 'permanentAddress',
      'mobileNo', 'email', 'fathersName', 'gender', 'dateOfBirth', 'nationality',
      'overallCGPA'
    ];
    const basicFilled = stringFields.every(key => formData[key].toString().trim() !== '') && formData.declarationAccepted;
    if (!basicFilled) return false;
    // Validate education qualifications
    if (formData.educationQualifications.length === 0) return false;
    for (const qual of formData.educationQualifications) {
      if (qual.semester.trim() === '' || qual.yearOfPassing.trim() === '' || qual.percentageOrSGPA.trim() === '') {
        return false;
      }
    }
    // Check files
    if (!files.photo && !existingFiles.photo) return false;
    if (!files.signature && !existingFiles.signature) return false;
    if (!files.documents && !existingFiles.documents) return false;
    return true;
  };

  // Show toast
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };

  // Submit or update application
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fill out all the fields and upload required files before submitting! 😎', 'error');
      return;
    }
    setIsSubmitting(true);
    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'educationQualifications') {
        value.forEach((qual, index) => {
          submitData.append(`${key}[${index}][semester]`, qual.semester);
          submitData.append(`${key}[${index}][yearOfPassing]`, qual.yearOfPassing);
          submitData.append(`${key}[${index}][percentageOrSGPA]`, qual.percentageOrSGPA);
        });
      } else {
        submitData.append(key, value);
      }
    });
    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        submitData.append(key, file);
      }
    });
    const url = editingId ? `/outsource-internships/lte2month/${editingId}` : `/outsource-internships/lte2month`;
    const method = editingId ? axios.put : axios.post;
    try {
      const response = await method(`${baseURL}${url}`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      if (editingId) {
        setApplications(applications.map(app => app._id === editingId ? { ...app, ...formData } : app));
        setEditingId(null);
      } else {
        setApplications([...applications, response.data]);
      }
      resetFormData();
      setShowForm(false);
      showToast('Application submitted successfully!', 'success');
    } catch (error) {
      console.error('Error submitting application:', error);
      const backendMessage = error?.response?.data?.message;
      showToast(backendMessage || 'Oops! Something went wrong. Try again later! 😅', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (app) => {
    const formattedDateOfBirth = app.dateOfBirth ? (typeof app.dateOfBirth === 'string' && !isNaN(Date.parse(app.dateOfBirth)) 
      ? new Date(app.dateOfBirth).toISOString().split('T')[0] 
      : app.dateOfBirth) : '';
    setFormData({
      ...app,
      dateOfBirth: formattedDateOfBirth,
      proposedFacultyMemberEmail: app.proposedFacultyMemberEmail || '',
      proposedFacultyMemberContact: app.proposedFacultyMemberContact || '',
      educationQualifications: app.educationQualifications || []
    });
    setExistingFiles({
      photo: app.photo || null,
      signature: app.signature || null,
      documents: app.documents || null
    });
    Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls({});
    setFiles({
      photo: null,
      signature: null,
      documents: null
    });
    setEditingId(app._id);
    setShowForm(true);
  };

  // Confirmation modal action performer
  const performConfirmAction = useCallback(async () => {
    if (confirmAction === 'delete' && confirmId) {
      const deleteKey = `delete-${confirmId}`;
      setLoadingActions(prev => new Set([...prev, deleteKey]));
      try {
        await axios.delete(`${baseURL}/outsource-internships/lte2month/${confirmId}`, { withCredentials: true });
        setApplications(prev => prev.filter(a => a._id !== confirmId));
        showToast('Application deleted successfully!', 'success');
      } catch (error) {
        console.error('Error deleting application:', error);
        showToast('Failed to delete application. Try again!', 'error');
      } finally {
        setLoadingActions(prev => {
          const newSet = new Set(prev);
          newSet.delete(deleteKey);
          return newSet;
        });
      }
    } else if (confirmAction === 'lock' && confirmId) {
      const lockKey = `lock-${confirmId}`;
      setLoadingActions(prev => new Set([...prev, lockKey]));
      try {
        const app = applications.find(a => a._id === confirmId);
        if (!app) {
          throw new Error('Application not found');
        }
        const photoUrl = app.photo ? `${baseURL}/${app.photo}` : null;
        const signatureUrl = app.signature ? `${baseURL}/${app.signature}` : null;
        const appWithImages = {
          ...app,
          photo: photoUrl,
          signature: signatureUrl
        };
        const doc = <LTE2MonthApplicationPDF application={appWithImages} baseURL={baseURL} />;
        const blob = await pdf(doc).toBlob();
        const filename = `LTE2Month_Application_${app._id.slice(-6)}.pdf`;
        const pdfFile = new File([blob], filename, { type: 'application/pdf' });
        const submitData = new FormData();
        submitData.append('pdf', pdfFile);
        await axios.put(`${baseURL}/outsource-internships/lte2month/lock/${confirmId}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
        setApplications(prev => prev.map(a => a._id === confirmId ? { ...a, locked: true } : a));
        showToast('Application Locked successfully!', 'success');
      } catch (error) {
        console.error('Error locking application:', error);
        showToast('Failed to lock application. Try again!', 'error');
      } finally {
        setLoadingActions(prev => {
          const newSet = new Set(prev);
          newSet.delete(lockKey);
          return newSet;
        });
      }
    }
  }, [confirmAction, confirmId, applications, baseURL]);

  // Handle delete
  const handleDelete = (id) => {
    setConfirmAction('delete');
    setConfirmId(id);
    setShowConfirm(true);
  };

  // Handle lock
  const handleLock = (id) => {
    setConfirmAction('lock');
    setConfirmId(id);
    setShowConfirm(true);
  };

  // Updated handleDownload function
  const handleDownload = async (app) => {
    const downloadKey = `download-${app._id}`;
    setLoadingActions(prev => new Set([...prev, downloadKey]));
    try {
      console.log('Starting download for app:', app._id);
      console.log('baseURL:', baseURL); // Debug: Ensure baseURL is defined/correct
      
      const photoUrl = app.photo ? `${baseURL}/${app.photo}` : null;
      const signatureUrl = app.signature ? `${baseURL}/${app.signature}` : null;
      
      console.log('photoUrl:', photoUrl); // Debug
      console.log('signatureUrl:', signatureUrl); // Debug
      
      const appWithImages = {
        ...app,
        photo: photoUrl,
        signature: signatureUrl
      };
      const doc = <LTE2MonthApplicationPDF application={appWithImages} baseURL={baseURL} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LTE2Month_Application_${app._id.slice(-6)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('PDF downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Failed to download PDF. Try again!', 'error');
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(downloadKey);
        return newSet;
      });
    }
  };

  // Handle preview (simple view, no modal for now)
  const handlePreview = (app) => {
    setSelectedApp(app);
    // Could open a modal here similar to NOCPreview
    console.log('Preview:', app); // Placeholder
  };

  const renderApplicationList = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold flex items-center space-x-3 text-gray-900">
          <span>Summer / Winter <span className="text-custom-blue">Internship</span> Application</span>
        </h2>
        <div className="flex items-center gap-4 flex-1 justify-end">
          {deadlineInfo && (
            <div className="text-sm">
              {deadlineInfo.isOpen ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Closes in:</span>
                  <div className="flex gap-2">
                    {['days', 'hours', 'minutes', 'seconds'].map((unit) => {
                      const value = timeLeft[unit];
                      const isCritical = timeLeft.days === 0; // Less than 1 day
                      return (
                        <div
                          key={unit}
                          className={`flex flex-col items-center min-w-12 px-2 py-1 rounded-md font-mono text-sm font-bold border ${
                            isCritical
                              ? 'bg-red-100 text-red-700 border-red-300'
                              : 'bg-custom-blue/10 text-custom-blue border-custom-blue/30'
                          }`}
                        >
                          <span className="text-lg">{String(value).padStart(2, '0')}</span>
                          <span className="text-xs uppercase opacity-80">
                            {unit.slice(0, unit === 'days' ? 4 : 3)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <span className="text-red-500 font-medium">Application Closed</span>
              )}
            </div>
          )}
          <button
            onClick={() => {
              if (!deadlineInfo?.isOpen) return;
              setShowForm(true);
              resetFormData();
            }}
            disabled={!deadlineInfo?.isOpen}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-md transition duration-300 ${
              !deadlineInfo?.isOpen
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-custom-blue text-white hover:from-blue-600 hover:to-indigo-600'
            }`}
          >
            <FaPlus />
            <span>{!deadlineInfo?.isOpen ? 'Application Closed' : 'Apply Now'}</span>
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : applications.length === 0 ? (
        <p className="text-gray-600 italic">No applications available.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => {
            const isLocked = app.locked || false;
            const deleteKey = `delete-${app._id}`;
            const lockKey = `lock-${app._id}`;
            const downloadKey = `download-${app._id}`;
            return (
              <div
                key={app._id}
                className="p-6 bg-white rounded-xl shadow-lg cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-semibold text-gray-900">Faculty: <span className='text-gray-500'>{app.proposedFacultyMember}</span></p>
                  <span
  className={`text-sm font-medium px-2 py-1 rounded-full ${
    app.status === 'pending'
      ? 'bg-yellow-100 text-yellow-800'
      : app.status === 'approved'
      ? 'bg-green-100 text-green-800'
      : app.status === 'rejected'
      ? 'bg-red-100 text-red-800'
      : 'bg-gray-100 text-gray-800'
  }`}
>
  {app.status}
</span>

                </div>
                    <p className="text-xs font-semibold text-gray-900">Department: <span className='text-gray-500'>{app.departmentAppliedFor}</span></p>
                {/* <p className="bg-custom-blue/10 rounded-lg p-1 text-custom-blue text-xs font-semibold inline-block"># {app._id.slice(-6)}</p> */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {!isLocked && (
                    <button
                      onClick={() => handleEdit(app)}
                      className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </button>
                  )}
                  {/* <button
                    onClick={() => handlePreview(app)}
                    className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
                  >
                    <FaEye />
                    <span>Preview</span>
                  </button> */}
                  {!isLocked ? (
                    <>
                      <button
                        onClick={() => handleLock(app._id)}
                        disabled={loadingActions.has(lockKey)}
                        className={`flex items-center space-x-1 text-sm px-3 py-1 rounded-md border transition duration-300 ${
                          loadingActions.has(lockKey)
                            ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                            : 'text-custom-blue hover:text-white border-custom-blue hover:bg-custom-blue'
                        }`}
                      >
                        <FaLock />
                        <span>{loadingActions.has(lockKey) ? 'Locking...' : 'Lock'}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(app._id)}
                        disabled={loadingActions.has(deleteKey)}
                        className={`flex items-center space-x-1 text-sm px-3 py-1 rounded-md border transition duration-300 ${
                          loadingActions.has(deleteKey)
                            ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                            : 'text-red-500 hover:text-white border-red-500 hover:bg-red-500'
                        }`}
                      >
                        <FaTrash />
                        <span>{loadingActions.has(deleteKey) ? 'Deleting...' : 'Delete'}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleDownload(app)}
                      disabled={loadingActions.has(downloadKey)}
                      className={`flex items-center space-x-1 text-sm px-3 py-1 rounded-md border transition duration-300 ${
                        loadingActions.has(downloadKey)
                          ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                          : 'text-green-600 hover:text-white border-green-600 hover:bg-green-600'
                      }`}
                    >
                      <FaDownload />
                      <span>{loadingActions.has(downloadKey) ? 'Downloading...' : 'Download PDF'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderFilePreview = (type) => (
    previewUrls[type] && (
      <div className="mt-1">
        {type === 'photo' || type === 'signature' ? (
          <img
            src={previewUrls[type]}
            alt={`${type} Preview`}
            className="max-w-48 max-h-24 object-contain border rounded"
          />
        ) : (
          <a
            href={previewUrls[type]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline text-sm hover:text-blue-700"
          >
            View Selected File
          </a>
        )}
      </div>
    )
  );

  // Confirmation Modal
  const renderConfirmModal = () => (
    showConfirm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm {confirmAction === 'delete' ? 'Delete' : 'Lock'} Application
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to {confirmAction} this application? This action cannot be undone and will {confirmAction === 'delete' ? 'permanently remove' : 'finalize'} your submission.
            </p>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmAction(null);
                  setConfirmId(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  performConfirmAction();
                  setShowConfirm(false);
                  setConfirmAction(null);
                  setConfirmId(null);
                }}
                className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition duration-200"
              >
                {confirmAction === 'delete' ? 'Delete' : 'Lock'} Application
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="container mx-auto p-6 min-h-screen">
      {toast.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg animate-fade-in-out z-[1000] ${
          toast.type === 'error' ? 'bg-white border border-red-500 text-red-500' :
          toast.type === 'success' ? 'bg-white border border-green-500 text-green-500' :
          'bg-white border border-blue-500 text-blue-500'
        }`}>
          {toast.message}
        </div>
      )}
      {renderConfirmModal()}
      {!showForm ? (
        renderApplicationList()
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-8 mb-8 border border-gray-200 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">Apply for <span className='text-custom-blue'>Outsource Internship</span></h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                resetFormData();
              }}
              className="text-gray-600 hover:text-gray-800 text-xl font-bold"
            >
              ×
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Department Applied For <span className="text-red-500">*</span>
                </label>
                <select
                  name="departmentAppliedFor"
                  value={formData.departmentAppliedFor}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="" disabled hidden>Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Name of Proposed Faculty Member (if any) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="proposedFacultyMember"
                  value={formData.proposedFacultyMember}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Email of Proposed Faculty Member <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="proposedFacultyMemberEmail"
                  value={formData.proposedFacultyMemberEmail}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Contact of Proposed Faculty Member <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="proposedFacultyMemberContact"
                  value={formData.proposedFacultyMemberContact}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Name of the Applicant <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Applicant's Institution/University <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Course <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  placeholder="e.g., B.Tech"
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Present Semester <span className="text-red-500">*</span>
                </label>
                <select
                  name="presentSemester"
                  value={formData.presentSemester}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="" disabled hidden>Select Semester</option>
                  {semesterOptions.map(sem => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Branch/Specialization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Nationality <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
          
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Mobile No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Email<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Father's Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fathersName"
                  value={formData.fathersName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="" disabled hidden>Select Gender</option>
                  {genderOptions.map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Overall % or CGPA <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="overallCGPA"
                  value={formData.overallCGPA}
                  onChange={handleInputChange}
                  placeholder="e.g., 8.5 or 85%"
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
               <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Postal Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="postalAddress"
                    value={formData.postalAddress}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Permanent Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 p-6 border-2 border-blue-100 rounded-lg">
              <h4 className="text-lg font-semibold mb-4">Education Qualification Details <span className="text-red-500">*</span></h4>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">Add your completed semesters below.</span>
                <button
                  type="button"
                  onClick={addQualification}
                  className="flex items-center space-x-1 px-3 py-1 bg-custom-blue text-white text-sm rounded-md hover:bg-blue-600 transition duration-300"
                >
                  <FaPlus />
                  <span>Add Sem Entry</span>
                </button>
              </div>
              {formData.educationQualifications.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No semester entries added yet. Click "Add Sem Entry" to start.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Semester</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Year of Passing</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">% of Marks / SGPA</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 w-16">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.educationQualifications.map((qual, index) => (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="px-4 py-2 text-sm text-gray-900 font-medium">{qual.semester}</td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              name={`educationQualifications.${index}.yearOfPassing`}
                              value={qual.yearOfPassing}
                              onChange={handleInputChange}
                              className="w-full p-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              name={`educationQualifications.${index}.percentageOrSGPA`}
                              value={qual.percentageOrSGPA}
                              onChange={handleInputChange}
                              className="w-full p-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </td>
                          <td className="px-4 py-2">
                            {index === formData.educationQualifications.length - 1 && (
                              <button
                                type="button"
                                onClick={() => removeQualification(index)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4">Upload Documents <span className="text-red-500">*</span></h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Photograph</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'photo')}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {files.photo && <p className="text-sm text-green-600 mt-1">Selected: {files.photo.name}</p>}
                  {renderFilePreview('photo')}
                  {existingFiles.photo && !files.photo && (
                    <p className="text-sm text-blue-600 mt-1">
                      <a href={`${baseURL}/${existingFiles.photo}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">
                        View Current
                      </a>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Signature</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'signature')}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {files.signature && <p className="text-sm text-green-600 mt-1">Selected: {files.signature.name}</p>}
                  {renderFilePreview('signature')}
                  {existingFiles.signature && !files.signature && (
                    <p className="text-sm text-blue-600 mt-1">
                      <a href={`${baseURL}/${existingFiles.signature}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">
                        View Current
                      </a>
                    </p>
                  )}
                </div>
                <div className="relative">
                  <label className="flex items-center text-sm font-medium text-gray-600 cursor-pointer">
                    Documents (Combined PDF, max 5MB)
                    <Info
                      className="ml-2 h-4 w-4 text-blue-500 cursor-pointer"
                      onClick={() => setShowDocumentsTooltip(!showDocumentsTooltip)}
                    />
                  </label>
                  {showDocumentsTooltip && (
                    <ul className="absolute top-full left-0 mt-1 z-10 bg-white border border-gray-200 rounded-md shadow-lg p-3 w-64 text-xs text-gray-700 space-y-1 list-disc list-inside">
                      <li>10th & 12th marksheets</li>
                      <li>Current UG marksheets</li>
                      <li>NOC signed by Head of Department/Principal/Dean</li>
                      <li>Academic Record (Transcripts) for foreign students</li>
                      <li>Payment slip</li>
                    </ul>
                  )}
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleFileChange(e, 'documents')}
                    className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {files.documents && <p className="text-sm text-green-600 mt-1">Selected: {files.documents.name}</p>}
                  {renderFilePreview('documents')}
                  {existingFiles.documents && !files.documents && (
                    <p className="text-sm text-blue-600 mt-1">
                      <a href={`${baseURL}/${existingFiles.documents}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">
                        View Current
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-semibold mb-4">Declaration <span className="text-red-500">*</span></h4>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="declaration"
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.declarationAccepted}
                  onChange={(e) => setFormData(prev => ({ ...prev, declarationAccepted: e.target.checked }))}
                />
                <label htmlFor="declaration" className="ml-2 text-sm leading-relaxed">
                  I hereby declare that the statement made in this application are true, complete and correct to the best of my knowledge and belief. I also ensure that during the internship I will follow
the institute rules and regulations. Consent of my parents for pursuing the Internship/Thesis work at Dr. B.R.
Ambedkar NIT Jalandhar is already taken by me. I understand that if any false information is found or if any required document is not uploaded, my internship application can be canceled at any time.
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !validateForm()}
              className={`w-full p-3 rounded-md transition duration-300 ${
                isSubmitting || !validateForm()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-custom-blue text-white hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Submitting...' : editingId ? 'Update Application' : 'Submit Application'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LTE2MonthForm;