

import React, { useState , useEffect} from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
const Input = ({ label, required, ...props }) => (
  <div>
    <label className="block text-sm text-gray-600 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      {...props}
      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-custom-blue"
      required={required}
    />
  </div>
);
const OfferUpload = () => {
  const { userData } = useSelector((state) => state.auth);
const [offerId, setOfferId] = useState(null);
const [deadline, setDeadline] = useState(null);
 const [formData, setFormData] = useState({
  totalOffers: "",
  acceptedCompany: "",
    linkedin: "",
  offerLetter: null
});

const [loading, setLoading] = useState(false);

if (!userData) return null;

const handleEdit = async (id) => {
await axios.put(
  `${import.meta.env.VITE_BASE_URL}/api/offer/update/${id}`,
  formData,
  { withCredentials: true }
);
}
const handleChange = (e) => {
  const { name, value, files } = e.target;

  if (name === "offerLetter") {
    setFormData((prev) => ({
      ...prev,
      offerLetter: files[0]
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  }
};
useEffect(() => {
  const fetchMyOffer = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.REACT_APP_BASE_URL}/api/offer/my`,
        { withCredentials: true }
      );

      if (res.data) {
        setOfferId(res.data._id);

        setFormData({
          totalOffers: res.data.totalOffers || "",
          acceptedCompany: res.data.acceptedCompany || "",
          linkedin: res.data.linkedin || "",
          offerLetter: null
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  fetchMyOffer();
}, []);
useEffect(() => {
  const fetchDeadline = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.REACT_APP_BASE_URL}/api/offer/deadline/OfferLetter`,
        { withCredentials: true }
      );
 if (res.data.deadline) {
        // ⚠️ IMPORTANT: convert to datetime-local format
        const formatted = new Date(res.data.deadline)
          .toISOString()
          .slice(0, 16);
console.log("Fetched deadline:", res.data.deadline, "Formatted:", formatted);
        setDeadline(formatted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  fetchDeadline();
}, []);
const isDeadlinePassed = deadline
  ? new Date() > new Date(deadline)
  : false;
// const handleSubmit = async (e) => {
//   e.preventDefault();

//   if (loading) return;

//   // basic validation
//   if (!formData.totalOffers || !formData.acceptedCompany || !formData.offerLetter || !formData.linkedin) {
//     toast.error("Fill all fields properly");
//     return;
//   }

//   try {
//     setLoading(true);

//     const data = new FormData();
//     data.append("totalOffers", formData.totalOffers);
//     data.append("acceptedCompany", formData.acceptedCompany);
//     data.append("offerLetter", formData.offerLetter);
//     data.append("linkedin", formData.linkedin);

//     const res = await axios.post(
//       `${import.meta.env.REACT_APP_BASE_URL}/api/offer/submit`,
//       data,
//       {
//         withCredentials: true
//       }
//     );

//     // console.log(" Response:", res.data);

//     toast.success("Offer submitted successfully ");

//     // reset form
//     setFormData({
//       totalOffers: "",
//       acceptedCompany: "",
//        linkedin: "", 
//       offerLetter: null
//     });

//   } catch (err) {
//     console.error("Error:", err.response || err);

//     toast.error(
//       err?.response?.data?.message || "Something went wrong"
//     );
//   } finally {
//     setLoading(false);
//   }
// };


  // console.log(" formData:", formData);
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (loading) return;

  if (!formData.totalOffers || !formData.acceptedCompany || !formData.linkedin) {
    toast.error("Fill all fields properly");
    return;
  }

  if (isDeadlinePassed) {
    toast.error("Deadline has passed");
    return;
  }

  try {
    setLoading(true);

    const data = new FormData();
    data.append("totalOffers", formData.totalOffers);
    data.append("acceptedCompany", formData.acceptedCompany);
    data.append("linkedin", formData.linkedin);

    if (formData.offerLetter) {
      data.append("offerLetter", formData.offerLetter);
    }

    if (offerId) {
      // 🔄 UPDATE
      await axios.put(
        `${import.meta.env.REACT_APP_BASE_URL}/api/offer/update/${offerId}`,
        data,
        { withCredentials: true }
      );

      toast.success("Updated ");

    } else {
      // 🆕 CREATE
      await axios.post(
        `${import.meta.env.REACT_APP_BASE_URL}/api/offer/submit`,
        data,
        { withCredentials: true }
      );

      toast.success(" Submitted ");
    }

  } catch (err) {
    console.error(err);
    toast.error("Something went wrong");
  } finally {
    setLoading(false);
  }
};
  
  return (
    <form onSubmit={handleSubmit}>
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6">Upload Offer Letter</h2>
      {deadline && (
  <div
    className={`mb-4 p-3 rounded ${
      isDeadlinePassed
        ? "bg-red-100 text-red-700"
        : "bg-green-100 text-green-700"
    }`}
  >
    <strong>Deadline:</strong>{" "}
    {new Date(deadline).toLocaleString()}
    {isDeadlinePassed && (
      <span className="ml-2 font-semibold">
        (Deadline Passed ❌)
      </span>
    )}
  </div>
)}
{offerId && (
  <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
    You have already submitted your offer. You can edit and update it.
  </div>
)}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Input label="Name" value={userData.name} disabled />
        <Input label="Roll No" value={userData.rollno} disabled />
        <Input label="Department" value={userData.department} disabled />
        <Input label="Batch" value={userData.batch} disabled />
        <Input label="Course" value={userData.course} disabled />
      
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
     <Input
  label="Total Offers"
  type="number"
  name="totalOffers"
  value={formData.totalOffers}
  onChange={handleChange}
  required
/>
     <Input
  label="LinkedIn"
  name="linkedin"
  value={formData.linkedin}
  onChange={handleChange}
  required

/>

<Input
  label="Accepted Company Name"
  name="acceptedCompany"
  value={formData.acceptedCompany}
  onChange={handleChange}
  required
/>
      </div>
     <div className="mb-4">
  <label className="block text-sm text-gray-600 mb-1">
    Offer Letter <span className="text-red-500">*</span>
  </label>

  <input
    type="file"
    name="offerLetter"
    accept="application/pdf"
    onChange={handleChange}
    required
    className="w-full border border-gray-300 rounded-lg p-2"
  />

  {/* 👇 THIS LINE DOES THE JOB */}
  <p className="text-xs text-gray-500 mt-1">
    Only PDF files are allowed
  </p>
</div>
<button
  type="submit"
  disabled={isDeadlinePassed}
  className={`mt-4 px-4 py-2 rounded text-white ${
    isDeadlinePassed
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-blue-600"
  }`}
>
  {offerId ? "Update  " : "Submit"}
</button>

    </div>
      </form>
  );
};

export default OfferUpload;