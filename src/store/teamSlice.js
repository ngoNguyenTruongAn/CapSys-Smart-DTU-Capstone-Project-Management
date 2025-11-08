import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createTeamAPI,
  deleteTeamAPI,
  getAllTeamsAPI,
  getTeamByIdAPI,
  updateTeamAPI,
  getTeamsWithoutMentorAPI,
  getMentorWorkloadAPI,
  postAssignMentorAPI,
  postRemoveMentorAPI,
  getStudentsNotInTeamAPI,
  postMoveStudentAPI,
  postSwapStudentAPI
} from "../services/TeamsAPI";

export const fetchAllTeams = createAsyncThunk(
  "teams/fetchAllTeams",
  async (capstoneType, { rejectWithValue }) => {
    try {
      const res = await getAllTeamsAPI(capstoneType);
      if (!res.success) {
        return rejectWithValue(res.message || "Lỗi không xác định");
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi không xác định"
      );
    }
  }
);

export const getTeamById = createAsyncThunk(
  "teams/getTeamById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await getTeamByIdAPI(id);
      if (!res.success) {
        return rejectWithValue(res.message || "Lỗi không xác định");
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi không xác định"
      );
    }
  }
);

export const updateTeam = createAsyncThunk(
  "teams/updateTeam",
  async (
    { teamId, teamName, projectTitle, teamLeaderId, mentorId, status },
    { rejectWithValue }
  ) => {
    try {
      const res = await updateTeamAPI(
        teamId,
        teamName,
        projectTitle,
        teamLeaderId,
        mentorId,
        status
      );
      if (!res.success) {
        return rejectWithValue(res.message || "Cập nhật nhóm thất bại");
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi không xác định"
      );
    }
  }
);

export const deleteTeam = createAsyncThunk(
  "teams/deleteTeam",
  async (id, { rejectWithValue }) => {
    try {
      const res = await deleteTeamAPI(id);
      if (!res.success) {
        return rejectWithValue(res.message || "Xóa nhóm thất bại");
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi không xác định"
      );
    }
  }
);

export const createTeam = createAsyncThunk(
  "teams/createTeam",
  async (teamData, { rejectWithValue }) => {
    try {
      const res = await createTeamAPI(teamData);
      if (!res.success) {
        return rejectWithValue(res.message || "Tạo nhóm thất bại");
      }
      return res.data; // { success, message, data: createdTeam }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi không xác định"
      );
    }
  }
);

export const fetchTeamsWithoutMentor = createAsyncThunk(
  "teams/fetchTeamsWithoutMentor",
  async (capstoneType, { rejectWithValue }) => {
    try {
      const res = await getTeamsWithoutMentorAPI(capstoneType);
      return res.data || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi không xác định"
      );
    }
  }
);

export const fetchMentorWorkload = createAsyncThunk(
  "teams/fetchMentorWorkload",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getMentorWorkloadAPI();
      return res.data || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi không xác định"
      );
    }
  }
);

export const assignMentor = createAsyncThunk(
  "teams/assignMentor",
  async ({ teamId, mentorId }, { rejectWithValue }) => {
    try {
      const res = await postAssignMentorAPI(teamId, mentorId);
      if (!res.success) {
        return rejectWithValue(res.message || "Gán mentor thất bại");
      }
      return { teamId, mentorId, data: res.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi không xác định"
      );
    }
  }
);

export const removeMentor = createAsyncThunk(
  "teams/removeMentor",
  async (teamId, { rejectWithValue }) => {
    try {
      const res = await postRemoveMentorAPI(teamId);
      if (!res.success) {
        return rejectWithValue(res.message || "Gỡ mentor thất bại");
      }
      return { teamId, data: res.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi không xác định"
      );
    }
  }
);

export const fetchStudentsNotInTeam = createAsyncThunk(
  "teams/fetchStudentsNotInTeam",
  async (capstoneType, { rejectWithValue }) => {
    try {
      const res = await getStudentsNotInTeamAPI(capstoneType);
      return res.data || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi không xác định"
      );
    }
  }
);

