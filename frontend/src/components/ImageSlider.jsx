import React from "react";
import { motion } from "framer-motion";

// Company Data (unchanged)
const companies = [
  {
  name: "Oracle",
  logo: "https://www.oracle.com/favicon.ico",
  description:
    "A global leader in cloud and database software, empowering businesses with innovative enterprise solutions.",
},
  {
    name: "Google",
    logo: "https://www.google.com/favicon.ico",
    description:
      "Pioneering in AI and cloud computing with a focus on innovation.",
  },
  {
    name: "Microsoft",
    logo: "https://www.microsoft.com/favicon.ico",
    description:
      "Leading tech company offering innovative solutions across the globe.",
  },
  {
    name: "Optum",
    logo: "/optum-logo.ico",
    description:
      "A health services and innovation company, part of UnitedHealth Group.",
  },
  {
    name: "Expedia",
    logo: "https://www.expedia.com/favicon.ico",
    description:
      "Global travel technology company, providing travel booking services.",
  },
  {
    name: "Amazon",
    logo: "https://www.amazon.com/favicon.ico",
    description:
      "The largest e-commerce company with a global footprint in various industries.",
  },
];

const ImageSlider = () => {
  return (
    <>
      <h1 className="text-4xl font-bold text-center mb-8">
        Top <span className="text-custom-blue">Recruiters</span>
      </h1>
      <div className="w-full h-auto py-8 flex justify-center items-center">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4"
          style={{ perspective: "1200px" }}
        >
          {companies.map((company, index) => (
            <motion.div
              key={index}
              // Added simple hover effect for the card's border and shadow
              className="bg-white p-6 rounded-lg shadow-lg border border-blue-200 transition-all duration-300 transform-gpu cursor-pointer 
                         hover:shadow-xl hover:border-custom-blue"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              // Subtle 3D lift on hover, similar to the requested effect
              whileHover={{ scale: 1.02, y: -5, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)" }}
              style={{
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="text-center">
                <div className="mb-4">
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className="h-16 w-auto object-contain mx-auto"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {company.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {company.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </>
  );
};

export default ImageSlider;