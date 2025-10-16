import { useState, useEffect } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import axios from 'axios';
import Header from '../components/header';
import Footer from '../components/footer';
import buildFingerprintHeaders from '../utils/fingerprintHeaders';
import { useRef } from 'react';

export default function Brochure() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  // Fetch brochures from backend
  useEffect(() => {
    if (hasFetched.current) return; // Prevent multiple fetches
    hasFetched.current = true;
    
    const fetchBrochures = async () => {
      try {
        const response = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/brochure/get`, {
          headers: {
          ...buildFingerprintHeaders(),
         },
          withCredentials: true, // Include cookies for authentication
        });
        // Map backend data to component's expected structure
        const fetchedDepartments = response.data.data.map((brochure) => ({
          id: brochure._id,
          name: brochure.department_name,
          website: brochure.department_link,
          pdfUrl: brochure.brochure_link, // e.g., /Uploads/brochures/<filename>.pdf
          pdfName: `${brochure.department_name.replace(/\s+/g, '_').toLowerCase()}_Brochure.pdf`, // Format as <department_name>_Brochure.pdf
        }));
        setDepartments(fetchedDepartments);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching brochures:', err);
        setError('Failed to load brochures. Please try again later.');
        setLoading(false);
      }
    };

    fetchBrochures();
  }, []);

  // Download PDF from backend
  const downloadPDF = async (pdfUrl, filename) => {
    try {
      const response = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}${pdfUrl}`, {
        responseType: 'blob', // Handle binary data
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF. Please try again.');
    }
  };



  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-16 text-gray-800">
         Institute & Departmental <span className="text-custom-blue">Brochures</span>
        </h1>

        {loading && departments.length === 0 ? (
 <div className="flex justify-center items-center min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
  </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : departments.length === 0 ? (
          <div className="text-center text-gray-600">No brochures available.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-12 max-w-7xl mx-auto">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full shadow-md hover:shadow-xl min-w-[250px]"
                style={{
                  transform: hoveredCard === dept.id ? 'translateY(-4px)' : 'none',
                }}
                onMouseEnter={() => setHoveredCard(dept.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Top accent bar */}
                <div className="h-2 bg-custom-blue w-full" />
                
                <div className="p-6 flex flex-col flex-grow">
                  {/* Department name with proper wrapping */}
                 <h2 className="text-md font-bold  mb-4 whitespace-nowrap overflow-hidden text-ellipsis">

                    {dept.name}
                  </h2>
                  
                  {/* Spacer to push buttons to bottom */}
                  <div className="flex-grow" />
                  
                  {/* Action buttons with improved spacing */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => downloadPDF(dept.pdfUrl, dept.pdfName)}
                      className="flex-1 flex items-center justify-center py-2 px-3 rounded-lg bg-custom-blue hover:bg-blue-700 transition-all duration-300 text-white font-medium text-sm"
                      title={`Download ${dept.pdfName}`}
                    >
                      <Download size={16} className="mr-2" />
                      <span>Download</span>
                    </button>
                    <a
                      href={dept.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center py-2 px-3 rounded-lg bg-white border border-custom-blue text-custom-blue hover:bg-blue-50 transition-all duration-300 font-medium text-sm"
                      title="Visit Department Website"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      <span>Visit</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}