import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import GradingAPI from "../../services/GradingAPI";
import { getLecturerProfileAPI } from "../../services/ProfileAPI";
import { getCommitteeByIdAPI } from "../../services/CommitteeAPI";
import styles from "./GradingDetailPage.module.css";
import Toasts from "../../components/ui/Toasts.jsx";
import LoadingFullScreen from "../../components/ui/LoadingFullScreen";


const toScoreValue = (value) =>
  value === null || value === undefined ? "" : String(value);

const toCommentValue = (value) =>
  value === null || value === undefined ? "" : String(value);

/**
 * Format score input value:
 * 1. Remove leading zeros (e.g., "07" -> "7")
 * 2. Clamp to max 10 if greater than 10
 * 3. Clamp to 0 if less than 0
 * @param {string} value - Raw input value
 * @param {number} maxScore - Maximum allowed score (default 10)
 * @returns {string} Formatted score value
 */
const formatScoreInput = (value, maxScore = 10) => {
  // Allow empty input
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  // Convert to string for manipulation
  let strValue = String(value);

  // Allow just a decimal point or negative sign for typing in progress
  if (strValue === "." || strValue === "-" || strValue === "-.") {
    return strValue;
  }

  // Remove leading zeros but keep "0" and "0.x" patterns
  if (strValue.length > 1 && strValue.startsWith("0") && strValue[1] !== ".") {
    strValue = strValue.replace(/^0+/, "") || "0";
  }

  // Parse to number for range validation
  const numValue = parseFloat(strValue);

  // If not a valid number, return the cleaned string
  if (isNaN(numValue)) {
    return "";
  }

  // Clamp to 0 if less than 0
  if (numValue < 0) {
    return "0";
  }

  // Clamp to maxScore if greater than maxScore
  if (numValue > maxScore) {
    return String(maxScore);
  }

  return strValue;
};

/**
 * Format contribution input (percentage) with clamping 0-100
 * and removing leading zeros for faster input.
 * @param {string|number} value - Raw input value
 * @param {number} maxPercent - Maximum allowed percent (default 100)
 * @returns {string} Formatted percentage value
 */
const formatContributionInput = (value, maxPercent = 100) => {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  let strValue = String(value);

  // Allow partial typing states
  if (strValue === "." || strValue === "-" || strValue === "-.") {
    return strValue;
  }

  if (strValue.length > 1 && strValue.startsWith("0") && strValue[1] !== ".") {
    strValue = strValue.replace(/^0+/, "") || "0";
  }

  const numValue = parseFloat(strValue);
  if (Number.isNaN(numValue)) {
    return "";
  }

  if (numValue < 0) {
    return "0";
  }

  if (numValue > maxPercent) {
    return String(maxPercent);
  }

  return strValue;
};

/**
 * Decode JWT payload from token string
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload or null
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
 * Get current account ID from JWT token
 * @returns {number|null} Account ID or null
 */
const getAccountIdFromToken = () => {
  if (typeof window === "undefined") return null;
  const token =
    window.localStorage?.getItem("token") ||
    window.localStorage?.getItem("accessToken") ||
    window.sessionStorage?.getItem("token");
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload !== "object") return null;

  const accountKeys = ["AccountId", "accountId", "UserId", "userId", "sub"];

  const tryParseNumeric = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  };

  for (const key of accountKeys) {
    const parsed = tryParseNumeric(payload[key]);
    if (parsed) return parsed;
  }

  return null;
};

/**
 * Get lecturer ID by fetching lecturer profile
 * @returns {Promise<number|null>} Lecturer ID or null
 */
const fetchCurrentLecturerId = async () => {
  try {
    const accountId = getAccountIdFromToken();
    if (!accountId) {
      console.warn("[GradingDetailPage] Could not get accountId from token");
      return null;
    }

    const response = await getLecturerProfileAPI(accountId);
    const responseData = response?.data || response;
    const lecturerInfo = responseData?.lecturerInfo || {};
    const lecturerId =
      lecturerInfo?.lecturerId || responseData?.lecturerId || null;

    return lecturerId;
  } catch (error) {
    console.error("[GradingDetailPage] Error fetching lecturer profile:", error);
    return null;
  }
};

/**
 * Find the role of a lecturer in committee members
 * @param {Array} committeeMembers - List of committee members
 * @param {number} lecturerId - The lecturer ID to find
 * @returns {string} Role of the lecturer (Secretary, Chairman, Member) or "Secretary" as default
 */
const findLecturerRoleInCommittee = (committeeMembers, lecturerId) => {
  if (!Array.isArray(committeeMembers) || !lecturerId) {
    console.warn("[findLecturerRoleInCommittee] Missing committeeMembers or lecturerId");
    return "Secretary";
  }

  for (const member of committeeMembers) {
    const memberId =
      member?.lecturerId ||
      member?.LecturerId ||
      member?.evaluatorId ||
      member?.EvaluatorId;

    if (memberId === lecturerId) {
      const role = member?.role || member?.Role || "Secretary";
      // Normalize role: remove diacritics and convert to lowercase for comparison
      // "Chủ tịch" → "chu tich", "Phản biện" → "phan bien", "Thư ký" → "thu ky"
      const normalizedRole = role
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      
      console.log("[findLecturerRoleInCommittee] Found member:", {
        memberId,
        originalRole: role,
        normalizedRole,
      });
      
      if (normalizedRole.includes("chairman") || normalizedRole.includes("chu tich")) {
        return "Chairman";
      }
      if (normalizedRole.includes("reviewer") || normalizedRole.includes("phan bien")) {
        return "Reviewer";
      }
      if (normalizedRole.includes("secretary") || normalizedRole.includes("thu ky")) {
        return "Secretary";
      }
      // Default fallback for unknown roles
      console.warn("[findLecturerRoleInCommittee] Unknown role, defaulting to Reviewer:", role);
      return "Reviewer";
    }
  }
  
  console.warn("[findLecturerRoleInCommittee] Lecturer not found in committee:", lecturerId);
  return "Secretary";
};

const pickFirstValue = (...candidates) =>
  candidates.find(
    (value) => value !== undefined && value !== null && value !== ""
  ) ?? null;

const normalizeText = (value) => {
  if (typeof value !== "string") {
    return "";
  }
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const CRITERION_SCOPE = {
  TEAM: "team",
  PERSONAL: "personal",
};

const TEAM_CRITERIA_KEYWORDS = [
  "software engineering practices",
  "ideas and proposed solutions",
  "software process",
  "artifacts",
];

const PERSONAL_CRITERIA_KEYWORDS = [
  "teamwork and communication",
  "presentation",
];

const determineCriteriaScope = (criterion, index, total) => {
  const normalizedCategory = normalizeText(criterion?.category);
  if (
    normalizedCategory.includes("team") ||
    normalizedCategory.includes("group")
  ) {
    return CRITERION_SCOPE.TEAM;
  }
  if (
    normalizedCategory.includes("member") ||
    normalizedCategory.includes("individual") ||
    normalizedCategory.includes("personal")
  ) {
    return CRITERION_SCOPE.PERSONAL;
  }

  const normalizedName = normalizeText(criterion?.criteriaName);
  if (
    PERSONAL_CRITERIA_KEYWORDS.some((keyword) =>
      normalizedName.includes(keyword)
    ) ||
    normalizedName.includes("teamwork") ||
    normalizedName.includes("communication") ||
    normalizedName.includes("presentation")
  ) {
    return CRITERION_SCOPE.PERSONAL;
  }

  if (
    TEAM_CRITERIA_KEYWORDS.some((keyword) =>
      normalizedName.includes(keyword)
    ) ||
    normalizedName.includes("software") ||
    normalizedName.includes("artifact") ||
    normalizedName.includes("process")
  ) {
    return CRITERION_SCOPE.TEAM;
  }

  if (total - index <= 2) {
    return CRITERION_SCOPE.PERSONAL;
  }

  return CRITERION_SCOPE.TEAM;
};

const isSecretaryRole = (role) => {
  if (!role) {
    return false;
  }
  const normalized = normalizeText(role);
  return (
    normalized.includes("thu ky") ||
    normalized.includes("thu ki") ||
    normalized.includes("secretary")
  );
};

const normalizeStudentRecord = (student) => {
  if (!student) {
    return null;
  }
  const nested = student.student || student.Student || {};
  const studentId = pickFirstValue(
    student.studentId,
    student.StudentId,
    nested.studentId,
    nested.StudentId,
    student.id,
    student.Id
  );
  if (studentId === null || studentId === undefined) {
    return null;
  }
  const studentCode =
    pickFirstValue(
      student.studentCode,
      student.StudentCode,
      nested.studentCode,
      nested.StudentCode,
      student.code,
      student.Code
    ) || `SV_${studentId}`;
  const fullName =
    pickFirstValue(
      student.fullName,
      student.FullName,
      nested.fullName,
      nested.FullName,
      student.name,
      student.Name,
      [
        pickFirstValue(student.firstName, nested.firstName),
        pickFirstValue(student.lastName, nested.lastName),
      ]
        .filter(Boolean)
        .join(" ")
    ) || studentCode;

  const finalScore =
    typeof student.finalScore === "number"
      ? student.finalScore
      : typeof student.FinalScore === "number"
      ? student.FinalScore
      : null;

  return {
    studentId,
    studentCode,
    fullName,
    isGraded: student.isGraded ?? student.IsGraded ?? false,
    finalScore,
    gradedDate: student.gradedDate || student.GradedDate || null,
    contributionPercentage:
      student.contributionPercentage || student.ContributionPercentage || null,
  };
};

const mapStudentsArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((student) => normalizeStudentRecord(student))
    .filter(Boolean);
};

