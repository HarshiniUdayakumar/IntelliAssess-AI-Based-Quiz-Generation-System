import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Units from "./pages/Units";
import Modules from "./pages/Modules";
import Quiz from "./pages/Quiz";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />

          {/* CORE FLOW */}
          <Route path="/units/:courseId" element={<Units />} />
          <Route path="/modules/:unitId" element={<Modules />} />

          <Route path="/quiz/:moduleId" element={<Quiz />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}