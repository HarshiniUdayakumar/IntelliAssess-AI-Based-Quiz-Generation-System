import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div style={styles.sidebar}>
      <h2 style={styles.logo}>🎓 LMS Teacher</h2>

      <div style={styles.menu}>
        <Link style={styles.link} to="/">Dashboard</Link>
        <Link style={styles.link} to="/courses">Courses</Link>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "250px",
    height: "100vh",
    background: "#111827",
    color: "white",
    padding: "20px",
  },
  logo: {
    fontSize: "20px",
    marginBottom: "30px",
  },
  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  link: {
    color: "#cbd5e1",
    textDecoration: "none",
    padding: "10px",
    borderRadius: "8px",
    background: "#1f2937",
  }
};