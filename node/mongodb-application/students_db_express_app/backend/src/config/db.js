import mongoose from "mongoose";

const connectDB = async () => {
  try {
    //   connection to local MongoDB
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/StudentsDB");
    console.log("MongoDB Connected Successfully!");
  } catch (error) {
    console.log("Database connection failed:", error);
  }
};

export default connectDB;