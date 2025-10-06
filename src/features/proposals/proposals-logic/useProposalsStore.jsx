// src/features/proposals/proposals-logic/useProposalsStore.jsx
import { create } from "zustand";

const ENV_BASE = import.meta?.env?.VITE_API_URL?.replace(/\/$/, "");
const API_BASE = ENV_BASE || "http://localhost:5295/api";
const API_HOST = API_BASE.replace(/\/api$/, "");          // để ghép URL tương đối
const PROPOSALS_URL = `${API_BASE}/Proposal`;

const parseApiResponse = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { return { success: res.ok, message: text || res.statusText, data: null }; }
};

// ====== Auth helpers (giữ nguyên) ======
const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token") || "";

const authHeaders = (base = {}, { hasBody = false, isFormData = false } = {}) => {
  const h = { ...base };
  const token = getToken();
  if (token) h["Authorization"] = `Bearer ${token}`;
  if (hasBody && !isFormData) h["Content-Type"] = "application/json";
  return h;
};

const USE_COOKIES = false;

// ====== NEW: tìm URL PDF ở mọi ngóc ngách ======
const extractPdfUrl = (input) => {
  const seen = new WeakSet();
  const isUrlLike = (s) => typeof s === "string" && /\.[Pp][Dd][Ff](\?|$)/.test(s);
  const goodKey = (k = "") => /(pdf|file|doc|attachment|document|path|url)/i.test(k);

  const dfs = (v, key = "") => {
    if (v == null) return null;

    // String candidate
    if (typeof v === "string") {
      if (isUrlLike(v)) return v;
      if (goodKey(key)) return v; // một số BE không có .pdf nhưng là URL file
      return null;
    }

    // Array
    if (Array.isArray(v)) {
      for (const item of v) {
        const found = dfs(item, key);
        if (found) return found;
      }
      return null;
    }

    // Object
    if (typeof v === "object") {
      if (seen.has(v)) return null;
      seen.add(v);
      for (const k of Object.keys(v)) {
        const val = v[k];
        // ưu tiên key “nghe” như file/pdf
        if (goodKey(k)) {
          const found = dfs(val, k);
          if (found) return found;
        }
      }
      // nếu chưa thấy, duyệt tiếp tất cả key
      for (const k of Object.keys(v)) {
        const found = dfs(v[k], k);
        if (found) return found;
      }
    }
    return null;
  };

  return dfs(input);
};

