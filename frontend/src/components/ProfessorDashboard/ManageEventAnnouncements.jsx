import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEdit, FaTrash } from "react-icons/fa";

const ManageEventAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", date: "", location: "", type: "event" });
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const fetchItems = async () => {
  try {
    const res = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/event-announcements`);
    // Ensure the data is an array before setting state
    if (Array.isArray(res.data)) {
      setAnnouncements(res.data);
    } else {
      setAnnouncements([]);
    }
  } catch (err) {
    console.error("Error fetching items:", err);
    setAnnouncements([]);
  }
};

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    // Append all text fields
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    // Append the image file if selected
    if (file) formData.append("image", file);

    try {
      if (editingId) {
        await axios.put(`${import.meta.env.REACT_APP_BASE_URL}/event-announcements/${editingId}`, formData, { 
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" } 
        });
        toast.success("Updated successfully!");
      } else {
        await axios.post(`${import.meta.env.REACT_APP_BASE_URL}/event-announcements`, formData, { 
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Posted successfully!");
      }
      // Reset form
      setEditingId(null);
      setForm({ title: "", description: "", date: "", location: "", type: "event" });
      setFile(null);
      fetchItems();
    } catch (err) { 
      toast.error(err.response?.data?.message || "Operation failed"); 
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this?")) {
      try {
        await axios.delete(`${import.meta.env.REACT_APP_BASE_URL}/event-announcements/${id}`, { withCredentials: true });
        toast.success("Deleted!");
        fetchItems();
      } catch (err) { 
        toast.error("Delete failed"); 
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-sky-800 border-b pb-2">
        {editingId ? "Edit Landing Page Entry" : "Add New Landing Page Entry"}
      </h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-10 bg-gray-50 p-6 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            className="border p-2 rounded focus:outline-sky-500" 
            placeholder="Title" 
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})} 
            required 
          />
          <input 
            type="date" 
            className="border p-2 rounded focus:outline-sky-500" 
            value={form.date}
            onChange={e => setForm({...form, date: e.target.value})} 
            required 
          />
        </div>

        <textarea 
          className="border p-2 rounded h-24 focus:outline-sky-500" 
          placeholder="Description" 
          value={form.description}
          onChange={e => setForm({...form, description: e.target.value})} 
          required 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            className="border p-2 rounded focus:outline-sky-500" 
            placeholder="Location/Mode (e.g. Online, Auditorium)" 
            value={form.location}
            onChange={e => setForm({...form, location: e.target.value})} 
          />
          <select 
            className="border p-2 rounded focus:outline-sky-500" 
            value={form.type}
            onChange={e => setForm({...form, type: e.target.value})}
          >
            <option value="event">Main Event Card (Left Section)</option>
            <option value="announcement">Announcement List (Right Section)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Poster/Image (Optional)</label>
          <input 
            type="file" 
            className="border p-2 rounded bg-white" 
            onChange={e => setFile(e.target.files[0])} 
            accept="image/*" 
          />
        </div>

        <div className="flex gap-3 mt-2">
          <button type="submit" className="bg-sky-700 hover:bg-sky-800 text-white px-6 py-2 rounded font-bold transition flex-1">
            {editingId ? "Update Entry" : "Post to Landing Page"}
          </button>
          {editingId && (
            <button 
              type="button"
              onClick={() => {setEditingId(null); setForm({title:"", description:"", date:"", location:"", type:"event"})}} 
              className="bg-gray-400 text-white px-6 py-2 rounded font-bold"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid gap-4">
        <h3 className="text-xl font-bold text-gray-700">Existing Updates</h3>
        {announcements.length === 0 ? (
          <p className="text-gray-500 italic">No entries found.</p>
        ) : (
          announcements.map((item) => (
            <div key={item._id} className="flex justify-between items-center p-4 border rounded shadow-sm hover:bg-gray-50 transition">
              <div>
                <p className="font-bold text-lg">{item.title}</p>
                <div className="flex gap-2 items-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.type === 'event' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {item.type}
                  </span>
                  <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setForm({ ...item, date: item.date.split('T')[0] }); 
                    setEditingId(item._id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="text-blue-500 hover:text-blue-700 p-2"
                  title="Edit"
                >
                  <FaEdit size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(item._id)} 
                  className="text-red-500 hover:text-red-700 p-2"
                  title="Delete"
                >
                  <FaTrash size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageEventAnnouncements;