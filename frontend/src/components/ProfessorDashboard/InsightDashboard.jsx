import React, { useState, useEffect } from "react";
import axios from "axios";
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
  { label: "BIO TECHNOLOGY", options: [{ value: "BIO TECHNOLOGY", label: "BIO TECHNOLOGY" }] },
  { label: "CHEMICAL ENGINEERING", options: [{ value: "CHEMICAL ENGINEERING", label: "CHEMICAL ENGINEERING" }] },
  { label: "CIVIL ENGINEERING", options: [{ value: "CIVIL ENGINEERING", label: "CIVIL ENGINEERING" }] },
  {
    label: "COMPUTER SCIENCE AND ENGINEERING",
    options: [
      { value: "CSE", label: "COMPUTER SCIENCE AND ENGINEERING" },
      { value: "DATA SCIENCE AND ENGINEERING", label: "DATA SCIENCE AND ENGINEERING" },
    ],
  },
  { label: "ELECTRICAL ENGINEERING", options: [{ value: "ELECTRICAL ENGINEERING", label: "ELECTRICAL ENGINEERING" }] },
  {
    label: "ELECTRONICS AND COMMUNICATION ENGINEERING",
    options: [
      { value: "ELECTRONICS AND COMMUNICATION ENGINEERING", label: "ELECTRONICS AND COMMUNICATION ENGINEERING" },
      { value: "ELECTRONICS AND VLSI ENGINEERING", label: "ELECTRONICS AND VLSI ENGINEERING" },
    ],
  },
  { label: "INDUSTRIAL AND PRODUCTION ENGINEERING", options: [{ value: "INDUSTRIAL AND PRODUCTION ENGINEERING", label: "INDUSTRIAL AND PRODUCTION ENGINEERING" }] },
  { label: "INFORMATION TECHNOLOGY", options: [{ value: "INFORMATION TECHNOLOGY", label: "INFORMATION TECHNOLOGY" }] },
  { label: "INSTRUMENTATION AND CONTROL ENGINEERING", options: [{ value: "INSTRUMENTATION AND CONTROL ENGINEERING", label: "INSTRUMENTATION AND CONTROL ENGINEERING" }] },
  { label: "MATHEMATICS AND COMPUTING", options: [{ value: "MATHEMATICS AND COMPUTING", label: "MATHEMATICS AND COMPUTING" }] },
  { label: "MECHANICAL ENGINEERING", options: [{ value: "MECHANICAL ENGINEERING", label: "MECHANICAL ENGINEERING" }] },
  { label: "TEXTILE TECHNOLOGY", options: [{ value: "TEXTILE TECHNOLOGY", label: "TEXTILE TECHNOLOGY" }] },
];

