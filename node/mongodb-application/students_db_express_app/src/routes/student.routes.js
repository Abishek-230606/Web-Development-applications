import express from "express";
import { getStudents, addStudent, updateStudent, removeStudent } from "../controllers/student.controller.js";

const router = express.Router();
// admin access or teacher -> getstudents
// 
router.get("/", getStudents);   
router.post("/", addStudent);
router.patch("/:id", updateStudent);
router.delete("/:id", removeStudent);

export default router;