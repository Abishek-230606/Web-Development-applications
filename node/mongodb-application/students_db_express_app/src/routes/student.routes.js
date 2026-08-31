import express from "express";
import { getStudents, addStudent, updateStudent, removeStudent } from "../controllers/student.controller.js";

const router = express.Router();

router.get("/", getStudents);
router.post("/", addStudent);
router.patch("/:name", updateStudent);
router.delete("/:name", removeStudent);

export default router;