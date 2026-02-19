import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token); 
        if (decoded.role === "STUDENT") {
          navigate("/student/dashboard", { replace: true });
        } else if (decoded.role === "ADMIN") {
          navigate("/admin/dashboard", { replace: true });
        }
      } catch (err) {
        
        localStorage.removeItem("token");
      }
    }
  }, [navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.overlay}>
        <div style={styles.card}>
          <h1 style={styles.title}>Mini LMS Platform</h1>
          <p style={styles.subtitle}>Learn. Manage. Grow.</p>

          <button
            style={styles.studentBtn}
            onClick={() => navigate("/student-login")}
          >
            Student Login
          </button>

          <button
            style={styles.adminBtn}
            onClick={() => navigate("/admin-login")}
          >
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );
}


const styles = {
  container: {
    height: "100vh",
    background: "linear-gradient(135deg,#1d2671,#c33764)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  overlay: {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(6px)"
  },
  card: {
    background: "white",
    padding: "50px",
    borderRadius: "12px",
    textAlign: "center",
    width: "360px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.3)"
  },
  title: { marginBottom: "10px", fontSize: "28px", fontWeight: "bold" },
  subtitle: { marginBottom: "30px", color: "#666" },
  studentBtn: {
    width: "100%",
    padding: "14px",
    marginBottom: "15px",
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer"
  },
  adminBtn: {
    width: "100%",
    padding: "14px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer"
  }
};
