import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/rbac.js";
import { getUserDashboardStats } from "../controllers/students.js";
import { getCoursesByStudent } from "../controllers/courses.js";
import { getLessonById,updateVideoProgress,getCourseProgress } from "../controllers/lessons.js";
const router = Router();
router.use(authenticate, authorizeRoles("STUDENT"));  

router.get("/dashboard",getUserDashboardStats);
router.get("/courses", getCoursesByStudent);
router.get("/courses/:courseId/progress", getCourseProgress);
router.get("/lessons/:id", getLessonById);
router.post("/lessons/:id/progress", updateVideoProgress);


export default router;
