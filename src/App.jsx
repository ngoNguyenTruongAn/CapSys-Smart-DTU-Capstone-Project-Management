// App.jsx
import { Route, Routes } from "react-router-dom";

import LecturersLayout from "./layouts/Lecturers/LecturersLayout";
import Login from "./pages/Login/Login";

// ... (các imports khác)
import Proposals from "./pages/admin/Proposals";
import Proposaldetail from "./features/proposals/proposal-detail-UI/Proposal-detail";

function App() {
  return (
    <Routes>
      {/* 1. Route Độc lập (Không dùng LecturersLayout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/proposals" element={<Proposals />} />

      {/* ✅ Route chi tiết đề tài — KHỚP URL /proposal-detail/1 */}
      <Route path="/proposal-detail/:id" element={<Proposaldetail />} />

      {/* 2. Route Cha cho LecturersLayout (Dùng cho các trang /lecturer/...) */}
      <Route path="/lecturer" element={<LecturersLayout />}>
        {/* Ví dụ: /lecturer/proposals */}
        <Route path="proposals" element={<Proposals />} />
      </Route>
    </Routes>
  );
}

export default App;
