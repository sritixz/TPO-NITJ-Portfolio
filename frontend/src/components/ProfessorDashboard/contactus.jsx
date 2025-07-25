import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Notification from "./Notification";
import { Trash2 } from 'lucide-react';

const ContactRequests = () => {
  const [contactForms, setContactForms] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactForms = async () => {
      try {
        const response = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/contactus/get`, {
          withCredentials: true,
        });
        setContactForms(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching contact forms:', error);
        setLoading(false);
      }
    };

    fetchContactForms();
  }, []);

  const handleDelete = async (department, formId) => {
    try {
      await axios.delete(`${import.meta.env.REACT_APP_BASE_URL}/contactus/delete/${formId}`, {
        withCredentials: true,
      });
      // Update state to remove deleted form instantly
      setContactForms(prevForms => {
        const updatedForms = { ...prevForms };
        updatedForms[department] = updatedForms[department].filter(form => form._id !== formId);
        // Remove department if no forms remain
        if (updatedForms[department].length === 0) {
          delete updatedForms[department];
        }
        return updatedForms;
      });
    } catch (error) {
      console.error('Error deleting contact form:', error);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
    </div>
  );

  return (
    <section className="py-12 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold sm:text-4xl lg:text-4xl text-center mb-12">
          User <span className="text-custom-blue">Requests</span>
        </h1>

        {Object.keys(contactForms).map((department) => (
          <div key={department} className="mb-8">
            <h3 className="text-2xl font-semibold mb-4 capitalize">{department}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {contactForms[department].map((form) => (
                <div
                  key={form._id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 relative"
                >
                  <button
                    onClick={() => handleDelete(department, form._id)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition-colors duration-200"
                    aria-label="Delete contact form"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <h4 className="text-lg font-semibold text-gray-800">{form.name}</h4>
                  <p className="text-sm text-gray-600 mt-2">{form.email}</p>
                  {form.phone && <p className="text-sm text-gray-600 mt-1">{form.phone}</p>}
                  <p className="text-sm text-gray-600 mt-2 break-words overflow-auto max-h-40 whitespace-pre-line">
                    {form.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-4">
                    Submitted on: {new Date(form.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Notification/>
    </section>
  );
};

export default ContactRequests;