import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const SignupFlow = () => {
  const [stage, setStage] = useState(1);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState("");
  // const [otp, setOtp] = useState("");
  const [otpValues, setOtpValues] = useState(Array(6).fill(""));
  const otpRefs = useRef([...Array(6)].map(() => React.createRef()));

  const [form, setForm] = useState({
    name: "",
    collegeName: "",
    rollNo: "",
    contact: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

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

  /* ---------- REAL-TIME PASSWORD MATCH ---------- */
  useEffect(() => {
    if (!confirmPassword) return;

    setErrors((prev) => ({
      ...prev,
      confirmPassword:
        form.password !== confirmPassword ? "Passwords do not match" : "",
    }));
  }, [form.password, confirmPassword]);

  /* ---------- STAGE 1 ---------- */
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await axios.get(
        `${import.meta.env.REACT_APP_BASE_URL}/outsource-internships-auth/checkEmail`,
        {
          params: { email },
        }
      );

      if (res.data?.exists) {
        setErrors({ email: "Email already registered" });
        return;
      }

      await axios.post(
        `${import.meta.env.REACT_APP_BASE_URL}/outsource-internships-auth/emailVerification`,
        { email },
        { withCredentials: true }
      );

      setEmailVerified(true); //email locked forever
      setStage(2);
    } catch {
      setErrors({ email: "Failed to send OTP" });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- STAGE 2 ---------- */
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const fullOtp = otpValues.join(""); 

    if (fullOtp.length !== 6) {
      setErrors({ otp: "Please enter a 6-digit OTP" });
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.REACT_APP_BASE_URL}/outsource-internships-auth/verifyOtp`,
        { email, otp: fullOtp },
        { withCredentials: true }
      );
      setStage(3);
    } catch {
      setErrors({ otp: "Invalid OTP" });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- STAGE 3 ---------- */
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (errors.confirmPassword) return;

    try {
      await axios.post(
        `${import.meta.env.REACT_APP_BASE_URL}/outsource-internships-auth/signup`,
        { email, ...form },
        { withCredentials: true }
      );
      setShowSuccess(true);

      setLoading(true)

      setTimeout(() => {
        navigate("/outsourceInternship/login");
        setLoading(false)
      }, 2000);
    } catch (err) {
      setLoading(false)
      setErrors({ submit: err.response?.data?.message || "Signup failed" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
        {errors.submit && (
          <p className="text-red-600 text-sm mb-4">{errors.submit}</p>
        )}

        {/* ---------- STAGE 1 ---------- */}
        {stage === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold text-custom-blue">
              Verify Email
            </h2>

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-custom-blue"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <button
              disabled={loading}
              className="w-full bg-custom-blue text-white py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* ---------- STAGE 2 ---------- */}
        {stage === 2 && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold text-custom-blue">
              Enter OTP
            </h2>

            <div>
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

              {errors.otp && (
                <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
              )}
            </div>

            <button
              disabled={loading}
              className="w-full bg-custom-blue text-white py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {/* ---------- STAGE 3 ---------- */}
        {stage === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-3">
            <h2 className="text-xl font-semibold text-custom-blue">
              Complete Signup
            </h2>

            <input
              type="email"
              value={email}
              disabled
              className="w-full border rounded-lg p-2 bg-gray-100"
            />

            {["name", "collegeName", "rollNo", "contact"].map((field) => (
              <input
                key={field}
                type="text"
                placeholder={field.replace(/([A-Z])/g, " $1")}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-custom-blue"
                required
              />
            ))}

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border rounded-lg p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-custom-blue"
                required
                autoComplete="new-password"
              />
              <span
                onClick={() => setShowPassword((p) => !p)}
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
              >
                {showPassword ? (
                  <Eye className="w-5 h-5 text-gray-500" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-500" />
                )}
              </span>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border rounded-lg p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-custom-blue"
                required
                autoComplete="new-password"
              />
              <span
                onClick={() => setShowConfirmPassword((p) => !p)}
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
              >
                {showConfirmPassword ? (
                  <Eye className="w-5 h-5 text-gray-500" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-500" />
                )}
              </span>
            </div>

            <button
              disabled={loading || !!errors.confirmPassword}
              className="w-full bg-custom-blue text-white py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-60"
            >
              Create Account
            </button>

            {loading && (
              <div className="flex flex-col items-center justify-center py-4 bg-transparent mt-4 border-gray-200">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default SignupFlow;
