// import React, { useState, useEffect, memo } from 'react';
// import { ChevronRight, User, GraduationCap, Phone, Mail, MapPin, Calendar, FileText, CheckCircle } from 'lucide-react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { Player } from '@lottiefiles/react-lottie-player';
// import toast from 'react-hot-toast';

// // Memoized InputField, SelectField, and CheckboxField components (unchanged)
// const InputField = memo(({ label, type = "text", field, placeholder, required = false, readOnly = false, onChange }) => {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   const isEmailInvalid = type === 'email' && field && !emailRegex.test(field);

//   return (
//     <div className="group relative">
//       <label className="block text-sm font-medium text-slate-700 mb-2 group-focus-within:text-custom-blue transition-colors">
//         {label}
//         {required && <span className="text-red-500 ml-1">*</span>}
//       </label>
//       <input
//         type={type}
//         value={field || ''}
//         onChange={onChange}
//         placeholder={placeholder}
//         readOnly={readOnly}
//         className={`w-full px-4 py-3 border rounded-xl focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white group-hover:border-slate-300 ${
//           readOnly ? 'bg-gray-100 cursor-not-allowed' : ''
//         } ${isEmailInvalid ? 'border-red-500' : 'border-slate-200'}`}
//       />
//       {isEmailInvalid && (
//         <p className="text-red-500 text-xs mt-1">Please enter a valid email address</p>
//       )}
//     </div>
//   );
// }, (prevProps, nextProps) => {
//   return prevProps.field === nextProps.field &&
//          prevProps.type === nextProps.type &&
//          prevProps.placeholder === nextProps.placeholder &&
//          prevProps.required === nextProps.required &&
//          prevProps.readOnly === nextProps.readOnly;
// });

// const SelectField = memo(({ label, field, options, required = false, onChange }) => (
//   <div className="group relative">
//     <label className="block text-sm font-medium text-slate-700 mb-2 group-focus-within:text-custom-blue transition-colors">
//       {label}
//       {required && <span className="text-red-500 ml-1">*</span>}
//     </label>
//     <select
//       value={field || ''}
//       onChange={onChange}
//       className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-custom-blue focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white group-hover:border-slate-300"
//     >
//       <option value="">Select {label}</option>
//       {options.map(option => (
//         <option key={option} value={option}>{option}</option>
//       ))}
//     </select>
//   </div>
// ), (prevProps, nextProps) => {
//   return prevProps.field === nextProps.field &&
//          prevProps.options === nextProps.options &&
//          prevProps.required === nextProps.required;
// });

// const CheckboxField = memo(({ label, field, onChange }) => (
//   <div className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-custom-blue transition-all duration-200">
//     <input
//       type="checkbox"
//       checked={field || false}
//       onChange={onChange}
//       className="w-5 h-5 text-custom-blue border-2 border-slate-300 rounded focus:ring-custom-blue"
//     />
//     <label className="text-sm font-medium text-slate-700 cursor-pointer">{label}</label>
//   </div>
// ), (prevProps, nextProps) => {
//   return prevProps.field === nextProps.field;
// });

// const PremiumPlacementForm = () => {
//   const [currentStep, setCurrentStep] = useState(0);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [isRegistered, setIsRegistered] = useState(null); // null: loading, true: registered, false: not registered
//   const [isEditing, setIsEditing] = useState(false);
//   const { userData } = useSelector((state) => state.auth);
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     name: '',
//     rollno: '',
//     department: '',
//     course: '',
//     batch: '',
//     gender: '',
//     fatherName: '',
//     motherName: '',
//     category: '',
//     dateOfBirth: '',
//     physicallyDisabled: null,
//     disabilityType: '',
//     permanentAddress: '',
//     mobileNo: '',
//     emailNitj: '',
//     emailPersonal: '',
//     aadharCardNo: '',
//     interested: null,
//     description: '', // final description that will be sent to API
//     notInterestedReason: '', // selected reason label when not interested
//     otherReason: '' // custom text when "Other reason" is chosen
//   });

//   const [isFormOpen, setIsFormOpen] = useState(null); // null = loading, true = open, false = closed
//   const [deadline, setDeadline] = useState(null);

//   useEffect(() => {
//     const checkFormOpen = async () => {
//       try {
//         const res = await axios.get(
//           `${import.meta.env.REACT_APP_BASE_URL}/placement-registration/checkopen`,
//           { withCredentials: true }
//         );

//         if (res.data.success && res.data.data) {
//           setIsFormOpen(res.data.data.allowed);
//           setDeadline(res.data.data.deadlinetoshow);
//         } else {
//           setIsFormOpen(false);
//         }
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to check form status");
//         setIsFormOpen(false);
//       }
//     };

//     checkFormOpen();
//   }, []);

//   // Check registration status and populate form data if registered
//   useEffect(() => {
//      const checkRegistration = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/placement-registration/check`, {
//           withCredentials: true,
//         });
//         setIsRegistered(response.data.registered);
//         if (response.data.registered && response.data.data) {
//           setIsEditing(true);

//           // parse description to see if it matches one of the predefined reasons
//           const reasons = [
//             "I am preparing for government exams and want to focus on them full-time.",
//             "I plan to pursue higher studies immediately after graduation.",
//             "I am interested in starting my own business or entrepreneurial venture.",
//             "I want to go abroad for better opportunities or experience."
//           ];

//           const serverDesc = response.data.data.description || '';
//           let notInterestedReason = '';
//           let otherReason = '';
//           if (response.data.data.interested === false) {
//             // if serverDesc exactly matches one of the reasons, select it;
//             // otherwise treat it as "Other reason"
//             const matched = reasons.find(r => r === serverDesc);
//             if (matched) {
//               notInterestedReason = matched;
//             } else if (serverDesc && serverDesc.trim() !== '') {
//               notInterestedReason = 'Other reason';
//               otherReason = serverDesc;
//             }
//           }

