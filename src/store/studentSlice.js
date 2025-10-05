// src/redux/slices/StudentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllStudentsAPI } from "../services/StudentsAPI";

// Async thunk để fetch sinh viên từ API
export const fetchStudents = createAsyncThunk(
  "students/fetchStudents",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAllStudentsAPI();
      return res.data; // giả sử API trả về { data: [...] }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Không thể tải danh sách sinh viên"
      );
    }
  }
);

const studentSlice = createSlice({
  name: "students",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearStudents: (state) => {
      state.data = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchStudents pending
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // fetchStudents thành công
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload || [];
      })
      // fetchStudents thất bại
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
      });
  },
});

export const { clearStudents } = studentSlice.actions;
export default studentSlice.reducer;
