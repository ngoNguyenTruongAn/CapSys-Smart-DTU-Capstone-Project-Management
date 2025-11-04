import { apiFetch } from "./http";

const gradingAPI = {
  getCriteria: () => apiFetch("/grading/criteria"),

  getSessions: () => apiFetch("/grading/sessions"),

  getSessionDetail: (sessionId) =>
    apiFetch(`/grading/sessions/${sessionId}`),

  getSessionGrades: (sessionId) =>
    apiFetch(`/grading/sessions/${sessionId}/grades`),

  getTeamSessions: (teamId) =>
    apiFetch(`/grading/sessions/team/${teamId}`),

  getSessionSummary: (sessionId) =>
    apiFetch(`/grading/sessions/${sessionId}/summary`),

  quickGrade: (sessionId, payload) =>
    apiFetch(`/grading/sessions/${sessionId}/quick-grade`, {
      method: "POST",
      body: payload,
    }),

  createStudentGrade: (sessionId, payload) =>
    apiFetch(`/grading/sessions/${sessionId}/grades`, {
      method: "POST",
      body: payload,
    }),

  updateStudentGrade: (sessionId, studentId, payload) =>
    apiFetch(`/grading/sessions/${sessionId}/grades/${studentId}`, {
      method: "PUT",
      body: payload,
    }),
};

export default gradingAPI;
