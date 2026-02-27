import React, { useState, useEffect } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { FaFileExcel, FaSpinner, FaFilter } from "react-icons/fa";
import { toast } from "react-hot-toast";

const btechdepartmentOptions = [
  {
    label: "BIO TECHNOLOGY",
    options: [{ value: "BIO TECHNOLOGY", label: "BIO TECHNOLOGY" }],
  },
  {
    label: "CHEMICAL ENGINEERING",
    options: [{ value: "CHEMICAL ENGINEERING", label: "CHEMICAL ENGINEERING" }],
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
        value: " ELECTRONICS AND VLSI ENGINEERING",
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
    options: [{ value: "CHEMICAL ENGINEERING", label: "CHEMICAL ENGINEERING" }],
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
  { value: "HUMANITIES AND MANAGEMENT", label: "HUMANITIES AND MANAGEMENT" },
];

const mscdepartmentOptions = [
  { value: "CHEMISTRY", label: "CHEMISTRY" },
  { value: "MATHEMATICS", label: "MATHEMATICS" },
  { value: "PHYSICS", label: "PHYSICS" },
];

const phddepartmentOptions = [];

const PlacementRegistrationExportFaculty = () => {
  const [filterOptions, setFilterOptions] = useState({
    batches: ["2026", "2027", "2028", "2029", "2030"],
    courses: ["B.Tech", "M.Tech", "MBA", "M.Sc."],
    departments: [],
  });
  const [filters, setFilters] = useState({
    batch: "",
    course: "",
    department: "",
  });
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState([]);

  const [deadline, setDeadline] = useState({
    allowed: false,
    deadlinetoshow: "",
  });
  const [deadlineId, setDeadlineId] = useState(null);
  const [saving, setSaving] = useState(false);

  function formatDateForInputIST(dateString) {
    const date = new Date(dateString);

    // Convert UTC to IST
    const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in ms
    const istDate = new Date(date.getTime() + istOffset);

    const year = istDate.getUTCFullYear();
    const month = String(istDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(istDate.getUTCDate()).padStart(2, "0");
    const hours = String(istDate.getUTCHours()).padStart(2, "0");
    const minutes = String(istDate.getUTCMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  useEffect(() => {
    if (filters.course) {
      let departments = [];
      switch (filters.course) {
        case "B.Tech":
          departments = btechdepartmentOptions.flatMap((group) =>
            group.options.map((opt) => opt.value),
          );
          break;
        case "M.Tech":
          departments = mtechdepartmentOptions.flatMap((group) =>
            group.options.map((opt) => opt.value),
          );
          break;
        case "MBA":
          departments = mbadepartmentOptions.map((opt) => opt.value);
          break;
        case "M.Sc.":
          departments = mscdepartmentOptions.map((opt) => opt.value);
          break;
        case "PHD":
          departments = phddepartmentOptions.map((opt) => opt.value);
          break;
        default:
          departments = [];
      }
      setFilterOptions((prev) => ({
        ...prev,
        departments,
      }));
      setFilters((prev) => ({
        ...prev,
        department: "",
      }));
    } else {
      setFilterOptions((prev) => ({
        ...prev,
        departments: [],
      }));
      setFilters((prev) => ({
        ...prev,
        department: "",
      }));
    }
  }, [filters.course]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "course" && { department: "" }),
    }));
  };

  const resetFilters = () => {
    setFilters({
      batch: "",
      course: "",
      department: "",
    });
    setStudentData([]);
  };

  const fetchAndExport = async () => {
    setLoading(true);
    try {
      const { batch, course, department } = filters;
      const queryParams = new URLSearchParams();
      if (batch) queryParams.append("batch", batch);
      if (course) queryParams.append("course", course);
      if (department) queryParams.append("department", department);

      const response = await axios.get(
        `${import.meta.env.REACT_APP_BASE_URL}/placement-registration/export?${queryParams.toString()}`,
        { withCredentials: true },
      );
      if (response.data.success) {
        if (response.data.data.length === 0) {
          toast.error("Zero registrations found for this filter");
          setStudentData([]);
        } else {
          setStudentData(response.data.data);
          await exportToExcel(response.data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast.error("Error fetching student data");
    } finally {
      setLoading(false);
    }
  };

  // const exportToExcel = async (data) => {
  //   if (data.length === 0) return;

  //   const workbook = new ExcelJS.Workbook();

  //   const createSheetWithData = (sheetName, sheetData) => {
  //     const sheet = workbook.addWorksheet(sheetName.substring(0, 31));

  //     sheet.columns = [
  //       { header: 'Roll No.', key: 'rollno', width: 15 },
  //       { header: 'Name', key: 'name', width: 20 },
  //       { header: 'Course', key: 'course', width: 15 },
  //       { header: 'Department', key: 'department', width: 30 },
  //       { header: 'Batch', key: 'batch', width: 10 },
  //       { header: 'Father Name', key: 'fatherName', width: 20 },
  //       { header: 'Mother Name', key: 'motherName', width: 20 },
  //       { header: 'Category', key: 'category', width: 15 },
  //       { header: 'Gender', key: 'gender', width: 10 },
  //       { header: 'Date of Birth', key: 'dateOfBirth', width: 15 },
  //       { header: 'Physically Disabled', key: 'physicallyDisabled', width: 15 },
  //       { header: 'Disability Type', key: 'disabilityType', width: 15 },
  //       { header: 'Permanent Address', key: 'permanentAddress', width: 30 },
  //       { header: 'Mobile No.', key: 'mobileNo', width: 15 },
  //       { header: 'NITJ Email', key: 'emailNitj', width: 20 },
  //       { header: 'Personal Email', key: 'emailPersonal', width: 20 },
  //       { header: 'Aadhar No.', key: 'aadharCardNo', width: 15 },
  //       { header: 'Interested', key: 'interested', width: 10 },
  //       { header: 'Description', key: 'description', width: 30 }
  //     ];

  //     sheetData.forEach((item, idx) => {
  //       sheet.addRow({
  //         rollno: item.rollno,
  //         name: item.name,
  //         course: item.course,
  //         department: item.department,
  //         batch: item.batch,
  //         fatherName: item.fatherName,
  //         motherName: item.motherName,
  //         category: item.category,
  //         gender: item.gender,
  //         dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth).toLocaleDateString() : '',
  //         physicallyDisabled: item.physicallyDisabled ? 'Yes' : 'No',
  //         disabilityType: item.disabilityType || '',
  //         permanentAddress: item.permanentAddress,
  //         mobileNo: item.mobileNo,
  //         emailNitj: item.emailNitj,
  //         emailPersonal: item.emailPersonal,
  //         aadharCardNo: item.aadharCardNo,
  //         interested: item.interested ? 'Yes' : 'No',
  //         description: item.description
  //       });
  //     });

  //     const headerRow = sheet.getRow(1);
  //     headerRow.eachCell((cell) => {
  //       cell.fill = {
  //         type: 'pattern',
  //         pattern: 'solid',
  //         fgColor: { argb: 'FFD3D3D3' }
  //       };
  //       cell.border = {
  //         top: { style: 'thin', color: { argb: 'FF000000' } },
  //         left: { style: 'thin', color: { argb: 'FF000000' } },
  //         bottom: { style: 'thin', color: { argb: 'FF000000' } },
  //         right: { style: 'thin', color: { argb: 'FF000000' } }
  //       };
  //     });

  //     sheet.eachRow((row) => {
  //       row.eachCell((cell) => {
  //         cell.border = {
  //           top: { style: 'thin', color: { argb: 'FF000000' } },
  //           left: { style: 'thin', color: { argb: 'FF000000' } },
  //           bottom: { style: 'thin', color: { argb: 'FF000000' } },
  //           right: { style: 'thin', color: { argb: 'FF000000' } }
  //         };
  //       });
  //     });

  //     sheet.autoFilter = {
  //       from: { row: 1, column: 1 },
  //       to: { row: 1, column: sheet.columns.length }
  //     };
  //   };

  //   if (filters.department) {
  //     createSheetWithData(filters.department, data);
  //   } else {
  //     const grouped = data.reduce((acc, item) => {
  //       const dept = item.department || "Unknown";
  //       if (!acc[dept]) acc[dept] = [];
  //       acc[dept].push(item);
  //       return acc;
  //     }, {});
  //     Object.entries(grouped).forEach(([dept, data]) => {
  //       createSheetWithData(dept, data);
  //     });
  //   }

  //   const buffer = await workbook.xlsx.writeBuffer();
  //   const blob = new Blob([buffer], {
  //     type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  //   });
  //   const { batch, course, department } = filters;
  //   const fileNameParts = [
  //     batch || 'AllBatches',
  //     course || 'AllCourses',
  //     department || 'AllDepartments'
  //   ];
  //   const fileName = fileNameParts.join('_').replace(/\s+/g, '_');
  //   saveAs(blob, `${fileName}.xlsx`);
  // };

  const exportToExcel = async (data) => {
    if (data.length === 0) return;

    const workbook = new ExcelJS.Workbook();

    const createSheetWithData = (sheetName, sheetData) => {
      const sheet = workbook.addWorksheet(sheetName.substring(0, 31));

      sheet.columns = [
        { header: "Roll No.", key: "rollno", width: 15 },
        { header: "Name", key: "name", width: 20 },
        { header: "Course", key: "course", width: 15 },
        { header: "Department", key: "department", width: 30 },
        { header: "Batch", key: "batch", width: 10 },
        { header: "Father Name", key: "fatherName", width: 20 },
        { header: "Mother Name", key: "motherName", width: 20 },
        { header: "Category", key: "category", width: 15 },
        { header: "Gender", key: "gender", width: 10 },
        { header: "Date of Birth", key: "dateOfBirth", width: 15 },
        { header: "Physically Disabled", key: "physicallyDisabled", width: 15 },
        { header: "Disability Type", key: "disabilityType", width: 15 },
        { header: "Permanent Address", key: "permanentAddress", width: 30 },
        { header: "Mobile No.", key: "mobileNo", width: 15 },
        { header: "NITJ Email", key: "emailNitj", width: 20 },
        { header: "Personal Email", key: "emailPersonal", width: 20 },
        { header: "Aadhar No.", key: "aadharCardNo", width: 15 },
        { header: "Interested", key: "interested", width: 10 },
        { header: "Description", key: "description", width: 30 },
        { header: "Training Required", key: "trainingRequired", width: 30 },
        { header: "Preferred Sector", key: "preferredSector", width: 30 },
        { header: "Private Type", key: "privateType", width: 30 },
        { header: "Non-Tech Roles", key: "nonTechType", width: 35 },
        { header: "Other Non-Tech Role", key: "otherNonTechRole", width: 30 },
        { header: "Training Platform", key: "trainingPlatform", width: 30 },
      ];

      sheetData.forEach((item, idx) => {
        sheet.addRow({
          rollno: item.rollno,
          name: item.name,
          course: item.course,
          department: item.department,
          batch: item.batch,
          fatherName: item.fatherName,
          motherName: item.motherName,
          category: item.category,
          gender: item.gender,
          dateOfBirth: item.dateOfBirth
            ? new Date(item.dateOfBirth).toLocaleDateString()
            : "",
          physicallyDisabled:
  item.physicallyDisabled === true
    ? 'Yes'
    : item.physicallyDisabled === false
      ? 'No'
      : '',
          disabilityType: item.disabilityType || "",
          permanentAddress: item.permanentAddress,
          mobileNo: item.mobileNo,
          emailNitj: item.emailNitj,
          emailPersonal: item.emailPersonal,
          aadharCardNo: item.aadharCardNo,
          interested: item.interested ? 'Yes' : 'No',
          description: item.description,
          preferredSector: item.preferredSector || "",
          privateType: item.privateType || "",

          nonTechType: Array.isArray(item.nonTechType)
            ? item.nonTechType.join(", ")
            : "",

          otherNonTechRole: item.otherNonTechRole || "",

          trainingRequired:
            item.trainingRequired === true
              ? "Yes"
              : item.trainingRequired === false
                ? "No"
                : "",

          trainingPlatform: item.trainingPlatform || "",
        });
      });

      const headerRow = sheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD3D3D3" },
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        };
      });

      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FF000000" } },
            left: { style: "thin", color: { argb: "FF000000" } },
            bottom: { style: "thin", color: { argb: "FF000000" } },
            right: { style: "thin", color: { argb: "FF000000" } },
          };
        });
      });

      sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: sheet.columns.length },
      };
    };

    if (filters.department) {
      // If the user filtered by a specific department, keep existing behavior:
      createSheetWithData(filters.department, data);
    } else {
      // NEW: create an "All" sheet with every record
      createSheetWithData("All", data);

      const grouped = data.reduce((acc, item) => {
        const dept = item.department || "Unknown";
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(item);
        return acc;
      }, {});
      Object.entries(grouped).forEach(([dept, deptData]) => {
        createSheetWithData(dept, deptData);
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const { batch, course, department } = filters;
    const fileNameParts = [
      batch || "AllBatches",
      course || "AllCourses",
      department || "AllDepartments",
    ];
    const fileName = fileNameParts.join("_").replace(/\s+/g, "_");
    saveAs(blob, `${fileName}.xlsx`);
  };

  return (
    <div className="font-sans p-4 min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold mb-4 sm:mb-0">
            Student Registration{" "}
            <span className="text-custom-blue">Export</span>
          </h2>
        </div>

        <div className="bg-gray-50 p-5 rounded-lg mb-8 border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <FaFilter className="text-custom-blue mr-2" />
            <h3 className="text-xl font-semibold text-custom-blue">Filters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Batch
              </label>
              <select
                name="batch"
                value={filters.batch}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue appearance-none bg-white pl-4 pr-10 bg-no-repeat bg-right"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='6' fill='none' viewBox='0 0 12 6'%3E%3Cpath fill='%23204080' d='M0 0L6 6L12 0H0Z'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 0.75rem center",
                  backgroundSize: "12px 6px",
                }}
              >
                <option value="">Select Batch</option>
                {filterOptions.batches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Course
              </label>
              <select
                name="course"
                value={filters.course}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue appearance-none bg-white pl-4 pr-10 bg-no-repeat bg-right"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='6' fill='none' viewBox='0 0 12 6'%3E%3Cpath fill='%23204080' d='M0 0L6 6L12 0H0Z'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 0.75rem center",
                  backgroundSize: "12px 6px",
                }}
              >
                <option value="">Select Course</option>
                {filterOptions.courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Department
              </label>
              <select
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                disabled={!filters.course}
                className={`w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue appearance-none bg-white pl-4 pr-10 bg-no-repeat bg-right ${!filters.course ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='6' fill='none' viewBox='0 0 12 6'%3E%3Cpath fill='%23204080' d='M0 0L6 6L12 0H0Z'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 0.75rem center",
                  backgroundSize: "12px 6px",
                }}
              >
                <option value="">Select Department</option>
                {filterOptions.departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <button
              onClick={fetchAndExport}
              className="bg-custom-blue text-white px-6 py-2.5 rounded-lg hover:bg-custom-blue transition-all flex items-center gap-2 transform hover:-translate-y-0.5 hover:shadow-md"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" /> Processing
                </>
              ) : (
                "Apply Filters & Export"
              )}
            </button>
            <button
              onClick={resetFilters}
              className="bg-gray-400 text-white px-6 py-2.5 rounded-lg hover:bg-gray-500 transition-all transform hover:-translate-y-0.5 hover:shadow-md"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementRegistrationExportFaculty;
