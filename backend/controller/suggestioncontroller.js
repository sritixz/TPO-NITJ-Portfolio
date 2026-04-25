import Suggestions from "../models/suggestion.js";
import Student from "../models/user_model/student.js";
import Faculty from "../models/user_model/professor.js";
export const savesuggestions = async (req, res) => {
  const companyType =
    req.body.company_type_other && req.body.company_type_other.trim() !== ""
      ? req.body.company_type_other
      : req.body.company_type;

  try {
    const newSuggestions = new Suggestions({
      
      professor_id: req.user.role === 'professor' ? req.user.userId : null,
      faculty_id: req.user.role === 'faculty' ? req.user.userId : null, 
      student_id: req.user.role === 'student' ? req.user.userId : null,
      
      company_name: req.body.company_name,
      company_linkedin: req.body.company_linkedin,
      Hr_name: req.body.Hr_name,
      Hr_contact: req.body.Hr_contact,
      HR_email: req.body.HR_email,
      company_type: companyType,
      sector: req.body.sector,
      hiring_status: req.body.hiring_status,
      Additional_Info: req.body.Additional_Info,
    });

    const savedSuggestion = await newSuggestions.save();
    res.status(201).json({ message: "Success", suggestion: savedSuggestion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving" });
  }
};

export const getsuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestions.find({})
      .populate("student_id", "name rollno") // Fetch student details
      .populate("faculty_id", "name")
      .populate("professor_id", "name")        // Fetch faculty details
      .sort({ createdAt: -1 });

    res.status(200).json(suggestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch suggestions" });
  }
};
export const getContactedCompanies = async (req, res) => {
  try {
    const suggestions = await Suggestions.find({
      status: "Contacted",
    }).select("company_name response");

    res.status(200).json(suggestions);
  } catch (error) {
    console.error("Error fetching contacted companies:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const recentsuggestions=async(req,res)=>{
  try
  {
//   const suggestions=await Suggestions.find(student_id=req.user_id)
const suggestions = await Suggestions.find({
      student_id: req.user.userId,
    })
      .sort({ createdAt: -1 })
    

    res.status(200).json(suggestions);

  }
  catch(error)
  {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch recent suggestions" });
  }
}

export const updatesuggestions=async(req,res)=>{
  try{
   const { id, option, Other_info,show_info } = req.body;


    const suggestion=await Suggestions.findById(id);
    suggestion.status="Contacted";
   suggestion.response = option;
suggestion.Other_info = Other_info;
suggestion.show_response=show_info;
    await suggestion.save();

      res.status(200).json({
      message: "Suggestion status updated successfully",
      suggestion,
    });

  }
  catch(error)
  {
    console.error(error);
     res.status(500).json({ message: "Failed to update the status." });
  }
}

export const deletesuggestions=async(req,res)=>{
  try{
    const {id}=req.body;
    const suggestion=await Suggestions.findById(id);
    suggestion.status="Rejected";
    await suggestion.save();
     res.status(200).json({ message: "Suggestion rejected successfully" });

  }
  catch(error)
  {
    console.error(error);
    res.status(500).json({message:"Failed to Delete the suggestion."});
  }
}