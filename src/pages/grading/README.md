# Hướng dẫn Layout Trang Chấm Điểm

## Tổng quan
Layout này được thiết kế dựa trên ảnh mẫu, bao gồm:
- 4 thẻ thống kê tổng quan
- Phần tìm kiếm và lọc
- Grid các thẻ nhóm dự án

## Cấu trúc Files

```
src/
├── globalStyle/
│   └── base.css                    # CSS variables và reset
├── components/grading/
│   ├── SummaryCards.js            # Component 4 thẻ thống kê
│   ├── SummaryCards.css
│   ├── SearchAndFilter.js         # Component tìm kiếm và lọc
│   ├── SearchAndFilter.css
│   ├── GroupCard.js               # Component thẻ nhóm đơn lẻ
│   ├── GroupCard.css
│   ├── GroupGrid.js               # Component grid các thẻ nhóm
│   └── GroupGrid.css
└── pages/grading/
    ├── GradingPage.js             # Trang chính kết hợp tất cả
    ├── GradingPage.css
    └── README.md                  # File này
```

## Các bước tích hợp

### 1. Import CSS Base
```jsx
// Trong main.js hoặc App.js
import './globalStyle/base.css';
```

### 2. Sử dụng GradingPage
```jsx
import GradingPage from './pages/grading/GradingPage';

function App() {
  return (
    <div className="App">
      {/* Header và Navbar của bạn */}
      <GradingPage />
    </div>
  );
}
```

### 3. Customize Data
Thay đổi dữ liệu mock trong `GradingPage.js`:
```jsx
// Thay thế allGroups array bằng data từ API
const [groups, setGroups] = useState([]);

useEffect(() => {
  // Fetch data từ API
  fetchGroups().then(setGroups);
}, []);
```

### 4. Xử lý Navigation
Trong `handleStartGrading` function:
```jsx
const handleStartGrading = (teamId) => {
  // Sử dụng React Router
  navigate(`/grading/${teamId}`);
  
  // Hoặc chuyển state
  setCurrentTeam(teamId);
  setShowGradingModal(true);
};
```

## CSS Variables

### Màu sắc chính
- `--primary-blue`: #3B82F6 (xanh chính)
- `--success-green`: #10B981 (xanh lá)
- `--warning-yellow`: #F59E0B (vàng)
- `--error-red`: #EF4444 (đỏ)

### Background colors
- `--bg-primary`: #F8FAFC (nền chính)
- `--bg-white`: #FFFFFF (nền trắng)

### Spacing
- `--spacing-xs`: 0.4rem
- `--spacing-sm`: 0.8rem
- `--spacing-md`: 1.6rem
- `--spacing-lg`: 2.4rem
- `--spacing-xl`: 3.2rem

## Responsive Design

Layout tự động responsive:
- **Desktop**: 3 cột grid
- **Tablet**: 2 cột grid
- **Mobile**: 1 cột grid

## Customization

### Thay đổi màu sắc
Chỉnh sửa CSS variables trong `base.css`

### Thay đổi layout
- Grid columns: `GroupGrid.css`
- Card spacing: `SummaryCards.css`, `GroupCard.css`
- Typography: CSS variables trong `base.css`

### Thêm animations
```css
.group-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.group-card:hover {
  transform: translateY(-4px) scale(1.02);
}
```

## API Integration Example

```jsx
// services/grading.api.js
export const gradingAPI = {
  getGroups: () => fetch('/api/groups').then(res => res.json()),
  updateGroupStatus: (groupId, status) => 
    fetch(`/api/groups/${groupId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
};
```
