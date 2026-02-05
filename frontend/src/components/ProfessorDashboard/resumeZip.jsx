import { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const ResumeZipGenerator = () => {
  const [companyName, setCompanyName] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [nameColumn, setNameColumn] = useState("");
  const [resumeColumn, setResumeColumn] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------- READ EXCEL HEADERS ----------
  const handleFileChange = async (file) => {
    if (!file) return;

    setExcelFile(file);
    setColumns([]);
    setNameColumn("");
    setResumeColumn("");

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const headers = json[0] || [];
    setColumns(headers.map((h) => h.toString().trim()));
  };

  // ---------- SUBMIT ----------
  const handleSubmit = async () => {
    if (!companyName) {
      alert("Company name is required");
      return;
    }

    if (!excelFile) {
      alert("Please upload an Excel file");
      return;
    }

    if (!resumeColumn) {
      alert("Please select the Resume link column");
      return;
    }

    const formData = new FormData();
    formData.append("companyName", companyName);
    formData.append("resumeColumn", resumeColumn); // REQUIRED
    if (nameColumn) {
      formData.append("nameColumn", nameColumn); // OPTIONAL
    }
    formData.append("excelFile", excelFile);

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.REACT_APP_BASE_URL}/api/resumes/generate-zip`,
        formData,
        {
          withCredentials: true,
          responseType: "blob",
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${companyName}_Resume.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to generate ZIP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl bg-white rounded-2xl shadow-md p-6 mx-auto">
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-800 mb-1">
        Bulk Resume ZIP Generator
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Upload Excel → Map columns → Download ZIP
      </p>

      {/* Company Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company Name
        </label>
        <input
          type="text"
          placeholder="e.g. Trident, Microsoft"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Excel Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Upload Excel File
        </label>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => handleFileChange(e.target.files[0])}
          className="w-full text-sm file:mr-4 file:py-2 file:px-4
                     file:rounded-lg file:border-0
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
        />
      </div>

      {/* Column Mapping */}
      {columns.length > 0 && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name Column <span className="text-gray-400">(optional)</span>
            </label>
            <select
              value={nameColumn}
              onChange={(e) => setNameColumn(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— No Name Column —</option>
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              If not selected, files will be named Resume_1, Resume_2…
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resume Link Column <span className="text-red-500">*</span>
            </label>
            <select
              value={resumeColumn}
              onChange={(e) => setResumeColumn(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Select Resume Column —</option>
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`w-full py-2.5 rounded-lg font-medium text-white transition
          ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }
        `}
      >
        {loading ? "Generating ZIP..." : "Generate ZIP"}
      </button>

      {/* Footer */}
      <p className="text-xs text-gray-400 mt-4 text-center">
        Output: <b>{companyName || "Company"}_Resume.zip</b>
      </p>
    </div>
  );
};

export default ResumeZipGenerator;
