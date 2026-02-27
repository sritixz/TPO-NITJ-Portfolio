import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function RepresentativeApplication() {
  const [token, setToken] = useState(null);
  const [type, setType] = useState(null);
  const [eligible, setEligible] = useState(true);
  const [loading, setLoading] = useState(true);

  const [activities, setActivities] = useState([
    { description: "", role: "", duration: "" }
  ]);

  const [sop, setSop] = useState("");
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  useEffect(() => {
    axios
      .post("/api/representative/generate-token", {}, { withCredentials: true })
      .then(res => {
        setToken(res.data.token);
        setType(res.data.type);

        if (res.data.message) {
          toast.success(res.data.message);
        }
      })
      .catch((err) => {
        setEligible(false);
        toast.error(err.response?.data?.message || "Not eligible to apply");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleActivityChange = (index, field, value) => {
    const updated = [...activities];
    updated[index][field] = value;
    setActivities(updated);
  };

  const addActivity = () => {
    setActivities([...activities, { description: "", role: "", duration: "" }]);
  };

  const removeActivity = (index) => {
    const updated = activities.filter((_, i) => i !== index);
    setActivities(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!declarationAccepted) {
      toast.error("Please accept declaration before submitting.");
      return;
    }

    try {
      const res = await axios.post(
        "/api/representative/submit",
        {
          token,
          type,
          activities,
          sop,
          declarationAccepted
        },
        { withCredentials: true }
      );

      toast.success(res.data.message || "Application Submitted Successfully");

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Submission Failed"
      );
    }
  };

  if (loading)
    return <div className="p-10">Loading...</div>;

  if (!eligible)
    return (
      <div className="p-10 text-red-600 font-semibold">
        You are not eligible to apply (CGPA ≥ 7, no backlogs required).
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-6">
        {type?.toUpperCase()} Representative Application
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Activities Section */}
        <div>
          <h3 className="font-semibold mb-3">
            Co-curricular / Extra-curricular
          </h3>

          {activities.map((activity, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 mb-3">
              <input
                type="text"
                placeholder="Activity Description"
                className="border p-2 rounded"
                value={activity.description}
                onChange={(e) =>
                  handleActivityChange(index, "description", e.target.value)
                }
                required
              />
              <input
                type="text"
                placeholder="Role"
                className="border p-2 rounded"
                value={activity.role}
                onChange={(e) =>
                  handleActivityChange(index, "role", e.target.value)
                }
                required
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Duration"
                  className="border p-2 rounded w-full"
                  value={activity.duration}
                  onChange={(e) =>
                    handleActivityChange(index, "duration", e.target.value)
                  }
                  required
                />
                {activities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeActivity(index)}
                    className="bg-red-500 text-white px-3 rounded"
                  >
                    X
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addActivity}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          >
            Add Activity
          </button>
        </div>

        {/* SOP */}
        <div>
          <h3 className="font-semibold mb-2">Statement of Purpose</h3>
          <textarea
            rows="6"
            className="w-full border p-3 rounded"
            value={sop}
            onChange={(e) => setSop(e.target.value)}
            required
          />
        </div>

        {/* Declaration */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={declarationAccepted}
            onChange={(e) => setDeclarationAccepted(e.target.checked)}
            required
          />
          <label>
            I declare that the above information is true to the best of my knowledge.
          </label>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          Submit Application
        </button>
      </form>
    </div>
  );
}