import React from 'react';
import { Download } from 'lucide-react';
import { pdf, Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Assuming you have a way to load the NIT Jalandhar logo (replace with actual path or base64)
import NITJlogo from "../../assets/nitj-logo.png"; // Replace with actual logo path or base64
import NotoSansDevanagari from '../../assets/fonts/NotoSansDevanagari-Regular.ttf';

Font.register({
  family: 'NotoSansDevanagari',
  src: NotoSansDevanagari,
});

const CardSkeleton = () => (
  <div className="space-y-3 p-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse space-y-2 p-3">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    ))}
  </div>
);

// Styles aligned with PlacementPDF
const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', backgroundColor: '#f9fafb' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20, 
  },
  logo: { width: 60, height: 65, marginRight: 15 },
  headerText: { flex: 1 },
  collegeNameHindi: {
    textAlign: 'center',
    marginBottom: 5,
    fontSize: 15, 
    fontWeight: 'bold', 
    color: '#1f2937', 
    fontFamily: 'NotoSansDevanagari'
  },
  collegeNameEnglish: {
    textAlign: 'center', 
    fontSize: 13, 
    fontWeight: 'bold', 
    color: '#1f2937', 
    fontFamily: 'Helvetica'
  },
  headerMetadata: { 
    fontSize: 8, 
    color: '#9ca3af', 
    textAlign: 'right', 
    marginTop: 5 
  },
  section: { marginBottom: 20 },
  sectionTitle: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#1f2937',  
    marginBottom: 10, 
    borderBottom: '1px solid #d1d5db' 
  },
  gridRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10 
  },
  gridItem: { 
    width: '33.33%', // 3 columns
    flexDirection: 'row',
    marginBottom: 2
  },
  label: { width: 100, fontSize: 10, color: '#1f2937', fontWeight: 'semibold', fontFamily: 'Helvetica' },
  value: { fontSize: 10, color: '#1f2937', flex: 1, fontFamily: 'Helvetica' },
  table: { 
    border: '1px solid #e5e7eb', 
    borderRadius: 4, 
    overflow: 'hidden' 
  },
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#e5e7eb', 
    padding: 8 
  },
  tableRow: { 
    flexDirection: 'row', 
    padding: 8, 
    borderTop: '1px solid #e5e7eb' 
  },
  tableCell: { 
    fontSize: 9, 
    color: '#1f2937',
    textAlign: 'left', 
    fontFamily: 'Helvetica' 
  },
  footer: { 
    fontSize: 8, 
    color: '#9ca3af', 
    textAlign: 'center', 
    position: 'absolute', 
    bottom: 20, 
    left: 0, 
    right: 0, 
    fontFamily: 'Helvetica' 
  }
});

const PlacementPDF = ({ placement }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image src={NITJlogo} style={styles.logo} />
        <View style={styles.headerText}>
          <Text style={styles.collegeNameHindi}>
            डॉ बी आर अंबेडकर राष्ट्रीय प्रौद्योगिकी संस्थान जालंधर
          </Text>
          <Text style={styles.collegeNameEnglish}>
            Dr B R Ambedkar National Institute of Technology, Jalandhar - 144008
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Placement Information</Text>
        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Company Name:</Text>
            <Text style={styles.value}>{placement.company_name || 'N/A'}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Batch:</Text>
            <Text style={styles.value}>{placement.batch || 'N/A'}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Course:</Text>
            <Text style={styles.value}>{placement.course || 'N/A'}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Offer Mode:</Text>
            <Text style={styles.value}>{placement.offer_mode || 'N/A'}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Offer Sector:</Text>
            <Text style={styles.value}>{placement.offer_sector || 'N/A'}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>Result Date:</Text>
            <Text style={styles.value}>
              {placement.result_date 
                ? new Date(placement.result_date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })
                : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Selected Students</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { fontWeight: 'semibold', flex: 1, marginRight: 10 }]}>Student Name</Text>
            <Text style={[styles.tableCell, { fontWeight: 'semibold', flex: 1 }]}>Gender</Text>
            <Text style={[styles.tableCell, { fontWeight: 'semibold', flex: 1, marginRight: 10 }]}>Department</Text>
            <Text style={[styles.tableCell, { fontWeight: 'semibold', flex: 1 }]}>Job Type</Text>
            <Text style={[styles.tableCell, { fontWeight: 'semibold', flex: 1 }]}>Job Role</Text>
            <Text style={[styles.tableCell, { fontWeight: 'semibold', flex: 1 }]}>CTC</Text>
            <Text style={[styles.tableCell, { fontWeight: 'semibold', flex: 1 }]}>Stipend</Text>
            <Text style={[styles.tableCell, { fontWeight: 'semibold', flex: 1 }]}>Duration</Text>
          </View>
          {placement?.shortlisted_students?.length > 0 ? (
            placement.shortlisted_students.map((student, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1, marginRight: 10 }]}>{student.name || 'N/A'}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{student.gender || 'N/A'}</Text>
                <Text style={[styles.tableCell, { flex: 1, marginRight: 10 }]}>{student.department || 'N/A'}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{student.job_type || 'N/A'}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{student.job_role || 'N/A'}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{student.ctc || 'N/A'}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{student.stipend || 'N/A'}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{student.intern_duration || 'N/A'}</Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 8 }]}>
                No students shortlisted yet.
              </Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.footer}>
        Shortlisting generated from NITJ Placement Portal
        <View style={styles.headerMetadata}>
          <Text>
            Generated on {new Date().toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </Text>
    </Page>
  </Document>
);

