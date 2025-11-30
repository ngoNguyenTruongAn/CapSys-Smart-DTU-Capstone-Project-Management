import React, { useCallback, useEffect, useMemo, useState } from "react";
import GradingAPI from "../../services/GradingAPI";
import styles from "./GradingDetailPage.module.css";
import Toasts from "../../components/ui/Toasts.jsx";
import LoadingFullScreen from "../../components/ui/LoadingFullScreen";

const createDemoStudents = () => [
  {
    studentId: 101,
    studentCode: "SE210001",
    fullName: "Nguyen Van A",
    isGraded: false,
    finalScore: null,
    gradedDate: null,
  },
  {
    studentId: 102,
    studentCode: "SE210002",
    fullName: "Tran Thi B",
    isGraded: false,
    finalScore: null,
    gradedDate: null,
  },
  {
    studentId: 103,
    studentCode: "SE210003",
    fullName: "Le Van C",
    isGraded: false,
    finalScore: null,
    gradedDate: null,
  },
  {
    studentId: 104,
    studentCode: "SE210004",
    fullName: "Pham Thi D",
    isGraded: false,
    finalScore: null,
    gradedDate: null,
  },
  {
    studentId: 105,
    studentCode: "SE210005",
    fullName: "Vo Minh E",
    isGraded: false,
    finalScore: null,
    gradedDate: null,
  },
];

const createDemoGrades = (criteriaList) => {
  const baseGrades = [
    {
      studentId: 101,
      studentCode: "SE210001",
      fullName: "Nguyen Van A",
      gradedDate: "2024-01-15T16:45:00Z",
      contributionPercentage: 75,
      scores: [
        {
          criteriaId: 1,
          score: 8.5,
          comments: "Excellent technical implementation.",
        },
        {
          criteriaId: 2,
          score: 7.8,
          comments: "Good analytical approach.",
        },
        {
          criteriaId: 3,
          score: 7.2,
          comments: "Needs confidence in Q&A.",
        },
        {
          criteriaId: 4,
          score: 9,
          comments: "Outstanding teamwork.",
        },
        {
          criteriaId: 5,
          score: 8.3,
          comments: "Innovative solutions.",
        },
        {
          criteriaId: 6,
          score: 7.5,
          comments: "Good planning overall.",
        },
      ],
    },
  ];

  return baseGrades.map((entry) => {
    const normalizedGrades = entry.scores.map((item) => {
      const criterion = criteriaList.find(
        (criteriaItem) => criteriaItem.criteriaId === item.criteriaId
      );
      const weight = criterion?.weight ?? 0;
      const score = Number(item.score ?? 0);
      return {
        criteriaId: item.criteriaId,
        criteriaName: criterion?.criteriaName ?? "",
        weight,
        score,
        weightedScore: Number((score * (weight / 100)).toFixed(2)),
        comments: item.comments ?? "",
      };
    });

    const finalScore = normalizedGrades.reduce((total, grade) => {
      const criterion = criteriaList.find(
        (criteriaItem) => criteriaItem.criteriaId === grade.criteriaId
      );
      if (!criterion || criterion.isContribution) {
        return total;
      }
      return total + Number(grade.score ?? 0) * ((criterion.weight ?? 0) / 100);
    }, 0);

    return {
      studentId: entry.studentId,
      studentCode: entry.studentCode,
      fullName: entry.fullName,
      finalScore: Number(
        (finalScore * (entry.contributionPercentage / 100)).toFixed(2)
      ),
      isCompleted: true,
      gradedDate: entry.gradedDate,
      contributionPercentage: entry.contributionPercentage,
      criteriaGrades: normalizedGrades,
    };
  });
};

