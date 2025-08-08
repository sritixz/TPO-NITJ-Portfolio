import React, { useState, useEffect, memo } from 'react';
import { ChevronRight, User, GraduationCap, Phone, Mail, MapPin, Calendar, FileText, CheckCircle } from 'lucide-react';
import { batch, useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player';
import toast from 'react-hot-toast';

// Memoized InputField, SelectField, and CheckboxField components remain unchanged
const InputField = memo(({ label, type = "text", field, placeholder, required = false, readOnly = false, onChange }) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailInvalid = type === 'email' && field && !emailRegex.test(field);

  return (
    <div className="group relative">
      <label className="block text-sm font-medium text-slate-700 mb-2 group-focus-within:text-custom-blue transition-colors">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={field || ''}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full px-4 py-3 border rounded-xl focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white group-hover:border-slate-300 ${
          readOnly ? 'bg-gray-100 cursor-not-allowed' : ''
        } ${isEmailInvalid ? 'border-red-500' : 'border-slate-200'}`}
      />
      {isEmailInvalid && (
        <p className="text-red-500 text-xs mt-1">Please enter a valid email address</p>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.field === nextProps.field &&
         prevProps.type === nextProps.type &&
         prevProps.placeholder === nextProps.placeholder &&
         prevProps.required === nextProps.required &&
         prevProps.readOnly === nextProps.readOnly;
});

const SelectField = memo(({ label, field, options, required = false, onChange }) => (
  <div className="group relative">
    <label className="block text-sm font-medium text-slate-700 mb-2 group-focus-within:text-custom-blue transition-colors">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      value={field || ''}
      onChange={onChange}
      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-custom-blue focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white group-hover:border-slate-300"
    >
      <option value="">Select {label}</option>
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
), (prevProps, nextProps) => {
  return prevProps.field === nextProps.field &&
         prevProps.options === nextProps.options &&
         prevProps.required === nextProps.required;
});

const CheckboxField = memo(({ label, field, onChange }) => (
  <div className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-custom-blue transition-all duration-200">
    <input
      type="checkbox"
      checked={field || false}
      onChange={onChange}
      className="w-5 h-5 text-custom-blue border-2 border-slate-300 rounded focus:ring-custom-blue"
    />
    <label className="text-sm font-medium text-slate-700 cursor-pointer">{label}</label>
  </div>
), (prevProps, nextProps) => {
  return prevProps.field === nextProps.field;
});

const PremiumPlacementForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isRegistered, setIsRegistered] = useState(null); // null: loading, true: registered, false: not registered
  const { userData } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    rollno: '',
    department: '',
    course: '',
    batch: '',
    gender: '',
    fatherName: '',
    motherName: '',
    category: '',
    dateOfBirth: '',
    physicallyDisabled: false,
    disabilityType: '',
    permanentAddress: '',
    mobileNo: '',
    emailNitj: '',
    emailPersonal: '',
    aadharCardNo: '',
    interested: true,
    description: ''
  });

  // Check registration status on component mount
  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const response = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/placement-registration/check`, {
          withCredentials: true,
        });
        setIsRegistered(response.data.registered);
        if (response.data.registered) {
          setShowSuccess(true);
        }
      } catch (error) {
        console.error('Error checking registration status:', error);
        toast.error('Failed to check registration status. Please try again.');
        setIsRegistered(false); // Allow form to show if check fails
      }
    };

    checkRegistration();
  }, []);

  // Populate formData with userData when component mounts
  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        name: userData.name || '',
        rollno: userData.rollno || '',
        department: userData.department || '',
        course: userData.course || '',
        batch: userData.batch || '',
        gender: userData.gender || '',
        emailNitj: '',
        mobileNo: '',
        permanentAddress: userData.address || '',
        physicallyDisabled: userData.disability || false,
        category: userData.category || '',
        interested: userData.isInterested || true
      }));
    }
  }, [userData]);

  // Handle redirect after success animation
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        navigate('/sdashboard/home');
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, navigate]);

  const steps = [
    {
      title: "Personal Information",
      icon: User,
      fields: ['name', 'rollno', 'fatherName', 'motherName', 'dateOfBirth', 'gender', 'category']
    },
    {
      title: "Academic Details",
      icon: GraduationCap,
      fields: ['department', 'course', 'batch']
    },
    {
      title: "Contact Information",
      icon: Phone,
      fields: ['mobileNo', 'emailPersonal', 'emailNitj', 'permanentAddress', 'aadharCardNo']
    },
    {
      title: "Additional Details",
      icon: FileText,
      fields: ['physicallyDisabled', 'disabilityType', 'interested', 'description']
    }
  ];

  const handleInputChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = () => {
    const currentStepFields = steps[currentStep].fields;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (currentStep === 3) {
      if (formData.physicallyDisabled && !formData.disabilityType.trim()) {
        toast.error('Please specify the type of disability.');
        return false;
      }
      if (!formData.interested && !formData.description.trim()) {
        toast.error('Please provide a reason for not being interested in placement.');
        return false;
      }
      return true;
    }

    return currentStepFields.every(field => {
      if (field === 'disabilityType' && !formData.physicallyDisabled) return true;
      if (field === 'description' && formData.interested) return true;

      const value = formData[field];
      if (field === 'emailPersonal' || field === 'emailNitj') {
        if (!value || value.trim() === '') {
          return false;
        }
        if (!emailRegex.test(value)) {
          return false;
        }
        return true;
      }

      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return false;
      }
      return true;
    });
  };

  const nextStep = () => {
    if (validateStep() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${import.meta.env.REACT_APP_BASE_URL}/placement-registration/`, formData, {
        withCredentials: true
      });

      console.log('Form submitted successfully:', response.data);
      toast.success('Registration submitted successfully!');
      setShowSuccess(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      const msg = error.response?.data?.message || 'Failed to submit registration. Please try again later.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const currentStepData = steps[currentStep];

    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <InputField 
                label="Full Name" 
                field={formData.name} 
                placeholder="Enter your full name" 
                required 
                readOnly 
                onChange={handleInputChange('name')}
              />
              <InputField 
                label="Roll Number" 
                field={formData.rollno} 
                placeholder="Enter your roll number" 
                required 
                readOnly 
                onChange={handleInputChange('rollno')}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <InputField 
                label="Father's Name" 
                field={formData.fatherName} 
                placeholder="Enter father's name" 
                required 
                onChange={handleInputChange('fatherName')}
              />
              <InputField 
                label="Mother's Name" 
                field={formData.motherName} 
                placeholder="Enter mother's name" 
                required 
                onChange={handleInputChange('motherName')}
              />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <InputField 
                label="Date of Birth" 
                field={formData.dateOfBirth} 
                type="date" 
                required 
                onChange={handleInputChange('dateOfBirth')}
              />
              <InputField 
                label="Gender" 
                field={formData.gender} 
                placeholder="Enter your gender" 
                required 
                readOnly 
                onChange={handleInputChange('gender')}
              />
              <InputField 
                label="Category" 
                field={formData.category} 
                placeholder="Enter your category" 
                required 
                readOnly 
                onChange={handleInputChange('category')}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <InputField 
                label="Batch" 
                field={formData.batch} 
                placeholder="Enter your batch" 
                required 
                readOnly 
                onChange={handleInputChange('batch')}
              />
              <InputField 
                label="Course" 
                field={formData.course} 
                placeholder="Enter your course" 
                required 
                readOnly 
                onChange={handleInputChange('course')}
              />
              <InputField 
                label="Department" 
                field={formData.department} 
                placeholder="Enter your department" 
                required 
                readOnly 
                onChange={handleInputChange('department')}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <InputField 
                label="Mobile Number" 
                field={formData.mobileNo} 
                type="tel" 
                placeholder="Enter Mobile number" 
                required 
                onChange={handleInputChange('mobileNo')}
              />
              <InputField 
                label="Personal Email" 
                field={formData.emailPersonal} 
                type="email" 
                placeholder="Enter Personal email" 
                required 
                onChange={handleInputChange('emailPersonal')}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <InputField 
                label="Institute Email" 
                field={formData.emailNitj} 
                type="email" 
                placeholder="Enter Institute email" 
                required 
                onChange={handleInputChange('emailNitj')}
              />
              <InputField 
                label="Aadhar Card Number" 
                field={formData.aadharCardNo} 
                placeholder="Enter Aadhar number" 
                required 
                onChange={handleInputChange('aadharCardNo')}
              />
            </div>
            <div className="space-y-6">
              <div className="group relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Permanent Address <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  value={formData.permanentAddress || ''}
                  onChange={handleInputChange('permanentAddress')}
                  placeholder="Enter your complete address"
                  rows={3}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-custom-blue focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white resize-none"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <CheckboxField 
              label="Do you have any physical disability ?" 
              field={formData.physicallyDisabled} 
              onChange={handleInputChange('physicallyDisabled')}
            />
            
            {formData.physicallyDisabled && (
              <InputField 
                label="Type of Disability" 
                field={formData.disabilityType} 
                placeholder="Please specify the type of disability" 
                required
                onChange={handleInputChange('disabilityType')}
              />
            )}
            
            <CheckboxField 
              label="Are you interested in placement opportunities ?" 
              field={formData.interested} 
              onChange={handleInputChange('interested')}
            />
            
            {!formData.interested && (
              <div className="group relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Why Not Interested for Placement <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={handleInputChange('description')}
                  placeholder="Please specify the reason for not being interested in placement"
                  rows={4}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-custom-blue focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white resize-none"
                />
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Show success animation if already registered or form submitted
 if (showSuccess) {
  const handleJoinWhatsApp = () => {
    // Open backend endpoint that redirects to WhatsApp group
    window.open(`${import.meta.env.REACT_APP_BASE_URL}/placement-registration/join-whatsapp`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
  <div className="max-w-md mx-auto text-center">
    <Player
      autoplay
      loop
      src="/Success.json"
      style={{ height: '300px', width: '300px' }}
    />
    <h2 className="text-2xl font-bold text-green-600 mb-4">
      {isRegistered ? 'Already Registered!' : 'Registration Successful!'}
    </h2>
    <p className="text-slate-600 mb-4">Redirecting to dashboard in 15 seconds...</p>
    <button
      onClick={handleJoinWhatsApp}
      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
    >
      Join WhatsApp Group
    </button>
  </div>
</div>

  );
}


  // Render form if not registered
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl paytone-one-regular font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-black mb-3">
            Placement <span className="text-custom-blue">Registration</span> 
          </h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 overflow-x-auto">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={index} className="flex items-center">
                <div className={`flex flex-col items-center relative ${index > 0 ? 'ml-8' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-500 shadow-lg scale-110' 
                      : isActive 
                        ? 'bg-custom-blue shadow-lg scale-110' 
                        : 'bg-slate-200'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-3 h-3 text-white" />
                    ) : (
                      <StepIcon className={`w-3 h-3 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium text-center max-w-20 ${
                    isActive ? 'text-custom-blue' : 'text-slate-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-20 h-0.5 mt-6 transition-all duration-300 ${
                    index < currentStep ? 'bg-green-500' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          <div className="bg-custom-blue p-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              {React.createElement(steps[currentStep].icon, { className: "w-6 h-6 mr-3" })}
              {steps[currentStep].title}
            </h2>
            <div className="mt-2 bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-8">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t border-slate-200 mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0 || isSubmitting}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  currentStep === 0 || isSubmitting
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 hover:shadow-md'
                }`}
              >
                Previous
              </button>

              {currentStep === steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                  <CheckCircle className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep() || isSubmitting}
                  className={`px-8 py-3 font-medium rounded-xl flex items-center transition-all duration-200 ${
                    validateStep() && !isSubmitting
                      ? 'bg-custom-blue text-white hover:from-custom-blue hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Next Step
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs mt-8 text-slate-500">
          <p>In case of any technical difficulty, Kindly contact at noreply.ctp@nitj.ac.in</p>
        </div>
      </div>
    </div>
  );
};

export default PremiumPlacementForm;