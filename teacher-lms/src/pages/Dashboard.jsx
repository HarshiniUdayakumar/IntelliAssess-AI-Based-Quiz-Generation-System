import { useState, useEffect } from "react";
import axios from "axios";

export default function Dashboard() {

  const [stats, setStats] = useState({
    courses: 0,
    units: 0,
    modules: 0,
    quizzes: 0,
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:5000/dashboard"
      );

      setStats(res.data);

    } catch (error) {
      console.error("Dashboard Error:", error);
    }
  };

  return (
    <div style={styles.page}>

      {/* TITLE */}
      <h1 style={styles.title}>Dashboard Overview</h1>

      {/* STATS GRID */}
      <div style={styles.grid}>
        <Card title="Courses" value={stats.courses} />
        <Card title="Units" value={stats.units} />
        <Card title="Modules" value={stats.modules} />
        <Card title="Quizzes" value={stats.quizzes} />
      </div>

      {/* RECENT ACTIVITY */}
      <div style={styles.section}>
        <h2 style={styles.subtitle}>Recent Activity</h2>

        <div style={styles.activityCard}>
          📘 Courses in Database: {stats.courses}
        </div>

        <div style={styles.activityCard}>
          📗 Units in Database: {stats.units}
        </div>

        <div style={styles.activityCard}>
          📙 Modules in Database: {stats.modules}
        </div>

        <div style={styles.activityCard}>
          🧠 Quizzes Generated: {stats.quizzes}
        </div>
      </div>

    </div>
  );
}

/* CARD COMPONENT */
function Card({ title, value }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardValue}>{value}</p>
    </div>
  );
}

/* STYLES */
const styles = {
  page: {
    color: "#111827",
  },

  title: {
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#111827",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px",
  },

  card: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },

  cardTitle: {
    margin: 0,
    fontSize: "14px",
    color: "#6b7280",
  },

  cardValue: {
    fontSize: "24px",
    fontWeight: "bold",
    marginTop: "8px",
    color: "#111827",
  },

  section: {
    marginTop: "30px",
  },

  subtitle: {
    fontSize: "18px",
    marginBottom: "10px",
    color: "#111827",
  },

  activityCard: {
    background: "#ffffff",
    padding: "12px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    color: "#111827",
  },
};