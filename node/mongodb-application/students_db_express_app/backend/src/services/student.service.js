import Student from "../models/student.model.js";
import bcrypt from "bcryptjs";

export const getAllStudents = async (page , limit , filters = {}, sort = {}) => {
  const skip = (page - 1) * limit;
  // Build the query object
  const query = { isDeleted: false, ...filters };
  
  // Get all non-deleted students matching filters with pagination
  const students = await Student.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);
  return students;
};

export const createStudent = async (studentData) => {
  const studentsWithHashedPasswords = await Promise.all(
    studentData.map(async (student) => ({
      ...student,
      password: await bcrypt.hash(student.password, 10)
    }))
  );

  return Student.insertMany(studentsWithHashedPasswords);
};

export const getStudentById = async (id) => {
  //  find one student by their ID
  const student = await Student.findById(id);
  return student;
};

export const patchStudentById = async (id, updateData) => {
  // find by Mongo _id and update, excluding deleted students
  const update = { ...updateData };
  if (update.password) {
    update.password = await bcrypt.hash(update.password, 10);
  }

  const student = await Student.findOneAndUpdate(
    { _id: id, isDeleted: false },
    update,
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