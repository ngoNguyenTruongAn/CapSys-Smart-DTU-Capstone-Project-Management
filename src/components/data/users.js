export const students = [
  {
    id: "SV001",
    name: "Nguyễn Văn A",
    email: "a@dtu.edu.vn",
    phone: "0905-111-222",
    dob: "2002-03-15",
    gender: "Nam",
    major: "Công nghệ thông tin",
    year: 4,
    gpa: 3.4,
    capstoneId: null, // id nhóm capstone nếu đã join
    capstoneRole: null, // Leader / Member
    advisorId: null, // id giảng viên hướng dẫn
    status: "active", // active / graduated / dropped
    joinDate: "2025-01-20", // ngày đăng ký capstone
    skills: ["React", "Node.js"], // mảng kỹ năng
    avatar: "/images/students/sv001.jpg",
    address: "Đà Nẵng, Việt Nam",
    role: "student",
    password: "123456", // chỉ dùng cho mock login
  },
  {
    id: "SV002",
    name: "Trần Thị B",
    email: "b@dtu.edu.vn",
    phone: "0912-333-444",
    dob: "2001-10-05",
    gender: "Nữ",
    major: "Trí tuệ nhân tạo",
    year: 4,
    gpa: 3.7,
    capstoneId: "CP02",
    capstoneRole: "Leader",
    advisorId: "GV001",
    status: "active",
    joinDate: "2025-01-25",
    skills: ["Python", "Machine Learning", "TensorFlow"],
    avatar: "/images/students/sv002.jpg",
    address: "Huế, Việt Nam",
    role: "student",
    password: "123456",
  },
  // thêm nhiều object khác nếu cần
];

export const lecturers = [
  {
    id: "GV001",
    name: "TS. Phạm Văn Hùng",
    email: "hung@dtu.edu.vn",
    phone: "0906-555-666",
    dept: "Công nghệ thông tin",
    position: "Trưởng bộ môn",
    specialization: ["Web Development", "Cloud Computing"],
    office: "Phòng 305, Tòa A",
    availableSlots: ["2025-09-20 09:00", "2025-09-21 14:00"], // slot họp/định hướng
    adviseeLimit: 5, // tối đa số nhóm được hướng dẫn
    currentAdvisees: ["CP02"],
    avatar: "/images/lecturers/gv001.jpg",
    bio: "20 năm kinh nghiệm phát triển phần mềm, từng làm việc tại Google Cloud.",
    role: "lecturer",
    password: "123456", // chỉ dùng cho mock login
  },
  {
    id: "GV002",
    name: "ThS. Lê Thị Lan",
    email: "lan@dtu.edu.vn",
    phone: "0987-777-888",
    dept: "Khoa Học Máy Tính",
    position: "Giảng viên",
    specialization: ["AI", "Deep Learning"],
    office: "Phòng 210, Tòa B",
    availableSlots: ["2025-09-22 10:00", "2025-09-23 15:00"],
    adviseeLimit: 3,
    currentAdvisees: [],
    avatar: "/images/lecturers/gv002.jpg",
    bio: "Chuyên nghiên cứu về AI, tham gia nhiều dự án quốc tế về Deep Learning.",
    role: "lecturer",
    password: "123456",
  },
];

export const users = [...students, ...lecturers];
