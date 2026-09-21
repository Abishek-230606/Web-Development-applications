import express from "express";
import { getStudents, addStudent, updateStudent, removeStudent } from "../controllers/student.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET / - Authenticated users get data scoped by role (admin=all, teacher=dept, student=self)
router.get("/", authenticateToken, getStudents);   
router.post("/", addStudent);
router.patch("/:id", authenticateToken, updateStudent);
router.delete("/:id", authenticateToken, authorizeRoles("admin"), removeStudent);

export default router;