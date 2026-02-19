import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/rbac.js";
import { getStudents, createStudent, updateStudent,getDashboardStats, assignCoursesToStudent, getStudentCourses,getAllCourses } from "../controllers/students.js";
import { getCourses,createCourse,updateCourse,deleteCourse,removeAssignment } from "../controllers/courses.js";
import { createVideoLessons,updateLesson,deleteLesson,getLesson } from "../controllers/lessons.js";
import { getStudentAssignments } from "../controllers/enrollments.js";
import { getStudentProgress, getCourseProgress } from "../controllers/reports.js";

const router = Router();

router.use(authenticate, authorizeRoles("ADMIN"));

// Dashboard route
router.get("/dashboard",getDashboardStats);

// Students routes
router.get("/students", getStudents);
router.post("/students", createStudent);
router.put("/students/:id", updateStudent);
router.get("/courses/all", getAllCourses);
router.post("/students/:id/assign-courses", assignCoursesToStudent);
router.get("/students/:id/courses", getStudentCourses);
router.delete("/students/:userId/courses/:courseId", removeAssignment);


    

router.post("/courses", getCourses);
router.post("/courses", createCourse);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);


router.post("/lessons", createVideoLessons);
router.put("/lessons/:id", updateLesson);
router.delete("/lessons/:id", deleteLesson);
router.get("/lessons/:id", getLesson);

router.post("/students-progress", getStudentProgress);
router.post("/courses-progress", getCourseProgress);
export default router;
