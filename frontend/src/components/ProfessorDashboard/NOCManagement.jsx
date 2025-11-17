// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { FaDownload, FaEye, FaFastBackward, FaFastForward, FaTimes } from 'react-icons/fa';
// import GenerateNOC from './generate-noc';

// const NOCManagement = () => {
//   const [nocs, setNocs] = useState([]);
//   const [filteredNocs, setFilteredNocs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showContactPopup, setShowContactPopup] = useState(false);
//   const [selectedContact, setSelectedContact] = useState(null);
//   const nocsPerPage = 50;

//   // Fetch NOCs with pagination
//   useEffect(() => {
//     const fetchNOCs = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/noc/getonp`, {
//           params: { page: currentPage, limit: nocsPerPage },
//           withCredentials: true,
//         });
//         setNocs(response.data.nocs);
//         setFilteredNocs(response.data.nocs);
//         setTotalPages(Math.ceil(response.data.total / nocsPerPage));
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching NOCs:', error);
//         showToast('Failed to fetch NOCs. Please try again!', 'error');
//         setLoading(false);
//       }
//     };
//     fetchNOCs();
//   }, [currentPage]);

//   // Handle search filter
//   const handleSearch = (e) => {
//     const query = e.target.value.toLowerCase();
//     setSearchQuery(query);
//     if (query === '') {
//       setFilteredNocs(nocs);
//     } else {
//       const filtered = nocs.filter((noc) =>
//         noc.rollNo.toLowerCase().includes(query)
//       );
//       setFilteredNocs(filtered);
//     }
//   };

//   // Show toast
//   const showToast = (message, type = 'info') => {
//     setToast({ show: true, message, type });
//     setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
//   };

//   // Handle page change
//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };

//   // Handle jump to page
//   const handleJumpToPage = (e) => {
//     const page = parseInt(e.target.value, 10);
//     if (!isNaN(page) && page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };

//   // View offer letter
//   const handleViewOfferLetter = (offerLetterUrl, nocId) => {
//     if (offerLetterUrl) {
//       window.open(`${import.meta.env.REACT_APP_BASE_URL}${offerLetterUrl}`, '_blank');
//     } else {
//       showToast('No offer letter uploaded yet!', 'error');
//     }
//   };

//   // Show contact popup
//   const handleShowContact = (noc) => {
//     setSelectedContact({
//       name: noc.contactPersonName,
//       designation: noc.contactPersonDesignation,
//       email: noc.contactPersonEmail,
//       phone: noc.contactPersonPhone,
//     });
//     setShowContactPopup(true);
//   };

//   // Close contact popup
//   const handleClosePopup = () => {
//     setShowContactPopup(false);
//     setSelectedContact(null);
//   };

 

//   const renderNOCList = () => {
//     const startRange = (currentPage - 1) * nocsPerPage + 1;
//     const endRange = Math.min(currentPage * nocsPerPage, nocs.length);
//     const totalItems = totalPages * nocsPerPage;

//     const maxPagesToShow = 5;
//     const halfPagesToShow = Math.floor(maxPagesToShow / 2);
//     let startPage = Math.max(1, currentPage - halfPagesToShow);
//     let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

//     if (endPage - startPage + 1 < maxPagesToShow) {
//       startPage = Math.max(1, endPage - maxPagesToShow + 1);
//     }

//     const pageNumbers = [];
//     for (let i = startPage; i <= endPage; i++) {
//       pageNumbers.push(i);
//     }

