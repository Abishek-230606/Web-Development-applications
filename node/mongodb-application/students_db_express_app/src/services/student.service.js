import Student from "../models/student.model.js";

export const getAllStudents = async (page = 1, limit = 20, filters = {}) => {
  const skip = (page - 1) * limit;
  // Build the query object
  const query = { isDeleted: false, ...filters };
  
  // Get all non-deleted students matching filters with pagination
  const students = await Student.find(query)
    .skip(skip)
    .limit(limit);
  return students;
};

export const createStudent = async (studentData) => {
  // Create single or multiple students
  if (Array.isArray(studentData)) {
    // Bulk insert multiple students
    const newStudents = await Student.insertMany(studentData);
    return newStudents;
  } else {
    // Create single student
    const newStudent = await Student.create(studentData);
    return newStudent;
  }
};

export const getStudentById = async (id) => {
  //  find one student by their ID
  const student = await Student.findById(id);
  return student;
};

export const patchStudentById = async (id, updateData) => {
  // find by Mongo _id and update, excluding deleted students
  const student = await Student.findOneAndUpdate(
    { _id: id, isDeleted: false },
    updateData,
    { new: true } // return updated document
  );
  return student;
};

export const deleteStudentById = async (id) => {
  
  const student = await Student.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
  return student;
};