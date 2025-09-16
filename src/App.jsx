import { Route, Router, Routes } from "react-router-dom";
import Login from "./pages/Login/Login";
import LecturersLayout from "./layouts/Lecturers/LecturersLayout";

function App() {
  return (
    <Routes>
      {/* <Route path="/" element={<Login />} /> */}
      <Route path="/" element={<LecturersLayout />} />
      {/* <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/lecturer" element={<LecturerDashboard />} />
        <Route path="/student" element={<StudentDashboard />} /> */}
      {/* sau này thêm ProtectedRoute để check role */}
    </Routes>
  );
}

export default App;
