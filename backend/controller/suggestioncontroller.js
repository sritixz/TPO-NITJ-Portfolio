import Suggestions from "../models/suggestion.js"

export const savesuggestions= async(req,res)=>{
    
     try{const newSuggestions= new Suggestions({
      student_id:req.user.userId,
      company_name:req.body.company_name,
    company_linkedin:req.body.company_linkedin,
    Hr_name:req.body.Hr_name,
    Hr_contact:req.body.Hr_contact,
    HR_email:req.body.HR_email,
    Additional_Info:req.body.Additional_Info,
  });
const savedSuggestion=await newSuggestions.save();
console.log("suggestion saved successfully");
  res.status(201).json({
      message: "Suggestion submitted successfully",
      suggestion: savedSuggestion,
    });
}
catch(error)
{
  console.error(error);
  console.log("error saving suggestions");
    res.status(500).json({
      message: "Error saving suggestion",
    });
}
}

export const getsuggestions=async(req,res)=>{
     try {
    const suggestions = await Suggestions.find(); 
    res.status(200).json(suggestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch suggestions" });
  }
}

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
    const { id } = req.body;

    const suggestion=await Suggestions.findById(id);
    suggestion.status=true;
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
    await Suggestions.findByIdAndDelete(id);
     res.status(200).json({ message: "Suggestion deleted successfully" });

  }
  catch(error)
  {
    console.error(error);
    res.status(500).json({message:"Failed to Delete the suggestion."});
  }
}