import React, { useEffect, useState } from "react";
import axios from "axios";
import { XCircle, AlertTriangle, Info, CheckCircle, X } from "lucide-react";

const AlertModal = () => {
  const [alert, setAlert] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const fetchActiveAlert = async () => {
      try {
        const res = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/alert/active`, { withCredentials: true });
        if (res.data?.alerts?.length > 0) {
          const activeAlert = res.data.alerts[0];
          if (activeAlert.showOnLoad) {
            setAlert(activeAlert);
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error("Error fetching alerts:", error);
      }
    };

    fetchActiveAlert();
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 250);
  };

  if (!isVisible || !alert) return null;

  const alertStyles = {
    info: {
      icon: <Info className="w-6 h-6" strokeWidth={2.5} />,
      iconBg: "bg-custom-blue",
      iconColor: "text-white",
      borderColor: "border-blue-100",
      titleColor: "text-gray-900",
      messageColor: "text-gray-600",
      primaryButton: "bg-custom-blue hover:bg-blue-700 focus:ring-blue-500",
      secondaryButton: "text-custom-blue hover:bg-blue-50"
    },
    success: {
      icon: <CheckCircle className="w-6 h-6" strokeWidth={2.5} />,
      iconBg: "bg-green-500",
      iconColor: "text-white",
      borderColor: "border-green-100",
      titleColor: "text-gray-900",
      messageColor: "text-gray-600",
      primaryButton: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
      secondaryButton: "text-green-600 hover:bg-green-50"
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6" strokeWidth={2.5} />,
      iconBg: "bg-amber-500",
      iconColor: "text-white",
      borderColor: "border-amber-100",
      titleColor: "text-gray-900",
      messageColor: "text-gray-600",
      primaryButton: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
      secondaryButton: "text-amber-600 hover:bg-amber-50"
    },
    error: {
      icon: <XCircle className="w-6 h-6" strokeWidth={2.5} />,
      iconBg: "bg-red-500",
      iconColor: "text-white",
      borderColor: "border-red-100",
      titleColor: "text-gray-900",
      messageColor: "text-gray-600",
      primaryButton: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
      secondaryButton: "text-red-600 hover:bg-red-50"
    },
  };

  const currentStyle = alertStyles[alert.type] || alertStyles.info;

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center p-4 z-[1000] transition-all duration-250 ease-out ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleClose}
    >
      {/* Modal Container */}
      <div 
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden transition-all duration-250 ease-out ${
          isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Header Section */}
        <div className="relative">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-lg p-1.5 z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>

          {/* Icon and Title */}
          <div className="px-8 pt-8 pb-6">
            <div className="flex items-start gap-4">
              {/* Icon container with enhanced styling */}
              <div 
                className={`${currentStyle.iconBg} ${currentStyle.iconColor} p-3.5 rounded-xl flex-shrink-0 shadow-lg`}
                style={{
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                }}
              >
                {currentStyle.icon}
              </div>
              
              {/* Title */}
              <div className="flex-1 pt-1">
                <h2 className={`text-2xl font-bold ${currentStyle.titleColor} leading-tight tracking-tight`}>
                  {alert.title}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={`h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-8`} />

        {/* Message Section */}
        <div className="px-8 py-6">
          <p className={`${currentStyle.messageColor} text-base leading-relaxed`}>
            {alert.message}
          </p>
        </div>

        {/* Footer with Actions */}
        <div className="px-8 pb-8 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${currentStyle.primaryButton} text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95`}
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;