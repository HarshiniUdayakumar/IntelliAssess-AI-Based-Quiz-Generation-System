import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Modules() {
  const { unitId } = useParams();
  const navigate = useNavigate();

  const [moduleList, setModuleList] = useState([]);
  const [newModule, setNewModule] = useState("");

  useEffect(() => {
    fetchModules();
  }, [unitId]);

  const fetchModules = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/units/${unitId}/modules`
      );

      setModuleList(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addModule = async () => {
    if (!newModule.trim()) return;

    try {
      await axios.post(
        "http://127.0.0.1:5000/modules",
        {
          name: newModule,
          unit_id: parseInt(unitId)
        }
      );

      setNewModule("");

      fetchModules();

    } catch (error) {
      console.error(error);
      alert("Failed to create module");
    }
  };

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <button
          style={styles.backBtn}
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <h1 style={styles.title}>Modules</h1>

        <div></div>
      </div>

      {/* DESCRIPTION */}
      <p style={styles.subtitle}>
        Select a module to view learning content and generate quizzes
      </p>

      {/* CREATE MODULE */}
      <div style={styles.centerWrapper}>
        <div style={styles.createBox}>
          <input
            style={styles.input}
            placeholder="New module name"
            value={newModule}
            onChange={(e) => setNewModule(e.target.value)}
          />

          <button
            style={styles.button}
            onClick={addModule}
          >
            + Create Module
          </button>
        </div>
      </div>

      {/* MODULE GRID */}
      <div style={styles.grid}>
        {moduleList.map((mod) => (
          <div
            key={mod.id}
            style={styles.card}
            onClick={() => navigate(`/quiz/${mod.id}`)}
          >
            <div style={styles.cardTop}>
              <span style={styles.icon}>📙</span>

              <span style={styles.badge}>
                Module
              </span>
            </div>

            <h3 style={styles.moduleName}>
              {mod.name}
            </h3>

            <p style={styles.desc}>
              AI-ready learning unit for quiz generation
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}

const styles = {
  centerWrapper: {
    display: "flex",
    justifyContent: "center",
    marginTop: "15px",
    marginBottom: "10px",
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

  page: {
    color: "#111827",
  },

  header: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr 1fr",
    alignItems: "center",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "12px",
    marginBottom: "10px",
  },

  backBtn: {
    padding: "7px 12px",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#111827",
    fontSize: "14px",
  },

  title: {
    fontSize: "24px",
    fontWeight: "700",
    margin: 0,
    color: "#111827",
    textAlign: "center",
  },

  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    marginTop: "10px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "15px",
    marginTop: "20px",
  },

  card: {
    background: "#ffffff",
    padding: "18px",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    transition: "all 0.2s ease",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },

  icon: {
    fontSize: "18px",
  },

  badge: {
    fontSize: "12px",
    background: "#fef9c3",
    color: "#92400e",
    padding: "4px 8px",
    borderRadius: "6px",
  },

  moduleName: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "5px 0",
  },

  desc: {
    fontSize: "13px",
    color: "#6b7280",
  }
};