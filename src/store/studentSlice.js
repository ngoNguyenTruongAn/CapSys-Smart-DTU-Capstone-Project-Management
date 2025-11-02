// src/redux/slices/StudentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  deleteStudentByStudentCodeAPI,
  getAllStudentsAPI,
  getStudentByIdAPI,
  updateStudentByStudentCodeAPI,
} from "../services/StudentsAPI"; // Giả sử path đúng

// Async thunks
export const fetchStudents = createAsyncThunk(
  "students/fetchStudents",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAllStudentsAPI();
      return res.data; // Giả sử { data: [...] }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Không thể tải danh sách sinh viên"
      );
    }
  }
);

export const getStudentById = createAsyncThunk(
  "students/getStudentById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await getStudentByIdAPI(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi không xác định"
      );
    }
  }
);

export const updateStudent = createAsyncThunk(
  "students/updateStudent",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateStudentByStudentCodeAPI(id, data);
      if (!res.success) {
        return rejectWithValue(res.message || "Cập nhật thất bại");
      }
      return res; // { success, message, data: updatedStudent }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi không xác định"
      );
    }
  }
);

export const deleteStudent = createAsyncThunk(
  "students/deleteStudent",
  async (studentId, { rejectWithValue }) => {
    try {
      const res = await deleteStudentByStudentCodeAPI(studentId);
      if (!res.success) {
        return rejectWithValue(res.message || "Xóa sinh viên thất bại");
      }
      return { success: true, studentId };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Lỗi không xác định";
      return rejectWithValue(errorMessage);
    }
  }
);

const studentSlice = createSlice({
  name: "students",
  initialState: {
    data: [], // list students
    selectedStudent: null, // single student
    loading: false,
    error: null,
  },
  reducers: {
    clearStudents: (state) => {
      state.data = [];
      state.selectedStudent = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchStudents
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload || [];
        state.error = null;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
      })

      // getStudentById
      .addCase(getStudentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStudentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedStudent = action.payload || null;
        state.error = null;
      })
      .addCase(getStudentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
      })

      // updateStudent
      .addCase(updateStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.loading = false;
        const res = action.payload;
        if (res?.success && res?.data) {
          const updatedStudent = res.data;
          // Update trong list data
          const index = state.data.findIndex(
            (s) => s.studentId === updatedStudent.studentId
          );
          if (index !== -1) {
            state.data[index] = updatedStudent;
          }
          // Update selectedStudent nếu đang chọn
          if (
            state.selectedStudent &&
            state.selectedStudent.studentId === updatedStudent.studentId
          ) {
            state.selectedStudent = updatedStudent;
          }
        }
        state.error = null;
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
      })

      // deleteStudent
      .addCase(deleteStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.meta.arg; // ID từ thunk arg
        // Filter data để loại bỏ student đã xóa
        state.data = state.data.filter((s) => s.studentId !== deletedId);
        // Clear selectedStudent nếu đang chọn student bị xóa
        if (
          state.selectedStudent &&
          state.selectedStudent.studentId === deletedId
        ) {
          state.selectedStudent = null;
        }
        state.error = null;
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
      });
  },
});

// Selectors
export const selectStudentsLoading = (state) => state.students.loading;
export const selectStudentsError = (state) => state.students.error;
export const selectStudentsData = (state) => state.students.data;
export const selectSelectedStudent = (state) => state.students.selectedStudent;

export const { clearStudents } = studentSlice.actions;
export default studentSlice.reducer;
