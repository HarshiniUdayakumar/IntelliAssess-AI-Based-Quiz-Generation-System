import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function StudentModules() {
  const { unitId } = useParams();
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/units/${unitId}/modules`
      );

      setModules(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load modules");
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>📖 Modules</h1>

      <div style={styles.grid}>
        {modules.map((module) => (
          <div key={module.id} style={styles.card}>
            <h3>{module.name}</h3>

            <p>Learning material and quiz available</p>

            <button
              style={styles.button}
              onClick={() =>
                navigate(`/student/module/${module.id}`)
              }
            >
              Open Module
            </button>
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

  title: {
    marginBottom: "20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(280px,1fr))",
    gap: "15px",
  },

  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
  },

  button: {
    marginTop: "10px",
    padding: "10px 16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};