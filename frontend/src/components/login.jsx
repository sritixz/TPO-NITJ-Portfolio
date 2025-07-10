// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate,useLocation } from "react-router-dom";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { useDispatch } from "react-redux";
// import { setAuthUser } from "../Redux/authSlice";
// import { Eye, EyeOff } from "lucide-react";
// import { Altcha } from "react-altcha";
// import OTPVerification from "./lockedotpverification";

// const LoginSignup = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [emailError, setEmailError] = useState("");
//   const [passwordError, setPasswordError] = useState("");
//   const [userType, setUserType] = useState("Student");
//   const [showPassword, setShowPassword] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showOTPVerification, setShowOTPVerification] = useState(false);
//   const [captchaValue, setCaptchaValue] = useState('');
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const altchaRef = useRef(null);

//   const { search } = useLocation();
//   const queryParams = new URLSearchParams(search);
//   const redirectUrl = queryParams.get("redirect") || null;

//   useEffect(() => {
//     setEmail("");
//     setPassword("");
//     setError("");
//     setEmailError("");
//     setPasswordError("");
//   }, [userType]);

//   // Toggle password visibility
//   const togglePasswordVisibility = () => {
//     setShowPassword((prev) => !prev);
//   };

//   // Handle login form submission
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
    
//     if (password.length < 8) {
//       setPasswordError("Password must be at least 8 characters long.");
//       setIsSubmitting(false);
//       return;
//     }
  
//     try {
//       // const captchaValue = altchaRef.current?.value;

      
//       console.log("Captcha Value:", captchaValue);
  
//       const response = await toast.promise(
//         axios.post(
//           `${import.meta.env.REACT_APP_BASE_URL}/auth/login`,
//           { email, password , captcha: captchaValue },
//           { withCredentials: true }
//         ),
//         {
//           loading: "Logging in...",
//           success: "Login successful!",
//           error: "Invalid Credentials",
//         }
//       );
  
//       dispatch(
//         setAuthUser({
//           authUser: true,
//           userData: response.data.user,
//           userType: response.data.userType,
//         })
//       );
     
//       if(redirectUrl){
//         navigate(redirectUrl, { replace: true });
//       }
//       else{
//       if (response.data.userType === "Student") {
//         navigate("/sdashboard/home");
//       } else if (response.data.userType === "Recuiter") {
//         navigate("/rdashboard/home");
//       } else if (response.data.userType === "Professor") {
//         navigate("/pdashboard/dashboard");
//       }}
//     } catch (error) {
//       if (error.response?.data?.message === "Account locked. Please check your email for OTP.") {
//         toast.error("Account Locked");
//         setShowOTPVerification(true);
//         return;
//     } else{
//       setError(error.response?.data?.message || "An error occurred.");
//       // Reset the CAPTCHA on failed login attempt
//       // console.log(altchaRef.current);
//       if (captchaValue) {
//         altchaRef.current.reset();
//         setCaptchaValue('');
//       }
//     }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center">
//       {showOTPVerification ? (
//             <OTPVerification
//                 email={email}
//                 onSuccess={() => {
//                     setShowOTPVerification(false);
//                     handleLogin(e);
//                 }}
//             />
//         ) : (
//       <div className="border border-custom-blue relative w-full max-w-sm mx-4 p-6 bg-white rounded-lg shadow-lg">
//         <div className="text-center">
//           <h1 className="text-2xl font-extrabold text-gray-900"> Welcome Back </h1>
//           <p className="text-sm text-gray-500 mt-2"> Please enter your login details </p>

