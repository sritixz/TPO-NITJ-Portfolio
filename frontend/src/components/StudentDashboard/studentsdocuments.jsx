import { useState, useEffect } from 'react';
import { Download, ExternalLink,ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentDocument() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    const fetchBrochures = async () => {
      try {
        const response = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/student-documents/get`, {
          withCredentials: true,
        });

        const fetchedDocuments = response.data.data.map((document) => ({
          id: document._id,
          name: document.document_name,
          pdfUrl: document.document_link,
          pdfName: `${document.document_name.replace(/\s+/g, '_').toLowerCase()}.pdf`,
        }));
        setDocuments(fetchedDocuments);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents. Please try again later.');
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
      <div className="min-h-screen bg-gray-50 py-6 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between mb-16">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-custom-blue hover:text-blue-700 transition-all duration-300 font-medium"
        >
          <ArrowLeft className="mr-2" size={20} />
        </button>

        <h1 className="text-3xl font-bold text-gray-800 text-center flex-1">
          Relevant <span className="text-custom-blue">Documents</span>
        </h1>

        {/* Spacer to keep title centered */}
        <div className="w-[80px]" />
      </div>

        {loading && documents.length === 0 ? (
 <div className="flex justify-center items-center min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
  </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : documents.length === 0 ? (
          <div className="text-center text-gray-600">No Documents available.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-12 max-w-7xl mx-auto">
            {documents.map((docs) => (
              <div
                key={docs.id}
                className="bg-white rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full shadow-md hover:shadow-xl min-w-[250px]"
                style={{
                  transform: hoveredCard === docs.id ? 'translateY(-4px)' : 'none',
                }}
                onMouseEnter={() => setHoveredCard(docs.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Top accent bar */}
                <div className="h-2 bg-custom-blue w-full" />
                
                <div className="p-6 flex flex-col flex-grow">
                  {/* Department name with proper wrapping */}
                 <h2 className="text-md font-bold  mb-4 whitespace-nowrap overflow-hidden text-ellipsis">

                    {docs.name}
                  </h2>
                  
                  {/* Spacer to push buttons to bottom */}
                  <div className="flex-grow" />
                  
                  {/* Action buttons with improved spacing */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => downloadPDF(docs.pdfUrl, docs.pdfName)}
                      className="flex-1 flex items-center justify-center py-2 px-3 rounded-lg bg-custom-blue hover:bg-blue-700 transition-all duration-300 text-white font-medium text-sm"
                      title={`Download ${docs.pdfName}`}
                    >
                      <Download size={16} className="mr-2" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}