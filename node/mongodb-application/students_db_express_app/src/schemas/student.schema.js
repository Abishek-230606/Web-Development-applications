import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({ 
  name: {
    type: String,
    required: true
  },
  dept: {
    type: String,
    required: true,
    enum: ['CSE', 'EEE', 'ECE', 'MECH']
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student'],
    default: 'student'
  },
  cgpa: {
    type: Number
  },
   dateOfBirth: {
    type: Date
  },
  dateOfJoin: {
    type: Date
  },
  collegeMail: {
    type: String,
    required: true,
    unique: true,
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: function (doc, ret) {
      delete ret.__v;
      delete ret.isDeleted;
      return ret;
    }
  }
});

export default studentSchema;