import LoginAttempt from "../../models/loginattempt.js";

// Create
export const addLoginAttempt = async (req, res) => {
  try {
    const l = new LoginAttempt(req.body);
    const s = await l.save();
    res.status(201).json(s);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Get all
export const getLoginAttempts = async (req, res) => {
  try {
    const l = await LoginAttempt.find();
    console.log("l", l);
    res.status(200).json(l);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Get one
export const getLoginAttempt = async (req, res) => {
  try {
    const l = await LoginAttempt.findById(req.params.id);
    if (!l) return res.status(404).json({ error: "Not found" });
    res.status(200).json(l);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Update one
export const updateLoginAttempt = async (req, res) => {
  try {
    const l = await LoginAttempt.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!l) return res.status(404).json({ error: "Not found" });
    res.status(200).json(l);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Delete one
export const deleteLoginAttempt = async (req, res) => {
  try {
    const l = await LoginAttempt.findByIdAndDelete(req.params.id);
    if (!l) return res.status(404).json({ error: "Not found" });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Delete bulk
export const deleteBulkLoginAttempts = async (req, res) => {
  try {
    const { ids } = req.body;
    await LoginAttempt.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ message: "Bulk delete successful" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
