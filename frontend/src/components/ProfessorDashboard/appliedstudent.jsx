// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { saveAs } from "file-saver";
// import * as XLSX from "xlsx";
// import Swal from "sweetalert2";
// import { UserX, X } from "lucide-react";
// import { Button } from "../ui/button";
// import { Category } from "@mui/icons-material";

// const AppliedStudentp = ({ jobId, onClose, company_name }) => {
//   const [submissions, setSubmissions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

//   const itemsPerPage = 15;

//   useEffect(() => {
//     const fetchSubmissions = async () => {
//       try {
//         const response = await axios.get(
//           `${import.meta.env.REACT_APP_BASE_URL}/api/form-submissions/${jobId}`,
//           { withCredentials: true }
//         );
//         setSubmissions(response.data);
//       } catch (err) {
//         setError("Failed to load submissions.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSubmissions();
//   }, [jobId]);

//   const exportToExcel = (data, filename) => {
//     const worksheet = XLSX.utils.json_to_sheet(data);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");
//     const excelBuffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "array",
//     });
//     const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
//     saveAs(blob, `${filename}.xlsx`);
//   };

//   const handleExport = () => {
//     const data = submissions.map((submission) => {
//       const formattedFields = submission.fields.reduce((acc, field) => {
//         acc[field.fieldName] = field.value;
//         return acc;
//       }, {});
//       return {  ...formattedFields, Resume: submission.resumeUrl };
//     });
//     exportToExcel(data, company_name);
//   };

//   const handleRemove = async (submissionId) => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "This action will permanently remove the student.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, remove it!",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           await axios.delete(
//             `${import.meta.env.REACT_APP_BASE_URL}/api/form-submissions/${submissionId}`,
//             { withCredentials: true }
//           );
//           setSubmissions(submissions.filter((submission) => submission._id !== submissionId));
//           Swal.fire("Removed!", "The student has been removed.", "success");
//         } catch (err) {
//           console.error(err);
//           Swal.fire("Error!", "There was an error removing the student.", "error");
//         }
//       }
//     });
//   };

//   const handleRemoveAll = async () => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "This action will permanently remove all students.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, remove all!",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           await axios.delete(
//             `${import.meta.env.REACT_APP_BASE_URL}/api/form-submissions/delete-all/${jobId}`,
//             { withCredentials: true }
//           );
//           setSubmissions([]);
//           Swal.fire("Removed!", "All students have been removed.", "success");
//         } catch (err) {
//           console.error(err);
//           Swal.fire("Error!", "There was an error removing the students.", "error");
//         }
//       }
//     });
//   };

//   const handleMakeVisibleToAll = async () => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "All students will be made visible to the recruiter.",
//       icon: "info",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       confirmButtonText: "Yes, make visible!",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           const updatedSubmissions = submissions.map((submission) => ({
//             ...submission,
//             isVisible: true,
//           }));
//           await axios.patch(
//             `${import.meta.env.REACT_APP_BASE_URL}/api/form-submissions/make-visible/${jobId}`,
//             { isVisible: true },
//             { withCredentials: true }
//           );
//           setSubmissions(updatedSubmissions);
//           Swal.fire("Made Visible!", "All students are now visible to the recruiter.", "success");
//         } catch (err) {
//           console.error(err);
//           Swal.fire("Error!", "There was an error making the students visible.", "error");
//         }
//       }
//     });
//   };

//   const handleSendEmails = async () => {
//     const emails = submissions
//       .map((submission) => (submission.studentId ? submission.studentId.email : null))
//       .filter((email) => email);
  
