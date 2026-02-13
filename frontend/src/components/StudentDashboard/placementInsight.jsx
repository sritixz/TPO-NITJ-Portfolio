
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
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
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { TrendingUp, Users, DollarSign, Building, Award, Calendar, BarChart3, PieChart, IndianRupee, Briefcase } from 'lucide-react';

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
  ChartDataLabels
);

// Department abbreviation mapping
const DEPT_ABBREVIATIONS = {
  'BIO TECHNOLOGY': 'BT',
  'CIVIL ENGINEERING': 'CE',
  'CHEMICAL ENGINEERING': 'CM',
  'COMPUTER SCIENCE AND ENGINEERING': 'CS',
  'DATA SCIENCE AND ENGINEERING': 'DS',
  'ELECTRONICS AND COMMUNICATION ENGINEERING': 'EC',
  'ELECTRICAL ENGINEERING': 'EE',
  'INSTRUMENTATION AND CONTROL ENGINEERING': 'IC',
  'INDUSTRIAL AND PRODUCTION ENGINEERING': 'IP',
  'INDUSTRIAL ENGINEERING AND DATA ANALYTICS': 'IE',
  'INFORMATION TECHNOLOGY': 'IT',
  'DATA ANALYTICS': 'DA',
  'MATHEMATICS AND COMPUTING': 'MC',
  'MECHANICAL ENGINEERING': 'ME',
  'TEXTILE TECHNOLOGY': 'TT',
  'ELECTRONICS AND VLSI ENGINEERING': 'VL',
  'CONTROL AND INSTRUMENTATION ENGINEERING': 'CI',
  'MACHINE INTELLIGENCE AND AUTOMATION': 'MI',
};

// Helper function to create abbreviation for unlisted departments
// Keeps track of used abbreviations to avoid duplicates
const usedAbbreviations = new Map();