export const moveStudents = createAsyncThunk(
  "teams/moveStudents",
  async ({ studentIds, targetTeamId }, { rejectWithValue }) => {
    try {
      const res = await postMoveStudentAPI(studentIds, targetTeamId);
      if (!res.success) {
        return rejectWithValue(res.message || "Di chuyển sinh viên thất bại");
      }
      return { studentIds, targetTeamId, data: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi không xác định");
    }
  }
);

export const swapStudents = createAsyncThunk(
  "teams/swapStudents",
  async ({ studentId1, studentId2 }, { rejectWithValue }) => {
    try {
      const res = await postSwapStudentAPI(studentId1, studentId2);
      if (!res.success) {
        return rejectWithValue(res.message || "Đổi sinh viên thất bại");
      }
      return { studentId1, studentId2, data: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi không xác định");
    }
  }
);

const teamSlice = createSlice({
  name: "teams",
  initialState: {
    data: [],
    selectedTeam: null,
    teamsWithoutMentor: [],
    mentorWorkload: [],
    studentsNotInTeam: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearTeams: (state) => {
      state.data = [];
      state.selectedTeam = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* fetchAllTeams */
      .addCase(fetchAllTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload || [];
        state.error = null;
      })
      .addCase(fetchAllTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
      })

      /* getTeamById */
      .addCase(getTeamById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeamById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTeam = action.payload || null;
        state.error = null;
      })
      .addCase(getTeamById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
      })

      /* updateTeam */
      .addCase(updateTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTeam = action.payload || null;
        state.error = null;
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
      })

      /* deleteTeam */
      .addCase(deleteTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((t) => t.teamId !== action.payload);
        state.error = null;
      })
      .addCase(deleteTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
      })

      /* createTeam */
      .addCase(createTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
        state.error = null;
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
      })

      /* fetchTeamsWithoutMentor */
      .addCase(fetchTeamsWithoutMentor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamsWithoutMentor.fulfilled, (state, action) => {
        state.loading = false;
        state.teamsWithoutMentor = action.payload || [];
        state.error = null;
      })
      .addCase(fetchTeamsWithoutMentor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
      })

      /* fetchMentorWorkload */
      .addCase(fetchMentorWorkload.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMentorWorkload.fulfilled, (state, action) => {
        state.loading = false;
        state.mentorWorkload = action.payload || [];
        state.error = null;
      })
      .addCase(fetchMentorWorkload.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
      })

      /* assignMentor */
      .addCase(assignMentor.fulfilled, (state, action) => {
        // Update team in data list
        const teamIndex = state.data.findIndex(
          (t) => t.teamId === action.payload.teamId
        );
        if (teamIndex !== -1) {
          state.data[teamIndex].mentorId = action.payload.mentorId;
        }
        // Remove from teamsWithoutMentor
        state.teamsWithoutMentor = state.teamsWithoutMentor.filter(
          (t) => t.teamId !== action.payload.teamId
        );
      })

      /* removeMentor */
      .addCase(removeMentor.fulfilled, (state, action) => {
        // Update team in data list
        const teamIndex = state.data.findIndex(
          (t) => t.teamId === action.payload.teamId
        );
        if (teamIndex !== -1) {
          state.data[teamIndex].mentorId = null;
          state.data[teamIndex].mentorName = null;
        }
      })

      /* fetchStudentsNotInTeam */
      .addCase(fetchStudentsNotInTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentsNotInTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.studentsNotInTeam = action.payload || [];
        state.error = null;
      })
      .addCase(fetchStudentsNotInTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
      })

      /* moveStudents */
      .addCase(moveStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveStudents.fulfilled, (state, action) => {
        state.loading = false;
        const { studentIds, targetTeamId } = action.payload;
        // Update local state (optional — nếu muốn sync UI luôn)
        state.data = state.data.map((team) => {
          const updatedStudents = team.students?.filter(
            (s) => !studentIds.includes(s.studentId)
          );
          if (team.teamId === targetTeamId) {
            // Giả định team.students có sẵn, push sinh viên mới vào nhóm đích
            team.students = [...(team.students || []), ...(action.payload.data || [])];
          } else {
            team.students = updatedStudents;
          }
          return team;
        });
        state.error = null;
      })
      .addCase(moveStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
      })

      /* swapStudents */
      .addCase(swapStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(swapStudents.fulfilled, (state, action) => {
        state.loading = false;
        const { studentId1, studentId2 } = action.payload;

        // Update local state nếu muốn sync UI ngay
        const allStudents = state.data.flatMap((t) => t.students || []);
        const s1 = allStudents.find((s) => s.studentId === studentId1);
        const s2 = allStudents.find((s) => s.studentId === studentId2);
        if (!s1 || !s2) return;

        state.data = state.data.map((team) => {
          const newTeam = { ...team };
          if (newTeam.teamId === s1.teamId) {
            newTeam.students = newTeam.students.map((s) =>
              s.studentId === s1.studentId ? { ...s2, teamId: newTeam.teamId } : s
            );
          } else if (newTeam.teamId === s2.teamId) {
            newTeam.students = newTeam.students.map((s) =>
              s.studentId === s2.studentId ? { ...s1, teamId: newTeam.teamId } : s
            );
          }
          return newTeam;
        });

        state.error = null;
      })
      .addCase(swapStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
      });
  },
});

export const { clearTeams } = teamSlice.actions;
export default teamSlice.reducer;
