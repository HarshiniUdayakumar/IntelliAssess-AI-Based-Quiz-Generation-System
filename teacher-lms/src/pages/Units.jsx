import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Units() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [unitList, setUnitList] = useState([]);
  const [newUnit, setNewUnit] = useState("");

  useEffect(() => {
    fetchUnits();
  }, [courseId]);

  const fetchUnits = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/units/${courseId}`
      );

      setUnitList(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addUnit = async () => {
    if (!newUnit.trim()) return;

    try {
      await axios.post(
        "http://127.0.0.1:5000/units",
        {
          name: newUnit,
          course_id: parseInt(courseId)
        }
      );

      setNewUnit("");

      fetchUnits();
    } catch (error) {
      console.error(error);
      alert("Failed to create unit");
    }
  };

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>

        {/* LEFT */}
        <div style={styles.left}>
          <button
            style={styles.backBtn}
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>

        {/* CENTER */}
        <div style={styles.center}>
          <h1 style={styles.title}>Units</h1>
        </div>

        {/* RIGHT */}
        <div style={styles.right}></div>

      </div>

      {/* DESCRIPTION */}
      <p style={styles.subtitle}>
        Select a unit to explore modules and learning content
      </p>

      {/* CREATE UNIT */}
      <div style={styles.centerWrapper}>
        <div style={styles.createBox}>
          <input
            style={styles.input}
            placeholder="New unit name"
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
          />

          <button
            style={styles.button}
            onClick={addUnit}
          >
            + Create Unit
          </button>
        </div>
      </div>

      {/* UNITS GRID */}
      <div style={styles.grid}>
        {unitList.map((unit) => (
          <div
            key={unit.id}
            style={styles.card}
            onClick={() =>
              navigate(`/modules/${unit.id}`)
            }
          >
            <div style={styles.cardTop}>
              <span style={styles.icon}>📗</span>

              <span style={styles.badge}>
                Unit
              </span>
            </div>

            <h3 style={styles.unitName}>
              {unit.name}
            </h3>

            <p style={styles.desc}>
              Contains structured modules and quizzes
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

  left: {
    display: "flex",
    justifyContent: "flex-start",
  },

  center: {
    display: "flex",
    justifyContent: "center",
  },

  right: {
    display: "flex",
    justifyContent: "flex-end",
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
  },

  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    marginTop: "10px",
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
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "4px 8px",
    borderRadius: "6px",
  },

  unitName: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "5px 0",
  },

  desc: {
    fontSize: "13px",
    color: "#6b7280",
  },
};