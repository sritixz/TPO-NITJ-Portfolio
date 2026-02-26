import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../Redux/authSlice";
import toast from "react-hot-toast";
import axios from "axios";
import { 
  faHome, 
  faChartBar, 
  faCalendarAlt, 
  faFileAlt, 
  faEnvelope,
  faKey
} from "@fortawesome/free-solid-svg-icons";
import { LogOut, Menu, X } from "lucide-react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";

// Standard Assets
import NITJlogo from "../assets/nitj-logo.png";
import ProfileImage from "../assets/chillguy.png";

// Components
import InsightDashboard from "../components/ProfessorDashboard/InsightDashboard.jsx";
import PlacementCalendar from "../components/ProfessorDashboard/placement-calendar.jsx";
import PlacementRegistrationExport from "../components/ProfessorDashboard/registration-form.jsx";
import Fsuggestions from "../components/FacultyDashboard/Fsuggestions.jsx";
import ChangePasswordForm from "../components/changepass.jsx";

const Fdashboard = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const { userData } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle screen resizing for sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarExpanded(false);
      } else {
        setIsSidebarExpanded(true);
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
  { label: "Change Password", icon: faKey, path: "/fdashboard/change-pass" }, // Matches student path
];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      {/* Navbar Section */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
          >
            <Menu size={24} />
          </button>
          <img src={NITJlogo} alt="NITJ Logo" className="h-10 w-10" />
          <h1 className="font-bold text-xl hidden sm:block">
            TPO-<span className="text-custom-blue uppercase">NITJ</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-gray-800">{userData?.name || "Faculty Member"}</p>
            <p className="text-xs text-custom-blue font-medium uppercase tracking-wider">Faculty Portal</p>
          </div>
          <img 
            src={userData?.image || ProfileImage} 
            alt="User Profile" 
            className="w-10 h-10 rounded-full border-2 border-custom-blue p-0.5 object-cover" 
          />
        </div>
      </header>

      <div className="flex flex-1 mt-16">
        {/* Sidebar Navigation */}
        <aside 
          className={`fixed left-0 h-[calc(100vh-64px)] bg-white border-r border-gray-200 transition-all duration-300 z-40 
          ${isSidebarExpanded ? "w-64" : "w-20"}`}
        >
          <nav className="p-4 flex flex-col h-full">
            <div className="space-y-2 flex-1">
              {menuItems.map((item) => {
  const isActive = location.pathname === item.path;
  return (
    <button
      key={item.path}
      onClick={() => navigate(item.path)}
      className={`flex items-center w-full p-3.5 px-5 rounded-xl transition-all duration-200 mb-1
      ${isActive 
        ? "bg-custom-blue text-white shadow-md" 
        : "text-gray-500 hover:bg-blue-50 hover:text-custom-blue"}`}
    >
      <FontAwesomeIcon icon={item.icon} className="w-5 h-5 min-w-[20px]" />
      {isSidebarExpanded && (
        <span className="font-semibold text-[15px] ml-4 whitespace-nowrap">
          {item.label}
        </span>
      )}
    </button>
  );
})}
            </div>

            <button 
              onClick={handleLogout}
              className="mt-auto flex items-center w-full p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors group"
            >
              <LogOut size={20} className={`${isSidebarExpanded ? "mr-4" : "mx-auto"}`} />
              {isSidebarExpanded && <span className="font-medium text-sm">Logout</span>}
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main 
          className={`flex-1 min-h-full transition-all duration-300 p-6 bg-gray-50
          ${isSidebarExpanded ? "ml-64" : "ml-20"}`}
        >
          <div className="max-w-7xl mx-auto">
            <Routes>
  <Route path="home" element={<InsightDashboard readOnly={true} />} />
  <Route path="placement-registration" element={<PlacementRegistrationExport readOnly={true} />} />
  <Route path="placement-calendar" element={<PlacementCalendar readOnly={true} />} />
  <Route path="suggestions" element={<Fsuggestions />} />
  
  {/* New Route for Change Password */}
  <Route path="change-pass" element={<ChangePasswordForm />} /> 
</Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Fdashboard;