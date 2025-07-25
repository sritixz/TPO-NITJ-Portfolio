import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const ExcelUploader = () => {
  const [file, setFile] = useState(null);
  const [emailColumn, setEmailColumn] = useState('');
  const [cgpaColumn, setCgpaColumn] = useState('');
  const [isCgpaPercentage, setIsCgpaPercentage] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [originalData, setOriginalData] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResults([]);
    setError('');
    setOriginalData([]);
  };

  const cleanCgpa = (cgpa) => {
    if (!cgpa || typeof cgpa !== 'string') {
      return cgpa;
    }
    const cleaned = cgpa.replace(/[^0-9.]/g, '');
    return cleaned;
  };

  const downloadUpdatedExcel = () => {
    if (!originalData.length || !results.length) {
      setError('No data available to download. Please upload and validate an Excel file first.');
      return;
    }

    try {
      const updatedData = originalData.map(row => ({ ...row }));
      const cgpaMap = results.reduce((map, result) => {
        map[result.email] = result.correctCgpa;
        return map;
      }, {});

      updatedData.forEach(row => {
        const email = row[emailColumn];
        if (cgpaMap[email] !== undefined) {
          row[cgpaColumn] = cgpaMap[email];
        }
      });

      const worksheet = XLSX.utils.json_to_sheet(updatedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = file.name.replace(/\.[^/.]+$/, '_updated.xlsx');
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setError('');
    } catch (err) {
      setError('Failed to generate or download the updated Excel file: ' + err.message);
    }
  };

  const handleUpload = async () => {
    setError('');
    if (!file || !emailColumn || !cgpaColumn) {
      setError('Please select an Excel file and specify both email and CGPA column names');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { raw: false });

        setOriginalData(jsonData);

        const cleanedData = jsonData.map((row) => ({
          ...row,
          [cgpaColumn]: cleanCgpa(row[cgpaColumn]),
        }));

        if (!cleanedData[0]?.[emailColumn] && !cleanedData[0]?.[cgpaColumn]) {
          setError(`Excel file is missing both "${emailColumn}" (email) and "${cgpaColumn}" (CGPA) columns`);
          return;
        } else if (!cleanedData[0]?.[emailColumn]) {
          setError(`Excel file is missing the "${emailColumn}" (email) column`);
          return;
        } else if (!cleanedData[0]?.[cgpaColumn]) {
          setError(`Excel file is missing the "${cgpaColumn}" (CGPA) column`);
          return;
        }

        const response = await axios.post(`${import.meta.env.REACT_APP_BASE_URL}/cgpa-checker/validate-cgpa`, {
          students: cleanedData,
          emailColumn,
          cgpaColumn,
          isCgpaPercentage,
        }, { withCredentials: true });

        setResults(response.data.results);
      } catch (err) {
        setError('Error processing file: ' + (err.response?.data?.error || err.message));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-custom-blue mb-6 text-center">CGPA <span className='text-black'>Validator</span> </h1>
      
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Column Name
            </label>
            <input
              type="text"
              value={emailColumn}
              onChange={(e) => setEmailColumn(e.target.value)}
              placeholder="Enter email column name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              CGPA Column Name
            </label>
            <input
              type="text"
              value={cgpaColumn}
              onChange={(e) => setCgpaColumn(e.target.value)}
              placeholder="Enter CGPA column name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>
        
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={isCgpaPercentage}
            onChange={(e) => setIsCgpaPercentage(e.target.checked)}
            className="h-5 w-5 text-custom-blue focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm font-medium text-gray-700">
            CGPA is in percentage
          </label>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-custom-blue file:text-white file:hover:bg-blue-700 transition"
          />
          <button
            onClick={handleUpload}
            className="py-2 px-6 bg-custom-blue text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            disabled={!file || !emailColumn || !cgpaColumn}
          >
            Upload and Validate
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="mb-6">
          <button
            onClick={downloadUpdatedExcel}
            className="py-2 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Download Updated Excel
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Uploaded CGPA</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Correct CGPA</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((result, index) => (
                <tr key={index} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-6 text-gray-600">{result.name}</td>
                  <td className="py-3 px-6 text-gray-600">{result.email}</td>
                  <td className={`py-3 px-6 ${result.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {result.uploadedCgpa}
                  </td>
                  <td className="py-3 px-6 text-green-600">{result.correctCgpa}</td>
                  <td className="py-3 px-6 text-gray-600">{result.isValid ? 'Valid' : 'Invalid'}</td>
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