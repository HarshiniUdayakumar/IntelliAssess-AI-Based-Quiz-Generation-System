import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function StudentModule() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [moduleData, setModuleData] = useState(null);

  useEffect(() => {
    fetchModule();
  }, []);

  const fetchModule = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/modules/${moduleId}`
      );

      setModuleData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openPdf = () => {
    const fileName =
      moduleData.pdf_path.split("\\").pop();

    window.open(
      `http://127.0.0.1:5000/pdf/${fileName}`,
      "_blank"
    );
  };

  const startQuiz = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/modules/${moduleId}/quiz`
      );

      navigate(
        `/student/quiz/${res.data.id}`
      );
    } catch (err) {
      alert("Quiz not available");
      console.error(err);
    }
  };

  if (!moduleData) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={styles.page}>
      <h1>{moduleData.name}</h1>

      <div style={styles.card}>
        <h2>📄 Notes</h2>

        <p>
          Study the uploaded PDF before
          attending the quiz.
        </p>

        <button
          style={styles.button}
          onClick={openPdf}
        >
          View Notes
        </button>
      </div>

      <div style={styles.card}>
        <h2>📝 Quiz</h2>

        <p>
          Attend the module quiz after
          completing the notes.
        </p>

        <button
          style={styles.button}
          onClick={startQuiz}
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "20px",
  },

  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
  },

  button: {
    marginTop: "10px",
    padding: "10px 18px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};