import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";

export default function ProfessorRepresentativeDashboard() {

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    batch: "",
    course: "",
    branch: "",
    type: ""
  });

  // ----------------------------
  // Batch Options 2026–2030
  // ----------------------------
  const batchOptions = [
    { value: "2026", label: "2026" },
    { value: "2027", label: "2027" },
    { value: "2028", label: "2028" },
    { value: "2029", label: "2029" },
    { value: "2030", label: "2030" },
  ];

  // ----------------------------
  // Course Options
  // ----------------------------
  const courseOptions = [
    { value: "All", label: "All" },
    { value: "B.Tech", label: "B.Tech" },
    { value: "M.Tech", label: "M.Tech" },
    { value: "MBA", label: "MBA" },
    { value: "M.Sc.", label: "M.Sc." },
  ];

    const btechdepartmentOptions = [
    {
      label: "BIO TECHNOLOGY",
      options: [{ value: "BIO TECHNOLOGY", label: "BIO TECHNOLOGY" }],
    },
    {
      label: "CHEMICAL ENGINEERING",
      options: [
        { value: "CHEMICAL ENGINEERING", label: "CHEMICAL ENGINEERING" },
      ],
    },
    {
      label: "CIVIL ENGINEERING",
      options: [{ value: "CIVIL ENGINEERING", label: "CIVIL ENGINEERING" }],
    },
    {
      label: "COMPUTER SCIENCE AND ENGINEERING",
      options: [
        {
          value: "COMPUTER SCIENCE AND ENGINEERING",
          label: "COMPUTER SCIENCE AND ENGINEERING",
        },
        {
          value: "DATA SCIENCE AND ENGINEERING",
          label: "DATA SCIENCE AND ENGINEERING",
        },
      ],
    },
    {
      label: "ELECTRICAL ENGINEERING",
      options: [
        { value: "ELECTRICAL ENGINEERING", label: "ELECTRICAL ENGINEERING" },
      ],
    },
    {
      label: "ELECTRONICS AND COMMUNICATION ENGINEERING",
      options: [
        {
          value: "ELECTRONICS AND COMMUNICATION ENGINEERING",
          label: "ELECTRONICS AND COMMUNICATION ENGINEERING",
        },
        {
          value: "ELECTRONICS AND VLSI ENGINEERING",
          label: "ELECTRONICS AND VLSI ENGINEERING",
        },
      ],
    },
    {
      label: "INDUSTRIAL AND PRODUCTION ENGINEERING",
      options: [
        {
          value: "INDUSTRIAL AND PRODUCTION ENGINEERING",
          label: "INDUSTRIAL AND PRODUCTION ENGINEERING",
        },
      ],
    },
    {
      label: "INFORMATION TECHNOLOGY",
      options: [
        { value: "INFORMATION TECHNOLOGY", label: "INFORMATION TECHNOLOGY" },
      ],
    },
    {
      label: "INSTRUMENTATION AND CONTROL ENGINEERING",
      options: [
        {
          value: "INSTRUMENTATION AND CONTROL ENGINEERING",
          label: "INSTRUMENTATION AND CONTROL ENGINEERING",
        },
      ],
    },
    {
      label: "MATHEMATICS AND COMPUTING",
      options: [
        {
          value: "MATHEMATICS AND COMPUTING",
          label: "MATHEMATICS AND COMPUTING",
        },
      ],
    },
    {
      label: "MECHANICAL ENGINEERING",
      options: [
        { value: "MECHANICAL ENGINEERING", label: "MECHANICAL ENGINEERING" },
      ],
    },
    {
      label: "TEXTILE TECHNOLOGY",
      options: [{ value: "TEXTILE TECHNOLOGY", label: "TEXTILE TECHNOLOGY" }],
    },
  ];

  const mtechdepartmentOptions = [
    {
      label: "BIO TECHNOLOGY",
      options: [{ value: "BIO TECHNOLOGY", label: "BIO TECHNOLOGY" }],
    },
    {
      label: "CHEMICAL ENGINEERING",
      options: [
        { value: "CHEMICAL ENGINEERING", label: "CHEMICAL ENGINEERING" },
      ],
    },
    {
      label: "CIVIL ENGINEERING",
      options: [
        {
          value: "STRUCTURAL AND CONSTRUCTION ENGINEERING",
          label: "STRUCTURAL AND CONSTRUCTION ENGINEERING",
        },
        {
          value: "GEOTECHNICAL AND GEO-ENVIRONMENTAL ENGINEERING",
          label: "GEOTECHNICAL AND GEO-ENVIRONMENTAL ENGINEERING",
        },
      ],
    },
    {
      label: "COMPUTER SCIENCE AND ENGINEERING",
      options: [
        {
          value: "COMPUTER SCIENCE AND ENGINEERING",
          label: "COMPUTER SCIENCE AND ENGINEERING",
        },
        {
          value: "COMPUTER SCIENCE AND ENGINEERING (INFORMATION SECURITY)",
          label: "COMPUTER SCIENCE AND ENGINEERING (INFORMATION SECURITY)",
        },
        {
          value: "DATA SCIENCE AND ENGINEERING",
          label: "DATA SCIENCE AND ENGINEERING",
        },
      ],
    },
    {
      label: "ELECTRICAL ENGINEERING",
      options: [
        { value: "ELECTRIC VEHICLE DESIGN", label: "ELECTRIC VEHICLE DESIGN" },
      ],
    },
    {
      label: "ELECTRONICS AND COMMUNICATION ENGINEERING",
      options: [
        {
          value: "SIGNAL PROCESSING AND MACHINE LEARNING",
          label: "SIGNAL PROCESSING AND MACHINE LEARNING",
        },
        { value: "VLSI DESIGN", label: "VLSI DESIGN" },
      ],
    },
    {
      label: "INDUSTRIAL AND PRODUCTION ENGINEERING",
      options: [
        {
          value: "INDUSTRIAL ENGINEERING AND DATA ANALYTICS",
          label: "INDUSTRIAL ENGINEERING AND DATA ANALYTICS",
        },
      ],
    },
    {
      label: "INFORMATION TECHNOLOGY",
      options: [{ value: "DATA ANALYTICS", label: "DATA ANALYTICS" }],
    },
    {
      label: "CONTROL AND INSTRUMENTATION ENGINEERING",
      options: [
        {
          value: "CONTROL AND INSTRUMENTATION ENGINEERING",
          label: "CONTROL AND INSTRUMENTATION ENGINEERING",
        },
        {
          value: "MACHINE INTELLIGENCE AND AUTOMATION",
          label: "MACHINE INTELLIGENCE AND AUTOMATION",
        },
      ],
    },
    {
      label: "MATHEMATICS AND COMPUTING",
      options: [
        {
          value: "MATHEMATICS AND COMPUTING",
          label: "MATHEMATICS AND COMPUTING",
        },
      ],
    },
    {
      label: "MECHANICAL ENGINEERING",
      options: [
        { value: "DESIGN ENGINEERING", label: "DESIGN ENGINEERING" },
        {
          value: "THERMAL AND ENERGY ENGINEERING",
          label: "THERMAL AND ENERGY ENGINEERING",
        },
      ],
    },
    {
      label: "TEXTILE TECHNOLOGY",
      options: [
        {
          value: "TEXTILE TECHNOLOGY",
          label: "TEXTILE TECHNOLOGY",
        },
        {
          value: "TEXTILE ENGINEERING AND MANAGEMENT",
          label: "TEXTILE ENGINEERING AND MANAGEMENT",
        },
      ],
    },
    {
      label: "RENEWABLE ENERGY",
      options: [{ value: "RENEWABLE ENERGY", label: "RENEWABLE ENERGY" }],
    },
    {
      label: "ARTIFICIAL INTELLIGENCE",
      options: [
        { value: "ARTIFICIAL INTELLIGENCE", label: "ARTIFICIAL INTELLIGENCE" },
      ],
    },
    {
      label: "POWER SYSTEMS AND RELIABILITY",
      options: [
        {
          value: "POWER SYSTEMS AND RELIABILITY",
          label: "POWER SYSTEMS AND RELIABILITY",
        },
      ],
    },
  ];

  const mbadepartmentOptions = [
    {
      label: "HUMANITIES AND MANAGEMENT",
      options: [
        {
          value: "HUMANITIES AND MANAGEMENT",
          label: "HUMANITIES AND MANAGEMENT",
        },
      ],
    },
  ];

  const mscdepartmentOptions = [
    {
      label: "CHEMISTRY",
      options: [{ value: "CHEMISTRY", label: "CHEMISTRY" }],
    },
    {
      label: "MATHEMATICS",
      options: [{ value: "MATHEMATICS", label: "MATHEMATICS" }],
    },
    {
      label: "PHYSICS",
      options: [{ value: "PHYSICS", label: "PHYSICS" }],
    },
  ];

  const phddepartmentOptions = [];

  const allDepartments = [
    ...btechdepartmentOptions,
    ...mtechdepartmentOptions,
    ...mbadepartmentOptions,
    ...mscdepartmentOptions,
    ...phddepartmentOptions,
  ];

  // ----------------------------
  // Department Options Mapping
  // ----------------------------
  const departmentMap = {
    "B.Tech": btechdepartmentOptions,
    "M.Tech": mtechdepartmentOptions,
    "MBA": mbadepartmentOptions,
    "M.Sc.": mscdepartmentOptions,
  };

  const branchOptions =
    filters.course && filters.course !== "All"
      ? departmentMap[filters.course] || []
      : [];

  // ----------------------------
  // Fetch Applications
  // ----------------------------
  const fetchApplications = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/representative/list", {
        params: filters,
        withCredentials: true
      });

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.applications || [];

      setApplications(data);

    } catch (error) {
      console.error(error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // ----------------------------
  // Handlers
  // ----------------------------
  const handleExport = () => {
    const query = new URLSearchParams(filters).toString();
    window.open(`/api/representative/export?${query}`, "_blank");
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">
        Representative Applications
      </h2>

      {/* Filters Section */}
      <div className="grid grid-cols-4 gap-4 mb-6">

        {/* Batch */}
        <Select
          options={batchOptions}
          placeholder="Select Batch"
          onChange={(selected) =>
            setFilters({ ...filters, batch: selected?.value || "" })
          }
          isClearable
        />

        {/* Course */}
        <Select
          options={courseOptions}
          placeholder="Select Course"
          onChange={(selected) =>
            setFilters({
              ...filters,
              course: selected?.value || "",
              branch: ""   // reset branch on course change
            })
          }
          isClearable
        />

        {/* Branch (depends on course) */}
        <Select
          options={branchOptions}
          placeholder="Select Branch"
          isDisabled={!filters.course || filters.course === "All"}
          onChange={(selected) =>
            setFilters({ ...filters, branch: selected?.value || "" })
          }
          isClearable
        />

        {/* Type */}
        <Select
          options={[
            { value: "", label: "All Types" },
            { value: "placement", label: "Placement" },
            { value: "internship", label: "Internship" }
          ]}
          placeholder="Select Type"
          onChange={(selected) =>
            setFilters({ ...filters, type: selected?.value || "" })
          }
          isClearable
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={fetchApplications}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Apply Filters
        </button>

        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Export Excel
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Roll</th>
              <th className="border p-2">CGPA</th>
              <th className="border p-2">Branch</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">PDF</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  No Applications Found
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app._id}>
                  <td className="border p-2">{app.student?.name}</td>
                  <td className="border p-2">{app.student?.rollNumber}</td>
                  <td className="border p-2">{app.student?.cgpa}</td>
                  <td className="border p-2">{app.branch}</td>
                  <td className="border p-2 capitalize">{app.type}</td>
                  <td className="border p-2">
                    <a
                      href={`/api/representative/pdf/${app._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}