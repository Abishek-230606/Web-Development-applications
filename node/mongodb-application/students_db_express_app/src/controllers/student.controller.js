import { getAllStudents, createStudent, patchStudentByName, deleteStudentByName } from "../services/student.service.js";

export const getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const students = await getAllStudents(page);
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addStudent = async (req, res) => {
  try {
    const newStudent = await createStudent(req.body);
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { name } = req.params;
    const updatedStudent = await patchStudentByName(name, req.body);
    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found or deleted" });
    }
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const removeStudent = async (req, res) => {
  try {
    const { name } = req.params;
    const deletedStudent = await deleteStudentByName(name);
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found or already deleted" });
    }
    res.status(200).json({ message: "Student deleted successfully", student: deletedStudent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};