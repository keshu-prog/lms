import { Link, useNavigate } from "react-router-dom";

export default function Sidebar({ role }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/", { replace: true });
  };

  return (
    <div style={styles.sidebar}>
      <h2>AAFT LMS</h2>

      {role === "admin" && (
        <>
          <Link to="/admin/dashboard" style={styles.link}>Dashboard</Link>
          <Link to="/admin/students" style={styles.link}>Students</Link>
          <Link to="/admin/courses" style={styles.link}>Courses</Link>
          <Link to="/admin/reports" style={styles.link}>Reports</Link>
        </>
      )}

      {role === "student" && (
        <>
          <Link to="/student/dashboard" style={styles.link}>Dashboard</Link>
          <Link to="/student/courses" style={styles.link}>My Courses</Link>
        </>
      )}

      <button style={styles.logoutBtn} onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "220px",
    height: "100vh",
    background: "#111",
    color: "#fff",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    padding: "6px 0"
  },
  logoutBtn: {
    marginTop: "auto", 
    padding: "10px",
    background: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  }
};
