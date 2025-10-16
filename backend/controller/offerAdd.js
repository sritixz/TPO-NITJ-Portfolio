import Student from '../models/user_model/student.js';
import Offer from '../models/offer.js';
import OfferTracker from '../models/offertracker.js';

export const getStudentByRoll = async(req, res) =>{
try {
const { roll } = req.params;
if (!roll) return res.status(400).json({ error: 'roll parameter required' });


const student = await Student.findOne({ rollno: roll })
.select('name gender department category rollno')
.lean();


if (!student) return res.status(404).json({ error: 'Student not found' });

return res.json(student);
} catch (err) {
console.error('getStudentByRoll error:', err);
return res.status(500).json({ error: 'Server error' });
}
}


export const addOffer = async (req, res) => {
    console.log("reached server");
  try {
    const {
      company_name,
      batch,
      course,
      result_date,
      offer_mode,
      offer_sector,
      offer_category,
      shortlisted_students
    } = req.body;

    // Basic validation
    if (!company_name || !batch || !course || !offer_mode) {
      return res.status(400).json({ error: 'Missing required fields: company_name, batch, course, offer_mode' });
    }

    if (!Array.isArray(shortlisted_students) || shortlisted_students.length === 0) {
      return res.status(400).json({ error: 'shortlisted_students array is required and must not be empty' });
    }

    // Optional: Validate each shortlisted student has required fields
    const validStudents = shortlisted_students.filter(student => 
      student.name && (student.job_type || student.job_role)
    );
    if (validStudents.length !== shortlisted_students.length) {
      return res.status(400).json({ error: 'Each shortlisted student must have name and at least job_type or job_role' });
    }

    // Optional: Verify studentIds exist in Student model (if studentId is provided)
    const studentIds = shortlisted_students
      .filter(s => s.studentId)
      .map(s => s.studentId);
    if (studentIds.length > 0) {
      const existingStudents = await Student.find({ _id: { $in: studentIds } });
      const existingIds = existingStudents.map(s => s._id.toString());
      const invalidIds = studentIds.filter(id => !existingIds.includes(id.toString()));
      if (invalidIds.length > 0) {
        return res.status(400).json({ 
          error: `Invalid studentId(s): ${invalidIds.join(', ')}` 
        });
      }
    }

    // Create the offer
    const newOffer = new Offer({
      company_name,
      batch,
      course,
      offer_mode,
      offer_sector,
      result_date,
      shortlisted_students,
      added: "Manually"

    });

    await newOffer.save();

     for (const student of shortlisted_students) {
      if (student.studentId) {
        await OfferTracker.findOneAndUpdate(
          { studentId: student.studentId },
          {
            $push: {
              offer: {
                offer_type: student.job_type || "",   // from shortlisted_students
                offer_category: offer_category || "",
                offer_sector: offer_sector || "Private",
                offer_ctc: student.ctc || "0",
                offer_intern_duration: student.intern_duration || ""
              }
            }
          },
          { upsert: true, new: true } // create new tracker if not exists
        );
      }
    }


    res.status(201).json(newOffer);
  } catch (error) {
    console.error('Error adding offer:', error);
    res.status(500).json({ error: 'Failed to add offer: ' + error.message });
  }
};


export const getManualOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ added: "Manually" });
    res.status(200).json(offers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const updateOffer = async (req, res) => {
  try {
    const { id } = req.params; // Offer ID from route
    const payload = req.body;  // Payload from frontend

    const updatedOffer = await Offer.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true }
    );

    if (!updatedOffer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.status(200).json(updatedOffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};