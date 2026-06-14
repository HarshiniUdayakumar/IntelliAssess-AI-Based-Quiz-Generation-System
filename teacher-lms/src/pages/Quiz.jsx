import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000",
  headers: { "Content-Type": "application/json" },
});

export default function Quiz() {
  const { moduleId } = useParams();

  const [moduleData, setModuleData] = useState(null);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [approving, setApproving] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchModule();
  }, []);

  const fetchModule = async () => {
    try {
      const res = await api.get(`/modules/${moduleId}`);
      setModuleData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const uploadPDF = async () => {
    if (!file) {
      setErrorMsg("Please select a PDF file first.");
      return;
    }

    try {
      setUploading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const formData = new FormData();
      formData.append("file", file);

      await api.post(`/modules/${moduleId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMsg("PDF uploaded successfully.");
      fetchModule();
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data?.message;
      setErrorMsg(serverMsg || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const generateQuiz = async () => {
    setGenerating(true);
    setQuestions([]);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await api.post(`/modules/${moduleId}/generate-quiz`);
      const data = res.data;

      // Backend always returns { success, message, questions, count }
      if (!data.success) {
        setErrorMsg(data.message || "Quiz generation failed.");
        return;
      }

      const qs = Array.isArray(data.questions) ? data.questions : [];

      if (qs.length === 0) {
        setErrorMsg("No questions were generated. Please try again.");
        return;
      }

      setQuestions(qs);
      setSuccessMsg(`${qs.length} question(s) generated. Review and approve below.`);
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data?.message;
      setErrorMsg(serverMsg || "Failed to connect to the server.");
    } finally {
      setGenerating(false);
    }
  };

  const approveQuiz = async () => {
    if (questions.length === 0) return;

    setApproving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await api.post(`/modules/${moduleId}/approve-quiz`, {
        questions,
      });
      const data = res.data;

      if (!data.success) {
        setErrorMsg(data.message || "Failed to approve quiz.");
        return;
      }

      setSuccessMsg(`Quiz saved successfully! (Quiz ID: ${data.quiz_id})`);
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data?.message;
      setErrorMsg(serverMsg || "Failed to connect to the server.");
    } finally {
      setApproving(false);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correct_answer: "",
        difficulty: "medium",
      },
    ]);
  };

  const deleteQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const updateQuestionText = (index, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], question: value };
    setQuestions(updated);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    const options = [...updated[qIndex].options];
    options[optIndex] = value;
    updated[qIndex] = { ...updated[qIndex], options };
    setQuestions(updated);
  };

  const updateCorrectAnswer = (qIndex, value) => {
    const updated = [...questions];
    updated[qIndex] = { ...updated[qIndex], correct_answer: value };
    setQuestions(updated);
  };

  const isBusy = uploading || generating || approving;

  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <h1 style={{ ...styles.title, color: "#111827" }}>Module Workspace</h1>
        <span style={styles.badge}>AI Quiz Generator</span>
      </div>

      {/* ── Global feedback banners ── */}
      {errorMsg && (
        <div style={styles.errorBanner}>
          ⚠️ {errorMsg}
        </div>
      )}
      {successMsg && (
        <div style={styles.successBanner}>
          ✅ {successMsg}
        </div>
      )}

      {/* ── Module info ── */}
      <div style={styles.moduleBox}>
        {moduleData ? (
          <>
            <p style={styles.moduleText}>
              📘 Module Name: <b>{moduleData.name}</b>
            </p>
            <p style={styles.moduleText}>
              📄 PDF Status:
              <b>{moduleData.pdf_path ? " Uploaded ✅" : " Not Uploaded ❌"}</b>
            </p>
            {moduleData.pdf_path && (
              <p style={styles.moduleText}>Stored File: {moduleData.pdf_path}</p>
            )}
          </>
        ) : (
          <p>Loading module...</p>
        )}
      </div>

      {/* ── Upload PDF ── */}
      <div style={styles.card}>
        <h2 style={{ ...styles.sectionTitle, color: "#111827" }}>
          Upload Learning Material
        </h2>
        <p style={styles.desc}>Upload PDF notes for this module.</p>

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => {
            setFile(e.target.files[0]);
            setErrorMsg("");
            setSuccessMsg("");
          }}
        />
        <br />
        <br />

        <button
          style={{ ...styles.button, opacity: isBusy ? 0.6 : 1 }}
          onClick={uploadPDF}
          disabled={isBusy}
        >
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>
      </div>

      {/* ── Generate Quiz ── */}
      <div style={styles.card}>
        <h2 style={{ ...styles.sectionTitle, color: "#111827" }}>
          AI Quiz Generator
        </h2>
        <p style={styles.desc}>
          Generate 5 MCQ questions automatically from the uploaded PDF.
        </p>

        <button
          style={{ ...styles.button, opacity: isBusy ? 0.6 : 1 }}
          onClick={generateQuiz}
          disabled={isBusy}
        >
          {generating ? "Generating…" : "Generate Quiz"}
        </button>

        {generating && (
          <p style={{ color: "#6b7280", fontSize: 13, marginTop: 10 }}>
            This may take 20–60 seconds depending on PDF size…
          </p>
        )}
      </div>

      {/* ── Quiz Preview ── */}
      <div style={styles.quizBox}>
        <h2 style={{ ...styles.sectionTitle, color: "#111827" }}>
          Quiz Preview
        </h2>

        {questions.length === 0 ? (
          <p style={styles.emptyText}>No quiz generated yet.</p>
        ) : (
          <>
            {questions.map((q, index) => (
              <div key={index} style={styles.questionCard}>
                <div style={styles.questionHeader}>
                  <span style={styles.questionBadge}>Question {index + 1}</span>
                  {q.difficulty && (
                    <span style={{
                      ...styles.difficultyBadge,
                      background: q.difficulty === "easy" ? "#dcfce7"
                        : q.difficulty === "hard" ? "#fee2e2" : "#fef9c3",
                      color: q.difficulty === "easy" ? "#166534"
                        : q.difficulty === "hard" ? "#991b1b" : "#854d0e",
                    }}>
                      {q.difficulty}
                    </span>
                  )}
                </div>

                {/* Question text */}
                <input
                  value={q.question}
                  onChange={(e) => updateQuestionText(index, e.target.value)}
                  placeholder="Question text"
                  style={styles.questionInput}
                />

                {/* Options */}
                {(q.options || []).map((opt, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{
                      fontWeight: 600,
                      color: opt === q.correct_answer ? "#16a34a" : "#6b7280",
                      minWidth: 20,
                    }}>
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <input
                      value={opt}
                      onChange={(e) => updateOption(index, i, e.target.value)}
                      style={{
                        ...styles.optionInput,
                        borderColor: opt === q.correct_answer ? "#86efac" : "#e5e7eb",
                        background: opt === q.correct_answer ? "#f0fdf4" : "#ffffff",
                      }}
                    />
                  </div>
                ))}

                {/* Correct answer selector */}
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <label style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
                    Correct answer:
                  </label>
                  <select
                    value={q.correct_answer || ""}
                    onChange={(e) => updateCorrectAnswer(index, e.target.value)}
                    style={styles.select}
                  >
                    <option value="">-- select --</option>
                    {(q.options || []).map((opt, i) => (
                      <option key={i} value={opt}>
                        {String.fromCharCode(65 + i)}. {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => deleteQuestion(index)}
                  style={styles.deleteButton}
                >
                  Delete Question
                </button>
              </div>
            ))}

            <div style={styles.actionBar}>
              <button
                style={{ ...styles.successButton, opacity: isBusy ? 0.6 : 1 }}
                onClick={approveQuiz}
                disabled={isBusy}
              >
                {approving ? "Saving…" : `✅ Approve & Save (${questions.length} Qs)`}
              </button>

              <button
                style={{ ...styles.secondaryButton, opacity: isBusy ? 0.6 : 1 }}
                onClick={addQuestion}
                disabled={isBusy}
              >
                ➕ Add Question
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    color: "#111827",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "12px",
    marginBottom: "20px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    margin: 0,
  },
  badge: {
    background: "#ede9fe",
    color: "#6d28d9",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
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
  successBanner: {
    background: "#f0fdf4",
    color: "#166534",
    border: "1px solid #86efac",
    borderRadius: "10px",
    padding: "12px 16px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  moduleBox: {
    background: "#f9fafb",
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    marginBottom: "20px",
  },
  moduleText: {
    margin: "8px 0",
    fontSize: "14px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "10px",
  },
  desc: {
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "15px",
  },
  button: {
    padding: "10px 16px",
    background: "#7c3aed",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  quizBox: {
    background: "#fff",
    padding: "20px",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
  },
  questionCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "18px",
    marginBottom: "16px",
  },
  questionHeader: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    marginBottom: "10px",
  },
  questionBadge: {
    background: "#eef2ff",
    color: "#4338ca",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
  },
  difficultyBadge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
  },
  questionInput: {
    width: "100%",
    padding: "10px",
    background: "#ffffff",
    color: "#111827",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    marginBottom: "12px",
    boxSizing: "border-box",
  },
  optionInput: {
    flex: 1,
    padding: "8px 10px",
    color: "#111827",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
  },
  select: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontSize: "13px",
    color: "#111827",
    background: "#fff",
  },
  deleteButton: {
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "6px 12px",
    marginTop: "12px",
    cursor: "pointer",
    fontSize: "13px",
  },
  actionBar: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
  },
  successButton: {
    padding: "10px 16px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "10px 16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  emptyText: {
    color: "#9ca3af",
  },
};