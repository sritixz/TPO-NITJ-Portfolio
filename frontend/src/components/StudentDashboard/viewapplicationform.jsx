import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Loader2, FileText, X, Download} from "lucide-react";

const StudentSubmission = ({ jobId, onHide }) => {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.REACT_APP_BASE_URL}/api/get-already/${jobId}`,
          { withCredentials: true }
        );

        console.log("API Response:", response.data);
        setSubmission(response.data || null);
      } catch (err) {
        setError("Failed to load submission");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) fetchSubmission();
  }, [jobId]);

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-40 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
        <p className="text-gray-600 text-sm">Loading your submission...</p>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
          <X className="h-6 w-6 text-red-600" />
        </div>
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );

  if (!submission)
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Submission Found</h3>
        <p className="text-gray-500">You haven't submitted an application for this position yet.</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with close button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Application</h2>
          <p className="text-gray-600 mt-1">Review your submitted information</p>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200" 
          onClick={onHide}
        >
          <X className="h-5 w-5" />
          <span className="hidden sm:inline">Close</span>
        </button>
      </div>

      <Card className="shadow-lg border-0 bg-white overflow-hidden">
        <CardHeader className="bg-custom-blue text-white">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="bg-white/10 p-2 rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            Application Details
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {/* Submission Fields */}
          <div className="grid gap-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
            <div className="grid gap-4">
              {submission.fields?.map((field, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-150">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm uppercase tracking-wide">
                          {field.fieldName}
                        </p>
                        <p className="text-gray-700 mt-1 break-words">
                          {field.value || <span className="text-gray-400 italic">Not provided</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resume Section */}
          {submission.resumeUrl && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Attached Resume</h3>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FileText className="h-6 w-6 text-custom-blue" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Resume Document</h4>
                      <p className="text-gray-600 text-sm">Click to view your uploaded resume</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={submission.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-custom-blue text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      <Download className="h-4 w-4" />
                      <span className="font-medium">View Resume</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default StudentSubmission;