//     if (emails.length === 0) {
//       Swal.fire("No Emails!", "No valid email addresses found.", "warning");
//       return;
//     }
//     const contactInfo = `
//       \n\n\n
//       Dr Rajeev Trehan 
//       Head, Placement (Mobile No.: +91-8146500951)
//       Dr Ajay Gupta
//       Head, Training (Mobile No.: +91-9501030373)
//       Dr Om Prakash Verma
//       Head, Internship (Mobile No.: +91-7579279839)
//       Dr Shefali Arora Chouhan
//       Coordinator Placement (Mobile No.: +91-9888813400)
//       Centre of Training and Placement
//       Dr. B. R. Ambedkar National Institute of Technology, Jalandhar 
//       Punjab (India)-144008
//       Email ID: ctp@nitj.ac.in/ hctp@nitj.ac.in
//     `;
  
//     Swal.fire({
//       title: "Draft Email",
//       html:
//         `<div class="swal2-input-group">
//           <input id="swal-input1" class="swal2-input" placeholder="Enter email subject">
//         </div>` +
//         `<div class="swal2-input-group">
//           <textarea id="swal-input2" class="swal2-textarea" placeholder="Write your email here"></textarea>
//         </div>`,
//       focusConfirm: false,
//       showCancelButton: true,
//       confirmButtonText: "Send Email",
//       cancelButtonText: "Cancel",
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       customClass: {
//         popup: "custom-swal-popup",
//         title: "custom-swal-title",
//         input: "custom-swal-input",
//         textarea: "custom-swal-textarea",
//         confirmButton: "custom-swal-confirm-button",
//         cancelButton: "custom-swal-cancel-button",
//       },
//       preConfirm: () => {
//         return {
//           subject: document.getElementById("swal-input1").value,
//           text: document.getElementById("swal-input2").value + contactInfo, // Append contact info
//         };
//       },
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           await axios.post(
//             `${import.meta.env.REACT_APP_BASE_URL}/nodemailer/send-emails`,
//             { emails, subject: result.value.subject, text: result.value.text },
//             { withCredentials: true }
//           );
//           Swal.fire("Emails Sent!", "All emails have been sent successfully.", "success");
//         } catch (err) {
//           console.error(err);
//           Swal.fire("Error!", "There was an error sending the emails.", "error");
//         }
//       }
//     });
//   };

//   const getUniqueFieldNames = () => {
//     const fieldNames = new Set();
//     submissions.forEach((submission) => {
//       submission.fields.forEach((field) => {
//         fieldNames.add(field.fieldName);
//       });
//     });
//     return Array.from(fieldNames);
//   };

//   const uniqueFieldNames = getUniqueFieldNames();

//   // Sorting Logic
//   const sortedSubmissions = React.useMemo(() => {
//     let sortableItems = [...submissions];
//     if (sortConfig.key !== null) {
//       sortableItems.sort((a, b) => {
//         const aValue = a.fields.find((field) => field.fieldName === sortConfig.key)?.value || "";
//         const bValue = b.fields.find((field) => field.fieldName === sortConfig.key)?.value || "";
//         if (aValue < bValue) {
//           return sortConfig.direction === 'ascending' ? -1 : 1;
//         }
//         if (aValue > bValue) {
//           return sortConfig.direction === 'ascending' ? 1 : -1;
//         }
//         return 0;
//       });
//     }
//     return sortableItems;
//   }, [submissions, sortConfig]);

//   // Pagination Logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = sortedSubmissions.slice(indexOfFirstItem, indexOfLastItem);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   const requestSort = (key) => {
//     let direction = 'ascending';
//     if (sortConfig.key === key && sortConfig.direction === 'ascending') {
//       direction = 'descending';
//     }
//     setSortConfig({ key, direction });
//   };

//   if (loading) {
//     return (
//       <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-10">
//         <div className="flex items-center justify-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-10">
//         <div className="flex flex-col items-center justify-center h-64 text-red-500">
//           <svg
//             className="w-16 h-16"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//             />
//           </svg>
//           <p className="mt-4 text-lg font-medium">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   if (submissions.length === 0) {
//     return (
//       <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-10">
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={onClose}
//           className="rounded-full hover:bg-gray-100"
//         >
//           <X className="h-5 w-5" />
//         </Button>

//         <div className="flex flex-col items-center justify-center py-12">
//           <UserX className="w-24 h-24 text-gray-400 mb-4" />
//           <h2 className="text-2xl font-semibold text-gray-700 mb-2">
//             No Applications Yet
//           </h2>
//           <p className="text-gray-500 text-center mb-6">
//             No student applied yet for this position.
//             <br />
//             Check back later for new submissions.
//           </p>
//           <div className="w-32 h-1 bg-blue-500 rounded-full"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-4">
//       <Button
//         variant="ghost"
//         size="icon"
//         onClick={onClose}
//         className="rounded-full hover:bg-gray-100"
//       >
//         <X className="h-5 w-5" />
//       </Button>
//       <h1 className="text-3xl font-bold mb-6 text-center">Students <span className="text-custom-blue">Applied</span></h1>
//       <div className="flex flex-wrap gap-4 mb-6">
//         <button
//           className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
//           onClick={handleExport}
//         >
//           Download Excel
//         </button>
//         <button
//           className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
//           onClick={handleRemoveAll}
//         >
//           Remove All Students
//         </button>
//         <button
//           className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
//           onClick={handleRemoveAll}
//         >
//           Remove All Students
//         </button>
//         {/* <button
//           className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
//           onClick={handleMakeVisibleToAll}
//         >
//           Make All Visible to Recruiter
//         </button> */}
//         <button
//           className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors"
//           onClick={handleSendEmails}
//         >
//           Send Emails to All Students
//         </button>
//         <div className="text-2xl text-custom-blue font-semibold mb-4 ml-auto">
//           {submissions.length} <span className="text-black text-2xl">Students</span>
//         </div>
//       </div>
//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white border-collapse border border-gray-300">
//           <thead>
//             <tr>
//               <th className="border border-gray-300 px-4 py-2 bg-gray-50">
//                 College Mail Id
//               </th>
//               <th className="border border-gray-300 px-4 py-2 bg-gray-50">
//                 Category
//               </th>
//               {uniqueFieldNames.map((fieldName, index) => (
//                 <th
//                   key={index}
//                   className="border border-gray-300 px-4 py-2 bg-gray-50 cursor-pointer"
//                   onClick={() => requestSort(fieldName)}
//                 >
//                   {fieldName}
//                   {sortConfig.key === fieldName && (
//                     <span className="ml-2">
//                       {sortConfig.direction === 'ascending' ? '▲' : '▼'}
//                     </span>
//                   )}
//                 </th>
//               ))}
//               <th className="border border-gray-300 px-4 py-2 bg-gray-50">
//                 Resume
//               </th>
//               <th className="border border-gray-300 px-4 py-2 bg-gray-50">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentItems.map((submission, index) => (
//               <tr key={index} className="hover:bg-gray-50">
//                 <td className="border border-gray-300 px-4 py-2">
//                   {submission.studentId?submission.studentId.email:"NA"}
//                 </td>
//                 <td className="border border-gray-300 px-4 py-2">
//                   {submission.studentId?submission.studentId.category:"NA"}
//                 </td>
//                 {uniqueFieldNames.map((fieldName, fieldIndex) => {
//                   const field = submission.fields.find((f) => f.fieldName === fieldName);
//                   return (
//                     <td
//                       key={fieldIndex}
//                       className="border border-gray-300 px-4 py-2"
//                     >
//                       {field ? field.value : ""}
//                     </td>
//                   );
//                 })}
//                 <td className="border border-gray-300 px-4 py-2">
//                   <button
//                     className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
//                     onClick={() => {
//                       const url = submission.resumeUrl.startsWith("http")
//                         ? submission.resumeUrl
//                         : `https://${submission.resumeUrl}`;
//                       window.open(url, "_blank");
//                     }}
//                   >
//                     View
//                   </button>
//                 </td>
//                 <td className="border border-gray-300 px-4 py-2">
//                   <button
//                     className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
//                     onClick={() => handleRemove(submission._id)}
//                   >
//                     Remove
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       <div className="flex justify-center mt-4">
//         {Array.from({ length: Math.ceil(submissions.length / itemsPerPage) }, (_, i) => (
//           <button
//             key={i + 1}
//             onClick={() => paginate(i + 1)}
//             className={`mx-1 px-4 py-2 rounded-lg ${
//               currentPage === i + 1 ? 'bg-custom-blue text-white' : 'bg-gray-200'
//             }`}
//           >
//             {i + 1}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AppliedStudentp;


import React, { useState, useEffect } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { UserX, X } from "lucide-react";
import { Button } from "../ui/button";
import { Category } from "@mui/icons-material";

const AppliedStudentp = ({ jobId, onClose, company_name }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customEntries, setCustomEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ insertAfter: '', newName: '', property: '' });

  const itemsPerPage = 15;
  const properties = ['name', 'email', 'personalEmail', 'phone', 'gender', 'rollno', 'department', 'dob', 'cgpa', 'Xth', 'XIIth', 'course', 'batch', 'active_backlogs', 'backlogs_history', 'activeBacklogCount', 'cgpa %', 'category', 'address'];

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.REACT_APP_BASE_URL}/api/form-submissions/${jobId}`,
          { withCredentials: true }
        );
        setSubmissions(response.data);
      } catch (err) {
        setError("Failed to load submissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [jobId]);

  const exportToExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${filename}.xlsx`);
  };

  const exportCustomExcel = (customEntries) => {
    const uniqueFieldNames = getUniqueFieldNames();
    const originalColumns = ['Email', 'Category', ...uniqueFieldNames, 'Resume'];
    let orderedHeaders = [...originalColumns];
    const customMap = new Map(customEntries.map(c => [c.newName, c.property]));

    // Insert new columns in the specified order
    customEntries.forEach(entry => {
      const insertIndex = orderedHeaders.indexOf(entry.insertAfter) + 1;
      if (insertIndex > 0 && insertIndex <= orderedHeaders.length) {
        orderedHeaders.splice(insertIndex, 0, entry.newName);
      }
    });

    // Build data rows
    const dataRows = submissions.map(submission => {
      const formattedFields = submission.fields.reduce((acc, field) => {
        acc[field.fieldName] = field.value;
        return acc;
      }, {});

      return orderedHeaders.map(header => {
        if (header === 'Email') return submission.studentId?.email || '';
        if (header === 'Category') return submission.studentId?.category || '';
        if (header === 'Resume') return submission.resumeUrl || '';
        if (customMap.has(header)) {
          const prop = customMap.get(header);
          return submission.studentId?.[prop] || '';
        }
        // Original field
        return formattedFields[header] || '';
      });
    });

    const aoa = [orderedHeaders, ...dataRows];
    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${company_name}_custom.xlsx`);
  };

  const handleExport = () => {
    const uniqueFieldNames = getUniqueFieldNames();
    const data = submissions.map((submission) => {
      const formattedFields = submission.fields.reduce((acc, field) => {
        acc[field.fieldName] = field.value;
        return acc;
      }, {});
      return { 
        // Email: submission.studentId?.email || '',
        // Category: submission.studentId?.category || '',
        ...formattedFields, 
        Resume: submission.resumeUrl 
      };
    });
    exportToExcel(data, company_name);
  };

  const handleRemove = async (submissionId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently remove the student.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `${import.meta.env.REACT_APP_BASE_URL}/api/form-submissions/${submissionId}`,
            { withCredentials: true }
          );
          setSubmissions(submissions.filter((submission) => submission._id !== submissionId));
          Swal.fire("Removed!", "The student has been removed.", "success");
        } catch (err) {
          console.error(err);
          Swal.fire("Error!", "There was an error removing the student.", "error");
        }
      }
    });
  };

  const handleRemoveAll = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently remove all students.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove all!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `${import.meta.env.REACT_APP_BASE_URL}/api/form-submissions/delete-all/${jobId}`,
            { withCredentials: true }
          );
          setSubmissions([]);
          Swal.fire("Removed!", "All students have been removed.", "success");
        } catch (err) {
          console.error(err);
          Swal.fire("Error!", "There was an error removing the students.", "error");
        }
      }
    });
  };

  const handleMakeVisibleToAll = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "All students will be made visible to the recruiter.",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, make visible!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const updatedSubmissions = submissions.map((submission) => ({
            ...submission,
            isVisible: true,
          }));
          await axios.patch(
            `${import.meta.env.REACT_APP_BASE_URL}/api/form-submissions/make-visible/${jobId}`,
            { isVisible: true },
            { withCredentials: true }
          );
          setSubmissions(updatedSubmissions);
          Swal.fire("Made Visible!", "All students are now visible to the recruiter.", "success");
        } catch (err) {
          console.error(err);
          Swal.fire("Error!", "There was an error making the students visible.", "error");
        }
      }
    });
  };

  const handleSendEmails = async () => {
    const emails = submissions
      .map((submission) => (submission.studentId ? submission.studentId.email : null))
      .filter((email) => email);
  
    if (emails.length === 0) {
      Swal.fire("No Emails!", "No valid email addresses found.", "warning");
      return;
    }
    const contactInfo = `
      \n\n\n
      Dr Rajeev Trehan 
      Head, Placement (Mobile No.: +91-8146500951)
      Dr Ajay Gupta
      Head, Training (Mobile No.: +91-9501030373)
      Dr Om Prakash Verma
      Head, Internship (Mobile No.: +91-7579279839)
      Dr Shefali Arora Chouhan
      Coordinator Placement (Mobile No.: +91-9888813400)
      Centre of Training and Placement
      Dr. B. R. Ambedkar National Institute of Technology, Jalandhar 
      Punjab (India)-144008
      Email ID: ctp@nitj.ac.in/ hctp@nitj.ac.in
    `;
  
    Swal.fire({
      title: "Draft Email",
      html:
        `<div class="swal2-input-group">
          <input id="swal-input1" class="swal2-input" placeholder="Enter email subject">
        </div>` +
        `<div class="swal2-input-group">
          <textarea id="swal-input2" class="swal2-textarea" placeholder="Write your email here"></textarea>
        </div>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Send Email",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      customClass: {
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        input: "custom-swal-input",
        textarea: "custom-swal-textarea",
        confirmButton: "custom-swal-confirm-button",
        cancelButton: "custom-swal-cancel-button",
      },
      preConfirm: () => {
        return {
          subject: document.getElementById("swal-input1").value,
          text: document.getElementById("swal-input2").value + contactInfo, // Append contact info
        };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(
            `${import.meta.env.REACT_APP_BASE_URL}/nodemailer/send-emails`,
            { emails, subject: result.value.subject, text: result.value.text },
            { withCredentials: true }
          );
          Swal.fire("Emails Sent!", "All emails have been sent successfully.", "success");
        } catch (err) {
          console.error(err);
          Swal.fire("Error!", "There was an error sending the emails.", "error");
        }
      }
    });
  };

  const getUniqueFieldNames = () => {
    const fieldNames = new Set();
    submissions.forEach((submission) => {
      submission.fields.forEach((field) => {
        fieldNames.add(field.fieldName);
      });
    });
    return Array.from(fieldNames);
  };

  const uniqueFieldNames = getUniqueFieldNames();

  // Sorting Logic
  const sortedSubmissions = React.useMemo(() => {
    let sortableItems = [...submissions];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a.fields.find((field) => field.fieldName === sortConfig.key)?.value || "";
        const bValue = b.fields.find((field) => field.fieldName === sortConfig.key)?.value || "";
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [submissions, sortConfig]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedSubmissions.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-10">
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <svg
            className="w-16 h-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4 text-lg font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="flex flex-col items-center justify-center py-12">
          <UserX className="w-24 h-24 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No Applications Yet
          </h2>
          <p className="text-gray-500 text-center mb-6">
            No student applied yet for this position.
            <br />
            Check back later for new submissions.
          </p>
          <div className="w-32 h-1 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  const allExportColumns = [ ...uniqueFieldNames, 'Resume'];

  return (
    <>
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold mb-6 text-center">Students <span className="text-custom-blue">Applied</span></h1>
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
            onClick={handleExport}
          >
            Download Excel
          </button>
          <button
            className="bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors"
            onClick={() => setShowCustomModal(true)}
          >
            Download Customized Excel
          </button>
          <button
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
            onClick={handleRemoveAll}
          >
            Remove All Students
          </button>
          {/* <button
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            onClick={handleMakeVisibleToAll}
          >
            Make All Visible to Recruiter
          </button> */}
          <button
            className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors"
            onClick={handleSendEmails}
          >
            Send Emails to All Students
          </button>
          <div className="text-2xl text-custom-blue font-semibold mb-4 ml-auto">
            {submissions.length} <span className="text-black text-2xl">Students</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2 bg-gray-50">
                  College Mail Id
                </th>
                <th className="border border-gray-300 px-4 py-2 bg-gray-50">
                  Category
                </th>
                {uniqueFieldNames.map((fieldName, index) => (
                  <th
                    key={index}
                    className="border border-gray-300 px-4 py-2 bg-gray-50 cursor-pointer"
                    onClick={() => requestSort(fieldName)}
                  >
                    {fieldName}
                    {sortConfig.key === fieldName && (
                      <span className="ml-2">
                        {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                ))}
                <th className="border border-gray-300 px-4 py-2 bg-gray-50">
                  Resume
                </th>
                <th className="border border-gray-300 px-4 py-2 bg-gray-50">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((submission, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    {submission.studentId?submission.studentId.email:"NA"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {submission.studentId?submission.studentId.category:"NA"}
                  </td>
                  {uniqueFieldNames.map((fieldName, fieldIndex) => {
                    const field = submission.fields.find((f) => f.fieldName === fieldName);
                    return (
                      <td
                        key={fieldIndex}
                        className="border border-gray-300 px-4 py-2"
                      >
                        {field ? field.value : ""}
                      </td>
                    );
                  })}
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                      onClick={() => {
                        const url = submission.resumeUrl.startsWith("http")
                          ? submission.resumeUrl
                          : `https://${submission.resumeUrl}`;
                        window.open(url, "_blank");
                      }}
                    >
                      View
                    </button>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                      onClick={() => handleRemove(submission._id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-4">
          {Array.from({ length: Math.ceil(submissions.length / itemsPerPage) }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`mx-1 px-4 py-2 rounded-lg ${
                currentPage === i + 1 ? 'bg-custom-blue text-white' : 'bg-gray-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>


    {/* custom download modal */}


      {showCustomModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-custom-blue px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Add Custom Columns</h2>
        <button
          onClick={() => setShowCustomModal(false)}
          className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Form Section */}
        <div className="bg-gray-50 rounded-lg p-5 space-y-4 border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Insert After
            </label>
            <select
              value={newEntry.insertAfter}
              onChange={(e) => setNewEntry({...newEntry, insertAfter: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            >
              <option value="">Select Column</option>
              {allExportColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Column Name
            </label>
            <input
              type="text"
              value={newEntry.newName}
              onChange={(e) => setNewEntry({...newEntry, newName: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              placeholder="e.g., Student Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Property
            </label>
            <select
              value={newEntry.property}
              onChange={(e) => setNewEntry({...newEntry, property: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            >
              <option value="">Select Property</option>
              {properties.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              if (newEntry.insertAfter && newEntry.newName && newEntry.property) {
                setCustomEntries([...customEntries, {...newEntry}]);
                setNewEntry({insertAfter: '', newName: '', property: ''});
              } else {
                Swal.fire('Incomplete', 'Please fill all fields', 'warning');
              }
            }}
            className="w-full bg-custom-blue text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Add Entry
          </button>
        </div>

        {/* Added Entries Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            Added Entries
            {customEntries.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                {customEntries.length}
              </span>
            )}
          </h3>
          
          {customEntries.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="text-gray-400 text-3xl mb-2">⚠</div>
              <p className="text-gray-500 text-sm">No entries added yet.</p>
              <p className="text-gray-400 text-xs mt-1">Fill the form above to add custom columns</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customEntries.map((entry, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-blue-300 transition-colors group"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{entry.newName}</div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      Property: <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{entry.property}</span>
                      {' • '}
                      After: <span className="text-gray-700">{entry.insertAfter}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setCustomEntries(customEntries.filter((_,i) => i !== idx))}
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-2 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-3">
        <button
          onClick={() => setShowCustomModal(false)}
          className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (customEntries.length === 0) {
              Swal.fire('No Entries', 'Please add at least one custom column', 'warning');
              return;
            }
            exportCustomExcel(customEntries);
            setShowCustomModal(false);
            setCustomEntries([]);
          }}
          className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          disabled={customEntries.length === 0}
        >
         Download Excel
        </button>
      </div>
    </div>
  </div>
)}

      {/* {showCustomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Custom Columns</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Insert After:</label>
              <select 
                value={newEntry.insertAfter} 
                onChange={e => setNewEntry({...newEntry, insertAfter: e.target.value})} 
                className="w-full p-2 border rounded"
              >
                <option value="">Select Column</option>
                {allExportColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">New Column Name:</label>
              <input 
                type="text" 
                value={newEntry.newName} 
                onChange={e => setNewEntry({...newEntry, newName: e.target.value})} 
                className="w-full p-2 border rounded" 
                placeholder="e.g., Student Name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Student Property:</label>
              <select 
                value={newEntry.property} 
                onChange={e => setNewEntry({...newEntry, property: e.target.value})} 
                className="w-full p-2 border rounded"
              >
                <option value="">Select Property</option>
                {properties.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => {
                if (newEntry.insertAfter && newEntry.newName && newEntry.property) {
                  setCustomEntries([...customEntries, {...newEntry}]);
                  setNewEntry({insertAfter: '', newName: '', property: ''});
                } else {
                  Swal.fire('Incomplete', 'Please fill all fields', 'warning');
                }
              }} 
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
            >
              Add Entry
            </button>
            <button 
              onClick={() => setShowCustomModal(false)} 
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Added Entries:</h3>
              {customEntries.length === 0 ? (
                <p className="text-gray-500">No entries added yet.</p>
              ) : (
                customEntries.map((entry, idx) => (
                  <div key={idx} className="flex justify-between items-center mb-2 p-2 bg-gray-100 rounded">
                    <span className="text-sm">{entry.newName} ({entry.property}) after {entry.insertAfter}</span>
                    <button 
                      onClick={() => setCustomEntries(customEntries.filter((_,i) => i !== idx))} 
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
            <button 
              onClick={() => {
                if (customEntries.length === 0) {
                  Swal.fire('No Entries', 'Please add at least one custom column', 'warning');
                  return;
                }
                exportCustomExcel(customEntries);
                setShowCustomModal(false);
                setCustomEntries([]);
              }} 
              className="bg-green-500 text-white px-4 py-2 mt-4 w-full rounded hover:bg-green-600"
              disabled={customEntries.length === 0}
            >
              Download Customized Excel
            </button>
          </div>
        </div>
      )} */}
    </>
  );
};

export default AppliedStudentp;