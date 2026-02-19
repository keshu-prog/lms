import { Router } from "express";
import { studentLogin, studentRegister,adminLogin, getCurrentUser } from "../controllers/auth.js";
import { authenticate } from "../middleware/auth.js";
const router = Router();

router.post("/student/register", async (req, res, next) => {
  try {
    const user = await studentRegister(req.body);
    res.status(201).json({ message: "Student registered", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to register student", error: err.message });
  }
});

router.post("/student/login", async (req, res, next) => {
  try {
    const token = await studentLogin(req.body);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Failed to login student", error: err.message });
  }
});


router.post("/admin/login", async (req, res, next) => {
  try {
    const token = await adminLogin(req.body);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Failed to login admin", error: err.message });
  }
});

router.get("/me", authenticate, getCurrentUser);

export default router;
