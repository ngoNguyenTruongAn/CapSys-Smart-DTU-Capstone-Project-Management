// useProposalsStore.jsx
import { create } from "zustand";
import { getTeamByIdAPI, getTeamByCodeAPI } from "./TeamsAPI";
import { getLecturerProfileAPI } from "./ProfileAPI";

// ====== API base ======
const ENV_BASE = import.meta?.env?.VITE_API_URL?.replace(/\/$/, "");
const API_BASE = ENV_BASE || "http://localhost:5295/api";
const PROPOSAL_URL = `${API_BASE}/Proposal`;

// ====== auth + fetch wrappers ======
const LOGIN_URL = "http://localhost:5173/";

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token") || "";

const handleUnauthorized = () => {
  try {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
  } catch {}
  // dùng replace để không quay lại được trang lỗi bằng Back
  window.location.replace(LOGIN_URL);
};

// KHÔNG tự chèn header ở đây, để nguyên options.headers từ caller.
// Mục tiêu chỉ bắt 401 và redirect.
const fetchSafe = async (url, options = {}) => {
  const res = await fetch(url, options);
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error("Unauthorized");
  }
  return res;
};

// ====== helpers ======
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

/**
 * Decode JWT payload from token string
 */
const decodeJwtPayload = (token) => {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(parts[1].length + ((4 - (parts[1].length % 4)) % 4), "=");
    const decoded = window.atob(base64);
    return JSON.parse(
      decodeURIComponent(
        decoded
          .split("")
          .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join("")
      )
    );
  } catch {
    return null;
  }
};

/**
 * Get current account type from storage or token
 */
const getAccountType = () => {
  return (
    localStorage.getItem("accountType") ||
    sessionStorage.getItem("accountType") ||
    ""
  );
};

/**
 * Get account ID from JWT token
 */
const getAccountIdFromToken = () => {
  const token = getToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const keys = ["AccountId", "accountId", "UserId", "userId", "sub"];
  for (const key of keys) {
    const val = Number(payload[key]);
    if (Number.isFinite(val) && val > 0) return val;
  }
  return null;
};

/**
 * Get lecturer ID by fetching lecturer profile
 */
