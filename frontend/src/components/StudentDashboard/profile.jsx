import React, { useEffect, useState, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "../../Redux/authSlice";
import toast from "react-hot-toast";
import BouncingLoader from "../BouncingLoader";
import { Linkedin } from "lucide-react";
import userIcon from "../../assets/user-icon.png";

function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [sendImage, setSendImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingPic, setIsUpdatingPic] = useState(false);

  const getImageUrl = () => {
    if (!user?.image) {
      return userIcon;
    }
    if (user.image.startsWith("http") || user.image.startsWith("blob:")) {
      return user.image;
    }
    return `${import.meta.env.REACT_APP_BASE_URL}${user.image}`;
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    rollno: "",
    department: "",
    batch: "",
    address: "",
    cgpa: "",
    gender: "",
    course: "",
    active_backlogs: "",
    backlogs_history: "",
    activeBacklogCount: "",
    placementstatus: "",
    internshipstatus: "",
    debarred: "",
    image: "",
    dob: "",
    personalEmail: "",
    Xth: "",
    XIIth: "",
    linkedin: "",
  });

  const fileInputRef = useRef(null);
  const { userData } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
<<<<<<< HEAD
    const loadProfile = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.REACT_APP_BASE_URL}/profile/get`,
          { withCredentials: true }
        );
        const profileUser = response.data.user || userData;
        setUser(profileUser);
        setFormData({
          name: profileUser.name ?? "",
          email: profileUser.email ?? "",
          phone: profileUser.phone ?? "",
          rollno: profileUser.rollno ?? "",
          department: profileUser.department ?? "",
          batch: profileUser.batch ?? "",
          address: profileUser.address ?? "",
          cgpa: profileUser.cgpa ?? "",
          gender: profileUser.gender ?? "",
          course: profileUser.course ?? "",
          debarred: profileUser.debarred ?? false,
          placementstatus: profileUser.placementstatus ?? "",
          internshipstatus: profileUser.internshipstatus ?? "",
          active_backlogs: profileUser.active_backlogs ?? false,
          backlogs_history: profileUser.backlogs_history ?? false,
          activeBacklogCount: profileUser.activeBacklogCount ?? "",
          image: profileUser.image ?? "",
          dob: profileUser.dob ?? "",
          personalEmail: profileUser.personalEmail ?? "",
          Xth: profileUser.Xth ?? "",
          XIIth: profileUser.XIIth ?? "",
          linkedin: profileUser.linkedin ?? "",
        });
        dispatch(
          setAuthUser({
            authUser: true,
            userData: profileUser,
            userType: "Student",
          })
        );
      } catch (err) {
        console.error(err);
        if (userData) {
          setUser(userData);
          setFormData({
            name: userData.name ?? "",
            email: userData.email ?? "",
            phone: userData.phone ?? "",
            rollno: userData.rollno ?? "",
            department: userData.department ?? "",
            batch: userData.batch ?? "",
            address: userData.address ?? "",
            cgpa: userData.cgpa ?? "",
            gender: userData.gender ?? "",
            course: userData.course ?? "",
            debarred: userData.debarred ?? false,
            placementstatus: userData.placementstatus ?? "",
            internshipstatus: userData.internshipstatus ?? "",
            active_backlogs: userData.active_backlogs ?? false,
            backlogs_history: userData.backlogs_history ?? false,
            activeBacklogCount: userData.activeBacklogCount ?? "",
            image: userData.image ?? "",
            dob: userData.dob ?? "",
            personalEmail: userData.personalEmail ?? "",
            Xth: userData.Xth ?? "",
            XIIth: userData.XIIth ?? "",
            linkedin: userData.linkedin ?? "",
          });
        } else {
          setError("Failed to fetch profile");
        }
      }
    };

    loadProfile();
  }, [dispatch, userData]);
=======
    if (userData) {
      setUser(userData);
      setFormData({
        name: userData.name ?? "",
        email: userData.email ?? "",
        phone: userData.phone ?? "",
        rollno: userData.rollno ?? "",
        department: userData.department ?? "",
        batch: userData.batch ?? "",
        address: userData.address ?? "",
        cgpa: userData.cgpa ?? "",
        gender: userData.gender ?? "",
        course: userData.course ?? "",
        debarred: userData.debarred ?? false,
        placementstatus: userData.placementstatus ?? "",
        internshipstatus: userData.internshipstatus ?? "",
        active_backlogs: userData.active_backlogs ?? false,
        backlogs_history: userData.backlogs_history ?? false,
        activeBacklogCount: userData.activeBacklogCount ?? "",
        image: userData.image ?? "",
        dob: userData.dob ?? "",
        personalEmail: userData.personalEmail ?? "",
        Xth: userData.Xth ?? "",
        XIIth: userData.XIIth ?? "",
        linkedin: userData.linkedin ?? "",
      });
    }
  }, [userData]);
>>>>>>> 95a9aacb050b56a2207ab2e65cacc9af1e91bbc2

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfilePicUpdateToggle = () => {
    setIsUpdatingPic(!isUpdatingPic);
    if (!isUpdatingPic) {
      setUser((prevUser) => ({
        ...prevUser,
        image: userData.image,
      }));
      setSendImage(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      setSendImage(selectedImage);
      const imageURL = URL.createObjectURL(selectedImage);
      setUser((prevUser) => ({
        ...prevUser,
        image: imageURL,
      }));
    }
  };

  const handleProfilePicSubmit = async (e) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    e.preventDefault();
    if (!sendImage) return;
    try {
      const form = new FormData();
      form.append("file", sendImage);
      const response = await toast.promise(
        axios.put(
          `${import.meta.env.REACT_APP_BASE_URL}/profile/update-picture`,
          form,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        ),
        {
          loading: "Updating profile picture...",
          success: "Profile picture updated successfully!",
          error: "Failed to update profile picture",
        }
      );
      setUser((prevUser) => ({
        ...prevUser,
        image: response.data.student.image,
      }));
      setIsUpdatingPic(false);
      setSendImage(null);
      dispatch(
        setAuthUser({
          authUser: true,
          userData: response.data.student,
          userType: "Student",
        })
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update profile picture");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    e.preventDefault();
    try {
      const response = await toast.promise(
        axios.put(
          `${import.meta.env.REACT_APP_BASE_URL}/profile/update`,
          formData,
          { withCredentials: true }
        ),
        {
          loading: "Updating profile...",
          success: "Profile updated successfully!",
          error: "Failed to update profile",
        }
      );
      setUser({ ...user, ...formData });
      setIsEditing(false);
      dispatch(
        setAuthUser({
          authUser: true,
          userData: response.data.user,
          userType: "Student",
        })
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
    setIsUpdatingPic(!isUpdatingPic);
  };

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }
  if (!user) {
    return <BouncingLoader size="medium" text="Loading..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 mt-1">
      <div className="shadow rounded-3xl overflow-hidden w-full max-w-6xl border-2 border-custom-blue">
        {/* Cover Section */}
        <div className="relative bg-gradient-to-r from-custom-blue to-custom-blue bg-cover bg-no-repeat h-40">
          <div className="absolute inset-0 opacity-50"></div>
        </div>
        {/* Profile Section */}
        <div className="relative -mt-24 text-center">
          <button onClick={triggerFileInput}>
            <img
              src={getImageUrl()}
              alt="Profile"
              className="w-40 h-40 rounded-full mx-auto border-4 border-custom-blue object-cover"
            />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          {sendImage && (
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={handleProfilePicSubmit}
                disabled={isSubmitting}
                className="bg-green-500 text-white px-4 py-1 border border-green-400 rounded hover:bg-green-600 transition"
              >
                {isSubmitting ? "Uploading..." : "Upload"}
              </button>
              <button
                onClick={handleProfilePicUpdateToggle}
                className="bg-red-500 text-white px-4 py-1 border border-red-400 rounded hover:bg-red-600 transition"
              >
                Cancel
              </button>
            </div>
          )}
          {isEditing ? (
            <div className="mt-6 px-4">
              <h4 className="text-2xl font-semibold text-custom-blue mb-4">
                {" "}
                Edit Profile{" "}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Row 1 */}
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  className="p-2 border border-custom-blue rounded focus:outline-none focus:border-custom-blue-dark"
                />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                  className="p-2 border border-custom-blue rounded focus:outline-none focus:border-custom-blue-dark"
                />
                {/* Row 2 */}
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="p-2 border border-custom-blue rounded focus:outline-none focus:border-custom-blue-dark"
                />
                <input
                  type="email"
                  name="personalEmail"
                  value={formData.personalEmail}
                  onChange={handleChange}
                  placeholder="Personal Email"
                  className="p-2 border border-custom-blue rounded focus:outline-none focus:border-custom-blue-dark"
                />
                {/* Row 3 */}
                <input
                  type="text"
                  name="Xth"
                  value={formData.Xth}
                  onChange={handleChange}
                  placeholder="10th Percentage (e.g. 92.4)"
                  className="p-2 border border-custom-blue rounded focus:outline-none focus:border-custom-blue-dark"
                />
                <input
                  type="text"
                  name="XIIth"
                  value={formData.XIIth}
                  onChange={handleChange}
                  placeholder="12th Percentage (e.g. 88.6)"
                  className="p-2 border border-custom-blue rounded focus:outline-none focus:border-custom-blue-dark"
                />
                {/* Row 4 */}
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="LinkedIn URL"
                  className="p-2 border border-custom-blue rounded focus:outline-none focus:border-custom-blue-dark col-span-1 md:col-span-2"
                />
                {/* Buttons */}
                <div className="col-span-1 md:col-span-2 flex gap-2 justify-center mt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-custom-blue text-white px-6 py-2 rounded hover:bg-custom-blue-dark transition"
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <h4 className="text-3xl font-semibold text-custom-blue">
                {" "}
                {user.name}{" "}
              </h4>
              <button
                onClick={handleEditToggle}
                className="bg-custom-blue text-white mt-5 px-6 py-2 border rounded hover:bg-custom-blue-dark transition"
              >
                {" "}
                Edit Profile{" "}
              </button>
            </div>
          )}
        </div>
        {/* About Section */}
        <div className="mt-8 px-6 py-4">
          <h5 className="mb-3 ml-4 font-bold text-custom-blue text-xl">About</h5>
          <div className="p-6 bg-white border border-neutral-400 rounded-3xl">
            <div className="flex flex-wrap gap-8">
              {/* Left Column */}
              <div className="flex-1 min-w-[280px] space-y-5">
                <AboutItem label="Name" value={formData.name} />
                <AboutItem label="Gender" value={formData.gender} />
                <AboutItem label="DOB" value={formData.dob || "—"} />
                <AboutItem label="Email" value={formData.email} />
                <AboutItem label="Personal Email" value={formData.personalEmail} />
                <AboutItem label="Mobile" value={formData.phone} />
                <AboutItem label="Batch" value={formData.batch} />
                <AboutItem label="Course" value={formData.course} />
                <AboutItem label="Branch" value={formData.department} />
              </div>
              {/* Right Column */}
              <div className="flex-1 min-w-[280px] space-y-5">
                <AboutItem label="CGPA" value={formData.cgpa} />
                <AboutItem label="10th %" value={formData.Xth} />
                <AboutItem label="12th %" value={formData.XIIth} />
                <AboutItem
                  label="Active Backlogs"
                  value={formData.active_backlogs ? "Yes" : "No"}
                />
                <AboutItem
                  label="Backlogs History"
                  value={formData.backlogs_history ? "Yes" : "No"}
                />
                <AboutItem
                  label="Active Backlog Count"
                  value={formData.activeBacklogCount}
                />
                <AboutItem
<<<<<<< HEAD
                  label="Applied Count"
                  value={user?.appliedCount ?? 0}
                />
                <AboutItem
                  label="Dream Applied"
                  value={user?.dreamApplied ? "Yes" : "No"}
                />
                <AboutItem
=======
>>>>>>> 95a9aacb050b56a2207ab2e65cacc9af1e91bbc2
                  label="Debarred"
                  value={formData.debarred ? "Yes" : "No"}
                />
                <AboutItem
                  label="LinkedIn"
                  value={
                    formData.linkedin ? (
                      <a
                        href={formData.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center text-custom-blue hover:text-custom-blue-dark"
                        title="View LinkedIn Profile"
                      >
                        <Linkedin size={20} />
                      </a>
                    ) : (
                      "Not provided"
                    )
                  }
                />
                <AboutItem label="Address" value={formData.address} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable component for clean About section
const AboutItem = ({ label, value }) => (
  <div className="flex items-center">
    {/* Icon */}
    <div className="text-white mx-4 bg-custom-blue h-10 w-10 p-2 flex justify-center items-center rounded-full flex-shrink-0">
      <CheckCircle2 size={20} />
    </div>
    {/* Label + Value */}
    <div className="flex items-center flex-wrap gap-1">
      <span className="font-semibold text-custom-blue">{label}:</span>
      {typeof value === "string" || typeof value === "number" ? (
        <span className="font-medium text-gray-700 break-all">{value}</span>
      ) : (
        <div className="font-medium text-gray-700 flex items-center">{value}</div>
      )}
    </div>
  </div>
);

export default Profile;