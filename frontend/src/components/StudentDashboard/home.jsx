import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import RecentPlacements from "./recentplacements";
import RecentInternship from "./recentinternship";
import RecentNotification from "./recentnotification";


const Home = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [internships, setInternships] = useState([]);


  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.REACT_APP_BASE_URL}/notification`,
        { withCredentials: true }
      );
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const recentplacements = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.REACT_APP_BASE_URL}/placements/last-seven-days`,
        { withCredentials: true }
      );
      setPlacements(response.data);
    } catch (error) {}
  };
  
  const recentinternship = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.REACT_APP_BASE_URL}/internships/last-seven-days`,
        { withCredentials: true }
      );
      setInternships(response.data);
    } catch (error) {
      console.error("Error fetching recent internships:", error);
    }
  };


  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    recentplacements();
  }, []);
  useEffect(() => {
    recentinternship();
  }, []);

  

  return (
    <div className="min-h-screen pt-8 bg-gray-50">
      <div className="max-w-7xl mx-auto font-sans">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <RecentNotification notifications={notifications} loading={loading} />
          <RecentPlacements placements={placements} loading={loading} />
          <RecentInternship internships={internships} loading={loading} />
        </div>
        
      </div>
    </div>
  );
};

export default Home;
