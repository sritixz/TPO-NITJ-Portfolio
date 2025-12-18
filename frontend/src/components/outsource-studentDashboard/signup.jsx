import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignupFlow = () => {
  const [stage, setStage] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

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
        `${import.meta.env.REACT_APP_BASE_URL}/outsource-internships/checkEmail`,
        {
          params: { email },
        }
      );

      if (res.data?.exists) {
        setErrors({ email: "Email already registered" });
        return;
      }

      await axios.post(
        `${import.meta.env.REACT_APP_BASE_URL}/outsource-internships/emailVerification`,
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

    try {
      await axios.post(
        `${import.meta.env.REACT_APP_BASE_URL}/outsource-internships/verifyOtp`,
        { email, otp },
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
        `${import.meta.env.REACT_APP_BASE_URL}/outsource-internships/signup`,
        { email, ...form },
        { withCredentials: true }
      );
      setShowSuccess(true);

      setTimeout(() => {
        navigate("/outsourceInternship/login");
      }, 2000);
    } catch (err) {
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
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                required
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-custom-blue"
              />
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

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-custom-blue"
              required
            />

            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-custom-blue"
                required
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              disabled={!!errors.confirmPassword}
              className="w-full bg-custom-blue text-white py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-60"
            >
              Create Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignupFlow;
