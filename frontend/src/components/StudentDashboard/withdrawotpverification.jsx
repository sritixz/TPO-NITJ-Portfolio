import React, { useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const WithdrawOTPVerification = ({ jobId, setStatus, setShowOtp }) => {
  const [otpValues, setOtpValues] = useState(Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const otpRefs = useRef([...Array(6)].map(() => React.createRef()));

  const handleOtpChange = (index, value) => {
    const upperValue = value.toUpperCase();
    if (!/^[A-Z0-9]*$/.test(upperValue)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = upperValue;
    setOtpValues(newOtpValues);

    if (upperValue !== "" && index < 5) {
      otpRefs.current[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").toUpperCase();
    const pastedChars = pastedData.match(/[A-Z0-9]/g);
    
    if (pastedChars && pastedChars.length) {
      const newOtpValues = [...otpValues];
      for (let i = 0; i < Math.min(6, pastedChars.length); i++) {
        newOtpValues[i] = pastedChars[i];
      }
      setOtpValues(newOtpValues);
      const nextEmptyIndex = newOtpValues.findIndex(value => !value);
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
        otpRefs.current[nextEmptyIndex].current.focus();
      } else {
        otpRefs.current[5].current.focus();
      }
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otp = otpValues.join("");
    
    if (otp.length !== 6) {
      toast.error("Please enter a complete 6-digit OTP");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await toast.promise(
        axios.post(`${import.meta.env.REACT_APP_BASE_URL}/withdraw/verify-otp`, {
          otp,
          jobId
        },
        { withCredentials: true }),
        {
          loading: "Verifying OTP...",
          success: (res) => res.data.message || "OTP verified successfully!",
          error: (err) => err.response?.data?.message || "OTP verification failed",
        }
      );
      setIsVerified(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const withdrawApplication = async () => {
    try {
      setIsSubmitting(true);
      const response = await toast.promise(
        axios.post(
          `${import.meta.env.REACT_APP_BASE_URL}/api/withdraw`,
          { jobId },
          { withCredentials: true }
        ),
        {
          loading: "Withdrawing application...",
          success: (res) => res.data.message || "Application withdrawn successfully!",
          error: (err) => err.response?.data?.message || "Failed to withdraw application",
        }
      );

      if (response.status === 200) {
        setStatus((prevStatus) => ({
          ...prevStatus,
          applied: false,
        }));
        setShowOtp(false);
      }
    } catch (error) {
      console.error("Failed to withdraw application:", error);
    } finally {
        setShowOtp(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="border border-custom-blue relative w-full max-w-sm mx-4 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-gray-900">
            <span className="text-custom-blue">OTP </span>Verification
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {isVerified 
              ? "You can now withdraw your application"
              : "Please enter the OTP sent to your email to withdraw"}
          </p>
        </div>

        {!isVerified ? (
          <form onSubmit={handleVerifyOTP} className="mt-6 space-y-6 flex flex-col">
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {otpValues.map((value, index) => (
                <input
                  key={index}
                  ref={otpRefs.current[index]}
                  className="w-12 h-12 text-center text-xl font-semibold rounded-md bg-gray-100 border border-gray-200 focus:outline-none focus:border-custom-blue focus:ring-1 focus:ring-custom-blue"
                  type="text"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  required
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-md bg-custom-blue text-white font-semibold hover:bg-blue-500 transition duration-300 z-10 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        ) : (
          <div className="mt-6">
            <button
              onClick={withdrawApplication}
              className="w-full py-3 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Withdrawing..." : "Withdraw Application"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawOTPVerification;