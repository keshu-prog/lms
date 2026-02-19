import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Landing from "./pages/Landing";
import AdminLogin from "./pages/AdminLogin";
import StudentLogin from "./pages/StudentLogin";

import AdminDashboard from "./pages/admin/Dashboard";
import Students from "./pages/admin/Students";
import Courses from "./pages/admin/Courses";
import Reports from "./pages/admin/Reports";

import StudentDashboard from "./pages/student/Dashboard";
import MyCourses from "./pages/student/MyCourses";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute role="admin">
              <Students />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute role="admin">
              <Courses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute role="admin">
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses"
          element={
            <ProtectedRoute role="student">
              <MyCourses />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
