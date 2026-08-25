import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  cgpa: {
    type: Number
  },
  age: {
    type: Number
  },
  collegeMail: {
    type: String,
    required: true
  }
});

export default studentSchema;