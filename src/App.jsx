import { Route, Router, Routes } from "react-router-dom";
import Login from "./pages/Login/Login";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import VerificationCode from "./pages/ForgotPassword/VerificationCode";
import ConfirmForgot from "./pages/ForgotPassword/ConfirmForgot";
import AdminLayout from "./pages/admin/AdminLayout";
import TongQuan from "./pages/admin/TongQuan/TongQuan";
import QuanLyDoAn from "./pages/admin/QuanLyDoAn/QuanLyDoAn";
import QuanLyTaiKhoan from "./pages/admin/QuanLyTaiKhoan/QuanLyTaiKhoan";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<TongQuan />} />
        <Route path="quan-ly-do-an" element={<QuanLyDoAn />} />
        <Route path="quan-ly-tai-khoan" element={<QuanLyTaiKhoan />} />
      </Route>
      {/* <Route path="/lecturer" element={<LecturersLayout />}></Route> */}
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
