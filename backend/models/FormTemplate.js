import mongoose from "mongoose";

const formFieldSchema = new mongoose.Schema({
  fieldName: {
    type: String,
  },
  fieldType: {
    type: String,
    // enum: ['text', 'number', 'email', 'date', 'select'],
  },
  value: String,
  isRequired: {
    type: Boolean,
    default: false
  },
  isAutoFill: {
    type: Boolean,
    default: false
  },
  fieldStar: {
    type: Boolean,
    default: false
  },
  studentPropertyPath: String,
  options: [String],
}, { _id: false });


const formTemplateSchema = new mongoose.Schema({
  jobId: {
   type: mongoose.Schema.Types.ObjectId,
    ref: 'JobProfile',
  },
  title: {
    type: String,
  },
  fields: [formFieldSchema],
});

const FormTemplate = mongoose.model('FormTemplate', formTemplateSchema);

export default FormTemplate;