// src/redux/slices/LecturerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  deleteLecturerByLecturerCodeAPI,
  getAllLecturersAPI,
  getLecturerByIdAPI,
  updateLecturerBylecturerCodeAPI,
} from "../services/LecturersAPI";

// Lấy danh sách giảng viên
export const fetchLecturers = createAsyncThunk(
  "lecturers/fetchLecturers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAllLecturersAPI();
      return res.data; // mảng giảng viên
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Không thể tải danh sách giảng viên"
      );
    }
  }
);

// Lấy giảng viên theo Id
export const getLecturerById = createAsyncThunk(
  "lecturers/getLecturerById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await getLecturerByIdAPI(id);
      return res.data; // object lecturer
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi không xác định"
      );
    }
  }
);

// Cập nhật giảng viên
export const updateLecturer = createAsyncThunk(
  "lecturers/updateLecturer",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateLecturerBylecturerCodeAPI(id, data);
      if (!res.success) {
        return rejectWithValue(res.message || "Cập nhật giảng viên thất bại");
      }
      return res.data; // object lecturer đã cập nhật
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi không xác định"
      );
    }
  }
);

// Xóa giảng viên
export const deleteLecturer = createAsyncThunk(
  "lecturers/deleteLecturer",
  async (lecturerId, { rejectWithValue }) => {
    try {
      const res = await deleteLecturerByLecturerCodeAPI(lecturerId);
      if (!res.success) {
        return rejectWithValue(res.message || "Xóa giảng viên thất bại");
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi không xác định"
      );
    }
  }
);

/* ----------------- Slice ----------------- */
const lecturerSlice = createSlice({
  name: "lecturers",
  initialState: {
    data: [], // danh sách giảng viên
    selectedLecturer: null, // giảng viên được chọn
    loading: false,
    error: null,
  },
  reducers: {
    clearLecturers: (state) => {
      state.data = [];
      state.selectedLecturer = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* fetchLecturers */
      .addCase(fetchLecturers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLecturers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload || [];
      })
      .addCase(fetchLecturers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* getLecturerById */
      .addCase(getLecturerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLecturerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedLecturer = action.payload || null;
      })
      .addCase(getLecturerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* updateLecturer */
      .addCase(updateLecturer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLecturer.fulfilled, (state, action) => {
        state.loading = false;
        const updatedLecturer = action.payload;
        // Update trong list data
        const index = state.data.findIndex(
          (l) => l.lecturerId === updatedLecturer.lecturerId
        );
        if (index !== -1) {
          state.data[index] = updatedLecturer;
        }
        // Update selectedLecturer nếu đang chọn
        if (
          state.selectedLecturer &&
          state.selectedLecturer.lecturerId === updatedLecturer.lecturerId
        ) {
          state.selectedLecturer = updatedLecturer;
        }
      })
      .addCase(updateLecturer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* deleteLecturer */
      .addCase(deleteLecturer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLecturer.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.data = state.data.filter((l) => l.lecturerId !== deletedId);
        if (
          state.selectedLecturer &&
          state.selectedLecturer.lecturerId === deletedId
        ) {
          state.selectedLecturer = null;
        }
      })
      .addCase(deleteLecturer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

/* ----------------- Selectors ----------------- */
export const selectLecturersLoading = (state) => state.lecturers.loading;
export const selectLecturersError = (state) => state.lecturers.error;
export const selectLecturersData = (state) => state.lecturers.data;
export const selectSelectedLecturer = (state) =>
  state.lecturers.selectedLecturer;

export const { clearLecturers } = lecturerSlice.actions;
export default lecturerSlice.reducer;