const mtechdepartmentOptions = [
  { label: "BIO TECHNOLOGY", options: [{ value: "BIO TECHNOLOGY", label: "BIO TECHNOLOGY" }] },
  { label: "CHEMICAL ENGINEERING", options: [{ value: "CHEMICAL ENGINEERING", label: "CHEMICAL ENGINEERING" }] },
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
      { value: "COMPUTER SCIENCE AND ENGINEERING", label: "COMPUTER SCIENCE AND ENGINEERING" },
      { value: "COMPUTER SCIENCE AND ENGINEERING (INFORMATION SECURITY)", label: "COMPUTER SCIENCE AND ENGINEERING (INFORMATION SECURITY)" },
      { value: "DATA SCIENCE AND ENGINEERING", label: "DATA SCIENCE AND ENGINEERING" },
    ],
  },
  { label: "ELECTRICAL ENGINEERING", options: [{ value: "ELECTRIC VEHICLE DESIGN", label: "ELECTRIC VEHICLE DESIGN" }] },
  {
    label: "ELECTRONICS AND COMMUNICATION ENGINEERING",
    options: [
      { value: "SIGNAL PROCESSING AND MACHINE LEARNING", label: "SIGNAL PROCESSING AND MACHINE LEARNING" },
      { value: "VLSI DESIGN", label: "VLSI DESIGN" },
    ],
  },
  { label: "INDUSTRIAL AND PRODUCTION ENGINEERING", options: [{ value: "INDUSTRIAL ENGINEERING AND DATA ANALYTICS", label: "INDUSTRIAL ENGINEERING AND DATA ANALYTICS" }] },
  { label: "INFORMATION TECHNOLOGY", options: [{ value: "DATA ANALYTICS", label: "DATA ANALYTICS" }] },
  {
    label: "CONTROL AND INSTRUMENTATION ENGINEERING",
    options: [
      { value: "CONTROL AND INSTRUMENTATION ENGINEERING", label: "CONTROL AND INSTRUMENTATION ENGINEERING" },
      { value: "MACHINE INTELLIGENCE AND AUTOMATION", label: "MACHINE INTELLIGENCE AND AUTOMATION" },
    ],
  },
  { label: "MATHEMATICS AND COMPUTING", options: [{ value: "MATHEMATICS AND COMPUTING", label: "MATHEMATICS AND COMPUTING" }] },
  {
    label: "MECHANICAL ENGINEERING",
    options: [
      { value: "DESIGN ENGINEERING", label: "DESIGN ENGINEERING" },
      { value: "THERMAL AND ENERGY ENGINEERING", label: "THERMAL AND ENERGY ENGINEERING" },
    ],
  },
  { label: "TEXTILE TECHNOLOGY", options: [{ value: "TEXTILE ENGINEERING AND MANAGEMENT", label: "TEXTILE ENGINEERING AND MANAGEMENT" }] },
  { label: "RENEWABLE ENERGY", options: [{ value: "RENEWABLE ENERGY", label: "RENEWABLE ENERGY" }] },
  { label: "ARTIFICIAL INTELLIGENCE", options: [{ value: "ARTIFICIAL INTELLIGENCE", label: "ARTIFICIAL INTELLIGENCE" }] },
  { label: "POWER SYSTEMS AND RELIABILITY", options: [{ value: "POWER SYSTEMS AND RELIABILITY", label: "POWER SYSTEMS AND RELIABILITY" }] },
];

const mbadepartmentOptions = [
  { label: "HUMANITIES AND MANAGEMENT", options: [{ value: "HUMANITIES AND MANAGEMENT", label: "HUMANITIES AND MANAGEMENT" }] },
];

const mscdepartmentOptions = [
  { label: "CHEMISTRY", options: [{ value: "CHEMISTRY", label: "CHEMISTRY" }] },
  { label: "MATHEMATICS", options: [{ value: "MATHEMATICS", label: "MATHEMATICS" }] },
  { label: "PHYSICS", options: [{ value: "PHYSICS", label: "PHYSICS" }] },
];

