import { useState } from "react";
import axios from "axios";
import { adminLogin} from "../api"; 
export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await adminLogin({ email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "admin");
      window.location = "/admin/dashboard";
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Admin Login</h2>

        <input
          style={styles.input}
          placeholder="Admin Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={styles.button} onClick={login}>
          Login as Admin
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    background: "#f4f6f9",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    background: "#fff",
    padding: "40px",
    width: "360px",
    borderRadius: "10px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
  },
  title: {
    marginBottom: "20px",
    textAlign: "center"
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #ccc"
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer"
  }
};