const deriveGraderName = (session, teamData) => {
  const evaluators = session?.evaluators || session?.Evaluators;
  if (Array.isArray(evaluators)) {
    const secretary = evaluators.find((evaluator) =>
      isSecretaryRole(evaluator?.role || evaluator?.Role)
    );
    const secretaryName = pickFirstValue(
      secretary?.fullName,
      secretary?.FullName,
      secretary?.name,
      secretary?.Name
    );
    if (secretaryName) {
      return secretaryName;
    }
  }

  const committeeMembers =
    teamData?.committeeMembers || teamData?.CommitteeMembers;
  if (Array.isArray(committeeMembers)) {
    const secretaryMember = committeeMembers.find((member) =>
      isSecretaryRole(member?.role || member?.Role)
    );
    if (secretaryMember) {
      const memberName = pickFirstValue(
        secretaryMember?.fullName,
        secretaryMember?.FullName,
        secretaryMember?.lecturerName,
        secretaryMember?.LecturerName,
        secretaryMember?.lecturer?.fullName,
        secretaryMember?.Lecturer?.FullName
      );
      if (memberName) {
        return memberName;
      }
    }
  }

  return (
    session?.graderName || session?.grader || session?.createdByName || null
  );
};

const enhanceSessionDetail = (session, teamData, context = {}) => {
  const safeSession =
    session && typeof session === "object" ? { ...session } : {};
  const sessionStudents = mapStudentsArray(
    safeSession.students || safeSession.Students
  );
  const fallbackTeamArrays =
    teamData?.students ||
    teamData?.Students ||
    teamData?.teamMembers ||
    teamData?.TeamMembers ||
    [];
  const teamStudents = mapStudentsArray(fallbackTeamArrays);
  const finalStudents = sessionStudents.length ? sessionStudents : teamStudents;

  safeSession.students = finalStudents;
  safeSession.totalStudents = safeSession.totalStudents || finalStudents.length;
  safeSession.teamId =
    safeSession.teamId ||
    safeSession.TeamId ||
    teamData?.teamId ||
    teamData?.TeamId ||
    context.fallbackTeamId ||
    null;
  safeSession.teamName =
    safeSession.teamName ||
    safeSession.teamCode ||
    teamData?.teamName ||
    teamData?.teamCode ||
    context.group?.team ||
    "";
  safeSession.mentorName =
    safeSession.mentorName ||
    teamData?.mentorName ||
    teamData?.mentor?.fullName ||
    context.group?.mentor ||
    "";
  safeSession.committeeId =
    safeSession.committeeId ||
    safeSession.CommitteeId ||
    teamData?.committeeId ||
    teamData?.CommitteeId ||
    context.group?.committeeId ||
    null;
  safeSession.committeeMembers =
    safeSession.committeeMembers ||
    safeSession.CommitteeMembers ||
    teamData?.committeeMembers ||
    teamData?.CommitteeMembers ||
    [];

  const derivedName = deriveGraderName(safeSession, teamData);
  if (derivedName) {
    safeSession.graderName = derivedName;
  }

  return safeSession;
};

const buildEmptyForm = (criteriaList) => {
  const scores = {};
  const comments = {};
  criteriaList.forEach((criterion) => {
    if (criterion.isContribution) {
      return;
    }
    scores[criterion.criteriaId] = "";
    comments[criterion.criteriaId] = "";
  });
  return {
    scores,
    comments,
    contributionPercentage: "",
  };
};

const buildFormFromGrade = (criteriaList, grade) => {
  const form = buildEmptyForm(criteriaList);
  if (!grade) {
    return form;
  }

  if (Array.isArray(grade.criteriaGrades)) {
    grade.criteriaGrades.forEach((item) => {
      if (!Object.prototype.hasOwnProperty.call(form.scores, item.criteriaId)) {
        return;
      }
      form.scores[item.criteriaId] = toScoreValue(item.score);
      form.comments[item.criteriaId] = toCommentValue(item.comments);
    });
  }

  if (
    grade.contributionPercentage !== undefined &&
    grade.contributionPercentage !== null
  ) {
    form.contributionPercentage = String(grade.contributionPercentage);
  }

  return form;
};

const formatDate = (value) => {
  if (!value) {
    return "--";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }
  return date.toLocaleDateString("vi-VN");
};

