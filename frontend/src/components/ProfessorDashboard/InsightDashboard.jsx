import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import { TrendingUp, Users, DollarSign, Building, Award, Calendar, BarChart3, PieChart, IndianRupee } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const InsightDashboard = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('B.Tech');
  const [selectedBatch, setSelectedBatch] = useState('2026');

  const courses = ['B.Tech', 'M.Tech', 'MBA', 'M.Sc'];
  const batches = ['2025', '2026', '2027', '2028', '2029', '2030'];

  useEffect(() => {
    const fetchInsights = async () => {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
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
    labels: Object.keys(insights.placementsByDepartment || {}),
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
      ],
      borderRadius: 8,
      borderSkipped: false,
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
    labels: Object.keys(insights.genderDist || {}),
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
     <div className="bg-white shadow-sm border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Placement <span className="text-custom-blue">Analytics</span>
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Comprehensive placement insights across all programs
        </p>
      </div>

      {/* Combine both dropdowns in one flex */}
      <div className="flex items-center space-x-4">
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
          className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {courses.map((courseOption) => (
            <option key={courseOption} value={courseOption}>
              {courseOption}
            </option>
          ))}
        </select>

        <div className="bg-indigo-100 rounded-lg p-2">
          <BarChart3 className="text-indigo-600" size={24} />
        </div>
      </div>
    </div>
  </div>
</div>
    
 {insights?.noData?(
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
 ):(
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Placements"
            value={insights.totalPlacements || 0}
            subtitle={selectedCourse === 'ALL' ? 'All courses' : selectedCourse}
            color="indigo"
          />
           <StatCard
            icon={Users}
            title="Double Offers"
            value={insights.doublePlacements|| 0}
            subtitle="Per annum"
            color="red"
          />
           <StatCard
            icon={Users}
            title="Student Placed"
            value={insights.uniquePlacements || 0}
            subtitle="Per annum"
            color=""
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
            value={insights.highestCTC || 0}
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
            <Bar data={departmentBarData} options={chartOptions} />
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <ChartCard title="CTC Distribution" icon={PieChart}>
            <Doughnut data={ctcDoughnutData} options={chartOptions} />
          </ChartCard>

          <ChartCard title="Gender Distribution" icon={Users}>
            <Pie data={genderPieData} options={chartOptions} />
          </ChartCard>

          <ChartCard title="Top Companies (Offer Wise)" icon={Building}>
            <Bar data={topCompaniesBarData} options={chartOptions} />
          </ChartCard>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h4 className="font-semibold text-gray-800 mb-3">Job Type Distribution</h4>
            <div className="space-y-2">
              {Object.entries(insights.jobTypeDist || {}).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{type}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="font-semibold text-indigo-600">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h4 className="font-semibold text-gray-800 mb-3">Category Distribution</h4>
            <div className="space-y-2">
              {Object.entries(insights.categoryDist || {}).map(([category, count]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{category}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-semibold text-green-600">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h4 className="font-semibold text-gray-800 mb-3">Industry Sectors</h4>
            <div className="space-y-2">
              {Object.entries(insights.sectorDist || {}).map(([sector, count]) => (
                <div key={sector} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{sector}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="font-semibold text-orange-600">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>)}
    </div>
  );
};

export default InsightDashboard;