//           setFormData({
//             name: response.data.data.name || '',
//             rollno: response.data.data.rollno || '',
//             department: response.data.data.department || '',
//             course: response.data.data.course || '',
//             batch: response.data.data.batch || '',
//             gender: response.data.data.gender || '',
//             fatherName: response.data.data.fatherName || '',
//             motherName: response.data.data.motherName || '',
//             category: response.data.data.category || '',
//             dateOfBirth: response.data.data.dateOfBirth ? new Date(response.data.data.dateOfBirth).toISOString().split('T')[0] : '',
//             physicallyDisabled: response.data.data.physicallyDisabled ?? null,
//             disabilityType: response.data.data.disabilityType || '',
//             permanentAddress: response.data.data.permanentAddress || '',
//             mobileNo: response.data.data.mobileNo || '',
//             emailNitj: response.data.data.emailNitj || '',
//             emailPersonal: response.data.data.emailPersonal || '',
//             aadharCardNo: response.data.data.aadharCardNo || '',
//             interested: response.data.data.interested ?? null,
//             description: response.data.data.description || '',
//             notInterestedReason,
//             otherReason
//           });
//           // setShowSuccess(true);
//         }
//       } catch (error) {
//         console.error('Error checking registration status:', error);
//         toast.error('Failed to check registration status. Please try again.');
//         setIsRegistered(false);
//       }
//     };

//     checkRegistration();
//   }, []);

//   // Populate formData with userData
//   useEffect(() => {
//     if (userData && !isEditing) {
//       setFormData(prev => ({
//         ...prev,
//         name: userData.name || '',
//         rollno: userData.rollno || '',
//         department: userData.department || '',
//         course: userData.course || '',
//         batch: userData.batch || '',
//         gender: userData.gender || '',
//         emailNitj: userData.email || '',
//         mobileNo: userData.phone || '',
//         permanentAddress: userData.address || '',
//         category: userData.category || '',
//       }));
//     }
//   }, [userData, isEditing]);

//   // Handle redirect after success animation
//   useEffect(() => {
//     if (showSuccess || isFormOpen === false) {
//       const timer = setTimeout(() => {
//         navigate('/sdashboard/home');
//       }, 15000);
//       return () => clearTimeout(timer);
//     }
//   }, [showSuccess, isFormOpen, navigate]);

//   const steps = [
//     {
//       title: "Personal Information",
//       icon: User,
//       fields: ['name', 'rollno', 'fatherName', 'motherName', 'dateOfBirth', 'gender', 'category']
//     },
//     {
//       title: "Academic Details",
//       icon: GraduationCap,
//       fields: ['department', 'course', 'batch']
//     },
//     {
//       title: "Contact Information",
//       icon: Phone,
//       fields: ['mobileNo', 'emailPersonal', 'emailNitj', 'permanentAddress', 'aadharCardNo']
//     },
//     {
//       title: "Additional Details",
//       icon: FileText,
//       fields: ['physicallyDisabled', 'disabilityType', 'interested', 'description', 'notInterestedReason', 'otherReason']
//     }
//   ];