const PlacementDetailsDownload = ({ placement }) => {
  if (!placement) return null;

  const downloadPDF = async () => {
    const blob = await pdf(<PlacementPDF placement={placement} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${placement.company_name || 'placement'}-details-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="px-4 py-3 bg-white rounded-lg hover:bg-blue-50 transition-colors duration-200 border-l-3 border hover:border-custom-blue relative cursor-pointer"
      onClick={downloadPDF}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-md font-semibold text-gray-800 mb-1">
            {placement.company_name || 'N/A'}
          </div>
          <div className="text-xs text-gray-600">
            {`${placement.offer_mode || 'N/A'} - ${placement.course || 'N/A'}`}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {placement.result_date 
              ? new Date(placement.result_date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }).split('/').join('')
              : new Date(placement.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }).split('/').join('')}
          </div>
        </div>
        <Download
          className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        />
      </div>
    </div>
  );
};

const RecentPlacement = ({ placements = [], loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl h-[320px]">
        <div className="px-4 py-3 bg-custom-blue text-white">
          <h2 className="text-lg font-medium">Recent Placements Result</h2>
        </div>
        <CardSkeleton />
      </div>
    );
  }

  if (!Array.isArray(placements)) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl h-[320px]">
        <div className="px-4 py-3 bg-custom-blue text-white">
          <h2 className="text-lg font-medium">Recent Placements Result</h2>
        </div>
        <div className="p-6 text-center text-gray-600">
          No placement data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl h-[320px]">
      <div className="px-4 py-3 bg-custom-blue text-white">
        <h2 className="text-lg font-medium">Recent Placements Result</h2>
      </div>
      <div className="h-[calc(100%-48px)] overflow-hidden">
        {loading ? (
          <CardSkeleton />
        ) : placements.length === 0 ? (
          <div className="h-full flex items-center justify-center p-4">
            <div className="p-6 bg-white rounded-lg text-center w-full max-w-md mx-auto">
              <div className="flex justify-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-custom-blue animate-bounce"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-800 font-medium">
                No Recent Placements
              </p>
              <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
            </div>
          </div>
        ) : (
          <div className="scroll-container">
            <div className="scroll-content">
              {placements.map((placement, index) => (
                <div
                  key={placement._id || index}
                  className="group relative px-4 py-3"
                >
                  <PlacementDetailsDownload placement={placement} />
                </div>
              ))}
              {placements.map((placement, index) => (
                <div
                  key={`duplicate-${placement._id || index}`}
                  className="group relative px-4 py-3"
                >
                  <PlacementDetailsDownload placement={placement} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .scroll-container {
          height: 100%;
          overflow: hidden;
          position: relative;
        }
        .scroll-content {
          animation: auto-scroll 20s linear infinite;
          display: flex;
          flex-direction: column;
        }
        .scroll-container:hover .scroll-content {
          animation-play-state: paused;
        }
        @keyframes auto-scroll {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default RecentPlacement;