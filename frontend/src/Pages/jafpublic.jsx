import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { Textarea } from "../components/ui/textarea";
import Swal from "sweetalert2";
import {
  Building2,
  GraduationCap,
  Briefcase,
  FileCheck,
  Contact,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

const JobAnnouncementFormPublic = () => {
  const [formData, setFormData] = useState({
    organizationName: "",
    websiteUrl: "",
    category: "",
    sector: "",
    placementType: [],
    bTechPrograms: [],
    mTechPrograms: [],
    mbaProgramSpecializations: [],
    scienceStreamsSpecializations: [],
    phdPrograms: [],
    requiredSkills: "",
    designations: [{ title: "", stipend: "", ctc: "" }],
    jobLocation: [],
    specificLocations: "",
    bond: "false",
    selectionProcess: [],
    additionalSelectionDetails: "",
    summerInternshipOpportunities: "false",
    hrContacts: [{ name: "", designation: "", email: "", phone: "" }],
    postalAddress: "",
    approved_status:false,
  });

    const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Email OTP verification state (tied to primary HR contact, hrContacts[0]) ---
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpError, setOtpError] = useState("");

  const isEmailVerified =
    verifiedEmail &&
    formData.hrContacts[0]?.email?.toLowerCase().trim() === verifiedEmail;

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOtp = async () => {
    const email = formData.hrContacts[0]?.email?.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid HR email first.");
      return;
    }
    setIsSendingOtp(true);
    setOtpError("");
    try {
      await axios.post(
        `${import.meta.env.REACT_APP_BASE_URL}/jaf/send-otp`,
        { email, organizationName: formData.organizationName },
        { withCredentials: true }
      );
      setOtpSent(true);
      setResendCooldown(45);
      toast.success("OTP sent to " + email);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const email = formData.hrContacts[0]?.email?.trim();
    if (!otpValue || otpValue.length !== 6) {
      setOtpError("Enter the 6-character OTP.");
      return;
    }
    setIsVerifyingOtp(true);
    setOtpError("");
    try {
      await axios.post(
        `${import.meta.env.REACT_APP_BASE_URL}/jaf/verify-otp`,
        { email, otp: otpValue },
        { withCredentials: true } // needed so the jafEmailVerified cookie gets set
      );
      setVerifiedEmail(email.toLowerCase().trim());
      toast.success("Email verified successfully!");
    } catch (error) {
      setOtpError(error?.response?.data?.message || "Invalid OTP, please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const resetEmailVerification = () => {
    setOtpSent(false);
    setOtpValue("");
    setVerifiedEmail("");
    setOtpError("");
    setResendCooldown(0);
  };


  const bTechPrograms = [
    { name: "Computer Science & Engineering", type: "Circuital" },
    { name: "Data Science & Engineering", type: "Circuital" },
    { name: "Electronics & Communication Engineering", type: "Circuital" },
    { name: "Instrumentation and Control Engineering", type: "Circuital" },
    { name: "Electronics & VLSI Engineering", type: "Circuital" },
    { name: "Electrical Engineering", type: "Circuital" },
    { name: "Information Technology", type: "Circuital" },
    { name: "Mathematics and Computing", type: "Circuital" },
    { name: "Biotechnology", type: "Non-Circuital" },
    { name: "Chemical Engineering", type: "Non-Circuital" },
    { name: "Civil Engineering", type: "Non-Circuital" },
    { name: "Industrial & Production Engineering", type: "Non-Circuital" },
    { name: "Mechanical Engineering", type: "Non-Circuital" },
    { name: "Textile Technology", type: "Non-Circuital" },
  ];

  const mTechPrograms = {
    circuital: [
      {
        name: "Computer Science & Engineering",
        specializations: [
          "Computer Science & Engineering",
          "Information Security",
          "Data Science and Engineering"
        ],
      },
      {
        name: "Electronics & Communication Engineering",
        specializations: [
          "Electronics & Communication Engineering",
          "VLSI Design",
        ],
      },
      {
        name: "Instrumentation & Control Engineering",
        specializations: ["Machine Intelligence and Automation", "Control and Instrumentation Engineering", "Signal Processing and Machine Learning"],
      },
      { name: "Artificial Intelligence", specializations: [] },
      { name: "Mathematics and Computing", specializations: [] },
      { name: "Electric Vehicle Design", specializations: [] },
      { name: "Data Analytics", specializations: [] },
      { name: "Power Systems and Reliability", specializations: [] },
    ],
    nonCircuital: [
      { name: "Biotechnology", specializations: [] },
      { name: "Chemical Engineering", specializations: [] },
      {
        name: "Civil Engineering",
        specializations: [
          "Structural and Construction Engineering",
          "Geotechnical -GEO-Environmental Engineering",
          "Geotechnical Engineering and Infrastructure Design",
        ],
      },
      {
        name: "Industrial & Production Engineering",
        specializations: ["Industrial Engineering and Data Analytics"],
      },
      {
        name: "Mechanical Engineering",
        specializations: ["Design Engineering", "Thermal and Energy Engineering"],
      },
      { name: "Renewable Energy", specializations: [] },
      { name: "Energy and Environmental Engineering", specializations: [] },
      { name: "Textile Engineering", specializations: ["Textile Engineering & Management", "Textile Technology"] },
    ],
  };

  const mbaSpecializations = ["Finance", "Marketing", "HR"];

  const scienceStreams = ["Physics", "Chemistry", "Mathematics"];

  const phdPrograms = [
    "Computer Science & Engineering",
    "Electronics & Communication Engineering",
    "Information Technology",
    "Electrical Engineering",
    "Instrumentation and Control Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Biotechnology",
    "Industrial and Production Engineering",
    "Textile Technology",
    "Humanities & Management",
    "Mathematics",
    "Physics",
    "Chemistry",
  ];

  const selectionProcess = [
    "Short Listing from resume / Database",
    "CGPA",
    "Aptitude test",
    "Technical test",
    "Group Discussion/Activity",
    "Personal Interview",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (field, value, checked) => {
    setFormData((prevState) => {
      const currentValues = prevState[field] || [];
      const newValues = checked
        ? [...new Set([...currentValues, value])]
        : currentValues.filter((item) => item !== value);

 
 
 
 

      return { ...prevState, [field]: newValues };
    });
  };

  const handleProgramCheckboxChange = (
    programType,
    programName,
    specialization,
    checked
  ) => {
    setFormData((prevData) => {
      const updatedPrograms = [...prevData[programType]];
  
      // Case 1: Handling specialization selection
      if (specialization) {
        if (checked) {
          // Add specialization if not already present
          if (!updatedPrograms.includes(specialization)) {
            updatedPrograms.push(specialization);
          }
        } else {
          // Remove specialization
          const index = updatedPrograms.indexOf(specialization);
          if (index > -1) {
            updatedPrograms.splice(index, 1);
          }
        }
      }
      // Case 2: Handling main program selection
      else {
        let program;
        if (programType === "mTechPrograms") {
          // Find the program in either circuital or non-circuital
          program =
            mTechPrograms.circuital.find((p) => p.name === programName) ||
            mTechPrograms.nonCircuital.find((p) => p.name === programName);
        }
  
        if (program && program.specializations.length > 0) {
          // Handle programs with specializations
          if (checked) {
            // Add all specializations if not already present
            program.specializations.forEach((spec) => {
              if (!updatedPrograms.includes(spec)) {
                updatedPrograms.push(spec);
              }
            });
          } else {
            // Remove all specializations
            program.specializations.forEach((spec) => {
              const index = updatedPrograms.indexOf(spec);
              if (index > -1) {
                updatedPrograms.splice(index, 1);
              }
            });
          }
        } else {
          // Handle programs without specializations
          if (checked && !updatedPrograms.includes(programName)) {
            updatedPrograms.push(programName);
          } else if (!checked) {
            const index = updatedPrograms.indexOf(programName);
            if (index > -1) {
              updatedPrograms.splice(index, 1);
            }
          }
        }
      }
  
      return {
        ...prevData,
        [programType]: updatedPrograms,
      };
    });
  };

  const addDesignation = () => {
    setFormData((prev) => ({
      ...prev,
      designations: [...prev.designations, { title: "", stipend: "", ctc: "" }],
    }));
  };

  const updateDesignation = (index, field, value) => {
    const newDesignations = [...formData.designations];
    newDesignations[index][field] = value;
    setFormData((prev) => ({ ...prev, designations: newDesignations }));
  };

  const removeDesignation = (index) => {
    const newDesignations = formData.designations.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, designations: newDesignations }));
  };

  const addHrContact = () => {
    setFormData((prev) => ({
      ...prev,
      hrContacts: [
        ...prev.hrContacts,
        { name: "", designation: "", email: "", phone: "" },
      ],
    }));
  };

  const updateHrContact = (index, field, value) => {
    const newContacts = [...formData.hrContacts];
    newContacts[index][field] = value;
    setFormData((prev) => ({ ...prev, hrContacts: newContacts }));

    // If the verified (primary) contact's email is edited, the old
    // verification no longer applies — force re-verification.
    if (index === 0 && field === "email" && verifiedEmail) {
      resetEmailVerification();
    }
  };

  const removeHrContact = (index) => {
    const newContacts = formData.hrContacts.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, hrContacts: newContacts }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // guards against double-clicks/double-submits

    if (!isEmailVerified) {
      toast.error("Please verify the primary HR contact's email (OTP) before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won’t be able to edit this in Future!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "green-300",
        cancelButtonColor: "#3085d",
        confirmButtonText: "Yes, submit it!",
      });

      if (!result.isConfirmed) {
        return; // handled in finally below
      }

      await axios.post(
        `${import.meta.env.REACT_APP_BASE_URL}/jaf/public-create`,
        formData,
        { withCredentials: true } // sends the jafEmailVerified cookie automatically
      );
      toast.success("JAF form submitted successfully😊");
    } catch (error) {
      const dbError = error?.response?.data?.error;
      toast.error(
        dbError 
          ? `Submission failed: ${dbError}` 
          : (error?.response?.data?.message || "Error in submitting JAF form")
      );
      console.error("Submission error:", error);
    } finally {
      // Always reset, whether the user cancelled, the request failed,
      // or it succeeded — this is what was leaving the button stuck
      // disabled (or letting a second click sneak through) before.
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6 space-y-8">
      <Card className="border-t-4 border-t-blue-600">
        <CardHeader className="text-center bg-gradient-to-b from-blue-50 to-white py-8">
          <img
            src="/nitj-logo.png"
            alt="NIT Logo"
            className="mx-auto w-24 h-24 mb-4"
          />
          <CardTitle className="text-3xl font-bold text-custom-blue">
            Dr. B R Ambedkar National Institute of Technology
          </CardTitle>
          <p className="text-gray-600">
            G T Road Bye Pass, Jalandhar-144008, Punjab
          </p>
          <h2 className="text-xl font-semibold mt-4 text-custom-blue">
            Job Announcement Form - 2026-27 Batch
          </h2>
        </CardHeader>

        <CardContent className="space-y-8 mt-8">
          {/* Recruiter Details Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-blue-700 border-b pb-2">
              <Building2 className="w-6 h-6 text-custom-blue" />
              <h3 className="text-custom-blue">Recruiter Details</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Organization Name*
                </label>
                <Input
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  placeholder="Enter organization name"
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Website URL*
                </label>
                <Input
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleInputChange}
                  placeholder="Enter website URL"
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Category*</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md border-gray-300"
                >
                  <option value="">Select Category</option>
                  <option value="Government">Government</option>
                  <option value="PSU">PSU</option>
                  <option value="Private">Private</option>
                  <option value="MNC">MNC</option>
                  <option value="Startup">Startup</option>
                  <option value="NGO">NGO</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Sector*</label>
                <select
                  name="sector"
                  value={formData.sector}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md border-gray-300"
                >
                  <option value="">Select Sector</option>
                  <option value="Core Engineering">Core Engineering</option>
                  <option value="IT">IT</option>
                  <option value="R&D">R&D</option>
                  <option value="Analytics">Analytics</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Networking">Networking</option>
                  <option value="Educational">Educational</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Interested in Participating*
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center">
                    <Checkbox
                      checked={formData.placementType.includes(
                        "Virtual Placement"
                      )}
                      onChange={(checked) =>
                        handleCheckboxChange(
                          "placementType",
                          "Virtual Placement",
                          checked === true
                        )
                      }
                    />
                    <span className="ml-2">Virtual Visit</span>
                  </label>
                  <label className="flex items-center">
                    <Checkbox
                      checked={formData.placementType.includes(
                        "Campus Placement"
                      )}
                      onChange={(checked) =>
                        handleCheckboxChange(
                          "placementType",
                          "Campus Placement",
                          checked === true
                        )
                      }
                    />
                    <span className="ml-2">Campus Visit</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-blue-700 border-b pb-2">
              <GraduationCap className="w-6 h-6 text-custom-blue" />
              <h3 className="text-custom-blue">Programs</h3>
            </div>

            <div className="space-y-8">
              {/* B.Tech Programs */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">
                  B.Tech Programs (4-Year Programme)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  {bTechPrograms.map((program) => (
                    <div
                      key={program.name}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={program.name}
                        checked={formData.bTechPrograms.includes(program.name)}
                        onChange={(checked) =>
                          handleProgramCheckboxChange(
                            "bTechPrograms",
                            program.name,
                            null,
                            checked === true
                          )
                        }
                      />
                      <label htmlFor={program.name} className="text-sm">
                        {program.name}
                        <span className="text-xs text-gray-500 ml-1">
                          ({program.type})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* M.Tech Programs */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">
                  M.Tech Programs (2-Year Programme)
                </h4>

                {/* Circuital Branches */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-600">
                    Circuital Branches
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {mTechPrograms.circuital.map((program) => (
                      <div key={program.name} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`mtech-${program.name}`}
                            checked={
                              program.specializations.length === 0 
                                ? formData.mTechPrograms.includes(program.name)
                                : program.specializations.every(spec => 
                                    formData.mTechPrograms.includes(spec)
                                  )
                            }
                            onChange={(checked) =>
                              handleProgramCheckboxChange(
                                "mTechPrograms",
                                program.name,
                                null,
                                checked === true
                              )
                            }
                          />
                          <label
                            htmlFor={`mtech-${program.name}`}
                            className="text-sm font-medium"
                          >
                            {program.name}
                          </label>
                        </div>
                        <div className="ml-6 space-y-1">
                          {program.specializations.map((spec) => (
                            <div
                              key={spec}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`spec-${spec}`}
                                checked={formData.mTechPrograms.includes(
                                  spec
                                )}
                                onChange={(checked) =>
                                  handleProgramCheckboxChange(
                                    "mTechPrograms",
                                    program.name,
                                    spec,
                                    checked === true
                                  )
                                }
                              />
                              <label
                                htmlFor={`spec-${spec}`}
                                className="text-xs"
                              >
                                {spec}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Non-Circuital Branches */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-600">
                    Non-Circuital Branches
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {mTechPrograms.nonCircuital.map((program) => (
                      <div key={program.name} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`mtech-${program.name}`}
                            checked={
                              program.specializations.length === 0 
                                ? formData.mTechPrograms.includes(program.name)
                                : program.specializations.every(spec => 
                                    formData.mTechPrograms.includes(spec)
                                  )
                            }
                            onChange={(checked) =>
                              handleProgramCheckboxChange(
                                "mTechPrograms",
                                program.name,
                                null,
                                checked === true
                              )
                            }
                          />
                          <label
                            htmlFor={`mtech-${program.name}`}
                            className="text-sm font-medium"
                          >
                            {program.name}
                          </label>
                        </div>
                        {program.specializations.length > 0 && (
                          <div className="ml-6 space-y-1">
                            {program.specializations.map((spec) => (
                              <div
                                key={spec}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`spec-${spec}`}
                                  checked={formData.mTechPrograms.includes(
                                    spec
                                  )}
                                  onChange={(checked) =>
                                    handleProgramCheckboxChange(
                                      "mTechPrograms",
                                      program.name,
                                      spec,
                                      checked === true
                                    )
                                  }
                                />
                                <label
                                  htmlFor={`spec-${spec}`}
                                  className="text-xs"
                                >
                                  {spec}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MBA Programs */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">MBA Programs</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mbaSpecializations.map((spec) => (
                    <div key={spec} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mba-${spec}`}
                        checked={formData.mbaProgramSpecializations.includes(
                          spec
                        )}
                        onChange={(checked) =>
                          handleCheckboxChange(
                            "mbaProgramSpecializations",
                            spec,
                            checked === true
                          )
                        }
                      />
                      <label htmlFor={`mba-${spec}`} className="text-sm">
                        {spec}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Science Streams */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">M.Sc. Programs</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {scienceStreams.map((stream) => (
                    <div key={stream} className="flex items-center space-x-2">
                      <Checkbox
                        id={`msc-${stream}`}
                        checked={formData.scienceStreamsSpecializations.includes(
                          stream
                        )}
                        onChange={(checked) =>
                          handleCheckboxChange(
                            "scienceStreamsSpecializations",
                            stream,
                            checked === true
                          )
                        }
                      />
                      <label htmlFor={`msc-${stream}`} className="text-sm">
                        {stream}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* PhD Streams */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">PhD Programs</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {phdPrograms.map((stream) => (
                    <div key={stream} className="flex items-center space-x-2">
                      <Checkbox
                        id={`phd-${stream}`}
                        checked={formData.phdPrograms.includes(stream)}
                        onChange={(checked) =>
                          handleCheckboxChange(
                            "phdPrograms",
                            stream,
                            checked === true
                          )
                        }
                      />
                      <label htmlFor={`phd-${stream}`} className="text-sm">
                        {stream}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Skill Set Required */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-blue-700 border-b pb-2">
              <FileCheck className="w-6 h-6 text-custom-blue" />
              <h3 className="text-custom-blue">Required Skills & Details</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Skill Set Required*
                </label>
                <Textarea
                  name="requiredSkills"
                  value={formData.requiredSkills}
                  onChange={handleInputChange}
                  placeholder="Enter required skills and competencies"
                  className="min-h-[100px] border-gray-300"
                />
              </div>
            </div>
          </section>

          {/* Job Details Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between text-lg font-semibold text-blue-700 border-b pb-2">
              <div className="flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-custom-blue" />
                <h3 className="text-custom-blue">Job Details</h3>
              </div>
              <Button
                type="button"
                onClick={addDesignation}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-custom-blue"
              >
                <Plus className="w-4 h-4" />
                Add Designation
              </Button>
            </div>

            <div className="space-y-6">
              {formData.designations.map((designation, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg bg-gray-50 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Designation {index + 1}</h4>
                    {index > 0 && (
                      <Button
                        type="button"
                        onClick={() => removeDesignation(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Designation Title*
                      </label>
                      <Input
                        value={designation.title}
                        onChange={(e) =>
                          updateDesignation(index, "title", e.target.value)
                        }
                        placeholder="Enter job designation"
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Stipend (₹)*
                      </label>
                      <Input
                        value={designation.stipend}
                        onChange={(e) =>
                          updateDesignation(index, "stipend", e.target.value)
                        }
                        placeholder="Enter Stipend if Intern"
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        CTC (₹)*
                      </label>
                      <Input
                        value={designation.ctc}
                        onChange={(e) =>
                          updateDesignation(index, "ctc", e.target.value)
                        }
                        placeholder="Enter CTC if PPO or FTE"
                        className="border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Job Location*
                </label>
                <div className="space-y-4">
                  <div className="flex gap-6">
                    <label className="flex items-center">
                      <Checkbox
                        checked={formData.jobLocation.includes("India")}
                        onChange={(checked) => {
 
                          handleCheckboxChange(
                            "jobLocation",
                            "India",
                            checked === true
                          );
                        }}
                      />
                      <span className="ml-2">India</span>
                    </label>
                    <label className="flex items-center">
                      <Checkbox
                        checked={formData.jobLocation.includes("Abroad")}
                        onChange={(checked) =>
                          handleCheckboxChange(
                            "jobLocation",
                            "Abroad",
                            checked === true
                          )
                        }
                      />
                      <span className="ml-2">Abroad</span>
                    </label>
                  </div>
                  <Input
                    name="specificLocations"
                    value={formData.specificLocations}
                    onChange={handleInputChange}
                    placeholder="Specify locations"
                    className="border-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Bond or Service Contract
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="bond"
                      checked={formData.bond === "true"}
                      onChange={() =>
                        setFormData((prev) => ({ ...prev, bond: "true" }))
                      }
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="bond"
                      checked={formData.bond === "false"}
                      onChange={() =>
                        setFormData((prev) => ({ ...prev, bond: "false" }))
                      }
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium">
                  Selection Process*
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectionProcess.map((process) => (
                    <div key={process} className="flex items-center space-x-2">
                      <Checkbox
                        id={process}
                        checked={formData.selectionProcess.includes(process)}
                        onChange={(checked) =>
                          handleCheckboxChange(
                            "selectionProcess",
                            process,
                            checked === true
                          )
                        }
                      />
                      <label htmlFor={process} className="text-sm">
                        {process}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Additional Selection Details
                  </label>
                  <Textarea
                    name="additionalSelectionDetails"
                    value={formData.additionalSelectionDetails}
                    onChange={handleInputChange}
                    placeholder="Enter any additional selection process details"
                    className="min-h-[80px] border-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Summer Internship Opportunities
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="internship"
                      checked={
                        formData.summerInternshipOpportunities === "true"
                      }
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          summerInternshipOpportunities: "true",
                        }))
                      }
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="internship"
                      checked={
                        formData.summerInternshipOpportunities === "false"
                      }
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          summerInternshipOpportunities: "false",
                        }))
                      }
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  For pre-final year students (2 months)
                </p>
              </div>
            </div>
          </section>

          {/* HR Contact Details Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between text-lg font-semibold text-blue-700 border-b pb-2">
              <div className="flex items-center gap-2">
                <Contact className="w-6 h-6 text-custom-blue" />
                <h3 className="text-custom-blue">HR Contact Details</h3>
              </div>
              <Button
                type="button"
                onClick={addHrContact}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-custom-blue"
              >
                <Plus className="w-4 h-4" />
                Add Contact
              </Button>
            </div>

            <div className="space-y-6">
              {formData.hrContacts.map((contact, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg bg-gray-50 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Contact Person {index + 1}</h4>
                    {index > 0 && (
                      <Button
                        type="button"
                        onClick={() => removeHrContact(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Name*</label>
                      <Input
                        value={contact.name}
                        onChange={(e) =>
                          updateHrContact(index, "name", e.target.value)
                        }
                        placeholder="Enter name"
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Designation*
                      </label>
                      <Input
                        value={contact.designation}
                        onChange={(e) =>
                          updateHrContact(index, "designation", e.target.value)
                        }
                        placeholder="Enter designation"
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Email* {index === 0 && (
                          <span className="text-xs font-normal text-gray-500">
                            (must be verified via OTP)
                          </span>
                        )}
                      </label>
                      <Input
                        type="email"
                        value={contact.email}
                        onChange={(e) =>
                          updateHrContact(index, "email", e.target.value)
                        }
                        placeholder="Enter email"
                        className="border-gray-300"
                        disabled={index === 0 && isEmailVerified}
                      />

                      {index === 0 && (
                        <div className="mt-2">
                          {isEmailVerified ? (
                            <div className="flex items-center justify-between gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" />
                                Email verified
                              </span>
                              <button
                                type="button"
                                onClick={resetEmailVerification}
                                className="text-xs underline text-gray-500 hover:text-gray-700"
                              >
                                Change email
                              </button>
                            </div>
                          ) : !otpSent ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={handleSendOtp}
                              disabled={isSendingOtp || !contact.email}
                              className="flex items-center gap-2 text-custom-blue"
                            >
                              {isSendingOtp ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Sending OTP...
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="w-4 h-4" />
                                  Send OTP to verify
                                </>
                              )}
                            </Button>
                          ) : (
                            <div className="p-3 border rounded-md bg-blue-50 border-blue-200 space-y-2">
                              <label className="block text-xs font-medium text-gray-600">
                                Enter the 6-character OTP sent to {contact.email}
                              </label>
                              <div className="flex gap-2">
                                <Input
                                  value={otpValue}
                                  onChange={(e) =>
                                    setOtpValue(
                                      e.target.value
                                        .toUpperCase()
                                        .replace(/[^A-Z0-9]/g, "")
                                        .slice(0, 6)
                                    )
                                  }
                                  placeholder="A1B2C3"
                                  className="border-gray-300 tracking-widest font-mono w-32 uppercase"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={handleVerifyOtp}
                                  disabled={isVerifyingOtp || otpValue.length !== 6}
                                  className="bg-custom-blue hover:bg-blue-700 text-white flex items-center gap-2"
                                >
                                  {isVerifyingOtp ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      Verifying...
                                    </>
                                  ) : (
                                    "Verify"
                                  )}
                                </Button>
                              </div>
                              {otpError && (
                                <p className="text-xs text-red-600">{otpError}</p>
                              )}
                              <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={resendCooldown > 0 || isSendingOtp}
                                className="text-xs text-custom-blue underline disabled:text-gray-400 disabled:no-underline"
                              >
                                {resendCooldown > 0
                                  ? `Resend OTP in ${resendCooldown}s`
                                  : "Resend OTP"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Phone Number*
                      </label>
                      <Input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) =>
                          updateHrContact(index, "phone", e.target.value)
                        }
                        placeholder="Enter phone number"
                        className="border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Postal Address</label>
            <Textarea
              name="postalAddress"
              value={formData.postalAddress}
              onChange={handleInputChange}
              placeholder="Enter postal address"
              className="min-h-[80px] border-gray-300"
            />
          </div>

          {/* Submit Button */}
          <div className="flex flex-col items-end gap-2 pt-6">
            {!isEmailVerified && (
              <p className="text-xs text-amber-600">
                Verify the primary HR contact's email above to enable submission.
              </p>
            )}
            <Button
              type="submit"
              className="bg-custom-blue hover:bg-blue-700 text-white px-8 py-2 flex items-center gap-2"
              disabled={isSubmitting || !isEmailVerified}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Submitting..." : "Submit Form"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
export default JobAnnouncementFormPublic;