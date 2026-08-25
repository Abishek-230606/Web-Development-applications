import Student from "../models/student.model.js";

export const getAllStudents = async () => {
  // just get all students from the database
  const students = await Student.find();
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