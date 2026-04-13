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
      const iso = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
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
    <div className="p-2 sm:p-4 bg-gray-50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Placement <span className="text-custom-blue">Calendar</span>
        </h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            className="bg-white border border-gray-300 p-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 text-sm flex-1 md:w-40"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(currentYear, i, 1).toLocaleDateString("en-IN", { month: "long" })}
              </option>
            ))}
          </select>
          <select
            className="bg-white border border-gray-300 p-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 text-sm flex-1 md:w-32"
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

      {/* MOBILE VIEW (Cards) - Shown on small screens, hidden on LG */}
      <div className="block lg:hidden space-y-4">
        {calendar.map((day) => (
          <div 
            key={day.date} 
            className={`rounded-lg border shadow-sm overflow-hidden ${day.isSunday ? 'border-red-200' : 'border-gray-200'}`}
          >
            <div className={`p-3 font-bold text-sm flex justify-between items-center ${day.isSunday ? 'bg-red-100 text-red-700' : 'bg-custom-blue text-white'}`}>
              <span>{day.label}</span>
              {day.isSunday && <span className="text-xs uppercase tracking-wider">Sunday</span>}
            </div>
            
            <div className="bg-white p-3">
              {day.companies.length > 0 ? (
                day.companies.map((comp, idx) => (
                  <div key={idx} className={`${idx !== 0 ? 'mt-4 pt-4 border-t border-dashed' : ''}`}>
                    <div className="grid grid-cols-2 gap-y-2 text-xs">
                      <div className="col-span-2 text-blue-700 font-bold text-sm mb-1">{comp.company}</div>
                      <div className="text-gray-500">Process:</div><div className="font-medium text-right">{comp.process}</div>
                      <div className="text-gray-500">Time:</div><div className="font-medium text-right">{comp.timeIn} - {comp.timeOut}</div>
                      <div className="text-gray-500">Status:</div><div className="font-medium text-right">{comp.status}</div>
                      <div className="text-gray-500">Branches:</div><div className="font-medium text-right">{comp.branches}</div>
                      <div className="text-gray-500">CTC:</div><div className="font-bold text-right text-green-600">{comp.ctc}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 italic text-sm">
                  {day.dayStatus?.trim() ? day.dayStatus : (day.isSunday ? "Sunday" : "No events scheduled")}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP VIEW (Table) - Hidden on small screens, shown on LG */}
      <div className="hidden lg:block overflow-x-auto shadow-md rounded-xl">
        <table className="w-full border-collapse text-sm table-fixed min-w-[1000px]">
          <thead className="bg-custom-blue text-white uppercase text-xs tracking-wide">
            <tr>
              <th className="py-4 px-2 w-32 text-center">Date</th>
              <th className="py-4 px-1 w-48 text-center">Company</th>
              <th className="py-4 px-1 w-32 text-center">Process</th>
              <th className="py-4 px-2 w-20 text-center">Time In</th>
              <th className="py-4 px-2 w-20 text-center">Time Out</th>
              <th className="py-4 px-2 w-24 text-center">Visit Status</th>
              <th className="py-4 px-2 w-24 text-center">Status</th>
              <th className="py-4 px-2 w-36 text-center">Branches</th>
              <th className="py-4 px-2 w-24 text-center">CTC</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {calendar.map((day) => {
              const hasCompanies = day.companies.length > 0;
              const trClass = day.isSunday ? "bg-red-50" : hasCompanies ? "hover:bg-gray-50" : "bg-blue-50/30";
              const rowSpanValue = hasCompanies ? day.companies.length : 1;

              return (
                <React.Fragment key={day.date}>
                  <tr className={trClass}>
                    <td className="border px-2 py-4 align-middle text-center font-medium" rowSpan={rowSpanValue}>
                      {day.label}
                    </td>
                    {hasCompanies ? (
                      <>
                        <td className="border px-1 py-4 text-center font-semibold text-blue-900">{day.companies[0].company}</td>
                        <td className="border px-1 py-4 text-center">{day.companies[0].process}</td>
                        <td className="border px-1 py-4 text-center">{day.companies[0].timeIn}</td>
                        <td className="border px-1 py-4 text-center">{day.companies[0].timeOut}</td>
                        <td className="border px-1 py-4 text-center">{day.companies[0].visitStatus}</td>
                        <td className="border px-1 py-4 text-center">{day.companies[0].status}</td>
                        <td className="border px-1 py-4 text-center text-xs">{day.companies[0].branches}</td>
                        <td className="border px-1 py-4 text-center font-bold">{day.companies[0].ctc}</td>
                      </>
                    ) : (
                      <td colSpan={8} className={`border px-2 py-6 text-center ${day.isSunday ? 'text-red-600 font-bold' : 'text-gray-500 italic'}`}>
                        {day.dayStatus?.trim() ? day.dayStatus : (day.isSunday ? "Sunday" : "No events")}
                      </td>
                    )}
                  </tr>
                  {day.companies.slice(1).map((comp, i) => (
                    <tr key={`${day.date}-${comp._id || i}`} className={trClass}>
                      <td className="border px-1 py-4 text-center font-semibold text-blue-900">{comp.company}</td>
                      <td className="border px-1 py-4 text-center">{comp.process}</td>
                      <td className="border px-1 py-4 text-center">{comp.timeIn}</td>
                      <td className="border px-1 py-4 text-center">{comp.timeOut}</td>
                      <td className="border px-1 py-4 text-center">{comp.visitStatus}</td>
                      <td className="border px-1 py-4 text-center">{comp.status}</td>
                      <td className="border px-1 py-4 text-center text-xs">{comp.branches}</td>
                      <td className="border px-1 py-4 text-center font-bold">{comp.ctc}</td>
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