const getAbbreviation = (deptName) => {
  // Check if abbreviation exists in predefined list
  if (DEPT_ABBREVIATIONS[deptName]) {
    return DEPT_ABBREVIATIONS[deptName];
  }
  
  // Check if we've already generated one for this department
  if (usedAbbreviations.has(deptName)) {
    return usedAbbreviations.get(deptName);
  }
  
  // Auto-generate abbreviation for unlisted departments
  const words = deptName.split(' ').filter(word => 
    word && !['AND', 'OF', 'THE', 'IN', 'FOR'].includes(word.toUpperCase())
  );
  
  let abbreviation;
  
  if (words.length === 0) {
    // Fallback - first 2-3 letters
    abbreviation = deptName.substring(0, 3).toUpperCase();
  } else if (words.length === 1) {
    // Single word - take first 2-3 letters
    abbreviation = words[0].substring(0, 3).toUpperCase();
  } else {
    // Multiple words - take first letter of each significant word (max 4)
    abbreviation = words.slice(0, 4).map(w => w[0]).join('').toUpperCase();
  }
  
  // Check for collision with existing abbreviations
  const allExistingAbbreviations = [
    ...Object.values(DEPT_ABBREVIATIONS),
    ...Array.from(usedAbbreviations.values())
  ];
  
  let finalAbbreviation = abbreviation;
  let counter = 1;
  
  // If collision exists, add a number suffix
  while (allExistingAbbreviations.includes(finalAbbreviation)) {
    if (words.length >= 2) {
      // Try adding more letters from first word
      finalAbbreviation = abbreviation + words[0].substring(1, 1 + counter).toUpperCase();
    } else {
      // Add numeric suffix
      finalAbbreviation = abbreviation + counter;
    }
    counter++;
    
    // Safety limit to prevent infinite loop
    if (counter > 10) {
      finalAbbreviation = abbreviation + Math.random().toString(36).substring(2, 4).toUpperCase();
      break;
    }
  }
  
  // Store for future use
  usedAbbreviations.set(deptName, finalAbbreviation);
  
  return finalAbbreviation;
};

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
    ],
  },
  {
    label: "COMPUTER SCIENCE AND ENGINEERING",
    options: [
      {
        value: "COMPUTER SCIENCE AND ENGINEERING",
        label: "COMPUTER SCIENCE AND ENGINEERING",
      },
      { value: "COMPUTER SCIENCE AND ENGINEERING (INFORMATION SECURITY)", label: "COMPUTER SCIENCE AND ENGINEERING (INFORMATION SECURITY)" },
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
      }
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
    options: [{ value: "HUMANITIES AND MANAGEMENT", label: "HUMANITIES AND MANAGEMENT" }],
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

const PlacementInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('B.Tech');
  const [selectedBatch, setSelectedBatch] = useState('2026');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const courses = ['B.Tech', 'M.Tech', 'MBA', 'M.Sc'];
  const batches = ['2025', '2026', '2027', '2028', '2029', '2030'];

  const getDeptOptions = (course) => {
    let groups;
    if (course === 'B.Tech') groups = btechdepartmentOptions;
    else if (course === 'M.Tech') groups = mtechdepartmentOptions;
    else if (course === 'MBA') groups = mbadepartmentOptions;
    else if (course === 'M.Sc') groups = mscdepartmentOptions;
    else return [];
    return groups.flatMap(g => g.options.map(o => o.label));
  };


  const handleDownloadExcel = async () => {
  if (!insights) return;

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(`${selectedCourse}_${selectedBatch}`);

  // Set title
  ws.mergeCells("A1", "E1");
  const titleCell = ws.getCell("A1");
  titleCell.value = `Placement Insights - ${selectedCourse} (${selectedBatch})`;
  titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "4F46E5" } };

  ws.addRow([]);
  ws.addRow(["Key Statistics"]);
  ws.getRow(3).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(3).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "6366F1" } };

  const stats = [
    ["Total Placements", insights.totalPlacements || 0],
    ["Unique Students Placed", insights.uniquePlacements || 0],
    ["Double Offers", insights.doublePlacements || 0],
    ["Average CTC (₹LPA)", insights.avgCTC || "N/A"],w
    ["Highest CTC (₹LPA)", insights.highestCTC || "N/A"],
    ["Lowest CTC (₹LPA)", insights.lowestCTC || "N/A"],
  ];

  ws.addRows(stats);

  ws.addRow([]);
  ws.addRow(["Department-wise Placements"]);
  ws.getRow(ws.lastRow.number).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(ws.lastRow.number).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "2563EB" } };

  const deptData = Object.entries(insights.placementsByDepartment || {});
  ws.addRow(["Department", "Total Placements"]);
  deptData.forEach(([dept, count]) => ws.addRow([dept, count]));

  ws.addRow([]);
  ws.addRow(["CTC Buckets"]);
  ws.getRow(ws.lastRow.number).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(ws.lastRow.number).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "059669" } };

  const ctcData = Object.entries(insights.ctcBuckets || {});
  ws.addRow(["Range", "Count"]);
  ctcData.forEach(([range, count]) => ws.addRow([range, count]));

  ws.addRow([]);
  ws.addRow(["Top Companies"]);
  ws.getRow(ws.lastRow.number).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(ws.lastRow.number).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "9333EA" } };

  const topCompanies = insights.topCompanies || [];
  ws.addRow(["Company", "Offers"]);
  topCompanies.forEach((c) => ws.addRow([c.company, c.count]));

  // Auto column width
  ws.columns.forEach((col) => {
    let maxLength = 0;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const val = cell.value ? cell.value.toString() : "";
      maxLength = Math.max(maxLength, val.length);
    });
    col.width = maxLength < 15 ? 15 : maxLength + 2;
  });

  // Border style
  ws.eachRow({ includeEmpty: false }, (row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "D1D5DB" } },
        left: { style: "thin", color: { argb: "D1D5DB" } },
        bottom: { style: "thin", color: { argb: "D1D5DB" } },
        right: { style: "thin", color: { argb: "D1D5DB" } },
      };
    });
  });

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer], { type: "application/octet-stream" }),
    `${selectedCourse}_${selectedBatch}_Insights.xlsx`
  );
};

  useEffect(() => {
    setSelectedDepartment('');
  }, [selectedCourse]);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true); // trying to fix loading 
      try {
        const params = { course: selectedCourse, batch: selectedBatch };
        const res = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/insight/stats/`, { 
          params, 
          withCredentials: true 
        });
        console.log(res.data);
        setInsights(res.data);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setInsights({ noData: true }); // ✅ special flag
        } else {
          console.error('Error fetching insights:', error);
          setInsights(null); // real error
        }
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [selectedCourse, selectedBatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-red-400 mb-4">
              <BarChart3 size={64} className="mx-auto" />
            </div>
            <p className="text-xl text-gray-600 mb-2">Failed to load insights</p>
            <p className="text-sm text-gray-500">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "indigo" }) => (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
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
      <div className="h-80">
        {children}
      </div>
    </div>
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
      },
      datalabels: {
        display: false, // Disable for non-bar charts
      },
    },
  };

  // Special options for vertical department bar chart
  const departmentBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend for cleaner look
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          title: (context) => {
            const abbreviation = context[0].label;
            // Find full name from the original data
            const fullNames = Object.keys(insights.placementsByDepartment || {});
            const fullName = fullNames.find(name => 
              getAbbreviation(name) === abbreviation
            );
            return fullName || abbreviation;
          },
          label: (context) => {
            return `Placements: ${context.parsed.y}`;
          },
        },
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        color: '#374151',
        font: {
          weight: 'bold',
          size: window.innerWidth < 768 ? 9 : 11,
        },
        formatter: (value) => value,
        padding: 2,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: window.innerWidth < 640 ? 8 : window.innerWidth < 768 ? 9 : 11,
            weight: '500',
          },
          autoSkip: false,
          maxRotation: window.innerWidth < 768 ? 45 : 0,
          minRotation: window.innerWidth < 768 ? 45 : 0,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 9 : 11,
          },
        },
      },
    },
  };

  const lineChartData = {
    labels: insights.offersVsDate?.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }); // axis label
    }) || [],
    datasets: [{
      label: 'Offers Over Time',
      data: insights.offersVsDate?.map(item => item.count) || [],
      borderColor: 'rgb(99, 102, 241)',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'rgb(99, 102, 241)',
      pointBorderColor: 'white',
      pointBorderWidth: 2,
      pointRadius: 6,
    }],
  };

  const chartOptionsdatewise = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            const rawDate = insights.offersVsDate[index].date; // original date
            const fullDate = new Date(rawDate).toLocaleDateString('en-US', { 
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });
            return fullDate; // show full date in tooltip
          },
        },
      },
    },
  };

  const departmentBarData = {
    labels: Object.keys(insights.placementsByDepartment || {}).map(
      dept => getAbbreviation(dept)
    ),
    datasets: [{
      label: 'Placements',
      data: Object.values(insights.placementsByDepartment || {}),
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(20, 184, 166, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(147, 51, 234, 0.8)',
        'rgba(244, 63, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(234, 179, 8, 0.8)',
      ],
      borderRadius: 6,
      borderSkipped: false,
      barThickness: 'flex',
      maxBarThickness: 40,
    }],
  };

  const ctcDoughnutData = {
    labels: Object.keys(insights.ctcBuckets || {}),
    datasets: [{
      data: Object.values(insights.ctcBuckets || {}),
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(99, 102, 241, 0.8)',
        'rgba(168, 85, 247, 0.8)',
      ],
      borderWidth: 0,
      cutout: '60%',
    }],
  };

  const genderPieData = {
    labels: Object.keys(insights.genderDist || {}).map(
        (g) =>
          `${g} (${insights.genderUnique?.[g] || 0}/${insights.genderDist?.[g] || 0})`
      ),
    datasets: [{
      data: Object.values(insights.genderDist || {}),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(34, 197, 94, 0.8)',
      ],
      borderWidth: 0,
    }],
  };

  const topCompaniesBarData = {
    labels: insights.topCompanies?.map(item => item.company) || [],
    datasets: [{
      label: 'Offers',
      data: insights.topCompanies?.map(item => item.count) || [],
      backgroundColor: 'rgba(168, 85, 247, 0.8)',
      borderRadius: 8,
      borderSkipped: false,
    }],
  };
  const topCompaniesByCTCBarData = {
    labels: insights.topCompaniesByCTC?.map(item => item.company) || [],
    datasets: [{
      label: 'CTC',
      data: insights.topCompaniesByCTC?.map(item => item.maxCTC) || [],
      backgroundColor: 'rgba(168, 85, 247, 0.8)',
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const deptOptions = getDeptOptions(selectedCourse);

  const isDeptView = !!selectedDepartment;
  let content;

  if (insights?.noData) {
    content = (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-yellow-400 mb-4">
              <BarChart3 size={64} className="mx-auto" />
            </div>
            <p className="text-xl text-gray-600 mb-2">No data available</p>
            <p className="text-sm text-gray-500">Please select a different filter</p>
          </div>
        </div>
      </div>
    );
  } else if (isDeptView) {
// NEW: departmentStats is an object keyed by department name
const deptData = insights.departmentStats?.[selectedDepartment];

    if (!deptData) {
      content = (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-yellow-400 mb-4">
                <BarChart3 size={64} className="mx-auto" />
              </div>
              <p className="text-xl text-gray-600 mb-2">Data not available</p>
              <p className="text-sm text-gray-500">for the selected department or no placement yet</p>
            </div>
          </div>
        </div>
      );
    } else {
      const ctcColors = [
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(99, 102, 241, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ];
      const genderColor=[
        'rgba(8, 54, 129, 0.8)',
        'rgba(188, 4, 96, 0.8)',
        'rgba(34, 197, 94, 0.8)',
      ]

      content = (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Department Insights : <span className="text-custom-blue">{selectedDepartment}</span>
            </h2>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={Users}
              title="Total Offers"
              value={deptData.totalOffers || 0}
              color="indigo"
            />
              <StatCard
                icon={Users}
                title="Double Offers"
                value={deptData.multipleOffers || 0}
                color="red"
              />
            <StatCard
              icon={Users}
              title="Students Placed"
              value={deptData.uniqueStudents || 0}
              color="blue"
            />
             <StatCard
            icon={IndianRupee}
            title="Average CTC"
            value={deptData.avgCTC ? `₹${deptData.avgCTC}L` : 'N/A'}
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
            value={deptData.lowestCTC || 0}
            subtitle="Per annum"
            color="pink"
          />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <ChartCard title="CTC Distribution" icon={IndianRupee}>
              <Doughnut
                data={{
                  labels: Object.keys(deptData.ctcBuckets || {}),
                  datasets: [{
                    data: Object.values(deptData.ctcBuckets || {}),
                    backgroundColor: ctcColors,
                    borderWidth: 0,
                    cutout: '60%',
                  }],
                }}
                options={chartOptions}
              />
            </ChartCard>
             <ChartCard title="Gender Distribution" icon={IndianRupee}>
  <Doughnut
    data={{
      labels: Object.keys(deptData.genderDist || {}).map(
        (g) =>
          `${g} (${deptData.genderUnique?.[g] || 0}/${deptData.genderDist?.[g] || 0})`
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
        </div>
      );
    }
  } else {
    content = (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Offers"
            value={insights.totalPlacements || 0}
            subtitle={selectedCourse === 'ALL' ? 'All courses' : selectedCourse}
            color="indigo"
          />
          <StatCard
            icon={Users}
            title="Double Offers"
            value={insights.doublePlacements || 0}
            subtitle="Per annum"
            color="red"
          />
          <StatCard
            icon={Users}
            title="Student Placed"
            value={insights.uniquePlacements || 0}
            subtitle="Per annum"
            color="indigo"
          />
          <StatCard
            icon={IndianRupee}
            title="Average CTC"
            value={insights.avgCTC ? `₹${insights.avgCTC}L` : 'N/A'}
            subtitle="Per annum"
            color="green"
          />
          <StatCard
            icon={IndianRupee}
            title="Highest CTC"
             value={
  insights.highestCTC
    ? insights.highestCTC > 100
      ? `₹${(insights.highestCTC / 100).toFixed(2)} Cr`
      : `₹${insights.highestCTC} L`
    : 0
}
            subtitle="Per annum"
            color="blue"
          />
          <StatCard
            icon={IndianRupee}
            title="Lowest CTC"
            value={insights.lowestCTC || 0}
            subtitle="Per annum"
            color="pink"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChartCard title="Placement Timeline" icon={Calendar}>
            <Line data={lineChartData} options={chartOptionsdatewise} />
          </ChartCard>

          <ChartCard title={selectedCourse === 'ALL' ? "Course-wise Placements" : "Department-wise Placements"} icon={BarChart3}>
            <Bar data={departmentBarData} options={departmentBarOptions} />
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChartCard title="CTC Distribution" icon={PieChart}>
            <Doughnut data={ctcDoughnutData} options={chartOptions} />
          </ChartCard>

          <ChartCard title="Gender Distribution" icon={Users}>
            <Pie data={genderPieData} options={chartOptions} />
          </ChartCard>
        </div>    
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Placement <span className="text-custom-blue">Analytics</span>
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
          Comprehensive placement insights across all programs
          </p>
        </div>
       
        {/* Combine both dropdowns in one flex */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-auto"
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
          className="bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-auto"
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
            className="bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-auto"
          >
            <option value="">All Departments</option>
            {deptOptions.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
            ))}
          </select>
          )}
        </div>
        </div>
      </div>
      </div>

      {content}
    </div>
    );
};

export default PlacementInsights;