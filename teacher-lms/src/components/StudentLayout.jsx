import StudentSidebar from "./StudentSidebar";

export default function StudentLayout({
  children,
}) {
  return (
    <div style={styles.container}>
      <StudentSidebar />

      <div style={styles.main}>
        <div style={styles.header}>
          <h1>Student Portal</h1>

          <p>
            Access courses, notes and
            quizzes
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
      "linear-gradient(180deg,#f8fafc,#eff6ff)",
  },

  main: {
    flex: 1,
    padding: "30px",
  },

  header: {
    background: "white",

    padding: "24px",

    borderRadius: "18px",

    marginBottom: "24px",

    boxShadow:
      "0 4px 20px rgba(0,0,0,0.05)",
  },
};