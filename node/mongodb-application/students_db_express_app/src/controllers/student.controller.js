import { getAllStudents, createStudent, patchStudentById, deleteStudentById } from "../services/student.service.js";

export const getStudents = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;

    // Enforce maximum limit of 20
    if (limit > 20) {
      limit = 20;
    }
    
    // Extract filters
    const filters = {};
    if (req.query.dept) {
      filters.dept = req.query.dept;
    }
    if (req.query.name) {
      filters.name = { $regex: req.query.name, $options: "i" };
    }
    if (req.query.minCgpa) {
      filters.cgpa = { $gte: parseFloat(req.query.minCgpa) };
    }

    const students = await getAllStudents(page, limit, filters);
    
    // Format dates to YYYY-MM-DD
    const formattedStudents = students.map(student => {
      const studentObj = student.toJSON ? student.toJSON() : student;
      return {
        ...studentObj,
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.toISOString().split('T')[0] : null,
        dateOfJoin: student.dateOfJoin ? student.dateOfJoin.toISOString().split('T')[0] : null
      };
    });
    
    res.status(200).json(formattedStudents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addStudent = async (req, res) => {
  try {
    // Note: isDeleted is NOT in allowedFields - it's auto-managed by system (defaults to false)
    const allowedFields = ['name', 'dept', 'password', 'cgpa', 'dateOfBirth', 'dateOfJoin', 'collegeMail'];
    
    // Check if body is array or single object
    const isArray = Array.isArray(req.body);
    const studentsData = isArray ? req.body : [req.body];
    
    // Validate each student
    for (let student of studentsData) {
      const receivedFields = Object.keys(student);
      const unknownFields = receivedFields.filter(field => !allowedFields.includes(field));
      
      if (unknownFields.length > 0) {
        return res.status(400).json({
          error: `Bad Request: Invalid field(s) '${unknownFields.join(', ')}' not allowed. Allowed fields are: ${allowedFields.join(', ')}`
        });
      }
      
      if (receivedFields.length === 0) {
        return res.status(400).json({
          error: 'Bad Request: Request body cannot be empty. Required fields: name, dept, password, collegeMail'
        });
      }
    }
    
    // Create single or multiple students
    if (isArray) {
      const newStudents = await createStudent(studentsData);
      res.status(201).json({ message: `${newStudents.length} students created successfully`, students: newStudents });
    } else {
      const newStudent = await createStudent(req.body);
      res.status(201).json(newStudent);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    // Define allowed fields for student update
    const allowedFields = ['name', 'dept', 'password', 'cgpa', 'dateOfBirth', 'dateOfJoin', 'collegeMail', 'isDeleted'];
    
    // Check for unknown fields in request body
    const receivedFields = Object.keys(req.body);
    const unknownFields = receivedFields.filter(field => !allowedFields.includes(field));
    
    if (unknownFields.length > 0) {
      return res.status(400).json({
        error: `Bad Request: Invalid field(s) '${unknownFields.join(', ')}' not allowed. Allowed fields are: ${allowedFields.join(', ')}`
      });
    }
    
    // Check if body is empty
    if (receivedFields.length === 0) {
      return res.status(400).json({
        error: 'Bad Request: Request body cannot be empty'
      });
    }
    
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