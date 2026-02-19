import axios from "axios";
import { config } from "./config";
const BASE_API_URL = config.backendApiUrl || "http://localhost:5000/api";


const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Auth APIs ----
export const studentLogin = (data) => api.post("/auth/student/login", data);
export const studentRegister = (data) => api.post("/auth/student/register", data);

export const adminLogin = (data) => api.post("/auth/admin/login", data);
export const getCurrentUser = () => api.get("/auth/me");
// ---- Start Admin API ----
// ---- Dashboard APIs ----
export const getAdminDashboardData = () => api.get("/admin/dashboard");

// ---- Courses APIs ----
export const getAllcoursesWithlessons = (page = 1, limit = 10) => api.post("/admin/courses", { page, limit }); 
export const getCourse = (id) => api.get(`/admin/courses/${id}`);
export const createCourses = (data) => api.post("/admin/course", data);
export const updateCourse = (id, data) => api.put(`/admin/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/admin/courses/${id}`);

// ---- Lessons APIs ----
export const createVideoLessons = (data) => api.post("/admin/lessons", data);
export const updateLesson = (id, data) => api.put(`/admin/lessons/${id}`, data);
export const deleteLesson = (id) => api.delete(`/admin/lessons/${id}`);
export const getLesson = (id) => api.get(`/admin/lessons/${id}`);

// ---- Course-Student Assignment APIs ----
export const removeAssignment = (userId, courseId) => api.delete(`/admin/students/${userId}/courses/${courseId}`);
export const getCourseAssignments = (courseId) => api.get(`/admin/courses/${courseId}/students`);

// ---- Reports APIs ----
export const getCourseProgressReport = (courseId) => api.get(`/admin/reports/courses/${courseId}/progress`);
export const fetchStudentProgress = (page = 1, limit = 10) => api.post("/admin/students-progress", { page, limit });

export const fetchCourseProgress = (page = 1, limit = 5) =>api.post("/admin/courses-progress", { page, limit });

// ---- Users APIs ----
export const getStudents = (params) => api.get("/admin/students", { params });
export const createStudent = (data) => api.post("/admin/students", data);
export const updateStudent = (id, data) => api.put(`/admin/students/${id}`, data);
export const getAllCourses = () => api.get("/admin/courses/all").then(res => res.data);
export const assignCoursesToStudent = ({ userId, courseIds }) => api.post(`/admin/students/${userId}/assign-courses`, { courseIds });
export const getStudentCourses = (userId) =>api.get(`/admin/students/${userId}/courses`).then(res => res.data);

// ---- Enrollments & Progress ----
export const enrollStudent = (data) => api.post("/enrollments", data);
export const getProgress = (userId) => api.get(`/progress/${userId}`);

// ---- Student APIs ----
export const getStudentDashboardData = () => api.get("/student/dashboard");
export const getCoursesByStudent = () => api.get("/student/courses");
export const getLessonById = (id) => api.get(`/student/lessons/${id}`);
export const updateVideoProgress = (lessonId, data) => api.post(`/student/lessons/${lessonId}/progress`, data);
export const getCourseProgress = (courseId) => api.get(`/student/courses/${courseId}/progress`);


export default api;
