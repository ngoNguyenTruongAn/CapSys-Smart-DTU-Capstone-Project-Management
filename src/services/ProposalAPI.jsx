// useProposalsStore.jsx
import { create } from "zustand";
import { getTeamByIdAPI } from "./TeamsAPI";

// ====== API base ======
const ENV_BASE = import.meta?.env?.VITE_API_URL?.replace(/\/$/, "");
const API_BASE = ENV_BASE || "http://localhost:5295/api";
const PROPOSAL_URL = `${API_BASE}/Proposal`;

// ====== helpers ======
const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token") || "";

const authHeaders = (extra = {}, { isFormData = false } = {}) => {
  const h = { ...extra };
  const token = getToken();
  if (token) h["Authorization"] = `Bearer ${token}`;
  if (!isFormData) h["Content-Type"] = "application/json";
  return h;
};

const parseApiJson = async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const firstArray = (...cands) => cands.find((x) => Array.isArray(x)) || [];

const normalizeMember = (m) => {
  if (!m || typeof m !== "object") return null;
  const fullName =
    m.fullName ||
    m.FullName ||
    m.name ||
    m.Name ||
    m.studentName ||
    m.StudentName ||
    "";

  const studentCode =
    m.studentCode || m.StudentCode || m.mssv || m.MSSV || m.student_code || "";

  if (!fullName) return null;
  return { fullName, studentCode };
};

const extractMembers = (obj) => {
  if (!obj || typeof obj !== "object") return [];

  const d = obj.data || {};
  const t = obj.team || d.team || {};

  const arr = firstArray(
    obj.teamMembers,
    obj.TeamMembers,
    obj.members,
    obj.Members,
    obj.students,
    obj.Students,
    d.teamMembers,
    d.TeamMembers,
    d.members,
    d.Members,
    d.students,
    d.Students,
    t.teamMembers,
    t.TeamMembers,
    t.members,
    t.Members,
    t.students,
    t.Students
  );

  return arr.map(normalizeMember).filter(Boolean);
};

const extractMentorName = (obj) => {
  if (!obj || typeof obj !== "object") return "";
  const d = obj.data || {};
  const t = obj.team || d.team || {};

  return (
    obj.mentorName ||
    d.mentorName ||
    t.mentorName ||
    obj.mentor?.fullName ||
    d.mentor?.fullName ||
    t.mentor?.fullName ||
    obj.lecturer?.fullName ||
    d.lecturer?.fullName ||
    t.lecturer?.fullName ||
    ""
  );
};

const toCardShape = (p) => {
  if (!p) return null;

  const id = p.id ?? p.proposalId ?? p.ProposalID;
  const title =
    p.title ?? p.proposalTitle ?? p.ProposalTitle ?? "(Không có tiêu đề)";
  const summary = p.summary ?? p.abstract ?? "";

  const registerDate =
    p.registerDate ||
    p.submittedDate ||
    p.SubmittedDate ||
    p.createdDate ||
    p.CreatedDate ||
    p.createdAt ||
    null;

  const approveDate = p.approveDate || p.approvedDate || p.ApprovedDate || null;

  const raw = String(p.status ?? p.Status ?? "").toLowerCase();
  let status = "Chờ duyệt";
  if (["approved", "đã duyệt", "approve"].some((s) => raw.includes(s)))
    status = "Đã duyệt";
  else if (["rejected", "từ chối", "reject"].some((s) => raw.includes(s)))
    status = "Bị từ chối";

  return {
    id,
    title,
    summary,
    mentor: p.mentorName || p.mentor || "",
    members: Array.isArray(p.members) ? p.members : [],
    registerDate,
    approveDate,
    status,
    teamId: p.teamId ?? p.TeamId,
    // Giữ nguyên các field liên quan đến PDF/Drive nếu có
    googleDriveUrl: p.googleDriveUrl ?? p.GoogleDriveUrl,
    googleDriveFileId: p.googleDriveFileId ?? p.GoogleDriveFileId,
    documentUrl: p.documentUrl,
    pdfUrl: p.pdfUrl,
  };
};

