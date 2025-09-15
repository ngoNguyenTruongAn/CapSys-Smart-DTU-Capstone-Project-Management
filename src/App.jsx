import { Route, Router, Routes } from "react-router-dom";
import Login from "./pages/Login/Login";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      {/* <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/lecturer" element={<LecturerDashboard />} />
        <Route path="/student" element={<StudentDashboard />} /> */}
      {/* sau này thêm ProtectedRoute để check role */}
    </Routes>
  );
}

export default App;
