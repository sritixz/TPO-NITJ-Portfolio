import { useEffect, useState } from "react";
import axios from "axios";

const FILTERS = {
  SHORT: "lte2month",
  LONG: "gte3month",
};

export default function InternshipsManagement() {
  const [internships, setInternships] = useState([]);
  const [activeFilter, setActiveFilter] = useState(FILTERS.SHORT);
  const [loading, setLoading] = useState(false);

  const fetchInternships = async (filter) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.REACT_APP_BASE_URL}/outsource-internships/${filter}/get`,
        { withCredentials: true }
      );
      console.log(res.data)
      setInternships(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch internships", err);
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships(activeFilter);
  }, [activeFilter]);

  return (
    <div className="p-6">
      {/* Header + Filters */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Available Internships</h2>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter(FILTERS.SHORT)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeFilter === FILTERS.SHORT
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Winter / Summer Intern
          </button>

          <button
            onClick={() => setActiveFilter(FILTERS.LONG)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeFilter === FILTERS.LONG
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Long Intern
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-center text-gray-500">Loading internships...</p>
      )}

      {/* Cards */}
      {!loading && internships.length === 0 && (
        <p className="text-center text-gray-500">
          No internships available.
        </p>
      )}

      {!loading && internships.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((item) => (
            <div
              key={item._id}
              className="bg-white shadow-md rounded-xl p-5 hover:shadow-lg transition"
            >
              {/* <h3 className="text-lg font-semibold mb-1">
                {item.title}
              </h3>

              <p className="text-sm text-gray-600 mb-2">
                {item.companyName}
              </p>

              <p className="text-sm text-gray-500 mb-3">
                Duration: {item.duration}
              </p>

              <p className="text-sm line-clamp-3 mb-4">
                {item.description}
              </p> */}

              <div className="flex justify-between items-center">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">
                  {activeFilter === FILTERS.SHORT
                    ? "Winter / Summer"
                    : "Long Term"}
                </span>

                <button className="text-sm text-blue-600 font-medium hover:underline">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
