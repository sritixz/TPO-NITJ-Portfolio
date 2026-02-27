import { ChevronLeft, ChevronRight, Edit, Lock, Trash2, Unlock } from "lucide-react";
import { useState, useEffect } from "react";
const apiUrl = import.meta.env.REACT_APP_BASE_URL;

const Database = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSchema, setSelectedSchema] = useState('summerinterns');
  const [databaseRecords, setDatabaseRecords] = useState([]);
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const recordsPerPage = 10;

  // Function to normalize records based on schema
  const normalizeRecords = (records, schemaKeys) => {
    return records.map(record => {
      const normalizedRecord = {};
      schemaKeys.forEach(key => {
        normalizedRecord[key] = record[key] !== undefined && record[key] !== null ? record[key] : "-";
      });
      return normalizedRecord;
    });
  };

  // Fetch data from API
  const fetchDatabaseRecords = async (collectionName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/admin/database/${collectionName}`, { credentials: "include" });
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      const records = data.records || data || []; // Handle both wrapped and direct array responses
      const schemaKeys = data.schema || [];
      
      // If no schema provided, extract from first record
      const finalSchema = schemaKeys.length > 0 ? schemaKeys : (records.length > 0 ? Object.keys(records[0]) : []);
      
      // Normalize records to ensure all schema keys are present
      const normalizedRecords = normalizeRecords(records, finalSchema);
      
      setSchema(finalSchema);
      setDatabaseRecords(normalizedRecords);
    } catch (err) {
      setError(err.message);
      setDatabaseRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when selectedSchema changes
  useEffect(() => {
    fetchDatabaseRecords(selectedSchema);
  }, [selectedSchema]);

  // Calculate pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = databaseRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(databaseRecords.length / recordsPerPage);

  // Handle record selection
  const getRecordId = (record) => {
    return record.recordId || record.studentId || record.companyId || 
           record.applicationId || record.feedbackId || record.id || 'unknown';
  };

  // Handle pagination
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Modal handlers (placeholder functions)
  const openEditModal = (record) => {
    console.log("Edit record:", record);
  };

  const openDeactivateConfirmModal = (recordId) => {
    console.log("Deactivate record:", recordId);
  };

  const openDeleteConfirmModal = (type, recordId) => {
    console.log("Delete record:", type, recordId);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Database Management</h1>

      {/* Database Schema Selector */}
      <div className="mb-4 flex items-center gap-4">
        <label htmlFor="schema-select" className="text-sm font-medium text-gray-700">
          Select Database Table:
        </label>
        <select
          id="schema-select"
          value={selectedSchema}
          onChange={(e) => {
            setSelectedSchema(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 p-2 rounded-md shadow-sm focus:outline-none"
        >
          <option value="summerinterns">Summer Interns</option>
          <option value="summerinterntrackers">Summer Intern Tracker</option>
          <option value="suggestions">Suggestions</option>
          <option value="sharedexperiences">Shared Experience</option>
          <option value="nocs">NOCs</option>
        </select>
      </div>
      
      {loading && (
        <div className="text-center py-4">
          <div className="text-gray-600">Loading data...</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {!loading && !error && schema.length === 0 && (
        <div className="text-center py-4">
          <div className="text-gray-600">No table found for the selected collection.</div>
        </div>
      )}

      {!loading && !error && schema.length > 0 && databaseRecords.length === 0 && (
        <div className="text-center py-4">
          <div className="text-gray-600">No data found for the selected table.</div>
        </div>
      )}

      {!loading && !error && schema.length > 0 && databaseRecords.length > 0 && (
        <>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                {
                  schema.map((key) => {
                    return (
                      <th key={key} className="border p-2">{key}</th>
                    )
                  })
                }
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((record, index) => {
                const recordId = getRecordId(record);
                return (
                  <tr
                    key={recordId}
                    // className={`hover:bg-gray-50 ${record.status === "Deactivated" || record.Status === "Deactivated" ? "bg-red-50" : ""}`}
                  >
                    {schema.map(key => (
                      <td key={key} className="border p-2">
                        {/* {(key === "Status" || key === "status") ? (
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              record[key] === "Deactivated" || record[key] === "Rejected" || record[key] === "Inactive"
                                ? "bg-red-200 text-red-800"
                                : record[key] === "Active" || record[key] === "Selected" || record[key] === "Accepted"
                                ? "bg-green-200 text-green-800"
                                : "bg-yellow-200 text-yellow-800"
                            }`}
                          >
                            {record[key]}
                          </span>
                        ) : ( */
                          <span className={record[key] === "-" ? "text-gray-400 italic" : ""}>
                            {String(record[key])}
                          </span>
                        }
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div>
            Showing {indexOfFirstRecord + 1} to{" "}
            {Math.min(indexOfLastRecord, databaseRecords.length)} of{" "}
            {databaseRecords.length} records
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
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  )
}

export default Database;