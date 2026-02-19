import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getAdminDashboardData } from "../../api";
import { Bar } from "react-chartjs-2";
import {Chart as ChartJS,CategoryScale,LinearScale,BarElement,Title,Tooltip,Legend} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getAdminDashboardData();
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchDashboardData();
  }, []);

  const chartData = {
    labels: dashboardData?.coursesData?.map((c) => c.courseName) || [],
    datasets: [
      {
        label: "Completed",
        data: dashboardData?.coursesData?.map((c) => c.completed) || [],
        backgroundColor: "rgba(54, 162, 235, 0.7)",
      },
      {
        label: "In Progress",
        data: dashboardData?.coursesData?.map((c) => c.inProgress) || [],
        backgroundColor: "rgba(255, 206, 86, 0.7)",
      },
    ],
  };

  return (
    <DashboardLayout role="admin">
      <h2>Admin Dashboard</h2>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "30px" }}>
        <Card title="Total Students" value={dashboardData?.studentCount || 0} />
        <Card title="Courses" value={dashboardData?.courseCount || 0} />
        <Card title="Lessons" value={dashboardData?.lessonCount || 0} />
        <Card title="Completed Lessons" value={dashboardData?.completedLessonsCount || 0} />
        <Card title="In Progress Lessons" value={dashboardData?.inProgressLessonsCount || 0} />
      </div>

      <div style={{ maxWidth: "1000px", marginTop: "40px" }}>
        <h3>Courses Progress</h3>
        <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
      </div>
    </DashboardLayout>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div
      style={{
        background: "#f5f5f5",
        padding: "20px",
        borderRadius: "8px",
        width: "180px",
        textAlign: "center",
      }}
    >
      <h4>{title}</h4>
      <h2>{value}</h2>
    </div>
  );
}
