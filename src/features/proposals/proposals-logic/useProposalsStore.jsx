// src/features/proposals/proposals-logic/useProposalsStore.jsx
import { create } from "zustand";

// ================== CONFIG ==================
const ENV_BASE = import.meta?.env?.VITE_API_URL?.replace(/\/$/, "");
const API_BASE = ENV_BASE || "http://localhost:5295/api";
let PROPOSALS_URL = `${API_BASE}/Proposal`; // Primary URL
const FALLBACK_URL = `${API_BASE}/proposals`; // Fallback nếu 404 (lowercase)

// ===== JWT helpers (KHÔNG đổi UI) =====
const getAccessToken = () => {
  // Tùy app của bạn lưu token ở đâu: localStorage / sessionStorage
  const direct =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");
  if (direct) return direct;

  // Fallback: nếu lưu object 'auth' { accessToken: "..." }
  try {
    const auth = JSON.parse(
      localStorage.getItem("auth") || sessionStorage.getItem("auth") || "{}"
    );
    if (auth?.accessToken) return auth.accessToken;
  } catch {
    return null;
  }
  return null;
};

const authHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper parse response
const parseApiResponse = async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { success: res.ok, message: text || res.statusText, data: null };
  }
};

// ================== STORE ==================
export const useProposalsStore = create((set, get) => ({
  // UI State
  isModalOpen: false,
  mode: "add",
  selectedProposal: null,
  openModal: (mode = "add", proposal = null) => {
    set({ isModalOpen: true, mode, selectedProposal: proposal });
  },
  closeModal: () => set({ isModalOpen: false }),

  // Data State
  proposals: [],
  finalProposals: [],
  selectedProposalId: null,
  searchTerm: "",
  counts: { "Tất cả": 0, "Đã duyệt": 0, "Chờ duyệt": 0, "Bị từ chối": 0 },
  isLoading: false,
  error: null,

  // ============ SETTERS ============
  setError: (err) => set({ error: err }),

  setSearchTerm: (term) => {
    const filtered = (get().proposals || []).filter((p) =>
      p.title.toLowerCase().includes((term || "").toLowerCase())
    );
    set({ searchTerm: term, finalProposals: filtered });
  },

  setSelectedProposalId: (id) => {
    const proposals = get().proposals || [];
    const selected = proposals.find((p) => String(p.id) === String(id)) || null;
    set({ selectedProposalId: id, selectedProposal: selected });
  },

  setMode: (mode) => set({ mode }),

  // ================== NORMALIZE ==================
  normalizeProposal: (p) => {
    const normalized = {
      id: String(p.projectId || p.id),
      title: p.title || "Không có tiêu đề",
      summary: p.description || p.summary || "Chưa có mô tả",
      mentor:
        p.mentor?.fullName || p.lecturer?.fullName || "Chưa có giảng viên",
      members: Array.isArray(p.teamMembers)
        ? p.teamMembers.map(
            (m) => m.fullName || m.studentName || m.name || "Thành viên"
          )
        : [],
      registerDate: p.registrationDate
        ? new Date(p.registrationDate).toLocaleDateString("vi-VN")
        : "N/A",
      status:
        p.status === "Pending" || p.status === "0" || !p.status
          ? "Chờ duyệt"
          : p.status === "Approved" || p.status === "1"
          ? "Đã duyệt"
          : p.status === "Rejected" || p.status === "2"
          ? "Bị từ chối"
          : "Chờ duyệt",
      goals: p.goals || ["Chưa cập nhật"],
      technologies: p.technologies || ["Chưa cập nhật"],
      pdfUrl: p.pdfUrl || p.filePath || p.pdfPath || "",
    };
    // console.log("Debug - Normalized proposal:", normalized);
    return normalized;
  },

  // ================== ADD PROPOSAL ==================
  addProposal: async (formData) => {
    try {
      const res = await fetch(`${PROPOSALS_URL}/upload`, {
        method: "POST",
        headers: {
          ...authHeaders(), // ✅ chỉ thêm Authorization (đừng set Content-Type cho FormData)
        },
        body: formData,
      });

      const payload = await parseApiResponse(res);
      if (!res.ok)
        throw new Error(
          payload?.message || res.statusText || "Tạo đề tài thất bại"
        );

      // console.log("Debug - Response khi tạo đề tài:", payload);
      await get().fetchProposals();
      return true;
    } catch (err) {
      console.error("Lỗi khi tạo đề tài:", err);
      alert(`Tạo đề tài thất bại: ${err.message}`);
      return false;
    }
  },

  // ================== FETCH ALL ==================
  fetchProposals: async (useFallback = false) => {
    // Thêm param để thử fallback URL
    set({ isLoading: true, error: null });
    const urlToUse = useFallback ? FALLBACK_URL : PROPOSALS_URL;
    console.log(`🔄 Fetching proposals from: ${urlToUse}`); // Debug log

    try {
      const res = await fetch(urlToUse, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...authHeaders(), // ✅ cần bearer token
        },
      });

      const payload = await parseApiResponse(res);
      console.log("📡 API Response status:", res.status, "Payload:", payload); // Debug

      if (!res.ok) {
        // Không throw nữa, set error và thử fallback nếu primary fail
        const errorMsg =
          payload?.message || res.statusText || "Lỗi tải dữ liệu";
        set({ error: errorMsg, isLoading: false });

        if (res.status === 404 && !useFallback) {
          console.warn("⚠️ Primary URL 404, thử fallback URL...");
          return get().fetchProposals(true); // Retry với fallback
        }

        // Mock data nếu vẫn fail (cho dev/test)
        if (res.status === 404) {
          console.warn("⚠️ API chưa sẵn sàng, dùng mock data...");
          const mockData = [
            {
              id: "1",
              title: "Đề tài mẫu 1: Phát triển Web App",
              summary: "Ứng dụng quản lý dự án với React và ASP.NET",
              mentor: "TS. Nguyễn Văn A",
              members: ["Sinh viên B", "Sinh viên C"],
              registerDate: "01/10/2025",
              status: "Chờ duyệt",
              goals: ["Hoàn thành MVP", "Tích hợp API"],
              technologies: ["React", "ASP.NET Core"],
              pdfUrl: "/mock/proposal1.pdf",
            },
            {
              id: "2",
              title: "Đề tài mẫu 2: AI Chatbot",
              summary: "Xây dựng chatbot hỗ trợ học tập",
              mentor: "PGS.TS. Trần Thị B",
              members: ["Sinh viên D"],
              registerDate: "15/09/2025",
              status: "Đã duyệt",
              goals: ["Train model", "Deploy trên cloud"],
              technologies: ["Python", "TensorFlow"],
              pdfUrl: "/mock/proposal2.pdf",
            },
            {
              id: "3",
              title: "Đề tài mẫu 3: Mobile App Fitness",
              summary: "Ứng dụng theo dõi sức khỏe",
              mentor: "TS. Lê Văn C",
              members: ["Sinh viên E", "Sinh viên F"],
              registerDate: "20/08/2025",
              status: "Bị từ chối",
              goals: ["UI/UX design"],
              technologies: ["Flutter", "Firebase"],
              pdfUrl: "",
            },
          ];
          const normalizedData = mockData.map(get().normalizeProposal);
          const newCounts = {
            "Tất cả": normalizedData.length,
            "Đã duyệt": normalizedData.filter((p) => p.status === "Đã duyệt")
              .length,
            "Chờ duyệt": normalizedData.filter((p) => p.status === "Chờ duyệt")
              .length,
            "Bị từ chối": normalizedData.filter(
              (p) => p.status === "Bị từ chối"
            ).length,
          };
          set({
            proposals: normalizedData,
            finalProposals: normalizedData,
            counts: newCounts,
            selectedProposalId: normalizedData[0]?.id || null,
            selectedProposal: normalizedData[0] || null,
            isLoading: false,
          });
          return; // Dừng fetch, dùng mock
        }

        return; // Nếu error khác 404, dừng và để UI handle
      }

      const rawData = payload?.data ?? payload;
      const normalizedData = (rawData || []).map(get().normalizeProposal);

      const newCounts = {
        "Tất cả": normalizedData.length,
        "Đã duyệt": normalizedData.filter((p) => p.status === "Đã duyệt")
          .length,
        "Chờ duyệt": normalizedData.filter((p) => p.status === "Chờ duyệt")
          .length,
        "Bị từ chối": normalizedData.filter((p) => p.status === "Bị từ chối")
          .length,
      };

      set({
        proposals: normalizedData,
        finalProposals: normalizedData,
        counts: newCounts,
        selectedProposalId: normalizedData[0]?.id || null,
        selectedProposal: normalizedData[0] || null,
        isLoading: false,
        error: null, // Clear error nếu success
      });
      console.log("✅ Loaded proposals:", normalizedData); // Debug
    } catch (e) {
      console.error("❌ Lỗi khi tải danh sách đề tài:", e);
      set({
        error: e.message || "Lỗi kết nối",
        isLoading: false,
        proposals: [],
        finalProposals: [],
      });
    }
  },

  // ================== APPROVE PROPOSAL ==================
  approveProposal: async (id) => {
    const { selectedProposal } = get();
    if (selectedProposal?.status !== "Chờ duyệt") {
      alert("Chỉ có thể duyệt đề tài đang chờ duyệt!");
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${PROPOSALS_URL}/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(), // ✅
        },
        body: JSON.stringify({ Status: "Approved" }),
      });

      const payload = await parseApiResponse(res);
      if (!res.ok) throw new Error(payload?.message || "Duyệt đề tài thất bại");

      await get().fetchProposals();
      set({
        selectedProposalId: null,
        selectedProposal: null,
        isLoading: false,
      });
    } catch (err) {
      console.error("Lỗi khi duyệt đề tài:", err);
      set({ error: err.message, isLoading: false });
      alert(`Duyệt thất bại: ${err.message}`);
    }
  },

  // ================== REJECT PROPOSAL ==================
  rejectProposal: async (id) => {
    const { selectedProposal } = get();
    if (selectedProposal?.status !== "Chờ duyệt") {
      alert("Chỉ có thể từ chối đề tài đang chờ duyệt!");
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${PROPOSALS_URL}/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(), // ✅
        },
        body: JSON.stringify({
          Status: "Rejected",
          RejectionReason: "Không phù hợp",
        }),
      });

      const payload = await parseApiResponse(res);
      if (!res.ok)
        throw new Error(payload?.message || "Từ chối đề tài thất bại");

      await get().fetchProposals();
      set({
        selectedProposalId: null,
        selectedProposal: null,
        isLoading: false,
      });
    } catch (err) {
      console.error("Lỗi khi từ chối đề tài:", err);
      set({ error: err.message, isLoading: false });
      alert(`Từ chối thất bại: ${err.message}`);
    }
  },

  // ================== DELETE PROPOSAL ==================
  deleteProposal: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${PROPOSALS_URL}/${id}`, {
        method: "DELETE",
        headers: {
          ...authHeaders(), // ✅
        },
      });

      const payload = await parseApiResponse(res);
      if (!res.ok) throw new Error(payload?.message || "Xóa đề tài thất bại");

      await get().fetchProposals();
      set({
        selectedProposalId: null,
        selectedProposal: null,
        isLoading: false,
      });
    } catch (err) {
      console.error("Lỗi khi xóa đề tài:", err);
      set({ error: err.message, isLoading: false });
      alert(`Xóa thất bại: ${err.message}`);
    }
  },

  // ================== EDIT PROPOSAL ==================
  updateProposal: async (id, formData) => {
    try {
      const res = await fetch(`${PROPOSALS_URL}/${id}/update`, {
        method: "POST",
        headers: {
          ...authHeaders(), // ✅ KHÔNG set Content-Type khi gửi FormData
        },
        body: formData,
      });
      const payload = await parseApiResponse(res);
      if (!res.ok)
        throw new Error(payload?.message || "Cập nhật đề tài thất bại");

      await get().fetchProposals();
      set({ isModalOpen: false, mode: "add" });
      return true;
    } catch (err) {
      console.error("Lỗi khi cập nhật đề tài:", err);
      alert(`Cập nhật thất bại: ${err.message}`);
      return false;
    }
  },

  // ===== Filter theo tab =====
  setFilterStatus: (status) => {
    let filtered = get().proposals || [];
    if (status !== "Tất cả") {
      filtered = filtered.filter((p) => p.status === status);
    }
    set({ finalProposals: filtered });
  },
}));
