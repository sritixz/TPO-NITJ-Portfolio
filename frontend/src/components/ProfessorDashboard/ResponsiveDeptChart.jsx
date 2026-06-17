/**
 * ResponsiveDeptChart.jsx
 *
 * Drop-in replacement for the department bar chart in InsightDashboard.
 * Usage:
 *   import ResponsiveDeptChart from "./ResponsiveDeptChart";
 *   <ResponsiveDeptChart data={deptData} dataKey="count" label="Department-wise Internship Count" />
 *
 * Props:
 *   data      - array of { name: string, count: number, ... }
 *   dataKey   - key to plot on Y-axis (default: "count")
 *   label     - chart title
 *   color     - bar fill color (default: "#0369a0")
 */

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

// Abbreviate long department names for the X-axis tick labels
const abbreviate = (name = "") => {
  const map = {
    "COMPUTER SCIENCE AND ENGINEERING": "CSE",
    "DATA SCIENCE AND ENGINEERING": "DSE",
    "ELECTRONICS AND COMMUNICATION ENGINEERING": "ECE",
    "ELECTRONICS AND VLSI ENGINEERING": "EVE",
    "ELECTRICAL ENGINEERING": "EE",
    "MECHANICAL ENGINEERING": "ME",
    "CIVIL ENGINEERING": "CE",
    "INFORMATION TECHNOLOGY": "IT",
    "INDUSTRIAL AND PRODUCTION ENGINEERING": "IPE",
    "MATHEMATICS AND COMPUTING": "MNC",
    "CHEMICAL ENGINEERING": "CHE",
    "BIO TECHNOLOGY": "BT",
    "TEXTILE TECHNOLOGY": "TT",
    "INSTRUMENTATION AND CONTROL ENGINEERING": "ICE",
  };
  // Exact match first
  if (map[name.toUpperCase()]) return map[name.toUpperCase()];
  // Acronym fallback: first letter of each word
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
};

const COLORS = [
  "#0369a0", "#0284c7", "#0ea5e9", "#38bdf8",
  "#7dd3fc", "#bae6fd", "#0c4a6e", "#075985",
  "#1e40af", "#1d4ed8", "#2563eb", "#3b82f6",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        <p className="text-custom-blue font-bold">{payload[0].value} students</p>
      </div>
    );
  }
  return null;
};

const ResponsiveDeptChart = ({
  data = [],
  dataKey = "count",
  label = "Department-wise Placement Count",
  color = "#0369a0",
}) => {
  // Shorten department names for display
  const chartData = data.map((d) => ({
    ...d,
    shortName: abbreviate(d.name || d.department || ""),
    fullName: d.name || d.department || "",
  }));

  return (
    <div className="w-full">
      {/* Title */}
      <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span className="inline-block w-4 h-4 rounded bg-custom-blue opacity-80" />
        {label}
      </h3>

      {/* Chart — uses 100% width so it shrinks on mobile */}
      <div className="w-full overflow-x-auto">
        <div style={{ minWidth: Math.max(chartData.length * 56, 300) }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 16, left: 0, bottom: 8 }}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="shortName"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f0f9ff" }} />
              <Bar dataKey={dataKey} radius={[6, 6, 0, 0]} maxBarSize={40}>
                {/* Count label on top of each bar */}
                <LabelList
                  dataKey={dataKey}
                  position="top"
                  style={{ fontSize: 11, fontWeight: 600, fill: "#374151" }}
                />
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend — full department names below chart */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {chartData.map((d, i) => (
          <div key={i} className="flex items-center gap-1 text-xs text-gray-600">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="font-medium">{d.shortName}</span>
            <span className="text-gray-400">– {d.fullName}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResponsiveDeptChart;
