import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";
import Proposals from "./pages/admin/Proposals";
import Proposaldetail from "./features/proposals/proposal-detail-UI/Proposal-detail";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import VerificationCode from "./pages/ForgotPassword/VerificationCode";
import ConfirmForgot from "./pages/ForgotPassword/ConfirmForgot";
import AdminLayout from "./pages/admin/AdminLayout";
import TongQuan from "./pages/admin/TongQuan/TongQuan";
import QuanLyDoAn from "./pages/admin/QuanLyDoAn/QuanLyDoAn";

function App() {
  return (
    <Routes>
      {/* ====== Auth routes ====== */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verification-code" element={<VerificationCode />} />
      <Route path="/confirm-forgot" element={<ConfirmForgot />} />

      {/* ====== Proposal routes ====== */}
      <Route path="/proposal-detail/:id" element={<Proposaldetail />} />
      <Route path="/proposals" element={<Proposals />} />

      {/* ====== Admin layout ====== */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<TongQuan />} />
        <Route path="quan-ly-do-an" element={<QuanLyDoAn />} />
      </Route>
    </Routes>
  );
}

export default App;
