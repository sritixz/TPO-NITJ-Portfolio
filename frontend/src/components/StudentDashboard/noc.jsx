// import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import axios from 'axios';
// import { FaPlus, FaEye, FaDownload,FaUpload } from 'react-icons/fa';
// import GenerateNOC from './generate-noc';

// const NOC = () => {
//   const { userData } = useSelector((state) => state.auth);
//   const [nocs, setNocs] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [showUploadPopup, setShowUploadPopup] = useState(false);
//   const [selectedNocId, setSelectedNocId] = useState(null);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);
// console.log(userData);
//   const [formData, setFormData] = useState({
//     companyName: '',
//     dateSubmitted: '',
//     respondentEmail: userData?.email ||'',
//     salutation: userData?.gender === "Female" ? 'Ms.' : 'Mr.',
//     studentName: userData?.name || '',
//     rollNo: userData?.rollno || '',
//     course: userData?.course || '',
//     batch: userData?.batch || '',
//     year: '',
//     semester: '',
//     department: userData?.department || '',
//     internshipFrom: '',
//     internshipTo: '',
//     internshipDuration: '',
//     contactPersonName: '',
//     contactPersonDesignation: '',
//     contactPersonPhone: '',
//     contactPersonEmail: '',
//   });
//   const [editingId, setEditingId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

//   // Reset form data
//   const resetFormData = () => {
//     setFormData({
//       companyName: '',
//       dateSubmitted: '',
//       respondentEmail: userData?.email ||'',
//       salutation: userData?.gender === "Female" ? 'Ms.' : 'Mr.',
//       studentName: userData?.name || '',
//       rollNo: userData?.rollno || '',
//       course: userData?.course || '',
//       batch: userData?.batch || '',
//       year: '',
//       semester: '',
//       department: userData?.department || '',
//       internshipFrom: '',
//       internshipTo: '',
//       internshipDuration: '',
//       contactPersonName: '',
//       contactPersonDesignation: '',
//       contactPersonPhone: '',
//       contactPersonEmail: '',
//     });
//   };

//   // Fetch all NOCs
//   useEffect(() => {
//     setLoading(true);
//     axios.get(`${import.meta.env.REACT_APP_BASE_URL}/noc`, { withCredentials: true })
//       .then(response => {
//         setNocs(response.data);
//         setLoading(false);
//       })
//       .catch(error => {
//         console.error('Error fetching NOCs:', error);
//         setLoading(false);
//       });
//   }, []);

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   // Validate form
//   const validateForm = () => {
//     return Object.values(formData).every(value => value.trim() !== '');
//   };

//   // Show toast
//   const showToast = (message, type = 'info') => {
//     setToast({ show: true, message, type });
//     setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
//   };