const createDemoSessionDetail = (grades = []) => {
  const students = createDemoStudents().map((student) => {
    const grade = grades.find((item) => item.studentId === student.studentId);
    if (!grade) {
      return student;
    }
    return {
      ...student,
      isGraded: true,
      finalScore: grade.finalScore,
      gradedDate: grade.gradedDate,
    };
  });

  const gradedStudents = students.filter((student) => student.isGraded).length;

  return {
    sessionId: "demo-session",
    sessionName: "Capstone Defense Demo",
    description: "Demo grading session for TEAM_CAP2_005",
    teamId: 203,
    teamName: "TEAM_CAP2_005",
    graderId: 5,
    graderName: "Dr. Nguyen Van A",
    sessionDate: "2024-01-15T14:30:00Z",
    status: gradedStudents === students.length ? "Completed" : "Active",
    isCompleted: gradedStudents === students.length,
    createdDate: "2024-01-10T09:00:00Z",
    totalStudents: students.length,
    gradedStudents,
    students,
  };
};

const toScoreValue = (value) =>
  value === null || value === undefined ? "" : String(value);

const toCommentValue = (value) =>
  value === null || value === undefined ? "" : String(value);

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

const aggregateDetailedGrades = (details) => {
  if (!Array.isArray(details)) {
    return [];
  }
  const grouped = new Map();
  details.forEach((detail) => {
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

  const [criteria, setCriteria] = useState([]);
  const [sessionDetail, setSessionDetail] = useState(null);
  const [grades, setGrades] = useState([]);
  const [forms, setForms] = useState({});
  const [teamScores, setTeamScores] = useState({});
  const [criterionComments, setCriterionComments] = useState({});
  const [demoMode, setDemoMode] = useState(false);
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

  const forcedDemoMode =
    group?.isDemo ||
    (typeof import.meta !== "undefined" &&
      import.meta.env?.VITE_USE_GRADING_DEMO === "true");

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
      const fallbackTeamId = pickFirstValue(
        rawSession?.teamId,
        rawSession?.TeamId,
        group?.teamId,
        group?.team?.teamId,
        teamId
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
        group,
      });
    },
    [group, teamId]
  );

  useEffect(() => {
    if (!sessionId) {
      setError("Không tìm thấy phiên chấm điểm hợp lệ.");
      setLoading(false);
      return;
    }

    if (forcedDemoMode) {
      if (!demoMode) {
        activateDemoMode();
      }
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
        const aggregatedGrades = aggregateDetailedGrades(
          Array.isArray(gradesData) ? gradesData : []
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
          // Nếu lỗi do thiếu cột trong DB (lỗi backend đang gặp), hiển thị rõ hoặc fallback demo
          if (serverMessage.includes("Invalid column name")) {
             console.warn("Backend schema mismatch detected (Missing columns).");
             setError(`Lỗi Backend: Database thiếu cột dữ liệu (${serverMessage}). Vui lòng cập nhật Database.`);
             // Nếu muốn tự động chuyển sang demo mode thì uncomment dòng dưới:
             // activateDemoMode(); 
             return;
          }

          setError(`Lỗi từ server (400): ${serverMessage || "Yêu cầu không hợp lệ"}`);
          return;
        }

        if (!err?.status) {
          console.warn("Network error or unknown error, falling back to demo mode if applicable");
          activateDemoMode();
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
  }, [
    sessionId,
    forcedDemoMode,
    demoMode,
    // prepareSessionDetail removed to prevent infinite loop
    // activateDemoMode removed to prevent infinite loop
  ]);

  useEffect(() => {
    if (!criteria.length || !students.length) {
      setForms({});
      setTeamScores({});
      setCriterionComments({});
      return;
    }
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
  }, [criteria, students]);
  // Note: criteriaForScoring and gradeLookup removed from deps to prevent infinite loop
  // They are derived from criteria/grades which are already in deps

  const handleBackClick = () => {
    if (typeof onBack === "function") {
      onBack();
    }
  };

  const handleScoreChange =
    (criteriaId, targetStudentId = null) =>
    (event) => {
      const { value } = event.target;
      if (teamScopeIds.has(criteriaId)) {
        setTeamScores((prev) => ({
          ...prev,
          [criteriaId]: value,
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
              [criteriaId]: value,
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
    setForms((prev) => {
      const baseForm = prev[targetId] ?? buildEmptyForm(criteria);
      return {
        ...prev,
        [targetId]: {
          ...baseForm,
          contributionPercentage: nextValue,
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
    if (demoMode || !sessionId) {
      return;
    }
    const [updatedGrades, updatedSession] = await Promise.all([
      GradingAPI.getSessionGrades(sessionId),
      GradingAPI.getSessionDetail(sessionId),
    ]);
    const aggregatedGrades = aggregateDetailedGrades(
      Array.isArray(updatedGrades) ? updatedGrades : []
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

      if (demoMode) {
        const nowIso = new Date().toISOString();
        setGrades((prev) => {
          const nextGrades = [...prev];
          studentPayloads.forEach((payload) => {
            const normalizedGrades = payload.criteriaGrades.map((item) => {
              const criterion = criteriaMap[item.criteriaId];
              const weight = criterion?.weight ?? 0;
              const score = Number(item.score ?? 0);
              return {
                ...item,
                score,
                criteriaName: criterion?.criteriaName ?? "",
                weight,
                weightedScore: Number((score * (weight / 100)).toFixed(2)),
              };
            });
            const finalScore = calculateFinalScore(
              normalizedGrades,
              payload.contributionPercentage
            );
            const gradeData = {
              studentId: payload.studentId,
              studentCode: payload.student?.studentCode ?? "",
              fullName: payload.student?.fullName ?? "",
              finalScore,
              isCompleted: true,
              gradedDate: nowIso,
              contributionPercentage: payload.contributionPercentage,
              criteriaGrades: normalizedGrades,
            };
            const existingIndex = nextGrades.findIndex(
              (item) => item.studentId === payload.studentId
            );
            if (existingIndex >= 0) {
              nextGrades[existingIndex] = gradeData;
            } else {
              nextGrades.push(gradeData);
            }
          });
          return nextGrades;
        });

        setSessionDetail((prev) => {
          if (!prev) {
            return prev;
          }
          const students = (prev.students ?? []).map((student) => {
            const payload = studentPayloads.find(
              (item) => item.studentId === student.studentId
            );
            if (!payload) {
              return student;
            }
            const normalizedGrades = payload.criteriaGrades.map((item) => {
              const criterion = criteriaMap[item.criteriaId];
              const weight = criterion?.weight ?? 0;
              const score = Number(item.score ?? 0);
              return {
                ...item,
                score,
                criteriaName: criterion?.criteriaName ?? "",
                weight,
                weightedScore: Number((score * (weight / 100)).toFixed(2)),
              };
            });
            const finalScore = calculateFinalScore(
              normalizedGrades,
              payload.contributionPercentage
            );
            return {
              ...student,
              finalScore,
              isGraded: true,
              gradedDate: nowIso,
            };
          });
          const gradedStudents = students.filter(
            (student) => student.isGraded
          ).length;
          const isCompleted =
            students.length > 0 && gradedStudents === students.length;
          return {
            ...prev,
            students,
            gradedStudents,
            isCompleted,
            status: isCompleted ? "Completed" : prev.status,
          };
        });

        setSuccessMessage("Đã lưu điểm cho toàn bộ nhóm (demo).");
        return;
      }

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

        // Get current user info for evaluatorId
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const evaluatorId = sessionDetail?.graderId || userInfo?.accountId || 1;

        const body = {
          gradingSessionId: sessionId,
          studentId: payload.studentId,
          evaluatorId: evaluatorId,
          evaluatorRole: "Secretary",
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
                        onChange={handleScoreChange(criterion.criteriaId)}
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
                              entry.student.studentId
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
                  <div className={styles.gradeIPS}></div>
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
