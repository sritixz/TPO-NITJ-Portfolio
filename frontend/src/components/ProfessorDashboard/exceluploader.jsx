import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const ExcelUploader = () => {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResults([]);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an Excel file');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        if (!jsonData[0]?.rollNo || !jsonData[0]?.cgpa) {
          setError('Excel file must contain "rollNo" and "cgpa" columns');
          return;
        }

        const response = await axios.post('http://localhost:3000/validate-cgpa', { students: jsonData });
        setResults(response.data.results);
      } catch (err) {
        setError('Error processing file: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">CGPA Validator</h1>
      <div className="mb-4">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
        />
        <button
          onClick={handleUpload}
          className="mt-2 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={!file}
        >
          Upload and Validate
        </button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Roll No</th>
                <th className="py-2 px-4 border">Name</th>
                <th className="py-2 px-4 border">Email</th>
                <th className="py-2 px-4 border">Uploaded CGPA</th>
                <th className="py-2 px-4 border">Correct CGPA</th>
                <th className="py-2 px-4 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border">{result.rollNo}</td>
                  <td className="py-2 px-4 border">{result.name}</td>
                  <td className="py-2 px-4 border">{result.email}</td>
                  <td className={`py-2 px-4 border ${result.isValid ? 'text-green-500' : 'text-red-500'}`}>
                    {result.uploadedCgpa}
                  </td>
                  <td className="py-2 px-4 border text-green-500">{result.correctCgpa}</td>
                  <td className="py-2 px-4 border">{result.isValid ? 'Valid' : 'Invalid'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExcelUploader;