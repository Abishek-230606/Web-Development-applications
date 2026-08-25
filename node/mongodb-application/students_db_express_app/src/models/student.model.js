import mongoose from "mongoose";
import studentSchema from "../schemas/student.schema.js";

const Student = mongoose.model("Student", studentSchema);

export default Student;