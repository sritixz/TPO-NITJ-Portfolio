import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  Tag,
  ClipboardList,
} from "lucide-react";
import ViewJAF from "./viewjaf";
import Notification from "./Notification";

const JAF = () => {
  // Balanced state hooks with clean defensive structures mapped to both key standards
  const [JAFProfiles, setJAFProfiles] = useState({
    approved: [],
    notApproved: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJAF, setSelectedJAF] = useState(null);

  const handleBack = () => {
    setSelectedJAF(null); 
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      " " +
      date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    );
  };

  useEffect(() => {
    const fetchJAFProfiles = async () => {
      try {
        setError("");
        

        const response = await axios.get(
          `${import.meta.env.REACT_APP_BASE_URL}/jaf/get`,
          { withCredentials: true }
        );
 
        const fetchedData = response.data || {};
        setJAFProfiles({
          approved: fetchedData.approved || fetchedData.approved_jaf || [],
          notApproved: fetchedData.notApproved || fetchedData.notApproved_jaf || [],
        });
 
      } catch (err) {
        console.error("Axios capture trace exception:", err);
        setError(err.response?.data?.error || err.response?.data?.message || "Failed to fetch jaf profiles.");
      } finally {
        setLoading(false);
      }
    };

    fetchJAFProfiles();
  }, []);

  const handleApprove = async (jafId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to approve this JAF?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, approve it!",
      cancelButtonText: "Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        
        await axios.put(
          `${import.meta.env.REACT_APP_BASE_URL}/jaf/approvejaf/${jafId}`,
          {},
          { withCredentials: true }
        );
        Swal.fire("Approved!", "The JAF has been approved and recruiter account provisioned.", "success");
        
        setJAFProfiles((prev) => {
          const targetedForm = prev.notApproved.find((jaf) => jaf._id === jafId);
          return {
            ...prev,
            notApproved: prev.notApproved.filter((jaf) => jaf._id !== jafId),
            approved: targetedForm ? [...prev.approved, { ...targetedForm, approved_status: true }] : prev.approved,
          };
        });
      } catch (err) {
        Swal.fire("Error", err.response?.data?.message || "Failed to approve the JAF.", "error");
      }
    }
  };

  const handleReject = async (jafId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to reject this JAF?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reject it!",
      cancelButtonText: "Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(
          `${import.meta.env.REACT_APP_BASE_URL}/jaf/rejectjaf/${jafId}`,
          { withCredentials: true }
        );
        Swal.fire("Rejected!", "The JAF has been rejected.", "success");
        setJAFProfiles((prev) => ({
          ...prev,
          notApproved: prev.notApproved.filter((jaf) => jaf._id !== jafId),
        }));
      } catch (err) {
        Swal.fire("Error", "Failed to reject the JAF.", "error");
      }
    }
  };

  const JAFCard = ({ jaf, showActions }) => {
    if (!jaf) return null;
    return (
      <Card className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-5">
        <CardHeader className="flex items-center space-x-4 pb-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-100">
            {jaf.company_logo ? (
              <img src={jaf.company_logo} className="w-14 h-14 object-contain" alt="Logo" />
            ) : (
              <span className="text-xl font-bold text-custom-blue">
                {jaf.organizationName?.[0]?.toUpperCase() || "N"}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {jaf.organizationName}
            </h3>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 text-sm text-gray-700">
          {jaf.category && (
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-custom-blue" />
              <span>Category: {jaf.category}</span>
            </div>
          )}
          {jaf.sector && (
            <div className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-custom-blue" />
              <span>Sector: {jaf.sector}</span>
            </div>
          )}
          {jaf.placementType && (
            <div className="flex items-center space-x-2">
              <ClipboardList className="w-4 h-4 text-custom-blue" />
              <span>
                Placement Type:{" "}
                {Array.isArray(jaf.placementType)
                  ? jaf.placementType.join(" + ")
                  : jaf.placementType}
              </span>
            </div>
          )}
          {jaf.specificLocations && jaf.specificLocations.length > 0 && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-custom-blue" />
              <span>
                Location:{" "}
                {Array.isArray(jaf.specificLocations)
                  ? jaf.specificLocations.join(", ")
                  : jaf.specificLocations}
              </span>
            </div>
          )}
          {jaf.summerInternshipOpportunities !== undefined && (
            <div className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-custom-blue" />
              <span>
                Summer Internship:{" "}
                {jaf.summerInternshipOpportunities ? "Available" : "Not Available"}
              </span>
            </div>
          )}
          {jaf.createdAt && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-custom-blue" />
              <span>Posted: {formatDateTime(jaf.createdAt)}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 pt-4">
          {showActions && (
            <div className="flex space-x-2 w-full">
              <button
                className="flex-1 bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors font-medium"
                onClick={() => handleApprove(jaf._id)}
              >
                Approve
              </button>
              <button
                className="flex-1 bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors font-medium"
                onClick={() => handleReject(jaf._id)}
              >
                Reject
              </button>
            </div>
          )}
          <button
            className="w-full bg-custom-blue text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors font-medium"
            onClick={() => setSelectedJAF(jaf)}
          >
            View Details
          </button>
        </CardFooter>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center bg-red-50 p-6 rounded-2xl border border-red-100 max-w-md shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Fetch Error Encountered</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
          >
            Retry Connection Link
          </button>
        </div>
      </div>
    );
  }

  // Safe reference lengths using clean defensive routing gates
  const approvedLength = JAFProfiles?.approved?.length || 0;
  const pendingLength = JAFProfiles?.notApproved?.length || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {selectedJAF ? (
        <ViewJAF jaf={selectedJAF} onClose={handleBack}/>
      ) : (
        <>
          {/* Synchronized Headline with custom matching styles */}
          <h1 className="text-4xl font-bold text-center mb-8 tracking-wide text-gray-800">
            JAF <span className="text-custom-blue">Dashboard</span>
          </h1>

          <Tabs defaultValue="approved" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 space-x-4 bg-transparent h-auto p-0">
              <TabsTrigger
                value="approved"
                className="data-[state=active]:bg-custom-blue data-[state=active]:text-white bg-gray-200 text-gray-700 rounded-3xl py-2.5 font-semibold transition-all shadow-sm"
              >
                Approved JAFs ({approvedLength})
              </TabsTrigger>
              <TabsTrigger
                value="not-approved"
                className="data-[state=active]:bg-custom-blue data-[state=active]:text-white bg-gray-200 text-gray-700 rounded-3xl py-2.5 font-semibold transition-all shadow-sm"
              >
                Pending Approval ({pendingLength})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="approved" className="mt-0 focus-visible:outline-none">
              {approvedLength > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {JAFProfiles.approved.map((jaf) => (
                    jaf && <JAFCard key={jaf._id} jaf={jaf} showActions={false} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400 bg-white border border-dashed rounded-2xl">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-40 text-custom-blue" />
                  <p className="font-medium">No approved JAF profiles found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="not-approved" className="mt-0 focus-visible:outline-none">
              {pendingLength > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {JAFProfiles.notApproved.map((jaf) => (
                    jaf && <JAFCard key={jaf._id} jaf={jaf} showActions={true} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400 bg-white border border-dashed rounded-2xl">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-40 text-custom-blue" />
                  <p className="font-medium">No JAFs currently pending approval</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
      <Notification/>
    </div>
  );
};

export default JAF;