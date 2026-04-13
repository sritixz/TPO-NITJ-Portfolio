import React, { useState, useEffect } from "react";
import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  TrendingUp,
  Users,
  DollarSign,
  Building,
  Award,
  Calendar,
  BarChart3,
  PieChart,
  IndianRupee,
  Briefcase,
} from "lucide-react";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);
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
      {
        value: "GEOTECHNICAL ENGINEERING AND INFRASTRUCTURE DESIGN",
        label: "GEOTECHNICAL ENGINEERING AND INFRASTRUCTURE DESIGN",
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
      // {
      //   value: "TEXTILE TECHNOLOGY",
      //   label: "TEXTILE TECHNOLOGY",
      // },
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
const InsightDashboard = () => {
  const [insights, setInsights] = useState(null);
  const [summerInternInsights, setSummerInternInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("B.Tech");
  const [selectedBatch, setSelectedBatch] = useState("2026");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const courses = ["B.Tech", "M.Tech", "MBA", "M.Sc."];
  const batches = ["2025", "2026", "2027", "2028", "2029", "2030"];
  const [companyFilter, setCompanyFilter] = useState("All");
  const companyFilters = ["All", "B.Tech", "M.Tech", "MBA", "M.Sc."];
  const [insightsType, setInsightsType] = useState("Placement");
  const isSummer = insightsType === "Summer Internships";

  const activeInsights = isSummer ? summerInternInsights : insights;
  const getDeptOptions = (course) => {
    let groups;
    if (course === "B.Tech") groups = btechdepartmentOptions;
    else if (course === "M.Tech") groups = mtechdepartmentOptions;
    else if (course === "MBA") groups = mbadepartmentOptions;
    else if (course === "M.Sc.") groups = mscdepartmentOptions;
    else return [];
    return groups.flatMap((g) => g.options.map((o) => o.label));
  };
  // const handleDownloadExcel = async () => {
  //   if (!activeInsights) return;
  //   const wb = new ExcelJS.Workbook();
  //   const ws = wb.addWorksheet(`${selectedCourse}_${selectedBatch}`);
  //   // Set title
  //   ws.mergeCells("A1", "E1");
  //   const titleCell = ws.getCell("A1");
  //   titleCell.value = `Placement Insights - ${selectedCourse} (${selectedBatch})`;
  //   titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
  //   titleCell.alignment = { vertical: "middle", horizontal: "center" };
  //   titleCell.fill = {
  //     type: "pattern",
  //     pattern: "solid",
  //     fgColor: { argb: "4F46E5" },
  //   };
  //   ws.addRow([]);
  //   ws.addRow(["Key Statistics"]);
  //   ws.getRow(3).font = { bold: true, color: { argb: "FFFFFFFF" } };
  //   ws.getRow(3).fill = {
  //     type: "pattern",
  //     pattern: "solid",
  //     fgColor: { argb: "6366F1" },
  //   };
  //   const stats = [
  //     ["Total Placements", !isSummer && activeInsights.totalPlacements || 0],
  //     ["Unique Students Placed", !isSummer && activeInsights.uniquePlacements || 0],
  //     ["Double Offers", !isSummer && activeInsights.doublePlacements || 0],
  //     ["Average CTC (₹LPA)", !isSummer && activeInsights.avgCTC || "N/A"],
  //     ["Highest CTC (₹LPA)", !isSummer && activeInsights.highestCTC || "N/A"],
  //     ["Lowest CTC (₹LPA)", !isSummer && activeInsights.lowestCTC || "N/A"],
  //   ];
  //   ws.addRows(stats);
  //   ws.addRow([]);
  //   ws.addRow(["Department-wise Placements"]);
  //   ws.getRow(ws.lastRow.number).font = {
  //     bold: true,
  //     color: { argb: "FFFFFFFF" },
  //   };
  //   ws.getRow(ws.lastRow.number).fill = {
  //     type: "pattern",
  //     pattern: "solid",
  //     fgColor: { argb: "2563EB" },
  //   };
  //   const deptData = Object.entries(activeInsights.placementsByDepartment || {});
  //   ws.addRow(["Department", "Total Placements"]);
  //   deptData.forEach(([dept, count]) => ws.addRow([dept, count]));
  //   ws.addRow([]);
  //   ws.addRow(["CTC Buckets"]);
  //   ws.getRow(ws.lastRow.number).font = {
  //     bold: true,
  //     color: { argb: "FFFFFFFF" },
  //   };
  //   ws.getRow(ws.lastRow.number).fill = {
  //     type: "pattern",
  //     pattern: "solid",
  //     fgColor: { argb: "059669" },
  //   };
  //   const ctcData = Object.entries(activeInsights.ctcBuckets || {});
  //   ws.addRow(["Range", "Count"]);
  //   ctcData.forEach(([range, count]) => ws.addRow([range, count]));
  //   ws.addRow([]);
  //   ws.addRow(["Top Companies"]);
  //   ws.getRow(ws.lastRow.number).font = {
  //     bold: true,
  //     color: { argb: "FFFFFFFF" },
  //   };
  //   ws.getRow(ws.lastRow.number).fill = {
  //     type: "pattern",
  //     pattern: "solid",
  //     fgColor: { argb: "9333EA" },
  //   };
  //   const topCompanies = activeInsights.topCompanies || [];
  //   ws.addRow(["Company", "Offers"]);
  //   topCompanies.forEach((c) => ws.addRow([c.company, c.count]));
  //   // Auto column width
  //   ws.columns.forEach((col) => {
  //     let maxLength = 0;
  //     col.eachCell({ includeEmpty: true }, (cell) => {
  //       const val = cell.value ? cell.value.toString() : "";
  //       maxLength = Math.max(maxLength, val.length);
  //     });
  //     col.width = maxLength < 15 ? 15 : maxLength + 2;
  //   });
  //   // Border style
  //   ws.eachRow({ includeEmpty: false }, (row) => {
  //     row.eachCell((cell) => {
  //       cell.border = {
  //         top: { style: "thin", color: { argb: "D1D5DB" } },
  //         left: { style: "thin", color: { argb: "D1D5DB" } },
  //         bottom: { style: "thin", color: { argb: "D1D5DB" } },
  //         right: { style: "thin", color: { argb: "D1D5DB" } },
  //       };
  //     });
  //   });
  //   const buffer = await wb.xlsx.writeBuffer();
  //   saveAs(
  //     new Blob([buffer], { type: "application/octet-stream" }),
  //     `${selectedCourse}_${selectedBatch}_Insights.xlsx`,
  //   );
  // };
  useEffect(() => {
    setSelectedDepartment("");
  }, [selectedCourse]);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true); // also important

      try {
        const params = { course: selectedCourse, batch: selectedBatch };

        if (companyFilter !== "All") {
          params.companyFilter = companyFilter;
        }

        if (!isSummer) {
          const resPlacement = await axios.get(
            `${import.meta.env.REACT_APP_BASE_URL}/insight/stats/`,
            { params, withCredentials: true },
          );
          setInsights(resPlacement.data);
        } else {
          const resSummerIntern = await axios.get(
            `${import.meta.env.REACT_APP_BASE_URL}/insight/summerInternstats/`,
            { params, withCredentials: true },
          );
          setSummerInternInsights(resSummerIntern.data);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setInsights({ noData: true });
          setSummerInternInsights({ noData: true });
        } else {
          console.error(error);
          setInsights(null);
          setSummerInternInsights(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [selectedCourse, selectedBatch, companyFilter, insightsType]); // ✅ ADD THIS
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">
            Loading insights...
          </p>
        </div>
      </div>
    );
  }
  if (!activeInsights) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-red-400 mb-4">
              <BarChart3 size={64} className="mx-auto" />
            </div>
            <p className="text-xl text-gray-600 mb-2">
              Failed to load insights
            </p>
            <p className="text-sm text-gray-500">
              Please try refreshing the page
            </p>
          </div>
        </div>
      </div>
    );
  }
  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color = "indigo",
  }) => (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`bg-${color}-100 rounded-lg p-3`}>
          <Icon className={`text-${color}-600`} size={24} />
        </div>
      </div>
    </div>
  );
  const ChartCard = ({ title, children, icon: Icon }) => (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
      <div className="flex items-center mb-6">
        <Icon className="text-indigo-600 mr-3" size={20} />
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="h-80">{children}</div>
    </div>
  );
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        cornerRadius: 8,
      },
    },
  };
  const lineChartData = !isSummer
    ? {
        labels:
          activeInsights.offersVsDate?.map((item) => {
            const date = new Date(item.date);
            return date.toLocaleDateString("en-US", {
              month: "short",
              year: "2-digit",
            }); // axis label
          }) || [],
        datasets: [
          {
            label: "Offers Over Time",
            data: activeInsights.offersVsDate?.map((item) => item.count) || [],
            borderColor: "rgb(99, 102, 241)",
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "rgb(99, 102, 241)",
            pointBorderColor: "white",
            pointBorderWidth: 2,
            pointRadius: 6,
          },
        ],
      }
    : null;
  const chartOptionsdatewise = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index",
      intersect: false,
    },

    plugins: {
      datalabels: {
        display: false,
      },
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },

      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        titleColor: "white",
        bodyColor: "white",
        cornerRadius: 10,
        padding: 12,
        displayColors: false,

        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            const rawDate = activeInsights.offersVsDate[index].date;
            if (!rawDate) return "";
            return new Date(rawDate).toLocaleDateString("en-US", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            });
          },

          label: (context) => {
            return `Offers: ${context.raw}`;
          },
        },
      },
    },

    elements: {
      point: {
        radius: 0,
        hoverRadius: 5,
        hitRadius: 10,
      },
      line: {
        tension: 0.4,
        borderWidth: 2,
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 6,
          maxRotation: 0,
        },
      },

      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255,255,255,0.05)",
        },
        ticks: {
          precision: 0,
        },
      },
    },
  };

  const barColors = [
  "rgba(99, 102, 241, 0.8)",
  "rgba(34, 197, 94, 0.8)",
  "rgba(245, 158, 11, 0.8)",
  "rgba(239, 68, 68, 0.8)",
  "rgba(168, 85, 247, 0.8)",
  "rgba(14, 165, 233, 0.8)",
];
  const departmentBarData = {
  labels: Object.keys(activeInsights.departmentStats || {}),
  datasets: [
    {
      label: isSummer ? "Intern Offers" : "Placement %",
      data: Object.values(activeInsights.departmentStats || {}).map((e) =>
        isSummer ? e?.totalOffers || 0 : e?.placementPercentage || 0
      ),
      backgroundColor: Object.keys(activeInsights.departmentStats || {}).map(
        (_, i) => barColors[i % barColors.length]
      ),
      borderRadius: 8,
    },
  ],
};
  const ctcDoughnutData = !isSummer
    ? {
        labels: Object.keys(activeInsights.ctcBuckets || {}),
        datasets: [
          {
            data: Object.values(activeInsights.ctcBuckets || {}),
            backgroundColor: [
              "rgba(99, 102, 241, 0.8)", // indigo
              "rgba(34, 197, 94, 0.8)", // green
              "rgba(245, 158, 11, 0.8)", // amber
              "rgba(239, 68, 68, 0.8)", // red
              "rgba(168, 85, 247, 0.8)", // purple
              "rgba(14, 165, 233, 0.8)", // sky
            ],
            borderWidth: 0,
          },
        ],
      }
    : null;
  const genderPieData =
    !isSummer && activeInsights.genderDist
      ? {
          labels: Object.keys(activeInsights.genderDist || {}).map(
            (g) =>
              `${g} (${activeInsights.genderUnique?.[g] || 0}/${activeInsights.genderDist?.[g] || 0})`,
          ),
          datasets: [
            {
              data: Object.values(activeInsights.genderDist || {}),
              backgroundColor: [
                "rgba(59, 130, 246, 0.8)",
                "rgba(236, 72, 153, 0.8)",
                "rgba(34, 197, 94, 0.8)",
              ],
              borderWidth: 0,
            },
          ],
        }
      : null;
  const topCompaniesBarData = {
    labels:
      (!isSummer && activeInsights.topCompanies?.map((item) => item.company)) ||
      [],
    datasets: [
      {
        label: "Offers",
        data:
          (!isSummer &&
            activeInsights.topCompanies?.map((item) => item.count)) ||
          [],
        backgroundColor: "rgba(168, 85, 247, 0.8)",
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };
  const topCompaniesByCTCBarData = {
    labels:
      (!isSummer &&
        activeInsights.topCompaniesByCTC?.map((item) => item.company)) ||
      [],
    datasets: [
      {
        label: "CTC",
        data:
          (!isSummer &&
            activeInsights.topCompaniesByCTC?.map((item) => item.maxCTC)) ||
          [],
        backgroundColor: "rgba(168, 85, 247, 0.8)",
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };
  const deptOptions = getDeptOptions(selectedCourse);
  const isDeptView = !!selectedDepartment;
  let content;
  if (activeInsights?.noData) {
    content = (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-yellow-400 mb-4">
              <BarChart3 size={64} className="mx-auto" />
            </div>
            <p className="text-xl text-gray-600 mb-2">No data available</p>
            <p className="text-sm text-gray-500">
              Please select a different filter
            </p>
          </div>
        </div>
      </div>
    );
  } else if (isDeptView) {
    // NEW: departmentStats is an object keyed by department name
    const deptData = activeInsights.departmentStats?.[selectedDepartment];
    if (!deptData) {
      content = (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-yellow-400 mb-4">
                <BarChart3 size={64} className="mx-auto" />
              </div>
              <p className="text-xl text-gray-600 mb-2">Data not available</p>
              <p className="text-sm text-gray-500">
                for the selected department
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      const ctcColors = [
        "rgba(239, 68, 68, 0.8)",
        "rgba(245, 158, 11, 0.8)",
        "rgba(34, 197, 94, 0.8)",
        "rgba(99, 102, 241, 0.8)",
        "rgba(168, 85, 247, 0.8)",
        "rgba(236, 72, 153, 0.8)",
      ];
      const genderColor = [
        "rgba(8, 54, 129, 0.8)",
        "rgba(188, 4, 96, 0.8)",
        "rgba(34, 197, 94, 0.8)",
      ];
      const distColors = [
        "rgba(59, 130, 246, 0.8)",
        "rgba(236, 72, 153, 0.8)",
        "rgba(34, 197, 94, 0.8)",
        "rgba(99, 102, 241, 0.8)",
      ];
      content = (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Department Insights :{" "}
              <span className="text-custom-blue">{selectedDepartment}</span>
            </h2>
          </div>
          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Users}
              title={isSummer ? "Intern Offers" : "Total Offers"}
              value={deptData.totalOffers || 0}
              color="indigo"
            />

            <StatCard
              icon={Users}
              title="Double Offers"
              value={
                isSummer
                  ? deptData.doubleOffers || 0
                  : deptData.multipleOffers || 0
              }
              color="red"
            />

            <StatCard
              icon={Users}
              title="Students"
              value={deptData.uniqueStudents || 0}
              color="blue"
            />
            {!isSummer && (
              <>
                <StatCard
                  icon={Users}
                  title="Eligible Students"
                  value={deptData.eligibleStudents || 0}
                  color="indigo"
                />
                <StatCard
                  icon={IndianRupee}
                  title="Average CTC"
                  value={deptData.avgCTC ? `₹${deptData.avgCTC}L` : "N/A"}
                  subtitle="Per annum"
                  color="green"
                />
                <StatCard
                  icon={IndianRupee}
                  title="Highest CTC"
                  value={
                    deptData.highestCTC
                      ? deptData.highestCTC > 100
                        ? `₹${(deptData.highestCTC / 100).toFixed(2)} Cr`
                        : `₹${deptData.highestCTC} L`
                      : 0
                  }
                  subtitle="Per annum"
                  color="blue"
                />
                <StatCard
                  icon={IndianRupee}
                  title="Lowest CTC"
                  value={deptData.lowestCTC ? `₹${deptData.lowestCTC}L` : "N/A"}
                  subtitle="Per annum"
                  color="red"
                />
                <StatCard
                  icon={TrendingUp}
                  title="Placement %"
                  value={`${deptData.placementPercentage || 0}%`}
                  color="purple"
                />
              </>
            )}
          </div>
          {/* Charts Grid */}
          {!isSummer && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <ChartCard title="CTC Distribution" icon={IndianRupee}>
                <Doughnut
                  data={{
                    labels: Object.keys(deptData.ctcBuckets || {}),
                    datasets: [
                      {
                        data: Object.values(deptData.ctcBuckets || {}),
                        backgroundColor: ctcColors,
                        borderWidth: 0,
                        cutout: "60%",
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              </ChartCard>
              <ChartCard title="Gender Distribution" icon={IndianRupee}>
                <Doughnut
                  data={{
                    labels: Object.keys(deptData.genderDist || {}).map(
                      (g) =>
                        `${g} (${deptData.genderUnique?.[g] || 0}/${deptData.genderDist?.[g] || 0})`,
                    ),
                    datasets: [
                      {
                        data: Object.values(deptData.genderDist || {}),
                        backgroundColor: genderColor,
                        borderWidth: 0,
                        cutout: "60%",
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              </ChartCard>
            </div>
          )}
          {!isSummer && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <ChartCard
                title="Top 5 Companies (Offer Count Wise)"
                icon={Building}
              >
                <Bar
                  data={{
                    labels:
                      deptData.topCompaniesByCount?.map(
                        (item) => item.company,
                      ) || [],
                    datasets: [
                      {
                        label: "Offers",
                        data:
                          deptData.topCompaniesByCount?.map(
                            (item) => item.count,
                          ) || [],
                        backgroundColor: "rgba(168, 85, 247, 0.8)",
                        borderRadius: 8,
                        borderSkipped: false,
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              </ChartCard>
              <ChartCard
                title="Top 5 Companies (Highest CTC Wise)"
                icon={Award}
              >
                <Bar
                  data={{
                    labels:
                      deptData.topCompaniesByAvgCTC?.map(
                        (item) => item.company,
                      ) || [],
                    datasets: [
                      {
                        label: "CTC (₹LPA)",
                        data:
                          deptData.topCompaniesByAvgCTC?.map(
                            (item) => item.avgCTC,
                          ) || [],
                        backgroundColor: "rgba(34, 197, 94, 0.8)",
                        borderRadius: 8,
                        borderSkipped: false,
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              </ChartCard>
            </div>
          )}
          {/* Distribution Lists */}
          {!isSummer && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Job Type Distribution
                </h4>
                <div className="space-y-2">
                  {Object.entries(deptData.jobTypeDist || {}).map(
                    ([jobType, count]) => (
                      <div
                        key={jobType}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-600">{jobType}</span>
                        <span className="font-semibold text-green-600">
                          {count}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Category Distribution
                </h4>
                <div className="space-y-2">
                  {Object.entries(deptData.categoryDist || {}).map(
                    ([category, count]) => (
                      <div
                        key={category}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-600">{category}</span>
                        <span className="font-semibold text-indigo-600">
                          {count}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Industry Sector Distribution
                </h4>
                <div className="space-y-2">
                  {Object.entries(deptData.industryDist || {}).map(
                    ([sector, count]) => (
                      <div
                        key={sector}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-600">{sector}</span>
                        <span className="font-semibold text-green-600">
                          {count}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
  } else {
    content = (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isSummer ? (
            <>
              <StatCard
                icon={Users}
                title="Total Intern Offers"
                value={activeInsights.totalOffers || 0}
                color="indigo"
              />
              <StatCard
                icon={Users}
                title="Double Offers"
                value={activeInsights.doubleOffers || 0}
                color="red"
              />
              <StatCard
                icon={Users}
                title="Students Selected"
                value={activeInsights.uniqueStudents || 0}
                color="blue"
              />
            </>
          ) : (
            <>
              <StatCard
                icon={Users}
                title="Total Offers"
                value={activeInsights.totalPlacements || 0}
                subtitle={
                  selectedCourse === "ALL" ? "All courses" : selectedCourse
                }
                color="indigo"
              />
              <StatCard
                icon={Users}
                title="Double Offers"
                value={activeInsights.doublePlacements || 0}
                subtitle={
                  selectedCourse === "ALL" ? "All courses" : selectedCourse
                }
                color="red"
              />
              <StatCard
                icon={Users}
                title="Student Placed"
                value={activeInsights.uniquePlacements || 0}
                subtitle={
                  selectedCourse === "ALL" ? "All courses" : selectedCourse
                }
                color="indigo"
              />
              <StatCard
                icon={Users}
                title="Eligible Students"
                value={activeInsights.totalEligibleStudents || 0}
                subtitle="Total"
                color="red"
              />
              <StatCard
                icon={IndianRupee}
                title="Average CTC"
                value={
                  activeInsights.avgCTC ? `₹${activeInsights.avgCTC}L` : "N/A"
                }
                subtitle="Per annum"
                color="green"
              />
              <StatCard
                icon={IndianRupee}
                title="Median CTC"
                value={
                  activeInsights.medianCTC ? `₹${activeInsights.medianCTC}L` : "N/A"
                }
                subtitle="Per annum"
                color="green"
              />
              <StatCard
                icon={IndianRupee}
                title="Highest CTC"
                value={
                  activeInsights.highestCTC
                    ? activeInsights.highestCTC > 100
                      ? `₹${(activeInsights.highestCTC / 100).toFixed(2)} Cr`
                      : `₹${activeInsights.highestCTC} L`
                    : 0
                }
                subtitle="Per annum"
                color="blue"
              />
              <StatCard
                icon={IndianRupee}
                title="Lowest CTC"
                value={
                  activeInsights.lowestCTC ? `₹${activeInsights.lowestCTC}L` : 0
                }
                subtitle="Per annum"
                color="yellow"
              />
              <StatCard
                icon={TrendingUp}
                title="Placement %"
                value={`${activeInsights.overallPlacementPercentage || 0}%`}
                subtitle={selectedCourse}
                color="purple"
              />
            </>
          )}
        </div>

        {!isSummer && (
          <>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {companyFilters.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-5">
              <StatCard
                icon={TrendingUp}
                title="Total Companies Visited"
                value={`${activeInsights.totalCompanies || 0}`}
                subtitle={companyFilter}
                color="purple"
              />
              <StatCard
                icon={TrendingUp}
                title="On Campus Companies Visited"
                value={`${activeInsights.onCampusCompanies || 0}`}
                subtitle={companyFilter}
                color="purple"
              />
              <StatCard
                icon={TrendingUp}
                title="Off Campus Companies"
                value={`${activeInsights.offCampusCompanies || 0}`}
                subtitle={companyFilter}
                color="purple"
              />
              <StatCard
                icon={TrendingUp}
                title="Summer Intern Companies"
                value={`${activeInsights.summerTotalCompanies || 0}`}
                subtitle={companyFilter}
                color="purple"
              />
              <StatCard
                icon={TrendingUp}
                title="Pending Companies (On-Campus)"
                value={`${activeInsights.pendingCompanies || 0}`}
                subtitle={companyFilter}
                color="purple"
              />
            </div>
          </>
        )}
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {!isSummer && (
            <ChartCard title="Placement Timeline" icon={Calendar}>
              <Line data={lineChartData} options={chartOptionsdatewise} />
            </ChartCard>
          )}
          <ChartCard
            title={
              isSummer
                ? "Department-wise Intern Offers"
                : selectedCourse === "ALL"
                  ? "Course-wise Placements"
                  : "Department-wise Placements"
            }
            icon={BarChart3}
          >
            <Bar data={departmentBarData} options={chartOptions} />
          </ChartCard>
        </div>
        {!isSummer && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <ChartCard title="CTC Distribution" icon={PieChart}>
              <Doughnut data={ctcDoughnutData} options={chartOptions} />
            </ChartCard>
            <ChartCard title="Gender Distribution" icon={Users}>
              <Pie data={genderPieData} options={chartOptions} />
            </ChartCard>
            {/* <ChartCard title="Top Companies (Offer Count Wise)" icon={Building}>
            <Bar data={topCompaniesBarData} options={chartOptions} />
          </ChartCard>
          <ChartCard title="Top Companies (CTC Wise)" icon={Building}>
            <Bar data={topCompaniesByCTCBarData} options={chartOptions} />
          </ChartCard> */}
          </div>
        )}
        {/* Additional Insights */}
        {!isSummer && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-3">
                Job Type Distribution
              </h4>
              <div className="space-y-2">
                {Object.entries(activeInsights.jobTypeDist || {}).map(
                  ([type, count]) => (
                    <div
                      key={type}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-600">{type}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span className="font-semibold text-indigo-600">
                          {count}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-3">
                Category Distribution
              </h4>
              <div className="space-y-2">
                {Object.entries(activeInsights.categoryDist || {}).map(
                  ([category, count]) => (
                    <div
                      key={category}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-600">{category}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-semibold text-green-600">
                          {count}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-3">
                Industry Sectors
              </h4>
              <div className="space-y-2">
                {Object.entries(activeInsights.sectorDist || {}).map(
                  ([sector, count]) => (
                    <div
                      key={sector}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-600">{sector}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="font-semibold text-orange-600">
                          {count}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {!isSummer && (
                  <>
                    Placement{" "}
                    <span className="text-custom-blue">Analytics</span>
                  </>
                )}
                {isSummer && (
                  <>
                    Summer Intern{" "}
                    <span className="text-custom-blue">Analytics</span>
                  </>
                )}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Comprehensive placement insights across all programs
              </p>
            </div>

            {/* Combine both dropdowns in one flex */}
            <div className="flex flex-col sm:flex-row items-center sm:space-x-4 gap-2">
              <select
                value={insightsType}
                onChange={(e) => setInsightsType(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
              >
                {["Placement", "Summer Internships"].map((typeOption) => (
                  <option key={typeOption} value={typeOption}>
                    {typeOption}
                  </option>
                ))}
              </select>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
              >
                {batches.map((batchOption) => (
                  <option key={batchOption} value={batchOption}>
                    {batchOption}
                  </option>
                ))}
              </select>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
              >
                {courses.map((courseOption) => (
                  <option key={courseOption} value={courseOption}>
                    {courseOption}
                  </option>
                ))}
              </select>
              {deptOptions.length > 0 && (
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
                >
                  <option value="">All Departments</option>
                  {deptOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              )}
              {/* <div className="flex justify-end">
  <button
    onClick={handleDownloadExcel}
    className="bg-custom-blue text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-all"
  >
    Download Excel
  </button>
</div> */}
            </div>
          </div>
        </div>
      </div>
      {content}
    </div>
  );
};
export default InsightDashboard;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import ExcelJS from "exceljs";
// import { saveAs } from "file-saver";
// import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';
// import { TrendingUp, Users, DollarSign, Building, Award, Calendar, BarChart3, PieChart, IndianRupee, Briefcase } from 'lucide-react';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend
// );

// const btechdepartmentOptions = [
//   {
//     label: "BIO TECHNOLOGY",
//     options: [{ value: "BIO TECHNOLOGY", label: "BIO TECHNOLOGY" }],
//   },
//   {
//     label: "CHEMICAL ENGINEERING",
//     options: [{ value: "CHEMICAL ENGINEERING", label: "CHEMICAL ENGINEERING" }],
//   },
//   {
//     label: "CIVIL ENGINEERING",
//     options: [{ value: "CIVIL ENGINEERING", label: "CIVIL ENGINEERING" }],
//   },
//   {
//     label: "COMPUTER SCIENCE AND ENGINEERING",
//     options: [
//       {
//         value: "COMPUTER SCIENCE AND ENGINEERING",
//         label: "COMPUTER SCIENCE AND ENGINEERING",
//       },
//       {
//         value: "DATA SCIENCE AND ENGINEERING",
//         label: "DATA SCIENCE AND ENGINEERING",
//       },
//     ],
//   },
//   {
//     label: "ELECTRICAL ENGINEERING",
//     options: [
//       { value: "ELECTRICAL ENGINEERING", label: "ELECTRICAL ENGINEERING" },
//     ],
//   },
//   {
//     label: "ELECTRONICS AND COMMUNICATION ENGINEERING",
//     options: [
//       {
//         value: "ELECTRONICS AND COMMUNICATION ENGINEERING",
//         label: "ELECTRONICS AND COMMUNICATION ENGINEERING",
//       },
//       {
//         value: "ELECTRONICS AND VLSI ENGINEERING",
//         label: "ELECTRONICS AND VLSI ENGINEERING",
//       },
//     ],
//   },
//   {
//     label: "INDUSTRIAL AND PRODUCTION ENGINEERING",
//     options: [
//       {
//         value: "INDUSTRIAL AND PRODUCTION ENGINEERING",
//         label: "INDUSTRIAL AND PRODUCTION ENGINEERING",
//       },
//     ],
//   },
//   {
//     label: "INFORMATION TECHNOLOGY",
//     options: [
//       { value: "INFORMATION TECHNOLOGY", label: "INFORMATION TECHNOLOGY" },
//     ],
//   },
//   {
//     label: "INSTRUMENTATION AND CONTROL ENGINEERING",
//     options: [
//       {
//         value: "INSTRUMENTATION AND CONTROL ENGINEERING",
//         label: "INSTRUMENTATION AND CONTROL ENGINEERING",
//       },
//     ],
//   },
//   {
//     label: "MATHEMATICS AND COMPUTING",
//     options: [
//       {
//         value: "MATHEMATICS AND COMPUTING",
//         label: "MATHEMATICS AND COMPUTING",
//       },
//     ],
//   },
//   {
//     label: "MECHANICAL ENGINEERING",
//     options: [
//       { value: "MECHANICAL ENGINEERING", label: "MECHANICAL ENGINEERING" },
//     ],
//   },
//   {
//     label: "TEXTILE TECHNOLOGY",
//     options: [{ value: "TEXTILE TECHNOLOGY", label: "TEXTILE TECHNOLOGY" }],
//   },
// ];

// const mtechdepartmentOptions = [
//   {
//     label: "BIO TECHNOLOGY",
//     options: [{ value: "BIO TECHNOLOGY", label: "BIO TECHNOLOGY" }],
//   },
//   {
//     label: "CHEMICAL ENGINEERING",
//     options: [{ value: "CHEMICAL ENGINEERING", label: "CHEMICAL ENGINEERING" }],
//   },
//   {
//     label: "CIVIL ENGINEERING",
//     options: [
//       {
//         value: "STRUCTURAL AND CONSTRUCTION ENGINEERING",
//         label: "STRUCTURAL AND CONSTRUCTION ENGINEERING",
//       },
//       {
//         value: "GEOTECHNICAL AND GEO-ENVIRONMENTAL ENGINEERING",
//         label: "GEOTECHNICAL AND GEO-ENVIRONMENTAL ENGINEERING",
//       },
//     ],
//   },
//   {
//     label: "COMPUTER SCIENCE AND ENGINEERING",
//     options: [
//       {
//         value: "COMPUTER SCIENCE AND ENGINEERING",
//         label: "COMPUTER SCIENCE AND ENGINEERING",
//       },
//       { value: "COMPUTER SCIENCE AND ENGINEERING (INFORMATION SECURITY)", label: "COMPUTER SCIENCE AND ENGINEERING (INFORMATION SECURITY)" },
//       {
//         value: "DATA SCIENCE AND ENGINEERING",
//         label: "DATA SCIENCE AND ENGINEERING",
//       },
//     ],
//   },
//   {
//     label: "ELECTRICAL ENGINEERING",
//     options: [
//       { value: "ELECTRIC VEHICLE DESIGN", label: "ELECTRIC VEHICLE DESIGN" },
//     ],
//   },
//   {
//     label: "ELECTRONICS AND COMMUNICATION ENGINEERING",
//     options: [
//       {
//         value: "SIGNAL PROCESSING AND MACHINE LEARNING",
//         label: "SIGNAL PROCESSING AND MACHINE LEARNING",
//       },
//       { value: "VLSI DESIGN", label: "VLSI DESIGN" },
//     ],
//   },
//   {
//     label: "INDUSTRIAL AND PRODUCTION ENGINEERING",
//     options: [
//       {
//         value: "INDUSTRIAL ENGINEERING AND DATA ANALYTICS",
//         label: "INDUSTRIAL ENGINEERING AND DATA ANALYTICS",
//       }
//     ],
//   },
//   {
//     label: "INFORMATION TECHNOLOGY",
//     options: [{ value: "DATA ANALYTICS", label: "DATA ANALYTICS" }],
//   },
//   {
//     label: "CONTROL AND INSTRUMENTATION ENGINEERING",
//     options: [
//       {
//         value: "CONTROL AND INSTRUMENTATION ENGINEERING",
//         label: "CONTROL AND INSTRUMENTATION ENGINEERING",
//       },
//       {
//         value: "MACHINE INTELLIGENCE AND AUTOMATION",
//         label: "MACHINE INTELLIGENCE AND AUTOMATION",
//       },
//     ],
//   },
//   {
//     label: "MATHEMATICS AND COMPUTING",
//     options: [
//       {
//         value: "MATHEMATICS AND COMPUTING",
//         label: "MATHEMATICS AND COMPUTING",
//       },
//     ],
//   },
//   {
//     label: "MECHANICAL ENGINEERING",
//     options: [
//       { value: "DESIGN ENGINEERING", label: "DESIGN ENGINEERING" },
//       {
//         value: "THERMAL AND ENERGY ENGINEERING",
//         label: "THERMAL AND ENERGY ENGINEERING",
//       },
//     ],
//   },
//   {
//     label: "TEXTILE TECHNOLOGY",
//     options: [
//       {
//         value: "TEXTILE TECHNOLOGY",
//         label: "TEXTILE TECHNOLOGY",
//       },
//       {
//         value: "TEXTILE ENGINEERING AND MANAGEMENT",
//         label: "TEXTILE ENGINEERING AND MANAGEMENT",
//       },
//     ],
//   },
//   {
//     label: "RENEWABLE ENERGY",
//     options: [{ value: "RENEWABLE ENERGY", label: "RENEWABLE ENERGY" }],
//   },
//   {
//     label: "ARTIFICIAL INTELLIGENCE",
//     options: [
//       { value: "ARTIFICIAL INTELLIGENCE", label: "ARTIFICIAL INTELLIGENCE" },
//     ],
//   },
//   {
//     label: "POWER SYSTEMS AND RELIABILITY",
//     options: [
//       {
//         value: "POWER SYSTEMS AND RELIABILITY",
//         label: "POWER SYSTEMS AND RELIABILITY",
//       },
//     ],
//   },
// ];

// const mbadepartmentOptions = [
//   {
//     label: "HUMANITIES AND MANAGEMENT",
//     options: [{ value: "HUMANITIES AND MANAGEMENT", label: "HUMANITIES AND MANAGEMENT" }],
//   },
// ];

// const mscdepartmentOptions = [
//   {
//     label: "CHEMISTRY",
//     options: [{ value: "CHEMISTRY", label: "CHEMISTRY" }],
//   },
//   {
//     label: "MATHEMATICS",
//     options: [{ value: "MATHEMATICS", label: "MATHEMATICS" }],
//   },
//   {
//     label: "PHYSICS",
//     options: [{ value: "PHYSICS", label: "PHYSICS" }],
//   },
// ];

// const InsightDashboard = () => {
//   const [insights, setInsights] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedCourse, setSelectedCourse] = useState('B.Tech');
//   const [selectedBatch, setSelectedBatch] = useState('2026');
//   const [selectedDepartment, setSelectedDepartment] = useState('');

//   const courses = ['B.Tech', 'M.Tech', 'MBA', 'M.Sc'];
//   const batches = ['2025', '2026', '2027', '2028', '2029', '2030'];

//   const getDeptOptions = (course) => {
//     let groups;
//     if (course === 'B.Tech') groups = btechdepartmentOptions;
//     else if (course === 'M.Tech') groups = mtechdepartmentOptions;
//     else if (course === 'MBA') groups = mbadepartmentOptions;
//     else if (course === 'M.Sc') groups = mscdepartmentOptions;
//     else return [];
//     return groups.flatMap(g => g.options.map(o => o.label));
//   };

//   const handleDownloadExcel = async () => {
//   if (!insights) return;

//   const wb = new ExcelJS.Workbook();
//   const ws = wb.addWorksheet(`${selectedCourse}_${selectedBatch}`);

//   // Set title
//   ws.mergeCells("A1", "E1");
//   const titleCell = ws.getCell("A1");
//   titleCell.value = `Placement Insights - ${selectedCourse} (${selectedBatch})`;
//   titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
//   titleCell.alignment = { vertical: "middle", horizontal: "center" };
//   titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "4F46E5" } };

//   ws.addRow([]);
//   ws.addRow(["Key Statistics"]);
//   ws.getRow(3).font = { bold: true, color: { argb: "FFFFFFFF" } };
//   ws.getRow(3).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "6366F1" } };

//   const stats = [
//     ["Total Placements", insights.totalPlacements || 0],
//     ["Unique Students Placed", insights.uniquePlacements || 0],
//     ["Double Offers", insights.doublePlacements || 0],
//     ["Average CTC (₹LPA)", insights.avgCTC || "N/A"],
//     ["Highest CTC (₹LPA)", insights.highestCTC || "N/A"],
//     ["Lowest CTC (₹LPA)", insights.lowestCTC || "N/A"],
//   ];

//   ws.addRows(stats);

//   ws.addRow([]);
//   ws.addRow(["Department-wise Placements"]);
//   ws.getRow(ws.lastRow.number).font = { bold: true, color: { argb: "FFFFFFFF" } };
//   ws.getRow(ws.lastRow.number).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "2563EB" } };

//   const deptData = Object.entries(insights.placementsByDepartment || {});
//   ws.addRow(["Department", "Total Placements"]);
//   deptData.forEach(([dept, count]) => ws.addRow([dept, count]));

//   ws.addRow([]);
//   ws.addRow(["CTC Buckets"]);
//   ws.getRow(ws.lastRow.number).font = { bold: true, color: { argb: "FFFFFFFF" } };
//   ws.getRow(ws.lastRow.number).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "059669" } };

//   const ctcData = Object.entries(insights.ctcBuckets || {});
//   ws.addRow(["Range", "Count"]);
//   ctcData.forEach(([range, count]) => ws.addRow([range, count]));

//   ws.addRow([]);
//   ws.addRow(["Top Companies"]);
//   ws.getRow(ws.lastRow.number).font = { bold: true, color: { argb: "FFFFFFFF" } };
//   ws.getRow(ws.lastRow.number).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "9333EA" } };

//   const topCompanies = insights.topCompanies || [];
//   ws.addRow(["Company", "Offers"]);
//   topCompanies.forEach((c) => ws.addRow([c.company, c.count]));

//   // Auto column width
//   ws.columns.forEach((col) => {
//     let maxLength = 0;
//     col.eachCell({ includeEmpty: true }, (cell) => {
//       const val = cell.value ? cell.value.toString() : "";
//       maxLength = Math.max(maxLength, val.length);
//     });
//     col.width = maxLength < 15 ? 15 : maxLength + 2;
//   });

//   // Border style
//   ws.eachRow({ includeEmpty: false }, (row) => {
//     row.eachCell((cell) => {
//       cell.border = {
//         top: { style: "thin", color: { argb: "D1D5DB" } },
//         left: { style: "thin", color: { argb: "D1D5DB" } },
//         bottom: { style: "thin", color: { argb: "D1D5DB" } },
//         right: { style: "thin", color: { argb: "D1D5DB" } },
//       };
//     });
//   });

//   const buffer = await wb.xlsx.writeBuffer();
//   saveAs(new Blob([buffer], { type: "application/octet-stream" }),
//     `${selectedCourse}_${selectedBatch}_Insights.xlsx`
//   );
// };

//   useEffect(() => {
//     setSelectedDepartment('');
//   }, [selectedCourse]);

//   useEffect(() => {
//     const fetchInsights = async () => {
//       try {
//         const params = { course: selectedCourse, batch: selectedBatch };
//         const res = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/insight/stats/`, {
//           params,
//           withCredentials: true
//         });
//         console.log(res.data);
//         setInsights(res.data);
//       } catch (error) {
//         if (error.response && error.response.status === 404) {
//           setInsights({ noData: true }); // ✅ special flag
//         } else {
//           console.error('Error fetching insights:', error);
//           setInsights(null); // real error
//         }
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchInsights();
//   }, [selectedCourse, selectedBatch]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
//           <p className="text-xl text-gray-600 font-medium">Loading insights...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!insights) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="bg-white rounded-lg shadow-lg p-8">
//             <div className="text-red-400 mb-4">
//               <BarChart3 size={64} className="mx-auto" />
//             </div>
//             <p className="text-xl text-gray-600 mb-2">Failed to load insights</p>
//             <p className="text-sm text-gray-500">Please try refreshing the page</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const StatCard = ({ icon: Icon, title, value, subtitle, color = "indigo" }) => (
//     <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
//           <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
//           {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
//         </div>
//         <div className={`bg-${color}-100 rounded-lg p-3`}>
//           <Icon className={`text-${color}-600`} size={24} />
//         </div>
//       </div>
//     </div>
//   );

//   const ChartCard = ({ title, children, icon: Icon }) => (
//     <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
//       <div className="flex items-center mb-6">
//         <Icon className="text-indigo-600 mr-3" size={20} />
//         <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
//       </div>
//       <div className="h-80">
//         {children}
//       </div>
//     </div>
//   );

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: 'bottom',
//         labels: {
//           usePointStyle: true,
//           padding: 20,
//         },
//       },
//       tooltip: {
//         backgroundColor: 'rgba(0, 0, 0, 0.8)',
//         titleColor: 'white',
//         bodyColor: 'white',
//         cornerRadius: 8,
//       },
//     },
//   };

//   const lineChartData = {
//     labels: insights.offersVsDate?.map(item => {
//       const date = new Date(item.date);
//       return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }); // axis label
//     }) || [],
//     datasets: [{
//       label: 'Offers Over Time',
//       data: insights.offersVsDate?.map(item => item.count) || [],
//       borderColor: 'rgb(99, 102, 241)',
//       backgroundColor: 'rgba(99, 102, 241, 0.1)',
//       fill: true,
//       tension: 0.4,
//       pointBackgroundColor: 'rgb(99, 102, 241)',
//       pointBorderColor: 'white',
//       pointBorderWidth: 2,
//       pointRadius: 6,
//     }],
//   };

//   const chartOptionsdatewise = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: 'bottom',
//         labels: {
//           usePointStyle: true,
//           padding: 20,
//         },
//       },
//       tooltip: {
//         backgroundColor: 'rgba(0, 0, 0, 0.8)',
//         titleColor: 'white',
//         bodyColor: 'white',
//         cornerRadius: 8,
//         callbacks: {
//           title: (tooltipItems) => {
//             const index = tooltipItems[0].dataIndex;
//             const rawDate = insights.offersVsDate[index].date; // original date
//             const fullDate = new Date(rawDate).toLocaleDateString('en-US', {
//               weekday: 'short',
//               day: 'numeric',
//               month: 'short',
//               year: 'numeric'
//             });
//             return fullDate; // show full date in tooltip
//           },
//         },
//       },
//     },
//   };

//   const departmentBarData = {
//     labels: Object.keys(insights.placementsByDepartment || {}),
//     datasets: [{
//       label: 'Placements',
//       data: Object.values(insights.placementsByDepartment || {}),
//       backgroundColor: [
//         'rgba(99, 102, 241, 0.8)',
//         'rgba(34, 197, 94, 0.8)',
//         'rgba(239, 68, 68, 0.8)',
//         'rgba(245, 158, 11, 0.8)',
//         'rgba(168, 85, 247, 0.8)',
//         'rgba(236, 72, 153, 0.8)',
//       ],
//       borderRadius: 8,
//       borderSkipped: false,
//     }],
//   };

//   const ctcDoughnutData = {
//     labels: Object.keys(insights.ctcBuckets || {}),
//     datasets: [{
//       data: Object.values(insights.ctcBuckets || {}),
//       backgroundColor: [
//         'rgba(239, 68, 68, 0.8)',
//         'rgba(245, 158, 11, 0.8)',
//         'rgba(34, 197, 94, 0.8)',
//         'rgba(99, 102, 241, 0.8)',
//         'rgba(168, 85, 247, 0.8)',
//       ],
//       borderWidth: 0,
//       cutout: '60%',
//     }],
//   };

//   const genderPieData = {
//     labels: Object.keys(insights.genderDist || {}).map(
//         (g) =>
//           `${g} (${insights.genderUnique?.[g] || 0}/${insights.genderDist?.[g] || 0})`
//       ),
//     datasets: [{
//       data: Object.values(insights.genderDist || {}),
//       backgroundColor: [
//         'rgba(59, 130, 246, 0.8)',
//         'rgba(236, 72, 153, 0.8)',
//         'rgba(34, 197, 94, 0.8)',
//       ],
//       borderWidth: 0,
//     }],
//   };

//   const topCompaniesBarData = {
//     labels: insights.topCompanies?.map(item => item.company) || [],
//     datasets: [{
//       label: 'Offers',
//       data: insights.topCompanies?.map(item => item.count) || [],
//       backgroundColor: 'rgba(168, 85, 247, 0.8)',
//       borderRadius: 8,
//       borderSkipped: false,
//     }],
//   };
//   const topCompaniesByCTCBarData = {
//     labels: insights.topCompaniesByCTC?.map(item => item.company) || [],
//     datasets: [{
//       label: 'CTC',
//       data: insights.topCompaniesByCTC?.map(item => item.maxCTC) || [],
//       backgroundColor: 'rgba(168, 85, 247, 0.8)',
//       borderRadius: 8,
//       borderSkipped: false,
//     }],
//   };

//   const deptOptions = getDeptOptions(selectedCourse);

//   const isDeptView = !!selectedDepartment;
//   let content;

//   if (insights?.noData) {
//     content = (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="bg-white rounded-lg shadow-lg p-8">
//             <div className="text-yellow-400 mb-4">
//               <BarChart3 size={64} className="mx-auto" />
//             </div>
//             <p className="text-xl text-gray-600 mb-2">No data available</p>
//             <p className="text-sm text-gray-500">Please select a different filter</p>
//           </div>
//         </div>
//       </div>
//     );
//   } else if (isDeptView) {
// // NEW: departmentStats is an object keyed by department name
// const deptData = insights.departmentStats?.[selectedDepartment];

//     if (!deptData) {
//       content = (
//         <div className="min-h-screen bg-white flex items-center justify-center">
//           <div className="text-center">
//             <div className="bg-white rounded-lg shadow-lg p-8">
//               <div className="text-yellow-400 mb-4">
//                 <BarChart3 size={64} className="mx-auto" />
//               </div>
//               <p className="text-xl text-gray-600 mb-2">Data not available</p>
//               <p className="text-sm text-gray-500">for the selected department</p>
//             </div>
//           </div>
//         </div>
//       );
//     } else {
//       const ctcColors = [
//         'rgba(239, 68, 68, 0.8)',
//         'rgba(245, 158, 11, 0.8)',
//         'rgba(34, 197, 94, 0.8)',
//         'rgba(99, 102, 241, 0.8)',
//         'rgba(168, 85, 247, 0.8)',
//         'rgba(236, 72, 153, 0.8)',
//       ];
//       const genderColor=[
//         'rgba(8, 54, 129, 0.8)',
//         'rgba(188, 4, 96, 0.8)',
//         'rgba(34, 197, 94, 0.8)',
//       ]
//       const distColors = [
//         'rgba(59, 130, 246, 0.8)',
//         'rgba(236, 72, 153, 0.8)',
//         'rgba(34, 197, 94, 0.8)',
//         'rgba(99, 102, 241, 0.8)',
//       ];

//       content = (
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="mb-8">
//             <h2 className="text-2xl font-bold text-gray-900">
//               Department Insights : <span className="text-custom-blue">{selectedDepartment}</span>
//             </h2>
//           </div>

//           {/* Key Stats */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//             <StatCard
//               icon={Users}
//               title="Total Offers"
//               value={deptData.totalOffers || 0}
//               color="indigo"
//             />
//               <StatCard
//                 icon={Users}
//                 title="Double Offers"
//                 value={deptData.multipleOffers || 0}
//                 color="red"
//               />
//             <StatCard
//               icon={Users}
//               title="Students Placed"
//               value={deptData.uniqueStudents || 0}
//               color="blue"
//             />
//              <StatCard
//             icon={IndianRupee}
//             title="Average CTC"
//             value={deptData.avgCTC ? `₹${deptData.avgCTC}L` : 'N/A'}
//             subtitle="Per annum"
//             color="green"
//           />
//           <StatCard
//             icon={IndianRupee}
//             title="Highest CTC"
//             value={
//   deptData.highestCTC
//     ? deptData.highestCTC > 100
//       ? `₹${(deptData.highestCTC / 100).toFixed(2)} Cr`
//       : `₹${deptData.highestCTC} L`
//     : 0
// }

//             subtitle="Per annum"
//             color="blue"
//           />
//           <StatCard
//             icon={IndianRupee}
//             title="Lowest CTC"
//             value={deptData.lowestCTC || 0}
//             subtitle="Per annum"
//             color="pink"
//           />
//           </div>

//           {/* Charts Grid */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//             <ChartCard title="CTC Distribution" icon={IndianRupee}>
//               <Doughnut
//                 data={{
//                   labels: Object.keys(deptData.ctcBuckets || {}),
//                   datasets: [{
//                     data: Object.values(deptData.ctcBuckets || {}),
//                     backgroundColor: ctcColors,
//                     borderWidth: 0,
//                     cutout: '60%',
//                   }],
//                 }}
//                 options={chartOptions}
//               />
//             </ChartCard>
//              <ChartCard title="Gender Distribution" icon={IndianRupee}>
//   <Doughnut
//     data={{
//       labels: Object.keys(deptData.genderDist || {}).map(
//         (g) =>
//           `${g} (${deptData.genderUnique?.[g] || 0}/${deptData.genderDist?.[g] || 0})`
//       ),
//       datasets: [
//         {
//           data: Object.values(deptData.genderDist || {}),
//           backgroundColor: genderColor,
//           borderWidth: 0,
//           cutout: "60%",
//         },
//       ],
//     }}
//     options={chartOptions}
//   />
// </ChartCard>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//              <ChartCard title="Top 5 Companies (Offer Count Wise)" icon={Building}>
//               <Bar
//                 data={{
//                   labels: deptData.topCompaniesByCount?.map(item => item.company) || [],
//                   datasets: [{
//                     label: 'Offers',
//                     data: deptData.topCompaniesByCount?.map(item => item.count) || [],
//                     backgroundColor: 'rgba(168, 85, 247, 0.8)',
//                     borderRadius: 8,
//                     borderSkipped: false,
//                   }],
//                 }}
//                 options={chartOptions}
//               />
//             </ChartCard>
//             <ChartCard title="Top 5 Companies (Highest CTC Wise)" icon={Award}>
//               <Bar
//                 data={{
//                   labels: deptData.topCompaniesByAvgCTC?.map(item => item.company) || [],
//                   datasets: [{
//                     label: 'CTC (₹LPA)',
//                     data: deptData.topCompaniesByAvgCTC?.map(item => item.avgCTC) || [],
//                     backgroundColor: 'rgba(34, 197, 94, 0.8)',
//                     borderRadius: 8,
//                     borderSkipped: false,
//                   }],
//                 }}
//                 options={chartOptions}
//               />
//             </ChartCard>
//           </div>

//           {/* Distribution Lists */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//             <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//               <h4 className="font-semibold text-gray-800 mb-3">Job Type Distribution</h4>
//               <div className="space-y-2">
//                 {Object.entries(deptData.jobTypeDist || {}).map(([jobType, count]) => (
//                   <div key={jobType} className="flex justify-between items-center text-sm">
//                     <span className="text-gray-600">{jobType}</span>
//                     <span className="font-semibold text-green-600">{count}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//               <h4 className="font-semibold text-gray-800 mb-3">Category Distribution</h4>
//               <div className="space-y-2">
//                 {Object.entries(deptData.categoryDist || {}).map(([category, count]) => (
//                   <div key={category} className="flex justify-between items-center text-sm">
//                     <span className="text-gray-600">{category}</span>
//                     <span className="font-semibold text-indigo-600">{count}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//               <h4 className="font-semibold text-gray-800 mb-3">Industry Sector Distribution</h4>
//               <div className="space-y-2">
//                 {Object.entries(deptData.industryDist || {}).map(([sector, count]) => (
//                   <div key={sector} className="flex justify-between items-center text-sm">
//                     <span className="text-gray-600">{sector}</span>
//                     <span className="font-semibold text-green-600">{count}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       );
//     }
//   } else {
//     content = (
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Key Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//           <StatCard
//             icon={Users}
//             title="Total Offers"
//             value={insights.totalPlacements || 0}
//             subtitle={selectedCourse === 'ALL' ? 'All courses' : selectedCourse}
//             color="indigo"
//           />
//           <StatCard
//             icon={Users}
//             title="Double Offers"
//             value={insights.doublePlacements || 0}
//             subtitle="Per annum"
//             color="red"
//           />
//           <StatCard
//             icon={Users}
//             title="Student Placed"
//             value={insights.uniquePlacements || 0}
//             subtitle="Per annum"
//             color="indigo"
//           />
//           <StatCard
//             icon={IndianRupee}
//             title="Average CTC"
//             value={insights.avgCTC ? `₹${insights.avgCTC}L` : 'N/A'}
//             subtitle="Per annum"
//             color="green"
//           />
//           <StatCard
//             icon={IndianRupee}
//             title="Highest CTC"
//             value={
//   insights.highestCTC
//     ? insights.highestCTC > 100
//       ? `₹${(insights.highestCTC / 100).toFixed(2)} Cr`
//       : `₹${insights.highestCTC} L`
//     : 0
// }

//             subtitle="Per annum"
//             color="blue"
//           />
//           <StatCard
//             icon={IndianRupee}
//             title="Lowest CTC"
//             value={insights.lowestCTC? `₹${insights.lowestCTC}L` : 0}
//             subtitle="Per annum"
//             color="pink"
//           />
//         </div>

//         {/* Charts Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//           <ChartCard title="Placement Timeline" icon={Calendar}>
//             <Line data={lineChartData} options={chartOptionsdatewise} />
//           </ChartCard>

//           <ChartCard title={selectedCourse === 'ALL' ? "Course-wise Placements" : "Department-wise Placements"} icon={BarChart3}>
//             <Bar data={departmentBarData} options={chartOptions} />
//           </ChartCard>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//           <ChartCard title="CTC Distribution" icon={PieChart}>
//             <Doughnut data={ctcDoughnutData} options={chartOptions} />
//           </ChartCard>

//           <ChartCard title="Gender Distribution" icon={Users}>
//             <Pie data={genderPieData} options={chartOptions} />
//           </ChartCard>

//           {/* <ChartCard title="Top Companies (Offer Count Wise)" icon={Building}>
//             <Bar data={topCompaniesBarData} options={chartOptions} />
//           </ChartCard>

//           <ChartCard title="Top Companies (CTC Wise)" icon={Building}>
//             <Bar data={topCompaniesByCTCBarData} options={chartOptions} />
//           </ChartCard> */}
//         </div>

//         {/* Additional Insights */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//             <h4 className="font-semibold text-gray-800 mb-3">Job Type Distribution</h4>
//             <div className="space-y-2">
//               {Object.entries(insights.jobTypeDist || {}).map(([type, count]) => (
//                 <div key={type} className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">{type}</span>
//                   <div className="flex items-center space-x-2">
//                     <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
//                     <span className="font-semibold text-indigo-600">{count}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//             <h4 className="font-semibold text-gray-800 mb-3">Category Distribution</h4>
//             <div className="space-y-2">
//               {Object.entries(insights.categoryDist || {}).map(([category, count]) => (
//                 <div key={category} className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">{category}</span>
//                   <div className="flex items-center space-x-2">
//                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                     <span className="font-semibold text-green-600">{count}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//             <h4 className="font-semibold text-gray-800 mb-3">Industry Sectors</h4>
//             <div className="space-y-2">
//               {Object.entries(insights.sectorDist || {}).map(([sector, count]) => (
//                 <div key={sector} className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">{sector}</span>
//                   <div className="flex items-center space-x-2">
//                     <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
//                     <span className="font-semibold text-orange-600">{count}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">
//                 Placement <span className="text-custom-blue">Analytics</span>
//               </h1>
//               <p className="text-gray-600 text-sm mt-1">
//                 Comprehensive placement insights across all programs
//               </p>
//             </div>

//             {/* Combine both dropdowns in one flex */}
//             <div className="flex items-center space-x-4">
//               <select
//                 value={selectedBatch}
//                 onChange={(e) => setSelectedBatch(e.target.value)}
//                 className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//               >
//                 {batches.map((batchOption) => (
//                   <option key={batchOption} value={batchOption}>
//                     {batchOption}
//                   </option>
//                 ))}
//               </select>

//               <select
//                 value={selectedCourse}
//                 onChange={(e) => setSelectedCourse(e.target.value)}
//                 className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//               >
//                 {courses.map((courseOption) => (
//                   <option key={courseOption} value={courseOption}>
//                     {courseOption}
//                   </option>
//                 ))}
//               </select>

//               {deptOptions.length > 0 && (
//                 <select
//                   value={selectedDepartment}
//                   onChange={(e) => setSelectedDepartment(e.target.value)}
//                   className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                 >
//                   <option value="">All Departments</option>
//                   {deptOptions.map((dept) => (
//                     <option key={dept} value={dept}>
//                       {dept}
//                     </option>
//                   ))}
//                 </select>
//               )}
//               {/* <div className="flex justify-end">
//   <button
//     onClick={handleDownloadExcel}
//     className="bg-custom-blue text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-all"
//   >
//     Download Excel
//   </button>
// </div> */}
//             </div>
//           </div>
//         </div>
//       </div>

//       {content}
//     </div>
//   );
// };

// export default InsightDashboard;
