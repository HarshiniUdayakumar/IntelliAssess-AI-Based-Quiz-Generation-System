import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    // if role mismatch, redirect to correct dashboard
    return user.role === "teacher" ? (
      <Navigate to="/" />
    ) : (
      <Navigate to="/student" />
    );
  }

  return children;
}