import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Quiz() {
  const { moduleId } = useParams();

  const [moduleData, setModuleData] = useState(null);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [generating, setGenerating] = useState(false);

  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchModule();
  }, []);

  const fetchModule = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/modules/${moduleId}`);

      setModuleData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const uploadPDF = async () => {
    if (!file) {
      alert("Select PDF first");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      await axios.post(
        `http://127.0.0.1:5000/modules/${moduleId}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      alert("PDF uploaded successfully");

      fetchModule();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const generateQuiz = async () => {
    try {
      setGenerating(true);

      const res = await axios.post(
        `http://127.0.0.1:5000/modules/${moduleId}/generate-quiz`,
      );

      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error(err);
      alert("Quiz generation failed");
    } finally {
      setGenerating(false);
    }
  };
  const approveQuiz = async () => {
    try {
      await axios.post(
        `http://127.0.0.1:5000/modules/${moduleId}/approve-quiz`,
        {
          questions: questions,
        },
      );

      alert("Quiz approved successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to approve quiz");
    }
  };
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
      },
    ]);
  };
  const deleteQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };
  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={{ ...styles.title, color: "#111827" }}>Module Workspace</h1>

        <span style={styles.badge}>AI Quiz Generator</span>
      </div>

      {/* MODULE INFO */}
      <div style={styles.moduleBox}>
        {moduleData ? (
          <>
            <p style={styles.moduleText}>
              📘 Module Name: <b>{moduleData.name}</b>
            </p>

            <p style={styles.moduleText}>
              📄 PDF Status:
              <b>
                {" "}
                {moduleData.pdf_path ? " Uploaded ✅" : " Not Uploaded ❌"}
              </b>
            </p>

            {moduleData.pdf_path && (
              <p style={styles.moduleText}>
                Stored File: {moduleData.pdf_path}
              </p>
            )}
          </>
        ) : (
          <p>Loading module...</p>
        )}
      </div>

      {/* PDF UPLOAD */}
      <div style={styles.card}>
        <h2 style={{ ...styles.sectionTitle, color: "#111827" }}>Upload Learning Material</h2>

        <p style={styles.desc}>Upload PDF notes for this module.</p>

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <br />
        <br />

        <button style={styles.button} onClick={uploadPDF}>
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>
      </div>

      {/* AI GENERATOR */}
      <div style={styles.card}>
        <h2 style={{ ...styles.sectionTitle, color: "#111827" }}>AI Quiz Generator</h2>

        <p style={styles.desc}>
          Generate MCQ questions automatically from uploaded PDF content.
        </p>

        <button style={styles.button} onClick={generateQuiz}>
          {generating ? "Generating..." : "Generate Quiz"}
        </button>
      </div>

      {/* QUIZ PREVIEW */}
      <div style={styles.quizBox}>
        <h2 style={{ ...styles.sectionTitle, color: "#111827" }}>Quiz Preview</h2>

        {questions.length === 0 ? (
          <p style={styles.emptyText}>No quiz generated yet.</p>
        ) : (
          <>
            {questions.map((q, index) => (
              <div key={index} style={styles.questionCard}>
                <div style={styles.questionHeader}>
                  <span style={styles.questionBadge}>Question {index + 1}</span>
                </div>

                <input
                  value={q.question}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[index].question = e.target.value;
                    setQuestions(updated);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#ffffff",
                    color: "#111827",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "18px",
                    fontWeight: "600",
                    marginBottom: "15px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />

                {q.options?.map((opt, i) => (
                  <input
                    value={opt}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[index].options[i] = e.target.value;
                      setQuestions(updated);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "#ffffff",
                      color: "#111827",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      marginBottom: "8px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                ))}
              </div>
            ))}

            <div style={styles.actionBar}>
              <button style={styles.successButton} onClick={approveQuiz}>
                ✅ Approve Quiz
              </button>
              <button style={styles.secondaryButton} onClick={addQuestion}>
                ➕ Add Question
              </button>
              <button
                onClick={() => deleteQuestion(index)}
                style={{
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                Delete Question
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
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
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
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },

  questionHeader: {
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

  questionTitle: {
    marginBottom: "15px",
  },

  option: {
    padding: "10px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    marginBottom: "8px",
    background: "#fafafa",
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
