import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:5000/quizzes"
      );

      setQuizzes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.page}>
      <h1>Available Quizzes</h1>

      <div style={styles.grid}>
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            style={styles.card}
            onClick={() =>
              navigate(`/student/quiz/${quiz.id}`)
            }
          >
            <h3>{quiz.title}</h3>

            <p>
              Module ID: {quiz.module_id}
            </p>

            <button style={styles.button}>
              Start Quiz
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "20px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(250px,1fr))",
    gap: "15px"
  },

  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    cursor: "pointer"
  },

  button: {
    marginTop: "10px",
    padding: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px"
  }
};