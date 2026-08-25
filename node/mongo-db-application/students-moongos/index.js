const mongoose = require("mongoose");

// Define Schema
const studentSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Name is mandatory"], 
      trim: true 
    },
    department: { 
      type: String, 
      required: true,
      // enum =[]
      uppercase: true 
    },
    cgpa: { 
      type: Number, 
      min: [0, "CGPA cannot be negative"], 
      max: [10, "CGPA cannot exceed 10"] 
    },
    age: {
      type: Number,
      min: [16, "Age must be at least 16"]
    },
    collegeMail: {
      type: String,
      unique: true,
      required: [true, "College email is mandatory"],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
    }
  }, 
  { timestamps: true }
);


const Student = mongoose.model("Students", studentSchema);

async function main() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/StudentsDB");
    console.log("Connected to MongoDB via Mongoose");

    // 2. 10 Student Records
    const studentData = [
      { name: "Karthik", department: "EEE", cgpa: 8.5, age: 21, collegeMail: "karthik@college.edu" },
      { name: "Ananya", department: "CSE", cgpa: 9.2, age: 20, collegeMail: "ananya@college.edu" },
      { name: "Rahul", department: "MECH", cgpa: 7.8, age: 22, collegeMail: "rahul@college.edu" },
      { name: "Priya", department: "ECE", cgpa: 8.9, age: 21, collegeMail: "priya@college.edu" },
      { name: "Vicky", department: "IT", cgpa: 7.4, age: 20, collegeMail: "vicky@college.edu" },
      { name: "Sneha", department: "CSE", cgpa: 9.5, age: 21, collegeMail: "sneha@college.edu" },
      { name: "Arjun", department: "EEE", cgpa: 8.1, age: 22, collegeMail: "arjun@college.edu" },
      { name: "Divya", department: "ECE", cgpa: 8.7, age: 20, collegeMail: "divya@college.edu" },
      { name: "Manoj", department: "MECH", cgpa: 6.9, age: 23, collegeMail: "manoj@college.edu" },
      { name: "Pooja", department: "IT", cgpa: 9.0, age: 21, collegeMail: "pooja@college.edu" }
    ];

    // 3. Insert Documents
    const docs = await Student.insertMany(studentData);
    console.log(`Successfully inserted ${docs.length} students.`);
    console.log("Saved documents:", docs);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    // 4. Disconnect cleanly
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

main();