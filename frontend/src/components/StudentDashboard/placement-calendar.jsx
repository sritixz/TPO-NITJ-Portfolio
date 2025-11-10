import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ProfessorCalendar() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [calendar, setCalendar] = useState([]);
  const BASE = import.meta.env.REACT_APP_BASE_URL;

  const generateMonthDays = () => {
    const days = [];
    const total = new Date(year, month, 0).getDate();
    for (let i = 1; i <= total; i++) {
      const d = new Date(year, month - 1, i);
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

  const currentYear = new Date().getFullYear();

  return (
    <div className="p-3">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Placement <span className="text-custom-blue">Calendar</span></h1>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <select
            className="bg-white border border-gray-300 p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm flex-1 sm:flex-none"
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
            className="bg-white border border-gray-300 p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm flex-1 sm:flex-none"
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

      <div className="overflow-x-auto">
        <table className="w-full border text-xs sm:text-sm rounded-t-xl table-fixed min-w-[800px]">
          <thead className="bg-custom-blue text-white uppercase text-xs sm:text-sm tracking-wide">
            <tr>
              <th className="py-3 px-2 rounded-tl-xl w-32 text-center">Date</th>
              <th className="py-3 px-1 w-48 text-center">Company</th>
              <th className="py-3 px-1 w-32 text-center">Process</th>
              <th className="py-3 px-2 w-20 text-center">Time In</th>
              <th className="py-3 px-2 w-20 text-center">Time Out</th>
              <th className="py-3 px-2 w-24 text-center">Visit Status</th>
              <th className="py-3 px-2 w-24 text-center">Status</th>
              <th className="py-3 px-2 w-36 text-center">Branches</th>
              <th className="py-3 px-2 rounded-tr-xl w-20 text-center">CTC</th>
            </tr>
          </thead>
          <tbody>
            {calendar.map((day) => {
              const hasCompanies = day.companies.length > 0;
              const trClass = day.isSunday
                ? "bg-red-100 font-semibold min-h-[60px]"
                : hasCompanies
                ? "bg-gray-50 min-h-[60px]"
                : "min-h-[60px] bg-blue-50";
              const rowSpanValue = hasCompanies ? day.companies.length : 1;
              return (
                <React.Fragment key={day.date}>
                  <tr className={trClass}>
                    {/* DATE CELL */}
                    <td
                      className="border px-2 py-1 align-middle text-center w-32"
                      rowSpan={rowSpanValue}
                    >
                      {day.label}
                    </td>
                    {hasCompanies ? (
                      // FIRST company row of the date
                      (() => {
                        const comp = day.companies[0];
                        return (
                          <>
                            <td className="border px-1 py-3 w-48 whitespace-normal break-words text-center">{comp.company}</td>
                            <td className="border px-1 py-3 w-32 whitespace-normal break-words text-center">{comp.process}</td>
                            <td className="border px-1 py-3 w-20 whitespace-normal break-words text-center">{comp.timeIn}</td>
                            <td className="border px-1 py-3 w-20 whitespace-normal break-words text-center">{comp.timeOut}</td>
                            <td className="border px-1 py-3 w-24 whitespace-normal break-words text-center">{comp.visitStatus}</td>
                            <td className="border px-1 py-3 w-24 whitespace-normal break-words text-center">{comp.status}</td>
                            <td className="border px-1 py-3 w-36 whitespace-normal break-words text-center">{comp.branches}</td>
                            <td className="border px-1 py-3 w-20 whitespace-normal break-words text-center">{comp.ctc}</td>
                          </>
                        );
                      })()
                    ) : day.isSunday ? (
                      <td colSpan={8} className="text-center py-5">
                        {/* SUNDAY row */}
                        {day.dayStatus?.trim() ? day.dayStatus : "Sunday"}
                      </td>
                    ) : (
                      // NO companies: show placeholder
                      <td colSpan={8} className="border px-2 py-3 bg-blue-50">
                        <div className="text-center py-2">
                          {day.dayStatus?.trim() ? (
                            <span className="text-gray-700 font-medium">{day.dayStatus}</span>
                          ) : (
                            <span className="text-gray-500 italic">No events</span>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                  {/* RENDER REMAINING COMPANIES (index 1..) */}
                  {day.companies.slice(1).map((comp, i) => (
                    <tr key={`${day.date}-${comp._id || i}`} className={day.isSunday ? "bg-red-100 font-semibold min-h-[60px]" : "bg-gray-50 min-h-[60px]"}>
                      <td className="border px-1 py-3 w-48 whitespace-normal break-words text-center">{comp.company}</td>
                      <td className="border px-1 py-3 w-32 whitespace-normal break-words text-center">{comp.process}</td>
                      <td className="border px-1 py-3 w-20 whitespace-normal break-words text-center">{comp.timeIn}</td>
                      <td className="border px-1 py-3 w-20 whitespace-normal break-words text-center">{comp.timeOut}</td>
                      <td className="border px-1 py-3 w-24 whitespace-normal break-words text-center">{comp.visitStatus}</td>
                      <td className="border px-1 py-3 w-24 whitespace-normal break-words text-center">{comp.status}</td>
                      <td className="border px-1 py-3 w-36 whitespace-normal break-words text-center">{comp.branches}</td>
                      <td className="border px-1 py-3 w-20 whitespace-normal break-words text-center">{comp.ctc}</td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}