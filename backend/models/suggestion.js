import mongoose from "mongoose";
import Student from "./user_model/student.js";
const SuggestionSchema=new mongoose.Schema({
    student_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:Student,
    // required:true,
    },
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
        type:Boolean,
        // required:true,
        default:false,
    }
},{ timestamps: true }
);

const Suggestions= mongoose.model("Suggestions",SuggestionSchema);
export default Suggestions;