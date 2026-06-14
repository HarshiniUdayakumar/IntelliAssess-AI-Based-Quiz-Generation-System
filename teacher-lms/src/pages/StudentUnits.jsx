import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function StudentUnits() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [units, setUnits] = useState([]);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/units/${courseId}`
      );

      setUnits(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load units");
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>📚 Course Units</h1>

      <div style={styles.grid}>
        {units.map((unit) => (
          <div
            key={unit.id}
            style={styles.card}
            onClick={() =>
              navigate(`/student/modules/${unit.id}`)
            }
          >
            <h3>{unit.name}</h3>

            <p>
              Click to view modules
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

  title: {
    marginBottom: "20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(250px,1fr))",
    gap: "15px",
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
  },
};