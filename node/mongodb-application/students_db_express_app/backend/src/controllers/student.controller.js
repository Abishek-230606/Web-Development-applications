import { z } from "zod";
import { getAllStudents, createStudent, patchStudentById, deleteStudentById } from "../services/student.service.js";

// Zod Schema for validation
const studentZodSchema = z.object({
  name: z.string({ required_error: "Name is required" }),
  dept: z.enum(["CSE", "EEE", "ECE", "MECH"]),
  collegeMail: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "teacher", "student"]).optional(),
  dateOfBirth: z.string().refine((dob) => {
    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    return (currentYear - birthYear) >= 18;
  }, "Age must be greater than or equal to 18")
});

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

    // Role-Based Access Scoping:
    // 1. Student: can only view their own record
    // 2. Admin: can view all (or filter by req.query.dept)
    // 3. Teacher: can ONLY view students in their respective department
    if (req.user) {
      if (req.user.role === "student") {
        filters._id = req.user.id;
      } else if (req.user.role === "teacher") {
        filters.dept = req.user.dept;
      } else if (req.user.role === "admin" && req.query.dept) {
        filters.dept = req.query.dept;
      }
    } else if (req.query.dept) {
      filters.dept = req.query.dept;
    }
    if (req.query.name) {
      filters.name = { $regex: req.query.name, $options: "i" };
    }
    if (req.query.minCgpa) {
      filters.cgpa = { $gte: parseFloat(req.query.minCgpa) };
    }

    const sortField = req.query.sort;
    const sortFields = {
      cgpa: "cgpa",
      dateOfBirth: "dateOfBirth",
      dateOfJoin: "dateOfJoin"
    };

    if (sortField && !sortFields[sortField]) {
      return res.status(400).json({ error: "sortBy must be cgpa, dateOfBirth, or dateOfJoin" });
    }

    const sortDirection = (req.query.order || "asc").toLowerCase();
    if (!["asc", "dsc"].includes(sortDirection)) {
      return res.status(400).json({ error: "order must be asc or dsc" });
    }

    const sortValue = sortDirection === "asc" ? 1 : -1;
    const sort = sortField ? { [sortFields[sortField]]: sortValue } : {};
    const students = await getAllStudents(page, limit, filters, sort);
    
    // Format dates to YYYY-MM-DD
    const formattedStudents = students.map(student => {
      const studentObj = student.toJSON ? student.toJSON() : student;
      return {
        ...studentObj,
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.toISOString().split('T')[0] : null,
        dateOfJoin: student.dateOfJoin ? student.dateOfJoin.toISOString().split('T')[0] : null
      };
    });

    const pageData = {
      page,
      studentCount: formattedStudents.length,
      students: formattedStudents
    };

    res.status(200).json(pageData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addStudent = async (req, res) => {
  try {
    const studentsData = Array.isArray(req.body) ? req.body : [req.body];

    // Validate each student using Zod
    for (let student of studentsData) {
      studentZodSchema.parse(student);
    }

    const newStudents = await createStudent(studentsData);
    res.status(201).json({ message: `${newStudents.length} students created successfully`, students: newStudents });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        error: `A student with this collegeMail already exists: ${error.keyValue.collegeMail}`
      });
    }
    res.status(400).json({ error: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    // Validate update data using partial schema
    studentZodSchema.partial().parse(req.body);

    const { id } = req.params;
    const updatedStudent = await patchStudentById(id, req.body);
    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found or deleted" });
    }
    res.status(200).json(updatedStudent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
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