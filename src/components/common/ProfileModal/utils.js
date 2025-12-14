// Helper function để decode JWT token
export const base64Decode = (value) => {
  if (!value) return "";
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    return window.atob(value);
  }
  if (
    typeof globalThis !== "undefined" &&
    typeof globalThis.atob === "function"
  ) {
    return globalThis.atob(value);
  }
  try {
    // Buffer is available in Node.js environment
    if (typeof Buffer !== "undefined") {
      // eslint-disable-next-line no-undef
      return Buffer.from(value, "base64").toString("binary");
    }
  } catch {
    // Ignore error
  }
  return "";
};

export const decodeJwtPayload = (token) => {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(parts[1].length + ((4 - (parts[1].length % 4)) % 4), "=");
    const decoded = base64Decode(base64);
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

// Helper function để lấy ID từ JWT token theo role
export const getUserIdFromToken = (accountType) => {
  if (typeof window === "undefined") return null;
  const token =
    window.localStorage?.getItem("token") ||
    window.localStorage?.getItem("accessToken") ||
    window.sessionStorage?.getItem("token");
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload !== "object") return null;

  const tryParseNumeric = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  };

  if (accountType === "Admin") {
    const adminKeys = [
      "AccountId",
      "accountId",
      "AdminId",
      "adminId",
      "UserId",
      "userId",
      "sub",
    ];
    for (const key of adminKeys) {
      const parsed = tryParseNumeric(payload[key]);
      if (parsed) return parsed;
    }
  } else if (accountType === "Student") {
    const studentKeys = [
      "StudentId",
      "studentId",
      "StudentID",
      "studentID",
      "AccountId",
      "accountId",
      "UserId",
      "userId",
      "sub",
    ];
    for (const key of studentKeys) {
      const parsed = tryParseNumeric(payload[key]);
      if (parsed) return parsed;
    }
  } else if (accountType === "Lecturer") {
    const lecturerKeys = [
      // ƯU TIÊN LẤY ID ĐẶC THÙ TRƯỚC
      "LecturerId",
      "lecturerId",
      "LecturerID",
      "lecturerID",

      // 2. FALLBACK về ID chung (accountId/sub)
      "AccountId",
      "accountId",
      "UserId",
      "userId",
      "sub",
    ];
    for (const key of lecturerKeys) {
      const parsed = tryParseNumeric(payload[key]);
      if (parsed) return parsed;
    }
  }

  return null;
};

// Hàm chuyển đổi accountType sang tiếng Việt
export const getAccountTypeLabel = (type) => {
  if (!type) return "";
  const typeMap = {
    Student: "Sinh viên",
    Lecturer: "Giảng viên",
    Admin: "Quản trị viên",
  };
  return typeMap[type] || type;
};
