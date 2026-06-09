import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useLocation } from "react-router-dom";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./Redux/authSlice";
import Home from "./Pages/LandingPage";
import Login from "./Pages/Login";
import Forgotpassword from "./Pages/ForgotPassword";
import Placement from "./Pages/Placement";
import Internship from "./Pages/Internship";
import Recruiter from "./Pages/Recruiter";
import Sdashboard from "./Pages/Sdashboard";
import Rdashboard from "./Pages/Rdashboard";
import Pdashboard from "./Pages/Pdashboard";
import Fdashboard from "./Pages/Fdashboard"; // 1. ADDED FACULTY DASHBOARD IMPORT
import AdminDashboard from "./Pages/Admindashboard";
import Ddashboard from "./Pages/Ddashboard";
import Brochure from "./Pages/Brochure";
import Document from "./Pages/Documents";
import TeamPage from "./Pages/TeamPage";
import FAQ from "./Pages/Faqs";
import ErrorPage from "./Pages/ErrorPage";
import AssessmentAttemptPage from "./Pages/Mock-test";
import WhyRecruitPage from "./Pages/WhyRecruitPage";
import Placementstatistics from "./Pages/Placementstatistic";
// import InternshipStatistics from "./Pages/InternshipStatistics"; 
import FeedbackForm from "./Pages/companyFeedbackForm";

import OutsourceInternshipPage from "./components/outsource-studentDashboard/home";
import LTE2MonthForm from "./components/outsource-studentDashboard/lte2monthform";
import GTE3MonthForm from "./components/outsource-studentDashboard/gte3monthform";
import SignupFlow from "./components/outsource-studentDashboard/signup";
import LoginOutsider from "./components/outsource-studentDashboard/login";
import OutsourceStudentDashboard from "./components/outsource-studentDashboard/osdashboard";
import ForgotPassword from "./components/outsource-studentDashboard/ForgotPassword";
import JobAnnouncementForm from "./components/RecruiterDashboard/jaf";
import JobAnnouncementFormPublic from "./Pages/jafpublic";

const AppContent = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { authUser, userType } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const getDashboardPath = () => {
    if (authUser) {
      switch (userType) {
        case "Student":
          return "/sdashboard/home";
        case "Professor":
          return "/pdashboard/home";
        case "Faculty": // 2. ADDED REDIRECTION CASE
          return "/fdashboard/home";
        case "Recuiter":
          return "/rdashboard/home";
        case "Admin":
          return "/admindashboard/home";
        case "Department":
          return "/ddashboard/home";
        case "Outsider":
          return "/outsourceInternship/home";
        default:
          return "/";
      }
    }

    if (location.pathname.startsWith("/outsourceInternship")) {
      return `/outsourceInternship/login?redirect=${encodeURIComponent(
        location.pathname + location.search
      )}`;
    }

    return `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;
  };

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={authUser ? <Navigate to={getDashboardPath()} /> : <Home />}
        />
        <Route
          path="/login"
          element={
            authUser &&
            !new URLSearchParams(location.search).get("redirect") ? (
              <Navigate to={getDashboardPath()} replace={true} />
            ) : (
              <Login />
            )
          }
        />
        <Route path="/forgot-password" element={<Forgotpassword />} />
        <Route path="/placement-statistics" element={<Placementstatistics />} />
        {/* <Route path="/internship-statistics" element={<InternshipStatistics />} />  */}
        <Route path="/placements" element={<Placement />} />
        <Route path="/internships" element={<OutsourceInternshipPage />} />
        <Route path="/recruiter" element={<Recruiter />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/dev-team" element={<TeamPage />} />
        <Route path="/departmental-brochure" element={<Brochure />} />
        <Route path="/departmental-documents" element={<Document />} />
        <Route path="/whyrecruit" element={<WhyRecruitPage />} />
        <Route path="/recruiterFeedback" element={<FeedbackForm />} />
        <Route path="/jaf" element={<JobAnnouncementFormPublic />} />
        <Route
          path="/sdashboard/*"
          element={
            authUser && userType === "Student" ? (
              <Sdashboard />
            ) : (
              <Navigate to={getDashboardPath()} />
            )
          }
        />
        <Route
          path="/rdashboard/*"
          element={
            authUser && userType === "Recuiter" ? (
              <Rdashboard />
            ) : (
              <Navigate to={getDashboardPath()} />
            )
          }
        />
        <Route
          path="/fdashboard/*"
          element={
            authUser && userType === "Faculty" ? (
              <Fdashboard />
            ) : (
              <Navigate to={getDashboardPath()} />
            )
          }
        />
        <Route
          path="/pdashboard/*"
          element={
            authUser && userType === "Professor" ? (
              <Pdashboard />
            ) : (
              <Navigate to={getDashboardPath()} />
            )
          }
        />
        <Route
          path="/ddashboard/*"
          element={
            authUser && userType === "Department" ? (
              <Ddashboard />
            ) : (
              <Navigate to={getDashboardPath()} />
            )
          }
        />
        <Route
          path="/admindashboard/*"
          element={
            authUser && userType === "Admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to={getDashboardPath()} />
            )
          }
        />
         <Route
          path="/outsourceInternship/*"
          element={
            authUser && userType === "Outsider" ? (
              <OutsourceStudentDashboard />
            ) : (
              <Navigate to={getDashboardPath()} />
            )
          }
        />
        {/* <Route
          path="/sdashboard/assessment-attempt/:attemptId"
          element={
            authUser && userType === "Student" ? (
              <AssessmentAttemptPage />
            ) : (
              <Navigate to={getDashboardPath()} />
            )
          }
        /> */}
        <Route path="/error" element={<ErrorPage />} />
        <Route path="*" element={<ErrorPage />} />
        <Route path="/outsourceInternship/signup" element={<SignupFlow />} />
        <Route path="/outsourceInternship/login" element={<LoginOutsider />} />
        <Route path="/outsourceInternship/forgot-password" element={<ForgotPassword />} />
      </Routes>
      <Toaster />
    </>
  );
};

// Main App component with Router
const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