//     return (
//       <div className="space-y-6 animate-fade-in">
//         <div className="flex items-center justify-between">
//           <h2 className="text-3xl font-bold flex items-center space-x-3 text-gray-900">
//             <span>NOC <span className="text-custom-blue">Management</span></span>
//           </h2>
//           <div className="flex items-center space-x-3">
//             <input
//               type="text"
//               placeholder="Search by Roll No..."
//               value={searchQuery}
//               onChange={handleSearch}
//               className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-blue"
//             />
//           </div>
//         </div>
//         {loading ? (
//           <div className="flex items-center justify-center min-h-[400px]">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-blue"></div>
//           </div>
//         ) : filteredNocs?.length === 0 ? (
//           <p className="text-gray-600 italic">No NOCs available.</p>
//         ) : (
//           <>
//             <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//               {filteredNocs?.map((noc) => (
//                 <div
//                   key={noc._id}
//                   className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100 relative"
//                 >
//                   <button
//                     onClick={() => handleShowContact(noc)}
//                     className="absolute top-3 right-3 text-custom-blue hover:text-custom-blue-dark"
//                     title="View Contact Info"
//                   >
//                     <FaEye size={18} />
//                   </button>
//                   <p className="text-lg font-semibold text-gray-900">{noc.companyName}</p>
//                   <p className="text-xs text-custom-blue bg-custom-blue/10 p-1 rounded-lg inline-block font-semibold mt-1"># {noc.nocId}</p>
//                   <p className="text-xs text-gray-600 mt-2">Student: {noc.studentName}</p>
//                   <p className="text-xs text-gray-600 mt-1">Email: {noc.respondentEmail}</p>
//                   <p className="text-xs text-gray-600 mt-1">
//                     Submitted: {new Date(noc.dateSubmitted).toLocaleDateString('en-GB', {
//                       day: '2-digit',
//                       month: '2-digit',
//                       year: 'numeric',
//                     })}
//                   </p>
//                   <div className="flex flex-wrap gap-2 mt-4">
//                     <button
//                       onClick={() => GenerateNOC(noc)}
//                       className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
//                     >
//                       <FaDownload />
//                       <span>Download NOC</span>
//                     </button>
//                     <button
//                       onClick={() => handleViewOfferLetter(noc.offerLetter, noc._id)}
//                       className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
//                     >
//                       <FaEye />
//                       <span>View Offer Letter</span>
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div className="flex items-center justify-between mt-6">
//               <span className="text-gray-600">
//                 {startRange} - {endRange} / {totalItems}
//               </span>
//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={() => handlePageChange(1)}
//                   disabled={currentPage === 1}
//                   className={`px-2 py-1 rounded-md ${
//                     currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-custom-blue hover:bg-custom-blue/10'
//                   }`}
//                 >
//                   <FaFastBackward />
//                 </button>
//                 <button
//                   onClick={() => handlePageChange(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   className={`px-2 py-1 rounded-md ${
//                     currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-custom-blue hover:bg-blue-100'
//                   }`}
//                 >
//                   ◄
//                 </button>
//                 {pageNumbers.map((page) => (
//                   <button
//                     key={page}
//                     onClick={() => handlePageChange(page)}
//                     className={`px-3 py-1 rounded-md ${
//                       currentPage === page
//                         ? 'border border-custom-blue text-custom-blue'
//                         : 'text-custom-blue hover:bg-custom-blue/10'
//                     }`}
//                   >
//                     {page}
//                   </button>
//                 ))}
//                 <button
//                   onClick={() => handlePageChange(currentPage + 1)}
//                   disabled={currentPage === totalPages}
//                   className={`px-2 py-1 rounded-md ${
//                     currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-custom-blue hover:bg-blue-100'
//                   }`}
//                 >
//                   ►
//                 </button>
//                 <button
//                   onClick={() => handlePageChange(totalPages)}
//                   disabled={currentPage === totalPages}
//                   className={`px-2 py-1 rounded-md ${
//                     currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-custom-blue hover:bg-blue-100'
//                   }`}
//                 >
//                   <FaFastForward />
//                 </button>
//                 <div className="flex items-center space-x-2">
//                   <span className="text-gray-600">Jump to</span>
//                   <input
//                     type="number"
//                     min="1"
//                     max={totalPages}
//                     value={currentPage}
//                     onChange={handleJumpToPage}
//                     className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-blue"
//                   />
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//         {showContactPopup && selectedContact && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
//             <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl relative transform transition-all animate-fade-in">
//               <button
//                 onClick={handleClosePopup}
//                 className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
//                 title="Close"
//               >
//                 <FaTimes size={20} />
//               </button>
//               <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Person Information</h3>
//               <div className="space-y-3">
//                 <div className="flex items-center space-x-2">
//                   <span className="font-semibold text-gray-700">Name:</span>
//                   <span className="text-gray-600">{selectedContact.name}</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <span className="font-semibold text-gray-700">Designation:</span>
//                   <span className="text-gray-600">{selectedContact.designation}</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <span className="font-semibold text-gray-700">Email:</span>
//                   <a
//                     href={`mailto:${selectedContact.email}`}
//                     className="text-custom-blue hover:underline"
//                   >
//                     {selectedContact.email}
//                   </a>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <span className="font-semibold text-gray-700">Phone:</span>
//                   <a
//                     href={`tel:${selectedContact.phone}`}
//                     className="text-custom-blue hover:underline"
//                   >
//                     {selectedContact.phone}
//                   </a>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="container mx-auto p-6 min-h-screen">
//       {toast.show && (
//         <div
//           className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg animate-fade-in-out z-[1000] ${
//             toast.type === 'error'
//               ? 'bg-white border border-red-500 text-red-500'
//               : toast.type === 'success'
//               ? 'bg-white border border-green-500 text-green-500'
//               : 'bg-white border border-custom-blue text-custom-blue'
//           }`}
//         >
//           {toast.message}
//         </div>
//       )}
//       {renderNOCList()}
//     </div>
//   );
// };

