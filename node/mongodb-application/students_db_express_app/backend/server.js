import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { connectRedis } from "./src/config/redis.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  try {
    await connectRedis();
  } catch (error) {
    console.warn("Redis unavailable. Continuing without cache:", error.message);
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));
};

startServer();
