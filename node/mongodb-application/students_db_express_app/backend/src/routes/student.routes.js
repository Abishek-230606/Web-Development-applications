import express from "express";
import { 
  getStudents, 
  getAdminStudents, 
  getTeacherStudents, 
  getStudentSelf, 
  addStudent, 
  updateStudent, 
  removeStudent 
} from "../controllers/student.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// Role-specific GET routes
// 1. Admin route - accepts only admin token, rejects others with 403
router.get("/admin", authenticateToken, authorizeRoles("admin"), getAdminStudents);

// 2. Teacher route - accepts only teacher token, rejects others with 403
router.get("/teacher", authenticateToken, authorizeRoles("teacher"), getTeacherStudents);

// 3. Student route - accepts only student token, rejects others with 403
router.get("/student", authenticateToken, authorizeRoles("student"), getStudentSelf);

// Legacy/Default GET route (Scoped by user role)
router.get("/", authenticateToken, getStudents);   

// Mutation routes (Admin & Teacher only)
// POST - Add student/user
router.post("/", authenticateToken, authorizeRoles("admin", "teacher"), addStudent);

// PATCH - Update student details
router.patch("/:id", authenticateToken, authorizeRoles("admin", "teacher"), updateStudent);

// DELETE - Delete student
router.delete("/:id", authenticateToken, authorizeRoles("admin", "teacher"), removeStudent);

export default router;

//make use .use function to use the middleware for all the routes in this file.
// redis