import { Route, Router, Routes } from "react-router-dom";
import Login from "./pages/Login/Login";
import LecturersLayout from "./layouts/Lecturers/LecturersLayout";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import VerificationCode from "./pages/ForgotPassword/VerificationCode";
import ConfirmForgot from "./pages/ForgotPassword/ConfirmForgot";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/lecturer" element={<LecturersLayout />} />
      <Route path="verification-code" element={<VerificationCode />} />
      <Route path="confirm-forgot" element={<ConfirmForgot />} />
      {/* <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/lecturer" element={<LecturerDashboard />} />
        <Route path="/student" element={<StudentDashboard />} /> */}
      {/* sau này thêm ProtectedRoute để check role */}
    </Routes>
  );
}

export default App;
