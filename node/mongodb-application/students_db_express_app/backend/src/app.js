import express from "express";
import cors from "cors";
import studentRoutes from "./routes/student.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/", studentRoutes);

export default app;