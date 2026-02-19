import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Modal from "../../components/Modal";
import {getStudents,createStudent,updateStudent,getAllCourses,assignCoursesToStudent,getStudentCourses,removeAssignment,} from "../../api";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignCoursesModal, setShowAssignCoursesModal] = useState(false);
  const [studentCourses, setStudentCourses] = useState([]);
  const [showAllCoursesModal, setShowAllCoursesModal] = useState(false);
  const [allCoursesWithLessons, setAllCoursesWithLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const limit = 5;

  const fetchStudents = async () => {
    const res = await getStudents({ page, limit, search });
    setStudents(res.data.students);
    setTotal(res.data.total);
  };

  useEffect(() => {
    fetchStudents();
  }, [page, search]);

  const totalPages = Math.ceil(total / limit);

  const handleAssignCourses = async (student) => {
    const res = await getStudentCourses(student.id);
    setStudentCourses(res.courses);
    setSelectedStudent(student);
    setShowAssignCoursesModal(true);
  };

  const handleViewAllCourses = async () => {
    try {
      const res = await getAllCourses();
      setAllCoursesWithLessons(res.courses);
      setShowAllCoursesModal(true);
    } catch (err) {
      alert("Failed to fetch courses");
    }
  };

  return (
    <DashboardLayout role="admin">
      <h2>Student Management</h2>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
        <input
          placeholder="Search by name, email, or ID..."
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
        />
        <button onClick={() => setShowAddModal(true)}>+ Add Student</button>
      </div>

      <table border="1" width="100%">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Unique ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.uniqueId}</td>
              <td>
                <button onClick={() => setSelectedStudent(student)}>Edit</button>
                <button onClick={() => handleAssignCourses(student)}>Assign Courses</button>
                <button onClick={handleViewAllCourses}>View All Courses</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "10px" }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i} onClick={() => setPage(i + 1)} disabled={page === i + 1}>
            {i + 1}
          </button>
        ))}
      </div>

      {/* MODALS */}

      {showAddModal && (
        <AddStudentModal onClose={() => setShowAddModal(false)} refresh={fetchStudents} />
      )}

      {selectedStudent && !showAssignCoursesModal && (
        <EditStudentModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          refresh={fetchStudents}
        />
      )}

      {showAssignCoursesModal && selectedStudent && (
        <AssignCoursesModal
          student={selectedStudent}
          assignedCourses={studentCourses}
          onClose={() => {
            setShowAssignCoursesModal(false);
            setSelectedStudent(null);
          }}
        />
      )}

      {showAllCoursesModal && (
        <AllCoursesModal
          courses={allCoursesWithLessons}
          onClose={() => {
            setShowAllCoursesModal(false);
            setAllCoursesWithLessons([]);
          }}
          onLessonClick={(lesson) => setSelectedLesson(lesson)}
        />
      )}

      {selectedLesson && (
        <LessonDetailsModal
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
        />
      )}
    </DashboardLayout>
  );
}

/* ===================== ADD STUDENT ===================== */

function AddStudentModal({ onClose, refresh }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async () => {
    await createStudent(form);
    refresh();
    onClose();
  };

  return (
    <Modal title="Add Student" onClose={onClose}>
      <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button onClick={handleSubmit}>Create</button>
    </Modal>
  );
}

/* ===================== EDIT STUDENT ===================== */

function EditStudentModal({ student, onClose, refresh }) {
  const [form, setForm] = useState({ name: student.name, email: student.email });

  const handleSubmit = async () => {
    await updateStudent(student.id, form);
    refresh();
    onClose();
  };

  return (
    <Modal title="Edit Student" onClose={onClose}>
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <button onClick={handleSubmit}>Update</button>
    </Modal>
  );
}

/* ===================== ASSIGN COURSES ===================== */

function AssignCoursesModal({ student, assignedCourses, onClose }) {
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);

  useEffect(() => {
    if (assignedCourses)
      setSelectedCourses(assignedCourses.map(c => c.id));
  }, [assignedCourses]);

  useEffect(() => {
    const fetchCourses = async () => {
      const res = await getAllCourses();
      setAllCourses(res.courses);
    };
    fetchCourses();
  }, []);

  const toggleCourse = (id) => {
    setSelectedCourses(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    await assignCoursesToStudent({
      userId: student.id,
      courseIds: selectedCourses
    });
    onClose();
  };

  return (
    <Modal title={`Assign Courses to ${student.name}`} onClose={onClose}>
      {allCourses.map(course => (
        <div key={course.id} style={{ marginBottom: "10px" }}>
          <input
            type="checkbox"
            checked={selectedCourses.includes(course.id)}
            onChange={() => toggleCourse(course.id)}
          />
          {course.name}

          {selectedCourses.includes(course.id) && (
            <button
              style={{ marginLeft: "10px", color: "red" }}
              onClick={async () => {
                await removeAssignment(student.id, course.id);
                setSelectedCourses(prev =>
                  prev.filter(id => id !== course.id)
                );
              }}
            >
              Remove
            </button>
          )}
        </div>
      ))}

      <button onClick={handleSubmit}>Save</button>
    </Modal>
  );

}

/* ===================== ALL COURSES ===================== */

function AllCoursesModal({ courses, onClose, onLessonClick }) {
  return (
    <Modal title="All Courses Details" onClose={onClose}>
      {courses.map(course => (
        <div key={course.id} style={{ marginBottom: "20px" }}>
          <h3>{course.name}</h3>
          <p><strong>Description:</strong> {course.description}</p>
          <p><strong>Total Lessons:</strong> {course.lessons?.length}</p>

          <ul>
            {course.lessons?.map(lesson => (
              <li key={lesson.id}>
                {lesson.title} ({lesson.duration} sec)
                <button onClick={() => onLessonClick(lesson)}>
                  View Lesson
                </button>
              </li>
            ))}
          </ul>
          <hr />
        </div>
      ))}
    </Modal>
  );
}

/* ===================== LESSON DETAILS ===================== */

function LessonDetailsModal({ lesson, onClose }) {
  return (
    <Modal title={lesson.title} onClose={onClose}>
      <p><strong>Description:</strong> {lesson.description}</p>
      <p><strong>Duration:</strong> {lesson.duration} seconds</p>

      <video width="100%" controls>
        <source src={lesson.videoUrl} type="video/mp4" />
      </video>

      <p>
        <a href={lesson.videoUrl} target="_blank" rel="noreferrer">
          Open Video in New Tab
        </a>
      </p>
    </Modal>
  );
}

