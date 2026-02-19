import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardLayout({ children, role }) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const sidebarWidth = 240;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const isSidebarFixed = windowWidth >= 768;

  return (
    <div style={{ display: "flex" }}>
     
      <div
        style={{
          width: sidebarWidth,
          position: isSidebarFixed ? "fixed" : "relative",
          top: 0,
          left: 0,
          height: isSidebarFixed ? "100vh" : "auto",
          background: "#1f2937",
          color: "#fff",
          overflowY: "auto",
          zIndex: 1000,
        }}
      >
        <Sidebar role={role} />
      </div>

     
      <div
        style={{
          marginLeft: isSidebarFixed ? sidebarWidth : 0,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Header />
        <div
          style={{
            padding: "20px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
