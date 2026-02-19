import { useEffect, useState } from "react";
import { getCurrentUser } from "../api";

export default function Header() {
  const [user, setUser] = useState({ name: "", role: "" });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <div
      style={{
        background: "#fff",
        padding: "15px 30px",
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h3>Dashboard</h3>
      <span style={{ fontWeight: "500", color: "#1f1f1f" }}>
        Welcome, {user.name ? user.name : "User"}
      </span>

    </div>
  );
}
