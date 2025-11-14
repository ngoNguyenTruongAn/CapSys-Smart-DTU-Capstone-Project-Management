/**
 * Grading API Service
 * Consolidated API service for grading operations using the shared http.js client
 */

import { apiFetch } from "./http";

// Use the same API base URL as ProposalAPI.jsx for proposals and teams
const ENV_BASE = import.meta?.env?.VITE_API_URL?.replace(/\/$/, "");
const API_BASE = ENV_BASE || "http://localhost:5295/api";

/**
 * Custom fetch function for proposals and teams that uses the correct base URL
 * (port 5295) instead of the default http.js base URL (port 7110)
 */
const apiFetchWithCorrectBase = async (path, options = {}) => {
  const { query, ...restOptions } = options;
  
  // Build the full URL with the correct base
  let url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  
  // Append query parameters if provided
  if (query && typeof query === "object") {
    const urlObj = new URL(url);
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlObj.searchParams.set(key, value);
      }
    });
    url = urlObj.toString();
  }
  
  // Get token from localStorage (same as ProposalAPI.jsx)
  const getToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";
  
  // Prepare headers
  const headers = new Headers();
  headers.set("Accept", "application/json");
  
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  // Merge with provided headers
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        headers.set(key, value);
      }
    });
  }
  
  // Set Content-Type if not provided and body exists
  if (options.body && !headers.has("Content-Type")) {
    if (options.body instanceof FormData) {
      // Don't set Content-Type for FormData, browser will set it with boundary
    } else {
      headers.set("Content-Type", "application/json");
    }
  }
  
  // Prepare body
  let body = options.body;
  if (body && !(body instanceof FormData) && headers.get("Content-Type") === "application/json") {
    body = typeof body === "string" ? body : JSON.stringify(body);
  }
  
  // Make the fetch request
  const response = await fetch(url, {
    method: options.method || "GET",
    headers,
    body,
    ...restOptions,
  });
  
  // Parse response
  const contentType = response.headers.get("Content-Type") || "";
  const expectsJson = contentType.includes("application/json");
  
  let responsePayload;
  try {
    responsePayload = expectsJson ? await response.json() : await response.text();
  } catch {
    responsePayload = expectsJson ? {} : "";
  }
  
  // Handle errors
  if (!response.ok) {
    const message =
      typeof responsePayload === "object" && responsePayload !== null
        ? responsePayload.message ||
          responsePayload.error ||
          response.statusText
        : response.statusText;
    const error = new Error(message || "Request failed");
    error.status = response.status;
    error.payload = responsePayload;
    throw error;
  }
  
  // Unwrap data if present (same behavior as apiFetch)
  if (
    responsePayload &&
    typeof responsePayload === "object" &&
    Object.prototype.hasOwnProperty.call(responsePayload, "data")
  ) {
    return responsePayload.data;
  }
  
  return responsePayload;
};

const GradingAPI = {
  /**
   * Get all grading criteria (7 fixed criteria)
   * @returns {Promise<Array>} Array of grading criteria
   */
  getCriteria: () => apiFetch("/grading/criteria"),

  /**
   * Get all grading sessions (Admin only)
   * @returns {Promise<Array>} Array of grading sessions
   */
  getSessions: () => apiFetch("/grading/sessions"),

  /**
   * Get grading session detail by sessionId
   * @param {number|string} sessionId - The session ID
   * @returns {Promise<Object>} Session detail with students
   */
  getSessionDetail: (sessionId) =>
    apiFetch(`/grading/sessions/${sessionId}`),

  /**
   * Get all grades for a session
   * @param {number|string} sessionId - The session ID
   * @returns {Promise<Array>} Array of student grades
   */
  getSessionGrades: (sessionId) =>
    apiFetch(`/grading/sessions/${sessionId}/grades`),

  /**
   * Get all grading sessions for a specific team
   * @param {number|string} teamId - The team ID
   * @returns {Promise<Array>} Array of grading sessions for the team
   */
  getTeamSessions: (teamId) =>
    apiFetch(`/grading/sessions/team/${teamId}`),

  /**
   * Get session summary
   * @param {number|string} sessionId - The session ID
   * @returns {Promise<Object>} Session summary
   */
  getSessionSummary: (sessionId) =>
    apiFetch(`/grading/sessions/${sessionId}/summary`),

  /**
   * Quick grade all students in a session with same scores
   * @param {number|string} sessionId - The session ID
   * @param {Object} payload - Quick grade payload
   * @returns {Promise<Object>} Result
   */
  quickGrade: (sessionId, payload) =>
    apiFetch(`/grading/sessions/${sessionId}/quick-grade`, {
      method: "POST",
      body: payload,
    }),

  /**
   * Create a new grade for a student
   * @param {number|string} sessionId - The session ID
   * @param {Object} payload - Grade payload with studentId, criteriaGrades, contributionLevel
   * @returns {Promise<Object>} Created grade
   */
  createStudentGrade: (sessionId, payload) =>
    apiFetch(`/grading/sessions/${sessionId}/grades`, {
      method: "POST",
      body: payload,
    }),

  /**
   * Update an existing student grade
   * @param {number|string} sessionId - The session ID
   * @param {number|string} studentId - The student ID
   * @param {Object} payload - Update payload with criteriaGrades, contributionLevel
   * @returns {Promise<Object>} Updated grade
   */
  updateStudentGrade: (sessionId, studentId, payload) =>
    apiFetch(`/grading/sessions/${sessionId}/grades/${studentId}`, {
      method: "PUT",
      body: payload,
    }),

  /**
   * Create a new grading session (Admin only)
   * @param {Object} payload - Session payload with sessionName, description, teamId, graderId, sessionDate
   * @returns {Promise<Object>} Created session
   */
  createSession: (payload) =>
    apiFetch("/grading/sessions", {
      method: "POST",
      body: payload,
    }),

  /**
   * Update a grading session (Admin only)
   * @param {number|string} sessionId - The session ID
   * @param {Object} payload - Update payload
   * @returns {Promise<Object>} Updated session
   */
  updateSession: (sessionId, payload) =>
    apiFetch(`/grading/sessions/${sessionId}`, {
      method: "PUT",
      body: payload,
    }),

  /**
   * Delete a grading session (Admin only)
   * @param {number|string} sessionId - The session ID
   * @returns {Promise<Object>} Deletion result
   */
  deleteSession: (sessionId) =>
    apiFetch(`/grading/sessions/${sessionId}`, {
      method: "DELETE",
    }),

  /**
   * Get all proposals (Admin/Lecturer)
   * Uses correct base URL (port 5295) to match ProposalAPI.jsx
   * @param {Object} query - Optional query parameters (status, capstoneType, page, limit)
   * @returns {Promise<Object>} Proposals data
   */
  getProposals: (query) =>
    apiFetchWithCorrectBase("/Proposal", {
      query,
    }),

  /**
   * Get proposals for a specific team
   * Uses correct base URL (port 5295) to match ProposalAPI.jsx
   * @param {number|string} teamId - The team ID
   * @returns {Promise<Array>} Array of proposals for the team
   */
  getTeamProposals: (teamId) =>
    apiFetchWithCorrectBase(`/Proposal/team/${teamId}`),

  /**
   * Get team details by ID
   * Uses correct base URL (port 5295) to match ProposalAPI.jsx
   * @param {number|string} teamId - The team ID
   * @returns {Promise<Object>} Team details
   */
  getTeam: (teamId) => apiFetchWithCorrectBase(`/Teams/${teamId}`),
};

export default GradingAPI;

