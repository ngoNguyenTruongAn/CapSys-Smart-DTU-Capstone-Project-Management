import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import studentReducer from "./studentSlice";
import lecturerReducer from "./lecturerSlice";
import teamReducer from "./teamSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    lecturers: lecturerReducer,
    teams: teamReducer,
  },
});

export default store;