const fetchLecturerId = async () => {
  try {
    const accountId = getAccountIdFromToken();
    if (!accountId) return null;
    
    const response = await getLecturerProfileAPI(accountId);
    const responseData = response?.data || response;
    const lecturerInfo = responseData?.lecturerInfo || {};
    return lecturerInfo?.lecturerId || responseData?.lecturerId || null;
  } catch {
    return null;
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

  // hỗ trợ cả Id/Title/Description từ BE
  const id = p.id ?? p.Id ?? p.proposalId ?? p.ProposalID;
  const title =
    p.title ??
    p.Title ??
    p.proposalTitle ??
    p.ProposalTitle ??
    "(Không có tiêu đề)";
  const summary = p.summary ?? p.abstract ?? p.Description ?? "";

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
    // các component đang đọc members/teamMembers/students
    members: Array.isArray(p.members) ? p.members : [],
    registerDate,
    approveDate,
    status,
    teamId: p.teamId ?? p.TeamId,
    // giữ field PDF/Drive
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
    fetchTeamContext: async (teamCode) => {
      // Tham số là teamCode (VD: "Team1")
      if (!teamCode) return;
      set({ isTeamLoading: true });
      try {
        const res = await getTeamByCodeAPI(teamCode); // <--- Gọi hàm đã import
        const raw = res?.data || res || {}; // Lấy TeamID từ response

        const teamId =
          raw.id ||
          raw.Id ||
          raw.teamId ||
          raw.TeamId ||
          raw.data?.teamId ||
          raw.team?.teamId; // Lấy teamCode CHUẨN từ response (phòng trường hợp "team1" -> "Team1")
        const codeFromResponse =
          raw.teamCode ||
          raw.TeamCode ||
          raw.data?.teamCode ||
          raw.data?.TeamCode ||
          raw.team?.teamCode ||
          raw.team?.TeamCode ||
          String(teamCode); // <-- Dùng teamCode từ tham số làm fallback

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
            // Gán các biến đã được định nghĩa chính xác
            team: { teamId: teamId, teamCode: codeFromResponse },
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

    // ✅ ENRICH: gọi TeamsAPI để gắn members/mentor
    // ✅ FILTER: Nếu là Lecturer thì chỉ hiển thị proposals mà họ làm mentor
    fetchProposals: async () => {
      set({ isLoading: true, error: null });
      try {
        const res = await fetchSafe(`${PROPOSAL_URL}`, {
          headers: authHeaders(),
        });
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

        // Check if current user is a lecturer
        const accountType = getAccountType();
        const isLecturer = accountType?.toLowerCase() === "lecturer";
        let currentLecturerId = null;
        
        if (isLecturer) {
          currentLecturerId = await fetchLecturerId();
        }

        const enriched = await Promise.all(
          list.map(async (p) => {
            if (!p || !(p.teamId ?? p.TeamId)) return p;
            const teamId = p.teamId ?? p.TeamId;
            try {
              const tRes = await getTeamByIdAPI(teamId);
              const tRaw = tRes?.data || tRes || {};
              const members = extractMembers(tRaw);
              const mentorName = extractMentorName(tRaw);
              const mentorId = tRaw.mentorId || tRaw.MentorId || null;

              return {
                ...p,
                mentorName,
                mentorId,
                members,
                teamMembers: members,
                students: members,
              };
            } catch {
              return { ...p, members: [], teamMembers: [], students: [], mentorId: null };
            }
          })
        );

        // Filter proposals for Lecturer: only show proposals where they are the mentor
        let filteredProposals = enriched;
        if (isLecturer && currentLecturerId) {
          filteredProposals = enriched.filter((p) => {
            const proposalMentorId = p?.mentorId || null;
            return proposalMentorId === currentLecturerId;
          });
        }

        set({ proposals: filteredProposals, isLoading: false });
        recompute();
      } catch (err) {
        console.error("Lỗi fetchProposals:", err);
        set({
          isLoading: false,
          error: err?.message || "Lỗi tải đề tài",
        });
      }
    },

    // ✅ ENRICH: khi lấy chi tiết, cũng gắn members/mentor từ TeamsAPI
    fetchProposalById: async (id) => {
      if (!id) return;
      try {
        const res = await fetchSafe(`${PROPOSAL_URL}/${id}`, {
          headers: authHeaders(),
        });
        const payload = await parseApiJson(res);
        if (!res.ok)
          throw new Error(payload?.message || "Không tải được chi tiết");

        let detail = payload?.data || payload;

        // enrich nếu có teamId
        const teamId = detail?.teamId ?? detail?.TeamId;
        if (teamId) {
          try {
            const tRes = await getTeamByIdAPI(teamId);
            const tRaw = tRes?.data || tRes || {};
            const members = extractMembers(tRaw);
            const mentorName = extractMentorName(tRaw);
            detail = {
              ...detail,
              mentorName,
              members,
              teamMembers: members,
              students: members,
            };
          } catch {
            // bỏ qua nếu lỗi team
          }
        }

        const current = get().proposals || [];
        const idx = current.findIndex(
          (p) =>
            String(p.id ?? p.Id ?? p.proposalId ?? p.ProposalID) === String(id)
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
      set({ isLoading: true });
      try {
        const res = await fetchSafe(`${PROPOSAL_URL}/upload`, {
          method: "POST",
          headers: authHeaders({}, { isFormData: true }), // KHÔNG set Content-Type cho FormData
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
        set({ isLoading: false });
        return {
          success: false,
          message: e.message || "Không thể thêm đề tài",
        };
      }
    },

    approveProposal: async (id) => {
      try {
        const res = await fetchSafe(`${PROPOSAL_URL}/${id}/status`, {
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
        const res = await fetchSafe(`${PROPOSAL_URL}/${id}/status`, {
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
      set({ isLoading: true });
      try {
        const res = await fetchSafe(`${PROPOSAL_URL}/${id}`, {
          method: "DELETE",
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error("Xóa thất bại");
        await get().fetchProposals();
        return { success: true };
      } catch (e) {
        console.error("deleteProposal error:", e);
        set({ isLoading: false });
        return { success: false, message: e.message || "Xóa thất bại" };
      }
    },

    // AI Summarize Proposal - Check cache first, then call AI if needed
    summarizeProposal: async (id, forceRefresh = false) => {
      set({ isLoading: true });
      try {
        // Step 1: Check if cached summary exists (unless forceRefresh)
        if (!forceRefresh) {
          const cacheRes = await fetchSafe(`${PROPOSAL_URL}/${id}/summary`, {
            method: "GET",
            headers: authHeaders(),
          });
          const cachePayload = await parseApiJson(cacheRes);

          if (cacheRes.ok && cachePayload?.cached && cachePayload?.data) {
            console.log("Using cached AI summary from database");
            set({ isLoading: false });
            return {
              success: true,
              cached: true,
              data: cachePayload.data,
            };
          }
        }

        // Step 2: No cache or forceRefresh - call AI to generate summary
        console.log("Generating new AI summary...");
        const res = await fetchSafe(
          `${PROPOSAL_URL}/${id}/summarize?forceRefresh=${forceRefresh}`,
          {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({
              maxWordsPerSection: 150,
              language: "vi",
            }),
          }
        );
        const payload = await parseApiJson(res);
        set({ isLoading: false });

        if (!res.ok) {
          throw new Error(payload?.message || "Không thể tóm tắt đề tài");
        }

        return {
          success: true,
          cached: false,
          data: payload?.data ?? payload,
        };
      } catch (e) {
        console.error("summarizeProposal error:", e);
        set({ isLoading: false });
        return {
          success: false,
          message: e.message || "Không thể tóm tắt đề tài",
        };
      }
    },
  };
});

export const uploadStudentProposalAPI = async (formData) => {
  const res = await fetch(`${API_BASE}/student-portal/upload-proposal`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${getToken()}`,
      // Không set Content-Type để browser tự set multipart/form-data
    },
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || json.title || "Lỗi khi upload proposal");
  }
  return json; // Trả về data thành công
};