export const useProposalsStore = create((set, get) => {
  // tái tính toán danh sách hiển thị + đếm
  const recompute = () => {
    const { proposals, filterStatus, searchTerm } = get();
    const mapped = (proposals || []).map(toCardShape).filter(Boolean);

    const kw = (searchTerm || "").trim().toLowerCase();
    const searched = !kw
      ? mapped
      : mapped.filter(
          (x) =>
            String(x.title || "")
              .toLowerCase()
              .includes(kw) ||
            String(x.summary || "")
              .toLowerCase()
              .includes(kw)
        );

    const filtered =
      !filterStatus || filterStatus === "Tất cả"
        ? searched
        : searched.filter((x) => x.status === filterStatus);

    const counts = {
      "Tất cả": mapped.length,
      "Đã duyệt": mapped.filter((x) => x.status === "Đã duyệt").length,
      "Chờ duyệt": mapped.filter((x) => x.status === "Chờ duyệt").length,
      "Bị từ chối": mapped.filter((x) => x.status === "Bị từ chối").length,
    };

    set({ finalProposals: filtered, counts });
  };

  return {
    /* --------- UI state --------- */
    proposals: [],
    finalProposals: [],
    counts: { "Tất cả": 0, "Đã duyệt": 0, "Chờ duyệt": 0, "Bị từ chối": 0 },
    filterStatus: "Tất cả",
    searchTerm: "",

    setFilterStatus: (s) => {
      set({ filterStatus: s || "Tất cả" });
      recompute();
    },
    setSearchTerm: (t) => {
      set({ searchTerm: t || "" });
      recompute();
    },

    /* --------- Modal --------- */
    isModalOpen: false,
    openModal: () => set({ isModalOpen: true }),
    closeModal: () => set({ isModalOpen: false }),

    /* --------- Team lookup để điền form --------- */
    teamContext: null,
    isTeamLoading: false,
    fetchTeamContext: async (teamId) => {
      if (!teamId) return;
      set({ isTeamLoading: true });
      try {
        const res = await getTeamByIdAPI(teamId);
        const raw = res?.data || res || {};

        const teamCode =
          raw.teamCode ||
          raw.TeamCode ||
          raw.data?.teamCode ||
          raw.data?.TeamCode ||
          raw.team?.teamCode ||
          raw.team?.TeamCode ||
          String(teamId);

        const existingTitle =
          raw.proposalTitle ||
          raw.ProposalTitle ||
          raw.title ||
          raw.data?.proposalTitle ||
          raw.data?.title ||
          raw.team?.proposalTitle ||
          raw.team?.title ||
          "";

        const members = extractMembers(raw);
        const mentorName = extractMentorName(raw);

        set({
          teamContext: {
            team: { teamId, teamCode },
            mentorName,
            members,
            existingProposal: existingTitle ? { title: existingTitle } : null,
          },
          isTeamLoading: false,
        });
      } catch (e) {
        console.error("fetchTeamContext error:", e);
        set({ isTeamLoading: false, teamContext: null });
      }
    },

    /* --------- Proposals --------- */
    isLoading: false,
    error: null,

    fetchProposals: async () => {
      set({ isLoading: true, error: null });
      try {
        const res = await fetch(`${PROPOSAL_URL}`, { headers: authHeaders() });
        const payload = await parseApiJson(res);
        if (!res.ok)
          throw new Error(
            payload?.message ||
              res.statusText ||
              "Không tải được danh sách đề tài"
          );

        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];

        set({ proposals: list, isLoading: false });
        recompute();
      } catch (err) {
        console.error("Lỗi fetchProposals:", err);
        set({
          isLoading: false,
          error: err?.message || "Lỗi tải đề tài",
        });
      }
    },

    // 🔎 Lấy chi tiết 1 proposal & merge vào state
    fetchProposalById: async (id) => {
      if (!id) return;
      try {
        const res = await fetch(`${PROPOSAL_URL}/${id}`, {
          headers: authHeaders(),
        });
        const payload = await parseApiJson(res);
        if (!res.ok)
          throw new Error(payload?.message || "Không tải được chi tiết");

        const detail = payload?.data || payload;
        const current = get().proposals || [];
        const idx = current.findIndex(
          (p) => String(p.id ?? p.proposalId ?? p.ProposalID) === String(id)
        );

        let next;
        if (idx >= 0) {
          next = [...current];
          next[idx] = { ...next[idx], ...detail };
        } else {
          next = [...current, detail];
        }

        set({ proposals: next });
        recompute();
      } catch (e) {
        console.error("fetchProposalById error:", e);
      }
    },

    addProposal: async (formData) => {
      try {
        const res = await fetch(`${PROPOSAL_URL}/upload`, {
          method: "POST",
          headers: authHeaders({}, { isFormData: true }),
          body: formData,
        });
        const payload = await parseApiJson(res);
        if (!res.ok) {
          const msg =
            payload?.message || payload?.errors?.[0] || "Không thể thêm đề tài";
          throw new Error(msg);
        }

        await get().fetchProposals();
        return { success: true, data: payload?.data ?? payload };
      } catch (e) {
        console.error("Lỗi khi thêm đề tài:", e);
        // Truyền thông điệp BE (ví dụ: "Team này đã có proposal")
        return {
          success: false,
          message: e.message || "Không thể thêm đề tài",
        };
      }
    },

    approveProposal: async (id) => {
      try {
        const res = await fetch(`${PROPOSAL_URL}/${id}/status`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({ Status: "Approved" }),
        });

        if (res.status === 204) {
          await get().fetchProposals();
          return { success: true };
        }

        const payload = await parseApiJson(res);
        if (!res.ok)
          throw new Error(payload?.message || "Duyệt đề tài thất bại");

        await get().fetchProposals();
        return { success: true };
      } catch (err) {
        console.error("approveProposal error:", err);
        return { success: false, message: err.message || "Duyệt thất bại" };
      }
    },

    rejectProposal: async (id, reason = "Không phù hợp") => {
      try {
        const res = await fetch(`${PROPOSAL_URL}/${id}/status`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({
            Status: "Rejected",
            RejectionReason: reason,
          }),
        });

        if (res.status === 204) {
          await get().fetchProposals();
          return { success: true };
        }

        const payload = await parseApiJson(res);
        if (!res.ok)
          throw new Error(payload?.message || "Từ chối đề tài thất bại");

        await get().fetchProposals();
        return { success: true };
      } catch (err) {
        console.error("rejectProposal error:", err);
        return { success: false, message: err.message || "Từ chối thất bại" };
      }
    },

    deleteProposal: async (id) => {
      try {
        const res = await fetch(`${PROPOSAL_URL}/${id}`, {
          method: "DELETE",
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error("Xóa thất bại");
        await get().fetchProposals();
        return { success: true };
      } catch (e) {
        console.error("deleteProposal error:", e);
        return { success: false, message: e.message || "Xóa thất bại" };
      }
    },
  };
});
