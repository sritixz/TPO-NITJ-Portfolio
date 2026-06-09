import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../Redux/authSlice.jsx";
import toast from "react-hot-toast";
import axios from "axios";
import { 
  faHome, 
  faChartBar, 
  faCalendarAlt, 
  faFileAlt, 
  faEnvelope,
  faBriefcaseClock
} from "@fortawesome/free-solid-svg-icons";
import { LogOut, Menu, X } from "lucide-react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";

// Standard Assets
import NITJlogo from "../assets/nitj-logo.png";
import ProfileImage from "../assets/chillguy.png";

// Components
import InsightDashboard from "../components/ProfessorDashboard/InsightDashboard.jsx";
import Fsuggestions from "../components/FacultyDashboard/Fsuggestions.jsx";
import PlacementRegistrationExportFaculty from "../components/FacultyDashboard/placement-registration.jsx";
import ProfessorCalendar from "../components/StudentDashboard/placement-calendar.jsx";
import JobManagement from "../components/FacultyDashboard/fjobmanagement.jsx";


const Fdashboard = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { userData } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarExpanded(false);
      } else {
        setIsSidebarExpanded(true);
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.REACT_APP_BASE_URL}/auth/logout`, {}, { withCredentials: true });
      dispatch(logout());
      toast.success("Logout successful!");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed!");
    }
  };

  const menuItems = [
    { label: "Home", icon: faHome, path: "/fdashboard/home" },
    { label: "Placement Registration", icon: faFileAlt, path: "/fdashboard/placement-registration" },
    { label: "Placement Calendar", icon: faCalendarAlt, path: "/fdashboard/placement-calendar" },
    { label: "Suggestions", icon: faEnvelope, path: "/fdashboard/suggestions" },
    { label: "Job Management", icon: faBriefcaseClock, path: "/fdashboard/job-management" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-[60] h-16 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button 
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden text-gray-600"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Desktop Toggle */}
          <button 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg text-gray-600"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          <img src={NITJlogo} alt="NITJ Logo" className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0" />
          {/* FIX: "NITJ" now uses text-custom-blue class consistently */}
          <h1 className="font-bold text-lg md:text-xl whitespace-nowrap">
            TPO-<span className="text-custom-blue uppercase">NITJ</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 leading-none truncate max-w-[160px]">
              {userData?.name || "Faculty Member"}
            </p>
            <p className="text-[10px] text-custom-blue font-bold uppercase tracking-tighter mt-1">
              Faculty Portal
            </p>
          </div>
          <img 
            src={userData?.image || ProfileImage} 
            alt="User Profile" 
            className="w-9 h-9 rounded-full border-2 border-blue-100 object-cover flex-shrink-0" 
          />
        </div>
      </header>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className="flex flex-1 mt-16">
        {/* Sidebar Navigation */}
        <aside 
          className={`fixed left-0 h-[calc(100vh-64px)] bg-white border-r border-gray-200 transition-all duration-300 z-50 
          ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"} 
          ${isSidebarExpanded ? "lg:w-64" : "lg:w-20"}`}
        >
          <nav className="p-3 flex flex-col h-full overflow-y-auto">
            <div className="space-y-1 flex-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center w-full p-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? "bg-custom-blue text-white shadow-md" 
                      : "text-gray-500 hover:bg-blue-50 hover:text-custom-blue"}`}
                  >
                    <div className="w-6 flex justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={item.icon} className="text-lg" />
                    </div>
                    {(isSidebarExpanded || isMobileOpen) && (
                      <span className="font-semibold text-sm ml-4 whitespace-nowrap overflow-hidden text-ellipsis">
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={handleLogout}
              className="mt-auto flex items-center w-full p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut size={20} className={`flex-shrink-0 ${(isSidebarExpanded || isMobileOpen) ? "mr-4" : "mx-auto"}`} />
              {(isSidebarExpanded || isMobileOpen) && (
                <span className="font-medium text-sm">Logout</span>
              )}
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main 
          className={`flex-1 min-h-full transition-all duration-300 p-3 sm:p-4 md:p-6 bg-gray-50
          ${isSidebarExpanded ? "lg:ml-64" : "lg:ml-20"} ml-0`}
        >
          <div className="max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="home" element={<InsightDashboard readOnly={true} />} />
              <Route path="placement-registration" element={<PlacementRegistrationExportFaculty readOnly={true} />} />
              <Route path="placement-calendar" element={<ProfessorCalendar />} />
              <Route path="suggestions" element={<Fsuggestions />} />
              <Route path="job-management" element={<JobManagement readOnly={true} />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Fdashboard;