// export default NOCManagement;



import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDownload, FaEye, FaFastBackward, FaFastForward, FaTimes } from 'react-icons/fa';
import GenerateNOC from './generate-noc';

const NOCManagement = () => {
  const [allNocs, setAllNocs] = useState([]);
  const [displayedNocs, setDisplayedNocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState('tpo');
  const [activeSubTab, setActiveSubTab] = useState('on-campus');
  const [activeStatus, setActiveStatus] = useState('pending');
  const nocsPerPage = 50;
  const HIGH_LIMIT = 10000; // Fetch a high limit to get all records for client-side filtering/pagination

  // Fetch all NOCs once
  useEffect(() => {
    const fetchAllNOCs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/noc/getonp`, {
          params: { page: 1, limit: HIGH_LIMIT },
          withCredentials: true,
        });
        setAllNocs(response.data.nocs || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching NOCs:', error);
        showToast('Failed to fetch NOCs. Please try again!', 'error');
        setLoading(false);
      }
    };
    fetchAllNOCs();
  }, []);

  // Reset page and update displayed NOCs when tabs or search change
  useEffect(() => {
    setCurrentPage(1);
    updateDisplayedNocs();
  }, [activeMainTab, activeSubTab, activeStatus, searchQuery, allNocs]);

  const updateDisplayedNocs = () => {
    // Filter for main tabs
    const isLowYearBTech = (noc) => {
      const yearLower = noc.year?.toLowerCase() || '';
      return ['1st', '2nd', '3rd'].some(y => yearLower.includes(y)) && noc.course?.toLowerCase() === 'b.tech';
    };
    const departmentNocs = allNocs.filter(isLowYearBTech);
    const tpoNocs = allNocs.filter(noc => !isLowYearBTech(noc));

    let statusFiltered = [];
    if (activeMainTab === 'department') {
      statusFiltered = departmentNocs.filter(noc => 
        noc.nocStatus?.toLowerCase() === activeStatus
      );
    } else {
      // TPO sub-filter
      const subFiltered = activeSubTab === 'on-campus'
        ? tpoNocs.filter(noc => noc.internshipMode?.toLowerCase() === 'on-campus')
        : tpoNocs.filter(noc => noc.internshipMode?.toLowerCase() !== 'on-campus');
      statusFiltered = subFiltered.filter(noc => 
        noc.nocStatus?.toLowerCase() === activeStatus
      );
    }

    // Apply search
    const searchFiltered = statusFiltered.filter(noc =>
      noc.rollNo?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Client-side pagination
    const total = searchFiltered.length;
    setTotalPages(Math.ceil(total / nocsPerPage));
    const startIdx = (currentPage - 1) * nocsPerPage;
    const endIdx = startIdx + nocsPerPage;
    setDisplayedNocs(searchFiltered.slice(startIdx, endIdx));
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Show toast
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle jump to page
  const handleJumpToPage = (e) => {
    const page = parseInt(e.target.value, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // View offer letter
  const handleViewDocument = (Url, nocId) => {
    if (Url) {
      window.open(`${import.meta.env.REACT_APP_BASE_URL}${Url}`, '_blank');
    } else {
      showToast('Document not uploaded yet!', 'error');
    }
  };

  // Show contact popup
  const handleShowContact = (noc) => {
    setSelectedContact({
      name: noc.contactPersonName,
      designation: noc.contactPersonDesignation,
      email: noc.contactPersonEmail,
      phone: noc.contactPersonPhone,
    });
    setShowContactPopup(true);
  };

  // Close contact popup
  const handleClosePopup = () => {
    setShowContactPopup(false);
    setSelectedContact(null);
  };

  const renderSubAndStatusTabs = () => (
    <div className="space-y-4">
      {/* On-Campus / Off-Campus Sub-Tabs for TPO */}
      {activeMainTab === 'tpo' && (
        <div className="pl-4 flex justify-start">
          <div className="flex border border-gray-300 rounded-3xl bg-white">
            <button
              className={`px-4 py-2 rounded-3xl ${
                activeSubTab === 'on-campus' ? 'bg-custom-blue text-white' : 'bg-white text-gray-700'
              }`}
              onClick={() => {
                setActiveSubTab('on-campus');
                setActiveStatus('pending');
              }}
            >
              On-Campus
            </button>
            <button
              className={`px-4 py-2 rounded-3xl ${
                activeSubTab === 'off-campus' ? 'bg-custom-blue text-white' : 'bg-white text-gray-700'
              }`}
              onClick={() => {
                setActiveSubTab('off-campus');
                setActiveStatus('pending');
              }}
            >
              Off-Campus
            </button>
          </div>
        </div>
      )}

      {/* Status Tabs */}
      <div className={`flex space-x-1 border-b border-gray-200 ${activeMainTab === 'tpo' ? 'ml-8 pl-4' : 'ml-4'}`}>
        {['pending', 'issued', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`py-2 px-4 font-medium text-sm rounded-t-lg transition-colors ${
              activeStatus === status
                ? 'border-b-2 border-custom-blue text-custom-blue'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );

  const renderNOCList = () => {
    const startRange = (currentPage - 1) * nocsPerPage + 1;
    const endRange = Math.min(currentPage * nocsPerPage, displayedNocs.length);
    const totalItems = displayedNocs.length; // Client-side total

    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);
    let startPage = Math.max(1, currentPage - halfPagesToShow);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Main Header with TPO/Department Tabs */}
        <div className="flex sm:flex-row flex-col justify-between items-center p-2 rounded-t-lg bg-white">
          <h2 className="text-3xl font-bold flex items-center space-x-3 text-gray-900">
            <span>NOC <span className="text-custom-blue">Management</span></span>
          </h2>
          <div className="flex items-center space-x-3">
            {/* <input
              type="text"
              placeholder="Search by Roll No..."
              value={searchQuery}
              onChange={handleSearch}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-blue"
            /> */}
            <div className="flex border border-gray-300 rounded-3xl bg-white">
              <button
                className={`px-4 py-2 rounded-3xl ${
                  activeMainTab === 'tpo' ? 'bg-custom-blue text-white' : 'bg-white text-gray-700'
                }`}
                onClick={() => {
                  setActiveMainTab('tpo');
                  setActiveSubTab('on-campus');
                  setActiveStatus('pending');
                }}
              >
                TPO
              </button>
              <button
                className={`px-4 py-2 rounded-3xl ${
                  activeMainTab === 'department' ? 'bg-custom-blue text-white' : 'bg-white text-gray-700'
                }`}
                onClick={() => {
                  setActiveMainTab('department');
                  setActiveStatus('pending');
                }}
              >
                Department
              </button>
            </div>
          </div>
        </div>

        {renderSubAndStatusTabs()}

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-blue"></div>
          </div>
        ) : displayedNocs.length === 0 ? (
          <p className="text-gray-600 italic">No NOCs available for the selected filters.</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayedNocs.map((noc) => (
                <div
                  key={noc._id}
                  className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100 relative"
                >
                  <button
                    onClick={() => handleShowContact(noc)}
                    className="absolute top-3 right-3 text-custom-blue hover:text-custom-blue-dark"
                    title="View Contact Info"
                  >
                    <FaEye size={18} />
                  </button>
                  <p className="text-lg font-semibold text-gray-900">{noc.companyName}</p>
                  <p className="text-xs text-custom-blue bg-custom-blue/10 p-1 rounded-lg inline-block font-semibold mt-1"># {noc.nocId}</p>
                  <p className="text-xs text-gray-600 mt-2">Student: {noc.studentName}</p>
                  <p className="text-xs text-gray-600 mt-1">Email: {noc.respondentEmail}</p>
                  <p className="text-xs text-gray-600 mt-1">
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
                      <span>Download NOC</span>
                    </button>
                    <button
                      onClick={() => handleViewDocument(noc.offerLetter, noc._id)}
                      className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
                    >
                      <FaEye />
                      <span>View Offer Letter</span>
                    </button>
                    <button
                      onClick={() => handleViewDocument(noc.turnoverReport, noc._id)}
                      className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
                    >
                      <FaEye />
                      <span>View TurnOver</span>
                    </button>
                    <button
                      onClick={() => handleViewDocument(noc.mailScreenshot, noc._id)}
                      className="flex items-center space-x-1 text-sm text-custom-blue hover:text-white px-3 py-1 rounded-md border border-custom-blue hover:bg-custom-blue transition duration-300"
                    >
                      <FaEye />
                      <span>View Mail PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-6">
              <span className="text-gray-600">
                {startRange} - {endRange} / {totalItems}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={`px-2 py-1 rounded-md ${
                    currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-custom-blue hover:bg-custom-blue/10'
                  }`}
                >
                  <FaFastBackward />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-2 py-1 rounded-md ${
                    currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-custom-blue hover:bg-blue-100'
                  }`}
                >
                  ◄
                </button>
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                        ? 'border border-custom-blue text-custom-blue'
                        : 'text-custom-blue hover:bg-custom-blue/10'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-2 py-1 rounded-md ${
                    currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-custom-blue hover:bg-blue-100'
                  }`}
                >
                  ►
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-2 py-1 rounded-md ${
                    currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-custom-blue hover:bg-blue-100'
                  }`}
                >
                  <FaFastForward />
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Jump to</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={handleJumpToPage}
                    className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-blue"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Contact Popup */}
        {showContactPopup && selectedContact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl relative transform transition-all animate-fade-in">
              <button
                onClick={handleClosePopup}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                title="Close"
              >
                <FaTimes size={20} />
              </button>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Person Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-700">Name:</span>
                  <span className="text-gray-600">{selectedContact.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-700">Designation:</span>
                  <span className="text-gray-600">{selectedContact.designation}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-700">Email:</span>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="text-custom-blue hover:underline"
                  >
                    {selectedContact.email}
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-700">Phone:</span>
                  <a
                    href={`tel:${selectedContact.phone}`}
                    className="text-custom-blue hover:underline"
                  >
                    {selectedContact.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 min-h-screen">
      {toast.show && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg animate-fade-in-out z-[1000] ${
            toast.type === 'error'
              ? 'bg-white border border-red-500 text-red-500'
              : toast.type === 'success'
              ? 'bg-white border border-green-500 text-green-500'
              : 'bg-white border border-custom-blue text-custom-blue'
          }`}
        >
          {toast.message}
        </div>
      )}
      {renderNOCList()}
    </div>
  );
};

export default NOCManagement;