//   const handleInputChange = (field) => (e) => {
//     const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const validateStep = () => {
//     const currentStepFields = steps[currentStep].fields;
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     if (currentStep === 3) {
//       if (formData.physicallyDisabled && !formData.disabilityType.trim()) {
//         toast.error('Please specify the type of disability.');
//         return false;
//       }

//       if (formData.interested === null || formData.interested === undefined) {
//         toast.error('Please select Yes or No for placement interest.');
//         return false;
//       }

//       if (!formData.interested) {
//         // when NOT interested, ensure a reason is selected
//         if (!formData.notInterestedReason || formData.notInterestedReason.trim() === '') {
//           toast.error('Please select a reason for not being interested.');
//           return false;
//         }
//         if (formData.notInterestedReason === 'Other reason' && (!formData.otherReason || formData.otherReason.trim() === '')) {
//           toast.error('Please specify your reason for selecting "Other reason".');
//           return false;
//         }
//       }

//       return true;
//     }

//     return currentStepFields.every(field => {
//       if (field === 'disabilityType' && !formData.physicallyDisabled) return true;
//       if (field === 'description' && formData.interested) return true;
//       if (field === 'notInterestedReason' && formData.interested) return true;
//       if (field === 'otherReason' && formData.notInterestedReason !== 'Other reason') return true;

//       const value = formData[field];
//       if (field === 'emailPersonal' || field === 'emailNitj') {
//         if (!value || value.trim() === '') {
//           return false;
//         }
//         if (!emailRegex.test(value)) {
//           return false;
//         }
//         return true;
//       }

//       if (!value || (typeof value === 'string' && value.trim() === '')) {
//         return false;
//       }
//       return true;
//     });
//   };

//   const nextStep = () => {
//     if (validateStep() && currentStep < steps.length - 1) {
//       setCurrentStep(currentStep + 1);
//     }
//   };

//   const prevStep = () => {
//     if (currentStep > 0) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!validateStep()) {
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       // prepare final description depending on selection
//       let finalDescription = formData.description || '';
//       if (formData.interested === false) {
//         if (formData.notInterestedReason === 'Other reason') {
//           finalDescription = formData.otherReason || '';
//         } else {
//           finalDescription = formData.notInterestedReason || '';
//         }
//       }

//       const payload = {
//         ...formData,
//         description: finalDescription
//       };

//       const url = isEditing
//         ? `${import.meta.env.REACT_APP_BASE_URL}/placement-registration/edit`
//         : `${import.meta.env.REACT_APP_BASE_URL}/placement-registration/`;
//       const response = await axios({
//         method: isEditing ? 'put' : 'post',
//         url,
//         data: payload,
//         withCredentials: true
//       });

//       console.log(`Form ${isEditing ? 'updated' : 'submitted'} successfully:`, response.data);
//       toast.success(`Registration ${isEditing ? 'updated' : 'submitted'} successfully!`);
//       setShowSuccess(true);
//     } catch (error) {
//       console.error(`Error ${isEditing ? 'updating' : 'submitting'} form:`, error);
//       const msg = error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'submit'} registration. Please try again later.`;
//       toast.error(msg);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const renderStepContent = () => {
//     const currentStepData = steps[currentStep];

//     switch (currentStep) {
//       case 0:
//         return (
//           <div className="space-y-6">
//             <div className="grid md:grid-cols-2 gap-6">
//               <InputField
//                 label="Full Name"
//                 field={formData.name}
//                 placeholder="Enter your full name"
//                 required
//                 readOnly
//                 onChange={handleInputChange('name')}
//               />
//               <InputField
//                 label="Roll Number"
//                 field={formData.rollno}
//                 placeholder="Enter your roll number"
//                 required
//                 readOnly
//                 onChange={handleInputChange('rollno')}
//               />
//             </div>
//             <div className="grid md:grid-cols-2 gap-6">
//               <InputField
//                 label="Father's Name"
//                 field={formData.fatherName}
//                 placeholder="Enter father's name"
//                 required
//                 onChange={handleInputChange('fatherName')}
//               />
//               <InputField
//                 label="Mother's Name"
//                 field={formData.motherName}
//                 placeholder="Enter mother's name"
//                 required
//                 onChange={handleInputChange('motherName')}
//               />
//             </div>
//             <div className="grid md:grid-cols-3 gap-6">
//               <InputField
//                 label="Date of Birth"
//                 field={formData.dateOfBirth}
//                 type="date"
//                 required
//                 onChange={handleInputChange('dateOfBirth')}
//               />
//               <InputField
//                 label="Gender"
//                 field={formData.gender}
//                 placeholder="Enter your gender"
//                 required
//                 readOnly
//                 onChange={handleInputChange('gender')}
//               />
//               <InputField
//                 label="Category"
//                 field={formData.category}
//                 placeholder="Enter your category"
//                 required
//                 readOnly
//                 onChange={handleInputChange('category')}
//               />
//             </div>
//           </div>
//         );

//       case 1:
//         return (
//           <div className="space-y-6">
//             <div className="grid md:grid-cols-2 gap-6">
//               <InputField
//                 label="Batch"
//                 field={formData.batch}
//                 placeholder="Enter your batch"
//                 required
//                 readOnly
//                 onChange={handleInputChange('batch')}
//               />
//               <InputField
//                 label="Course"
//                 field={formData.course}
//                 placeholder="Enter your course"
//                 required
//                 readOnly
//                 onChange={handleInputChange('course')}
//               />
//               <InputField
//                 label="Department"
//                 field={formData.department}
//                 placeholder="Enter your department"
//                 required
//                 readOnly
//                 onChange={handleInputChange('department')}
//               />
//             </div>
//           </div>
//         );

//       case 2:
//         return (
//           <div className="space-y-6">
//             <div className="grid md:grid-cols-2 gap-6">
//               <InputField
//                 label="Mobile Number"
//                 field={formData.mobileNo}
//                 type="tel"
//                 placeholder="Enter Mobile number"
//                 required
//                 onChange={handleInputChange('mobileNo')}
//               />
//               <InputField
//                 label="Personal Email"
//                 field={formData.emailPersonal}
//                 type="email"
//                 placeholder="Enter Personal email"
//                 required
//                 onChange={handleInputChange('emailPersonal')}
//               />
//             </div>
//             <div className="grid md:grid-cols-2 gap-6">
//               <InputField
//                 label="Institute Email"
//                 field={formData.emailNitj}
//                 type="email"
//                 placeholder="Enter Institute email"
//                 required
//                 readOnly
//                 onChange={handleInputChange('emailNitj')}
//               />
//               <InputField
//                 label="Aadhar Card Number"
//                 field={formData.aadharCardNo}
//                 placeholder="Enter Aadhar number"
//                 required
//                 onChange={handleInputChange('aadharCardNo')}
//               />
//             </div>
//             <div className="space-y-6">
//               <div className="group relative">
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Permanent Address <span className="text-red-500 ml-1">*</span>
//                 </label>
//                 <textarea
//                   value={formData.permanentAddress || ''}
//                   onChange={handleInputChange('permanentAddress')}
//                   placeholder="Enter your complete address"
//                   rows={3}
//                   required
//                   className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-custom-blue focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white resize-none"
//                 />
//               </div>
//             </div>
//           </div>
//         );

//       case 3:
//       const reasons = [
//   "I am preparing for government exams and want to focus on them full-time.",
//   "I plan to pursue higher studies immediately after graduation.",
//   "I am interested in starting my own business or entrepreneurial venture.",
//   "I want to go abroad for better opportunities or experience.",
//   "Other reason"
// ];

//         return (
//           <div className="space-y-6">
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-slate-700">
//                 Do you have any physical disability? <span className="text-red-500">*</span>
//               </label>
//               <div className="flex space-x-4">
//                 {["Yes", "No"].map(option => (
//                   <button
//                     key={option}
//                     type="button"
//                     onClick={() =>
//                       setFormData(prev => ({ ...prev, physicallyDisabled: option === "Yes", disabilityType: option === "No" ? "" : prev.disabilityType, }))
//                     }
//                     className={`px-4 py-2 rounded-xl border transition-colors ${
//                       (formData.physicallyDisabled === true && option === "Yes") ||
//                       (formData.physicallyDisabled === false && option === "No")
//                         ? 'bg-custom-blue text-white border-custom-blue'
//                         : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
//                     }`}
//                   >
//                     {option}
//                   </button>
//                 ))}
//               </div>

//               {formData.physicallyDisabled && (
//                 <InputField
//                   label="Type of Disability"
//                   field={formData.disabilityType}
//                   placeholder="Please specify the type of disability"
//                   required
//                   onChange={handleInputChange('disabilityType')}
//                 />
//               )}
//             </div>

//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-slate-700">
//                 Are you interested in placement opportunities? <span className="text-red-500">*</span>
//               </label>
//               <div className="flex space-x-4">
//                 {["Yes", "No"].map(option => (
//                   <button
//                     key={option}
//                     type="button"
//                     onClick={() =>
//                       setFormData(prev => ({
//                         ...prev,
//                         interested: option === "Yes",
//                         // clear notInterestedReason/otherReason when interested
//                         notInterestedReason: option === 'Yes' ? '' : prev.notInterestedReason,
//                         otherReason: option === 'Yes' ? '' : prev.otherReason,
//                         // keep description as-is; will be prepared on submit
//                       }))
//                     }
//                     className={`px-4 py-2 rounded-xl border transition-colors ${
//                       (formData.interested === true && option === "Yes") ||
//                       (formData.interested === false && option === "No")
//                         ? 'bg-custom-blue text-white border-custom-blue'
//                         : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
//                     }`}
//                   >
//                     {option}
//                   </button>
//                 ))}
//               </div>
//                {!formData.interested && (
//                 <div className="mt-4 space-y-2">
//                   <label className="block text-sm font-medium text-slate-700">
//                     Please select the reason: <span className="text-red-500">*</span>
//                   </label>
//                   <div className="grid grid-cols-1 gap-2">
//                     {reasons.map(reason => (
//                       <button
//                         key={reason}
//                         type="button"
//                         onClick={() =>
//                           setFormData(prev => ({
//                             ...prev,
//                             notInterestedReason: reason,
//                             // if selecting a predefined reason, copy it to description right away
//                             description: reason === 'Other reason' ? '' : reason,
//                             otherReason: reason === 'Other reason' ? prev.otherReason : ''
//                           }))
//                         }
//                         className={`px-4 py-2 rounded-xl border text-left w-full transition-colors ${
//                           formData.notInterestedReason === reason
//                             ? 'bg-custom-blue text-white border-custom-blue'
//                             : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
//                         }`}
//                       >
//                         {reason}
//                       </button>
//                     ))}
//                   </div>

//                   {formData.notInterestedReason === 'Other reason' && (
//                     <div className="mt-2">
//                       <textarea
//                         value={formData.otherReason}
//                         onChange={(e) => setFormData(prev => ({ ...prev, otherReason: e.target.value, description: e.target.value }))}
//                         placeholder="Please specify your reason"
//                         rows={3}
//                         className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-custom-blue focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white resize-none"
//                       />
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   if (isFormOpen === null) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Player
//           autoplay
//           loop
//           src="/loading.json"
//           style={{ height: '200px', width: '200px' }}
//         />
//       </div>
//     );
//   }

//   if (isFormOpen === false) {
//     return (
//       <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
//         <div className="max-w-md mx-auto text-center">
//           <Player
//             autoplay
//             loop
//             src="/close.json"
//             style={{ height: '300px', width: '300px' }}
//           />
//           <h2 className="text-2xl font-bold text-red-600 mb-4">
//             Placement Registration is Closed
//           </h2>
//           <p className="text-slate-600 text-sm mb-4">Redirecting to dashboard in 15 seconds...</p>
//         </div>
//       </div>
//     );
//   }

//   if (showSuccess) {
//     const handleJoinWhatsApp = () => {
//       window.open(`${import.meta.env.REACT_APP_BASE_URL}/placement-registration/join-whatsapp`, "_blank");
//     };

//     return (
//       <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
//         <div className="max-w-md mx-auto text-center">
//           <Player
//             autoplay
//             loop
//             src="/Success.json"
//             style={{ height: '300px', width: '300px' }}
//           />
//           <h2 className="text-2xl font-bold text-green-600 mb-4">
//             {isEditing ? 'Registration Updated!' : 'Registration Successful!'}
//           </h2>
//           <p className="text-slate-600 mb-4">Redirecting to dashboard in 15 seconds...</p>
//           <button
//             onClick={handleJoinWhatsApp}
//             className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
//           >
//             Join WhatsApp Group
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 relative">
//       <div className="max-w-4xl mx-auto">
//         <div className="text-center mb-8">
//           <h1 className="text-2xl paytone-one-regular font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-black mb-3">
//             Placement <span className="text-custom-blue">{isEditing ? 'Edit Registration' : 'Registration'}</span>
//           </h1>
//         </div>
//         {deadline && (
//           <div className="absolute top-1 right-2 bg-red-200 text-red-800 px-4 py-2 rounded-lg shadow-md border border-red-300 text-sm font-medium">
//             Deadline: {new Date(deadline).toLocaleString("en-IN", {
//               day: "numeric",
//               month: "short",
//               year: "numeric",
//               hour: "numeric",
//               minute: "2-digit",
//               hour12: true,
//               timeZone: "Asia/Kolkata"
//             })}
//           </div>
//         )}

//         <div className="flex items-center justify-center mb-8 overflow-x-auto">
//           {steps.map((step, index) => {
//             const StepIcon = step.icon;
//             const isActive = index === currentStep;
//             const isCompleted = index < currentStep;

//             return (
//               <div key={index} className="flex items-center">
//                 <div className={`flex flex-col items-center relative ${index > 0 ? 'ml-8' : ''}`}>
//                   <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
//                     isCompleted
//                       ? 'bg-green-500 shadow-lg scale-110'
//                       : isActive
//                         ? 'bg-custom-blue shadow-lg scale-110'
//                         : 'bg-slate-200'
//                   }`}>
//                     {isCompleted ? (
//                       <CheckCircle className="w-3 h-3 text-white" />
//                     ) : (
//                       <StepIcon className={`w-3 h-3 ${isActive ? 'text-white' : 'text-slate-500'}`} />
//                     )}
//                   </div>
//                   <span className={`text-xs mt-2 font-medium text-center max-w-20 ${
//                     isActive ? 'text-custom-blue' : 'text-slate-500'
//                   }`}>
//                     {step.title}
//                   </span>
//                 </div>
//                 {index < steps.length - 1 && (
//                   <div className={`w-20 h-0.5 mt-6 transition-all duration-300 ${
//                     index < currentStep ? 'bg-green-500' : 'bg-slate-200'
//                   }`} />
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 overflow-hidden">
//           <div className="bg-custom-blue p-6">
//             <h2 className="text-2xl font-bold text-white flex items-center">
//               {React.createElement(steps[currentStep].icon, { className: "w-6 h-6 mr-3" })}
//               {steps[currentStep].title}
//             </h2>
//             <div className="mt-2 bg-white/20 rounded-full h-2">
//               <div
//                 className="bg-white rounded-full h-2 transition-all duration-500"
//                 style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
//               />
//             </div>
//           </div>

//           <div className="p-8">
//             {renderStepContent()}

//             <div className="flex justify-between pt-8 border-t border-slate-200 mt-8">
//               <button
//                 type="button"
//                 onClick={prevStep}
//                 disabled={currentStep === 0 || isSubmitting}
//                 className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
//                   currentStep === 0 || isSubmitting
//                     ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
//                     : 'bg-slate-200 text-slate-700 hover:bg-slate-300 hover:shadow-md'
//                 }`}
//               >
//                 Previous
//               </button>

//               {currentStep === steps.length - 1 ? (
//                 <button
//                   type="button"
//                   onClick={handleSubmit}
//                   disabled={isSubmitting}
//                   className={`px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center ${
//                     isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
//                   }`}
//                 >
//                   {isSubmitting ? 'Submitting...' : isEditing ? 'Update Registration' : 'Submit Registration'}
//                   <CheckCircle className="w-5 h-5 ml-2" />
//                 </button>
//               ) : (
//                 <button
//                   type="button"
//                   onClick={nextStep}
//                   disabled={!validateStep() || isSubmitting}
//                   className={`px-8 py-3 font-medium rounded-xl flex items-center transition-all duration-200 ${
//                     validateStep() && !isSubmitting
//                       ? 'bg-custom-blue text-white hover:from-custom-blue hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
//                       : 'bg-slate-100 text-slate-400 cursor-not-allowed'
//                   }`}
//                 >
//                   Next Step
//                   <ChevronRight className="w-5 h-5 ml-2" />
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="text-center text-xs mt-8 text-slate-500">
//           <p>In case of any technical difficulty, Kindly contact at noreply.ctp@nitj.ac.in</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PremiumPlacementForm;

import React, { useState, useEffect, memo } from "react";
import {
  ChevronRight,
  User,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Player } from "@lottiefiles/react-lottie-player";
import toast from "react-hot-toast";

// Memoized InputField, SelectField, and CheckboxField components (unchanged)
const InputField = memo(
  ({
    label,
    type = "text",
    field,
    placeholder,
    required = false,
    readOnly = false,
    onChange,
  }) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailInvalid = type === "email" && field && !emailRegex.test(field);

    return (
      <div className="group relative">
        <label className="block text-sm font-medium text-slate-700 mb-2 group-focus-within:text-custom-blue transition-colors">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type={type}
          value={field || ""}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full px-4 py-3 border rounded-xl focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white group-hover:border-slate-300 ${
            readOnly ? "bg-gray-100 cursor-not-allowed" : ""
          } ${isEmailInvalid ? "border-red-500" : "border-slate-200"}`}
        />
        {isEmailInvalid && (
          <p className="text-red-500 text-xs mt-1">
            Please enter a valid email address
          </p>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.field === nextProps.field &&
      prevProps.type === nextProps.type &&
      prevProps.placeholder === nextProps.placeholder &&
      prevProps.required === nextProps.required &&
      prevProps.readOnly === nextProps.readOnly
    );
  },
);

const SelectField = memo(
  ({ label, field, options, required = false, onChange }) => (
    <div className="group relative">
      <label className="block text-sm font-medium text-slate-700 mb-2 group-focus-within:text-custom-blue transition-colors">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={field || ""}
        onChange={onChange}
        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-custom-blue focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white group-hover:border-slate-300"
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.field === nextProps.field &&
      prevProps.options === nextProps.options &&
      prevProps.required === nextProps.required
    );
  },
);

const CheckboxField = memo(
  ({ label, field, onChange }) => (
    <div className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-custom-blue transition-all duration-200">
      <input
        type="checkbox"
        checked={field || false}
        onChange={onChange}
        className="w-5 h-5 text-custom-blue border-2 border-slate-300 rounded focus:ring-custom-blue"
      />
      <label className="text-sm font-medium text-slate-700 cursor-pointer">
        {label}
      </label>
    </div>
  ),
  (prevProps, nextProps) => {
    return prevProps.field === nextProps.field;
  },
);

const PremiumPlacementForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isRegistered, setIsRegistered] = useState(null); // null: loading, true: registered, false: not registered
  const [isEditing, setIsEditing] = useState(false);
  const { userData } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    rollno: "",
    department: "",
    course: "",
    batch: "",
    gender: "",
    fatherName: "",
    motherName: "",
    category: "",
    dateOfBirth: "",
    physicallyDisabled: null,
    disabilityType: "",
    permanentAddress: "",
    mobileNo: "",
    emailNitj: "",
    emailPersonal: "",
    aadharCardNo: "",
    interested: null,
    description: "", // final description that will be sent to API
    notInterestedReason: "", // selected reason label when not interested
    otherReason: "", // custom text when "Other reason" is chosen

    // NEW FIELDS (backend-aligned names)
    preferredSector: "", // 'PSU' | 'Private'
    privateType: "", // 'Tech' | 'Non-Tech'
    nonTechType: [],
    otherNonTechRole: "",
    trainingRequired: null, // true | false | null
    trainingPlatform: "", // text input for platform
  });

  const [isFormOpen, setIsFormOpen] = useState(null); // null = loading, true = open, false = closed
  const [deadline, setDeadline] = useState(null);

  useEffect(() => {
    const checkFormOpen = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.REACT_APP_BASE_URL}/placement-registration/checkopen`,
          { withCredentials: true },
        );

        if (res.data.success && res.data.data) {
          setIsFormOpen(res.data.data.allowed);
          setDeadline(res.data.data.deadlinetoshow);
        } else {
          setIsFormOpen(false);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to check form status");
        setIsFormOpen(false);
      }
    };

    checkFormOpen();
  }, []);

  // Check registration status and populate form data if registered
  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.REACT_APP_BASE_URL}/placement-registration/check`,
          {
            withCredentials: true,
          },
        );
        setIsRegistered(response.data.registered);
        if (response.data.registered && response.data.data) {
          setIsEditing(true);
            
          // parse description to see if it matches one of the predefined reasons
          const reasons = [
            "I am preparing for government exams and want to focus on them full-time.",
            "I plan to pursue higher studies immediately after graduation.",
            "I am interested in starting my own business or entrepreneurial venture.",
            "I want to go abroad for better opportunities or experience.",
          ];

          const serverDesc = response.data.data.description || "";
          let notInterestedReason = "";
          let otherReason = "";
          if (response.data.data.interested === false) {
            // if serverDesc exactly matches one of the reasons, select it;
            // otherwise treat it as "Other reason"
            const matched = reasons.find((r) => r === serverDesc);
            if (matched) {
              notInterestedReason = matched;
            } else if (serverDesc && serverDesc.trim() !== "") {
              notInterestedReason = "Other reason";
              otherReason = serverDesc;
            }
          }

          setFormData({
            name: response.data.data.name || "",
            rollno: response.data.data.rollno || "",
            department: response.data.data.department || "",
            course: response.data.data.course || "",
            batch: response.data.data.batch || "",
            gender: response.data.data.gender || "",
            fatherName: response.data.data.fatherName || "",
            motherName: response.data.data.motherName || "",
            category: response.data.data.category || "",
            dateOfBirth: response.data.data.dateOfBirth
              ? new Date(response.data.data.dateOfBirth)
                  .toISOString()
                  .split("T")[0]
              : "",
            physicallyDisabled: response.data.data.physicallyDisabled ?? null,
            disabilityType: response.data.data.disabilityType || "",
            permanentAddress: response.data.data.permanentAddress || "",
            mobileNo: response.data.data.mobileNo || "",
            emailNitj: response.data.data.emailNitj || "",
            emailPersonal: response.data.data.emailPersonal || "",
            aadharCardNo: response.data.data.aadharCardNo || "",
            interested: response.data.data.interested ?? null,
            description: response.data.data.description || "",
            notInterestedReason,
            otherReason,

            // Populate NEW FIELDS if returned by server (use empty fallbacks)
            preferredSector: response.data.data.preferredSector || "",
            privateType: response.data.data.privateType || "",
            trainingRequired: response.data.data.trainingRequired ?? null,
            trainingPlatform: response.data.data.trainingPlatform || "",
            nonTechType: response.data.data.nonTechType || [],
            otherNonTechRole: response.data.data.otherNonTechRole || "",
          });
          // setShowSuccess(true);
        }
      } catch (error) {
        console.error("Error checking registration status:", error);
        toast.error("Failed to check registration status. Please try again.");
        setIsRegistered(false);
      }
    };

    checkRegistration();
  }, []);

  // Populate formData with userData
  useEffect(() => {
    if (userData && !isEditing) {
      setFormData((prev) => ({
        ...prev,
        name: userData.name || "",
        rollno: userData.rollno || "",
        department: userData.department || "",
        course: userData.course || "",
        batch: userData.batch || "",
        gender: userData.gender || "",
        emailNitj: userData.email || "",
        mobileNo: userData.phone || "",
        permanentAddress: userData.address || "",
        category: userData.category || "",
      }));
    }
  }, [userData, isEditing]);

  // Handle redirect after success animation
  useEffect(() => {
    if (showSuccess || isFormOpen === false) {
      const timer = setTimeout(() => {
        navigate("/sdashboard/home");
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, isFormOpen, navigate]);

  const steps = [
    {
      title: "Personal Information",
      icon: User,
      fields: [
        "name",
        "rollno",
        "fatherName",
        "motherName",
        "dateOfBirth",
        "gender",
        "category",
      ],
    },
    {
      title: "Academic Details",
      icon: GraduationCap,
      fields: ["department", "course", "batch"],
    },
    {
      title: "Contact Information",
      icon: Phone,
      fields: [
        "mobileNo",
        "emailPersonal",
        "emailNitj",
        "permanentAddress",
        "aadharCardNo",
      ],
    },
    {
      title: "Additional Details",
      icon: FileText,
      // added new fields for step 3 (backend-aligned names)
      fields: [
        "physicallyDisabled",
        "disabilityType",
        "interested",
        "description",
        "notInterestedReason",
        "otherReason",
        "preferredSector",
        "privateType",
        "nonTechType",
        "trainingRequired",
        "trainingPlatform",
      ],
    },
  ];

  const handleInputChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep = () => {
    const currentStepFields = steps[currentStep].fields;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (currentStep === 3) {
      if (formData.physicallyDisabled && !formData.disabilityType.trim()) {
        toast.error("Please specify the type of disability.");
        return false;
      }

      if (formData.interested === null || formData.interested === undefined) {
        toast.error("Please select Yes or No for placement interest.");
        return false;
      }

      // ---- INTEREST VALIDATION ----
      if (!formData.interested) {
        if (!formData.notInterestedReason?.trim()) {
          toast.error("Please select a reason for not being interested.");
          return false;
        }

        if (
          formData.notInterestedReason === "Other reason" &&
          !formData.otherReason?.trim()
        ) {
          toast.error("Please specify your reason.");
          return false;
        }
      } else {
        if (!formData.preferredSector?.trim()) {
          toast.error("Please select preferred sector.");
          return false;
        }

        if (
          (formData.preferredSector === "Private" ||
            formData.preferredSector === "Both") &&
          !formData.privateType?.trim()
        ) {
          toast.error("Please select Tech or Non-Tech.");
          return false;
        }

        if (
          formData.privateType === "Non-Tech" &&
          (!formData.nonTechType || formData.nonTechType.length === 0)
        ) {
          toast.error("Please select at least one Non-Tech role.");
          return false;
        }

        if (
          formData.privateType === "Non-Tech" &&
          formData.nonTechType.includes("Other") &&
          !formData.otherNonTechRole?.trim()
        ) {
          toast.error("Please specify the Other Non-Tech role.");
          return false;
        }
      }

      // ---- TRAINING VALIDATION (ALWAYS REQUIRED) ----
      if (formData.trainingRequired === null) {
        toast.error("Please indicate if training is required.");
        return false;
      }

      if (
        formData.trainingRequired === true &&
        !formData.trainingPlatform?.trim()
      ) {
        toast.error("Please specify training platform.");
        return false;
      }

      return true;
    }

    return currentStepFields.every((field) => {
      if (field === "disabilityType" && !formData.physicallyDisabled)
        return true;
      if (field === "description" && formData.interested) return true;
      if (field === "notInterestedReason" && formData.interested) return true;
      if (
        field === "otherReason" &&
        formData.notInterestedReason !== "Other reason"
      )
        return true;
      if (field === "preferredSector" && formData.interested !== true)
        return true;
      if (
        field === "privateType" &&
        !["Private", "Both"].includes(formData.preferredSector)
      )
        return true;
      if (field === "trainingPlatform" && formData.trainingRequired !== true)
        return true;

      const value = formData[field];
      if (field === "emailPersonal" || field === "emailNitj") {
        if (!value || value.trim() === "") {
          return false;
        }
        if (!emailRegex.test(value)) {
          return false;
        }
        return true;
      }

      if (!value || (typeof value === "string" && value.trim() === "")) {
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
      // prepare final description depending on selection
      let finalDescription = formData.description || "";
      if (formData.interested === false) {
        if (formData.notInterestedReason === "Other reason") {
          finalDescription = formData.otherReason || "";
        } else {
          finalDescription = formData.notInterestedReason || "";
        }
      }
      const payload = {
        ...formData,
        description: finalDescription,
      };
      console.log(payload);
      const url = isEditing
        ? `${import.meta.env.REACT_APP_BASE_URL}/placement-registration/edit`
        : `${import.meta.env.REACT_APP_BASE_URL}/placement-registration/`;
      const response = await axios({
        method: isEditing ? "put" : "post",
        url,
        data: payload,
        withCredentials: true,
      });

      console.log(
        `Form ${isEditing ? "updated" : "submitted"} successfully:`,
        response.data,
      );
      toast.success(
        `Registration ${isEditing ? "updated" : "submitted"} successfully!`,
      );
      setShowSuccess(true);
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "submitting"} form:`,
        error,
      );
      const msg =
        error.response?.data?.message ||
        `Failed to ${isEditing ? "update" : "submit"} registration. Please try again later.`;
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
                onChange={handleInputChange("name")}
              />
              <InputField
                label="Roll Number"
                field={formData.rollno}
                placeholder="Enter your roll number"
                required
                readOnly
                onChange={handleInputChange("rollno")}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="Father's Name"
                field={formData.fatherName}
                placeholder="Enter father's name"
                required
                onChange={handleInputChange("fatherName")}
              />
              <InputField
                label="Mother's Name"
                field={formData.motherName}
                placeholder="Enter mother's name"
                required
                onChange={handleInputChange("motherName")}
              />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <InputField
                label="Date of Birth"
                field={formData.dateOfBirth}
                type="date"
                required
                onChange={handleInputChange("dateOfBirth")}
              />
              <InputField
                label="Gender"
                field={formData.gender}
                placeholder="Enter your gender"
                required
                readOnly
                onChange={handleInputChange("gender")}
              />
              <InputField
                label="Category"
                field={formData.category}
                placeholder="Enter your category"
                required
                readOnly
                onChange={handleInputChange("category")}
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
                onChange={handleInputChange("batch")}
              />
              <InputField
                label="Course"
                field={formData.course}
                placeholder="Enter your course"
                required
                readOnly
                onChange={handleInputChange("course")}
              />
              <InputField
                label="Department"
                field={formData.department}
                placeholder="Enter your department"
                required
                readOnly
                onChange={handleInputChange("department")}
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
                onChange={handleInputChange("mobileNo")}
              />
              <InputField
                label="Personal Email"
                field={formData.emailPersonal}
                type="email"
                placeholder="Enter Personal email"
                required
                onChange={handleInputChange("emailPersonal")}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                label="Institute Email"
                field={formData.emailNitj}
                type="email"
                placeholder="Enter Institute email"
                required
                readOnly
                onChange={handleInputChange("emailNitj")}
              />
              <InputField
                label="Aadhar Card Number"
                field={formData.aadharCardNo}
                placeholder="Enter Aadhar number"
                required
                onChange={handleInputChange("aadharCardNo")}
              />
            </div>
            <div className="space-y-6">
              <div className="group relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Permanent Address <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  value={formData.permanentAddress || ""}
                  onChange={handleInputChange("permanentAddress")}
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
        const nonTechTypes = [
          "Managerial Roles",
          "Consulting & Strategy",
          "Finance & Banking",
          "Sales & Marketing",
          "Core Domain",
          "Other",
        ];
        const reasons = [
          "I am preparing for government exams and want to focus on them full-time.",
          "I plan to pursue higher studies(in India) immediately after graduation.",
          "I plan to pursue higher studies(Abroad) immediately after graduation.",
          "I am interested in starting my own business/startup or entrepreneurial venture.",
          "I want to go abroad for better opportunities or experience.",
          "Other reason",
        ];
        const sectors = ["PSU", "Private", "Both"];
        const privateTypes = ["Tech", "Non-Tech"];

        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Do you have any physical disability?{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                {["Yes", "No"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        physicallyDisabled: option === "Yes",
                        disabilityType:
                          option === "No" ? "" : prev.disabilityType,
                      }))
                    }
                    className={`px-4 py-2 rounded-xl border transition-colors ${
                      (formData.physicallyDisabled === true &&
                        option === "Yes") ||
                      (formData.physicallyDisabled === false && option === "No")
                        ? "bg-custom-blue text-white border-custom-blue"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {formData.physicallyDisabled && (
                <InputField
                  label="Type of Disability"
                  field={formData.disabilityType}
                  placeholder="Please specify the type of disability"
                  required
                  onChange={handleInputChange("disabilityType")}
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Are you interested in placement opportunities?{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                {["Yes", "No"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        interested: option === "Yes",
                        // clear notInterestedReason/otherReason when interested
                        notInterestedReason:
                          option === "Yes" ? "" : prev.notInterestedReason,
                        otherReason: option === "Yes" ? "" : prev.otherReason,
                        description: option === "Yes" ? "" : prev.description,
                        // if switching to 'Yes' and no sector set, keep as is; if switching to 'No' clear sector/training
                        preferredSector:
                          option === "Yes" ? prev.preferredSector : "",
                        privateType: option === "Yes" ? prev.privateType : "",
                        trainingRequired:
                          option === "Yes" ? prev.trainingRequired : null,
                        trainingPlatform:
                          option === "Yes" ? prev.trainingPlatform : "",
                      }))
                    }
                    className={`px-4 py-2 rounded-xl border transition-colors ${
                      (formData.interested === true && option === "Yes") ||
                      (formData.interested === false && option === "No")
                        ? "bg-custom-blue text-white border-custom-blue"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {formData.interested === false && (
                <div className="mt-4 space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Please select the reason:{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {reasons.map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            notInterestedReason: reason,
                            // if selecting a predefined reason, copy it to description right away
                            description:
                              reason === "Other reason" ? "" : reason,
                            otherReason:
                              reason === "Other reason" ? prev.otherReason : "",
                          }))
                        }
                        className={`px-4 py-2 rounded-xl border text-left w-full transition-colors ${
                          formData.notInterestedReason === reason
                            ? "bg-custom-blue text-white border-custom-blue"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>

                  {formData.notInterestedReason === "Other reason" && (
                    <div className="mt-2">
                      <textarea
                        value={formData.otherReason}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            otherReason: e.target.value,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Please specify your reason"
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-custom-blue focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white resize-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {formData.interested === true && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Preferred sector <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-3 mt-2">
                      {sectors.map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              preferredSector: sec,
                              privateType:
                                sec === "Private" || sec === "Both"
                                  ? prev.privateType
                                  : "",
                              nonTechType:
                                sec === "Private" || sec === "Both"
                                  ? prev.nonTechType
                                  : [],
                              otherNonTechRole:
                                sec === "Private" || sec === "Both"
                                  ? prev.otherNonTechRole
                                  : "",
                            }))
                          }
                          className={`px-4 py-2 rounded-xl border transition-colors ${
                            formData.preferredSector === sec
                              ? "bg-custom-blue text-white border-custom-blue"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          {sec}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(formData.preferredSector === "Private" ||
                    formData.preferredSector === "Both") && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        If Private, which type?{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="flex space-x-3 mt-2">
                        {privateTypes.map((pt) => (
                          <button
                            key={pt}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                privateType: pt,
                                nonTechType:
                                  pt === "Non-Tech" ? prev.nonTechType : [],
                                otherNonTechRole:
                                  pt === "Non-Tech"
                                    ? prev.otherNonTechRole
                                    : "",
                              }))
                            }
                            className={`px-4 py-2 rounded-xl border transition-colors ${
                              formData.privateType === pt
                                ? "bg-custom-blue text-white border-custom-blue"
                                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                            }`}
                          >
                            {pt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.privateType === "Non-Tech" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Preferred Non-Tech Role{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        {nonTechTypes.map((nt) => (
                          <button
                            key={nt}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => {
                                const alreadySelected =
                                  prev.nonTechType.includes(nt);

                                return {
                                  ...prev,
                                  nonTechType: alreadySelected
                                    ? prev.nonTechType.filter(
                                        (item) => item !== nt,
                                      )
                                    : [...prev.nonTechType, nt],
                                };
                              })
                            }
                            className={`px-4 py-2 rounded-xl border text-left transition-colors ${
                              formData.nonTechType.includes(nt)
                                ? "bg-custom-blue text-white border-custom-blue"
                                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                            }`}
                          >
                            {nt}
                          </button>
                        ))}
                      </div>
                      {formData.nonTechType.includes("Other") && (
                        <div className="mt-3">
                          <InputField
                            label="Specify Other Non-Tech Role"
                            field={formData.otherNonTechRole}
                            placeholder="Enter role type"
                            required
                            onChange={handleInputChange("otherNonTechRole")}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Do you require training to be placement-ready?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-3 mt-2">
                  {["Yes", "No"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          trainingRequired: opt === "Yes",
                          trainingPlatform:
                            opt === "No" ? "" : prev.trainingPlatform,
                        }))
                      }
                      className={`px-4 py-2 rounded-xl border transition-colors ${
                        (formData.trainingRequired === true && opt === "Yes") ||
                        (formData.trainingRequired === false && opt === "No")
                          ? "bg-custom-blue text-white border-custom-blue"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {formData.trainingRequired === true && (
                  <div className="mt-3">
                    <InputField
                      label="Preferred training platform"
                      field={formData.trainingPlatform}
                      placeholder="e.g., Coursera, NPTEL, Internshala, Company-specific training"
                      required
                      onChange={handleInputChange("trainingPlatform")}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isFormOpen === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Player
          autoplay
          loop
          src="/loading.json"
          style={{ height: "200px", width: "200px" }}
        />
      </div>
    );
  }

  if (isFormOpen === false) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
        <div className="max-w-md mx-auto text-center">
          <Player
            autoplay
            loop
            src="/close.json"
            style={{ height: "300px", width: "300px" }}
          />
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Placement Registration is Closed
          </h2>
          <p className="text-slate-600 text-sm mb-4">
            Redirecting to dashboard in 15 seconds...
          </p>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    const handleJoinWhatsApp = () => {
      window.open(
        `${import.meta.env.REACT_APP_BASE_URL}/placement-registration/join-whatsapp`,
        "_blank",
      );
    };

    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
        <div className="max-w-md mx-auto text-center">
          <Player
            autoplay
            loop
            src="/Success.json"
            style={{ height: "300px", width: "300px" }}
          />
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            {isEditing ? "Registration Updated!" : "Registration Successful!"}
          </h2>
          <p className="text-slate-600 mb-4">
            Redirecting to dashboard in 15 seconds...
          </p>
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl paytone-one-regular font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-black mb-3">
            Placement{" "}
            <span className="text-custom-blue">
              {isEditing ? "Edit Registration" : "Registration"}
            </span>
          </h1>
        </div>
        {deadline && (
          <div className="absolute top-1 right-2 bg-red-200 text-red-800 px-4 py-2 rounded-lg shadow-md border border-red-300 text-sm font-medium">
            Deadline:{" "}
            {new Date(deadline).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
              timeZone: "Asia/Kolkata",
            })}
          </div>
        )}

        <div className="flex items-center justify-center mb-8 overflow-x-auto">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={index} className="flex items-center">
                <div
                  className={`flex flex-col items-center relative ${index > 0 ? "ml-8" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? "bg-green-500 shadow-lg scale-110"
                        : isActive
                          ? "bg-custom-blue shadow-lg scale-110"
                          : "bg-slate-200"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-3 h-3 text-white" />
                    ) : (
                      <StepIcon
                        className={`w-3 h-3 ${isActive ? "text-white" : "text-slate-500"}`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium text-center max-w-20 ${
                      isActive ? "text-custom-blue" : "text-slate-500"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-20 h-0.5 mt-6 transition-all duration-300 ${
                      index < currentStep ? "bg-green-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="mb-6 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full">
              ⚠️
            </div>

            <div>
              <h4 className="text-sm font-semibold text-amber-800">
                Important – Read Before Submitting
              </h4>

              <p className="mt-1 text-sm text-amber-700 leading-relaxed">
                Please fill this form carefully and honestly. Training programs,
                non-tech role preparation, and abroad-oriented guidance will be
                arranged strictly based on your responses. Incorrect information
                may result in missing relevant opportunities.
              </p>
            </div>
          </div>
        </div>
        {isEditing && 
          <div className="mb-6 rounded-xl border border-red-300 bg-gradient-to-r from-red-50 to-red-50 p-5 shadow-sm">
            <div className="flex items-start gap-3">
            <div className="flex h-3 w-9 items-center justify-center rounded-full">
              ⚠️
            </div>

            <div>
              <h4 className="text-sm font-semibold text-amber-800">
                You have already filled the form. If you want to edit it then continue.
              </h4>
            </div>
          </div>
          </div>
          }
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          <div className="bg-custom-blue p-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              {React.createElement(steps[currentStep].icon, {
                className: "w-6 h-6 mr-3",
              })}
              {steps[currentStep].title}
            </h2>
            <div className="mt-2 bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="p-8">
            {renderStepContent()}

            <div className="flex justify-between pt-8 border-t border-slate-200 mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0 || isSubmitting}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  currentStep === 0 || isSubmitting
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300 hover:shadow-md"
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
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting
                    ? "Submitting..."
                    : isEditing
                      ? "Update Registration"
                      : "Submit Registration"}
                  <CheckCircle className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep() || isSubmitting}
                  className={`px-8 py-3 font-medium rounded-xl flex items-center transition-all duration-200 ${
                    validateStep() && !isSubmitting
                      ? "bg-custom-blue text-white hover:from-custom-blue hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Next Step
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="text-center text-xs mt-8 text-slate-500">
          <p>
            In case of any technical difficulty, Kindly contact at
            noreply.ctp@nitj.ac.in
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumPlacementForm;
