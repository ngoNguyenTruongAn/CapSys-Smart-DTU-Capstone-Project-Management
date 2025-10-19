import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import studentReducer from "./studentSlice";
import lecturerReducer from "./lecturerSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    lecturers: lecturerReducer,
  },
});

export default store;
