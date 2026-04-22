import React from 'react';

const NOCPreview = ({ noc, onClose }) => {
  const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  const baseURL = import.meta.env.REACT_APP_BASE_URL;
  const isOffCampus = noc.internshipMode === 'Off-Campus';
  const isOwnStartup = noc.internshipMode === 'Own Startup';
  const needsExtra = (noc.course === 'M.Tech' || (noc.course === 'B.Tech' && noc.year === '4th')) && noc.internshipMode !== 'On-Campus';
  const isFTE = noc.purpose === "FTE"

  const handleDocumentClick = (filePath) => {
    if (filePath) {
      window.open(`${baseURL}${filePath}`, '_blank');
    }
  };

  const renderDocumentStatus = (label, uploaded) => (
    <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${uploaded ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200' : 'bg-gray-200 text-gray-600'}`}
          onClick={() => handleDocumentClick(uploaded)}
          style={{ cursor: uploaded ? 'pointer' : 'default' }}>
      {uploaded ? (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          View {label}
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          Not Uploaded
        </>
      )}
    </span>
  );

  return (
    <div className="min-h-screen px-4">
      <div className="rounded-2xl shadow-xl max-w-7xl mx-auto overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold z-10 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition duration-200"
        >
          ×
        </button>
        <div className="p-8 space-y-8">
          {/* Student Details */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-custom-blue rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Student Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem label="Salutation" value={noc.salutation} />
              <DetailItem label="Student Name" value={noc.studentName} />
              <DetailItem label="Roll No" value={noc.rollNo} />
              <DetailItem label="Course" value={noc.course} />
              <DetailItem label="Department" value={noc.department} />
              <DetailItem label="Batch" value={noc.batch} />
              <DetailItem label="Year & Semester" value={`${noc.year} - ${noc.semester}`} colSpan={true} />
              <DetailItem label="Respondent Email" value={noc.respondentEmail} colSpan={true} />
            </div>
          </div>
          {/* Internship Details */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-custom-blue rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">                {isFTE? "FTE Details" : "Internship Details"} 
</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem label="Company Name" value={noc.companyName} />
              
              {isFTE? <>
              <DetailItem
                label="Date Of Joining"
                value={formatDate(noc.dateOfJoining)}
                badge={true}
              />
              </> : <>
              <DetailItem
                label="Internship Mode"
                value={noc.internshipMode}
                badge={true}
              />
              <DetailItem label="From" value={formatDate(noc.internshipFrom)} />
              <DetailItem label="To" value={formatDate(noc.internshipTo)} />
              <DetailItem
                label="Duration"
                value={noc.internshipDuration}
                colSpan={true}
              />
              </>}
            </div>
          </div>
          {isOffCampus && (
            <>
              {/* Contact Person Details */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-custom-blue rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Contact Person Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem label="Name" value={noc.contactPersonName} />
                  <DetailItem label="Designation" value={noc.contactPersonDesignation} />
                  <DetailItem label="Phone" value={noc.contactPersonPhone} />
                  <DetailItem label="Email" value={noc.contactPersonEmail} />
                </div>
              </div>
              {needsExtra && (
                <>
                  {/* Company Details */}
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-custom-blue rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">Company Details</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DetailItem label="Minimum 3 Years Old" value={noc.companyminAgeis3 === 'Yes' ? 'Yes' : 'No'} />
                      <DetailItem label="Turnover Last FY (Crore)" value={noc.companyTurnoverLastFY} />
                      <DetailItem label="Company Type" value={noc.companyType} />
                      <DetailItem label="Stipend (per month)" value={`₹${noc.stipend}`} />
                    </div>
                  </div>
                  {/* Bank Details */}
                  <BankDetailsSection title="Bank Details" bankDetails={noc.bankdetails} />
                  {/* Documents */}
                  <DocumentsSection
                    documents={[
                      { label: 'Offer Letter', uploaded: noc.offerLetter },
                      { label: 'Turnover Report', uploaded: noc.turnoverReport },
                      { label: 'Mail Screenshot', uploaded: noc.mailScreenshot }
                    ]}
                    renderStatus={renderDocumentStatus}
                  />
                </>
              )}
            </>
          )}
          {isOwnStartup && needsExtra && (
            <>
              {/* Startup Details */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-custom-blue rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Startup Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem label="Established Date" value={formatDate(noc.startupEstablishedDate)} />
                  <DetailItem label="Business Registration Type" value={noc.businessRegistrationType} />
                  <DetailItem label="PAN No" value={noc.panNo} />
                  <DetailItem label="GST No" value={noc.gstNo} />
                  <DetailItem label="MSME Registration Category" value={noc.MSMERegistrationCategory} colSpan={true} />
                </div>
              </div>
              {/* Startup Bank Details */}
              <BankDetailsSection title="Startup Bank Details" bankDetails={noc.startupBankDetails} />
              {/* Documents */}
              <DocumentsSection
                documents={[
                  { label: 'Startup India Recognition Certificate', uploaded: noc.startupIndiaRecognitionCertificate }
                ]}
                renderStatus={renderDocumentStatus}
              />
            </>
          )}
          {needsExtra && (
            <>
              {/* Declarations */}
              <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-6 border border-amber-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Declarations</h2>
                </div>
                <ul className="space-y-4">
                  <li className="flex gap-3 items-start">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">I declare that the above information is true and correct to the best of my knowledge.</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">
                      {isOffCampus
                        ? 'I will not be staying in hostel during my internship period even if the company offers work from home facility or even if it is situated near NITJ campus.'
                        : 'I exclusively declare I will not appear for on-campus internship or placement during the internship.'}
                    </span>
                  </li>
                </ul>
              </div>
              {/* Signature */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-custom-blue rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Student Signature</h2>
                </div>
                <div className={`p-4 rounded-lg ${noc.signature ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                  {noc.signature ? (
                    <div className="flex flex-col items-center gap-2">
                      <img 
                        src={`${baseURL}${noc.signature}`} 
                        alt="Student Signature" 
                        className="max-w-full max-h-32 object-contain border border-gray-300 rounded"
                        onClick={() => handleDocumentClick(noc.signature)}
                        style={{ cursor: 'pointer' }}
                      />
                      {/* <span className="text-green-700 font-medium text-sm">Click to enlarge</span> */}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-500">Signature not uploaded</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          {noc.nocLetter && (
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Generated NOC Letter</h2>
              <iframe
                src={`${baseURL}${noc.nocLetter}`}
                width="100%"
                height="600px"
                className="border-2 border-blue-200 rounded-lg shadow-inner"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, colSpan, badge }) => (
  <div className={colSpan ? 'md:col-span-2' : ''}>
    <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
    {badge ? (
      <span className="inline-block px-3 py-1 bg-custom-blue text-white rounded-full text-sm font-medium">
        {value}
      </span>
    ) : (
      <p className="text-base font-semibold text-gray-900">{value}</p>
    )}
  </div>
);

const BankDetailsSection = ({ title, bankDetails }) => (
  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 shadow-sm">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-custom-blue rounded-lg">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DetailItem label="Bank Name" value={bankDetails?.bankName || 'N/A'} />
      <DetailItem label="Account Number" value={bankDetails?.accountNumber || 'N/A'} />
      <DetailItem label="Account Holder Name" value={bankDetails?.accountHolderName || 'N/A'} />
      <DetailItem label="IFSC Code" value={bankDetails?.ifscCode || 'N/A'} />
    </div>
  </div>
);

const DocumentsSection = ({ documents, renderStatus }) => (
  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 shadow-sm">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-custom-blue rounded-lg">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800">Uploaded Documents</h2>
    </div>
    <ul className="space-y-3">
      {documents.map((doc, index) => (
        <li key={index} className={`flex items-center justify-between p-4 rounded-lg ${doc.uploaded ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
          <span className="font-medium text-gray-800">{doc.label}</span>
          {renderStatus(doc.label, doc.uploaded)}
        </li>
      ))}
    </ul>
  </div>
);

export default NOCPreview;