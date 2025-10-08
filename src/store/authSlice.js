import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  forgetPasswordAPI,
  LoginAPI,
  LogoutAPI,
  registerStudentAPI,
  resetPasswordAPI,
} from "../services/AuthAPI";
import { extraReducers } from "./authReducers";

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await LoginAPI(email, password);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const logoutAsync = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await LogoutAPI();
      return true;
    } catch (error) {
      return rejectWithValue(error.message || "Logout failed");
    }
  }
);

export const forgetPassword = createAsyncThunk(
  "auth/forgetPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      await forgetPasswordAPI(email);
      return true;
    } catch (error) {
      return rejectWithValue(error.message || "ForgetPassword failed");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    { email, resetCode, newPassword, confirmPassword },
    { rejectWithValue }
  ) => {
    try {
      await resetPasswordAPI(email, resetCode, newPassword, confirmPassword);
      return true;
    } catch (error) {
      return rejectWithValue(error.message || "ResetPassword failed");
    }
  }
);

export const registerStudent = createAsyncThunk(
  "auth/registerStudent",
  async (studentData, { rejectWithValue }) => {
    try {
      const res = await registerStudentAPI(studentData);
      return { success: true, message: res.message || "Đăng ký thành công" };
    } catch (error) {
      return rejectWithValue(error.message || "RegisterStudent failed");
    }
  }
);

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  accountType: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.accountType = null;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accountType");
    },
    restoreSession(state) {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");
      const accountType = localStorage.getItem("accountType");
      if (token) {
        state.token = token;
      }
      if (refreshToken) {
        state.refreshToken = refreshToken;
      }
      if (accountType) {
        state.accountType = accountType;
      }
    },
  },
  extraReducers: extraReducers,
});

export const { logout, restoreSession } = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthToken = (state) => state.auth.token;
export const selectAccountType = (state) => state.auth.accountType;
export const selectCurrentUser = (state) => state.auth.user;

export default authSlice.reducer;
