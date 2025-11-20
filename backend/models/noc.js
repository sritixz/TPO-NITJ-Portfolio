import mongoose from "mongoose";

const NOCSchema = new mongoose.Schema({
  studentId: { type: String },
  nocId: { type: String},
  companyName: { type: String },
  respondentEmail: { type: String },
  salutation: { type: String },
  studentName: { type: String },
  rollNo: { type: String },
  batch: { type: String },
  course: {type: String,}, 
  year: {type: String,},
  semester: {type: String,},
  department: {type: String,},

  internshipFrom: { type: Date},
  internshipTo: { type: Date },
  internshipDuration: {type: String,},
  internshipMode: {type: String,},

  contactPersonName: { type: String},
  contactPersonDesignation: { type: String },
  contactPersonPhone: { type: String },
  contactPersonEmail: { type: String },
  
  companyminAgeis3: {type: Boolean,},
  companyTurnoverLastFY: {type: String,},
  companyType: {type: String,},
  stipend: {type: String,},
  bankdetails: { type:{
    bankName: { type: String },
    accountNumber: { type: String },
    accountHolderName: { type: String },
    ifscCode: { type: String }
  }},

  ownStartup: {type: Boolean,},
  startupEstablishedDate: {type: String,},
  businessRegistrationType: {type: String,},
  panNo: {type: String,},
  gstNo: {type: String,},
  startupIndiaRecognitionCertificate: {type: String,},
  MSMERegistrationCategory: {type: String,},
  startupBankDetails: { type: {
    bankName: { type: String },
    accountNumber: { type: String },
    accountHolderName: { type: String },
    ifscCode: { type: String }
  }},

  offerLetter: { type: String },
  turnoverReport: { type: String },
  mailScreenshot: { type: String },
  signature: { type: String },

  nocStatus: { type: String, default: 'Pending' },
  nocLetter: { type: String },

  locked: { type: Boolean, default: false },
}, { timestamps: true });

const NOC = mongoose.model('NOC', NOCSchema);
export default NOC;