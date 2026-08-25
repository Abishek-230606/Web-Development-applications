import { getAllStudents, createStudent } from "../services/student.service.js";

export const getStudents = async (req, res) => {
  try {
    const students = await getAllStudents();
    // Return a simple list of students
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addStudent = async (req, res) => {
  try {
    const newStudent = await createStudent(req.body);
    // Return the newly created student
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};