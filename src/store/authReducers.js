import {
  login,
  logoutAsync,
  forgetPassword,
  resetPassword,
  registerStudent,
} from "./authSlice";

export const extraReducers = (builder) => {
  builder
    // case login
    .addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.accountType = action.payload.account?.accountType ?? null;
      state.account = action.payload.account ?? null;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
      if (action.payload.account?.accountType) {
        localStorage.setItem("accountType", action.payload.account.accountType);
      }
    })
    .addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Login failed";
    })
    // case logout
    .addCase(logoutAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(logoutAsync.fulfilled, (state) => {
      state.loading = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.accountType = null;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accountType");
    })
    .addCase(logoutAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Logout failed";
    })
    // case forgetPassword
    .addCase(forgetPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(forgetPassword.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
    })
    .addCase(forgetPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "ForgetPassword failed";
    })
    // case resetPassword
    .addCase(resetPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(resetPassword.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
    })
    .addCase(resetPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "ResetPassword failed";
    })

    // case registerStudent
    .addCase(registerStudent.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(registerStudent.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
    })
    .addCase(registerStudent.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "RegisterStudent failed";
    });
};
