import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({ baseURL: "http://127.0.0.1:5000" });

export default function StudentQuiz() {
  const { quizId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await api.get(`/quizzes/${quizId}/questions`);
      const data = Array.isArray(res.data) ? res.data : [];
      setQuestions(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load quiz questions. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const submitQuiz = async () => {
    // Check all questions are answered
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setErrorMsg(`Please answer all questions (${unanswered.length} remaining).`);
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        answers: Object.keys(answers).map((id) => ({
          question_id: Number(id),
          answer: answers[id],
        })),
      };

      const res = await api.post(`/quizzes/${quizId}/submit`, payload);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data?.message;
      setErrorMsg(serverMsg || "Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.page}>
        <p style={{ color: "#6b7280" }}>Loading quiz…</p>
      </div>
    );
  }

  // ── Results screen ────────────────────────────────────────────────────────
  if (result) {
    return (
      <div style={styles.page}>
        <div style={styles.resultCard}>
          <h1>Quiz Completed 🎉</h1>
          <h2>Score: {result.score} / {result.total}</h2>
          <h3>Percentage: {result.percentage}%</h3>
        </div>

        <div style={{ marginTop: "25px" }}>
          <h2>Detailed Results</h2>

          {(result.results || []).map((item, index) => (
            <div key={index} style={styles.resultItem}>
              <h4 style={{ marginBottom: 8 }}>
                Q{index + 1}. {item.question_text || `Question ${index + 1}`}
              </h4>

              <p>
                Your Answer:{" "}
                <strong style={{ color: item.is_correct ? "#16a34a" : "#dc2626" }}>
                  {item.your_answer || "—"}
                </strong>
              </p>

              <p>
                Correct Answer:{" "}
                <strong style={{ color: "#16a34a" }}>
                  {item.correct_answer}
                </strong>
              </p>

              <p style={{ color: item.is_correct ? "#16a34a" : "#dc2626", fontWeight: "bold" }}>
                {item.is_correct ? "✅ Correct" : "❌ Wrong"}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Quiz screen ───────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Student Quiz</h1>

      {errorMsg && (
        <div style={styles.errorBanner}>⚠️ {errorMsg}</div>
      )}

      {questions.length === 0 ? (
        <p style={{ color: "#9ca3af" }}>No questions available for this quiz.</p>
      ) : (
        <>
          {questions.map((q, index) => {
            // options can be an array or individual option_a/b/c/d fields
            const options = Array.isArray(q.options)
              ? q.options
              : [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean);

            return (
              <div key={q.id} style={styles.card}>
                <h3 style={{ marginBottom: 12 }}>
                  Q{index + 1}. {q.question_text || q.question}
                </h3>

                {options.map((option, i) => {
                  const isSelected = answers[q.id] === option;
                  return (
                    <label
                      key={i}
                      style={{
                        ...styles.option,
                        background: isSelected ? "#eff6ff" : "transparent",
                        border: isSelected ? "1px solid #93c5fd" : "1px solid transparent",
                        borderRadius: 8,
                        padding: "8px 10px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleAnswer(q.id, option)}
                        style={{ marginRight: 10 }}
                      />
                      {option}
                    </label>
                  );
                })}
              </div>
            );
          })}

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              style={{
                ...styles.submitButton,
                opacity: submitting ? 0.6 : 1,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
              onClick={submitQuiz}
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit Quiz"}
            </button>

            <span style={{ fontSize: 13, color: "#6b7280" }}>
              {Object.keys(answers).length} / {questions.length} answered
            </span>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: "30px",
    maxWidth: "900px",
    margin: "auto",
  },
  title: {
    marginBottom: "25px",
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
  },
  option: {
    display: "flex",
    alignItems: "center",
    marginTop: "8px",
    transition: "background 0.15s",
  },
  submitButton: {
    padding: "12px 20px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: 15,
  },
  errorBanner: {
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    padding: "12px 16px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  resultCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "30px",
    textAlign: "center",
  },
  resultItem: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "15px",
    marginBottom: "15px",
  },
};