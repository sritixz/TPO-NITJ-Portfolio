import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  document_name: {
    type: String,
  },
  document_link: {
    type: String,
  },
});
const Document = mongoose.model('Document', documentSchema);
export default Document;