import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "this_secret",
  databaseUrl: process.env.DATABASE_URL || "",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  backendUrl: process.env.BACKEND_URL || "http://localhost:5000",
  backendApiUrl: process.env.BACKEND_API_URL || "http://localhost:5000/api",
};
