import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div style={styles.container}>
      <Sidebar />

      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.heading}>
            Teacher Portal
          </h1>

          <p style={styles.subHeading}>
            Manage courses, modules and
            AI-generated quizzes
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",

    background:
      "linear-gradient(180deg,#f8fafc,#eef2ff)",
  },

  main: {
    flex: 1,
    padding: "30px",
    overflowY: "auto",
  },

  header: {
    background: "white",

    borderRadius: "18px",

    padding: "24px",

    marginBottom: "24px",

    boxShadow:
      "0 4px 25px rgba(0,0,0,0.05)",
  },

  heading: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "6px",
  },

  subHeading: {
    color: "#64748b",
    fontSize: "15px",
  },
};