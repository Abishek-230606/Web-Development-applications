import { z } from "zod";

export const loginSchema = z.object({
  collegeMail: z.string().min(1, "College mail is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dept: z.enum(["CSE", "EEE", "ECE", "MECH"], { required_error: "Please select a department" }),
  collegeMail: z.string().min(1, "College mail is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "teacher", "student"]).optional(),
  cgpa: z.number().min(0).max(10).optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required")
});
