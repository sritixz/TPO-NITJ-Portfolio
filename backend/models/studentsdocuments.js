import mongoose from "mongoose";

const studentdocumentSchema = new mongoose.Schema({
  document_name: {
    type: String,
  },
  document_link: {
    type: String,
  },
});
const StudentDocument = mongoose.model('StudentDocument', studentdocumentSchema);
export default StudentDocument;