import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { fetchStudentProgress, fetchCourseProgress } from "../../api";

export default function Reports() {
  const [studentData, setStudentData] = useState([]);
  const [courseData, setCourseData] = useState([]);
  const [studentPage, setStudentPage] = useState(1);
  const [coursePage, setCoursePage] = useState(1);
  const [studentTotal, setStudentTotal] = useState(0);
  const [courseTotal, setCourseTotal] = useState(0);
  const limit = 10;

  const loadStudents = async (page) => {
    const res = await fetchStudentProgress(page, limit);
    setStudentData(res.data.data);
    setStudentTotal(res.data.totalCount);
  };

  const loadCourses = async (page) => {
    const res = await fetchCourseProgress(page, limit);
    setCourseData(res.data.data);
    setCourseTotal(res.data.totalCount);
  };

  useEffect(() => {
    loadStudents(studentPage);
    loadCourses(coursePage);
  }, [studentPage, coursePage]);

  const totalStudentPages = Math.ceil(studentTotal / limit);
  const totalCoursePages = Math.ceil(courseTotal / limit);

  return (
    <DashboardLayout role="admin">
      <h2>Reports & Analytics</h2>
      <h3>Student-wise Completion</h3>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Student</th>
            <th>Total Lessons</th>
            <th>Completed</th>
            <th>Completion %</th>
            <th>Time Spent </th>
          </tr>
        </thead>
        <tbody>
          {studentData.map((sp) => (
            <tr key={sp.studentId}>
              <td>{sp.studentName}</td>
              <td>{sp.totalLessons}</td>
              <td>{sp.completedLessons}</td>
              <td>{sp.completion}%</td>
              <td>{sp.timeSpentFormatted}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        currentPage={studentPage}
        totalPages={totalStudentPages}
        onPageChange={setStudentPage}
      />

      
      <h3>Course-wise Completion</h3>
      {courseData.map((c) => (
        <div key={c.courseId} style={{ marginBottom: "30px" }}>
          <h4>Course Name: {c.courseName}</h4>
          <table border="1" cellPadding="8" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Completed Lessons</th>
                <th>Completion %</th>
                <th>Time Spent</th>
              </tr>
            </thead>
            <tbody>
              {c.studentsProgress.map((sp) => (
                <tr key={sp.studentId}>
                  <td>{sp.studentName}</td>
                  <td>{sp.completedLessons}</td>
                  <td>{sp.completion}%</td>
                  <td>{sp.timeSpentFormatted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <Pagination
        currentPage={coursePage}
        totalPages={totalCoursePages}
        onPageChange={setCoursePage}
      />
    </DashboardLayout>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div style={{ margin: "15px 0" }}>
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Prev
      </button>
      <span style={{ margin: "0 10px" }}>
        Page {currentPage} of {totalPages}
      </span>
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}
