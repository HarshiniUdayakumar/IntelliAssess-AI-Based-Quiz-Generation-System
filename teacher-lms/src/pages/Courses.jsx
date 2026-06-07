import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Courses() {
  const navigate = useNavigate();

  const [courseList, setCourseList] = useState([]);
  const [newCourse, setNewCourse] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:5000/courses"
      );

      setCourseList(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to load courses");
    }
  };

  const addCourse = async () => {
    if (!newCourse.trim()) return;

    try {
      await axios.post(
        "http://127.0.0.1:5000/courses",
        {
          name: newCourse,
        }
      );

      setNewCourse("");

      fetchCourses();
    } catch (error) {
      console.error(error);
      alert("Failed to create course");
    }
  };

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>📚 Courses</h1>

        <p style={styles.subtitle}>
          Select a course to manage units and modules
        </p>

        {/* CENTERED CREATE BOX */}
        <div style={styles.centerWrapper}>
          <div style={styles.createBox}>
            <input
              style={styles.input}
              placeholder="New course name"
              value={newCourse}
              onChange={(e) => setNewCourse(e.target.value)}
            />

            <button
              style={styles.button}
              onClick={addCourse}
            >
              + Create
            </button>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div style={styles.grid}>
        {courseList.map((course) => (
          <div
            key={course.id}
            style={styles.card}
            onClick={() =>
              navigate(`/units/${course.id}`)
            }
          >
            <div style={styles.cardTop}>
              <span style={styles.icon}>📘</span>

              <span style={styles.badge}>
                Active
              </span>
            </div>

            <h3 style={styles.courseName}>
              {course.name}
            </h3>

            <p style={styles.desc}>
              Manage syllabus, units and
              AI-generated quizzes
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}

const styles = {
  page: {
    color: "#111827",
  },

  header: {
    marginBottom: "20px",
  },

  title: {
    fontSize: "26px",
    fontWeight: "700",
    margin: 0,
    color: "#111827",
  },

  subtitle: {
    marginTop: "5px",
    color: "#6b7280",
    fontSize: "14px",
  },

  centerWrapper: {
    display: "flex",
    justifyContent: "center",
    marginTop: "15px",
  },

  createBox: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    outline: "none",
    width: "220px",
  },

  button: {
    padding: "10px 14px",
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "15px",
    marginTop: "20px",
  },

  card: {
    background: "#ffffff",
    padding: "18px",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.04)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },

  icon: {
    fontSize: "20px",
  },

  badge: {
    fontSize: "12px",
    background: "#ecfdf5",
    color: "#047857",
    padding: "4px 8px",
    borderRadius: "6px",
  },

  courseName: {
    margin: "5px 0",
    fontSize: "18px",
    fontWeight: "600",
  },

  desc: {
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "8px",
  },
};