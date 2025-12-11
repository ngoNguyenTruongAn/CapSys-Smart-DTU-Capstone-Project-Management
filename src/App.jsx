import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { restoreSession } from "./store/authSlice";
import Login from "./pages/Login/Login";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import VerificationCode from "./pages/ForgotPassword/VerificationCode";
import ConfirmForgot from "./pages/ForgotPassword/ConfirmForgot";
import AdminLayout from "./pages/admin/AdminLayout";
import TongQuan from "./pages/admin/TongQuan/TongQuan";
import QuanLyDoAn from "./pages/admin/QuanLyDoAn/QuanLyDoAn";
import QuanLyTaiKhoan from "./pages/admin/QuanLyTaiKhoan/QuanLyTaiKhoan";
import QuanLyNhomDeTai from "./pages/admin/QuanLyDoAn/QuanLyNhomDeTai/QuanLyNhomDeTai";
import StudentsContent from "./pages/admin/QuanLyDoAn/QuanLyNhomDeTai/StudentsContent";
import TeamsContent from "./pages/admin/QuanLyDoAn/QuanLyNhomDeTai/TeamsContent";
import MentorContent from "./pages/admin/QuanLyDoAn/QuanLyNhomDeTai/MentorContent";
import Proposals from "./pages/admin/Proposals";
import Proposaldetail from "./features/proposals/proposal-detail-UI/Proposal-detail";
import GradingPage from "./pages/grading/GradingPage";
import QuanLyHoiDong from "./pages/admin/QuanLyHoiDong/QuanLyHoiDong";
import LecturersLayout from "./pages/Lecturers/LecturersLayout";
import StudentLayout from "./pages/Student/StudentLayout";
import StudentTeamDetail from "./pages/Student/StudentTeamDetail";
import StudentProposalDetail from "./pages/Student/StudentProposalDetail";
import StudentDashboard from "./pages/Student/StudentDashboard";
function App() {
  const dispatch = useDispatch();

  // Khôi phục session từ localStorage khi app khởi động
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<TongQuan />} />
        <Route path="quan-ly-do-an" element={<QuanLyDoAn />} />
        <Route path="quan-ly-tai-khoan" element={<QuanLyTaiKhoan />} />
        <Route path="cham-diem" element={<GradingPage />} />
        <Route path="quan-ly-hoi-dong" element={<QuanLyHoiDong />} />
      </Route>
      <Route
        path="/admin/quan-ly-do-an/quan-ly-nhom-do-an"
        element={<QuanLyNhomDeTai />}
      >
        <Route index element={<StudentsContent />} />
        <Route path="nhom" element={<TeamsContent />} />
        <Route path="mentor" element={<MentorContent />} />
      </Route>
      <Route path="verification-code" element={<VerificationCode />} />
      <Route path="confirm-forgot" element={<ConfirmForgot />} />
      <Route path="/proposals" element={<Proposals />} />
      <Route path="/proposal-detail/:id" element={<Proposaldetail />} />

      <Route path="/lecturer" element={<LecturersLayout />}>
        {/* <Route index element={<Lecturers />} /> */}
      </Route>
      <Route path="/student" element={<StudentLayout />}>
        {/* <Route index element={<Students />} /> */}
        <Route index element={<StudentDashboard />} />
        <Route path="do-an-cua-toi" element={<StudentTeamDetail />} />
        
      </Route>
    </Routes>
  );
}

export default App;
