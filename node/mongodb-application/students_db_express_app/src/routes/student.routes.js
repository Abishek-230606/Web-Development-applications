import express from "express";
import { getStudents, addStudent, updateStudent, removeStudent } from "../controllers/student.controller.js";

const router = express.Router();

router.get("/", getStudents);
router.post("/", addStudent);
router.patch("/:id", updateStudent);
router.delete("/:id", removeStudent);

export default router;