// ====== STORE ======
export const useProposalsStore = create((set, get) => ({
  isModalOpen: false,
  mode: "add",
  selectedProposal: null,
  setIsModalOpen: (v) => set({ isModalOpen: !!v }),
  openModal: (mode = "add", proposal = null) =>
    set({ isModalOpen: true, mode, selectedProposal: proposal }),
  closeModal: () => set({ isModalOpen: false, mode: "add", selectedProposal: null }),

  proposals: [],
  finalProposals: [],
  selectedProposalId: null,
  searchTerm: "",
  counts: { "Tất cả": 0, "Đã duyệt": 0, "Chờ duyệt": 0, "Bị từ chối": 0 },
  isLoading: false,
  error: null,

  setError: (err) => set({ error: err }),

  setSearchTerm: (term) => {
    const filtered = (get().proposals || []).filter((p) =>
      (p.title || "").toLowerCase().includes((term || "").toLowerCase())
    );
    set({ searchTerm: term, finalProposals: filtered });
  },

  setSelectedProposalId: (id) => {
    const proposals = get().proposals || [];
    const selected = proposals.find((p) => String(p.id) === String(id)) || null;
    set({ selectedProposalId: id, selectedProposal: selected });
  },

  setMode: (mode) => set({ mode }),

  // ====== NORMALIZE (đã nâng cấp bắt file PDF) ======
  normalizeProposal: (p) => {
    // cố gắng lấy theo các field quen thuộc trước
    let pdf =
      p?.pdfUrl ||
      p?.filePath ||
      p?.pdfPath ||
      p?.documentUrl ||
      p?.documentPath ||
      p?.fileUrl ||
      "";

    // nếu vẫn chưa có -> quét sâu toàn object
    if (!pdf) pdf = extractPdfUrl(p);

    // debug nhẹ để bạn kiểm tra BE trả gì
    if (!pdf) {
      console.log("🕵️ Không tìm thấy PDF trong item:", p);
    } else {
      console.log("📄 PDF phát hiện:", pdf);
    }

    // nếu là đường dẫn tương đối -> ghép host
    if (pdf && !/^https?:\/\//i.test(pdf)) {
      pdf = `${API_HOST}${pdf.startsWith("/") ? "" : "/"}${pdf}`;
    }

    return {
      id: String(p.projectId || p.id),
      title: p.title || "Không có tiêu đề",
      summary: p.description || p.summary || "Chưa có mô tả",
      mentor:
        p.mentor?.fullName ||
        p.lecturer?.fullName ||
        p.mentorName ||
        "Chưa có giảng viên",
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
      pdfUrl: pdf || "",
    };
  },

  // ====== ADD / GET / APPROVE / REJECT / DELETE (giữ nguyên logic trước) ======
  addProposal: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${PROPOSALS_URL}/upload`, {
        method: "POST",
        headers: authHeaders({}, { hasBody: true, isFormData: true }),
        body: formData,
        credentials: USE_COOKIES ? "include" : "same-origin",
      });
      const payload = await parseApiResponse(res);
      if (!res.ok) throw new Error(payload?.message || res.statusText || "Tạo đề tài thất bại");
      await get().fetchProposals();
      set({ isLoading: false, isModalOpen: false, mode: "add", selectedProposal: null });
      return true;
    } catch (err) {
      console.error("Lỗi khi tạo đề tài:", err);
      set({ isLoading: false, error: err.message });
      alert(`Tạo đề tài thất bại: ${err.message}`);
      return false;
    }
  },

  fetchProposals: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(PROPOSALS_URL, {
        method: "GET",
        headers: authHeaders(),
        credentials: USE_COOKIES ? "include" : "same-origin",
      });
      const payload = await parseApiResponse(res);
      if (!res.ok) throw new Error(payload?.message || res.statusText || "Lỗi tải dữ liệu");

      const rawData = payload?.data ?? payload;
      const normalizedData = (rawData || []).map(get().normalizeProposal);

      const counts = {
        "Tất cả": normalizedData.length,
        "Đã duyệt": normalizedData.filter((p) => p.status === "Đã duyệt").length,
        "Chờ duyệt": normalizedData.filter((p) => p.status === "Chờ duyệt").length,
        "Bị từ chối": normalizedData.filter((p) => p.status === "Bị từ chối").length,
      };

      set({
        proposals: normalizedData,
        finalProposals: normalizedData,
        counts,
        selectedProposalId: normalizedData[0]?.id || null,
        selectedProposal: normalizedData[0] || null,
        isLoading: false,
      });
    } catch (e) {
      console.error("Lỗi khi tải danh sách đề tài:", e);
      set({ error: e.message, isLoading: false, proposals: [], finalProposals: [] });
    }
  },

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
        headers: authHeaders({}, { hasBody: true }),
        body: JSON.stringify({ Status: "Approved" }),
        credentials: USE_COOKIES ? "include" : "same-origin",
      });
      const payload = await parseApiResponse(res);
      if (!res.ok) throw new Error(payload?.message || "Duyệt đề tài thất bại");

      await get().fetchProposals();
      set({ selectedProposalId: null, selectedProposal: null, isLoading: false });
    } catch (err) {
      console.error("Lỗi khi duyệt đề tài:", err);
      set({ error: err.message, isLoading: false });
      alert(`Duyệt thất bại: ${err.message}`);
    }
  },

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
        headers: authHeaders({}, { hasBody: true }),
        body: JSON.stringify({ Status: "Rejected", RejectionReason: "Không phù hợp" }),
        credentials: USE_COOKIES ? "include" : "same-origin",
      });
      const payload = await parseApiResponse(res);
      if (!res.ok) throw new Error(payload?.message || "Từ chối đề tài thất bại");

      await get().fetchProposals();
      set({ selectedProposalId: null, selectedProposal: null, isLoading: false });
    } catch (err) {
      console.error("Lỗi khi từ chối đề tài:", err);
      set({ error: err.message, isLoading: false });
      alert(`Từ chối thất bại: ${err.message}`);
    }
  },

  deleteProposal: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${PROPOSALS_URL}/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
        credentials: USE_COOKIES ? "include" : "same-origin",
      });
      const payload = await parseApiResponse(res);
      if (!res.ok) throw new Error(payload?.message || "Xóa đề tài thất bại");

      await get().fetchProposals();
      set({ selectedProposalId: null, selectedProposal: null, isLoading: false });
    } catch (err) {
      console.error("Lỗi khi xóa đề tài:", err);
      set({ error: err.message, isLoading: false });
      alert(`Xóa thất bại: ${err.message}`);
    }
  },

  setFilterStatus: (status) => {
    let filtered = get().proposals || [];
    if (status && status !== "Tất cả") filtered = filtered.filter((p) => p.status === status);
    set({ finalProposals: filtered });
  },
}));
