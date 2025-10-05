// Đây là data tạm, sau này bạn thay API vào chỗ này
const proposals = [
  {
    id: "DA001",
    title: "Hệ thống quản lý thư viện",
    summary: "Xây dựng hệ thống quản lý thư viện với các chức năng mượn trả sách, quản lý độc giả, thống kê báo cáo.",
    mentor: "Võ Đình Hiếu",
    members: ["Ngô Nguyễn Trường An"],
    registerDate: "15/2/2025",
    approveDate: "28/2/2025",
    status: "Đã Duyệt",
    // TRƯỜNG MỚI: Mục tiêu
    goals: [
        "Xây dựng giao diện người dùng thân thiện và reponsive.",
        "Tích hợp hệ thống quản lý mượn trả tự động.",
        "Phân quyền truy cập cho thủ thư và độc giả.",
        "Cung cấp chức năng tìm kiếm nâng cao."
    ],
    // TRƯỜNG MỚI: Công nghệ
    technologies: [
        "ReactJS",
        "Node.js & Express",
        "MongoDB",
        "SCSS"
    ]
  },
  {
    id: "DA002",
    title: "Ứng dụng quản lý chi tiêu cá nhân",
    summary: "Ứng dụng cho phép quản lý chi tiêu hằng ngày, theo dõi ngân sách và tạo báo cáo tài chính cá nhân.",
    mentor: "Nguyễn Văn A",
    members: ["Trần Văn B", "Lê Văn E"],
    registerDate: "20/2/2025",
    approveDate: "Chưa duyệt",
    status: "Chờ Được Duyệt",
    // TRƯỜNG MỚI: Mục tiêu
    goals: [
        "Thiết lập giao diện di động trực quan cho việc nhập liệu chi tiêu.",
        "Xây dựng cơ chế nhắc nhở thanh toán hóa đơn tự động.",
        "Phân tích dữ liệu chi tiêu theo danh mục."
    ],
    // TRƯỜNG MỚI: Công nghệ
    technologies: [
        "React Native",
        "Firebase Realtime Database",
        "Redux/Zustand"
    ]
  },
  {
    id: "DA003",
    title: "Website bán sách online",
    summary: "Phát triển website thương mại điện tử chuyên về sách, tích hợp giỏ hàng và thanh toán trực tuyến.",
    mentor: "Trần Thị C",
    members: ["Ngô Minh D"],
    registerDate: "10/2/2025",
    approveDate: "Từ chối",
    status: "Bị Từ Chối",
    // TRƯỜNG MỚI: Mục tiêu
    goals: [
        "Tạo trang sản phẩm chi tiết với đánh giá của người dùng.",
        "Tối ưu hóa tốc độ tải trang (SEO/Performance).",
        "Kết nối API thanh toán VNPAY hoặc MoMo."
    ],
    // TRƯỜNG MỚI: Công nghệ
    technologies: [
        "Next.js",
        "Strapi CMS",
        "PostgreSQL",
        "Tailwind CSS"
    ]
  },
  {
    id: "DA004",
    title: "Hệ thống học trực tuyến (E-learning)",
    summary: "Xây dựng nền tảng cung cấp các khóa học online, có chức năng quản lý bài giảng và tiến độ học tập.",
    mentor: "Trần Thị C",
    members: ["Ngô Minh A", "Đỗ Thị B"],
    registerDate: "10/2/2025",
    approveDate: "Từ chối",
    status: "Bị Từ Chối",
    // TRƯỜNG MỚI: Mục tiêu
    goals: [
        "Tạo môi trường học tập tương tác (bình luận, hỏi đáp trực tiếp).",
        "Theo dõi tiến độ học tập của từng học viên.",
        "Tích hợp chức năng thi và cấp chứng chỉ."
    ],
    // TRƯỜNG MỚI: Công nghệ
    technologies: [
        "Vue.js",
        "Python (Django)",
        "Docker"
    ]
  },
  {
    id: "DA005",
    title: "Nền tảng mạng xã hội thu nhỏ",
    summary: "Xây dựng một mạng xã hội đơn giản cho cộng đồng sinh viên trong trường.",
    mentor: "Trần Thị C",
    members: ["Phạm Văn X", "Nguyễn Thị Y"],
    registerDate: "10/2/2025",
    approveDate: "Từ chối",
    status: "Bị Từ Chối",
    // TRƯỜNG MỚI: Mục tiêu
    goals: [
        "Cho phép người dùng đăng bài và tương tác (thích, bình luận).",
        "Tạo chức năng kết bạn và nhắn tin cơ bản.",
        "Đảm bảo tốc độ xử lý nhanh cho các thao tác cơ bản."
    ],
    // TRƯỜNG MỚI: Công nghệ
    technologies: [
        "Svelte",
        "Go (Golang)",
        "Redis Cache"
    ]
  },
];

export default proposals;