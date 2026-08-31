import Student from "../models/student.model.js";

export const getAllStudents = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  // Get all non-deleted students with pagination
  const students = await Student.find({ isDeleted: false })
    .skip(skip)
    .limit(limit);
  return students;
};

export const createStudent = async (studentData) => {
  //  create a new student
  const newStudent = await Student.create(studentData);
  return newStudent;
};

export const getStudentById = async (id) => {
  //  find one student by their ID
  const student = await Student.findById(id);
  return student;
};

export const patchStudentByName = async (name, updateData) => {
  // find by name and update, excluding deleted students
  const student = await Student.findOneAndUpdate(
    { name: name, isDeleted: false },
    updateData,
    { new: true } // return updated document
  );
  return student;
};

export const deleteStudentByName = async (name) => {
  // soft delete student by setting isDeleted to true
  const student = await Student.findOneAndUpdate(
    { name: name, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
  return student;
};