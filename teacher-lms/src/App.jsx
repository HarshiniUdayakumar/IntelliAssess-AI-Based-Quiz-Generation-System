import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import StudentLayout from "./components/StudentLayout";

import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Units from "./pages/Units";
import Modules from "./pages/Modules";
import Quiz from "./pages/Quiz";

import StudentDashboard from "./pages/StudentDashboard";
import StudentQuiz from "./pages/StudentQuiz";
import StudentCourses from "./pages/StudentCourses";
import StudentUnits from "./pages/StudentUnits";
import StudentModules from "./pages/StudentModules";
import StudentModule from "./pages/StudentModule";
import Login from "./pages/Login";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* ================= TEACHER ================= */}

        <Route
          path="/"
          element={
            <ProtectedRoute role="teacher">
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses"
          element={
            <ProtectedRoute role="teacher">
              <Layout>
                <Courses />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/units/:courseId"
          element={
            <ProtectedRoute role="teacher">
              <Layout>
                <Units />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/modules/:unitId"
          element={
            <ProtectedRoute role="teacher">
              <Layout>
                <Modules />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/quiz/:moduleId"
          element={
            <ProtectedRoute role="teacher">
              <Layout>
                <Quiz />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ================= STUDENT ================= */}

        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentLayout>
                <StudentDashboard />
              </StudentLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/courses"
          element={
            <ProtectedRoute role="student">
              <StudentLayout>
                <StudentCourses />
              </StudentLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/units/:courseId"
          element={
            <ProtectedRoute role="student">
              <StudentLayout>
                <StudentUnits />
              </StudentLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/modules/:unitId"
          element={
            <ProtectedRoute role="student">
              <StudentLayout>
                <StudentModules />
              </StudentLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/module/:moduleId"
          element={
            <ProtectedRoute role="student">
              <StudentLayout>
                <StudentModule />
              </StudentLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/quiz/:quizId"
          element={
            <ProtectedRoute role="student">
              <StudentLayout>
                <StudentQuiz />
              </StudentLayout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}