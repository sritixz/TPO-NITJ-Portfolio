import React from "react";
import { logout } from "../Redux/authSlice";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useState } from "react";
import Navbar from "./Navbar/Navbar";

const Header = () => {
  const { authUser, userData } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.REACT_APP_BASE_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
      dispatch(logout());
      toast.success("Logout successful!");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed!");
      console.error("Error during logout:", error.response?.data || error);
    }
  };
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Function to show the search page when search is submitted
  function showSearchPage(event) {
    event.preventDefault();
    document.getElementById("search_page").classList.remove("hidden");
  }

  return (
<>
<Navbar/> 
</>
  );
};

export default Header;