const formatDateTime = (value) => {
  if (!value) {
    return "--";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const hasNumericValue = (value) => {
  if (value === "" || value === null || value === undefined) {
    return false;
  }
  const parsed = Number(value);
  return !Number.isNaN(parsed);
};

const normalizeCriteriaRecord = (item) => {
  if (!item) {
    return null;
  }
  const criteriaId =
    item.criteriaId ?? item.CriteriaId ?? item.id ?? item.Id ?? null;
  if (criteriaId === null || criteriaId === undefined) {
    return null;
  }
  const maxScore =
    Number(
      item.maxScore ??
        item.MaxScore ??
        item.maximumScore ??
        item.MaximumScore ??
        10
    ) || 10;
  const weight =
    Number(
      item.weight ??
        item.Weight ??
        item.weightPercentage ??
        item.WeightPercentage ??
        0
    ) || 0;
  return {
    criteriaId,
    criteriaName:
      item.criteriaName ||
      item.CriteriaName ||
      item.name ||
      item.Name ||
      `Criteria ${criteriaId}`,
    description:
      item.description ||
      item.Description ||
      item.criteriaDescription ||
      item.CriteriaDescription ||
      "",
    maxScore,
    weight,
    category: item.category || item.Category || "",
    isContribution: item.isContribution ?? item.IsContribution ?? false,
    displayOrder: item.displayOrder ?? item.DisplayOrder ?? criteriaId,
    isActive: item.isActive ?? item.IsActive ?? true,
  };
};

const normalizeCriteriaList = (list) => {
  if (!Array.isArray(list)) {
    return [];
  }
  return list
    .map((item) => normalizeCriteriaRecord(item))
    .filter(Boolean)
    .sort(
      (a, b) =>
        (a.displayOrder ?? a.criteriaId) - (b.displayOrder ?? b.criteriaId)
    );
};

const aggregateDetailedGrades = (details, filterEvaluatorId = null) => {
  if (!Array.isArray(details)) {
    return [];
  }
  
  // Filter grades by evaluatorId if provided
  const filteredDetails = filterEvaluatorId
    ? details.filter((detail) => {
        const evaluatorId = pickFirstValue(detail?.evaluatorId, detail?.EvaluatorId);
        return evaluatorId === filterEvaluatorId;
      })
    : details;
  
  console.log("[aggregateDetailedGrades] Filtering by evaluatorId:", filterEvaluatorId, 
    "Total grades:", details.length, 
    "Filtered grades:", filteredDetails.length);
  
  const grouped = new Map();
  filteredDetails.forEach((detail) => {
    const studentId = pickFirstValue(detail?.studentId, detail?.StudentId);
    if (studentId === null || studentId === undefined) {
      return;
    }
    const existing = grouped.get(studentId) || {
      studentId,
      studentCode:
        pickFirstValue(detail?.studentCode, detail?.StudentCode) ||
        `SV_${studentId}`,
      fullName:
        pickFirstValue(detail?.studentName, detail?.StudentName) ||
        pickFirstValue(detail?.fullName, detail?.FullName) ||
        "",
      isCompleted: true,
      finalScore: null,
      gradedDate: detail?.gradedDate || detail?.GradedDate || null,
      contributionPercentage: null,
      criteriaGrades: [],
    };
    existing.gradeId =
      existing.gradeId ??
      pickFirstValue(
        detail?.gradeId,
        detail?.GradeId,
        detail?.studentGradeId,
        detail?.StudentGradeId
      );
    existing.contributionPercentage =
      existing.contributionPercentage ??
      pickFirstValue(
        detail?.contributionPercentage,
        detail?.ContributionPercentage
      );
    const criteriaEntry = {
      detailedGradeId: pickFirstValue(
        detail?.detailedGradeId,
        detail?.DetailedGradeId
      ),
      criteriaId: pickFirstValue(detail?.criteriaId, detail?.CriteriaId),
      criteriaName:
        pickFirstValue(detail?.criteriaName, detail?.CriteriaName) || "",
      weight: pickFirstValue(
        detail?.weightPercentage,
        detail?.WeightPercentage,
        detail?.weight,
        detail?.Weight
      ),
      score: pickFirstValue(
        detail?.individualScore,
        detail?.IndividualScore,
        detail?.teamScore,
        detail?.TeamScore,
        detail?.score,
        detail?.Score
      ),
      comments: detail?.comments || detail?.Comments || "",
      evaluatorId: pickFirstValue(detail?.evaluatorId, detail?.EvaluatorId),
      evaluatorRole: detail?.evaluatorRole || detail?.EvaluatorRole || "",
      gradedDate: detail?.gradedDate || detail?.GradedDate || null,
    };
    if (
      criteriaEntry.criteriaId !== null &&
      criteriaEntry.criteriaId !== undefined
    ) {
      existing.criteriaGrades.push(criteriaEntry);
    }
    grouped.set(studentId, existing);
  });
  return Array.from(grouped.values());
};

const mapRoleToApiRole = (role) => {
  const normalized = normalizeText(role);
  if (!normalized) {
    return "Secretary";
  }
  if (normalized.includes("chu tich")) {
    return "Chairman";
  }
  if (
    normalized.includes("phan bien") ||
    normalized.includes("phan-bien") ||
    normalized.includes("phan bien")
  ) {
    return "Reviewer";
  }
  if (normalized.includes("thu ky") || normalized.includes("thu ki")) {
    return "Secretary";
  }
  if (["chairman", "reviewer", "secretary"].includes(normalized)) {
    return normalized[0].toUpperCase() + normalized.slice(1);
  }
  return "Secretary";
};

const selectEvaluatorForSubmission = (session) => {
  const evaluatorList = [];
  if (Array.isArray(session?.evaluators)) {
    session.evaluators.forEach((evaluator) => {
      const evaluatorId = pickFirstValue(
        evaluator?.evaluatorId,
        evaluator?.EvaluatorId,
        evaluator?.lecturerId,
        evaluator?.LecturerId
      );
      if (!evaluatorId) {
        return;
      }
      evaluatorList.push({
        evaluatorId,
        role: mapRoleToApiRole(evaluator?.role || evaluator?.Role),
      });
    });
  }
  if (!evaluatorList.length && Array.isArray(session?.committeeMembers)) {
    session.committeeMembers.forEach((member) => {
      const memberId = pickFirstValue(
        member?.lecturerId,
        member?.LecturerId,
        member?.evaluatorId,
        member?.EvaluatorId
      );
      if (!memberId) {
        return;
      }
      evaluatorList.push({
        evaluatorId: memberId,
        role: mapRoleToApiRole(member?.role || member?.Role),
      });
    });
  }
  if (!evaluatorList.length) {
    return null;
  }
  const secretary = evaluatorList.find(
    (evaluator) => evaluator.role === "Secretary"
  );
  return secretary || evaluatorList[0];
};

export default function GradingDetailPage({
  group,
  teamId,
  sessionId: propSessionId,
  onBack,
}) {
  const resolvedSessionId =
    propSessionId ??
    group?.sessionId ??
    group?.session?.sessionId ??
    group?.id ??
    teamId;

  const sessionId =
    typeof resolvedSessionId === "number" ||
    typeof resolvedSessionId === "string"
      ? resolvedSessionId
      : null;

  // Use refs to store stable references and prevent infinite loops
  const groupRef = useRef(group);
  const teamIdRef = useRef(teamId);
  const formsInitializedRef = useRef(false);
  
  // Update refs when props change
  useEffect(() => {
    groupRef.current = group;
    teamIdRef.current = teamId;
  }, [group, teamId]);

  const [criteria, setCriteria] = useState([]);
  const [sessionDetail, setSessionDetail] = useState(null);
  const [grades, setGrades] = useState([]);
  const [currentLecturerId, setCurrentLecturerId] = useState(null);
  const [forms, setForms] = useState({});
  const [teamScores, setTeamScores] = useState({});
  const [criterionComments, setCriterionComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [initialised, setInitialised] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState([]);
  const [isCommentPanelOpen, setIsCommentPanelOpen] = useState(false);
  const [invalidScoreMap, setInvalidScoreMap] = useState({});

  const genreKey = (criteriaId, studentId) =>
    `${criteriaId}__${studentId ?? "team"}`;

  const isInvalidField = useCallback(
    (criteriaId, studentId = null) =>
      Boolean(invalidScoreMap[genreKey(criteriaId, studentId)]),
    [invalidScoreMap]
  );

  const clearInvalidState = useCallback((criteriaId, studentId = null) => {
    setInvalidScoreMap((prev) => {
      const key = genreKey(criteriaId, studentId);
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const criteriaForScoring = useMemo(() => {
    const filtered = criteria.filter((item) => !item.isContribution);
    return filtered.map((criterion, index) => ({
      ...criterion,
      scope: determineCriteriaScope(criterion, index, filtered.length),
    }));
  }, [criteria]);

  const scopeSets = useMemo(() => {
    const team = new Set();
    const personal = new Set();
    criteriaForScoring.forEach((criterion) => {
      if (criterion.scope === CRITERION_SCOPE.PERSONAL) {
        personal.add(criterion.criteriaId);
      } else {
        team.add(criterion.criteriaId);
      }
    });
    return { team, personal };
  }, [criteriaForScoring]);

  const teamScopeIds = scopeSets.team;

  const criteriaMap = useMemo(() => {
    const map = {};
    criteria.forEach((criterion) => {
      map[criterion.criteriaId] = criterion;
    });
    return map;
  }, [criteria]);

  const gradeLookup = useMemo(() => {
    const lookup = {};
    grades.forEach((grade) => {
      if (grade && grade.studentId !== undefined && grade.studentId !== null) {
        lookup[grade.studentId] = grade;
      }
    });
    return lookup;
  }, [grades]);

  const students = useMemo(
    () => sessionDetail?.students ?? [],
    [sessionDetail]
  );

  const gridTemplateColumns = useMemo(() => {
    const baseColumns = [
      "minmax(0, 1.4fr)",
      "minmax(0, 1.8fr)",
      "minmax(80px, 0.7fr)",
      "minmax(70px, 0.6fr)",
    ];
    if (students.length > 0) {
      baseColumns.push(`repeat(${students.length}, minmax(48px, 0.55fr))`);
    }
    return baseColumns.join(" ");
  }, [students.length]);

  const getHistoricalGrade = useCallback(
    (gradeEntry, criteriaId) =>
      gradeEntry?.criteriaGrades?.find(
        (grade) => grade.criteriaId === criteriaId
      ),
    []
  );

  const calculateFinalScore = useCallback(
    (criteriaGrades, contributionPercentage) => {
      const baseScore = criteriaGrades.reduce((total, item) => {
        const criterion = criteriaMap[item.criteriaId];
        if (!criterion || criterion.isContribution) {
          return total;
        }
        // Use weight from item if available, otherwise from criteriaMap
        const weight = (item.weight ?? criterion.weight ?? 0) / 100;
        const score = Number(item.score ?? 0);
        return total + score * weight;
      }, 0);
      // Contribution là % (0-100), tính điểm cuối = baseScore * (contributionPercentage / 100)
      const contributionMultiplier = contributionPercentage
        ? Number(contributionPercentage) / 100
        : 1;
      return Number((baseScore * contributionMultiplier).toFixed(2));
    },
    [criteriaMap]
  );

  const studentSummaries = useMemo(() => {
    if (!students.length) {
      return [];
    }
    return students.map((student) => {
      const grade = gradeLookup[student.studentId];
      const form = forms[student.studentId];
      const formContribution = form?.contributionPercentage ?? "";

      // Get contribution from grade or form
      const contribution = grade?.contributionPercentage ?? formContribution;

      // Calculate finalScore from current grades
      let finalScore = null;
      if (
        grade?.criteriaGrades?.length &&
        contribution &&
        !isNaN(contribution)
      ) {
        finalScore = calculateFinalScore(
          grade.criteriaGrades,
          Number(contribution)
        );
      } else if (typeof student.finalScore === "number") {
        finalScore = student.finalScore;
      }

      return {
        ...student,
        finalScore,
        isCompleted: grade?.isCompleted ?? student.isGraded ?? false,
        gradedDate: grade?.gradedDate ?? student.gradedDate ?? null,
        contributionPercentage: contribution,
      };
    });
  }, [students, gradeLookup, forms, calculateFinalScore]);

  const prepareSessionDetail = useCallback(
    async (rawSession) => {
      if (!rawSession || typeof rawSession !== "object") {
        return null;
      }
      const currentGroup = groupRef.current;
      const currentTeamId = teamIdRef.current;
      const fallbackTeamId = pickFirstValue(
        rawSession?.teamId,
        rawSession?.TeamId,
        currentGroup?.teamId,
        currentGroup?.team?.teamId,
        currentTeamId
      );
      let fallbackTeamData = null;
      if (fallbackTeamId) {
        try {
          const teamResponse = await GradingAPI.getTeam(fallbackTeamId);
          fallbackTeamData = teamResponse?.data || teamResponse || null;
        } catch (teamError) {
          console.warn(`Could not load team ${fallbackTeamId}:`, teamError);
        }
      }
      return enhanceSessionDetail(rawSession, fallbackTeamData, {
        fallbackTeamId,
        group: currentGroup,
      });
    },
    [] // Empty deps - uses refs for stable reference
  );

  useEffect(() => {
    if (!sessionId) {
      setError("Không tìm thấy phiên chấm điểm hợp lệ.");
      setLoading(false);
      return;
    }

    let ignore = false;

    const load = async () => {
      setLoading(true);
      console.log("Starting to load session data for ID:", sessionId);

      try {
        // Kiểm tra sơ bộ ID
        if (!sessionId || sessionId === "undefined" || sessionId === "null") {
          throw new Error(`Session ID không hợp lệ: ${sessionId}`);
        }

        // Fetch current lecturer ID first
        const lecturerId = await fetchCurrentLecturerId();
        console.log("[GradingDetailPage] Current lecturer ID:", lecturerId);
        setCurrentLecturerId(lecturerId);

        const [criteriaData, sessionData, gradesData] = await Promise.all([
          GradingAPI.getCriteria(),
          GradingAPI.getSessionDetail(sessionId),
          GradingAPI.getSessionGrades(sessionId),
        ]);

        if (ignore) {
          return;
        }

        // Kiểm tra dữ liệu trả về
        if (!sessionData) {
          throw new Error(`Không tìm thấy dữ liệu cho phiên chấm điểm ${sessionId}`);
        }

        console.log("Session data loaded successfully:", sessionData);

        const normalizedCriteria = normalizeCriteriaList(
          Array.isArray(criteriaData) ? criteriaData : []
        );
        const enhancedSession = await prepareSessionDetail(sessionData ?? null);
        
        // Filter grades by current lecturer - each evaluator sees only their own grades
        const aggregatedGrades = aggregateDetailedGrades(
          Array.isArray(gradesData) ? gradesData : [],
          lecturerId  // Pass current lecturer ID to filter
        );
        setCriteria(normalizedCriteria);
        setSessionDetail(enhancedSession);
        setGrades(aggregatedGrades);
        setError("");
      } catch (err) {
        console.error("Error loading session details:", err);
        
        if (ignore) {
          return;
        }

        // Xử lý các mã lỗi cụ thể
        if (err?.status === 404) {
          setError(`Không tìm thấy phiên chấm điểm (ID: ${sessionId}). Có thể phiên đã bị xóa.`);
          return;
        }
        
        if (err?.status === 400) {
          const serverMessage = err?.message || "";
          // Nếu lỗi do thiếu cột trong DB
          if (serverMessage.includes("Invalid column name")) {
             console.warn("Backend schema mismatch detected (Missing columns).");
             setError(`Lỗi Backend: Database thiếu cột dữ liệu (${serverMessage}). Vui lòng cập nhật Database.`);
             return;
          }

          setError(`Lỗi từ server (400): ${serverMessage || "Yêu cầu không hợp lệ"}`);
          return;
        }

        if (!err?.status) {
          console.warn("Network error or unknown error");
          setError("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.");
          return;
        }
        const message =
          err?.message || "Không thể tải dữ liệu chấm điểm. Vui lòng thử lại.";
        setError(message);
      } finally {
        if (!ignore) {
          setLoading(false);
          setInitialised(true);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Initialize forms only once when criteria and students are first available
  useEffect(() => {
    // Skip if already initialized or missing data
    if (formsInitializedRef.current || !criteria.length || !students.length) {
      if (!criteria.length || !students.length) {
        // Reset if data becomes unavailable
        if (formsInitializedRef.current) {
          formsInitializedRef.current = false;
          setForms({});
          setTeamScores({});
          setCriterionComments({});
        }
      }
      return;
    }
    
    // Mark as initialized to prevent re-running
    formsInitializedRef.current = true;
    
    const nextForms = {};
    students.forEach((student) => {
      nextForms[student.studentId] = buildFormFromGrade(
        criteria,
        gradeLookup[student.studentId]
      );
    });
    setForms(nextForms);

    const firstStudentId = students[0]?.studentId;
    const baseForm =
      (firstStudentId && nextForms[firstStudentId]) || buildEmptyForm(criteria);
    const initialComments = {};
    const initialTeamScores = {};

    criteriaForScoring.forEach((criterion) => {
      initialComments[criterion.criteriaId] =
        baseForm?.comments?.[criterion.criteriaId] ?? "";
      if (criterion.scope !== CRITERION_SCOPE.PERSONAL) {
        initialTeamScores[criterion.criteriaId] =
          baseForm?.scores?.[criterion.criteriaId] ?? "";
      }
    });

    setCriterionComments(initialComments);
    setTeamScores(initialTeamScores);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteria, students, gradeLookup, criteriaForScoring]);

  const handleBackClick = () => {
    if (typeof onBack === "function") {
      onBack();
    }
  };

  // ===================== EXPORT EXCEL FUNCTION =====================
  const handleExportExcel = async () => {
    try {
      setSaving(true);
      setError("");

      // 1. Fetch the template file from public folder
      const response = await fetch("/templates/GradingTemplate.xlsx");
      if (!response.ok) {
        throw new Error("Không thể tải file mẫu Excel.");
      }
      const templateBuffer = await response.arrayBuffer();

      // 2. Load workbook from template
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(templateBuffer);

      // 3. Get worksheets
      const evalSheet = workbook.getWorksheet("EvaluationForm") || workbook.getWorksheet(1);
      const mentorSheet = workbook.getWorksheet("Mentor comments") || workbook.getWorksheet(2);

      if (!evalSheet) {
        throw new Error("Không tìm thấy sheet EvaluationForm trong file mẫu.");
      }

      // ==================== SHEET 1: EvaluationForm ====================
      // Header information
      const projectName = sessionDetail?.sessionName || group?.project || sessionDetail?.description || "";
      const mentorName = sessionDetail?.graderName || sessionDetail?.mentorName || "";
      const teamName = sessionDetail?.teamName || group?.team || "";

      // Row 6: Project name
      evalSheet.getCell("C6").value = projectName;
      // Row 8: Evaluator/Mentor
      evalSheet.getCell("C8").value = mentorName;

      // Team Members (rows 9-13)
      const memberRows = [9, 10, 11, 12, 13];
      students.forEach((student, index) => {
        if (index < 5) {
          const row = memberRows[index];
          evalSheet.getCell(`C${row}`).value = student.fullName || "";
          evalSheet.getCell(`F${row}`).value = student.studentCode || "";
        }
      });

      // ==================== GRADING DATA ====================
      // Map criteria to Excel rows based on the template structure
      // The template has specific rows for each criterion
      
      // Helper function to get score for a criterion
      const getTeamScore = (criteriaId) => {
        const raw = teamScores[criteriaId];
        if (hasNumericValue(raw)) return Number(raw);
        // Try to get from gradeLookup
        const firstStudentGrade = grades[0];
        if (firstStudentGrade?.criteriaGrades) {
          const found = firstStudentGrade.criteriaGrades.find(g => g.criteriaId === criteriaId);
          if (found) return found.score;
        }
        return "";
      };

      const getPersonalScore = (studentId, criteriaId) => {
        const form = forms[studentId];
        if (form?.scores?.[criteriaId] && hasNumericValue(form.scores[criteriaId])) {
          return Number(form.scores[criteriaId]);
        }
        const grade = gradeLookup[studentId];
        if (grade?.criteriaGrades) {
          const found = grade.criteriaGrades.find(g => g.criteriaId === criteriaId);
          if (found) return found.score;
        }
        return "";
      };

      // Column mapping for team members (F=1, G=2, H=3, I=4, J=5)
      const memberColumns = ["F", "G", "H", "I", "J"];

      // Process criteria and fill scores
      // Based on template structure from the image:
      // Row 17: Software Engineering Practices - Team score in E, personal scores optional
      // Row 18: Grade of SEP (weighted) - E column
      // Row 19-21: Ideas and proposed solutions - E column for team
      // Row 22: Grade of IPS - E column
      // Row 23: Software process - E column
      // Row 24: Grade of SP - E column
      // Row 25-27: Artifacts - E column
      // Row 28: Grade of Artifacts - E column
      // Row 29-32: Teamwork and Communication - F,G,H,I,J for each member
      // Row 33: Grades of Communication - F,G,H,I,J
      // Row 34: Presentation - F,G,H,I,J
      // Row 35: Grade of Presentation - F,G,H,I,J
      // Row 36: Contribution % - F,G,H,I,J
      // Row 38: Final Grade - F,G,H,I,J

      // Map criteriaForScoring to template rows
      criteriaForScoring.forEach((criterion) => {
        const criteriaName = normalizeText(criterion.criteriaName);
        const isTeamScope = criterion.scope !== CRITERION_SCOPE.PERSONAL;

        // Determine which row to fill based on criteria name
        let targetRow = null;
        let isTeamColumn = isTeamScope;

        if (criteriaName.includes("software engineering") || criteriaName.includes("sep")) {
          targetRow = 17;
        } else if (criteriaName.includes("ideas") || criteriaName.includes("proposed solution") || criteriaName.includes("ips")) {
          targetRow = 19;
        } else if (criteriaName.includes("software process") || criteriaName.includes("sp")) {
          targetRow = 23;
        } else if (criteriaName.includes("artifact")) {
          targetRow = 25;
        } else if (criteriaName.includes("teamwork") || criteriaName.includes("communication")) {
          targetRow = 29;
          isTeamColumn = false; // Personal scores
        } else if (criteriaName.includes("presentation")) {
          targetRow = 34;
          isTeamColumn = false; // Personal scores
        }

        if (targetRow) {
          if (isTeamColumn) {
            // Fill team score in column E
            const score = getTeamScore(criterion.criteriaId);
            evalSheet.getCell(`E${targetRow}`).value = score;
          } else {
            // Fill personal scores for each member
            students.forEach((student, idx) => {
              if (idx < 5) {
                const score = getPersonalScore(student.studentId, criterion.criteriaId);
                evalSheet.getCell(`${memberColumns[idx]}${targetRow}`).value = score;
              }
            });
          }
        }
      });

      // Fill Contribution row (row 36)
      students.forEach((student, idx) => {
        if (idx < 5) {
          const form = forms[student.studentId];
          const contribution = form?.contributionPercentage || 
            gradeLookup[student.studentId]?.contributionPercentage || "";
          if (contribution) {
            evalSheet.getCell(`${memberColumns[idx]}36`).value = `${contribution}%`;
          }
        }
      });

      // Fill Final Grade row (row 38)
      studentSummaries.forEach((student, idx) => {
        if (idx < 5 && typeof student.finalScore === "number") {
          evalSheet.getCell(`${memberColumns[idx]}38`).value = student.finalScore;
        }
      });

      // Fill Comments section (starting row 40)
      const allComments = Object.entries(criterionComments)
        .filter(([, comment]) => comment && comment.trim())
        .map(([criteriaId, comment]) => {
          const criterion = criteriaMap[criteriaId];
          return `${criterion?.criteriaName || "Tiêu chí"}: ${comment}`;
        })
        .join("\n");
      if (allComments) {
        evalSheet.getCell("A40").value = allComments;
      }

      // ==================== SHEET 2: Mentor Comments ====================
      if (mentorSheet) {
        // Row 2: Group code
        mentorSheet.getCell("B2").value = teamName;

        // Student rows start at row 5
        const commentStartRow = 5;
        students.forEach((student, idx) => {
          const row = commentStartRow + idx;
          mentorSheet.getCell(`A${row}`).value = idx + 1; // STT
          mentorSheet.getCell(`B${row}`).value = student.fullName || "";
          // Comments column C - leave empty or fill if you have individual comments
          // mentorSheet.getCell(`C${row}`).value = "";
        });

        // Date row (approximately row 11 based on template)
        const today = new Date();
        const dateStr = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1).toString().padStart(2, "0")}/${today.getFullYear()}`;
        mentorSheet.getCell("C11").value = `Date: ${dateStr}`;

        // Signature row (row 13)
        mentorSheet.getCell("C13").value = mentorName;
      }

      // 4. Generate and download the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const fileName = `KetQuaCham_${teamName || "Nhom"}_${formatDate(new Date()).replace(/\//g, "-")}.xlsx`;
      saveAs(blob, fileName);

      setSuccessMessage("Xuất file Excel thành công!");
    } catch (err) {
      console.error("Export Excel error:", err);
      setErrors([err.message || "Không thể xuất file Excel. Vui lòng thử lại."]);
    } finally {
      setSaving(false);
    }
  };
  // ===================== END EXPORT EXCEL =====================

  const handleScoreChange =
    (criteriaId, targetStudentId = null, maxScore = 10) =>
    (event) => {
      const { value } = event.target;
      // Format the score input: remove leading zeros, clamp to valid range
      const formattedValue = formatScoreInput(value, maxScore);
      
      if (teamScopeIds.has(criteriaId)) {
        setTeamScores((prev) => ({
          ...prev,
          [criteriaId]: formattedValue,
        }));
        clearInvalidState(criteriaId, null);
        setError("");
        return;
      }
      if (targetStudentId === null || targetStudentId === undefined) {
        return;
      }
      setForms((prev) => {
        const existingForm = prev[targetStudentId] ?? buildEmptyForm(criteria);
        return {
          ...prev,
          [targetStudentId]: {
            ...existingForm,
            scores: {
              ...existingForm.scores,
              [criteriaId]: formattedValue,
            },
          },
        };
      });
      clearInvalidState(criteriaId, targetStudentId);
      setError("");
    };

  const handleCommentChange = (criteriaId) => (event) => {
    const { value } = event.target;
    setCriterionComments((prev) => ({
      ...prev,
      [criteriaId]: value,
    }));
  };

  const applyContributionChange = (targetId, nextValue) => {
    if (!targetId) {
      return;
    }

    const formattedValue = formatContributionInput(nextValue, 100);

    setForms((prev) => {
      const baseForm = prev[targetId] ?? buildEmptyForm(criteria);
      return {
        ...prev,
        [targetId]: {
          ...baseForm,
          contributionPercentage: formattedValue,
        },
      };
    });
    setError("");
    clearInvalidState("contribution", targetId);
  };

  const scrollToInvalidInput = (invalidKeys) => {
    if (!invalidKeys || invalidKeys.size === 0) {
      return;
    }
    const firstKey = invalidKeys.values().next().value;
    const el = document.querySelector(`[data-score-key="${firstKey}"]`);
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus?.();
    }
  };

  const buildAllPayloads = () => {
    if (!students.length || !criteriaForScoring.length) {
      return {
        errors: ["Không có dữ liệu sinh viên để chấm điểm."],
      };
    }

    const messages = [];
    const invalidMap = {};
    const teamCriteria = criteriaForScoring.filter(
      (criterion) => criterion.scope !== CRITERION_SCOPE.PERSONAL
    );
    const personalCriteria = criteriaForScoring.filter(
      (criterion) => criterion.scope === CRITERION_SCOPE.PERSONAL
    );

    const scrollTargets = new Set();
    const teamEntriesTemplate = [];
    teamCriteria.forEach((criterion) => {
      const raw = teamScores[criterion.criteriaId];
      if (!hasNumericValue(raw)) {
        messages.push(
          `Vui lòng nhập điểm cho tiêu chí ${criterion.criteriaName}.`
        );
        invalidMap[genreKey(criterion.criteriaId, null)] = true;
        scrollTargets.add(genreKey(criterion.criteriaId, null));
        return;
      }
      const numericValue = Number(raw);
      if (numericValue < 0) {
        messages.push(`${criterion.criteriaName}: Điểm không được nhỏ hơn 0.`);
        invalidMap[genreKey(criterion.criteriaId, null)] = true;
        scrollTargets.add(genreKey(criterion.criteriaId, null));
      }
      if (
        typeof criterion.maxScore === "number" &&
        numericValue > criterion.maxScore
      ) {
        messages.push(
          `${criterion.criteriaName}: Điểm không được vượt quá ${criterion.maxScore}.`
        );
        invalidMap[genreKey(criterion.criteriaId, null)] = true;
        scrollTargets.add(genreKey(criterion.criteriaId, null));
      }
      teamEntriesTemplate.push({
        criteriaId: criterion.criteriaId,
        score: numericValue,
        comments: criterionComments[criterion.criteriaId] ?? "",
      });
    });

    const payloads = [];

    students.forEach((student) => {
      const studentKey = student.studentId;
      const form = forms[student.studentId] ?? buildEmptyForm(criteria);
      const existingGradeEntry = gradeLookup[student.studentId];
      const criteriaGrades = [];
      const missingPersonal = [];
      const invalidScores = [];

      personalCriteria.forEach((criterion) => {
        const raw = form.scores?.[criterion.criteriaId];
        if (!hasNumericValue(raw)) {
          missingPersonal.push(criterion.criteriaName);
          invalidMap[genreKey(criterion.criteriaId, studentKey)] = true;
          scrollTargets.add(genreKey(criterion.criteriaId, studentKey));
          return;
        }
        const numericValue = Number(raw);
        if (numericValue < 0) {
          invalidScores.push(
            `${student.fullName}: ${criterion.criteriaName} không được nhỏ hơn 0.`
          );
          invalidMap[genreKey(criterion.criteriaId, studentKey)] = true;
          scrollTargets.add(genreKey(criterion.criteriaId, studentKey));
        }
        if (
          typeof criterion.maxScore === "number" &&
          numericValue > criterion.maxScore
        ) {
          invalidScores.push(
            `${student.fullName}: ${criterion.criteriaName} không được vượt quá ${criterion.maxScore}.`
          );
          invalidMap[genreKey(criterion.criteriaId, studentKey)] = true;
          scrollTargets.add(genreKey(criterion.criteriaId, studentKey));
        }
        const historicalGrade = getHistoricalGrade(
          existingGradeEntry,
          criterion.criteriaId
        );
        criteriaGrades.push({
          criteriaId: criterion.criteriaId,
          score: numericValue,
          comments: criterionComments[criterion.criteriaId] ?? "",
          detailedGradeId: historicalGrade?.detailedGradeId ?? null,
        });
      });

      teamEntriesTemplate.forEach((teamEntry) => {
        const historicalGrade = getHistoricalGrade(
          existingGradeEntry,
          teamEntry.criteriaId
        );
        criteriaGrades.push({
          ...teamEntry,
          detailedGradeId: historicalGrade?.detailedGradeId ?? null,
        });
      });

      if (missingPersonal.length) {
        messages.push(
          `Vui lòng nhập điểm cho ${student.fullName}: ${missingPersonal.join(
            ", "
          )}.`
        );
      }
      if (invalidScores.length) {
        messages.push(...invalidScores);
      }

      const contributionPercentage = form.contributionPercentage;
      if (!hasNumericValue(contributionPercentage)) {
        messages.push(
          `Vui lòng nhập phần trăm đóng góp cho ${student.fullName}.`
        );
        invalidMap[genreKey("contribution", studentKey)] = true;
        scrollTargets.add(genreKey("contribution", studentKey));
      } else {
        const percentValue = Number(contributionPercentage);
        if (percentValue < 0 || percentValue > 100) {
          messages.push(
            `${student.fullName}: Phần trăm đóng góp phải từ 0-100%.`
          );
          invalidMap[genreKey("contribution", studentKey)] = true;
          scrollTargets.add(genreKey("contribution", studentKey));
        }
      }

      payloads.push({
        studentId: student.studentId,
        student,
        criteriaGrades,
        contributionPercentage: Number(contributionPercentage || 100),
        updateId: existingGradeEntry?.gradeId ?? null,
      });
    });

    if (messages.length > 0) {
      setInvalidScoreMap(invalidMap);
      requestAnimationFrame(() => scrollToInvalidInput(scrollTargets));
      return { errors: messages };
    }

    setInvalidScoreMap({});
    return { payloads };
  };

  const refreshData = async () => {
    if (!sessionId) {
      return;
    }
    const [updatedGrades, updatedSession] = await Promise.all([
      GradingAPI.getSessionGrades(sessionId),
      GradingAPI.getSessionDetail(sessionId),
    ]);
    // Filter grades by current lecturer - each evaluator sees only their own grades
    const aggregatedGrades = aggregateDetailedGrades(
      Array.isArray(updatedGrades) ? updatedGrades : [],
      currentLecturerId  // Pass current lecturer ID to filter
    );
    const enhancedSession = await prepareSessionDetail(updatedSession ?? null);
    setGrades(aggregatedGrades);
    setSessionDetail(enhancedSession);
  };

  const handleSaveGrade = async () => {
    setSuccessMessage("");
    setErrors([]);
    const payloadResult = buildAllPayloads();
    if (payloadResult.errors?.length) {
      setErrors(payloadResult.errors);
      setError("");
      return;
    }
    if (!sessionId) {
      setError("Không tìm thấy phiên chấm điểm hợp lệ.");
      return;
    }
    const studentPayloads = payloadResult.payloads ?? [];
    if (!studentPayloads.length) {
      setError("Không có dữ liệu để lưu điểm.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // Get current logged-in lecturer's ID and role
      const currentLecturerId = await fetchCurrentLecturerId();
      if (!currentLecturerId) {
        throw new Error(
          "Không thể xác định thông tin giảng viên. Vui lòng đăng nhập lại."
        );
      }

      // Get committee members - fetch from Committee API because sessionDetail lacks members
      const committeeId = sessionDetail?.committeeId || sessionDetail?.CommitteeId;
      let committeeMembers = [];

      if (committeeId) {
        try {
          const committeeResponse = await getCommitteeByIdAPI(committeeId);
          const committeeData = committeeResponse?.data || committeeResponse || {};
          console.log("[GradingDetailPage] Committee data fetched:", committeeData);

          // Normalize members to ensure we always work with lecturerId (not committeeMemberId)
          const rawMembers =
            committeeData?.committeeMembers ||
            committeeData?.CommitteeMembers ||
            committeeData?.members ||
            committeeData?.Members ||
            [];

          committeeMembers = rawMembers
            .map((m) => {
              const lecturerId =
                m?.lecturerId ||
                m?.LecturerId ||
                m?.lecturer?.lecturerId ||
                m?.Lecturer?.LecturerId ||
                null;
              const role = m?.role || m?.Role || "";
              return { lecturerId, role };
            })
            .filter((m) => m.lecturerId);

          // Also include chairman if not present in members
          const chairmanId =
            committeeData?.chairmanId ||
            committeeData?.ChairmanId ||
            committeeData?.chairman?.lecturerId ||
            committeeData?.Chairman?.LecturerId;

          if (
            chairmanId &&
            !committeeMembers.some((m) => Number(m.lecturerId) === Number(chairmanId))
          ) {
            committeeMembers = [
              { lecturerId: Number(chairmanId), role: "Chủ tịch" },
              ...committeeMembers,
            ];
          }
        } catch (err) {
          console.error("[GradingDetailPage] Error fetching committee:", err);
        }
      }

      // DEBUG: Log full sessionDetail to see structure
      console.log("[GradingDetailPage] DEBUG:", {
        committeeId,
        committeeMembers,
        memberCount: committeeMembers.length,
      });

      // Find the role of current lecturer in the committee
      const currentLecturerRole = findLecturerRoleInCommittee(
        committeeMembers,
        currentLecturerId
      );

      console.log("[GradingDetailPage] Submitting grades with:", {
        currentLecturerId,
        currentLecturerRole,
        committeeMembersCount: committeeMembers.length,
        committeeMembersData: committeeMembers,
      });

      for (const payload of studentPayloads) {
        // Map criteria grades to include TeamScore/IndividualScore based on scope
        const mappedCriteriaGrades = payload.criteriaGrades.map((grade) => {
          const criterion = criteriaMap[grade.criteriaId];
          const isTeamScope = criterion?.scope === CRITERION_SCOPE.TEAM;

          return {
            criteriaId: grade.criteriaId,
            teamScore: isTeamScope ? grade.score : null,
            individualScore: !isTeamScope ? grade.score : null,
            comments: grade.comments || "",
          };
        });

        const body = {
          gradingSessionId: sessionId,
          studentId: payload.studentId,
          evaluatorId: currentLecturerId,
          evaluatorRole: currentLecturerRole,
          contributionPercentage: payload.contributionPercentage,
          criteriaGrades: mappedCriteriaGrades,
        };

        // Use batch API for creating new grades
        await GradingAPI.submitBatchGrades(sessionId, body);
      }
      await refreshData();
      setSuccessMessage("Đã lưu điểm cho toàn bộ nhóm thành công.");
    } catch (err) {
      const message =
        err?.message || "Không thể lưu điểm. Vui lòng thử lại sau.";
      setErrors([message]);
      setError("");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !initialised) {
    return <LoadingFullScreen message="Đang tải dữ liệu chấm điểm..." />;
  }

  if (error && !initialised) {
    return (
      <div className={styles.page}>
        <div className={styles.errorBanner}>{error}</div>
        {typeof onBack === "function" ? (
          <button className={styles.btn} onClick={handleBackClick}>
            Quay lại danh sách
          </button>
        ) : null}
      </div>
    );
  }

  const teamLabel =
    sessionDetail?.teamName ?? group?.team ?? "Nhóm chưa xác định";
  const projectTitle =
    sessionDetail?.sessionName ??
    group?.project ??
    sessionDetail?.description ??
    "Thông tin đang cập nhật";
  const totalMembers = studentSummaries.length;
  const pendingCount = studentSummaries.filter(
    (student) => !student.isCompleted
  ).length;

  return (
    <div className={styles.page}>
      {saving && <LoadingFullScreen message="Đang lưu điểm..." />}
      <div className={styles.headerBar}>
        <button className={styles.backLink} onClick={handleBackClick}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 18L8 12L16 6"
              stroke="#94070d"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Quay lại danh sách <span>/</span>
          <span>{teamLabel}</span>
        </button>
      </div>

      <div className={styles.sessionMeta}>
        <div className={styles.sessionMeta_title}>
          <h1 className={styles.title}>Chấm điểm đồ án</h1>
          <div className={styles.sessionInfo}>
            <span>GV chấm: {sessionDetail?.graderName ?? "--"}</span>
            <span>Ngày chấm: {formatDate(sessionDetail?.sessionDate)}</span>
          </div>
        </div>
      </div>

      <Toasts
        errors={errors}
        onClearErrorAt={(idx) =>
          setErrors((prev) => prev.filter((_, i) => i !== idx))
        }
        onClearErrors={() => setErrors([])}
        successMessage={successMessage}
        onClearSuccess={() => setSuccessMessage("")}
        autoHideSuccessMs={4000}
        autoHideErrorMs={6000} // Bật nếu muốn mỗi lỗi tự ẩn sau 6s
      />

      <div className={styles.criteriaSection}>
        <div className={styles.card}>
          <div className={styles.criteriaGridWrapper}>
            <div
              className={`${styles.criteriaGrid} ${styles.gridHeader}`}
              style={{ gridTemplateColumns }}
            >
              <div className={`${styles.gridCell} ${styles.colTitle}`}>
                Tiêu chí
              </div>
              <div className={styles.gridCell}>Mô tả</div>
              <div className={`${styles.gridCell} ${styles.headScore}`}>
                Thang điểm
              </div>
              <div className={styles.gridCell}>Nhóm</div>
              {students.map((student, index) => (
                <div
                  key={`member-head-${student.studentId}`}
                  className={`${styles.gridCell} ${styles.memberHeaderCell}`}
                >
                  <div
                    className={styles.memberHead}
                    title={`${student.fullName} · ${student.studentCode}`}
                  >
                    <span className={styles.memberIndex}>{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
            {criteriaForScoring.map((criterion) => {
              const weightRatio = (criterion.weight ?? 0) / 100;
              const baseTeamValue = teamScores[criterion.criteriaId];
              const hasTeamScore = hasNumericValue(baseTeamValue);
              const scoreNum =
                !criterion ||
                criterion.scope === CRITERION_SCOPE.PERSONAL ||
                !hasTeamScore
                  ? null
                  : Number(baseTeamValue);
              const ipsValue =
                scoreNum !== null ? scoreNum * weightRatio : null;

              const memberEntries = students.map((student) => {
                const studentForm = forms[student.studentId];
                const memberRaw =
                  studentForm?.scores?.[criterion.criteriaId] ?? "";
                const memberHasScore = hasNumericValue(memberRaw);
                const memberScore = memberHasScore ? Number(memberRaw) : null;
                return {
                  student,
                  rawInput: memberRaw,
                  numericScore: memberScore,
                  weightedScore:
                    memberScore !== null ? memberScore * weightRatio : null,
                };
              });

              const filledMembers = memberEntries.filter(
                (entry) => entry.numericScore !== null
              );
              const personalIpsValue =
                filledMembers.length > 0
                  ? (filledMembers.reduce(
                      (sum, entry) => sum + entry.numericScore,
                      0
                    ) /
                      filledMembers.length) *
                    weightRatio
                  : null;

              const isTeamScope = criterion.scope !== CRITERION_SCOPE.PERSONAL;

              return (
                <div
                  key={criterion.criteriaId}
                  className={`${styles.criteriaGrid} ${styles.gridRow} ${
                    isTeamScope ? "" : styles.personalRow
                  }`}
                  style={{ gridTemplateColumns }}
                >
                  <div className={`${styles.gridCell} ${styles.colTitle}`}>
                    {criterion.criteriaName}
                  </div>
                  <div className={`${styles.gridCell} ${styles.description}`}>
                    <div className={styles.descWrap}>
                      <div className={styles.colDesc}>
                        {criterion.description ?? "Chưa có mô tả"}
                      </div>
                      <div className={styles.gradeIPS}>
                        <div className={styles.hint}>Grade of SEP</div>
                        <div className={styles.weight}>
                          {criterion.weight ?? 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`${styles.gridCell} ${styles.colScore}`}>
                    {isTeamScope ? (
                      <input
                        className={`${styles.scoreInput} ${
                          isInvalidField(criterion.criteriaId, null)
                            ? styles.invalidInput
                            : ""
                        }`}
                        type="number"
                        min="0"
                        step="0.1"
                        max={criterion.maxScore ?? 10}
                        value={teamScores[criterion.criteriaId] ?? ""}
                        onChange={handleScoreChange(criterion.criteriaId, null, criterion.maxScore ?? 10)}
                        disabled={saving}
                        placeholder="--"
                        data-score-key={genreKey(criterion.criteriaId, null)}
                      />
                    ) : (
                      <span className={styles.scopeHint}>--</span>
                    )}
                  </div>
                  <div className={`${styles.gridCell} ${styles.colIps}`}>
                    {isTeamScope
                      ? ipsValue === null
                        ? "--"
                        : ipsValue.toFixed(2)
                      : personalIpsValue === null
                      ? "--"
                      : personalIpsValue.toFixed(2)}
                  </div>
                  {memberEntries.map((entry) => (
                    <div
                      key={`member-${criterion.criteriaId}-${entry.student.studentId}`}
                      className={`${styles.gridCell} ${styles.memberCell} ${
                        isTeamScope ? "" : styles.memberCellActive
                      }`}
                    >
                      {isTeamScope ? (
                        <span className={styles.memberPlaceholder}>--</span>
                      ) : (
                        <div className={styles.memberScoreBox}>
                          <input
                            className={`${styles.scoreInput} ${
                              styles.memberScoreInput
                            } ${
                              isInvalidField(
                                criterion.criteriaId,
                                entry.student.studentId
                              )
                                ? styles.invalidInput
                                : ""
                            }`}
                            type="number"
                            min="0"
                            step="0.1"
                            max={criterion.maxScore ?? 10}
                            value={entry.rawInput ?? ""}
                            onChange={handleScoreChange(
                              criterion.criteriaId,
                              entry.student.studentId,
                              criterion.maxScore ?? 10
                            )}
                            disabled={saving}
                            data-score-key={genreKey(
                              criterion.criteriaId,
                              entry.student.studentId
                            )}
                            placeholder="--"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
            <div
              className={`${styles.criteriaGrid} ${styles.gridRow} ${styles.contributionRow}`}
              style={{ gridTemplateColumns }}
            >
              <div className={`${styles.gridCell} ${styles.colTitle}`}>
                Contribution(*)
              </div>
              <div
                className={`${styles.gridCell} ${styles.description}`}
                style={{ gridColumn: "span 2" }}
              >
                <div className={styles.descWrap}>
                  <div className={styles.colDesc}>
                    Team member contributed significantly to team's success (%)
                  </div>
                </div>
              </div>
              <div className={`${styles.gridCell} ${styles.colIps}`}></div>
              {students.map((student) => {
                const form = forms[student.studentId] ?? {};
                const contributionValue = form.contributionPercentage ?? "";
                return (
                  <div
                    key={`contribution-${student.studentId}`}
                    className={`${styles.gridCell} ${styles.memberCell} ${styles.memberCellActive}`}
                  >
                    <div className={styles.memberScoreBox}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={contributionValue}
                        onChange={(e) =>
                          applyContributionChange(
                            student.studentId,
                            e.target.value
                          )
                        }
                        disabled={saving}
                        placeholder="%"
                        className={
                          isInvalidField("contribution", student.studentId)
                            ? styles.invalidInput
                            : undefined
                        }
                        style={{ width: "72px", textAlign: "center" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {isCommentPanelOpen ? (
        <div
          className={styles.commentDrawerBackdrop}
          onClick={() => setIsCommentPanelOpen(false)}
        >
          <div
            className={styles.commentDrawer}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.commentDrawerHeader}>
              <div>
                <h3>Nhận xét tiêu chí</h3>
                <p>Áp dụng cho toàn bộ thành viên</p>
              </div>
              <button
                type="button"
                className={styles.commentDrawerClose}
                onClick={() => setIsCommentPanelOpen(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.commentDrawerBody}>
              {criteriaForScoring.length ? (
                criteriaForScoring.map((criterion) => (
                  <div
                    key={`comment-panel-${criterion.criteriaId}`}
                    className={styles.commentDrawerItem}
                  >
                    <div className={styles.commentDrawerTitle}>
                      {criterion.criteriaName}
                    </div>
                    <textarea
                      className={styles.commentInput}
                      value={criterionComments[criterion.criteriaId] ?? ""}
                      onChange={handleCommentChange(criterion.criteriaId)}
                      placeholder="Nhận xét (không bắt buộc)"
                      disabled={saving}
                    />
                  </div>
                ))
              ) : (
                <div className={styles.commentDrawerEmpty}>
                  Không có tiêu chí để nhận xét.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className={styles.groupHeader}>
        <div className={styles.groupHeader_title}>
          <h2>
            Nhóm {teamLabel}
            <div className={styles.seperate}>-</div>
            <div>{projectTitle}</div>
          </h2>
          <div className={styles.groupMeta}>
            <span>
              Tổng cộng: {totalMembers} sinh viên &nbsp;&nbsp; Chưa chấm:{" "}
              {pendingCount} sinh viên
            </span>
          </div>
        </div>
        <div className={styles.actionBtns}>
          <div>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              type="button"
              onClick={() => setIsCommentPanelOpen(true)}
              disabled={saving}
            >
              Nhận xét
            </button>
          </div>
          <div>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={handleSaveGrade}
              disabled={saving || !students.length}
            >
              {saving ? "Đang lưu..." : "Lưu điểm"}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>STT</th>
              <th>Họ và tên</th>
              <th>MSSV</th>
              <th>Trạng thái</th>
              <th>Điểm cuối</th>
              <th>Ngày chấm</th>
              <th>Đóng góp</th>
            </tr>
          </thead>
          <tbody>
            {studentSummaries.map((student, index) => {
              return (
                <tr
                  key={student.studentId ?? index}
                  className={
                    !student.isCompleted ? styles.pendingRow : undefined
                  }
                >
                  <td>{index + 1}</td>
                  <td>{student.fullName}</td>
                  <td>{student.studentCode}</td>
                  <td>{student.isCompleted ? "Đã chấm" : "Chưa chấm"}</td>
                  <td>
                    {typeof student.finalScore === "number"
                      ? student.finalScore.toFixed(2)
                      : "--"}
                  </td>
                  <td>{formatDateTime(student.gradedDate)}</td>
                  <td>
                    {student.contributionPercentage
                      ? `${student.contributionPercentage}%`
                      : "--"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
