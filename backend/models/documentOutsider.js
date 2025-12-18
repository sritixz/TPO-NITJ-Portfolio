import mongoose from "mongoose";

const documentOutsiderSchema = new mongoose.Schema({
  document_name: {
    type: String,
  },
  document_link: {
    type: String,
  },
});
const DocumentOutsider = mongoose.model('Document', documentOutsiderSchema);
export default DocumentOutsider;