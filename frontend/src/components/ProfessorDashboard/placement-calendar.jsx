import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx-js-style";
import {
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  PlusCircle,
  Download
} from "lucide-react";

export default function PlacementCalendarTable() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [calendar, setCalendar] = useState([]);
  const [editingDate, setEditingDate] = useState(null); // for adding new company at date level
  const [editingDayStatus, setEditingDayStatus] = useState(null); // for editing dayStatus at date level when no companies
  const [editingCompanyId, setEditingCompanyId] = useState(null); // for inline edit of company row
  const [form, setForm] = useState({
    company: "",
    process: "",
    ctc: "",
    visitStatus: "",
    status: "",
    branches: "",
    timeIn: "",
    timeOut: ""
  });
  const [dayStatusForm, setDayStatusForm] = useState("");
  const [editForm, setEditForm] = useState({
    company: "",
    process: "",
    ctc: "",
    visitStatus: "",
    status: "",
    branches: "",
    timeIn: "",
    timeOut: ""
  });
  const BASE = import.meta.env.REACT_APP_BASE_URL;

  const generateMonthDays = () => {
    const days = [];
    const total = new Date(year, month, 0).getDate();
    for (let i = 1; i <= total; i++) {
      const d = new Date(year, month - 1, i);
      // const iso = d.toISOString().split("T")[0];
      const iso = `${year}-${String(month).padStart(2,'0')}-${String(i).padStart(2,'0')}`;

      days.push({
        date: iso,
        label: d.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric"
        }),
        weekday: d.getDay(),
        isSunday: d.getDay() === 0,
        companies: [],
        dayStatus: "",
        note: ""
      });
    }
    return days;
  };

  const fetchCalendar = async () => {
    const base = generateMonthDays();
    try {
      const { data } = await axios.get(
        `${BASE}/placement-calendar/${month}/${year}`,
        { withCredentials: true }
      );
      // server returns entries with date as ISO timestamp; compare date portion
      const merged = base.map((day) => {
        const db = data.find((x) => {
          const d = new Date(x.date).toISOString().split("T")[0];
          return d === day.date;
        });
        return db ? { ...day, ...db } : day;
      });
      setCalendar(merged);
    } catch (err) {
      setCalendar(base);
    }
  };

  useEffect(() => {
    fetchCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  // Download Excel function
  const handleDownloadExcel = () => {
    const monthName = new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "long" });
    let wsData = [["Placement Calendar - " + monthName + " " + year]];
    wsData.push([
      "Date",
      "Name of the Company",
      "PROCESSES",
      "Time In",
      "Time Out",
      "Visit Status",
      "Status",
      "Branches",
      "CTC"
    ]);

    calendar.forEach((day) => {
      if (day.companies.length > 0) {
        day.companies.forEach((comp) => {
          wsData.push([
            day.label,
            comp.company || "",
            comp.process || "",
            comp.timeIn || "",
            comp.timeOut || "",
            comp.visitStatus || "",
            comp.status || "",
            comp.branches || "",
            comp.ctc || ""
          ]);
        });
      } else {
        const displayText = day.dayStatus?.trim() || (day.isSunday ? "Sunday" : "No events");
        if (displayText === "No events") {
          wsData.push([day.label, "", "", "", "", "", "", "", ""]);
        } else {
          const row = [day.label];
          for (let i = 1; i < 9; i++) {
            row.push(displayText);
          }
          wsData.push(row);
        }
      }
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Merges for title
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];

    // Common border style
    const thinBorder = {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    };

    // Title style
    const titleAddr = XLSX.utils.encode_cell({ r: 0, c: 0 });
    ws[titleAddr].s = {
      alignment: { horizontal: "center", vertical: "center" },
      font: { name: "Calibri", bold: true, color: { rgb: "FFFFFF" }, sz: 16 },
      fill: { patternType: "solid", fgColor: { rgb: "4472C4" } },
      border: thinBorder
    };

    // Header style
    for (let c = 0; c < 9; c++) {
      const addr = XLSX.utils.encode_cell({ r: 1, c });
      ws[addr].s = {
        font: { name: "Calibri", bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
        fill: { patternType: "solid", fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: thinBorder
      };
    }

    // Data alignments
    const alignments = [
      { horizontal: "left", vertical: "center" }, // Date
      { horizontal: "center", vertical: "center" }, // Company
      { horizontal: "center", vertical: "center" }, // Process
      { horizontal: "center", vertical: "center" }, // Time In
      { horizontal: "center", vertical: "center" }, // Time Out
      { horizontal: "center", vertical: "center" }, // Visit Status
      { horizontal: "center", vertical: "center" }, // Status
      { horizontal: "center", vertical: "center" }, // Branches
      { horizontal: "center", vertical: "center" } // CTC
    ];

    // Apply alignments and coloring to data rows
    let dataRow = 2;
    calendar.forEach((day) => {
      let dayFillColor = null;
      if (day.isSunday) {
        dayFillColor = "ff4e4e"; // Light red for Sunday
      } else if (day.dayStatus?.trim() && day.companies.length === 0) {
        dayFillColor = "FFF2CC"; // Light yellow for other day status
      }

      if (day.companies.length > 0) {
        day.companies.forEach(() => {
          for (let c = 0; c < 9; c++) {
            const addr = XLSX.utils.encode_cell({ r: dataRow, c });
            if (!ws[addr].s) ws[addr].s = {};
            ws[addr].s.alignment = alignments[c];
            ws[addr].s.font = { name: "Calibri", sz: 11 };
            ws[addr].s.border = thinBorder;
            if (dayFillColor) {
              ws[addr].s.fill = { patternType: "solid", fgColor: { rgb: dayFillColor } };
            }
          }
          dataRow++;
        });
      } else {
        for (let c = 0; c < 9; c++) {
          const addr = XLSX.utils.encode_cell({ r: dataRow, c });
          if (!ws[addr].s) ws[addr].s = {};
          ws[addr].s.alignment = alignments[c];
          ws[addr].s.font = { name: "Calibri", sz: 11 };
          ws[addr].s.border = thinBorder;
          if (dayFillColor) {
            ws[addr].s.fill = { patternType: "solid", fgColor: { rgb: dayFillColor } };
          }
        }
        dataRow++;
      }
    });

    // Column widths
    ws["!cols"] = [
      { wch: 18 }, // Date
      { wch: 32 }, // Company
      { wch: 26 }, // Process
      { wch: 12 }, // Time In
      { wch: 12 }, // Time Out
      { wch: 14 }, // Visit Status
      { wch: 18 }, // Status
      { wch: 24 }, // Branches
      { wch: 12 } // CTC
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Placement Calendar");
    XLSX.writeFile(wb, `Placement_Calendar_${monthName}_${year}.xlsx`);
  };

  // ADD company for a date (date-level +)
  const handleAddCompany = async (e, date) => {
    e.preventDefault();
    console.log(date);
    try {
      await axios.post(
        `${BASE}/placement-calendar`,
        {
          date,
          companies: [form]
        },
        { withCredentials: true }
      );
      setForm({
        company: "",
        process: "",
        ctc: "",
        visitStatus: "",
        status: "",
        branches: "",
        timeIn: "",
        timeOut: ""
      });
      setEditingDate(null);
      setEditingDayStatus(null);
      await fetchCalendar();
    } catch (err) {
      console.error("Add company error", err);
      // optionally show UI error
    }
  };

  // Start editing dayStatus for a date with no companies
  const handleStartEditStatus = (day) => {
    setEditingDayStatus(day.date);
    setDayStatusForm(day.dayStatus || "");
    setEditingDate(null);
    setEditingCompanyId(null);
    handleCancelEdit();
  };

  // Save dayStatus
  const handleSaveDayStatus = async (date) => {
    try {
      await axios.put(
        `${BASE}/placement-calendar/${date}/dayStatus`,
        { dayStatus: dayStatusForm },
        { withCredentials: true }
      );
      setEditingDayStatus(null);
      setDayStatusForm("");
      await fetchCalendar();
    } catch (err) {
      console.error("Save dayStatus error", err);
      // optionally show UI error
    }
  };

  // Cancel editing dayStatus
  const handleCancelDayStatus = () => {
    setEditingDayStatus(null);
    setDayStatusForm("");
  };

  // Start editing a particular company row (inline)
  const handleStartEdit = (date, company) => {
    setEditingCompanyId(company._id);
    // populate edit form
    setEditForm({
      company: company.company || "",
      process: company.process || "",
      ctc: company.ctc || "",
      visitStatus: company.visitStatus || "",
      status: company.status || "",
      branches: company.branches || "",
      timeIn: company.timeIn || "",
      timeOut: company.timeOut || ""
    });
    // ensure add row isn't open while editing a company row
    setEditingDate(null);
    setEditingDayStatus(null);
  };

  // Cancel editing inline
  const handleCancelEdit = () => {
    setEditingCompanyId(null);
    setEditForm({
      company: "",
      process: "",
      ctc: "",
      visitStatus: "",
      status: "",
      branches: "",
      timeIn: "",
      timeOut: ""
    });
  };

  // Save inline edit -> PUT /placement-calendar/:date/edit body { companyId, updatedData }
  const handleSaveEdit = async (date, companyId) => {
    try {
      await axios.put(
        `${BASE}/placement-calendar/${date}/edit`,
        {
          companyId,
          updatedData: editForm
        },
        { withCredentials: true }
      );
      setEditingCompanyId(null);
      await fetchCalendar();
    } catch (err) {
      console.error("Save edit error", err);
      // optionally show UI error
    }
  };

  // Delete single company -> DELETE /placement-calendar/:date/company/:companyId
  const handleDelete = async (date, companyId) => {
    try {
      // optional: simple confirm
      if (!window.confirm("Delete this company process?")) return;
      await axios.delete(`${BASE}/placement-calendar/${date}/company/${companyId}`, {
        withCredentials: true
      });
      // if we were editing the same company, close the editor
      if (editingCompanyId === companyId) handleCancelEdit();
      await fetchCalendar();
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  // utility to compute rowSpan for date cell
  const getRowSpan = (day) => {
    // number of visible rows for that date:
    // companies count (could be 0) + (1 if add-row open for that date)
    const addRowOpen = editingDate === day.date ? 1 : 0;
    const companiesCount = Math.max(1, day.companies.length); // we always render at least one row for the date
    return companiesCount + addRowOpen;
  };

  const renderEditActionsCell = (rowIndex, companyId, day) => {
    const borderClass = `px-2 py-3 text-center ${rowIndex > 0 ? 'border-t-0' : ''} flex items-center justify-center gap-3`;
    return (
      <td className={borderClass}>
        <button
          onClick={() => handleSaveEdit(day.date, companyId)}
          className="text-green-500 rounded flex items-center justify-center"
          title="Save"
        >
          <CheckCircle2 size={18} />
        </button>
        <button
          onClick={handleCancelEdit}
          className="text-red-500 rounded flex items-center justify-center"
          title="Cancel"
        >
          <XCircle size={18} />
        </button>
      </td>
    );
  };

  const renderAddActionsCell = (addRowIndex, day) => {
    const borderClass = `px-2 py-3 text-center ${addRowIndex > 0 ? 'border-t-0' : ''} flex items-center justify-center gap-3`;
    return (
      <td className={borderClass}>
        <button
          onClick={(e) => handleAddCompany(e, day.date)}
          className="text-green-500 rounded flex items-center justify-center"
          title="Add"
        >
          <CheckCircle2 size={18} />
        </button>
        <button
          onClick={() => {
            setEditingDate(null);
            setForm({
              company: "",
              process: "",
              ctc: "",
              visitStatus: "",
              status: "",
              branches: "",
              timeIn: "",
              timeOut: ""
            });
          }}
          className="text-red-500 rounded flex items-center justify-center"
          title="Cancel"
        >
          <XCircle size={18} />
        </button>
      </td>
    );
  };

  const renderActionsCell = (rowIndex, day, comp = null, isPlaceholder = false) => {
    const borderClass = `border px-2 py-3 text-center ${rowIndex > 0 ? 'border-t-0' : ''}`;
    return (
      <td className={borderClass}>
        <div className="flex items-center gap-4 pr-4  w-full justify-center">
          {comp && (
            <>
              <button
                onClick={() => handleStartEdit(day.date, comp)}
                className="text-custom-blue"
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(day.date, comp._id)}
                className="text-red-500"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          {isPlaceholder && !editingDayStatus && (
            <button
              onClick={() => handleStartEditStatus(day)}
              className="text-custom-blue"
              title="Set day status"
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>
      </td>
    );
  };

  const renderAddColumn = (day, isFirstCompanyRow = false, rowIndex = 0, isAddRow = false, isPlaceholder = false) => {
    const addOpen = editingDate === day.date ? 1 : 0;
    const companyRows = day.companies.length + addOpen;
    const showSpanningPlus = !addOpen && day.companies.length > 0 && isFirstCompanyRow;
    const showPlusSingle = !addOpen && day.companies.length === 0  && rowIndex === 0;

    if (showSpanningPlus) {
      return (
        <td
          rowSpan={companyRows}
          className="border px-2 py-3 relative"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => {
                setEditingDate(day.date);
                setEditingDayStatus(null);
                setEditingCompanyId(null);
              }}
              title="Add company for this date"
            >
              <PlusCircle size={20} />
            </button>
          </div>
        </td>
      );
    }

    if (showPlusSingle) {
      return (
         <td
          className="border px-2 py-3 relative"
        >
          <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => {
              setEditingDate(day.date);
              setEditingDayStatus(null);
              setEditingCompanyId(null);
            }}
            title="Add company for this date"
          >
            <PlusCircle size={20} />
          </button>
          </div>
        </td>
      );
    }

    if (isAddRow) {
      return renderAddActionsCell(day.companies.length, day); // Use companies.length as proxy for rowIndex
    }

    if (editingDayStatus && isPlaceholder) {
      return (
        <td className="border px-2 py-3 flex items-center justify-center gap-3">
          <button
            onClick={() => handleSaveDayStatus(day.date)}
            className="text-green-500 rounded flex items-center justify-center"
            title="Save"
          >
            <CheckCircle2 size={18} />
          </button>
          <button
            onClick={handleCancelDayStatus}
            className="text-red-500 rounded flex items-center justify-center"
            title="Cancel"
          >
            <XCircle size={18} />
          </button>
        </td>
      );
    }

    // Empty cell otherwise
    return <td className="border px-2 py-3"></td>;
  };

  const currentYear = new Date().getFullYear();
  return (
    <div className="p-4">
           <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold text-gray-900">Placement <span className="text-custom-blue">Calendar</span></h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-2 bg-custom-blue text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Download Excel"
          >
            <Download size={18} />
            Download Excel
          </button>
          <select
            className="bg-white border border-gray-300 p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(currentYear, i, 1).toLocaleDateString("en-IN", {
                  month: "long"
                })}
              </option>
            ))}
          </select>
          <select
            className="bg-white border border-gray-300 p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <option key={i} value={currentYear + i}>
                {currentYear + i}
              </option>
            ))}
          </select>
        </div>
      </div>
      <table className="w-full border text-sm rounded-t-xl">
        <thead className="bg-custom-blue text-white uppercase text-sm tracking-wide">
          <tr>
            <th className="py-3 px-2 rounded-tl-xl">Date</th>
            <th className="py-3 px-2">Company</th>
            <th className="py-3 px-2">Process</th>
            <th className="py-3 px-2">Time In</th>
            <th className="py-3 px-2">Time Out</th>
            <th className="py-3 px-2">Visit Status</th>
            <th className="py-3 px-2">Status</th>
            <th className="py-3 px-2">Branches</th>
            <th className="py-3 px-2">CTC</th>
            <th className="py-3 px-2">Actions</th>
            <th className="py-3 px-2 rounded-tr-xl">Add</th>
          </tr>
        </thead>
        <tbody>
          {calendar.map((day) => {
            const totalRows = getRowSpan(day);
            const addOpen = editingDate === day.date ? 1 : 0;
            const isPlaceholder = day.companies.length === 0;
            const addRowIndex = isPlaceholder ? 1 : day.companies.length;
            const hasCompanies = day.companies.length > 0;
            const companyRows = day.companies.length + addOpen;
            const firstTrClass = `${day.isSunday ? "bg-red-50 font-semibold" : ""} min-h-[60px]`;
            return (
              <React.Fragment key={day.date}>
                <tr className={firstTrClass}>
                  {/* DATE CELL WITH ROWSPAN */}
                  <td
                    className="border px-2 py-1 align-middle text-center"
                    rowSpan={totalRows}
                  >
                    {day.label}
                  </td>
                  {day.companies.length > 0 ? (
                    // FIRST company row of the date
                    (() => {
                      const comp = day.companies[0];
                      const isEditingThis = editingCompanyId === comp._id;
                      const rowIndex = 0;
                      return (
                        <>
                          {/* if this company is being edited show inputs inline */}
                          {isEditingThis ? (
                            <>
                              <td className="border px-2 py-3">
                                <input
                                  className="border p-2 rounded w-full h-10"
                                  value={editForm.company}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, company: e.target.value })
                                  }
                                />
                              </td>
                              <td className="border px-2 py-3">
                                <input
                                  className="border p-2 rounded w-full h-10"
                                  value={editForm.process}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, process: e.target.value })
                                  }
                                />
                              </td>
                              <td className="border px-2 py-3">
                                <input
                                  className="border p-2 rounded w-full h-10"
                                  value={editForm.timeIn}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, timeIn: e.target.value })
                                  }
                                />
                              </td>
                              <td className="border px-2 py-3">
                                <input
                                  className="border p-2 rounded w-full h-10"
                                  value={editForm.timeOut}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, timeOut: e.target.value })
                                  }
                                />
                              </td>
                              <td className="border px-2 py-3">
                                <input
                                  className="border p-2 rounded w-full h-10"
                                  value={editForm.visitStatus}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, visitStatus: e.target.value })
                                  }
                                />
                              </td>
                              <td className="border px-2 py-3">
                                <input
                                  className="border p-2 rounded w-full h-10"
                                  value={editForm.status}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, status: e.target.value })
                                  }
                                />
                              </td>
                              <td className="border px-2 py-3">
                                <input
                                  className="border p-2 rounded w-full h-10"
                                  value={editForm.branches}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, branches: e.target.value })
                                  }
                                />
                              </td>
                              <td className="border px-2 py-3">
                                <input
                                  className="border p-2 rounded w-full h-10"
                                  value={editForm.ctc}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, ctc: e.target.value })
                                  }
                                />
                              </td>
                              {renderEditActionsCell(rowIndex, comp._id, day)}
                              {renderAddColumn(day, true, rowIndex)}
                            </>
                          ) : (
                            // Not editing: normal display cells for first company
                            <>
                              <td className="border px-2 py-3">{comp.company}</td>
                              <td className="border px-2 py-3">{comp.process}</td>
                              <td className="border px-2 py-3">{comp.timeIn}</td>
                              <td className="border px-2 py-3">{comp.timeOut}</td>
                              <td className="border px-2 py-3">{comp.visitStatus}</td>
                              <td className="border px-2 py-3">{comp.status}</td>
                              <td className="border px-2 py-3">{comp.branches}</td>
                              <td className="border px-2 py-3">{comp.ctc}</td>
                              {renderActionsCell(rowIndex, day, comp)}
                              {renderAddColumn(day, true, rowIndex)}
                            </>
                          )}
                        </>
                      );
                    })()
                  ) : (
                    // NO companies: show placeholder columns + action cell with divider and possible plus
                    <>
                      <td colSpan={8} className="border px-2 py-3 relative">
                        {editingDayStatus === day.date ? (
                          <div className="flex flex-col items-center justify-center gap-2 p-4 min-h-[100px]">
                            <input
                              className="border p-1 rounded w-64 max-w-full text-center"
                              value={dayStatusForm}
                              onChange={(e) => setDayStatusForm(e.target.value)}
                              placeholder="e.g. exam week, holiday, winter vacation"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            {day.dayStatus?.trim() ? (
                              <span className="text-gray-700 font-medium">{day.dayStatus}</span>
                            ) : (
                              <span className="text-gray-500 italic">{day.isSunday ? "Sunday" : "No events"}</span>
                            )}
                          </div>
                        )}
                      </td>
                      {/* {editingDayStatus === day.date ? (
                        <>
                          <td className="border px-2 py-3"></td>
                          {renderAddColumn(day, false, 0, false, true)}
                        </>
                      ) : (
                        <>
                          {renderActionsCell(0, day, null, true)}
                          {renderAddColumn(day, false, 0, false, true)}
                        </>
                      )} */}

    {editingDayStatus === day.date ? (
  <>
    <td className="px-2 py-3 flex items-center justify-center gap-3">
      <button
        onClick={() => handleSaveDayStatus(day.date)}
        className="text-green-500 rounded flex items-center justify-center"
        title="Save"
      >
        <CheckCircle2 size={18} />
      </button>
      <button
        onClick={handleCancelDayStatus}
        className="text-red-500 rounded flex items-center justify-center"
        title="Cancel"
      >
        <XCircle size={18} />
      </button>
    </td>
    <td className="border px-2 py-3"></td>
    {renderAddColumn(day, false, 0, false, true)}
  </>
) : (
  <>
    {renderActionsCell(0, day, null, true)}
    {renderAddColumn(day, false, 0, false, true)}
  </>
)}

                    </>
                  )}
                </tr>
                {/* RENDER REMAINING COMPANIES (index 1..) */}
                {day.companies.slice(1).map((comp, i) => {
                  const rowIndex = 1 + i;
                  const isEditingThis = editingCompanyId === comp._id;
                  return (
                    <tr key={`${day.date}-${comp._id || i}`} className="bg-gray-50 min-h-[60px]">
                      {isEditingThis ? (
                        <>
                          <td className="border px-2 py-3">
                            <input
                              className="border p-2 rounded w-full h-10"
                              value={editForm.company}
                              onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                            />
                          </td>
                          <td className="border px-2 py-3">
                            <input
                              className="border p-2 rounded w-full h-10"
                              value={editForm.process}
                              onChange={(e) => setEditForm({ ...editForm, process: e.target.value })}
                            />
                          </td>
                          <td className="border px-2 py-3">
                            <input
                              className="border p-2 rounded w-full h-10"
                              value={editForm.timeIn}
                              onChange={(e) => setEditForm({ ...editForm, timeIn: e.target.value })}
                            />
                          </td>
                          <td className="border px-2 py-3">
                            <input
                              className="border p-2 rounded w-full h-10"
                              value={editForm.timeOut}
                              onChange={(e) => setEditForm({ ...editForm, timeOut: e.target.value })}
                            />
                          </td>
                          <td className="border px-2 py-3">
                            <input
                              className="border p-2 rounded w-full h-10"
                              value={editForm.visitStatus}
                              onChange={(e) => setEditForm({ ...editForm, visitStatus: e.target.value })}
                            />
                          </td>
                          <td className="border px-2 py-3">
                            <input
                              className="border p-2 rounded w-full h-10"
                              value={editForm.status}
                              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                            />
                          </td>
                          <td className="border px-2 py-3">
                            <input
                              className="border p-2 rounded w-full h-10"
                              value={editForm.branches}
                              onChange={(e) => setEditForm({ ...editForm, branches: e.target.value })}
                            />
                          </td>
                          <td className="border px-2 py-3">
                            <input
                              className="border p-2 rounded w-full h-10"
                              value={editForm.ctc}
                              onChange={(e) => setEditForm({ ...editForm, ctc: e.target.value })}
                            />
                          </td>
                          {renderEditActionsCell(rowIndex, comp._id, day)}
                          {addOpen ? renderAddColumn(day, false, rowIndex) : null}
                        </>
                      ) : (
                        // normal display row for subsequent companies
                        <>
                          <td className="border px-2 py-3">{comp.company}</td>
                          <td className="border px-2 py-3">{comp.process}</td>
                          <td className="border px-2 py-3">{comp.timeIn}</td>
                          <td className="border px-2 py-3">{comp.timeOut}</td>
                          <td className="border px-2 py-3">{comp.visitStatus}</td>
                          <td className="border px-2 py-3">{comp.status}</td>
                          <td className="border px-2 py-3">{comp.branches}</td>
                          <td className="border px-2 py-3">{comp.ctc}</td>
                          {renderActionsCell(rowIndex, day, comp)}
                          {addOpen ? renderAddColumn(day, false, rowIndex) : null}
                        </>
                      )}
                    </tr>
                  );
                })}
                {/* INLINE ADD ROW when editingDate === day.date */}
                {editingDate === day.date && (
                  <tr className="bg-gray-100 min-h-[60px]">
                    <td className="border px-2 py-3">
                      <input
                        className="border p-2 rounded w-full h-10"
                        placeholder="Company"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                      />
                    </td>
                    <td className="border px-2 py-3">
                      <input
                        className="border p-2 rounded w-full h-10"
                        placeholder="Process"
                        value={form.process}
                        onChange={(e) => setForm({ ...form, process: e.target.value })}
                      />
                    </td>
                    <td className="border px-2 py-3">
                      <input
                        className="border p-2 rounded w-full h-10"
                        placeholder="Time In"
                        value={form.timeIn}
                        onChange={(e) => setForm({ ...form, timeIn: e.target.value })}
                      />
                    </td>
                    <td className="border px-2 py-3">
                      <input
                        className="border p-2 rounded w-full h-10"
                        placeholder="Time Out"
                        value={form.timeOut}
                        onChange={(e) => setForm({ ...form, timeOut: e.target.value })}
                      />
                    </td>
                    <td className="border px-2 py-3">
                      <input
                        className="border p-2 rounded w-full h-10"
                        placeholder="Visit Status"
                        value={form.visitStatus}
                        onChange={(e) => setForm({ ...form, visitStatus: e.target.value })}
                      />
                    </td>
                    <td className="border px-2 py-3">
                      <input
                        className="border p-2 rounded w-full h-10"
                        placeholder="Status"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                      />
                    </td>
                    <td className="border px-2 py-3">
                      <input
                        className="border p-2 rounded w-full h-10"
                        placeholder="Branches"
                        value={form.branches}
                        onChange={(e) => setForm({ ...form, branches: e.target.value })}
                      />
                    </td>
                    <td className="border px-2 py-3">
                      <input
                        className="border p-2 rounded w-full h-10"
                        placeholder="CTC"
                        value={form.ctc}
                        onChange={(e) => setForm({ ...form, ctc: e.target.value })}
                      />
                    </td>
                    <td className="border px-2 py-3"></td>
                    {renderAddColumn(day, false, addRowIndex, true)}
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}