//   // Submit or update NOC
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) {
//       showToast('Yo! Please fill out all the fields before submitting! 😎', 'error');
//       return;
//     }

//     setIsSubmitting(true);
//     const formDataToSend = new FormData();
//     Object.keys(formData).forEach(key => {
//       formDataToSend.append(key, formData[key]);
//     });

//     try {
//       if (editingId) {
//         await axios.put(`${import.meta.env.REACT_APP_BASE_URL}/noc/${editingId}`, formDataToSend, { 
//           headers: { 'Content-Type': 'application/json' }, 
//           withCredentials: true 
//         });
//         setNocs(nocs.map(noc => noc._id === editingId ? { ...noc, ...formData } : noc));
//         setEditingId(null);
//       } else {
//         const response = await axios.post (`${import.meta.env.REACT_APP_BASE_URL}/noc`, formDataToSend, { 
//           headers: { 'Content-Type': 'application/json' }, 
//           withCredentials: true 
//         });
//         setNocs([...nocs, response.data]);
//       }
//       resetFormData();
//       setShowForm(false);
//     } catch (error) {
//       console.error('Error submitting NOC:', error);
//       showToast('Oops! Something went wrong. Try again later! 😅', 'error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Handle offer letter upload
//   const handleOfferLetterUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file || file.type !== 'application/pdf') {
//       showToast('Please select a valid PDF file!', 'error');
//       return;
//     }
    
//     const formDataToSend = new FormData();
//     formDataToSend.append('offerLetter', file);
 
//     setIsUploading(true);
//     setUploadProgress(0);

//     try {
//       const response = await axios.post(`${import.meta.env.REACT_APP_BASE_URL}/noc/upload-offer-letter/${selectedNocId}`, formDataToSend, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         withCredentials: true,
//         onUploadProgress: (progressEvent) => {
//         const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//         setUploadProgress(percent);
//       },
//       });
//       setNocs(nocs.map(n => n._id === selectedNocId ? { ...n, offerLetter: response.data.offerLetter } : n));
//       setIsUploading(false);
//       setShowUploadPopup(false);
//       showToast('Offer letter uploaded successfully!', 'success');
//     } catch (error) {
//       console.error('Error uploading offer letter:', error);
//       showToast('Failed to upload offer letter. Try again!', 'error');
//     }
//   };

//   // View offer letter
//   const handleViewOfferLetter = (offerLetterUrl, nocId) => {
//     if (offerLetterUrl) {
//         console.log("offerLetterUrl", offerLetterUrl);
//       window.open(`${import.meta.env.REACT_APP_BASE_URL}${offerLetterUrl}`, '_blank');
//     } else {
//       showToast('No offer letter uploaded yet!', 'error');
//     }
//   };

//   const renderNOCList = () => (
//     <div className="space-y-6 animate-fade-in">
//       <div className="flex justify-between items-center mb-8 gap-4">
//         <h2 className="text-3xl font-bold flex items-center space-x-3 text-gray-900">
//           <span>No Objection <span className="text-custom-blue">Certificate</span></span>
//         </h2>
//         <div className="flex items-center gap-4 flex-1 justify-end">
//           <button
//             onClick={() => {
//               setShowForm(true);
//               resetFormData();
//             }}
//             className="flex items-center space-x-2 px-4 py-2 bg-custom-blue text-white rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-600 transition duration-300"
//           >
//             <FaPlus />
//             <span>Apply for NOC</span>
//           </button>
//         </div>
//       </div>
//       {loading ? (
//         <div className="flex items-center justify-center min-h-[400px]">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       ) : nocs.length === 0 ? (
//         <p className="text-gray-600 italic">No NOCs available.</p>
//       ) : (
//         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//           {nocs.map((noc) => (
//             <div
//                           key={noc._id}
//                           className="p-6 bg-white rounded-xl shadow-lg cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100"
//                         >
//                           <p className="text-lg font-semibold text-gray-900">{noc.companyName}</p>
//                           <p className="bg-custom-blue/10 rounded-lg p-1 text-custom-blue text-xs font-semibold inline-block mt-2"># {noc.nocId}</p>
//                           <p className="text-xs text-gray-600 mt-2">
//                             Submitted: {new Date(noc.dateSubmitted).toLocaleDateString('en-GB', {
//                               day: '2-digit',
//                               month: '2-digit',
//                               year: 'numeric',
//                             })}
//                           </p>
//                           <div className="flex flex-wrap gap-2 mt-4">
//                             <button
//                               onClick={() => GenerateNOC(noc)}
//                              className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
//                             >
//                              <FaDownload />
//                               <span>NOC</span>
//                             </button>
//                             <button
//                               onClick={() => handleViewOfferLetter(noc.offerLetter, noc._id)}
//                               className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
//                             >
//                               <FaEye />
//                               <span>Offer Letter</span>
//                             </button>
//                             <button
//                               onClick={() => {
//                                 setSelectedNocId(noc._id);
//                                 setShowUploadPopup(true);
//                               }}
//                             className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
//                             >
//                               <FaUpload />
//                               <span>Offer Letter</span>
//                             </button>
//                             <button
//                               onClick={() => {
//                                 setSelectedNocId(noc._id);
//                                 setShowUploadPopup(true);
//                               }}
//                             className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
//                             >
//                               <FaUpload />
//                               <span>TurnOver Report</span>
//                             </button>
//                             <button
//                               onClick={() => {
//                                 setSelectedNocId(noc._id);
//                                 setShowUploadPopup(true);
//                               }}
//                             className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
//                             >
//                               <FaUpload />
//                               <span>Mail PDF</span>
//                             </button>
//                           </div>
//                         </div>
//                       ))}
//                  </div>
//                 )}
//            </div>
//            );

//   return (
//     <div className="container mx-auto p-6 min-h-screen">
//       {toast.show && (
//         <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg animate-fade-in-out z-[1000] ${
//           toast.type === 'error' ? 'bg-white border border-red-500 text-red-500' : 
//           toast.type === 'success' ? 'bg-white border border-green-500 text-green-500' : 
//           'bg-white border border-blue-500 text-blue-500'
//         }`}>
//           {toast.message}
//         </div>
//       )}
//       {showUploadPopup && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-xl font-semibold text-gray-700">Upload Offer Letter</h3>
//               <button
//                 onClick={() => setShowUploadPopup(false)}
//                 className="text-gray-600 hover:text-gray-800 text-xl font-bold"
//               >
//                 ×
//               </button>
//             </div>
//             <div className="flex flex-col items-center">
//               <label className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition duration-300">
//                 <span className="text-gray-600">Choose a PDF file</span>
//                 <input
//                   type="file"
//                   accept="application/pdf"
//                   onChange={handleOfferLetterUpload}
//                   className="hidden"
//                 />
//               </label>
//               <p className="mt-2 text-sm text-gray-500">Only PDF files are allowed</p>
//             </div>
//           </div>
//         </div>
//       )}
//       {!showForm ? (
//         renderNOCList()
//       ) : (
//         <div className="bg-white shadow-lg rounded-lg p-8 mb-8 border border-gray-200 relative">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-xl font-semibold text-gray-700">Apply for <span className='text-custom-blue'>NOC</span></h2>
//             <button
//               onClick={() => {
//                 setShowForm(false);
//                 setEditingId(null);
//                 resetFormData();
//               }}
//               className="text-gray-600 hover:text-gray-800 text-xl font-bold"
//             >
//               ×
//             </button>
//           </div>
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Salutation <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="salutation"
//                   value={formData.salutation}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                   disabled
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Student Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="studentName"
//                   value={formData.studentName}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                   disabled
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Roll No <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="rollNo"
//                   value={formData.rollNo}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                   disabled
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Course <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="course"
//                   value={formData.course}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                   disabled
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Department <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="department"
//                   value={formData.department}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                   disabled
//                 />
//               </div>
//                <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Respondent Email <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="email"
//                   name="respondentEmail"
//                   value={formData.respondentEmail}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                   disabled
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Year <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="year"
//                   value={formData.year}
//                   onChange={handleInputChange}
//                   className={`mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${formData.year === '' ? 'text-gray-600' : 'text-black'}`}
//                   required
//                 >
//                   <option value="" disabled hidden>Select Year</option>
//                   <option value="1st">1st</option>
//                   <option value="2nd">2nd</option>
//                   <option value="3rd">3rd</option>
//                   <option value="4th">4th</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Semester <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="semester"
//                   value={formData.semester}
//                   onChange={handleInputChange}
//                   className={`mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${formData.semester === '' ? 'text-gray-600' : 'text-black'}`}
//                   required
//                 >
//                   <option value="" disabled hidden>Select Semester</option>
//                   <option value="1st">1st</option>
//                   <option value="2nd">2nd</option>
//                   <option value="3rd">3rd</option>
//                   <option value="4th">4th</option>
//                   <option value="5th">5th</option>
//                   <option value="6th">6th</option>
//                   <option value="7th">7th</option>
//                   <option value="8th">8th</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Date Submitted <span className='text-xs'>(When will you submit it to the department?)</span> <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="dateSubmitted"
//                   value={formData.dateSubmitted}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Company Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="companyName"
//                   value={formData.companyName}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Internship From <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="internshipFrom"
//                   value={formData.internshipFrom}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Internship To <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="internshipTo"
//                   value={formData.internshipTo}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Internship Duration <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="internshipDuration"
//                   value={formData.internshipDuration}
//                   onChange={handleInputChange}
//                   className={`mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${formData.internshipDuration === '' ? 'text-gray-600' : 'text-black'}`}
//                   required
//                 >
//                   <option value="" disabled hidden>Specify internship duration</option>
//                   <option value="more than 30 days">More than 30 days</option>
//                   <option value="more than 30 days and less than 45 days">30-45 days</option>
//                   <option value="more than 45 days less than 60 days">45-60 days</option>
//                   <option value="more than 60 days">More than 60 days</option>
//                   <option value="6 months">6 months</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Name of Contact Person from Company <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="contactPersonName"
//                   value={formData.contactPersonName}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Contact Person Designation <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="contactPersonDesignation"
//                   value={formData.contactPersonDesignation}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Contact Person Phone <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="contactPersonPhone"
//                   value={formData.contactPersonPhone}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Contact Person Email <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="email"
//                   name="contactPersonEmail"
//                   value={formData.contactPersonEmail}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                 />
//               </div>
//             </div>
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className={`w-full p-3 rounded-md transition duration-300 ${
//                 isSubmitting 
//                   ? 'bg-gray-400 cursor-not-allowed' 
//                   : 'bg-custom-blue text-white hover:bg-blue-700'
//               }`}
//             >
//               {isSubmitting ? 'Submitting...' : editingId ? 'Update NOC' : 'Apply for NOC'}
//             </button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NOC;


// import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import axios from 'axios';
// import { FaPlus, FaEye, FaDownload, FaUpload } from 'react-icons/fa';
// import GenerateNOC from './generate-noc';

// const NOC = () => {
//   const { userData } = useSelector((state) => state.auth);
//   const [nocs, setNocs] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [showUploadPopup, setShowUploadPopup] = useState(false);
//   const [selectedNocId, setSelectedNocId] = useState(null);
//   const [selectedDocType, setSelectedDocType] = useState(null);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);
//   console.log(userData);
//   const [formData, setFormData] = useState({
//     companyName: '',
//     dateSubmitted: '',
//     respondentEmail: userData?.email || '',
//     salutation: userData?.gender === "Female" ? 'Ms.' : 'Mr.',
//     studentName: userData?.name || '',
//     rollNo: userData?.rollno || '',
//     course: userData?.course || '',
//     batch: userData?.batch || '',
//     year: '',
//     semester: '',
//     department: userData?.department || '',
//     internshipFrom: '',
//     internshipTo: '',
//     internshipDuration: '',
//     internshipMode: '',
//     contactPersonName: '',
//     contactPersonDesignation: '',
//     contactPersonPhone: '',
//     contactPersonEmail: '',
//   });
//   const [editingId, setEditingId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

//   const semesterOptions = {
//     '1st': ['1st', '2nd'],
//     '2nd': ['3rd', '4th'],
//     '3rd': ['5th', '6th'],
//     '4th': ['7th', '8th']
//   };

//   const docTypeNames = {
//     offerLetter: 'Offer Letter',
//     turnoverReport: 'Turnover Report',
//     mailScreenshot: 'Mail PDF'
//   };

//   const endpointMap = {
//     offerLetter: 'offer-letter',
//     turnoverReport: 'turnover-report',
//     mailScreenshot: 'mail-screenshot'
//   };

//   // Reset form data
//   const resetFormData = () => {
//     setFormData({
//       companyName: '',
//       dateSubmitted: '',
//       respondentEmail: userData?.email || '',
//       salutation: userData?.gender === "Female" ? 'Ms.' : 'Mr.',
//       studentName: userData?.name || '',
//       rollNo: userData?.rollno || '',
//       course: userData?.course || '',
//       batch: userData?.batch || '',
//       year: '',
//       semester: '',
//       department: userData?.department || '',
//       internshipFrom: '',
//       internshipTo: '',
//       internshipDuration: '',
//       internshipMode: '',
//       contactPersonName: '',
//       contactPersonDesignation: '',
//       contactPersonPhone: '',
//       contactPersonEmail: '',
//     });
//   };

//   // Fetch all NOCs
//   useEffect(() => {
//     setLoading(true);
//     axios.get(`${import.meta.env.REACT_APP_BASE_URL}/noc`, { withCredentials: true })
//       .then(response => {
//         setNocs(response.data);
//         setLoading(false);
//       })
//       .catch(error => {
//         console.error('Error fetching NOCs:', error);
//         setLoading(false);
//       });
//   }, []);

//   // Auto-calculate internship duration
//   useEffect(() => {
//     if (formData.internshipFrom && formData.internshipTo) {
//       const from = new Date(formData.internshipFrom);
//       const to = new Date(formData.internshipTo);
//       if (to > from) {
//         const diffTime = to - from;
//         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//         setFormData(prev => ({ ...prev, internshipDuration: `${diffDays} days` }));
//       } else {
//         setFormData(prev => ({ ...prev, internshipDuration: '' }));
//       }
//     } else {
//       setFormData(prev => ({ ...prev, internshipDuration: '' }));
//     }
//   }, [formData.internshipFrom, formData.internshipTo]);

//   // Reset semester when year changes
//   useEffect(() => {
//     setFormData(prev => ({ ...prev, semester: '' }));
//   }, [formData.year]);

//   // Clear contact fields when mode changes to On-Campus
//   useEffect(() => {
//     if (formData.internshipMode === 'On-Campus') {
//       setFormData(prev => ({
//         ...prev,
//         contactPersonName: '',
//         contactPersonDesignation: '',
//         contactPersonPhone: '',
//         contactPersonEmail: '',
//       }));
//     }
//   }, [formData.internshipMode]);

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   // Validate form
//   const validateForm = () => {
//     const contactFields = ['contactPersonName', 'contactPersonDesignation', 'contactPersonPhone', 'contactPersonEmail'];
//     const requiredKeys = Object.keys(formData).filter(key => 
//       !contactFields.includes(key) || formData.internshipMode === 'Off-Campus'
//     );
//     return requiredKeys.every(key => formData[key].trim() !== '');
//   };

//   // Show toast
//   const showToast = (message, type = 'info') => {
//     setToast({ show: true, message, type });
//     setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
//   };

//   // Submit or update NOC
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) {
//       showToast('Yo! Please fill out all the fields before submitting! 😎', 'error');
//       return;
//     }

//     setIsSubmitting(true);
//     const payload = { ...formData };

//     try {
//       if (editingId) {
//         await axios.put(`${import.meta.env.REACT_APP_BASE_URL}/noc/${editingId}`, payload, { 
//           headers: { 'Content-Type': 'application/json' }, 
//           withCredentials: true 
//         });
//         setNocs(nocs.map(noc => noc._id === editingId ? { ...noc, ...formData } : noc));
//         setEditingId(null);
//       } else {
//         const response = await axios.post(`${import.meta.env.REACT_APP_BASE_URL}/noc`, payload, { 
//           headers: { 'Content-Type': 'application/json' }, 
//           withCredentials: true 
//         });
//         setNocs([...nocs, response.data]);
//       }
//       resetFormData();
//       setShowForm(false);
//     } catch (error) {
//       console.error('Error submitting NOC:', error);
//       showToast('Oops! Something went wrong. Try again later! 😅', 'error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Handle document upload
//   const handleDocumentUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file || file.type !== 'application/pdf') {
//       showToast('Please select a valid PDF file!', 'error');
//       return;
//     }
    
//     const formDataToSend = new FormData();
//     formDataToSend.append(selectedDocType, file);
 
//     setIsUploading(true);
//     setUploadProgress(0);

//     const uploadEndpoint = `${import.meta.env.REACT_APP_BASE_URL}/noc/upload-${endpointMap[selectedDocType]}/${selectedNocId}`;

//     try {
//       const response = await axios.post(uploadEndpoint, formDataToSend, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         withCredentials: true,
//         onUploadProgress: (progressEvent) => {
//           const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//           setUploadProgress(percent);
//         },
//       });
//       const uploadedField = response.data[selectedDocType];
//       setNocs(nocs.map(n => n._id === selectedNocId ? { ...n, [selectedDocType]: uploadedField } : n));
//       setIsUploading(false);
//       setUploadProgress(0);
//       setShowUploadPopup(false);
//       setSelectedDocType(null);
//       showToast(`${docTypeNames[selectedDocType]} uploaded successfully!`, 'success');
//     } catch (error) {
//       console.error(`Error uploading ${selectedDocType}:`, error);
//       showToast(`Failed to upload ${docTypeNames[selectedDocType]}. Try again!`, 'error');
//       setIsUploading(false);
//     }
//   };

//   // View document
//   const handleViewDocument = (docUrl, docName) => {
//     if (docUrl) {
//       window.open(`${import.meta.env.REACT_APP_BASE_URL}${docUrl}`, '_blank');
//     } else {
//       showToast(`No ${docName} uploaded yet!`, 'error');
//     }
//   };

//   const renderNOCList = () => (
//     <div className="space-y-6 animate-fade-in">
//       <div className="flex justify-between items-center mb-8 gap-4">
//         <h2 className="text-3xl font-bold flex items-center space-x-3 text-gray-900">
//           <span>No Objection <span className="text-custom-blue">Certificate</span></span>
//         </h2>
//         <div className="flex items-center gap-4 flex-1 justify-end">
//           <button
//             onClick={() => {
//               setShowForm(true);
//               resetFormData();
//             }}
//             className="flex items-center space-x-2 px-4 py-2 bg-custom-blue text-white rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-600 transition duration-300"
//           >
//             <FaPlus />
//             <span>Apply for NOC</span>
//           </button>
//         </div>
//       </div>
//       {loading ? (
//         <div className="flex items-center justify-center min-h-[400px]">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       ) : nocs.length === 0 ? (
//         <p className="text-gray-600 italic">No NOCs available.</p>
//       ) : (
//         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//           {nocs.map((noc) => (
//             <div
//               key={noc._id}
//               className="p-6 bg-white rounded-xl shadow-lg cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100"
//             >
//               <p className="text-lg font-semibold text-gray-900">{noc.companyName}</p>
//               <p className="bg-custom-blue/10 rounded-lg p-1 text-custom-blue text-xs font-semibold inline-block mt-2"># {noc.nocId}</p>
//               <p className="text-xs text-gray-600 mt-2">
//                 Submitted: {new Date(noc.dateSubmitted).toLocaleDateString('en-GB', {
//                   day: '2-digit',
//                   month: '2-digit',
//                   year: 'numeric',
//                 })}
//               </p>
//               <div className="flex flex-wrap gap-2 mt-4">
//                 <button
//                   onClick={() => GenerateNOC(noc)}
//                   className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
//                 >
//                   <FaDownload />
//                   <span>NOC</span>
//                 </button>
//                 <button
//                   onClick={() => handleViewDocument(noc.offerLetter, 'Offer Letter')}
//                   className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
//                 >
//                   <FaEye />
//                   <span>Offer Letter</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     setSelectedNocId(noc._id);
//                     setSelectedDocType('offerLetter');
//                     setShowUploadPopup(true);
//                   }}
//                   className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
//                 >
//                   <FaUpload />
//                   <span>Offer Letter</span>
//                 </button>
//                 <button
//                   onClick={() => handleViewDocument(noc.turnoverReport, 'Turnover Report')}
//                   className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
//                 >
//                   <FaEye />
//                   <span>Turnover Report</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     setSelectedNocId(noc._id);
//                     setSelectedDocType('turnoverReport');
//                     setShowUploadPopup(true);
//                   }}
//                   className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
//                 >
//                   <FaUpload />
//                   <span>Turnover Report</span>
//                 </button>
//                 <button
//                   onClick={() => handleViewDocument(noc.mailScreenshot, 'Mail PDF')}
//                   className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
//                 >
//                   <FaEye />
//                   <span>Mail PDF</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     setSelectedNocId(noc._id);
//                     setSelectedDocType('mailScreenshot');
//                     setShowUploadPopup(true);
//                   }}
//                   className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
//                 >
//                   <FaUpload />
//                   <span>Mail PDF</span>
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <div className="container mx-auto p-6 min-h-screen">
//       {toast.show && (
//         <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg animate-fade-in-out z-[1000] ${
//           toast.type === 'error' ? 'bg-white border border-red-500 text-red-500' : 
//           toast.type === 'success' ? 'bg-white border border-green-500 text-green-500' : 
//           'bg-white border border-blue-500 text-blue-500'
//         }`}>
//           {toast.message}
//         </div>
//       )}
//       {showUploadPopup && selectedDocType && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-xl font-semibold text-gray-700">Upload {docTypeNames[selectedDocType]}</h3>
//               <button
//                 onClick={() => {
//                   setShowUploadPopup(false);
//                   setSelectedDocType(null);
//                 }}
//                 className="text-gray-600 hover:text-gray-800 text-xl font-bold"
//               >
//                 ×
//               </button>
//             </div>
//             <div className="flex flex-col items-center">
//               <label className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition duration-300">
//                 <span className="text-gray-600">Choose a PDF file</span>
//                 <input
//                   type="file"
//                   accept="application/pdf"
//                   onChange={handleDocumentUpload}
//                   className="hidden"
//                   disabled={isUploading}
//                 />
//               </label>
//               <p className="mt-2 text-sm text-gray-500">Only PDF files are allowed</p>
//               {isUploading && (
//                 <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
//                   <div 
//                     className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
//                     style={{ width: `${uploadProgress}%` }}
//                   ></div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//       {!showForm ? (
//         renderNOCList()
//       ) : (
//         <div className="bg-white shadow-lg rounded-lg p-8 mb-8 border border-gray-200 relative">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-xl font-semibold text-gray-700">Apply for <span className='text-custom-blue'>NOC</span></h2>
//             <button
//               onClick={() => {
//                 setShowForm(false);
//                 setEditingId(null);
//                 resetFormData();
//               }}
//               className="text-gray-600 hover:text-gray-800 text-xl font-bold"
//             >
//               ×
//             </button>
//           </div>
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Salutation <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="salutation"
//                   value={formData.salutation}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                   disabled
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Student Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="studentName"
//                   value={formData.studentName}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                   disabled
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Roll No <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="rollNo"
//                   value={formData.rollNo}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                   disabled
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Course <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="course"
//                   value={formData.course}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                   disabled
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Department <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="department"
//                   value={formData.department}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                   disabled
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Respondent Email <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="email"
//                   name="respondentEmail"
//                   value={formData.respondentEmail}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                   disabled
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Year <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="year"
//                   value={formData.year}
//                   onChange={handleInputChange}
//                   className={`mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${formData.year === '' ? 'text-gray-600' : 'text-black'}`}
//                   required
//                 >
//                   <option value="" disabled hidden>Select Year</option>
//                   <option value="1st">1st</option>
//                   <option value="2nd">2nd</option>
//                   <option value="3rd">3rd</option>
//                   <option value="4th">4th</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Semester <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="semester"
//                   value={formData.semester}
//                   onChange={handleInputChange}
//                   disabled={!formData.year}
//                   className={`mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${!formData.year || formData.semester === '' ? 'text-gray-600 bg-gray-100' : 'text-black'}`}
//                   required
//                 >
//                   <option value="" disabled hidden>Select Year First</option>
//                   {semesterOptions[formData.year]?.map((sem) => (
//                     <option key={sem} value={sem}>{sem}</option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Date Submitted <span className='text-xs'>(When will you submit it to the department?)</span> <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="dateSubmitted"
//                   value={formData.dateSubmitted}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Company Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="companyName"
//                   value={formData.companyName}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Internship From <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="internshipFrom"
//                   value={formData.internshipFrom}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Internship To <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   name="internshipTo"
//                   value={formData.internshipTo}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Internship Duration <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="internshipDuration"
//                   value={formData.internshipDuration}
//                   readOnly
//                   className="mt-1 block w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600">
//                   Internship Mode <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   name="internshipMode"
//                   value={formData.internshipMode}
//                   onChange={handleInputChange}
//                   className={`mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${formData.internshipMode === '' ? 'text-gray-600' : 'text-black'}`}
//                   required
//                 >
//                   <option value="" disabled hidden>Select Mode</option>
//                   <option value="On-Campus">On-Campus</option>
//                   <option value="Off-Campus">Off-Campus</option>
//                 </select>
//               </div>
//               {formData.internshipMode === 'Off-Campus' && (
//                 <>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-600">
//                       Name of Contact Person from Company <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       name="contactPersonName"
//                       value={formData.contactPersonName}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-600">
//                       Contact Person Designation <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       name="contactPersonDesignation"
//                       value={formData.contactPersonDesignation}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-600">
//                       Contact Person Phone <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       name="contactPersonPhone"
//                       value={formData.contactPersonPhone}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-600">
//                       Contact Person Email <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="email"
//                       name="contactPersonEmail"
//                       value={formData.contactPersonEmail}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                       required
//                     />
//                   </div>
//                 </>
//               )}
//             </div>
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className={`w-full p-3 rounded-md transition duration-300 ${
//                 isSubmitting 
//                   ? 'bg-gray-400 cursor-not-allowed' 
//                   : 'bg-custom-blue text-white hover:bg-blue-700'
//               }`}
//             >
//               {isSubmitting ? 'Submitting...' : editingId ? 'Update NOC' : 'Apply for NOC'}
//             </button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NOC;



import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FaPlus, FaEye, FaDownload, FaUpload } from 'react-icons/fa';
import GenerateNOC from './generate-noc';

