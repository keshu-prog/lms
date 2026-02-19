import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middleware/error.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import studentRoutes from "./routes/student.routes.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get("/", (req: Request, res: Response) =>
  res.send("API is running 🚀")
);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use(errorHandler);
export default app;
