# CapSys-Smart-DTU-Capstone-Project-Management
 Hệ thống quản lý đồ án tốt nghiệp (CapDSS) – Smart DTU, được phát triển bằng **React + Vite**.  
 Ứng dụng hỗ trợ quản lý đề án, chấm điểm, phê duyệt và theo dõi lịch bảo vệ cho các vai trò: **Admin, Lecturer, Student**.
 ## 📂 Cấu trúc thư mục chính
```bash
src/
assets/
• logo/
• image/
• icon/
app/	        # Cấu hình app (router, providers)
layouts/	    # Layout tổng thể (DashboardLayout, AuthLayout)
pages/	      # Màn hình lớn (map với router)
• auth/      # (Login)
• admin/     # (Dashboard, Proposals, Approvals, Grading, Reports, Schedules)
• student/ 
• lecturer/ 
features/     # Chức năng nghiệp vụ (gom UI + logic + API riêng)
• proposals/    
• grading/
• approvals/
• schedules/
• reports/
components/	  # UI tái sử dụng
• ui/         # (Button, Input, Modal…)
• common/     # (Navbar, Sidebar, Footer)
• data/       # (Table, Chart…)
• domain/     # (StatCard, ProjectCard, TeamCard, GradeTable, ApprovalList)
hooks/	       # Custom hooks toàn app (useAuth, useFetch, useToast…)
services/    	# API client (http.js, auth.api.js, proposals.api.js…)
store/	       # State toàn cục (auth.js, ui.js, filters.js)
globalStyle/	CSS /  # (globals.css)
main.js	        # Entry point
App.js	        # App shell (bọc Router + Providers)
