import { Link } from "react-router-dom";

export default function StudentSidebar() {
  return (
    <div style={styles.sidebar}>
      <div>
        <div style={styles.brandSection}>
          <h1 style={styles.logo}>
            🎓 LearnSphere AI
          </h1>

          <p style={styles.tagline}>
            Student Portal
          </p>
        </div>

        <div style={styles.menu}>
          <Link style={styles.link} to="/student">
            🏠 Dashboard
          </Link>

          <Link
            style={styles.link}
            to="/student/courses"
          >
            📚 Courses
          </Link>

          <Link
            style={styles.link}
            to="/student"
          >
            📝 My Quizzes
          </Link>

          <Link
            style={styles.link}
            to="/student"
          >
            📊 Results
          </Link>
        </div>
      </div>

      <div style={styles.footer}>
        <div style={styles.profile}>
          <div style={styles.avatar}>
            S
          </div>

          <div>
            <h4>Welcome Back</h4>
            <p style={styles.role}>
              Student Account
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "280px",
    height: "100vh",

    background:
      "linear-gradient(180deg,#0f172a,#1e40af)",

    color: "white",

    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",

    padding: "24px",
  },

  brandSection: {
    marginBottom: "40px",
  },

  logo: {
    fontSize: "28px",
    fontWeight: "700",
  },

  tagline: {
    color: "#bfdbfe",
    marginTop: "5px",
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  link: {
    textDecoration: "none",
    color: "white",

    padding: "14px",

    borderRadius: "12px",

    background:
      "rgba(255,255,255,0.08)",
  },

  footer: {
    borderTop:
      "1px solid rgba(255,255,255,0.15)",
    paddingTop: "20px",
  },

  profile: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  avatar: {
    width: "48px",
    height: "48px",

    borderRadius: "50%",

    background:
      "linear-gradient(135deg,#60a5fa,#3b82f6)",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    fontWeight: "bold",
  },

  role: {
    fontSize: "13px",
    color: "#bfdbfe",
  },
};