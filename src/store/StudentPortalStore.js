import { create } from "zustand";
import instance from "../app/instance"; // axios instance của bạn

export const useStudentPortalStore = create((set) => ({
  profile: null,
  team: null,
  proposals: [],
  isLoading: false,
  error: null,

  // Hàm gọi API tổng hợp cho Dashboard
  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      // Gọi song song 2 API quan trọng nhất để tiết kiệm thời gian
      const [profileRes, teamRes] = await Promise.all([
        instance.get("/student-portal/my-profile"),
        instance.get("/student-portal/my-team"),
      ]);

      set({
        profile: profileRes.data.data, // Backend trả về ApiResponse.SuccessResult(data)
        team: teamRes.data.data,       // Backend trả về ApiResponse.SuccessResult(data)
        isLoading: false,
      });
    } catch (err) {
      console.error("Error fetching student dashboard:", err);
      set({
        error: err.response?.data?.message || "Lỗi tải dữ liệu",
        isLoading: false,
      });
    }
  },
}));