import express from "express";
import studentRoutes from "./routes/student.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/", studentRoutes);

export default app;