import Student from "../models/student.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { collegeMail, password } = req.body;

    if (!collegeMail || !password) {
      return res.status(400).json({ error: "collegeMail and password are required" });
    }

    // Find student/user by email
    const user = await Student.findOne({ collegeMail, isDeleted: false });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate JWT Token
    const secretKey = process.env.JWT_SECRET || "mysecretkey123";
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        role: user.role,
        dept: user.dept
      },
      secretKey,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        dept: user.dept,
        collegeMail: user.collegeMail
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
