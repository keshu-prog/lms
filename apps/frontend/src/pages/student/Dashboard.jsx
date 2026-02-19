import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getStudentDashboardData } from "../../api";
import {BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer} from "recharts";

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getStudentDashboardData();
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <p>Loading dashboard...</p>;

  const data = [
    {
      name: "Courses",
      Enrolled: stats.coursesEnrolled,
      Completed: stats.completedLessons,
      InProgress: stats.inProgressLessons,
      Lessons: stats.totalLessons,
    },
  ];

  return (
    <DashboardLayout role="student">
      <h2>My Learning</h2>

      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <Card title="Courses Enrolled" value={stats.coursesEnrolled} />
        <Card title="Lessons" value={stats.totalLessons} />
        <Card title="Completed" value={stats.completedLessons} />
        <Card title="In Progress" value={stats.inProgressLessons} />
      </div>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Enrolled" fill="#0056d2" />
            <Bar dataKey="Completed" fill="#10b981" />
            <Bar dataKey="InProgress" fill="#f59e0b" />
            <Bar dataKey="Lessons" fill="#6b7280" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardLayout>
  );
}

function Card({ title, value }) {
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