//         </div>
//           <form onSubmit={handleLogin} className="mt-6 space-y-4 flex flex-col">
//             <input
//               className="w-full px-4 py-3 rounded-md font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-custom-blue"
//               type="email"
//               placeholder="Enter your email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//             {emailError && <p className="text-red-500 text-xs">{emailError}</p>}
//             <div className="relative w-full">
//               <input
//                 className="w-full px-4 py-3 rounded-md font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-custom-blue"
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//               <span
//                 onClick={togglePasswordVisibility}
//                 className="absolute inset-y-0 right-4 flex items-center cursor-pointer"
//               >
//                 {showPassword ? (
//                   <Eye className="h-5 w-5 text-gray-500" />
//                 ) : (
//                   <EyeOff className="h-5 w-5 text-gray-500" />
//                 )}
//               </span>
//             </div>
//             {passwordError && (<p className="text-red-500 text-xs">{passwordError} </p>)}

//              {/* <Altcha
//               ref={altchaRef}
//               challengeurl={`${import.meta.env.REACT_APP_BASE_URL}/captcha/challenge`}
//               verifyurl={`${import.meta.env.REACT_APP_BASE_URL}/captcha/verify`}
//              />  */}

//          <Altcha
//               challengeurl={`${import.meta.env.VITE_BASE_URL}/captcha/challenge`}
//               verifyurl={`${import.meta.env.VITE_BASE_URL}/captcha/verify`}
//               auto="on"
//               onChange={(payload) => {
//                 console.log("ALTCHA onChange triggered with payload:", payload);
//                 setCaptchaValue(payload);
              
//               }}
//               onError={(error) => {
//                 console.error("ALTCHA error:", error);
//                 toast.error("CAPTCHA failed. Please try again.");
             
//               }}
//               onLoad={() => console.log("ALTCHA component loaded successfully")}
//               onVerify={() => console.log("ALTCHA verification completed")}
//               debug="true" // Enable debug mode if supported
//             />

//             <button
//               type="submit"
//               className="w-full py-3 rounded-md bg-custom-blue text-white font-semibold hover:bg-blue-500 transition duration-300 z-10"
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? "Logging in..." : "Login"}
//             </button>
//             <p
//               className="text-custom-blue cursor-pointer"
//               onClick={() => navigate("/forgot-password")}
//             >
//               Forgot Password?
//             </p>
//           </form>
      
//       </div>
//       )}
//     </div>
//   );
// };

// export default LoginSignup;

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setAuthUser } from "../Redux/authSlice";
import { Eye, EyeOff, RefreshCcw,ShieldCheck } from "lucide-react";
import OTPVerification from "./lockedotpverification";

const LoginSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const redirectUrl = queryParams.get("redirect") || null;

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    try {
      const response = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/captcha/generate`, {
        withCredentials: true,
      });
      setCaptchaImage(response.data.image);
      setCaptchaInput("");
      setCaptchaVerified(false);
    } catch (error) {
      console.error("Error fetching CAPTCHA:", error);
      toast.error("Failed to load CAPTCHA. Please try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleCaptchaVerify = async () => {
    const startTime = Date.now();
    try {
      const response = await axios.post(
        `${import.meta.env.REACT_APP_BASE_URL}/captcha/verify`,
        { captchaInput, interactionTime: Date.now() - startTime },
        { withCredentials: true }
      );
      if (response.data.success) {
        setCaptchaVerified(true);
        toast.success("CAPTCHA verified!");
      } else {
        setCaptchaVerified(false);
        toast.error(response.data.error || "Invalid CAPTCHA");
        fetchCaptcha();
      }
    } catch (error) {
      console.error("CAPTCHA verification error:", error);
      toast.error("Failed to verify CAPTCHA. Please try again.");
      fetchCaptcha();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!captchaVerified) {
      toast.error("Please verify the Captcha first.");
      return;
    }
    setIsSubmitting(true);

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await toast.promise(
        axios.post(
          `${import.meta.env.REACT_APP_BASE_URL}/auth/login`,
          { email, password, captchaInput },
          { withCredentials: true }
        ),
        {
          loading: "Logging in...",
          success: "Login successful!",
          error: "Invalid Credentials",
        }
      );

      dispatch(
        setAuthUser({
          authUser: true,
          userData: response.data.user,
          userType: response.data.userType,
        })
      );

      if (redirectUrl) {
        navigate(redirectUrl, { replace: true });
      } else {
        if (response.data.userType === "Student") {
          navigate("/sdashboard/home");
        } else if (response.data.userType === "Recuiter") {
          navigate("/rdashboard/home");
        } else if (response.data.userType === "Professor") {
          navigate("/pdashboard/dashboard");
        }
      }
    } catch (error) {
      if (error.response?.data?.message === "Account locked. Please check your email for OTP.") {
        toast.error("Account Locked");
        setShowOTPVerification(true);
        return;
      } else {
        setError(error.response?.data?.message || "An error occurred.");
        fetchCaptcha();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      {showOTPVerification ? (
        <OTPVerification
          email={email}
          onSuccess={() => {
            setShowOTPVerification(false);
            handleLogin(new Event("submit"));
          }}
        />
      ) : (
        <div className="border border-custom-blue relative w-full max-w-sm mx-4 p-6 bg-white rounded-lg shadow-lg">
         <div className="flex items-center justify-center gap-3 text-center">
  <div className="flex-shrink-0 bg-blue-100 text-custom-blue p-2 mr-6 rounded-full">
    <ShieldCheck className="h-10 w-10" />
  </div>
  <div>
    <h1 className="text-2xl font-extrabold text-gray-900">Welcome Back</h1>
    <p className="text-sm text-gray-500 mt-1">Please enter your login details</p>
  </div>
</div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4 flex flex-col">
            <input
              className="w-full px-4 py-3 rounded-md font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-custom-blue"
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {emailError && <p className="text-red-500 text-xs">{emailError}</p>}
            <div className="relative w-full">
              <input
                className="w-full px-4 py-3 rounded-md font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-custom-blue"
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-4 flex items-center cursor-pointer"
              >
                {showPassword ? (
                  <Eye className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                )}
              </span>
            </div>
            {passwordError && <p className="text-red-500 text-xs">{passwordError}</p>}

            <div className="flex flex-col items-center">
            {captchaImage && (
  <div className="flex items-center justify-between w-full mb-2">
    <label className="text-lg font-bold md:ml-2 ml-0 font-grotesk text-gray-700 whitespace-nowrap">
      Captcha :
    </label>
    <div className="w-[200px] bg-[#f0f0f0] border border-gray-300 rounded-md p-1">
  <img
    src={captchaImage}
    alt="CAPTCHA"
    className="h-10 w-full object-contain"
  />
</div>

    <button
      type="button"
      onClick={fetchCaptcha}
      className="text-custom-blue hover:text-blue-600 ml-2"
    >
      <RefreshCcw className="h-5 w-5" />
    </button>
  </div>
)}

             <div className="relative w-full flex items-center gap-2">
  <input
    className="flex-1 px-4 py-3 rounded-md font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-custom-blue"
    type="text"
    placeholder="Enter Captcha"
    value={captchaInput}
    onChange={(e) => {
      setCaptchaInput(e.target.value);
      setCaptchaVerified(false); // reset on new input
    }}
    required
  />

 <div className="relative group">
  <button
    type="button"
    onClick={handleCaptchaVerify}
    disabled={isSubmitting || !captchaInput}
    className={`w-10 h-10 flex font-bold items-center justify-center rounded-full border transition-colors duration-300 ${
      captchaVerified
        ? 'bg-green-500 border-green-600 text-white'
        : 'bg-gray-200 border-gray-300 hover:bg-gray-300 text-gray-600'
    }`}
  >
    ✓
  </button>

  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded-md shadow-md z-20">
    Verify CAPTCHA
  </div>
</div>

</div>

            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-md bg-custom-blue text-white font-semibold hover:bg-blue-500 transition duration-300 z-10"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
            <p
              className="text-custom-blue cursor-pointer"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </p>
          </form>
        </div>
      )}
    </div>
  );
};

export default LoginSignup;