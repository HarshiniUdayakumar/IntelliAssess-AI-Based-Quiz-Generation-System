import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:5000/login", {
        email,
        password,
      });

      localStorage.setItem("user", JSON.stringify(res.data));
 
        const user = res.data;
        if (user.role === "teacher") {
        navigate("/");
      } else {
        navigate("/student");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        
        {/* HEADER */}
        <h1 style={styles.title}>LearnSphere AI</h1>
        <p style={styles.subtitle}>AI Powered Learning System</p>

        {/* INPUTS */}
        <div style={styles.form}>
          <label>Email</label>
          <input
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />

          <label>Password</label>
          <input
            type="password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />

          <button style={styles.button} onClick={handleLogin}>
            Login
          </button>

          <p style={styles.footer}>
            New user? <span style={{ color: "#7c3aed" }}>Register</span>
          </p>
        </div>

      </div>
    </div>
  );
}

const styles = {
  bg: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0f172a, #1e1b4b, #312e81)",
  },

  card: {
    width: "380px",
    padding: "30px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(15px)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "white",
    textAlign: "center",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
  },

  subtitle: {
    fontSize: "13px",
    opacity: 0.8,
    marginBottom: "20px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    gap: "8px",
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
    marginBottom: "10px",
  },

  button: {
    marginTop: "10px",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#7c3aed",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
  },

  footer: {
    textAlign: "center",
    marginTop: "10px",
    fontSize: "12px",
    opacity: 0.8,
  },
};