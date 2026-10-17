import { z } from "zod";
import { getAllStudents, getStudentById, createStudent, patchStudentById, deleteStudentById } from "../services/student.service.js";
import redisClient from "../config/redis.js";

const STUDENTS_CACHE_TTL = 60;

const buildStudentsCacheKey = (req, page, limit, filters, sort) => {
  const user = req.user || {};
  const query = {
    userId: user.id || "public",
    role: user.role || "public",
    dept: filters.dept || "all",
    name: filters.name?.$regex || "",
    minCgpa: filters.cgpa?.$gte ?? "",
    page,
    limit,
    sort
  };

  return `students:${Buffer.from(JSON.stringify(query)).toString("base64url")}`;
};

const invalidateStudentsCache = async () => {
  if (!redisClient.isReady) return;

  try {
    const keys = [];
    for await (const key of redisClient.scanIterator({ MATCH: "students:*", COUNT: 100 })) {
      keys.push(key);
    }

    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.warn("Could not invalidate Redis cache:", error.message);
  }
};

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
    } else if (req.query.dept) { // 
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

    const cacheKey = buildStudentsCacheKey(req, page, limit, filters, sort);
    if (redisClient.isReady) {
      try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          return res.status(200).json({ ...JSON.parse(cachedData), cached: true });
        }
      } catch (error) {
        console.warn("Could not read Redis cache:", error.message);
      }
    }

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

    if (redisClient.isReady) {
      try {
        await redisClient.setEx(cacheKey, STUDENTS_CACHE_TTL, JSON.stringify(pageData));
      } catch (error) {
        console.warn("Could not write Redis cache:", error.message);
      }
    }

    res.status(200).json(pageData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAdminStudents = async (req, res) => {
  return getStudents(req, res);
};

export const getTeacherStudents = async (req, res) => {
  return getStudents(req, res);
};

export const getStudentSelf = async (req, res) => {
  return getStudents(req, res);
};

export const addStudent = async (req, res) => {
  try {
    const studentsData = Array.isArray(req.body) ? req.body : [req.body];

    // Validate each student using Zod
    for (let student of studentsData) {
      studentZodSchema.parse(student);
    }

    // Teacher department restriction check
    if (req.user && req.user.role === "teacher") {
      for (let student of studentsData) {
        if (student.dept !== req.user.dept) {
          return res.status(403).json({
            error: `Teachers can only add students to their own department (${req.user.dept})`
          });
        }
      }
    }

    const newStudents = await createStudent(studentsData);
    await invalidateStudentsCache();
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

    // Check if target student exists
    const existingStudent = await getStudentById(id);
    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found or deleted" });
    }

    // Teacher department restriction check
    if (req.user && req.user.role === "teacher") {
      if (existingStudent.dept !== req.user.dept) {
        return res.status(403).json({
          error: `Teachers can only update students in their own department (${req.user.dept})`
        });
      }
      if (req.body.dept && req.body.dept !== req.user.dept) {
        return res.status(403).json({
          error: `Teachers cannot assign students to a different department than (${req.user.dept})`
        });
      }
    }

    const updatedStudent = await patchStudentById(id, req.body);
    await invalidateStudentsCache();
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

    // Check if target student exists
    const existingStudent = await getStudentById(id);
    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found or already deleted" });
    }

    // Teacher department restriction check
    if (req.user && req.user.role === "teacher") {
      if (existingStudent.dept !== req.user.dept) {
        return res.status(403).json({
          error: `Teachers can only delete students in their own department (${req.user.dept})`
        });
      }
    }

    const deletedStudent = await deleteStudentById(id);
    await invalidateStudentsCache();
    res.status(200).json({ message: "Student deleted successfully", student: deletedStudent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
