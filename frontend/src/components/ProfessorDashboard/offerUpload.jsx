import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { LinkedIn } from "@mui/icons-material";
const Card = ({ title, value }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-xl font-bold">{value}</h3>
    </div>
  );
};

const OfferUpload = () => {
  const [offers, setOffers] = useState([]);
  const [filters, setFilters] = useState({
    batch: "",
    course: "",
    department: ""
  });
  const[deadline, setDeadline] = useState("");
useEffect(() => {
  const fetchDeadline = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.REACT_APP_BASE_URL}/api/offer/deadline/OfferLetter`,
        { withCredentials: true }
      );

      if (res.data.deadline) {
        // ⚠️ IMPORTANT: convert to datetime-local format
        const formatted = new Date(res.data.deadline)
          .toISOString()
          .slice(0, 16);

        setDeadline(formatted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  fetchDeadline();
}, []);
  // 🔥 Fetch data
  useEffect(() => {
    fetchOffers();
  }, [filters]);

  const fetchOffers = async () => {
    try {
      const query = new URLSearchParams(filters).toString();

      const res = await axios.get(
        `${import.meta.env.REACT_APP_BASE_URL}/api/offer/all?${query}`,
        { withCredentials: true }
      );

      setOffers(res.data);
    } catch (err) {
      console.error(err);
    }
  };
const handleDelete = async (id) => {
  if (!confirm("Are you sure you want to delete this offer?")) return;

  try {
    await axios.delete(
      `${import.meta.env.REACT_APP_BASE_URL}/api/offer/delete/${id}`,
      { withCredentials: true }
    );

    // 🔄 Refresh data
    fetchOffers();

  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
};


const exportToExcel = () => {
  if (offers.length === 0) {
    toast.error("No data to export");
    return;
  }

  const BASE_URL = import.meta.env.REACT_APP_BASE_URL;

  const workbook = XLSX.utils.book_new();

  const formatOffer = (o) => ({
    Name: o.student?.name,
    RollNo: o.student?.rollno,
    Batch: o.student?.batch,
    Course: o.student?.course,
    Department: o.student?.department,
    TotalOffers: o.totalOffers,
    AcceptedCompany: o.acceptedCompany,
    CTC: o.ctc,
    HRName: o.hrName || "N/A",
    HREmail: o.hrEmail || "N/A",
    LinkedIn: o.linkedin || "N/A",
    OfferLetter: `${BASE_URL}/${o.offerLetter}`,
  });

  // ==========================
  // Sheet 1: All Offers
  // ==========================

  const allData = offers.map(formatOffer);

  const allSheet = XLSX.utils.json_to_sheet(allData);

  XLSX.utils.book_append_sheet(
    workbook,
    allSheet,
    "All Offers"
  );

  // ==========================
  // Department Sheets
  // ==========================

  const grouped = {};

  offers.forEach((offer) => {
    const dept =
      offer.student?.department || "UNKNOWN";

    if (!grouped[dept]) {
      grouped[dept] = [];
    }

    grouped[dept].push(formatOffer(offer));
  });

  Object.entries(grouped).forEach(
    ([department, data]) => {
      const worksheet =
        XLSX.utils.json_to_sheet(data);

      const safeSheetName = department
        .replace(/[\\/?*\[\]:]/g, "")
        .substring(0, 31);

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        safeSheetName
      );
    }
  );

  // ==========================
  // Download Single Workbook
  // ==========================

  XLSX.writeFile(
    workbook,
    `Offer_Submissions_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`
  );
};

const handleSetDeadline = async () => {
  try {
    await axios.post(
      `${import.meta.env.REACT_APP_BASE_URL}/api/offer/setdeadline`,
      {
        type: "OfferLetter", // ✅ fixed
        deadline: new Date(deadline)
      },
      { withCredentials: true }
    );

    toast.success("Deadline updated");
  } catch (err) {
    console.error(err);
    toast.error("Failed to update deadline");
  }
};
  // 📈 Stats
  const total = offers.length;
  const uniqueCompanies = new Set(
    offers.map((o) => o.acceptedCompany)
  ).size;

  const avgOffers =
    total > 0
      ? (
          offers.reduce(
            (sum, o) => sum + Number(o.totalOffers || 0),
            0
          ) / total
        ).toFixed(1)
      : 0;
const departments = [
  "BIO TECHNOLOGY",
  "CIVIL ENGINEERING",
  "CHEMICAL ENGINEERING",
  "COMPUTER SCIENCE AND ENGINEERING",
  "DATA SCIENCE AND ENGINEERING",
  "ELECTRONICS AND COMMUNICATION ENGINEERING",
  "ELECTRICAL ENGINEERING",
  "INSTRUMENTATION AND CONTROL ENGINEERING",
  "INDUSTRIAL AND PRODUCTION ENGINEERING",
  "INFORMATION TECHNOLOGY",
  "MECHANICAL ENGINEERING",
  "TEXTILE TECHNOLOGY",
  "ELECTRONICS AND VLSI ENGINEERING"
];
  return (
    <div className="p-6">

      {/* 🔥 TITLE */}
      <h2 className="text-2xl font-bold mb-4 ml-4">
        Offer Submissions Dashboard
      </h2>

      {/* 📊 SUMMARY CARDS */}
    <div className="bg-yellow-100 p-4 rounded-xl mb-6 flex items-center gap-4">

  <span className="font-semibold text-gray-700">
    Offer Letter Deadline
  </span>

  <input
    type="datetime-local"
    value={deadline||  ""}
    onChange={(e) => setDeadline(e.target.value)}
    className="border p-2 rounded"
  />

  <button
    onClick={handleSetDeadline}
    className="bg-red-600 text-white px-4 py-2 rounded"
  >
    Set / Update Deadline
  </button>

</div>

      {/* 🔍 FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow mb-4 flex flex-wrap gap-4 items-center">

        <select
          className="border p-2 rounded"
          onChange={(e) =>
            setFilters({ ...filters, batch: e.target.value })
          }
        >
          <option value="">All Batch</option>
          <option value="2027">2027</option>
          <option value="2028">2028</option>
        </select>

        <select
          className="border p-2 rounded"
          onChange={(e) =>
            setFilters({ ...filters, course: e.target.value })
          }
        >
          <option value="">All Course</option>
          <option>B.Tech</option>
          <option>M.Tech</option>
        </select>

      <select
  onChange={(e) =>
    setFilters({ ...filters, department: e.target.value })
  }
>
  <option value="">All Department</option>

  {departments.map((dept) => (
    <option key={dept} value={dept}>
      {dept}
    </option>
  ))}
</select>
        <button
          onClick={exportToExcel}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Export Excel
        </button>
      </div>

      {/* 📊 TABLE */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Roll</th>
              <th className="p-3">Batch</th>
              <th className="p-3">Course</th>
              <th className="p-3">Dept</th>
              <th className="p-3">Offers</th>
              <th className="p-3">Company</th>
              <th className="p-3">CTC</th>
<th className="p-3">HR Name</th>
<th className="p-3">HR Email</th>
              <th className="p-3">LinkedIn</th>
              <th className="p-3">PDF</th>
                <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {offers.map((o, i) => (
              <tr
                key={o._id}
                className={`border-t ${
                  i % 2 === 0 ? "bg-gray-50" : ""
                } hover:bg-blue-50`}
              >
                <td className="p-3">
                  {o.student?.name}
                </td>
                <td className="p-3">
                  {o.student?.rollno}
                </td>
                <td className="p-3">
                  {o.student?.batch}
                </td>
                <td className="p-3">
                  {o.student?.course}
                </td>
                <td className="p-3">
                  {o.student?.department}
                </td>
                <td className="p-3 font-semibold">
                  {o.totalOffers}
                </td>
                <td className="p-3 text-green-600">
                  {o.acceptedCompany}
                </td>
                <td className="p-3">
  {o.ctc || "N/A"}
</td>

<td className="p-3">
  {o.hrName || "N/A"}
</td>

<td className="p-3">
  {o.hrEmail || "N/A"}
</td>
                <td className="p-3 text-green-600">
                  {o.linkedin || "N/A"}
                </td>
                <td className="p-3">
                  <a
                    href={`${import.meta.env.REACT_APP_BASE_URL}/${o.offerLetter}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    View
                  </a>
                </td>
                <td className="p-3">
  <button
    onClick={() => handleDelete(o._id)}
    className="text-red-600 hover:underline"
  >
    Delete
  </button>
</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {/*  EMPTY STATE */}
        {offers.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No offer submissions found 🚫
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferUpload;