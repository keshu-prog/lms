import { useState } from "react";
import { studentLogin, studentRegister } from "../api"; 

export default function StudentAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };


  const validate = () => {
    if (!email || !isValidEmail(email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    if (!password || password.length < 6) {
      alert("Password must be at least 6 characters.");
      return false;
    }

    if (!isLogin && (!name || name.length < 3)) {
      alert("Full name must be at least 3 characters.");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      const res = await studentLogin({ email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "student");
      window.location.href = "/student/dashboard"; 
    } catch (err) {
      alert(err.response?.data?.message || "Invalid credentials");
    }
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      await studentRegister({ name, email, password });
      alert("Registration successful! You can now login.");
      setIsLogin(true); 
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          {isLogin ? "Student Login" : "Student Registration"}
        </h2>

        {!isLogin && (
          <input
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          style={styles.input}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          style={{ ...styles.button, background: isLogin ? "#28a745" : "#007bff" }}
          onClick={isLogin ? handleLogin : handleRegister}
        >
          {isLogin ? "Login" : "Register"}
        </button>

        <p style={styles.toggleText}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            style={styles.toggleLink}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    background: "#eef2f7",
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
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer"
  },
  toggleText: {
    marginTop: "15px",
    textAlign: "center"
  },
  toggleLink: {
    color: "#007bff",
    cursor: "pointer",
    fontWeight: "bold"
  }
};
