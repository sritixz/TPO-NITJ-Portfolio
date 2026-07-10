import React, { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import Editor from "./ckeditor";
import parse from "html-react-parser";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import BouncingLoader from "../BouncingLoader";
<<<<<<< HEAD
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
=======
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
>>>>>>> 95a9aacb050b56a2207ab2e65cacc9af1e91bbc2
import Notification from "../ProfessorDashboard/Notification";

const SharedExperience = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [currentUserExperiences, setCurrentUserExperiences] = useState([]);
  const [otherExperiences, setOtherExperiences] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("myExperiences");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.REACT_APP_BASE_URL}/sharedexperience`,
          { withCredentials: true }
        );
        setEligible(response.data.eligible || false);
        setCurrentUserExperiences(response.data.currentUserExperiences || []);
        setOtherExperiences(response.data.otherExperiences || []);
      } catch (err) {
        setError(err.message || "Failed to load experiences.");
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  const handleDelete = async (experience) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `${import.meta.env.REACT_APP_BASE_URL}/sharedexperience/${
              experience._id
            }`,
            { withCredentials: true }
          );
          setCurrentUserExperiences((prev) =>
            prev.filter((exp) => exp._id !== experience._id)
          );
          toast.success("Experience deleted successfully!");
        } catch (err) {
          toast.error(err.message || "Failed to delete experience.");
        }
      }
    });
  };

  const handleViewDetails = (experience) => {
    setSelectedExperience(experience);
  };

  const handleBack = () => {
    setSelectedExperience(null);
  };

  const filterExperiences = (experiences) => {
    if (!searchQuery.trim()) return experiences;
    const query = searchQuery.toLowerCase();
    return experiences.filter(
      (exp) =>
        exp.title?.toLowerCase().includes(query) ||
        exp.author?.name?.toLowerCase().includes(query)
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
    </div>
  );

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <Editor
        experience={selectedExperience}
        editing={true}
        onClose={() => {
          setIsEditing(false);
          setSelectedExperience(null);
        }}
      />
    );
  }

  if (showEditor) {
    return (
      <Editor
        experience={selectedExperience}
        onClose={() => {
          setShowEditor(false);
          setSelectedExperience(null);
        }}
      />
    );
  }

  if (selectedExperience) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-500 hover:text-blue-700 mb-4"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-4xl font-bold mb-4">
          {selectedExperience.title || "Untitled Experience"}
        </h1>
        <p className="text-black mb-1 mt-4">
          By: {selectedExperience.author?.name || "Anonymous"}
        </p>
        <p className="text-gray-600 mb-6">
          {new Date(selectedExperience.createdAt).toLocaleDateString(
            undefined,
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            }
          )}
        </p>
       <div className="prose max-w-none text-black text-[18px] leading-relaxed list-disc marker:text-black">
        {parse(selectedExperience.content)}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex justify-between items-center flex-col lg:flex-row p-4 rounded-t-lg ">
        <h2 className="text-3xl font-bold text-custom-blue capitalize">
          <span className="text-black">
            {activeTab === "myExperiences" ? "My" : "Other"}
          </span>{" "}
          Experiences
        </h2>

        <div className="flex border border-gray-300 rounded-3xl lg:mt-0 bg-white mt-10">
          {/* Active Tab Heading */}
          <button
            className={`px-4 py-2 rounded-3xl ${
              activeTab === "myExperiences"
                ? "bg-custom-blue text-white"
                : "bg-white"
            }`}
            onClick={() => setActiveTab("myExperiences")}
          >
            My Experiences
          </button>
          <button
            className={`px-4 py-2 rounded-3xl ${
              activeTab === "otherExperiences"
                ? "bg-custom-blue text-white"
                : "bg-white"
            }`}
            onClick={() => setActiveTab("otherExperiences")}
          >
            Other Experiences
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6 flex items-center">
          <div className="relative w-full max-w-md">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              Clear
            </button>
          )}
        </div>

        {/* My Experiences Tab */}
        {activeTab === "myExperiences" && (
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* {eligible && ( */}
                <div
                  onClick={() => setShowEditor(true)}
                  className="bg-custom-blue border-dashed border-4 border-gray-300 rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:shadow-2xl transition-transform hover:scale-105 duration-300 text-white text-6xl p-5 h-auto w-56"
                >
                  <FaPlus />
                </div>
              {/* )} */}
<<<<<<< HEAD
              {filterExperiences(currentUserExperiences).map((experience) => (
=======
              {currentUserExperiences.map((experience) => (
>>>>>>> 95a9aacb050b56a2207ab2e65cacc9af1e91bbc2
                <div
                  key={experience._id}
                  className=" border border-gray-200 rounded-xl shadow-md hover:shadow-2xl transition-transform hover:scale-105 hover:border-blue-500 duration-300 cursor-pointer overflow-hidden p-4 flex flex-col  items-center justify-between text-center h-auto w-auto"
                  onClick={() => handleViewDetails(experience)}
                >
                  <h4 className="text-lg font-semibold text-gray-800 break-words w-full px-2">
                    {experience.title || "Untitled Experience"}
                  </h4>
                  <p className="text-sm text-gray-600 break-words px-2">
                    {new Date(experience.createdAt).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </p>
                  <div className="flex justify-center space-x-3 mt-2 w-full">
                    <button
                      className="bg-custom-blue text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition duration-300 shadow-md w-24 flex items-center justify-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExperience(experience);
                        setIsEditing(true);
                      }}
                    >
                      <FaEdit /> <span>Edit</span>
                    </button>
                    <button
                      className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition duration-300 shadow-md w-24 flex items-center justify-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(experience);
                      }}
                    >
                      <FaTrash /> <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {filterExperiences(currentUserExperiences).length === 0 && searchQuery && (
              <div className="text-center text-gray-500 py-8">
                <p className="text-lg">No experiences found matching "{searchQuery}"</p>
              </div>
            )}
          </section>
        )}

        {activeTab === "otherExperiences" && (
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filterExperiences(otherExperiences).map((experience) => (
                <div
                  key={experience._id}
                  className="bg-white border border-custom-blue rounded-xl shadow-md hover:shadow-lg transition-transform hover:scale-105 hover:border-blue-400 duration-300 cursor-pointer overflow-hidden py-4"
                  onClick={() => handleViewDetails(experience)}
                >
                  <h4 className="text-md font-medium text-gray-700 text-center px-4">
                    {experience.title || "Untitled Experience"}
                  </h4>
                  <div className="text-sm text-gray-600 text-center space-y-1 p-4">
                    <p>By: {experience.author.name || "Anonymous"}</p>
                    <p>
                      {new Date(experience.createdAt).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {filterExperiences(otherExperiences).length === 0 && searchQuery && (
              <div className="text-center text-gray-500 py-8">
                <p className="text-lg">No experiences found matching "{searchQuery}"</p>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
};

export default SharedExperience;
