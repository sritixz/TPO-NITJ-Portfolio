import mongoose from "mongoose";
import Student from "./user_model/student.js";
const SuggestionSchema=new mongoose.Schema({
    student_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Student",
    // required:true,
    },
    faculty_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty", 
    },
<<<<<<< HEAD
    professor_id: { type: mongoose.Schema.Types.ObjectId,
         ref: "Professor" },
=======
>>>>>>> 95a9aacb050b56a2207ab2e65cacc9af1e91bbc2
    company_name:{
        type:String,
        // required: true,
    },
    company_linkedin:
    {
        type:String,
        // required:true,
    },
    Hr_name:{
        type:String,
        // required:true,
    },
    Hr_contact:{
         type:String,
        // required:true,
    },
    HR_email:{
        type:String,
        // required:true,
    },
    Additional_Info:{
        type:String,
    
    },
    status:{
        type:String,
        // required:true,
        default:"Not Contacted",
    },
    company_type:{
type:String,
    },
    sector:{
        type:String,
    },
    hiring_status:{
type:String,
    },
    response:{
        type:String,
       
    },
    show_response:{
        type:String,
        default:false,
    },
    Other_info:{
      type:String,
    }
},{ timestamps: true }
);

const Suggestions= mongoose.model("Suggestions",SuggestionSchema);
export default Suggestions;