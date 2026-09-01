import { getAllStudents, createStudent, patchStudentById, deleteStudentById } from "../services/student.service.js";

export const getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // Extract filters
    const filters = {};
    if (req.query.dept) {
      filters.dept = req.query.dept; // exact match
    }
    if (req.query.name) {
      filters.name = { $regex: req.query.name, $options: "i" }; // case-insensitive partial match
    }
    if (req.query.minCgpa) {
      filters.cgpa = { $gte: parseFloat(req.query.minCgpa) }; // greater than or equal
    }

    const students = await getAllStudents(page, limit, filters);
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
    const { id } = req.params;
    const updatedStudent = await patchStudentById(id, req.body);
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
    const { id } = req.params;
    const deletedStudent = await deleteStudentById(id);
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found or already deleted" });
    }
    res.status(200).json({ message: "Student deleted successfully", student: deletedStudent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};