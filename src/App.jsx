import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login/Login";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import VerificationCode from "./pages/ForgotPassword/VerificationCode";
import ConfirmForgot from "./pages/ForgotPassword/ConfirmForgot";
import AdminLayout from "./pages/admin/AdminLayout";
import TongQuan from "./pages/admin/TongQuan/TongQuan";
import QuanLyDoAn from "./pages/admin/QuanLyDoAn/QuanLyDoAn";
import QuanLyTaiKhoan from "./pages/admin/QuanLyTaiKhoan/QuanLyTaiKhoan";

import Proposals from "./pages/admin/Proposals";
import Proposaldetail from "./features/proposals/proposal-detail-UI/Proposal-detail";

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

      <Route path="verification-code" element={<VerificationCode />} />
      <Route path="confirm-forgot" element={<ConfirmForgot />} />
      <Route path="/proposals" element={<Proposals />} />
      <Route path="/proposal-detail/:id" element={<Proposaldetail />} />
    </Routes>
  );
}

export default App;
