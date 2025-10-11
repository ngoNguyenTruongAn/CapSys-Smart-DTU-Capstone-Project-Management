import React, { useCallback, useEffect, useMemo, useState } from "react";
import gradingAPI from "../../services/grading.api";
import styles from "./GradingDetailPage.module.css";
import StudentSelect from "../../components/grading/StudentSelect.jsx"
import ContributionSelect from "../../components/grading/ContributionSelect.jsx"; 
import Toasts from "../../components/ui/Toasts.jsx";

const CONTRIBUTION_LEVELS = [
  { value: "Low", label: "Low - 0.5 điểm" },
  { value: "Medium", label: "Medium - 1.0 điểm" },
  { value: "High", label: "High - 1.5 điểm" },
  { value: "Excellent", label: "Excellent - 2.0 điểm" },
];

const CONTRIBUTION_SCORES = {
  Low: 0.5,
  Medium: 1,
  High: 1.5,
  Excellent: 2,
};

const createDemoCriteria = () => [
  {
    criteriaId: 1,
    criteriaName: "Technical Skills",
    description: "Evaluate code quality, technology usage, and implementation.",
    weight: 20,
    maxScore: 10,
    isActive: true,
    isContribution: false,
  },
  {
    criteriaId: 2,
    criteriaName: "Problem Solving",
    description: "Ability to analyse and solve project problems effectively.",
    weight: 20,
    maxScore: 10,
    isActive: true,
    isContribution: false,
  },
  {
    criteriaId: 3,
    criteriaName: "Communication",
    description: "Presentation skill and clarity when handling Q&A.",
    weight: 10,
    maxScore: 10,
    isActive: true,
    isContribution: false,
  },
  {
    criteriaId: 4,
    criteriaName: "Teamwork",
    description: "Collaboration, supportiveness, and peer interaction.",
    weight: 20,
    maxScore: 10,
    isActive: true,
    isContribution: false,
  },
  {
    criteriaId: 5,
    criteriaName: "Creativity",
    description: "Innovation in solution design and approach.",
    weight: 20,
    maxScore: 10,
    isActive: true,
    isContribution: false,
  },
  {
    criteriaId: 6,
    criteriaName: "Project Management",
    description: "Planning, timeline control, and deliverable tracking.",
    weight: 10,
    maxScore: 10,
    isActive: true,
    isContribution: false,
  },
  {
    criteriaId: 7,
    criteriaName: "Contribution",
    description: "Auto-calculated bonus based on contribution level.",
    weight: 0,
    maxScore: 2,
    isActive: true,
    isContribution: true,
  },
];

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
      contributionLevel: "High",
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

    const contributionScore = CONTRIBUTION_SCORES[entry.contributionLevel] ?? 0;

    return {
      studentId: entry.studentId,
      studentCode: entry.studentCode,
      fullName: entry.fullName,
      finalScore: Number((finalScore + contributionScore).toFixed(2)),
      isCompleted: true,
      gradedDate: entry.gradedDate,
      contributionLevel: entry.contributionLevel,
      contributionScore,
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
    contributionLevel: "",
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

  if (grade.contributionLevel) {
    form.contributionLevel = grade.contributionLevel;
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
    typeof resolvedSessionId === "number" || typeof resolvedSessionId === "string"
      ? resolvedSessionId
      : null;

  const [criteria, setCriteria] = useState([]);
  const [sessionDetail, setSessionDetail] = useState(null);
  const [grades, setGrades] = useState([]);
  const [forms, setForms] = useState({});
  const [demoMode, setDemoMode] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialised, setInitialised] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState([]);

  const activateDemoMode = useCallback(() => {
    const demoCriteria = createDemoCriteria();
    const demoGrades = createDemoGrades(demoCriteria);
    const demoSession = createDemoSessionDetail(demoGrades);
    setDemoMode(true);
    setCriteria(demoCriteria);
    setSessionDetail(demoSession);
    setGrades(demoGrades);
    setError("");
    setLoading(false);
    setInitialised(true);
  }, []);

  const criteriaForScoring = useMemo(
    () => criteria.filter((item) => !item.isContribution),
    [criteria]
  );

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

  const students = sessionDetail?.students ?? [];

  const studentSummaries = useMemo(() => {
    if (!students.length) {
      return [];
    }
    return students.map((student) => {
      const grade = gradeLookup[student.studentId];
      const formContribution = forms[student.studentId]?.contributionLevel ?? "";
      const finalScore =
        grade?.finalScore ??
        (typeof student.finalScore === "number" ? student.finalScore : null);
      return {
        ...student,
        finalScore,
        isCompleted: grade?.isCompleted ?? student.isGraded ?? false,
        gradedDate: grade?.gradedDate ?? student.gradedDate ?? null,
        contributionLevel:
          grade?.contributionLevel ??
          grade?.contribution?.level ??
          formContribution,
      };
    });
  }, [students, gradeLookup, forms]);

  const currentForm =
    selectedStudentId && forms[selectedStudentId]
      ? forms[selectedStudentId]
      : null;

  const forcedDemoMode =
    group?.isDemo ||
    (typeof import.meta !== "undefined" &&
      import.meta.env?.VITE_USE_GRADING_DEMO === "true");

  const calculateFinalScore = useCallback(
    (criteriaGrades, contributionLevel) => {
      const baseScore = criteriaGrades.reduce((total, item) => {
        const criterion = criteriaMap[item.criteriaId];
        if (!criterion || criterion.isContribution) {
          return total;
        }
        const weight = (criterion.weight ?? 0) / 100;
        const score = Number(item.score ?? 0);
        return total + score * weight;
      }, 0);
      const contributionScore = CONTRIBUTION_SCORES[contributionLevel] ?? 0;
      return Number((baseScore + contributionScore).toFixed(2));
    },
    [criteriaMap]
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
      try {
        const [criteriaData, sessionData, gradesData] = await Promise.all([
          gradingAPI.getCriteria(),
          gradingAPI.getSessionDetail(sessionId),
          gradingAPI.getSessionGrades(sessionId),
        ]);
        if (ignore) {
          return;
        }
        setCriteria(Array.isArray(criteriaData) ? criteriaData : []);
        setSessionDetail(sessionData ?? null);
        setGrades(Array.isArray(gradesData) ? gradesData : []);
        setError("");
      } catch (err) {
        if (ignore) {
          return;
        }
        if (!err?.status) {
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
  }, [sessionId, forcedDemoMode, demoMode, activateDemoMode]);

  useEffect(() => {
    if (!criteria.length || !students.length) {
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
  }, [criteria, students, gradeLookup]);

  useEffect(() => {
    if (!students.length) {
      setSelectedStudentId(null);
      return;
    }
    setSelectedStudentId((prev) => {
      if (
        prev !== null &&
        prev !== undefined &&
        students.some((student) => student.studentId === prev)
      ) {
        return prev;
      }
      return students[0].studentId;
    });
  }, [students]);

  const handleBackClick = () => {
    if (typeof onBack === "function") {
      onBack();
    }
  };

  const handleScoreChange = (criteriaId) => (event) => {
    if (!selectedStudentId) {
      return;
    }
    const { value } = event.target;
    setForms((prev) => {
      const baseForm = prev[selectedStudentId] ?? buildEmptyForm(criteria);
      return {
        ...prev,
        [selectedStudentId]: {
          ...baseForm,
          scores: {
            ...baseForm.scores,
            [criteriaId]: value,
          },
        },
      };
    });
    setError("");
  };

  const handleCommentChange = (criteriaId) => (event) => {
    if (!selectedStudentId) {
      return;
    }
    const { value } = event.target;
    setForms((prev) => {
      const baseForm = prev[selectedStudentId] ?? buildEmptyForm(criteria);
      return {
        ...prev,
        [selectedStudentId]: {
          ...baseForm,
          comments: {
            ...baseForm.comments,
            [criteriaId]: value,
          },
        },
      };
    });
  };

  const handleContributionChange = (event) => {
    if (!selectedStudentId) {
      return;
    }
    const { value } = event.target;
    setForms((prev) => {
      const baseForm = prev[selectedStudentId] ?? buildEmptyForm(criteria);
      return {
        ...prev,
        [selectedStudentId]: {
          ...baseForm,
          contributionLevel: value,
        },
      };
    });
  };

  const buildPayload = () => {
    if (!selectedStudentId || !criteriaForScoring.length) {
      return {
        error: ["Vui lòng chọn sinh viên trước khi chấm điểm."],
      };
    }

    const form = forms[selectedStudentId] ?? buildEmptyForm(criteria);
    const missingCriteria = [];
    const invalidScores = [];
    const criteriaGrades = [];

    criteriaForScoring.forEach((criterion) => {
      const raw = form.scores?.[criterion.criteriaId];
      if (!hasNumericValue(raw)) {
        missingCriteria.push(criterion.criteriaName);
        return;
      }

      const numericValue = Number(raw);
      if (numericValue < 0) {
        invalidScores.push(
          `${criterion.criteriaName}: Điểm không được nhỏ hơn 0.`
        );
      }
      if (
        typeof criterion.maxScore === "number" &&
        numericValue > criterion.maxScore
      ) {
        invalidScores.push(
          `${criterion.criteriaName}: Điểm không được vượt quá ${criterion.maxScore}.`
        );
      }

      criteriaGrades.push({
        criteriaId: criterion.criteriaId,
        score: numericValue,
        comments: form.comments?.[criterion.criteriaId] ?? "",
      });
    });

    const removeErrorAt = (idx) => {
      setErrors((prev) => prev.filter((_, i) => i !== idx));
    };

    const messages = [];
    if (missingCriteria.length > 0) {
      messages.push(`Vui lòng nhập điểm cho các tiêu chí: ${missingCriteria.join(", ")}.`);
    }

    if (invalidScores.length > 0) {
      messages.push(...invalidScores);
    }

    const contributionLevel = form.contributionLevel;
    if (!contributionLevel) {
      messages.push("Vui lòng chọn mức đóng góp của sinh viên.");
    }

    if (messages.length > 0) {
      return { errors: messages };
    }

    return {
      createPayload: {
        studentId: selectedStudentId,
        criteriaGrades,
        contributionLevel,
      },
      updatePayload: {
        criteriaGrades,
        contributionLevel,
      },
    };
  };

  const refreshData = async () => {
    if (demoMode || !sessionId) {
      return;
    }
    const [updatedGrades, updatedSession] = await Promise.all([
      gradingAPI.getSessionGrades(sessionId),
      gradingAPI.getSessionDetail(sessionId),
    ]);
    setGrades(Array.isArray(updatedGrades) ? updatedGrades : []);
    setSessionDetail(updatedSession ?? null);
  };

  const handleSaveGrade = async () => {
    setSuccessMessage("");
    setErrors([]); 
    const payloads = buildPayload();
    if (payloads.errors?.length) {  
      setErrors(payloads.errors);
      setError("");                 
      return;
    }
    if (!sessionId) {
      setError("Không tìm thấy phiên chấm điểm hợp lệ.");
      return;
    }
    const targetStudent = studentSummaries.find(
      (student) => student.studentId === selectedStudentId
    );
    const gradeEntry = gradeLookup[selectedStudentId];
    const shouldUpdate =
      gradeEntry &&
      Array.isArray(gradeEntry.criteriaGrades) &&
      gradeEntry.criteriaGrades.length > 0;

    try {
      setSaving(true);
      setError("");

      if (demoMode) {
        const nowIso = new Date().toISOString();
        const contributionLevel = payloads.createPayload.contributionLevel;
        const normalizedGrades = payloads.createPayload.criteriaGrades.map(
          (item) => {
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
          }
        );
        const finalScore = calculateFinalScore(
          normalizedGrades,
          contributionLevel
        );
        const contributionScore = CONTRIBUTION_SCORES[contributionLevel] ?? 0;

        const gradeData = {
          studentId: selectedStudentId,
          studentCode: targetStudent?.studentCode ?? "",
          fullName: targetStudent?.fullName ?? "",
          finalScore,
          isCompleted: true,
          gradedDate: nowIso,
          contributionLevel,
          contributionScore,
          criteriaGrades: normalizedGrades,
        };

        setGrades((prev) => {
          const existingIndex = prev.findIndex(
            (item) => item.studentId === selectedStudentId
          );
          if (existingIndex >= 0) {
            const next = prev.slice();
            next[existingIndex] = gradeData;
            return next;
          }
          return [...prev, gradeData];
        });

        setSessionDetail((prev) => {
          if (!prev) {
            return prev;
          }
          const students = (prev.students ?? []).map((student) => {
            if (student.studentId !== selectedStudentId) {
              return student;
            }
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

        setSuccessMessage(
          `Đã lưu điểm cho ${
            targetStudent?.fullName ?? "sinh viên"
          } thành công.`
        );
        return;
      }

      if (shouldUpdate) {
        await gradingAPI.updateStudentGrade(
          sessionId,
          selectedStudentId,
          payloads.updatePayload
        );
      } else {
        await gradingAPI.createStudentGrade(sessionId, payloads.createPayload);
      }
      await refreshData();
      setSuccessMessage(
        `Đã lưu điểm cho ${
          targetStudent?.fullName ?? "sinh viên"
        } thành công.`
      );
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
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>Đang tải dữ liệu chấm điểm...</div>
      </div>
    );
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
      <div className={styles.headerBar}>
        <button className={styles.backLink} onClick={handleBackClick}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 18L8 12L16 6" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
        <div className={styles.studentSelector}>
          <StudentSelect
            studentSummaries={studentSummaries}
            selectedStudentId={selectedStudentId}
            setSelectedStudentId={setSelectedStudentId}
            selectId="student-select"
            label="Chọn sinh viên"
          />
        </div>
      </div>

      <Toasts
        errors={errors}
        onClearErrorAt={(idx) => setErrors((prev) => prev.filter((_, i) => i !== idx))}
        onClearErrors={() => setErrors([])}
        successMessage={successMessage}
        onClearSuccess={() => setSuccessMessage("")}
        autoHideSuccessMs={4000}
        autoHideErrorMs={6000} // Bật nếu muốn mỗi lỗi tự ẩn sau 6s
      />



      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tiêu chí</th>
              <th>Mô tả</th>
              <th className={styles.headScore}>Đánh giá</th>
              <th>Điểm thực</th>
              <th>Nhận xét</th>
            </tr>
          </thead>
          <tbody>
          {criteriaForScoring.map((criterion) => {
            const rawScore = currentForm?.scores?.[criterion.criteriaId];
            const hasScore = hasNumericValue(rawScore);
            const scoreNum = hasScore ? Number(rawScore) : null;
            const ipsValue =
              scoreNum !== null
                ? scoreNum * ((criterion.weight ?? 0) / 100)
                : null;
            
            return (
              <tr key={criterion.criteriaId}>
                <td className={styles.colTitle}>
                  {criterion.criteriaName}
                </td>
                <td className={styles.description}>
                  <div className={styles.descWrap}>
                    <div className={styles.colDesc}>
                      {criterion.description ?? "Chưa có mô tả"}
                    </div>
                    <div className={styles.gradeIPS}>
                      <div className={styles.hint}>Trọng số:</div>
                      <div className={styles.weight}>{criterion.weight ?? 0}%</div>
                    </div>
                  </div>
                </td>
                <td className={styles.colScore}>
                  <input
                    className={styles.scoreInput}
                    type="number"
                    min="0"
                    step="0.1"
                    max={criterion.maxScore ?? 10}
                    value={currentForm?.scores?.[criterion.criteriaId] ?? ""}
                    onChange={handleScoreChange(criterion.criteriaId)}
                    disabled={!selectedStudentId}
                    placeholder="--"
                  />
                </td>
                <td className={styles.colIps}>{
                      ipsValue === null ? "--" : ipsValue.toFixed(2)
                    }
                </td>
                <td className={styles.colComment}>
                  <textarea
                    className={styles.commentInput}
                    value={currentForm?.comments?.[criterion.criteriaId] ?? ""}
                    onChange={handleCommentChange(criterion.criteriaId)}
                    placeholder="Nhận xét (không bắt buộc)"
                    disabled={!selectedStudentId}
                  />
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>

      <ContributionSelect
        selectId="contribution-select"
        labelText={<><strong>Contribution(*)</strong> Mức độ đóng góp của sinh viên</>}
        value={currentForm?.contributionLevel ?? ""}
        onChange={handleContributionChange}
        options={CONTRIBUTION_LEVELS}
        disabled={!selectedStudentId}
        maxWidth={420} // tuỳ chọn: giới hạn chiều rộng tối đa
      />

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
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleSaveGrade}
            disabled={saving || !selectedStudentId}
          >
            {saving ? "Đang lưu..." : "Lưu điểm"}
          </button>
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {studentSummaries.map((student, index) => {
              const isSelected =
                selectedStudentId !== null &&
                selectedStudentId !== undefined &&
                String(student.studentId) === String(selectedStudentId);
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
                  <td>{student.contributionLevel || "--"}</td>
                  <td width="120">
                    <button
                      className={`${styles.iconBtn} ${
                        isSelected ? styles.iconBtnActive : ""
                      }`}
                      onClick={() => setSelectedStudentId(student.studentId)}
                    >
                      Chấm điểm
                    </button>
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