const InsightDashboard = () => {
  const [insights, setInsights] = useState(null);
  const [summerInternInsights, setSummerInternInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("B.Tech");
  const [selectedBatch, setSelectedBatch] = useState("2026");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [insightsType, setInsightsType] = useState("Placement");
  const [showAllCompanies, setShowAllCompanies] = useState(false);

  const courses = ["B.Tech", "M.Tech", "MBA", "M.Sc."];
  const batches = ["2025", "2026", "2027", "2028", "2029", "2030"];
  const companyFilters = ["All", "B.Tech", "M.Tech", "MBA", "M.Sc."];
  const isSummer = insightsType === "Summer Internships";
  const activeInsights = isSummer ? summerInternInsights : insights;

  const getDeptOptions = (course) => {
    let groups;
    if (course === "B.Tech") groups = btechdepartmentOptions;
    else if (course === "M.Tech") groups = mtechdepartmentOptions;
    else if (course === "MBA") groups = mbadepartmentOptions;
    else if (course === "M.Sc.") groups = mscdepartmentOptions;
    else return [];
    // UPDATED: Return full option objects to handle value/label logic correctly
    return groups.flatMap((g) => g.options);
  };

  useEffect(() => {
    setSelectedDepartment("");
  }, [selectedCourse]);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const params = { course: selectedCourse, batch: selectedBatch };
        if (companyFilter !== "All") params.companyFilter = companyFilter;

        if (!isSummer) {
          const res = await axios.get(
            `${import.meta.env.REACT_APP_BASE_URL}/insight/stats/`,
            { params, withCredentials: true },
          );
          setInsights(res.data);
        } else {
          const res = await axios.get(
            `${import.meta.env.REACT_APP_BASE_URL}/insight/internship-stats/`,
            { params, withCredentials: true },
          );
          setSummerInternInsights(res.data);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          if (!isSummer) setInsights({ noData: true });
          else setSummerInternInsights({ noData: true });
        } else {
          console.error(error);
          if (!isSummer) setInsights(null);
          else setSummerInternInsights(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [selectedCourse, selectedBatch, companyFilter, insightsType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (!activeInsights) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-red-400 mb-4"><BarChart3 size={64} className="mx-auto" /></div>
            <p className="text-xl text-gray-600 mb-2">Failed to load insights</p>
            <p className="text-sm text-gray-500">Please try refreshing the page</p>
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

  const CompanyGrid = ({ companies = [] }) => {
    if (!companies.length) return null;
    const toShow = showAllCompanies ? companies : companies.slice(0, 30);
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
        <div className="flex items-center mb-4">
          <Building className="text-indigo-600 mr-3" size={20} />
          <h3 className="text-lg font-semibold text-gray-800">Companies Visited</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {toShow.map((company, idx) => (
            <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-indigo-400 transition-colors">
              <p className="text-sm font-medium text-gray-700">{company}</p>
            </div>
          ))}
        </div>
        {companies.length > 30 && (
          <button
            onClick={() => setShowAllCompanies(!showAllCompanies)}
            className="mt-4 px-4 py-2 border border-indigo-500 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
          >
            {showAllCompanies ? "Show Less" : `Show All (${companies.length})`}
          </button>
        )}
      </div>
    );
  };

  // ─── Chart Options ────────────────────────────────────────────────────────

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true, padding: 20 } },
      tooltip: { backgroundColor: "rgba(0,0,0,0.8)", titleColor: "white", bodyColor: "white", cornerRadius: 8 },
    },
  };

  const chartOptionsdatewise = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      datalabels: { display: false },
      legend: { position: "bottom", labels: { usePointStyle: true, padding: 20 } },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.85)",
        titleColor: "white",
        bodyColor: "white",
        cornerRadius: 10,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            const rawDate = activeInsights.offersVsDate?.[index]?.date;
            if (!rawDate) return "";
            return new Date(rawDate).toLocaleDateString("en-US", {
              weekday: "short", day: "numeric", month: "short", year: "numeric",
            });
          },
          label: (context) => `Offers: ${context.raw}`,
        },
      },
    },
    elements: {
      point: { radius: 0, hoverRadius: 5, hitRadius: 10 },
      line: { tension: 0.4, borderWidth: 2 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { autoSkip: true, maxTicksLimit: 6, maxRotation: 0 } },
      y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" }, ticks: { precision: 0 } },
    },
  };

  const barColors = [
    "rgba(99,102,241,0.8)", "rgba(34,197,94,0.8)", "rgba(245,158,11,0.8)",
    "rgba(239,68,68,0.8)", "rgba(168,85,247,0.8)", "rgba(14,165,233,0.8)",
  ];

  const stipendColors = [
    "rgba(239,68,68,0.8)", "rgba(245,158,11,0.8)", "rgba(34,197,94,0.8)",
    "rgba(99,102,241,0.8)", "rgba(168,85,247,0.8)", "rgba(20,184,166,0.8)",
  ];

  const genderColors = ["rgba(8,54,129,0.8)", "rgba(188,4,96,0.8)", "rgba(34,197,94,0.8)"];

  // ─── Chart data ───────────────────────────────────────────────────────────

  const lineChartData = (!isSummer && activeInsights?.offersVsDate) ? {
    labels: activeInsights.offersVsDate.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    }) || [],
    datasets: [{
      label: "Offers Over Time",
      data: activeInsights.offersVsDate.map((item) => item.count) || [],
      borderColor: "rgb(99,102,241)",
      backgroundColor: "rgba(99,102,241,0.1)",
      fill: true, tension: 0.4,
      pointBackgroundColor: "rgb(99,102,241)",
      pointBorderColor: "white", pointBorderWidth: 2, pointRadius: 6,
    }],
  } : null;

  const summerLineChartData = (isSummer && activeInsights?.offersVsDate) ? {
    labels: activeInsights.offersVsDate.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    }) || [],
    datasets: [{
      label: "Internship Offers Over Time",
      data: activeInsights.offersVsDate.map((item) => item.count) || [],
      borderColor: "rgb(20,184,166)",
      backgroundColor: "rgba(20,184,166,0.1)",
      fill: true, tension: 0.4,
      pointBackgroundColor: "rgb(20,184,166)",
      pointBorderColor: "white", pointBorderWidth: 2, pointRadius: 6,
    }],
  } : null;

  const departmentBarData = {
    labels: Object.keys(activeInsights?.departmentStats || {}),
    datasets: [{
      label: isSummer ? "Internship %" : "Placement %",
      data: Object.values(activeInsights?.departmentStats || {}).map((e) =>
        isSummer ? (e?.internshipPercentage ?? 0) : (e?.placementPercentage ?? 0)
      ),
      backgroundColor: Object.keys(activeInsights?.departmentStats || {}).map((_, i) => barColors[i % barColors.length]),
      borderRadius: 8,
    }],
  };

  const ctcDoughnutData = (!isSummer && activeInsights?.ctcBuckets) ? {
    labels: Object.keys(activeInsights.ctcBuckets || {}),
    datasets: [{
      data: Object.values(activeInsights.ctcBuckets || {}),
      backgroundColor: stipendColors,
      borderWidth: 0,
    }],
  } : null;

  const stipendDoughnutData = (isSummer && activeInsights?.stipendBuckets) ? {
    labels: Object.keys(activeInsights.stipendBuckets || {}),
    datasets: [{
      data: Object.values(activeInsights.stipendBuckets || {}),
      backgroundColor: stipendColors,
      borderWidth: 0, cutout: "60%",
    }],
  } : null;

  const genderPieData = activeInsights?.genderDist ? {
    labels: Object.keys(activeInsights.genderDist || {}).map(
      (g) => `${g} (${activeInsights.genderUnique?.[g] || 0}/${activeInsights.genderDist?.[g] || 0})`
    ),
    datasets: [{
      data: Object.values(activeInsights.genderDist || {}),
      backgroundColor: ["rgba(59,130,246,0.8)", "rgba(236,72,153,0.8)", "rgba(34,197,94,0.8)"],
      borderWidth: 0,
    }],
  } : null;

  // ─── Dept view logic ──────────────────────────────────────────────────────

  const deptOptions = getDeptOptions(selectedCourse);
  const isDeptView = !!selectedDepartment;

  // FIX: Perform a robust lookup using short codes (CSE) or full labels
  const getDeptData = () => {
    if (!selectedDepartment || !activeInsights?.departmentStats) return null;
    const stats = activeInsights.departmentStats;
    // 1. Direct match (works if selected value is e.g. "CSE")
    if (stats[selectedDepartment]) return stats[selectedDepartment];
    // 2. Case-insensitive normalization
    const match = Object.keys(stats).find(
      key => key.trim().toUpperCase() === selectedDepartment.trim().toUpperCase()
    );
    return match ? stats[match] : null;
  };

  const deptData = getDeptData();

  let content;

  if (activeInsights?.noData) {
    content = (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-yellow-400 mb-4"><BarChart3 size={64} className="mx-auto" /></div>
            <p className="text-xl text-gray-600 mb-2">No data available</p>
            <p className="text-sm text-gray-500">Please select a different filter</p>
          </div>
        </div>
      </div>
    );

  } else if (isDeptView) {
    if (!deptData) {
      content = (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-yellow-400 mb-4"><BarChart3 size={64} className="mx-auto" /></div>
              <p className="text-xl text-gray-600 mb-2">Data not available</p>
              <p className="text-sm text-gray-500">for the selected department</p>
            </div>
          </div>
        </div>
      );
    } else {
      content = (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {isSummer ? "Internship" : "Placement"} Insights:{" "}
              <span className="text-custom-blue">{selectedDepartment}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={isSummer ? Briefcase : Users} title={isSummer ? "Intern Offers" : "Total Offers"} value={deptData.totalOffers || 0} color="indigo" />
            <StatCard icon={Users} title="Multiple Offers" value={isSummer ? (deptData.doubleOffers || deptData.multipleOffers || 0) : (deptData.multipleOffers || 0)} color="red" />
            <StatCard icon={Users} title="Students" value={deptData.uniqueStudents || 0} color="blue" />

            {isSummer ? (
              <>
                <StatCard icon={IndianRupee} title="Average Stipend" value={deptData.avgStipend ? `₹${deptData.avgStipend}K/mo` : "N/A"} subtitle="Per month" color="green" />
                <StatCard icon={IndianRupee} title="Highest Stipend" value={deptData.highestStipend ? `₹${deptData.highestStipend}K/mo` : "N/A"} subtitle="Per month" color="blue" />
                <StatCard icon={IndianRupee} title="Lowest Stipend" value={deptData.lowestStipend ? `₹${deptData.lowestStipend}K/mo` : "N/A"} subtitle="Per month" color="yellow" />
              </>
            ) : (
              <>
                <StatCard icon={Users} title="Eligible Students" value={deptData.eligibleStudents || 0} color="indigo" />
                <StatCard icon={IndianRupee} title="Average CTC" value={deptData.avgCTC ? `₹${deptData.avgCTC}L` : "N/A"} subtitle="Per annum" color="green" />
                <StatCard icon={IndianRupee} title="Highest CTC" value={deptData.highestCTC ? (deptData.highestCTC > 100 ? `₹${(deptData.highestCTC / 100).toFixed(2)} Cr` : `₹${deptData.highestCTC} L`) : 0} subtitle="Per annum" color="blue" />
                <StatCard icon={IndianRupee} title="Lowest CTC" value={deptData.lowestCTC ? `₹${deptData.lowestCTC}L` : "N/A"} subtitle="Per annum" color="red" />
                <StatCard icon={TrendingUp} title="Placement %" value={`${deptData.placementPercentage || 0}%`} color="purple" />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {isSummer && deptData.stipendBuckets && (
              <ChartCard title="Stipend Distribution" icon={PieChart}>
                <Doughnut data={{ labels: Object.keys(deptData.stipendBuckets || {}), datasets: [{ data: Object.values(deptData.stipendBuckets || {}), backgroundColor: stipendColors, borderWidth: 0, cutout: "60%" }] }} options={chartOptions} />
              </ChartCard>
            )}
            {!isSummer && deptData.ctcBuckets && (
              <ChartCard title="CTC Distribution" icon={IndianRupee}>
                <Doughnut data={{ labels: Object.keys(deptData.ctcBuckets || {}), datasets: [{ data: Object.values(deptData.ctcBuckets || {}), backgroundColor: stipendColors, borderWidth: 0, cutout: "60%" }] }} options={chartOptions} />
              </ChartCard>
            )}
            {deptData.genderDist && (
              <ChartCard title="Gender Distribution" icon={Users}>
                <Doughnut data={{ labels: Object.keys(deptData.genderDist || {}).map((g) => `${g} (${deptData.genderUnique?.[g] || 0}/${deptData.genderDist?.[g] || 0})`), datasets: [{ data: Object.values(deptData.genderDist || {}), backgroundColor: genderColors, borderWidth: 0, cutout: "60%" }] }} options={chartOptions} />
              </ChartCard>
            )}
          </div>

          {!isSummer && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <ChartCard title="Top 5 Companies (Offer Count)" icon={Building}>
                <Bar data={{ labels: deptData.topCompaniesByCount?.map((i) => i.company) || [], datasets: [{ label: "Offers", data: deptData.topCompaniesByCount?.map((i) => i.count) || [], backgroundColor: "rgba(168,85,247,0.8)", borderRadius: 8, borderSkipped: false }] }} options={chartOptions} />
              </ChartCard>
              <ChartCard title="Top 5 Companies (Highest CTC)" icon={Award}>
                <Bar data={{ labels: deptData.topCompaniesByAvgCTC?.map((i) => i.company) || [], datasets: [{ label: "CTC (₹LPA)", data: deptData.topCompaniesByAvgCTC?.map((i) => i.avgCTC) || [], backgroundColor: "rgba(34,197,94,0.8)", borderRadius: 8, borderSkipped: false }] }} options={chartOptions} />
              </ChartCard>
            </div>
          )}

          {!isSummer && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[{ title: "Job Type Distribution", data: deptData.jobTypeDist, color: "green" }, { title: "Category Distribution", data: deptData.categoryDist, color: "indigo" }, { title: "Industry Sector", data: deptData.industryDist, color: "orange" }].map(({ title, data, color }) => (
                <div key={title} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
                  <div className="space-y-2">
                    {Object.entries(data || {}).map(([key, count]) => (
                      <div key={key} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{key}</span>
                        <span className={`font-semibold text-${color}-600`}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isSummer && <CompanyGrid companies={deptData.companies || []} />}
        </div>
      );
    }

  } else {
    content = (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isSummer ? (
            <>
              <StatCard icon={Briefcase} title="Total Intern Offers" value={activeInsights.totalOffers ?? 0} subtitle={selectedCourse} color="indigo" />
              <StatCard icon={Users} title="Multiple Offers" value={activeInsights.doubleOffers ?? 0} color="red" />
              <StatCard icon={Users} title="Students with Internship" value={activeInsights.uniqueStudents ?? 0} color="blue" />
              <StatCard icon={IndianRupee} title="Average Stipend" value={activeInsights.avgStipend ? `₹${activeInsights.avgStipend}K/mo` : "N/A"} subtitle="Per month" color="green" />
              <StatCard icon={IndianRupee} title="Highest Stipend" value={activeInsights.highestStipend ? `₹${activeInsights.highestStipend}K/mo` : "N/A"} subtitle="Per month" color="blue" />
              <StatCard icon={IndianRupee} title="Lowest Stipend" value={activeInsights.lowestStipend ? `₹${activeInsights.lowestStipend}K/mo` : "N/A"} subtitle="Per month" color="yellow" />
            </>
          ) : (
            <>
              <StatCard icon={Users} title="Total Offers" value={activeInsights.totalPlacements || 0} subtitle={selectedCourse} color="indigo" />
              <StatCard icon={Users} title="Double Offers" value={activeInsights.doublePlacements || 0} color="red" />
              <StatCard icon={Users} title="Student Placed" value={activeInsights.uniquePlacements || 0} color="indigo" />
              <StatCard icon={Users} title="Eligible Students" value={activeInsights.totalEligibleStudents || 0} subtitle="Total" color="red" />
              <StatCard icon={IndianRupee} title="Average CTC" value={activeInsights.avgCTC ? `₹${activeInsights.avgCTC}L` : "N/A"} subtitle="Per annum" color="green" />
              <StatCard icon={IndianRupee} title="Median CTC" value={activeInsights.medianCTC ? `₹${activeInsights.medianCTC}L` : "N/A"} subtitle="Per annum" color="green" />
              <StatCard icon={IndianRupee} title="Highest CTC" value={activeInsights.highestCTC ? (activeInsights.highestCTC > 100 ? `₹${(activeInsights.highestCTC / 100).toFixed(2)} Cr` : `₹${activeInsights.highestCTC} L`) : 0} subtitle="Per annum" color="blue" />
              <StatCard icon={IndianRupee} title="Lowest CTC" value={activeInsights.lowestCTC ? `₹${activeInsights.lowestCTC}L` : 0} subtitle="Per annum" color="yellow" />
              <StatCard icon={TrendingUp} title="Placement %" value={`${activeInsights.overallPlacementPercentage || 0}%`} subtitle={selectedCourse} color="purple" />
            </>
          )}
        </div>

        {!isSummer && (
          <>
            <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-5">
              {companyFilters.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard icon={TrendingUp} title="Total Companies Visited" value={activeInsights.totalCompanies || 0} color="purple" />
              <StatCard icon={TrendingUp} title="On Campus Companies" value={activeInsights.onCampusCompanies || 0} color="purple" />
              <StatCard icon={TrendingUp} title="Off Campus Companies" value={activeInsights.offCampusCompanies || 0} color="purple" />
              <StatCard icon={TrendingUp} title="Summer Intern Companies" value={activeInsights.summerTotalCompanies || 0} color="purple" />
              <StatCard icon={TrendingUp} title="Pending Companies" value={activeInsights.pendingCompanies || 0} color="purple" />
            </div>
          </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {isSummer && summerLineChartData && (
            <ChartCard title="Internship Offer Timeline" icon={Calendar}><Line data={summerLineChartData} options={chartOptionsdatewise} /></ChartCard>
          )}
          {!isSummer && lineChartData && (
            <ChartCard title="Placement Timeline" icon={Calendar}><Line data={lineChartData} options={chartOptionsdatewise} /></ChartCard>
          )}
          <ChartCard title={isSummer ? "Department-wise Internship %" : "Department-wise Placement %"} icon={BarChart3}><Bar data={departmentBarData} options={chartOptions} /></ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {isSummer && stipendDoughnutData && (
            <ChartCard title="Stipend Distribution" icon={PieChart}><Doughnut data={stipendDoughnutData} options={chartOptions} /></ChartCard>
          )}
          {!isSummer && ctcDoughnutData && (
            <ChartCard title="CTC Distribution" icon={PieChart}><Doughnut data={ctcDoughnutData} options={chartOptions} /></ChartCard>
          )}
          {genderPieData && (
            <ChartCard title="Gender Distribution" icon={Users}><Pie data={genderPieData} options={chartOptions} /></ChartCard>
          )}
        </div>

        {isSummer && activeInsights.topCompanies?.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <ChartCard title="Top Companies by Offers" icon={Building}><Bar data={{ labels: activeInsights.topCompanies.map((i) => i.company), datasets: [{ label: "Offers", data: activeInsights.topCompanies.map((i) => i.count), backgroundColor: "rgba(168,85,247,0.8)", borderRadius: 8 }] }} options={chartOptions} /></ChartCard>
            {activeInsights.topCompaniesByStipend?.length > 0 && (
              <ChartCard title="Top Companies by Stipend (K/mo)" icon={TrendingUp}><Bar data={{ labels: activeInsights.topCompaniesByStipend.map((i) => i.company), datasets: [{ label: "Max Stipend", data: activeInsights.topCompaniesByStipend.map((i) => i.maxStipend), backgroundColor: "rgba(20,184,166,0.8)", borderRadius: 8 }] }} options={chartOptions} /></ChartCard>
            )}
          </div>
        )}

        {isSummer && <CompanyGrid companies={activeInsights.companies || []} />}

        {!isSummer && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Job Type Distribution", data: activeInsights.jobTypeDist, dotColor: "indigo" },
              { title: "Category Distribution", data: activeInsights.categoryDist, dotColor: "green" },
              { title: "Industry Sectors", data: activeInsights.sectorDist, dotColor: "orange" },
            ].map(({ title, data, dotColor }) => (
              <div key={title} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
                <div className="space-y-2">
                  {Object.entries(data || {}).map(([key, count]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{key}</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 bg-${dotColor}-500 rounded-full`}></div>
                        <span className={`font-semibold text-${dotColor}-600`}>{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isSummer ? <>Summer Intern <span className="text-custom-blue">Analytics</span></> : <>Placement <span className="text-custom-blue">Analytics</span></>}
              </h1>
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
                  {getDeptOptions(selectedCourse).map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
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

export default InsightDashboard;