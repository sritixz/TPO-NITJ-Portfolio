import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function FinePayment() {
  const [formData, setFormData] = useState({
    companyName: "",
    fineAmount: "",
    category: "",
    receipt: null,
  });

  const categories = [
    "Not disciplined in OA",
    "Not disciplined in Interview",
    "Not disciplined in GD",
    "Any other unfair activity",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, receipt: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted:", formData);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Instructions */}
      <div className="bg-blue-50 border border-custom-blue p-6 rounded-xl mb-8">
        <h2 className="text-lg font-semibold mb-3 text-custom-blue">Important Instructions</h2>
        <ol className="list-decimal ml-6 space-y-2 text-gray-700">
          <li>First go to the payment link and pay your fine.</li>
          <li>Download the receipt after payment.</li>
          <li>Come back here and fill the form for payment confirmation.</li>
        </ol>
        <a
          href="https://dexpertsystems.com/welcome?mid=287"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 bg-custom-blue text-white px-5 py-2 rounded-md shadow hover:bg-blue-700"
        >
          Pay Fine Online
        </a>
      </div>

      {/* Form */}
      <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200 relative">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Fine Payment <span className="text-custom-blue">Confirmation</span></h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">Company Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter company name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">Fine Amount <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="fineAmount"
                value={formData.fineAmount}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter fine amount"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600">Category of Indisciplinary Action <span className="text-red-500">*</span></label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="" disabled>Select Category</option>
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600">Upload Payment Receipt</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-custom-blue hover:file:bg-blue-100"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-custom-blue text-white py-3 rounded-md font-semibold hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>

      {/* Link to View Submitted Fines */}
      <div className="text-center mt-8">
        <Link
          to="/fine/"
          className="text-blue-600 hover:text-blue-800 underline text-lg font-medium"
        >
          View Submitted Fines
        </Link>
      </div>
    </div>
  );
}