const NOC = () => {
  const { userData } = useSelector((state) => state.auth);
  const [nocs, setNocs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [selectedNocId, setSelectedNocId] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  console.log(userData);
  const [formData, setFormData] = useState({
    companyName: '',
    dateSubmitted: '',
    respondentEmail: userData?.email || '',
    salutation: userData?.gender === "Female" ? 'Ms.' : 'Mr.',
    studentName: userData?.name || '',
    rollNo: userData?.rollno || '',
    course: userData?.course || '',
    batch: userData?.batch || '',
    year: '',
    semester: '',
    department: userData?.department || '',
    internshipFrom: '',
    internshipTo: '',
    internshipDuration: '',
    internshipMode: '',
    contactPersonName: '',
    contactPersonDesignation: '',
    contactPersonPhone: '',
    contactPersonEmail: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [internshipFromError, setInternshipFromError] = useState('');
  const [internshipToError, setInternshipToError] = useState('');
  const semesterOptions = {
    '1st': ['1st', '2nd'],
    '2nd': ['3rd', '4th'],
    '3rd': ['5th', '6th'],
    '4th': ['7th', '8th']
  };
  const docTypeNames = {
    offerLetter: 'Offer Letter',
    turnoverReport: 'Turnover Report',
    mailScreenshot: 'Mail PDF'
  };
  const endpointMap = {
    offerLetter: 'offer-letter',
    turnoverReport: 'turnover-report',
    mailScreenshot: 'mail-screenshot'
  };
  // Reset form data
  const resetFormData = () => {
    setFormData({
      companyName: '',
      dateSubmitted: '',
      respondentEmail: userData?.email || '',
      salutation: userData?.gender === "Female" ? 'Ms.' : 'Mr.',
      studentName: userData?.name || '',
      rollNo: userData?.rollno || '',
      course: userData?.course || '',
      batch: userData?.batch || '',
      year: '',
      semester: '',
      department: userData?.department || '',
      internshipFrom: '',
      internshipTo: '',
      internshipDuration: '',
      internshipMode: '',
      contactPersonName: '',
      contactPersonDesignation: '',
      contactPersonPhone: '',
      contactPersonEmail: '',
    });
    setInternshipFromError('');
    setInternshipToError('');
  };
  // Fetch all NOCs
  useEffect(() => {
    setLoading(true);
    axios.get(`${import.meta.env.REACT_APP_BASE_URL}/noc`, { withCredentials: true })
      .then(response => {
        setNocs(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching NOCs:', error);
        setLoading(false);
      });
  }, []);
  // Auto-calculate internship duration
  useEffect(() => {
    if (formData.internshipFrom && formData.internshipTo) {
      const from = new Date(formData.internshipFrom);
      const to = new Date(formData.internshipTo);
      if (to > from) {
        const diffTime = to - from;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setFormData(prev => ({ ...prev, internshipDuration: `${diffDays} days` }));
      } else {
        setFormData(prev => ({ ...prev, internshipDuration: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, internshipDuration: '' }));
    }
  }, [formData.internshipFrom, formData.internshipTo]);
  // Reset semester when year changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, semester: '' }));
  }, [formData.year]);
  // Clear contact fields when mode changes to On-Campus
  useEffect(() => {
    if (formData.internshipMode === 'On-Campus') {
      setFormData(prev => ({
        ...prev,
        contactPersonName: '',
        contactPersonDesignation: '',
        contactPersonPhone: '',
        contactPersonEmail: '',
      }));
    }
  }, [formData.internshipMode]);
  // Validate dates against batch cutoff
  const validateDate = (dateValue, setter, fieldName) => {
    if (!dateValue) {
      setter('');
      return true;
    }
    const selectedDate = new Date(dateValue);
    const batchYear = parseInt(formData.batch);
    if (isNaN(batchYear)) {
      setter('Invalid batch year. Please contact support.');
      return false;
    }
    const cutoff = new Date(batchYear, 5, 11); // June 11 (month 5 is June)
    cutoff.setHours(23, 59, 59, 999); // End of day for comparison
    if (selectedDate > cutoff) {
      setter(`Please select any date before or on June 11, ${batchYear} for ${fieldName}`);
      return false;
    } else {
      setter('');
      return true;
    }
  };
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'internshipFrom') {
      validateDate(value, setInternshipFromError, 'Internship From');
    } else if (name === 'internshipTo') {
      validateDate(value, setInternshipToError, 'Internship To');
    }
  };
  // Validate form
  const validateForm = () => {
    const contactFields = ['contactPersonName', 'contactPersonDesignation', 'contactPersonPhone', 'contactPersonEmail'];
    const requiredKeys = Object.keys(formData).filter(key =>
      !contactFields.includes(key) || formData.internshipMode === 'Off-Campus'
    );
    const allRequiredFilled = requiredKeys.every(key => formData[key].trim() !== '');
    if (internshipFromError || internshipToError) {
      return false;
    }
    return allRequiredFilled;
  };
  // Show toast
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };
  // Submit or update NOC
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fill out all the fields and correct any date errors before submitting! 😎', 'error');
      return;
    }
    setIsSubmitting(true);
    const payload = { ...formData };
    try {
      if (editingId) {
        await axios.put(`${import.meta.env.REACT_APP_BASE_URL}/noc/${editingId}`, payload, {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        });
        setNocs(nocs.map(noc => noc._id === editingId ? { ...noc, ...formData } : noc));
        setEditingId(null);
      } else {
        const response = await axios.post(`${import.meta.env.REACT_APP_BASE_URL}/noc`, payload, {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        });
        setNocs([...nocs, response.data]);
      }
      resetFormData();
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting NOC:', error);
      showToast('Oops! Something went wrong. Try again later! 😅', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  // Handle document upload
  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      showToast('Please select a valid PDF file!', 'error');
      return;
    }
   
    const formDataToSend = new FormData();
    formDataToSend.append(selectedDocType, file);
    setIsUploading(true);
    setUploadProgress(0);
    const uploadEndpoint = `${import.meta.env.REACT_APP_BASE_URL}/noc/upload-${endpointMap[selectedDocType]}/${selectedNocId}`;
    try {
      const response = await axios.post(uploadEndpoint, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });
      const uploadedField = response.data[selectedDocType];
      setNocs(nocs.map(n => n._id === selectedNocId ? { ...n, [selectedDocType]: uploadedField } : n));
      setIsUploading(false);
      setUploadProgress(0);
      setShowUploadPopup(false);
      setSelectedDocType(null);
      showToast(`${docTypeNames[selectedDocType]} uploaded successfully!`, 'success');
    } catch (error) {
      console.error(`Error uploading ${selectedDocType}:`, error);
      showToast(`Failed to upload ${docTypeNames[selectedDocType]}. Try again!`, 'error');
      setIsUploading(false);
    }
  };
  // View document
  const handleViewDocument = (docUrl, docName) => {
    if (docUrl) {
      window.open(`${import.meta.env.REACT_APP_BASE_URL}${docUrl}`, '_blank');
    } else {
      showToast(`No ${docName} uploaded yet!`, 'error');
    }
  };
  const renderNOCList = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold flex items-center space-x-3 text-gray-900">
          <span>No Objection <span className="text-custom-blue">Certificate</span></span>
        </h2>
        <div className="flex items-center gap-4 flex-1 justify-end">
          <button
            onClick={() => {
              setShowForm(true);
              resetFormData();
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-custom-blue text-white rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-600 transition duration-300"
          >
            <FaPlus />
            <span>Apply for NOC</span>
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : nocs.length === 0 ? (
        <p className="text-gray-600 italic">No NOCs available.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {nocs.map((noc) => (
            <div
              key={noc._id}
              className="p-6 bg-white rounded-xl shadow-lg cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100"
            >
              <p className="text-lg font-semibold text-gray-900">{noc.companyName}</p>
              <p className="bg-custom-blue/10 rounded-lg p-1 text-custom-blue text-xs font-semibold inline-block mt-2"># {noc.nocId}</p>
              <p className="text-xs text-gray-600 mt-2">
                Submitted: {new Date(noc.dateSubmitted).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => GenerateNOC(noc)}
                  className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
                >
                  <FaDownload />
                  <span>NOC</span>
                </button>
                <button
                  onClick={() => handleViewDocument(noc.offerLetter, 'Offer Letter')}
                  className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
                >
                  <FaEye />
                  <span>Offer Letter</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedNocId(noc._id);
                    setSelectedDocType('offerLetter');
                    setShowUploadPopup(true);
                  }}
                  className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
                >
                  <FaUpload />
                  <span>Offer Letter</span>
                </button>
                <button
                  onClick={() => handleViewDocument(noc.turnoverReport, 'Turnover Report')}
                  className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
                >
                  <FaEye />
                  <span>Turnover Report</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedNocId(noc._id);
                    setSelectedDocType('turnoverReport');
                    setShowUploadPopup(true);
                  }}
                  className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
                >
                  <FaUpload />
                  <span>Turnover Report</span>
                </button>
                <button
                  onClick={() => handleViewDocument(noc.mailScreenshot, 'Mail PDF')}
                  className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
                >
                  <FaEye />
                  <span>Mail PDF</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedNocId(noc._id);
                    setSelectedDocType('mailScreenshot');
                    setShowUploadPopup(true);
                  }}
                  className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
                >
                  <FaUpload />
                  <span>Mail PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
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
      {showUploadPopup && selectedDocType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-700">Upload {docTypeNames[selectedDocType]}</h3>
              <button
                onClick={() => {
                  setShowUploadPopup(false);
                  setSelectedDocType(null);
                }}
                className="text-gray-600 hover:text-gray-800 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="flex flex-col items-center">
              <label className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition duration-300">
                <span className="text-gray-600">Choose a PDF file</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleDocumentUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
              <p className="mt-2 text-sm text-gray-500">Only PDF files are allowed</p>
              {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {!showForm ? (
        renderNOCList()
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-8 mb-8 border border-gray-200 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">Apply for <span className='text-custom-blue'>NOC</span></h2>
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
                  Salutation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="salutation"
                  value={formData.salutation}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Roll No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled
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
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Department <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Respondent Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="respondentEmail"
                  value={formData.respondentEmail}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Year <span className="text-red-500">*</span>
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${formData.year === '' ? 'text-gray-600' : 'text-black'}`}
                  required
                >
                  <option value="" disabled hidden>Select Year</option>
                  <option value="1st">1st</option>
                  <option value="2nd">2nd</option>
                  <option value="3rd">3rd</option>
                  <option value="4th">4th</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  disabled={!formData.year}
                  className={`mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${!formData.year || formData.semester === '' ? 'text-gray-600 bg-gray-100' : 'text-black'}`}
                  required
                >
                  <option value="" disabled hidden>Select Year First</option>
                  {semesterOptions[formData.year]?.map((sem) => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Date Submitted <span className='text-xs'>(When will you submit it to the department?)</span> <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateSubmitted"
                  value={formData.dateSubmitted}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Internship From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="internshipFrom"
                  value={formData.internshipFrom}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full p-3 border ${internshipFromError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
                {internshipFromError && <p className="text-red-500 text-sm mt-1">{internshipFromError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Internship To <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="internshipTo"
                  value={formData.internshipTo}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full p-3 border ${internshipToError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
                {internshipToError && <p className="text-red-500 text-sm mt-1">{internshipToError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Internship Duration <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="internshipDuration"
                  value={formData.internshipDuration}
                  readOnly
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Internship Mode <span className="text-red-500">*</span>
                </label>
                <select
                  name="internshipMode"
                  value={formData.internshipMode}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${formData.internshipMode === '' ? 'text-gray-600' : 'text-black'}`}
                  required
                >
                  <option value="" disabled hidden>Select Mode</option>
                  <option value="On-Campus">On-Campus</option>
                  <option value="Off-Campus">Off-Campus</option>
                </select>
              </div>
              {formData.internshipMode === 'Off-Campus' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Name of Contact Person from Company <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactPersonName"
                      value={formData.contactPersonName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Contact Person Designation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactPersonDesignation"
                      value={formData.contactPersonDesignation}
                      onChange={handleInputChange}
                      className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Contact Person Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactPersonPhone"
                      value={formData.contactPersonPhone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Contact Person Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="contactPersonEmail"
                      value={formData.contactPersonEmail}
                      onChange={handleInputChange}
                      className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting || internshipFromError || internshipToError}
              className={`w-full p-3 rounded-md transition duration-300 ${
                isSubmitting || internshipFromError || internshipToError
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-custom-blue text-white hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Submitting...' : editingId ? 'Update NOC' : 'Apply for NOC'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default NOC;