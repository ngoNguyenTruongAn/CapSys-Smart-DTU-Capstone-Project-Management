# CapSys-Backend

Hệ thống backend cho ứng dụng quản lý đề tài tốt nghiệp CapSys được xây dựng bằng ASP.NET Core.

## � Tổng quan APIs

### � Base URL
- **Development**: `https://localhost:7110/api`
- **Swagger UI**: `https://localhost:7110/swagger`

### 🛡️ Authentication
Hệ thống sử dụng JWT Bearer Token authentication:
```
Authorization: Bearer {your_jwt_token}
```

### 📊 API Controllers

| Controller | Base Route | Mô tả |
|------------|------------|-------|
| **AuthController** | `/api/auth` | Xác thực và quản lý tài khoản |
| **GoogleAuthController** | `/auth/google` | Google Drive OAuth2 integration |
| **ProposalController** | `/api/proposals` | Quản lý đề tài & Upload proposal |
| **StudentsController** | `/api/students` | Quản lý thông tin sinh viên & Import Excel |
| **LecturersController** | `/api/lecturers` | Quản lý thông tin giảng viên |
| **TeamsController** | `/api/teams` | Quản lý nhóm sinh viên & Auto arrange |

---

## 🔐 AuthController - Authentication & Account Management

**Base Route**: `/api/auth`

### � Endpoints Overview

| Method | Endpoint | Mô tả | Access Level |
|--------|----------|-------|--------------|
| `POST` | `/login` | Đăng nhập hệ thống | Public |
| `POST` | `/logout` | Đăng xuất | Authenticated |
| `POST` | `/forget-password` | Yêu cầu reset mật khẩu | Public |
| `POST` | `/reset-password` | Đặt lại mật khẩu | Public |
| `GET` | `/profile` | Lấy thông tin profile | Authenticated |
| `POST` | `/refresh` | Làm mới JWT token | Public |
| `POST` | `/register/student` | Đăng ký tài khoản sinh viên | Admin only |
| `POST` | `/register/lecturer` | Đăng ký tài khoản giảng viên | Admin only |

### 📋 Detailed API Documentation

#### 1. **POST /api/auth/login** � Public

- **Purpose**: Authenticate user and receive JWT tokens
- **Access**: Public
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "base64encodedstring...",
      "tokenType": "Bearer",
      "expiresIn": 300,
      "userInfo": {
        "accountId": 123,
        "email": "test@example.com",
        "accountType": "Student"
      }
    }
  }
  ```

#### 2. **POST /api/auth/logout** 🔐 Authenticated
- **Purpose**: Invalidate token and logout
- **Access**: Authenticated users
- **Headers**: 
  ```
  Authorization: Bearer {jwt_token}
  ```
- **Request Body**: Empty
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Logout successful"
  }
  ```

#### 3. **POST /api/auth/forget-password** 📧 Public
- **Purpose**: Send password reset code via email
- **Access**: Public
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "If an account with that email exists, a password reset code has been sent."
  }
  ```

#### 4. **POST /api/auth/reset-password** 🔄 Public
- **Purpose**: Reset password using verification code
- **Access**: Public (requires reset code)
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "resetCode": "123456",
    "newPassword": "NewSecurePass123!",
    "confirmPassword": "NewSecurePass123!"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Your password has been reset successfully."
  }
  ```

#### 5. **GET /api/auth/profile** 👤 Authenticated
- **Purpose**: Get current user profile information
- **Access**: Authenticated users
- **Headers**: 
  ```
  Authorization: Bearer {jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Profile retrieved successfully",
    "data": {
      "accountID": 123,
      "email": "test@example.com",
      "accountType": "Student"
    }
  }
  ```

#### 6. **POST /api/auth/refresh** 🔄 Public
- **Purpose**: Refresh JWT access token
- **Access**: Public (requires refresh token)
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "token": "expired_jwt_token",
    "refreshToken": "valid_refresh_token"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Token refreshed successfully",
    "data": {
      "accessToken": "new_jwt_token",
      "refreshToken": "new_refresh_token",
      "tokenType": "Bearer",
      "expiresIn": 300
    }
  }
  ```

#### 7. **POST /api/auth/register/student** 👨‍🎓 Admin Only
- **Purpose**: Register new student account
- **Access**: Admin only (`[Authorize(Roles = "Admin")]`)
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {admin_jwt_token}
  ```
- **Request Body**:
  ```json
  {
    "email": "student@university.edu",
    "password": "SecurePass123!",
    "studentCode": "SE123456",
    "fullName": "John Doe",
    "faculty": "Computer Science",
    "major": "Software Engineering",
    "phone": "+84901234567",
    "capstoneType": 1,
    "gpa": 3.5
  }
  ```
- **Success Response (201)**:
  ```json
  {
    "success": true,
    "message": "Student account created successfully",
    "data": {
      "accountId": 123,
      "email": "student@university.edu",
      "studentCode": "SE123456",
      "fullName": "John Doe"
    }
  }
  ```

#### 8. **POST /api/auth/register/lecturer** 👨‍🏫 Admin Only
- **Purpose**: Register new lecturer account
- **Access**: Admin only (`[Authorize(Roles = "Admin")]`)
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {admin_jwt_token}
  ```
- **Request Body**:
  ```json
  {
    "email": "lecturer@university.edu",
    "password": "SecurePass123!",
    "fullName": "Dr. Jane Smith",
    "department": "Computer Science",
    "phone": "+84901234567",
    "specialization": "Software Engineering",
    "maxStudentsSupervised": 10,
    "academicTitle": "Associate Professor"
  }
  ```
- **Success Response (201)**:
  ```json
  {
    "success": true,
    "message": "Lecturer account created successfully",
    "data": {
      "accountId": 124,
      "email": "lecturer@university.edu",
      "fullName": "Dr. Jane Smith",
      "department": "Computer Science"
    }
  }
  ```

---

## �‍🎓 StudentsController - Student Management

**Base Route**: `/api/students`

### 📍 Endpoints Overview

| Method | Endpoint | Mô tả | Access Level |
|--------|----------|-------|--------------|
| `GET` | `/get-students` | Lấy danh sách tất cả sinh viên | Admin only |
| `GET` | `/get-student-by-id/{id}` | Lấy thông tin sinh viên theo ID | Admin only |
| `GET` | `/get-student-by-email/{email}` | Lấy thông tin sinh viên theo email | Admin only |
| `GET` | `/get-student-by-capstone-type/{type}` | Lấy sinh viên theo loại đồ án | Admin only |
| `PUT` | `/update-student/{id}` | Cập nhật thông tin sinh viên | Admin only |
| `DELETE` | `/delete-student/{id}` | Xóa sinh viên | Admin only |
| `POST` | `/insert` | Import sinh viên từ Excel với Capstone Type | Admin only |

### 📋 Detailed API Documentation

#### 1. **GET /api/students/get-students** 📋 Admin Only
- **Purpose**: Retrieve all students in the system
- **Access**: Admin only (`[Authorize(Roles = "Admin")]`)
- **Headers**: 
  ```
  Authorization: Bearer {admin_jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "studentId": 1,
        "studentCode": "SE123456",
        "fullName": "Nguyễn Văn A",
        "faculty": "Công nghệ thông tin",
        "major": "Kỹ thuật phần mềm",
        "phone": "0901234567",
        "gpa": 3.5,
        "capstoneType": 1,
        "email": "student@university.edu",
        "accountType": "Student"
      }
    ]
  }
  ```

#### 2. **GET /api/students/get-student-by-id/{id}** 👤 Admin Only
- **Purpose**: Get specific student by ID
- **Access**: Admin only
- **Parameters**: `id` (integer, required)
- **Headers**: 
  ```
  Authorization: Bearer {admin_jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "studentId": 1,
      "studentCode": "SE123456",
      "fullName": "Nguyễn Văn A",
      "faculty": "Công nghệ thông tin",
      "major": "Kỹ thuật phần mềm",
      "phone": "0901234567",
      "gpa": 3.5,
      "capstoneType": 1,
      "email": "student@university.edu",
      "accountType": "Student"
    }
  }
  ```

#### 3. **PUT /api/students/update-student/{id}** ✏️ Admin Only
- **Purpose**: Update student information
- **Access**: Admin only
- **Parameters**: `id` (integer, required)
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {admin_jwt_token}
  ```
- **Request Body** (All fields optional):
  ```json
  {
    "studentCode": "SE123456",
    "fullName": "Nguyễn Văn A Updated",
    "faculty": "Công nghệ thông tin",
    "major": "Kỹ thuật phần mềm",
    "phone": "0901234567",
    "gpa": 3.8,
    "capstoneType": 2
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Student updated successfully",
    "data": {
      "studentId": 1,
      "studentCode": "SE123456",
      "fullName": "Nguyễn Văn A Updated",
      // ... updated student data
    }
  }
  ```

#### 4. **DELETE /api/students/delete-student/{id}** 🗑️ Admin Only
- **Purpose**: Delete student from system
- **Access**: Admin only
- **Parameters**: `id` (integer, required)
- **Headers**: 
  ```
  Authorization: Bearer {admin_jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Student deleted successfully"
  }
  ```

#### 5. **POST /api/students/insert** 📁 Admin Only
- **Purpose**: Import students from Excel file with specific Capstone Type
- **Access**: Admin only (`[Authorize(Roles = "Admin")]`)
- **Headers**: 
  ```
  Content-Type: multipart/form-data
  Authorization: Bearer {admin_jwt_token}
  ```
- **Request Body** (Form Data):
  ```
  ExcelFile: [Excel file] (.xlsx or .xls, max 10MB)
  CapstoneType: 1 | 2 | 3 (integer, required)
  ```
- **Capstone Types**:
  - `1`: **Capstone 1** - Auto arrange teams by GPA (individual students)
  - `2`: **Capstone 2** - Pre-arranged teams (team info required in Excel)
  - `3`: **Research** - Pre-arranged teams (team info required in Excel)

### **Excel Format by Capstone Type**:

#### **📋 For Capstone 1 (Auto-arrangement)**:
  | Column | Header | Type | Required | Example |
  |--------|--------|------|----------|---------|
  | A | StudentCode | String | Yes | SE123456 |
  | B | FullName | String | Yes | Nguyen Van A |
  | C | Email | String | Yes | student@university.edu |
  | D | PhoneNumber | String | No | +84901234567 |
  | E | Major | String | No | Software Engineering |
  | F | Class | String | No | SE2022 |
  | G | AcademicYear | String | No | 2024-2025 |
  | H | GPA | Decimal | No | 3.5 |

#### **👥 For Capstone 2 & Research (Pre-arranged teams)**:
  | Column | Header | Type | Required | Example |
  |--------|--------|------|----------|---------|
  | A | StudentCode | String | Yes | SE123456 |
  | B | FullName | String | Yes | Nguyen Van A |
  | C | Email | String | Yes | student@university.edu |
  | D | PhoneNumber | String | No | +84901234567 |
  | E | Major | String | No | Software Engineering |
  | F | Class | String | No | SE2022 |
  | G | AcademicYear | String | No | 2024-2025 |
  | H | GPA | Decimal | No | 3.5 |
  | I | **TeamCode** | String | **Yes** | TEAM_AI_001 |

**📌 Important Notes for Capstone 2 & Research**:
- Column I (TeamCode) is **required** - students with same TeamCode will be grouped together
- Team leader will be automatically assigned to student with highest GPA in each team
- Teams are created automatically during import process
- ProjectTitle will be updated through other features later

- **Success Response (200)**:

  **For Capstone 1 (Individual Import)**:
  ```json
  {
    "success": true,
    "message": "Import completed: 45 successful, 2 failed",
    "data": {
      "success": true,
      "message": "Import completed successfully",
      "totalRecords": 47,
      "successCount": 45,
      "failureCount": 2,
      "errors": [
        {
          "rowNumber": 15,
          "email": "invalid-email",
          "studentCode": "SE789012",
          "errorMessage": "Invalid email format"
        }
      ]
    }
  }
  ```

  **For Capstone 2 & Research (With Team Creation)**:
  ```json
  {
    "success": true,
    "message": "Import completed: 20 students imported, 4 teams created, 1 failed",
    "data": {
      "success": true,
      "message": "Import completed with automatic team creation",
      "totalRecords": 21,
      "successCount": 20,
      "failureCount": 1,
      "errors": [
        {
          "rowNumber": 8,
          "email": "student8@university.edu", 
          "studentCode": "SE123008",
          "errorMessage": "Team code is required for Capstone 2 and Research"
        }
      ]
    }
  }
  ```

---

## 👥 TeamsController - Team Management & Auto Arrangement

**Base Route**: `/api/teams`

### 📍 Endpoints Overview

| Method | Endpoint | Mô tả | Access Level |
|--------|----------|-------|--------------|
| `POST` | `/auto-arrange-capstone1` | Tự động sắp xếp nhóm Capstone 1 theo GPA | Admin only |
| `GET` | `/by-capstone-type/{capstoneType}` | Lấy danh sách nhóm theo loại capstone | Admin only |
| `GET` | `/{teamId}` | Lấy thông tin nhóm theo ID | Admin only |
| `POST` | `/create` | Tạo nhóm thủ công | Admin only |
| `PUT` | `/update/{teamId}` | Cập nhật thông tin nhóm | Admin only |
| `DELETE` | `/delete/{teamId}` | Xóa nhóm | Admin only |
| `POST` | `/move-student` | Di chuyển sinh viên sang nhóm khác | Admin only |
| `POST` | `/swap-students` | Hoán đổi sinh viên giữa các nhóm | Admin only |
| `POST` | `/remove-student` | Loại sinh viên khỏi nhóm | Admin only |
| `GET` | `/unassigned-students/{capstoneType}` | Lấy sinh viên chưa có nhóm | Admin only |

### 📋 Detailed API Documentation

#### 1. **POST /api/teams/auto-arrange-capstone1** 🤖 Admin Only
- **Purpose**: Automatically arrange Capstone 1 students into balanced teams by GPA
- **Access**: Admin only (`[Authorize(Roles = "Admin")]`)
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {admin_jwt_token}
  ```
- **Request Body**:
  ```json
  {
    "capstoneType": 1
  }
  ```
- **Algorithm**: 
  - Groups students by GPA ranges: Excellent (≥3.6), Good (3.2-3.6), Fair (2.5-3.2), Average (2.0-2.5), Others (<2.0)
  - Each team of 5 gets 1 student from each GPA range, with 5th member randomly selected
  - Team leader is automatically the highest GPA student in each team
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Successfully created 10 teams with 48 students assigned",
    "data": {
      "success": true,
      "message": "Successfully created 10 teams with 48 students assigned",
      "teamsCreated": 10,
      "studentsAssigned": 48,
      "unassignedStudents": 2,
      "teams": [
        {
          "teamId": 1,
          "teamName": "Team 1 - Capstone 1",
          "projectTitle": null,
          "teamLeaderId": 5,
          "teamLeaderName": "Nguyen Van A",
          "createdDate": "2025-09-23T00:00:00Z",
          "status": "Active",
          "students": [
            {
              "studentId": 5,
              "studentCode": "SE123456",
              "fullName": "Nguyen Van A",
              "gpa": 3.8,
              "capstoneType": 1,
              "teamId": 1,
              "teamName": "Team 1 - Capstone 1",
              "email": "student1@university.edu"
            }
          ]
        }
      ],
      "unassignedStudentsList": [
        {
          "studentId": 51,
          "studentCode": "SE999999",
          "fullName": "Unassigned Student",
          "gpa": 2.1,
          "capstoneType": 1,
          "teamId": null,
          "teamName": null,
          "email": "unassigned@university.edu"
        }
      ]
    }
  }
  ```

#### 2. **GET /api/teams/by-capstone-type/{capstoneType}** 📋 Admin Only
- **Purpose**: Get all teams for a specific capstone type
- **Access**: Admin only
- **Parameters**: `capstoneType` (1, 2, or 3)
- **Headers**: 
  ```
  Authorization: Bearer {admin_jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Retrieved 10 teams for capstone type 1",
    "data": [
      {
        "teamId": 1,
        "teamName": "Team 1 - Capstone 1",
        "projectTitle": "AI-powered Learning System",
        "teamLeaderId": 5,
        "teamLeaderName": "Nguyen Van A",
        "createdDate": "2025-09-23T00:00:00Z",
        "status": "Active",
        "students": [
          {
            "studentId": 5,
            "studentCode": "SE123456",
            "fullName": "Nguyen Van A",
            "faculty": "Computer Science",
            "major": "Software Engineering",
            "phone": "0901234567",
            "gpa": 3.8,
            "capstoneType": 1,
            "teamId": 1,
            "teamName": "Team 1 - Capstone 1",
            "email": "student1@university.edu",
            "accountType": "Student"
          }
        ]
      }
    ]
  }
  ```

#### 3. **GET /api/teams/{teamId}** 👤 Admin Only
- **Purpose**: Get specific team details by ID
- **Access**: Admin only
- **Parameters**: `teamId` (integer, required)
- **Headers**: 
  ```
  Authorization: Bearer {admin_jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "teamId": 1,
      "teamName": "Team 1 - Capstone 1",
      "projectTitle": "AI-powered Learning System",
      "teamLeaderId": 5,
      "teamLeaderName": "Nguyen Van A",
      "createdDate": "2025-09-23T00:00:00Z",
      "status": "Active",
      "students": [
        {
          "studentId": 5,
          "studentCode": "SE123456",
          "fullName": "Nguyen Van A",
          "faculty": "Computer Science",
          "major": "Software Engineering",
          "phone": "0901234567",
          "gpa": 3.8,
          "capstoneType": 1,
          "teamId": 1,
          "teamName": "Team 1 - Capstone 1",
          "email": "student1@university.edu",
          "accountType": "Student"
        }
      ]
    }
  }
  ```

#### 4. **POST /api/teams/create** ➕ Admin Only
- **Purpose**: Create a team manually with selected students
- **Access**: Admin only
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {admin_jwt_token}
  ```
- **Request Body**:
  ```json
  {
    "teamName": "Custom Team Alpha",
    "projectTitle": "Mobile App Development",
    "studentIds": [10, 15, 20, 25, 30],
    "teamLeaderId": 15
  }
  ```
- **Validation Rules**:
  - Team name is required (max 100 characters)
  - Student IDs are required (1-5 students per team)
  - Team leader must be one of the team members
  - Students must not already be in another team
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Team created successfully",
    "data": {
      "teamId": 15,
      "teamName": "Custom Team Alpha",
      "projectTitle": "Mobile App Development",
      "teamLeaderId": 15,
      "teamLeaderName": "Tran Thi B",
      "createdDate": "2025-09-23T01:30:00Z",
      "status": "Active",
      "students": [
        {
          "studentId": 15,
          "studentCode": "SE654321",
          "fullName": "Tran Thi B",
          "gpa": 3.6,
          "capstoneType": 2,
          "teamId": 15,
          "teamName": "Custom Team Alpha",
          "email": "student15@university.edu"
        }
      ]
    }
  }
  ```

#### 5. **PUT /api/teams/update/{teamId}** ✏️ Admin Only
- **Purpose**: Update team information
- **Access**: Admin only
- **Parameters**: `teamId` (integer, required)
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {admin_jwt_token}
  ```
- **Request Body** (All fields optional):
  ```json
  {
    "teamName": "Updated Team Name",
    "projectTitle": "Updated Project Title",
    "teamLeaderId": 20,
    "mentorId": 5,
    "status": "Inactive"
  }
  ```
- **Note**: When updating `mentorId`, the system validates that the mentor exists and doesn't exceed the 5-team limit
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Team updated successfully",
    "data": {
      "teamId": 15,
      "teamName": "Updated Team Name",
      "projectTitle": "Updated Project Title",
      "teamLeaderId": 20,
      "teamLeaderName": "Le Van C",
      "mentorId": 5,
      "mentorName": "Dr. Nguyen Van A",
      "createdDate": "2025-09-23T01:30:00Z",
      "status": "Inactive",
      "students": [...]
    }
  }
  ```
- **Error Response (400)** - When mentor limit exceeded:
  ```json
  {
    "success": false,
    "message": "Mentor already has maximum number of teams (5)"
  }
  ```

#### 6. **DELETE /api/teams/delete/{teamId}** 🗑️ Admin Only
- **Purpose**: Delete team and unassign all students
- **Access**: Admin only
- **Parameters**: `teamId` (integer, required)
- **Headers**: 
  ```
  Authorization: Bearer {admin_jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Team deleted successfully"
  }
  ```

#### 7. **POST /api/teams/move-student** 🔄 Admin Only
- **Purpose**: Move a student from their current team to another team
- **Access**: Admin only
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {admin_jwt_token}
  ```
- **Request Body**:
  ```json
  {
    "studentId": 25,
    "targetTeamId": 5
  }
  ```
- **Validation Rules**:
  - Target team must have space (max 5 students per team)
  - Student and target team must exist
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Student moved to team successfully"
  }
  ```

#### 8. **POST /api/teams/swap-students** 🔄 Admin Only
- **Purpose**: Swap two students between their respective teams
- **Access**: Admin only
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {admin_jwt_token}
  ```
- **Request Body**:
  ```json
  {
    "studentId1": 25,
    "studentId2": 35
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Students swapped between teams successfully"
  }
  ```

#### 9. **POST /api/teams/remove-student** ➖ Admin Only
- **Purpose**: Remove a student from their current team
- **Access**: Admin only
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {admin_jwt_token}
  ```
- **Request Body**:
  ```json
  {
    "studentId": 25
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Student removed from team successfully"
  }
  ```

#### 10. **GET /api/teams/unassigned-students/{capstoneType}** 📋 Admin Only
- **Purpose**: Get all students who are not assigned to any team for a specific capstone type
- **Access**: Admin only
- **Parameters**: `capstoneType` (1, 2, or 3)
- **Headers**: 
  ```
  Authorization: Bearer {admin_jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Retrieved 3 unassigned students for capstone type 1",
    "data": [
      {
        "studentId": 50,
        "studentCode": "SE999998",
        "fullName": "Pham Van D",
        "faculty": "Computer Science",
        "major": "Software Engineering",
        "phone": "0901234567",
        "gpa": 3.2,
        "capstoneType": 1,
        "teamId": null,
        "teamName": null,
        "email": "student50@university.edu",
        "accountType": "Student"
      }
    ]
  }
  ```

#### 11. **POST /api/teams/assign-mentor** 👨‍🏫 Admin Only
- **Purpose**: Assign a lecturer as mentor to a team (max 5 teams per lecturer)
- **Access**: Admin only
- **Headers**: 
  ```
  Authorization: Bearer {admin_jwt_token}
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "teamId": 1,
    "mentorId": 5
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Mentor assigned to team successfully"
  }
  ```
- **Error Response (400)**:
  ```json
  {
    "success": false,
    "message": "Lecturer already has 5 teams assigned. Cannot assign more teams."
  }
  ```

#### 12. **POST /api/teams/remove-mentor** 👨‍🏫 Admin Only
- **Purpose**: Remove mentor from a team
- **Access**: Admin only
- **Headers**: 
  ```
  Authorization: Bearer {admin_jwt_token}
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "teamId": 1
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Mentor removed from team successfully"
  }
  ```

#### 13. **GET /api/teams/mentor-workload** 📊 Admin Only
- **Purpose**: Get all lecturers with their team counts and availability
- **Access**: Admin only
- **Headers**: 
  ```
  Authorization: Bearer {admin_jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Retrieved workload information for 10 mentors",
    "data": [
      {
        "lecturerId": 1,
        "fullName": "Dr. Nguyễn Văn A",
        "department": "Software Engineering",
        "specialization": "Web Development",
        "currentTeamCount": 3,
        "maxTeamsAllowed": 5,
        "mentoredTeams": [
          {
            "teamId": 5,
            "teamName": "Innovation Squad",
            "projectTitle": "E-learning Platform",
            "teamLeaderId": 45,
            "teamLeaderName": "Nguyen Van C",
            "mentorId": 1,
            "mentorName": "Dr. Nguyễn Văn A",
            "createdDate": "2025-09-23T01:30:00Z",
            "status": "Active",
            "students": [
              {
                "studentId": 45,
                "studentCode": "SE123456",
                "fullName": "Nguyen Van C",
                "faculty": "Computer Science",
                "major": "Software Engineering",
                "phone": "0901234567",
                "gpa": 3.8,
                "capstoneType": 1,
                "teamId": 5,
                "teamName": "Innovation Squad",
                "email": "student45@university.edu",
                "accountType": "Student"
              }
            ]
          }
        ]
      },
      {
        "lecturerId": 2,
        "fullName": "Dr. Trần Thị B",
        "department": "AI & Machine Learning",
        "specialization": "Data Science",
        "currentTeamCount": 5,
        "maxTeamsAllowed": 5,
        "mentoredTeams": [...]
      }
    ]
  }
  ```

#### 14. **GET /api/teams/teams-without-mentor/{capstoneType}** 🔍 Admin Only
- **Purpose**: Get teams that don't have mentors assigned for specific capstone type
- **Access**: Admin only
- **Parameters**: `capstoneType` (1, 2, or 3)
- **Headers**: 
  ```
  Authorization: Bearer {admin_jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Retrieved 2 teams without mentor for capstone type 1",
    "data": [
      {
        "teamId": 15,
        "teamName": "Innovation Squad",
        "capstoneType": 1,
        "projectTitle": "E-learning Platform",
        "teamLeaderId": 45,
        "teamLeaderName": "Nguyễn Văn C",
        "studentCount": 4,
        "mentorId": null,
        "mentorName": null
      }
    ]
  }
  ```

---

## 👨‍🏫 LecturersController - Lecturer Management

**Base Route**: `/api/lecturers`

### 📍 Endpoints Overview

| Method | Endpoint | Mô tả | Access Level |
|--------|----------|-------|--------------|
| `GET` | `/get-lecturers` | Lấy danh sách tất cả giảng viên | Admin only |
| `GET` | `/get-lecturer-by-id/{id}` | Lấy thông tin giảng viên theo ID | Admin only |
| `GET` | `/get-lecturer-by-email/{email}` | Lấy thông tin giảng viên theo email | Admin only |
| `PUT` | `/update-lecturer/{id}` | Cập nhật thông tin giảng viên | Admin only |
| `DELETE` | `/delete-lecturer/{id}` | Xóa giảng viên | Admin only |
| `POST` | `/insert` | Import giảng viên từ Excel | Admin only |

### 📋 Detailed API Documentation

#### 1. **GET /api/lecturers/get-lecturers** 📋 Admin Only
- **Purpose**: Retrieve all lecturers in the system
- **Access**: Admin only (`[Authorize(Roles = "Admin")]`)
- **Headers**: 
  ```
  Authorization: Bearer {admin_jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "lecturerId": 1,
        "fullName": "TS. Nguyễn Văn B",
        "department": "Công nghệ thông tin",
        "phone": "0901234567",
        "specialization": "Trí tuệ nhân tạo",
        "maxStudentsSupervised": 10,
        "academicTitle": "Tiến sĩ",
        "email": "lecturer@university.edu",
        "accountType": "Lecturer"
      }
    ]
  }
  ```

#### 2. **GET /api/lecturers/get-lecturer-by-id/{id}** 👤 Admin Only
- **Purpose**: Get specific lecturer by ID
- **Access**: Admin only
- **Parameters**: `id` (integer, required)
- **Headers**: 
  ```
  Authorization: Bearer {admin_jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "lecturerId": 1,
      "fullName": "TS. Nguyễn Văn B",
      "department": "Công nghệ thông tin",
      "phone": "0901234567",
      "specialization": "Trí tuệ nhân tạo",
      "maxStudentsSupervised": 10,
      "academicTitle": "Tiến sĩ",
      "email": "lecturer@university.edu",
      "accountType": "Lecturer"
    }
  }
  ```

#### 3. **GET /api/lecturers/get-lecturer-by-email/{email}** 📧 Admin Only
- **Purpose**: Get lecturer by email address
- **Access**: Admin only
- **Parameters**: `email` (string, required)
- **Headers**: 
  ```
  Authorization: Bearer {admin_jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "lecturerId": 1,
      "fullName": "TS. Nguyễn Văn B",
      "department": "Công nghệ thông tin",
      "phone": "0901234567",
      "specialization": "Trí tuệ nhân tạo",
      "maxStudentsSupervised": 10,
      "academicTitle": "Tiến sĩ",
      "email": "lecturer@university.edu",
      "accountType": "Lecturer"
    }
  }
  ```

#### 4. **PUT /api/lecturers/update-lecturer/{id}** ✏️ Admin Only
- **Purpose**: Update lecturer information
- **Access**: Admin only
- **Parameters**: `id` (integer, required)
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {admin_jwt_token}
  ```
- **Request Body** (All fields optional):
  ```json
  {
    "fullName": "TS. Nguyễn Văn B Updated",
    "department": "Công nghệ thông tin",
    "phone": "0901234567",
    "specialization": "Machine Learning",
    "maxStudentsSupervised": 15,
    "academicTitle": "Phó Giáo sư"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Lecturer updated successfully",
    "data": {
      "lecturerId": 1,
      "fullName": "TS. Nguyễn Văn B Updated",
      "department": "Công nghệ thông tin",
      // ... updated lecturer data
    }
  }
  ```

#### 5. **DELETE /api/lecturers/delete-lecturer/{id}** 🗑️ Admin Only
- **Purpose**: Delete lecturer from system
- **Access**: Admin only
- **Parameters**: `id` (integer, required)
- **Headers**: 
  ```
  Authorization: Bearer {admin_jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Lecturer deleted successfully"
  }
  ```

#### 6. **POST /api/lecturers/insert** 📁 Admin Only
- **Purpose**: Import lecturers from Excel file
- **Access**: Admin only (`[Authorize(Roles = "Admin")]`)
- **Headers**: 
  ```
  Content-Type: multipart/form-data
  Authorization: Bearer {admin_jwt_token}
  ```
- **Request Body** (Form Data):
  ```
  ExcelFile: [Excel file] (.xlsx or .xls, max 10MB)
  ```
- **Excel Format** (Required columns):
  | Column | Header | Type | Required | Example |
  |--------|--------|------|----------|---------|
  | A | LecturerCode | String | Yes | GV001 |
  | B | FullName | String | Yes | TS. Nguyen Van A |
  | C | Department | String | No | Computer Science |
  | D | Specialization | String | No | Software Engineering |
  | E | Phone | String | No | +84901234567 |
  | F | Email | String | Yes | lecturer@university.edu |

- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Import completed. Success: 15, Failed: 2",
    "data": {
      "success": true,
      "message": "Import completed. Success: 15, Failed: 2",
      "totalRecords": 17,
      "successCount": 15,
      "failureCount": 2,
      "errors": [
        {
          "rowNumber": 5,
          "email": "invalid-email",
          "lecturerCode": "GV005",
          "errorMessage": "Invalid email format"
        }
      ]
    }
  }
  ```

---

## 📄 ProposalController - Proposal Management & Document Upload

**Base Route**: `/api/proposals`

### 🎯 Overview
Hệ thống quản lý đề tài với khả năng upload file PDF lên Google Drive, vector hóa nội dung để kiểm tra similarity, và quản lý trạng thái đề tài từ Pending đến Approved/Rejected.

### 📋 Key Features
- ✅ **PDF Upload to Google Drive** với OAuth2 authentication
- ✅ **Text Extraction** từ PDF và vector hóa để similarity checking  
- ✅ **Qdrant Vector Database** lưu trữ embeddings cho tìm kiếm tương đồng
- ✅ **Proposal Status Management** (Pending, Approved, Rejected)
- ✅ **Team-based Proposal System** - mỗi team chỉ có 1 proposal
- ✅ **Export/Download** proposal từ Google Drive
- ✅ **Automatic Similarity Detection** với threshold và risk assessment
- ✅ **Vector-based Search** sử dụng Qdrant HTTP API

### 📍 Endpoints Overview

| Method | Endpoint | Mô tả | Access Level |
|--------|----------|-------|--------------|
| `POST` | `/upload` | Upload proposal PDF cho team | Authenticated |
| `GET` | `/{id}/export` | Download/Export proposal từ Google Drive | Authenticated |
| `GET` | `/{id}/similarity-check` | Kiểm tra độ tương đồng với proposals khác | Authenticated |
| `PUT` | `/{id}/status` | Cập nhật trạng thái proposal (Admin/Lecturer) | Admin/Lecturer |
| `GET` | `/team/{teamId}` | Lấy proposals của team | Authenticated |
| `GET` | `` | Lấy tất cả proposals (Admin/Lecturer) | Admin/Lecturer |
| `GET` | `/{id}` | Lấy thông tin chi tiết proposal | Authenticated |
| `DELETE` | `/{id}` | Xóa proposal (Admin) | Admin only |

### 📋 Detailed API Documentation

#### 1. **POST /api/proposals/upload** 📤 Authenticated
- **Purpose**: Upload proposal PDF cho team, tự động lưu lên Google Drive và vector hóa nội dung
- **Access**: Authenticated users (Students/Lecturers)
- **Headers**: 
  ```
  Authorization: Bearer {jwt_token}
  Content-Type: multipart/form-data
  ```
- **Request Body** (Form Data):
  ```
  Title: string (required, max 200 chars)
  Description: string (required, max 1000 chars) 
  TeamId: integer (required)
  PdfFile: file (required, PDF only, max 10MB)
  ```
- **Validation Rules**:
  - Team must exist and have members
  - Team can only have one proposal (check existing proposal)
  - File must be PDF format and ≤ 10MB
  - Google Drive OAuth2 must be configured
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Proposal đã được upload thành công",
    "data": {
      "id": 5,
      "title": "AI-powered Learning Platform",
      "description": "Nền tảng học tập thông minh sử dụng AI",
      "teamId": 201,
      "teamName": "TEAM_CAP1_001", 
      "status": "Pending",
      "googleDriveUrl": "https://drive.google.com/file/d/1ABC123.../view?usp=sharing",
      "createdDate": "2025-10-04T14:30:00Z",
      "updatedDate": null,
      "rejectionReason": null,
      "qdrantPointId": "uuid-abc-123-def",
      "hasVectorData": true,
      "googleDriveFileId": "1ABC123DEF456GHI",
      "isUploaded": true
    }
  }
  ```
- **Process Flow**:
  1. Validate team and file format (PDF only, max 10MB)
  2. Extract text from PDF using iText7 library
  3. Upload PDF to Google Drive using OAuth2 authenticated service
  4. Convert extracted text to vector embeddings (384-dimensional)
  5. Store vector in Qdrant database via HTTP API
  6. Save proposal metadata with Google Drive URL and Qdrant Point ID to SQL database
  7. Return success with Google Drive shareable URL and vector confirmation

#### 2. **GET /api/proposals/{id}/export** 📥 Authenticated
- **Purpose**: Download/Export proposal file từ Google Drive
- **Access**: Authenticated users
- **Parameters**: `id` (integer, required)
- **Headers**: 
  ```
  Authorization: Bearer {jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Export URL generated successfully", 
    "data": {
      "proposalId": 5,
      "title": "AI-powered Learning Platform",
      "teamName": "TEAM_CAP1_001",
      "googleDriveUrl": "https://drive.google.com/file/d/1ABC123.../view?usp=sharing",
      "downloadUrl": "https://drive.google.com/uc?id=1ABC123DEF456GHI&export=download",
      "fileName": "Proposal_TEAM_CAP1_001_20251004_143000.pdf",
      "fileSize": "2.5 MB",
      "uploadDate": "2025-10-04T14:30:00Z"
    }
  }
  ```

#### 3. **GET /api/proposals/{id}/similarity-check** 🔍 Authenticated
- **Purpose**: Kiểm tra độ tương đồng của proposal với các proposals khác trong hệ thống sử dụng Qdrant vector search
- **Access**: Authenticated users
- **Parameters**: `id` (integer, required)
- **Query Parameters**: 
  - `threshold` (float, optional, default: 0.8) - Ngưỡng similarity score
  - `limit` (int, optional, default: 10) - Số lượng kết quả tối đa
- **Headers**: 
  ```
  Authorization: Bearer {jwt_token}
  ```
- **Technical Process**:
  1. Retrieve proposal's vector from Qdrant using `qdrantPointId`
  2. Perform vector similarity search with configurable threshold
  3. Calculate risk levels based on similarity scores
  4. Return ranked results with matched content analysis
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Similarity check completed successfully",
    "data": {
      "proposalId": 5,
      "title": "AI-powered Learning Platform",
      "teamName": "TEAM_CAP1_001",
      "hasVectorData": true,
      "qdrantPointId": "abc-123-def-456",
      "totalComparedProposals": 15,
      "similarityThreshold": 0.8,
      "vectorDimension": 384,
      "similarProposals": [
        {
          "proposalId": 3,
          "title": "Machine Learning Educational Tool",
          "teamName": "TEAM_CAP1_005",
          "similarityScore": 0.85,
          "qdrantPointId": "def-456-ghi-789",
          "matchedContent": "AI algorithms for personalized learning...",
          "riskLevel": "High"
        },
        {
          "proposalId": 12,
          "title": "Smart Learning Management System", 
          "teamName": "TEAM_CAP2_002",
          "similarityScore": 0.82,
          "qdrantPointId": "ghi-789-jkl-012",
          "matchedContent": "Educational platform with artificial intelligence...",
          "riskLevel": "Medium"
        }
      ],
      "overallSimilarityRisk": "Medium",
      "recommendedAction": "Review similar proposals and ensure unique approach",
      "searchMetadata": {
        "searchTime": "45ms",
        "vectorSearchEngine": "Qdrant HTTP API",
        "collectionName": "proposals"
      }
    }
  }
  ```

#### 4. **PUT /api/proposals/{id}/status** ✏️ Admin/Lecturer
- **Purpose**: Cập nhật trạng thái proposal (Approve/Reject với lý do)
- **Access**: Admin và Lecturer only
- **Parameters**: `id` (integer, required)
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {admin_or_lecturer_jwt_token}
  ```
- **Request Body**:
  ```json
  {
    "status": "Approved" | "Rejected" | "Pending",
    "rejectionReason": "string (required if status is Rejected, max 500 chars)",
    "feedback": "string (optional, max 1000 chars)"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Proposal status updated successfully",
    "data": {
      "id": 5,
      "title": "AI-powered Learning Platform",
      "teamName": "TEAM_CAP1_001",
      "status": "Approved",
      "updatedDate": "2025-10-04T16:45:00Z", 
      "rejectionReason": null,
      "feedback": "Excellent innovative approach to educational technology",
      "approvedBy": "Dr. Nguyen Van A"
    }
  }
  ```

#### 5. **GET /api/proposals/team/{teamId}** 👥 Authenticated
- **Purpose**: Lấy tất cả proposals của một team cụ thể
- **Access**: Authenticated users
- **Parameters**: `teamId` (integer, required)
- **Headers**: 
  ```
  Authorization: Bearer {jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Retrieved proposals for team 201",
    "data": [
      {
        "id": 5,
        "title": "AI-powered Learning Platform",
        "description": "Nền tảng học tập thông minh sử dụng AI",
        "teamId": 201,
        "teamName": "TEAM_CAP1_001",
        "status": "Approved",
        "googleDriveUrl": "https://drive.google.com/file/d/1ABC123.../view?usp=sharing",
        "createdDate": "2025-10-04T14:30:00Z",
        "updatedDate": "2025-10-04T16:45:00Z",
        "rejectionReason": null,
        "hasVectorData": true,
        "isUploaded": true
      }
    ]
  }
  ```

#### 6. **GET /api/proposals** 📋 Admin/Lecturer
- **Purpose**: Lấy tất cả proposals trong hệ thống (dành cho Admin/Lecturer)
- **Access**: Admin và Lecturer only
- **Headers**: 
  ```
  Authorization: Bearer {admin_or_lecturer_jwt_token}
  ```
- **Query Parameters** (Optional):
  ```
  ?status=Pending|Approved|Rejected
  &capstoneType=1|2|3
  &page=1&limit=20
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Retrieved 25 proposals successfully",
    "data": {
      "proposals": [
        {
          "id": 5,
          "title": "AI-powered Learning Platform",
          "description": "Nền tảng học tập thông minh sử dụng AI",
          "teamId": 201,
          "teamName": "TEAM_CAP1_001",
          "status": "Pending",
          "googleDriveUrl": "https://drive.google.com/file/d/1ABC123.../view?usp=sharing",
          "createdDate": "2025-10-04T14:30:00Z",
          "updatedDate": null,
          "hasVectorData": true,
          "studentCount": 5
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 3,
        "totalRecords": 25,
        "pageSize": 10
      },
      "statistics": {
        "pendingCount": 15,
        "approvedCount": 7,
        "rejectedCount": 3,
        "uploadSuccessRate": 96.2
      }
    }
  }
  ```

#### 7. **GET /api/proposals/{id}** 👤 Authenticated
- **Purpose**: Lấy thông tin chi tiết của một proposal cụ thể
- **Access**: Authenticated users
- **Parameters**: `id` (integer, required)
- **Headers**: 
  ```
  Authorization: Bearer {jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Proposal retrieved successfully",
    "data": {
      "id": 5,
      "title": "AI-powered Learning Platform",
      "description": "Nền tảng học tập thông minh sử dụng AI để cá nhân hóa trải nghiệm học tập",
      "teamId": 201,
      "teamName": "TEAM_CAP1_001", 
      "status": "Approved",
      "googleDriveUrl": "https://drive.google.com/file/d/1ABC123.../view?usp=sharing",
      "googleDriveFileId": "1ABC123DEF456GHI",
      "createdDate": "2025-10-04T14:30:00Z",
      "updatedDate": "2025-10-04T16:45:00Z",
      "rejectionReason": null,
      "feedback": "Excellent innovative approach",
      "qdrantPointId": "uuid-abc-123-def",
      "hasVectorData": true,
      "isUploaded": true,
      "team": {
        "teamId": 201,
        "teamName": "TEAM_CAP1_001",
        "capstoneType": 1,
        "teamLeaderName": "Nguyen Van A",
        "mentorName": "Dr. Tran Thi B",
        "studentCount": 5
      }
    }
  }
  ```

#### 8. **DELETE /api/proposals/{id}** 🗑️ Admin Only
- **Purpose**: Xóa proposal và tất cả dữ liệu liên quan (Admin only)
- **Access**: Admin only
- **Parameters**: `id` (integer, required)
- **Headers**: 
  ```
  Authorization: Bearer {admin_jwt_token}
  ```
- **Note**: Xóa proposal sẽ:
  - Xóa record trong database
  - Xóa vector data trong Qdrant
  - Giữ nguyên file trên Google Drive (để audit)
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Proposal deleted successfully. Google Drive file preserved for audit purposes.",
    "data": {
      "deletedProposalId": 5,
      "deletedTitle": "AI-powered Learning Platform",
      "teamName": "TEAM_CAP1_001",
      "googleDriveFilePreserved": true,
      "vectorDataRemoved": true,
      "deletedAt": "2025-10-04T18:20:00Z"
    }
  }
  ```

---

## 🔐 GoogleAuthController - Google Drive OAuth2 Integration

**Base Route**: `/auth/google` (Note: không có `/api` prefix)

### 🎯 Overview
Hệ thống OAuth2 integration với Google Drive API để upload và quản lý proposal files. Thay thế service account authentication để tránh quota limitations.

### 📋 Key Features
- ✅ **OAuth2 Flow** với Google Drive API
- ✅ **Token Management** (Access + Refresh tokens)
- ✅ **Automatic Token Refresh** khi expired
- ✅ **Secure Token Storage** trong filesystem
- ✅ **Public File Permissions** tự động cho uploaded files

### 📍 Endpoints Overview

| Method | Endpoint | Mô tả | Access Level |
|--------|----------|-------|--------------|
| `GET` | `/authorize` | Khởi tạo Google OAuth2 flow | Public |
| `GET` | `/callback` | Xử lý OAuth2 callback từ Google | Public |
| `GET` | `/status` | Kiểm tra trạng thái OAuth2 authorization | Public |
| `POST` | `/revoke` | Thu hồi OAuth2 authorization | Public |

### 📋 Detailed API Documentation

#### 1. **GET /auth/google/authorize** 🚀 Public
- **Purpose**: Khởi tạo Google OAuth2 authorization flow
- **Access**: Public (không cần authentication)
- **Usage**: Gọi endpoint này để lấy authorization URL, sau đó redirect user đến URL đó
- **Headers**: Không cần
- **Success Response (200)**:
  ```json
  {
    "authorizationUrl": "https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&response_type=code&client_id=220516932391-l4kb1b6hdbfo5e6bmu805o92ctagcpcc.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A5295%2Fauth%2Fgoogle%2Fcallback&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.file"
  }
  ```
- **Usage Flow**:
  1. Client gọi `/auth/google/authorize`
  2. Client redirect user đến `authorizationUrl`
  3. User grant permissions trên Google
  4. Google redirect về `/auth/google/callback` với authorization code
  5. System tự động exchange code thành tokens

#### 2. **GET /auth/google/callback** 🔄 Public  
- **Purpose**: Xử lý OAuth2 callback từ Google và exchange authorization code thành tokens
- **Access**: Public (được gọi bởi Google sau khi user grant permissions)
- **Parameters**: 
  - `code` (string, required) - Authorization code từ Google
  - `state` (string, optional) - State parameter for CSRF protection
  - `error` (string, optional) - Error code nếu có lỗi
- **Headers**: Không cần
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Google Drive authorization completed successfully!",
    "instructions": "You can now close this window and return to the application."
  }
  ```
- **Error Response (400)**:
  ```json
  {
    "success": false,
    "message": "Authorization failed: access_denied"
  }
  ```
- **Process**:
  1. Validate authorization code
  2. Exchange code for access & refresh tokens
  3. Store tokens securely in filesystem
  4. Return success confirmation

#### 3. **GET /auth/google/status** ✅ Public
- **Purpose**: Kiểm tra trạng thái OAuth2 authorization và test Google Drive connection
- **Access**: Public
- **Headers**: Không cần
- **Success Response (200)** - When Authorized:
  ```json
  {
    "isAuthorized": true,
    "userEmail": "user@gmail.com",
    "message": "Google Drive is connected and working"
  }
  ```
- **Success Response (200)** - When Not Authorized:
  ```json
  {
    "isAuthorized": false,
    "message": "Not authorized. Please authorize Google Drive access."
  }
  ```
- **Success Response (200)** - When Token Expired but Refreshed:
  ```json
  {
    "isAuthorized": true,
    "message": "Token refreshed successfully"
  }
  ```
- **Process**:
  1. Check if tokens exist and valid
  2. Test Google Drive API connection
  3. Auto-refresh tokens if expired
  4. Return authorization status

#### 4. **POST /auth/google/revoke** ❌ Public
- **Purpose**: Thu hồi OAuth2 authorization và xóa stored tokens
- **Access**: Public
- **Headers**: Không cần
- **Request Body**: Không cần
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Authorization revoked successfully"
  }
  ```
- **Process**:
  1. Delete stored access & refresh tokens
  2. Clear token files from filesystem
  3. Return revocation confirmation
- **Note**: Sau khi revoke, cần authorize lại để sử dụng Google Drive features

---

### 🔧 Google Drive Integration Technical Details

#### **OAuth2 Configuration Requirements**

**Google Cloud Console Setup:**
1. **Create OAuth 2.0 Client ID** trong Google Cloud Console
2. **Authorized redirect URIs**: `http://localhost:5295/auth/google/callback`
3. **Scopes**: `https://www.googleapis.com/auth/drive.file` 
4. **Application Type**: Web application
5. **Consent Screen**: External (for testing with any Google account)
6. **Test Users**: Add specific Gmail accounts for testing (if needed)

#### **Qdrant Vector Database Integration**

**Qdrant Configuration:**
- **HTTP API**: `http://localhost:6333` (REST API)
- **gRPC API**: `http://localhost:6334` (Alternative, currently using HTTP)
- **Collection**: `proposals` (auto-created)
- **Vector Dimension**: 384 (compatible with sentence transformers)
- **Distance Metric**: Cosine similarity
- **Storage**: Persistent storage with automatic indexing

**Credentials File (`oauth2-credentials.json`):**
```json
{
  "web": {
    "client_id": "your-client-id.apps.googleusercontent.com",
    "project_id": "your-project-id", 
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "client_secret": "your-client-secret",
    "redirect_uris": ["http://localhost:5295/auth/google/callback"],
    "javascript_origins": ["http://localhost:5295"]
  }
}
```

#### **Token Storage & Security**

**Token Files Location:**
```
Credentials/
├── oauth2-credentials.json          # OAuth2 client credentials
└── user-tokens/
    └── user-token.json             # User's access & refresh tokens
```

**Token File Structure:**
```json
{
  "access_token": "ya29.a0AfH6SMA...",
  "refresh_token": "1//04-refresh-token...",
  "scope": "https://www.googleapis.com/auth/drive.file",
  "token_type": "Bearer",
  "expires_in": 3599,
  "created_at": "2025-10-04T14:30:00Z"
}
```

#### **Google Drive Integration Flow**

**Complete Workflow:**
1. **Initial Setup**: Call `/auth/google/authorize` → Get authorization URL
2. **User Authorization**: User visits URL → Grants permissions → Redirected to callback
3. **Token Exchange**: Callback processes authorization code → Stores tokens
4. **File Upload**: Proposal upload uses stored tokens → Uploads to Google Drive
5. **Vector Processing**: Text extraction and vectorization → Store in Qdrant
6. **Token Refresh**: System auto-refreshes expired tokens → Maintains connectivity
7. **Status Check**: `/auth/google/status` confirms working connection

**Enhanced Proposal Upload Integration:**
```
POST /api/proposals/upload (with PDF file)
↓
Validate file format and team eligibility
↓
Extract text from PDF using iText7
↓
Use OAuth2 tokens → Upload PDF to Google Drive folder
↓  
Set public sharing permissions → Get shareable URL
↓
Convert text to 384D vector → Store in Qdrant via HTTP API
↓
Save proposal metadata (Google Drive URL + Qdrant Point ID) to SQL database
↓
Return success with live Google Drive link and vector confirmation
```

**Qdrant Vector Search Integration:**
```
GET /api/proposals/{id}/similarity-check
↓
Retrieve proposal's vector from Qdrant using Point ID
↓
Perform vector similarity search with threshold
↓
Rank results by similarity score
↓
Calculate risk levels and provide recommendations
↓
Return detailed similarity analysis with matched content
```

---

### 🧪 Google Drive OAuth2 Testing Guide

#### **Testing Prerequisites**
1. ✅ Google Cloud Console project configured
2. ✅ OAuth2 credentials downloaded and placed in `Credentials/oauth2-credentials.json`
3. ✅ Application running on `http://localhost:5295`
4. ✅ Google account for testing (can be any Gmail account)

#### **Complete OAuth2 Testing Flow**

```bash
# Step 1: Check current authorization status
GET http://localhost:5295/auth/google/status
# Expected: {"isAuthorized": false, "message": "Not authorized..."}

# Step 2: Initiate OAuth2 flow
GET http://localhost:5295/auth/google/authorize  
# Expected: {"authorizationUrl": "https://accounts.google.com/o/oauth2/v2/..."}

# Step 3: Manual browser interaction
# Copy authorizationUrl from Step 2 response
# Open URL in browser → Login to Google → Grant permissions
# Google redirects to: http://localhost:5295/auth/google/callback?code=4/0AV...

# Step 4: Verify authorization completed  
GET http://localhost:5295/auth/google/status
# Expected: {"isAuthorized": true, "userEmail": "your@gmail.com", "message": "Google Drive is connected..."}

# Step 5: Test proposal upload with Google Drive
POST http://localhost:5295/api/proposals/upload
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data
Form Data:
- Title: "Test OAuth2 Integration"
- Description: "Testing Google Drive upload with OAuth2"  
- TeamId: 201
- PdfFile: [select PDF file]
# Expected: Success response with real Google Drive URL

# Step 6: Verify Google Drive file
# Check the googleDriveUrl in response - should be accessible
# File should appear in your Google Drive under "CapSys-Proposals" folder

# Step 7: Test token refresh (wait 1 hour or force expire)
GET http://localhost:5295/auth/google/status  
# Expected: Auto token refresh, still returns isAuthorized: true

# Step 8: Test revoke authorization
POST http://localhost:5295/auth/google/revoke
# Expected: {"success": true, "message": "Authorization revoked successfully"}

# Step 9: Confirm revocation
GET http://localhost:5295/auth/google/status
# Expected: {"isAuthorized": false, "message": "Not authorized..."}
```

#### **Error Testing Scenarios**

```bash
# Test 1: Upload proposal without OAuth2 authorization
POST /api/proposals/upload (without prior OAuth2 setup)
# Expected: Success but googleDriveUrl might be null, hasVectorData should still be true

# Test 2: Invalid authorization code (manual test)
GET /auth/google/callback?code=invalid_code
# Expected: 400 Bad Request with error message

# Test 3: OAuth2 callback with error
GET /auth/google/callback?error=access_denied  
# Expected: 400 Bad Request with "Authorization failed: access_denied"

# Test 4: Status check with corrupted token files
# Manually corrupt user-token.json → Call status endpoint
GET /auth/google/status
# Expected: {"isAuthorized": false} and system should handle gracefully
```

---

### 🎯 Proposal System Integration Testing

#### **Complete Proposal Workflow Test**

```bash
# Prerequisites: OAuth2 authorized, Teams created, Students assigned

# Test 1: Complete Proposal Upload Flow
POST /api/proposals/upload
Authorization: Bearer {student_jwt_token}
Content-Type: multipart/form-data
Form Data:
- Title: "AI-Powered Educational Platform" 
- Description: "Comprehensive learning management system using artificial intelligence"
- TeamId: 201
- PdfFile: [PDF file with substantial content]

# Expected Response:
{
  "success": true,
  "message": "Proposal đã được upload thành công", 
  "data": {
    "id": 5,
    "title": "AI-Powered Educational Platform",
    "googleDriveUrl": "https://drive.google.com/file/d/1ABC.../view?usp=sharing",
    "qdrantPointId": "abc-123-def-456",  
    "hasVectorData": true,
    "isUploaded": true
  }
}

# Test 2: Verify Qdrant Integration
# Check Qdrant dashboard at http://localhost:6333/dashboard
# "proposals" collection should show Points > 0

# Test 3: Test Similarity Check
POST /api/proposals/upload (second proposal with similar content)
# Then check similarity:
GET /api/proposals/{id}/similarity-check
# Expected: Shows similar proposals with similarity scores

# Test 4: Test Export/Download
GET /api/proposals/{id}/export  
# Expected: Returns download URL for Google Drive file

# Test 5: Admin Status Management
PUT /api/proposals/{id}/status
Authorization: Bearer {admin_jwt_token}
{
  "status": "Approved",
  "feedback": "Excellent innovative approach"
}
# Expected: Status updated successfully

# Test 6: Lecturer Review Flow
GET /api/proposals (Admin/Lecturer view)
# Expected: List all proposals with statistics

# Test 7: Team Proposal Retrieval  
GET /api/proposals/team/{teamId}
# Expected: Returns team's proposal(s)
```

---

### 🔧 Configuration & Deployment

#### **Required Configuration**
```json
// appsettings.json
{
  "GoogleDrive": {
    "ApplicationName": "CapSys-Backend",
    "UseOAuth2": true,
    "FolderId": "1OhckTEg5iVPOc2DvhTCljymo_VbpE-sm"
  },
  "Qdrant": {
    "Host": "localhost", 
    "Port": 6333,
    "CollectionName": "proposals_collection",
    "VectorSize": 384,
    "ApiKey": "",
    "Https": false
  },
  "FileUpload": {
    "TempPath": "Uploads/Temp",
    "AllowedExtensions": [".pdf"],
    "MaxFileSizeBytes": 10485760,
    "ScanForViruses": false
  }
}
```

#### **Docker Services Required**
```yaml
# docker-compose.yml (Qdrant service)
version: '3.8'
services:
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"  # HTTP API
      - "6334:6334"  # gRPC API  
    volumes:
      - ./qdrant_storage:/qdrant/storage
    environment:
      - QDRANT__SERVICE__HTTP_PORT=6333
      - QDRANT__SERVICE__GRPC_PORT=6334
```

#### **File Structure Requirements**
```
CapSys-Backend/
├── Credentials/
│   ├── oauth2-credentials.json      # OAuth2 client config
│   └── user-tokens/
│       └── user-token.json         # User tokens (auto-generated)
├── Uploads/
│   └── Temp/                       # Temporary file processing
├── Services/
│   ├── Storage/
│   │   └── GoogleDriveService.cs   # Google Drive OAuth2 integration  
│   ├── Document/
│   │   └── PdfProcessingService.cs # PDF text extraction with iText7
│   ├── VectorDatabase/
│   │   ├── QdrantHttpService.cs    # Qdrant HTTP API client
│   │   ├── TextVectorizationService.cs  # Text→Vector conversion
│   │   └── Interface/
│   │       └── IQdrantService.cs   # Vector database interface
│   └── Proposal/
│       └── ProposalService.cs      # Main proposal business logic
├── Controllers/
│   ├── Proposal/
│   │   └── ProposalController.cs   # Proposal API endpoints
│   └── Auth/
│       └── GoogleAuthController.cs # OAuth2 flow endpoints
└── Configuration/
    ├── QdrantSettings.cs          # Qdrant connection config
    └── GoogleDriveSettings.cs     # Google Drive config
```

#### **External Dependencies & NuGet Packages**
- **Google Drive API**: OAuth2 client configured in Google Cloud Console
- **Qdrant Vector Database**: Docker container running on localhost:6333/6334  
- **SQL Server**: Proposal and metadata storage with Entity Framework Core
- **iText7**: `itext7` NuGet package for PDF text extraction
- **Qdrant.Client**: `Qdrant.Client` NuGet package for vector operations
- **Google APIs**: `Google.Apis.Drive.v3` for Google Drive integration
- **Future Enhancement**: Sentence Transformers for advanced text vectorization

#### **Development Setup Checklist**
- [ ] Google Cloud Console OAuth2 client configured
- [ ] `oauth2-credentials.json` downloaded and placed in `Credentials/`
- [ ] Qdrant Docker container running (`docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant`)
- [ ] SQL Server connection string configured
- [ ] Google Drive folder created and ID added to `appsettings.json`
- [ ] Complete OAuth2 flow tested (`/auth/google/authorize` → `/auth/google/callback`)
- [ ] Test proposal upload with PDF file
- [ ] Verify Qdrant dashboard shows vector data (`http://localhost:6333/dashboard`)
- [ ] Test similarity checking between proposals

---

## � GradingController - Comprehensive Grading System

**Base Route**: `/api/grading`

### 🎯 Overview
Hệ thống chấm điểm toàn diện với 7 tiêu chí cố định, tự động tính toán điểm thưởng đóng góp, và hỗ trợ chấm điểm nhanh cho toàn bộ nhóm.

### 📋 Grading Criteria (7 Fixed Criteria)
1. **Technical Skills** (20%) - Kỹ năng kỹ thuật
2. **Problem Solving** (20%) - Giải quyết vấn đề  
3. **Communication** (10%) - Kỹ năng giao tiếp
4. **Teamwork** (20%) - Làm việc nhóm
5. **Creativity** (20%) - Tính sáng tạo
6. **Project Management** (10%) - Quản lý dự án
7. **Contribution** (0% - Auto-calculated) - Điểm thưởng đóng góp

### 📍 Endpoints Overview

| Method | Endpoint | Mô tả | Access Level |
|--------|----------|-------|--------------|
| `GET` | `/criteria` | Lấy danh sách 7 tiêu chí chấm điểm | Admin/Lecturer |
| `GET` | `/sessions` | Lấy tất cả phiên chấm điểm | Admin only |
| `GET` | `/sessions/{sessionId}` | Chi tiết phiên chấm điểm | Admin/Lecturer |
| `POST` | `/sessions` | Tạo phiên chấm điểm mới | Admin only |
| `PUT` | `/sessions/{sessionId}` | Cập nhật phiên chấm điểm | Admin only |
| `DELETE` | `/sessions/{sessionId}` | Xóa phiên chấm điểm | Admin only |
| `GET` | `/sessions/team/{teamId}` | Lấy phiên chấm của nhóm | Admin/Lecturer |
| `GET` | `/sessions/{sessionId}/grades` | Chi tiết điểm từng sinh viên | Admin/Lecturer |
| `POST` | `/sessions/{sessionId}/grades` | Chấm điểm từng sinh viên | Admin/Lecturer |
| `PUT` | `/sessions/{sessionId}/grades/{studentId}` | Cập nhật điểm sinh viên | Admin/Lecturer |
| `POST` | `/sessions/{sessionId}/quick-grade` | Chấm điểm nhanh toàn nhóm | Admin/Lecturer |
| `GET` | `/sessions/{sessionId}/summary` | Tổng kết điểm nhóm | Admin/Lecturer |

### 📋 Detailed API Documentation

#### 1. **GET /api/grading/criteria** 📋 Admin/Lecturer
- **Purpose**: Lấy danh sách 7 tiêu chí chấm điểm cố định
- **Access**: Admin và Lecturer (`[Authorize(Roles = "Admin,Lecturer")]`)
- **Headers**: 
  ```
  Authorization: Bearer {jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Retrieved 7 grading criteria successfully",
    "data": [
      {
        "criteriaId": 1,
        "criteriaName": "Technical Skills",
        "description": "Đánh giá kỹ năng kỹ thuật, lập trình và sử dụng công nghệ",
        "weight": 20.0,
        "maxScore": 10.0,
        "isActive": true,
        "isContribution": false
      },
      {
        "criteriaId": 2,
        "criteriaName": "Problem Solving",
        "description": "Khả năng phân tích, giải quyết vấn đề và tư duy logic",
        "weight": 20.0,
        "maxScore": 10.0,
        "isActive": true,
        "isContribution": false
      },
      {
        "criteriaId": 3,
        "criteriaName": "Communication",
        "description": "Kỹ năng trình bày, giao tiếp và thuyết trình",
        "weight": 10.0,
        "maxScore": 10.0,
        "isActive": true,
        "isContribution": false
      },
      {
        "criteriaId": 4,
        "criteriaName": "Teamwork",
        "description": "Khả năng làm việc nhóm và hợp tác hiệu quả",
        "weight": 20.0,
        "maxScore": 10.0,
        "isActive": true,
        "isContribution": false
      },
      {
        "criteriaId": 5,
        "criteriaName": "Creativity",
        "description": "Tính sáng tạo, đổi mới trong giải pháp và ý tưởng",
        "weight": 20.0,
        "maxScore": 10.0,
        "isActive": true,
        "isContribution": false
      },
      {
        "criteriaId": 6,
        "criteriaName": "Project Management",
        "description": "Quản lý thời gian, tài nguyên và tiến độ dự án",
        "weight": 10.0,
        "maxScore": 10.0,
        "isActive": true,
        "isContribution": false
      },
      {
        "criteriaId": 7,
        "criteriaName": "Contribution",
        "description": "Điểm thưởng dựa trên mức độ đóng góp vào nhóm (tự động tính)",
        "weight": 0.0,
        "maxScore": 2.0,
        "isActive": true,
        "isContribution": true
      }
    ]
  }
  ```

#### 2. **GET /api/grading/sessions** 📋 Admin Only
- **Purpose**: Lấy tất cả phiên chấm điểm trong hệ thống
- **Access**: Admin only (`[Authorize(Roles = "Admin")]`)
- **Headers**: 
  ```
  Authorization: Bearer {admin_jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Retrieved 15 grading sessions successfully",
    "data": [
      {
        "sessionId": 1,
        "sessionName": "Mid-term Evaluation - Capstone 1",
        "description": "Đánh giá giữa kỳ cho các nhóm Capstone 1",
        "teamId": 201,
        "teamName": "TEAM_CAP1_001",
        "graderId": 5,
        "graderName": "Dr. Nguyen Van A",
        "sessionDate": "2024-01-15T14:30:00Z",
        "status": "Active",
        "isCompleted": false,
        "createdDate": "2024-01-10T09:00:00Z",
        "totalStudents": 5,
        "gradedStudents": 2
      },
      {
        "sessionId": 2,
        "sessionName": "Final Defense - Team Alpha",
        "description": "Bảo vệ đồ án tốt nghiệp cuối kỳ",
        "teamId": 205,
        "teamName": "TEAM_CAP2_003",
        "graderId": 8,
        "graderName": "Dr. Tran Thi B",
        "sessionDate": "2024-01-20T10:00:00Z",
        "status": "Completed",
        "isCompleted": true,
        "createdDate": "2024-01-18T08:30:00Z",
        "totalStudents": 4,
        "gradedStudents": 4
      }
    ]
  }
  ```

#### 3. **GET /api/grading/sessions/{sessionId}** 👤 Admin/Lecturer
- **Purpose**: Lấy chi tiết phiên chấm điểm cụ thể
- **Access**: Admin và Lecturer
- **Parameters**: `sessionId` (integer, required)
- **Headers**: 
  ```
  Authorization: Bearer {jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Grading session retrieved successfully",
    "data": {
      "sessionId": 1,
      "sessionName": "Mid-term Evaluation - Capstone 1",
      "description": "Đánh giá giữa kỳ cho các nhóm Capstone 1",
      "teamId": 201,
      "teamName": "TEAM_CAP1_001",
      "graderId": 5,
      "graderName": "Dr. Nguyen Van A",
      "sessionDate": "2024-01-15T14:30:00Z",
      "status": "Active",
      "isCompleted": false,
      "createdDate": "2024-01-10T09:00:00Z",
      "totalStudents": 5,
      "gradedStudents": 2,
      "students": [
        {
          "studentId": 101,
          "studentCode": "SE210001",
          "fullName": "Nguyen Van A",
          "isGraded": true,
          "finalScore": 8.2
        },
        {
          "studentId": 102,
          "studentCode": "SE210002", 
          "fullName": "Tran Thi B",
          "isGraded": false,
          "finalScore": null
        }
      ]
    }
  }
  ```

#### 4. **POST /api/grading/sessions** ➕ Admin Only
- **Purpose**: Tạo phiên chấm điểm mới cho một nhóm
- **Access**: Admin only
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {admin_jwt_token}
  ```
- **Request Body**:
  ```json
  {
    "sessionName": "Final Defense - Team Beta",
    "description": "Đánh giá bảo vệ đồ án cuối kỳ cho nhóm Beta",
    "teamId": 203,
    "graderId": 7,
    "sessionDate": "2024-01-25T15:00:00Z"
  }
  ```
- **Validation Rules**:
  - `sessionName` bắt buộc, tối đa 200 ký tự
  - `teamId` phải tồn tại và có sinh viên
  - `graderId` phải là lecturer hợp lệ
  - `sessionDate` phải là thời gian tương lai
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Grading session created successfully",
    "data": {
      "sessionId": 25,
      "sessionName": "Final Defense - Team Beta",
      "description": "Đánh giá bảo vệ đồ án cuối kỳ cho nhóm Beta",
      "teamId": 203,
      "teamName": "TEAM_CAP2_005",
      "graderId": 7,
      "graderName": "Dr. Le Van C",
      "sessionDate": "2024-01-25T15:00:00Z",
      "status": "Active",
      "isCompleted": false,
      "createdDate": "2024-01-22T10:30:00Z",
      "totalStudents": 5,
      "gradedStudents": 0
    }
  }
  ```

#### 5. **PUT /api/grading/sessions/{sessionId}** ✏️ Admin Only
- **Purpose**: Cập nhật thông tin phiên chấm điểm
- **Access**: Admin only
- **Parameters**: `sessionId` (integer, required)
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {admin_jwt_token}
  ```
- **Request Body** (All fields optional):
  ```json
  {
    "sessionName": "Updated Session Name",
    "description": "Updated description",
    "graderId": 9,
    "sessionDate": "2024-01-30T16:00:00Z",
    "status": "Completed"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Grading session updated successfully",
    "data": {
      "sessionId": 25,
      "sessionName": "Updated Session Name",
      "description": "Updated description",
      "teamId": 203,
      "teamName": "TEAM_CAP2_005",
      "graderId": 9,
      "graderName": "Dr. Pham Van D",
      "sessionDate": "2024-01-30T16:00:00Z",
      "status": "Completed",
      "isCompleted": true,
      "createdDate": "2024-01-22T10:30:00Z",
      "totalStudents": 5,
      "gradedStudents": 5
    }
  }
  ```

#### 6. **DELETE /api/grading/sessions/{sessionId}** 🗑️ Admin Only
- **Purpose**: Xóa phiên chấm điểm và tất cả điểm số liên quan
- **Access**: Admin only
- **Parameters**: `sessionId` (integer, required)
- **Headers**: 
  ```
  Authorization: Bearer {admin_jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Grading session and all associated grades deleted successfully"
  }
  ```

#### 7. **GET /api/grading/sessions/team/{teamId}** 👥 Admin/Lecturer
- **Purpose**: Lấy tất cả phiên chấm điểm của một nhóm
- **Access**: Admin và Lecturer
- **Parameters**: `teamId` (integer, required)
- **Headers**: 
  ```
  Authorization: Bearer {jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Retrieved 3 grading sessions for team 201",
    "data": [
      {
        "sessionId": 1,
        "sessionName": "Mid-term Evaluation",
        "description": "Đánh giá giữa kỳ",
        "graderId": 5,
        "graderName": "Dr. Nguyen Van A",
        "sessionDate": "2024-01-15T14:30:00Z",
        "status": "Completed",
        "isCompleted": true,
        "totalStudents": 5,
        "gradedStudents": 5
      },
      {
        "sessionId": 15,
        "sessionName": "Final Defense",
        "description": "Bảo vệ đồ án cuối kỳ",
        "graderId": 5,
        "graderName": "Dr. Nguyen Van A",
        "sessionDate": "2024-02-10T10:00:00Z",
        "status": "Active",
        "isCompleted": false,
        "totalStudents": 5,
        "gradedStudents": 2
      }
    ]
  }
  ```

#### 8. **GET /api/grading/sessions/{sessionId}/grades** 📊 Admin/Lecturer
- **Purpose**: Lấy chi tiết điểm số của tất cả sinh viên trong phiên chấm điểm
- **Access**: Admin và Lecturer
- **Parameters**: `sessionId` (integer, required)
- **Headers**: 
  ```
  Authorization: Bearer {jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Retrieved detailed grades for session 1",
    "data": [
      {
        "studentId": 101,
        "studentCode": "SE210001",
        "fullName": "Nguyen Van A",
        "finalScore": 8.2,
        "isCompleted": true,
        "gradedDate": "2024-01-15T15:30:00Z",
        "criteriaGrades": [
          {
            "criteriaId": 1,
            "criteriaName": "Technical Skills",
            "weight": 20.0,
            "maxScore": 10.0,
            "score": 8.5,
            "comments": "Excellent programming skills, good understanding of frameworks"
          },
          {
            "criteriaId": 2,
            "criteriaName": "Problem Solving",
            "weight": 20.0,
            "maxScore": 10.0,
            "score": 8.0,
            "comments": "Good analytical thinking, can solve complex problems"
          },
          {
            "criteriaId": 3,
            "criteriaName": "Communication",
            "weight": 10.0,
            "maxScore": 10.0,
            "score": 7.5,
            "comments": "Clear presentation, needs improvement in Q&A"
          },
          {
            "criteriaId": 4,
            "criteriaName": "Teamwork",
            "weight": 20.0,
            "maxScore": 10.0,
            "score": 9.0,
            "comments": "Great team player, helps others actively"
          },
          {
            "criteriaId": 5,
            "criteriaName": "Creativity",
            "weight": 20.0,
            "maxScore": 10.0,
            "score": 8.0,
            "comments": "Creative solutions, innovative approach"
          },
          {
            "criteriaId": 6,
            "criteriaName": "Project Management",
            "weight": 10.0,
            "maxScore": 10.0,
            "score": 7.0,
            "comments": "Good organization, can improve timeline management"
          },
          {
            "criteriaId": 7,
            "criteriaName": "Contribution",
            "weight": 0.0,
            "maxScore": 2.0,
            "score": 1.5,
            "comments": "High contribution level - automatically calculated"
          }
        ]
      },
      {
        "studentId": 102,
        "studentCode": "SE210002",
        "fullName": "Tran Thi B", 
        "finalScore": null,
        "isCompleted": false,
        "gradedDate": null,
        "criteriaGrades": []
      }
    ]
  }
  ```

#### 9. **POST /api/grading/sessions/{sessionId}/grades** 📝 Admin/Lecturer
- **Purpose**: Chấm điểm chi tiết cho một sinh viên theo 7 tiêu chí
- **Access**: Admin và Lecturer
- **Parameters**: `sessionId` (integer, required)
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {jwt_token}
  ```
- **Request Body**:
  ```json
  {
    "studentId": 103,
    "criteriaGrades": [
      {
        "criteriaId": 1,
        "score": 8.5,
        "comments": "Excellent technical implementation"
      },
      {
        "criteriaId": 2,
        "score": 7.8,
        "comments": "Good problem-solving approach"
      },
      {
        "criteriaId": 3,
        "score": 7.2,
        "comments": "Clear communication, needs confidence"
      },
      {
        "criteriaId": 4,
        "score": 9.0,
        "comments": "Outstanding teamwork and collaboration"
      },
      {
        "criteriaId": 5,
        "score": 8.3,
        "comments": "Creative and innovative solutions"
      },
      {
        "criteriaId": 6,
        "score": 7.5,
        "comments": "Good project organization"
      }
    ],
    "contributionLevel": "High"
  }
  ```
- **Contribution Levels** (Auto-calculates Contribution score):
  - `"Low"` = 0.5 điểm
  - `"Medium"` = 1.0 điểm  
  - `"High"` = 1.5 điểm
  - `"Excellent"` = 2.0 điểm
- **Score Calculation**: Final Score = Σ(Score × Weight/100) + Contribution Score
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Student graded successfully with final score 8.34",
    "data": {
      "studentId": 103,
      "studentCode": "SE210003",
      "fullName": "Le Van C",
      "finalScore": 8.34,
      "isCompleted": true,
      "gradedDate": "2024-01-15T16:45:00Z",
      "contributionScore": 1.5,
      "contributionLevel": "High",
      "criteriaGrades": [
        {
          "criteriaId": 1,
          "criteriaName": "Technical Skills",
          "score": 8.5,
          "weight": 20.0,
          "weightedScore": 1.7,
          "comments": "Excellent technical implementation"
        },
        {
          "criteriaId": 2,
          "criteriaName": "Problem Solving",
          "score": 7.8,
          "weight": 20.0,
          "weightedScore": 1.56,
          "comments": "Good problem-solving approach"
        },
        {
          "criteriaId": 7,
          "criteriaName": "Contribution",
          "score": 1.5,
          "weight": 0.0,
          "weightedScore": 1.5,
          "comments": "High contribution level - automatically calculated"
        }
      ]
    }
  }
  ```

#### 10. **PUT /api/grading/sessions/{sessionId}/grades/{studentId}** ✏️ Admin/Lecturer
- **Purpose**: Cập nhật điểm số của sinh viên đã được chấm
- **Access**: Admin và Lecturer
- **Parameters**: 
  - `sessionId` (integer, required)
  - `studentId` (integer, required)
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {jwt_token}
  ```
- **Request Body**:
  ```json
  {
    "criteriaGrades": [
      {
        "criteriaId": 1,
        "score": 9.0,
        "comments": "Updated - Exceptional technical skills"
      },
      {
        "criteriaId": 3,
        "score": 8.0,
        "comments": "Updated - Much improved presentation"
      }
    ],
    "contributionLevel": "Excellent"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Student grades updated successfully. New final score: 8.67",
    "data": {
      "studentId": 103,
      "studentCode": "SE210003",
      "fullName": "Le Van C",
      "finalScore": 8.67,
      "previousScore": 8.34,
      "isCompleted": true,
      "gradedDate": "2024-01-15T17:20:00Z",
      "contributionScore": 2.0,
      "contributionLevel": "Excellent",
      "updatedCriteria": [1, 3, 7]
    }
  }
  ```

#### 11. **POST /api/grading/sessions/{sessionId}/quick-grade** ⚡ Admin/Lecturer
- **Purpose**: Chấm điểm nhanh cho toàn bộ nhóm với cùng điểm số
- **Access**: Admin và Lecturer  
- **Parameters**: `sessionId` (integer, required)
- **Headers**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {jwt_token}
  ```
- **Request Body**:
  ```json
  {
    "criteriaScores": [
      {
        "criteriaId": 1,
        "score": 8.0,
        "comments": "Good technical implementation across the team"
      },
      {
        "criteriaId": 2,
        "score": 7.5,
        "comments": "Team shows solid problem-solving skills"
      },
      {
        "criteriaId": 3,
        "score": 7.0,
        "comments": "Presentation needs improvement for all members"
      },
      {
        "criteriaId": 4,
        "score": 8.5,
        "comments": "Excellent teamwork and collaboration"
      },
      {
        "criteriaId": 5,
        "score": 7.8,
        "comments": "Creative approach to project challenges"
      },
      {
        "criteriaId": 6,
        "score": 7.2,
        "comments": "Project management can be improved"
      }
    ],
    "defaultContributionLevel": "Medium"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Quick grading completed for 5 students with average score 7.75",
    "data": {
      "sessionId": 1,
      "sessionName": "Mid-term Evaluation - Capstone 1",
      "totalStudentsGraded": 5,
      "averageFinalScore": 7.75,
      "gradedStudents": [
        {
          "studentId": 101,
          "studentCode": "SE210001",
          "fullName": "Nguyen Van A",
          "finalScore": 7.75,
          "contributionScore": 1.0
        },
        {
          "studentId": 102,
          "studentCode": "SE210002",
          "fullName": "Tran Thi B",
          "finalScore": 7.75,
          "contributionScore": 1.0
        },
        {
          "studentId": 103,
          "studentCode": "SE210003",
          "fullName": "Le Van C",
          "finalScore": 7.75,
          "contributionScore": 1.0
        },
        {
          "studentId": 104,
          "studentCode": "SE210004",
          "fullName": "Pham Thi D",
          "finalScore": 7.75,
          "contributionScore": 1.0
        },
        {
          "studentId": 105,
          "studentCode": "SE210005",
          "fullName": "Hoang Van E",
          "finalScore": 7.75,
          "contributionScore": 1.0
        }
      ]
    }
  }
  ```

#### 12. **GET /api/grading/sessions/{sessionId}/summary** 📈 Admin/Lecturer
- **Purpose**: Tổng kết thống kê điểm số của phiên chấm điểm
- **Access**: Admin và Lecturer
- **Parameters**: `sessionId` (integer, required)
- **Headers**: 
  ```
  Authorization: Bearer {jwt_token}
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "message": "Grading session summary retrieved successfully",
    "data": {
      "sessionId": 1,
      "sessionName": "Mid-term Evaluation - Capstone 1",
      "teamId": 201,
      "teamName": "TEAM_CAP1_001",
      "graderName": "Dr. Nguyen Van A",
      "sessionDate": "2024-01-15T14:30:00Z",
      "isCompleted": true,
      "totalStudents": 5,
      "gradedStudents": 5,
      "completionPercentage": 100.0,
      "statistics": {
        "averageFinalScore": 8.15,
        "highestScore": 8.67,
        "lowestScore": 7.45,
        "standardDeviation": 0.42,
        "gradeDistribution": {
          "excellent": 2,
          "good": 2,
          "average": 1,
          "belowAverage": 0
        }
      },
      "criteriaStatistics": [
        {
          "criteriaId": 1,
          "criteriaName": "Technical Skills",
          "averageScore": 8.2,
          "highestScore": 9.0,
          "lowestScore": 7.5,
          "weight": 20.0
        },
        {
          "criteriaId": 2,
          "criteriaName": "Problem Solving", 
          "averageScore": 7.9,
          "highestScore": 8.5,
          "lowestScore": 7.2,
          "weight": 20.0
        },
        {
          "criteriaId": 7,
          "criteriaName": "Contribution",
          "averageScore": 1.4,
          "highestScore": 2.0,
          "lowestScore": 1.0,
          "weight": 0.0
        }
      ],
      "studentRankings": [
        {
          "rank": 1,
          "studentId": 103,
          "studentCode": "SE210003",
          "fullName": "Le Van C",
          "finalScore": 8.67
        },
        {
          "rank": 2,
          "studentId": 101,
          "studentCode": "SE210001", 
          "fullName": "Nguyen Van A",
          "finalScore": 8.34
        }
      ]
    }
  }
  ```

---

### 🧪 **Comprehensive Grading System Testing Guide**

#### **📋 Prerequisites for Grading Tests**
```bash
# 1. Start Application
dotnet watch run

# 2. Base URL
https://localhost:5295/api

# 3. Admin Login Credentials
Email: vohtuankiet@dtu.edu.vn  
Password: kiet123

# 4. Required Data Setup
- Import lecturers (for graders)
- Import students and create teams
- Create team with ID 201 for testing
```

---

#### **🔥 Workflow 1: Grading Criteria Management (Read-Only)**
```bash
# Test 1.1: Get All Grading Criteria
GET /api/grading/criteria
Authorization: Bearer {jwt_token}
# Expected: 200 OK with 7 fixed criteria
# Purpose: Verify all grading criteria are properly seeded

# Expected Response Structure:
{
  "success": true,
  "message": "Retrieved 7 grading criteria successfully",
  "data": [
    {
      "criteriaId": 1,
      "criteriaName": "Technical Skills",
      "weight": 20.0,
      "isContribution": false
    },
    // ... 6 more criteria including Contribution (weight: 0.0)
  ]
}
```

---

#### **🎯 Workflow 2: Grading Session Management (Full CRUD)**
```bash
# Test 2.1: Create New Grading Session
POST /api/grading/sessions
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
{
  "sessionName": "Mid-term Evaluation - Team Alpha",
  "description": "Đánh giá giữa kỳ cho nhóm Alpha",
  "teamId": 201,
  "graderId": 5,
  "sessionDate": "2024-01-25T14:00:00Z"
}
# Expected: 200 OK with new session details
# Purpose: Create grading session for team

# Test 2.2: Get All Grading Sessions (Admin View)
GET /api/grading/sessions
Authorization: Bearer {admin_jwt_token}
# Expected: 200 OK with array of all sessions
# Purpose: Admin oversight of all grading activities

# Test 2.3: Get Specific Grading Session Details
GET /api/grading/sessions/1
Authorization: Bearer {jwt_token}
# Expected: 200 OK with session details and student list
# Purpose: View session information and grading progress

# Test 2.4: Get Grading Sessions for Specific Team
GET /api/grading/sessions/team/201
Authorization: Bearer {jwt_token}
# Expected: 200 OK with all sessions for team 201
# Purpose: View all grading history for a team

# Test 2.5: Update Grading Session
PUT /api/grading/sessions/1
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
{
  "sessionName": "Updated Session Name",
  "description": "Updated description",
  "graderId": 8,
  "sessionDate": "2024-01-30T15:00:00Z",
  "status": "Active"
}
# Expected: 200 OK with updated session details
# Purpose: Modify session information before/during grading

# Test 2.6: Delete Grading Session
DELETE /api/grading/sessions/1
Authorization: Bearer {admin_jwt_token}
# Expected: 200 OK with deletion confirmation
# Purpose: Remove session and all associated grades
```

---

#### **📊 Workflow 3: Individual Student Grading (Detailed Scoring)**
```bash
# Test 3.1: Grade Individual Student with All Criteria
POST /api/grading/sessions/1/grades
Authorization: Bearer {jwt_token}
Content-Type: application/json
{
  "studentId": 101,
  "criteriaGrades": [
    {
      "criteriaId": 1,
      "score": 8.5,
      "comments": "Excellent programming skills and technical implementation"
    },
    {
      "criteriaId": 2,
      "score": 8.0,
      "comments": "Good analytical thinking and problem-solving approach"
    },
    {
      "criteriaId": 3,
      "score": 7.5,
      "comments": "Clear presentation but needs more confidence in Q&A"
    },
    {
      "criteriaId": 4,
      "score": 9.0,
      "comments": "Outstanding teamwork, helps other members actively"
    },
    {
      "criteriaId": 5,
      "score": 8.2,
      "comments": "Creative solutions and innovative approach to challenges"
    },
    {
      "criteriaId": 6,
      "score": 7.3,
      "comments": "Good organization, can improve timeline management"
    }
  ],
  "contributionLevel": "High"
}
# Expected: 200 OK with calculated final score
# Purpose: Detailed individual assessment with automatic contribution scoring

# Test 3.2: Update Existing Student Grades
PUT /api/grading/sessions/1/grades/101
Authorization: Bearer {jwt_token}
Content-Type: application/json
{
  "criteriaGrades": [
    {
      "criteriaId": 1,
      "score": 9.0,
      "comments": "Updated - Exceptional technical skills demonstrated"
    },
    {
      "criteriaId": 3,
      "score": 8.5,
      "comments": "Updated - Significant improvement in presentation skills"
    }
  ],
  "contributionLevel": "Excellent"
}
# Expected: 200 OK with updated final score
# Purpose: Modify grades after re-evaluation or additional evidence

# Test 3.3: Grade Multiple Students Individually
POST /api/grading/sessions/1/grades
Authorization: Bearer {jwt_token}
Content-Type: application/json
{
  "studentId": 102,
  "criteriaGrades": [
    {
      "criteriaId": 1,
      "score": 7.8,
      "comments": "Solid technical foundation with room for growth"
    },
    {
      "criteriaId": 2,
      "score": 8.3,
      "comments": "Excellent problem-solving skills and logical thinking"
    },
    {
      "criteriaId": 3,
      "score": 6.8,
      "comments": "Needs improvement in public speaking confidence"
    },
    {
      "criteriaId": 4,
      "score": 8.7,
      "comments": "Great team player, reliable and supportive"
    },
    {
      "criteriaId": 5,
      "score": 7.5,
      "comments": "Shows creativity in implementation details"
    },
    {
      "criteriaId": 6,
      "score": 7.8,
      "comments": "Well-organized with good time management"
    }
  ],
  "contributionLevel": "Medium"
}
# Expected: 200 OK with calculated final score for student 102
# Purpose: Continue grading remaining team members
```

---

#### **⚡ Workflow 4: Quick Grading (Bulk Team Assessment)**
```bash
# Test 4.1: Quick Grade Entire Team
POST /api/grading/sessions/1/quick-grade
Authorization: Bearer {jwt_token}
Content-Type: application/json
{
  "criteriaScores": [
    {
      "criteriaId": 1,
      "score": 8.0,
      "comments": "Team demonstrates strong technical competency across all members"
    },
    {
      "criteriaId": 2,
      "score": 7.8,
      "comments": "Good problem-solving approach, methodical and logical"
    },
    {
      "criteriaId": 3,
      "score": 7.2,
      "comments": "Presentations are clear but team needs more practice with Q&A"
    },
    {
      "criteriaId": 4,
      "score": 8.8,
      "comments": "Exceptional teamwork and collaboration throughout project"
    },
    {
      "criteriaId": 5,
      "score": 7.6,
      "comments": "Creative solutions implemented, innovative user interface"
    },
    {
      "criteriaId": 6,
      "score": 7.4,
      "comments": "Good project organization, minor delays but recovered well"
    }
  ],
  "defaultContributionLevel": "Medium"
}
# Expected: 200 OK with all team members graded identically
# Purpose: Efficient bulk grading when team performance is uniform

# Test 4.2: Verify Quick Grading Results
GET /api/grading/sessions/1/grades
Authorization: Bearer {jwt_token}
# Expected: 200 OK showing all students have been graded
# Purpose: Confirm quick grading applied to all team members

# Test 4.3: Adjust Individual Grades After Quick Grading
PUT /api/grading/sessions/1/grades/103
Authorization: Bearer {jwt_token}
Content-Type: application/json
{
  "criteriaGrades": [
    {
      "criteriaId": 1,
      "score": 9.2,
      "comments": "Team leader shows exceptional technical leadership"
    },
    {
      "criteriaId": 4,
      "score": 9.5,
      "comments": "Outstanding leadership and team coordination"
    }
  ],
  "contributionLevel": "Excellent"
}
# Expected: 200 OK with adjusted scores for team leader
# Purpose: Fine-tune individual performance after bulk grading
```

---

#### **📈 Workflow 5: Grading Analytics and Reports**
```bash
# Test 5.1: Get Detailed Grade Breakdown
GET /api/grading/sessions/1/grades
Authorization: Bearer {jwt_token}
# Expected: 200 OK with detailed criteria scores for each student
# Purpose: Review individual performance across all criteria

# Test 5.2: Get Grading Session Summary Statistics
GET /api/grading/sessions/1/summary
Authorization: Bearer {jwt_token}
# Expected: 200 OK with comprehensive session statistics
# Purpose: Analyze team performance and grading patterns

# Expected Summary Response:
{
  "success": true,
  "data": {
    "sessionId": 1,
    "sessionName": "Mid-term Evaluation - Team Alpha",
    "statistics": {
      "averageFinalScore": 8.15,
      "highestScore": 8.67,
      "lowestScore": 7.45,
      "standardDeviation": 0.42,
      "gradeDistribution": {
        "excellent": 2,    // Scores ≥ 8.5
        "good": 2,         // Scores 7.5-8.4  
        "average": 1,      // Scores 6.5-7.4
        "belowAverage": 0  // Scores < 6.5
      }
    },
    "criteriaStatistics": [
      {
        "criteriaId": 1,
        "criteriaName": "Technical Skills",
        "averageScore": 8.2,
        "highestScore": 9.0,
        "lowestScore": 7.5
      }
      // ... statistics for all 7 criteria
    ],
    "studentRankings": [
      {
        "rank": 1,
        "studentId": 103,
        "fullName": "Le Van C",
        "finalScore": 8.67
      }
      // ... rankings for all students
    ]
  }
}

# Test 5.3: Compare Multiple Sessions for Same Team
GET /api/grading/sessions/team/201
Authorization: Bearer {jwt_token}
# Expected: 200 OK with chronological session list
# Purpose: Track team improvement over multiple evaluations
```

---

#### **🔄 Workflow 6: End-to-End Grading Process**
```bash
# Complete Grading Workflow: From Session Creation to Final Analysis

# Step 1: Create Grading Session
POST /api/grading/sessions
{
  "sessionName": "Final Defense - Team Beta",
  "description": "Bảo vệ đồ án tốt nghiệp cuối kỳ",
  "teamId": 205,
  "graderId": 7,
  "sessionDate": "2024-02-15T10:00:00Z"
}

# Step 2: Verify Grading Criteria Available
GET /api/grading/criteria

# Step 3: Check Team Members in Session
GET /api/grading/sessions/{sessionId}

# Step 4: Grade Each Student Individually
POST /api/grading/sessions/{sessionId}/grades
{
  "studentId": 201,
  "criteriaGrades": [/* detailed scores */],
  "contributionLevel": "High"
}
# Repeat for each team member with different scores

# Step 5: Alternative - Use Quick Grade for Uniform Performance
POST /api/grading/sessions/{sessionId}/quick-grade
{
  "criteriaScores": [/* team-wide scores */],
  "defaultContributionLevel": "Medium"
}

# Step 6: Review and Adjust Individual Grades
PUT /api/grading/sessions/{sessionId}/grades/{studentId}
{
  "criteriaGrades": [/* updated scores */],
  "contributionLevel": "Excellent"
}

# Step 7: Generate Final Session Summary
GET /api/grading/sessions/{sessionId}/summary

# Step 8: Update Session Status to Completed
PUT /api/grading/sessions/{sessionId}
{
  "status": "Completed"
}

# Step 9: Export or Archive Results (Future Feature)
# GET /api/grading/sessions/{sessionId}/export
```

---

#### **🚨 Workflow 7: Error Testing & Validation**
```bash
# Test 7.1: Invalid Grading Session Creation
POST /api/grading/sessions
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
{
  "sessionName": "",  // Empty name
  "teamId": 99999,    // Non-existent team
  "graderId": 99999,  // Non-existent grader
  "sessionDate": "2023-01-01T10:00:00Z"  // Past date
}
# Expected: 400 Bad Request with validation errors

# Test 7.2: Invalid Score Values
POST /api/grading/sessions/1/grades
Authorization: Bearer {jwt_token}
Content-Type: application/json
{
  "studentId": 101,
  "criteriaGrades": [
    {
      "criteriaId": 1,
      "score": 15.0,  // Invalid: > maxScore (10.0)
      "comments": "Test"
    },
    {
      "criteriaId": 999,  // Invalid criteria ID
      "score": 8.0,
      "comments": "Test"
    }
  ],
  "contributionLevel": "Invalid"  // Invalid contribution level
}
# Expected: 400 Bad Request with specific validation errors

# Test 7.3: Unauthorized Access Tests
GET /api/grading/sessions
# (without Authorization header)
# Expected: 401 Unauthorized

GET /api/grading/sessions/1
Authorization: Bearer {student_jwt_token}
# Expected: 403 Forbidden (students can't access grading)

# Test 7.4: Non-existent Resource Tests
GET /api/grading/sessions/99999
Authorization: Bearer {jwt_token}
# Expected: 404 Not Found

POST /api/grading/sessions/99999/grades
Authorization: Bearer {jwt_token}
# Expected: 404 Not Found

# Test 7.5: Duplicate Grading Attempt
POST /api/grading/sessions/1/grades
Authorization: Bearer {jwt_token}
{
  "studentId": 101,  // Already graded student
  "criteriaGrades": [/* valid scores */],
  "contributionLevel": "Medium"
}
# Expected: 400 Bad Request - Student already graded

# Test 7.6: Grading Non-Team Member
POST /api/grading/sessions/1/grades
Authorization: Bearer {jwt_token}
{
  "studentId": 999,  // Student not in session's team
  "criteriaGrades": [/* valid scores */],
  "contributionLevel": "Medium"  
}
# Expected: 400 Bad Request - Student not in team
```

---

#### **⚙️ Workflow 8: Performance & Load Testing**
```bash
# Test 8.1: Concurrent Grading Sessions
for i in {1..5}; do
  curl -X POST "https://localhost:5295/api/grading/sessions" \
    -H "Authorization: Bearer {admin_jwt}" \
    -H "Content-Type: application/json" \
    -d "{\"sessionName\":\"Session $i\", \"teamId\":$((200+i)), \"graderId\":5, \"sessionDate\":\"2024-02-$((10+i))T14:00:00Z\"}" &
done
# Purpose: Test concurrent session creation

# Test 8.2: Bulk Grading Performance
time curl -X POST "https://localhost:5295/api/grading/sessions/1/quick-grade" \
  -H "Authorization: Bearer {jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{/* quick grade payload */}'
# Purpose: Measure bulk grading performance

# Test 8.3: Large Dataset Query Performance  
time curl -X GET "https://localhost:5295/api/grading/sessions" \
  -H "Authorization: Bearer {admin_jwt_token}"
# Purpose: Test query performance with many sessions
```

---

#### **📊 Workflow 9: Score Calculation Verification**
```bash
# Test 9.1: Manual Score Calculation Verification
# Create test case with known values
POST /api/grading/sessions/1/grades
{
  "studentId": 150,
  "criteriaGrades": [
    {"criteriaId": 1, "score": 8.0},  // Technical: 8.0 × 20% = 1.6
    {"criteriaId": 2, "score": 7.0},  // Problem: 7.0 × 20% = 1.4  
    {"criteriaId": 3, "score": 6.0},  // Communication: 6.0 × 10% = 0.6
    {"criteriaId": 4, "score": 9.0},  // Teamwork: 9.0 × 20% = 1.8
    {"criteriaId": 5, "score": 8.5},  // Creativity: 8.5 × 20% = 1.7
    {"criteriaId": 6, "score": 7.5}   // Management: 7.5 × 10% = 0.75
  ],
  "contributionLevel": "High"  // Contribution: 1.5 points
}
# Expected Final Score: 1.6+1.4+0.6+1.8+1.7+0.75+1.5 = 8.85
# Purpose: Verify scoring algorithm accuracy

# Test 9.2: Contribution Level Scoring Verification
POST /api/grading/sessions/1/grades
{
  "studentId": 151,
  "criteriaGrades": [
    {"criteriaId": 1, "score": 8.0},
    {"criteriaId": 2, "score": 8.0},
    {"criteriaId": 3, "score": 8.0},
    {"criteriaId": 4, "score": 8.0},
    {"criteriaId": 5, "score": 8.0},
    {"criteriaId": 6, "score": 8.0}
  ],
  "contributionLevel": "Low"  // Should add 0.5 points
}
# Expected Final Score: (8.0 × 90%) + 0.5 = 7.2 + 0.5 = 7.7
# Purpose: Verify contribution scoring levels

# Test 9.3: Edge Case Score Boundaries
POST /api/grading/sessions/1/grades
{
  "studentId": 152,
  "criteriaGrades": [
    {"criteriaId": 1, "score": 10.0},  // Maximum scores
    {"criteriaId": 2, "score": 10.0},
    {"criteriaId": 3, "score": 10.0},
    {"criteriaId": 4, "score": 10.0},
    {"criteriaId": 5, "score": 10.0},
    {"criteriaId": 6, "score": 10.0}
  ],
  "contributionLevel": "Excellent"  // Maximum contribution: 2.0
}
# Expected Final Score: (10.0 × 90%) + 2.0 = 9.0 + 2.0 = 11.0 (but capped at 10.0)
# Purpose: Test maximum score boundaries and capping
```

---

#### **✅ Grading System Validation Checklist**

**🎯 Core Functionality:**
- [ ] 7 grading criteria properly seeded and retrievable
- [ ] Grading session CRUD operations work correctly
- [ ] Individual student grading with all criteria
- [ ] Quick grading for entire teams
- [ ] Automatic contribution score calculation
- [ ] Final score calculation accuracy (weighted sum + contribution)
- [ ] Grade update and modification capabilities

**📊 Analytics & Reporting:**
- [ ] Detailed grade breakdown per student
- [ ] Session summary with statistics
- [ ] Criteria performance analysis
- [ ] Student ranking within session
- [ ] Grade distribution analysis
- [ ] Historical session tracking per team

**🔒 Security & Validation:**
- [ ] Role-based access control (Admin/Lecturer only)
- [ ] Input validation for all grade endpoints
- [ ] Score range validation (0-10 for criteria, 0-2 for contribution)
- [ ] Student-team membership verification
- [ ] Duplicate grading prevention
- [ ] Session ownership validation

**⚡ Performance & Reliability:**
- [ ] Quick grading performs well for full teams
- [ ] Session queries handle multiple sessions efficiently
- [ ] Grade calculations are accurate and consistent
- [ ] Concurrent grading session handling
- [ ] Database transaction integrity
- [ ] Error handling and meaningful error messages

---

#### **🚀 Quick Test Commands (Copy & Paste)**
```bash
# Complete Grading System Test (Run in sequence)

# 1. Login as admin/lecturer
curl -X POST "https://localhost:5295/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"vohtuankiet@dtu.edu.vn","password":"kiet123"}'

# 2. Get grading criteria (replace {JWT_TOKEN})
curl -X GET "https://localhost:5295/api/grading/criteria" \
  -H "Authorization: Bearer {JWT_TOKEN}"

# 3. Create grading session
curl -X POST "https://localhost:5295/api/grading/sessions" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"sessionName":"Test Session","description":"Test","teamId":201,"graderId":5,"sessionDate":"2024-02-15T14:00:00Z"}'

# 4. Get all sessions
curl -X GET "https://localhost:5295/api/grading/sessions" \
  -H "Authorization: Bearer {JWT_TOKEN}"

# 5. Grade a student
curl -X POST "https://localhost:5295/api/grading/sessions/1/grades" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"studentId":101,"criteriaGrades":[{"criteriaId":1,"score":8.5,"comments":"Good work"}],"contributionLevel":"High"}'

# 6. Quick grade entire team
curl -X POST "https://localhost:5295/api/grading/sessions/1/quick-grade" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"criteriaScores":[{"criteriaId":1,"score":8.0,"comments":"Team performance"}],"defaultContributionLevel":"Medium"}'

# 7. Get session summary
curl -X GET "https://localhost:5295/api/grading/sessions/1/summary" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**🎪 Recommended Testing Tools:**
- **Swagger UI**: `https://localhost:5295/swagger` (Interactive grading system testing)
- **Postman**: Create grading workflow collections with environment variables
- **Thunder Client** (VS Code): Lightweight testing within development environment
- **Database Browser**: Verify grade calculations and data integrity
- **Performance Monitor**: Track response times during bulk operations

---

## 📊 GradingController - Hướng Dẫn Flow Chấm Điểm từ A-Z

**Base Route**: `/api/grading`

### 🎯 Tổng Quan Hệ Thống Chấm Điểm

Hệ thống chấm điểm CapSys được thiết kế để đánh giá toàn diện sinh viên theo 7 tiêu chí cố định với quy trình chấm điểm linh hoạt, hỗ trợ cả chấm điểm chi tiết từng sinh viên và chấm điểm nhanh cho toàn nhóm.

### 📋 7 Tiêu Chí Chấm Điểm Cố Định

| Tiêu Chí | Trọng Số | Điểm Tối Đa | Mô Tả |
|----------|----------|-------------|--------|
| **Technical Skills** | 20% | 10.0 | Kỹ năng kỹ thuật, lập trình và sử dụng công nghệ |
| **Problem Solving** | 20% | 10.0 | Khả năng phân tích, giải quyết vấn đề và tư duy logic |
| **Communication** | 10% | 10.0 | Kỹ năng trình bày, giao tiếp và thuyết trình |
| **Teamwork** | 20% | 10.0 | Khả năng làm việc nhóm và hợp tác hiệu quả |
| **Creativity** | 20% | 10.0 | Tính sáng tạo, đổi mới trong giải pháp và ý tưởng |
| **Project Management** | 10% | 10.0 | Quản lý thời gian, tài nguyên và tiến độ dự án |
| **Contribution** | 0% (Bonus) | 2.0 | Điểm thưởng dựa trên mức độ đóng góp (tự động tính) |

### 🔄 Flow Chấm Điểm Hoàn Chỉnh từ A-Z

#### **📝 Phase A: Chuẩn Bị & Thiết Lập**

**Step A1: Đăng Nhập Hệ Thống**
```bash
POST /api/auth/login
Content-Type: application/json
{
  "email": "lecturer@dtu.edu.vn",
  "password": "lecturer123"
}
# Expected: JWT token cho giảng viên/admin
```

**Step A2: Kiểm Tra Tiêu Chí Chấm Điểm**
```bash
GET /api/grading/criteria
Authorization: Bearer {jwt_token}
# Expected: Danh sách 7 tiêu chí cố định với trọng số và mô tả
```

**Step A3: Tạo Phiên Chấm Điểm**
```bash
POST /api/grading/sessions
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
{
  "projectId": 1,
  "committeeId": 1,
  "teamId": 201,
  "createdBy": 5,
  "sessionDate": "2024-02-15T14:00:00Z",
  "sessionType": "Mid-term Evaluation",
  "notes": "Đánh giá giữa kỳ cho nhóm Alpha - Capstone 1"
}
# Expected: Phiên chấm điểm mới được tạo với ID và thông tin chi tiết
```

**Step A4: Xác Nhận Danh Sách Sinh Viên**
```bash
GET /api/grading/sessions/{sessionId}
Authorization: Bearer {jwt_token}
# Expected: Chi tiết phiên chấm điểm với danh sách sinh viên cần chấm
```

---

#### **📊 Phase B: Chấm Điểm Chi Tiết (Individual Assessment)**

**Step B1: Chấm Điểm Sinh Viên Đầu Tiên**
```bash
POST /api/grading/grades
Authorization: Bearer {jwt_token}
Content-Type: application/json
{
  "gradingSessionId": 1,
  "studentId": 101,
  "criteriaId": 1,  // Technical Skills
  "evaluatorId": 5,
  "evaluatorRole": "Instructor",
  "score": 8.5,
  "comments": "Xuất sắc trong việc sử dụng React và Node.js, code clean và có cấu trúc tốt"
}
# Lặp lại cho tất cả 6 tiêu chí (criteriaId: 1-6)
# Contribution (criteriaId: 7) được tính tự động
```

**Công Thức Tính Điểm:**
```
Final Score = Σ(Score × Weight/100) + Contribution Score
Technical:      8.5 × 20% = 1.7
Problem Solving: 8.0 × 20% = 1.6
Communication:   7.5 × 10% = 0.75
Teamwork:       9.0 × 20% = 1.8
Creativity:     8.2 × 20% = 1.64
Project Mgmt:   7.3 × 10% = 0.73
Contribution:   Auto calculated = 1.5 (High level)
Total = 1.7 + 1.6 + 0.75 + 1.8 + 1.64 + 0.73 + 1.5 = 9.72
```

**Step B2: Cập Nhật Điểm Nếu Cần**
```bash
PUT /api/grading/grades/{gradeId}
Authorization: Bearer {jwt_token}
Content-Type: application/json
{
  "score": 9.0,  // Điều chỉnh từ 8.5 lên 9.0
  "comments": "Sau khi xem demo chi tiết, kỹ thuật thực sự xuất sắc"
}
# Expected: Điểm số được cập nhật và tính toán lại tự động
```

**Step B3: Tiếp Tục Chấm Từng Sinh Viên Còn Lại**
```bash
# Lặp lại process trên cho sinh viên 102, 103, 104, 105...
# Mỗi sinh viên cần chấm đầy đủ 6 tiêu chí
# Contribution score được tính tự động dựa trên algorithm
```

---

#### **⚡ Phase C: Chấm Điểm Nhanh (Bulk Assessment)**

**Khi Nào Sử Dụng Chấm Điểm Nhanh:**
- Toàn bộ nhóm có performance tương đương nhau
- Đánh giá presentation chung của nhóm
- Cần chấm điểm nhanh cho nhiều nhóm

**Step C1: Chấm Điểm Nhanh Toàn Nhóm**
```bash
POST /api/grading/sessions/quick-grade
Authorization: Bearer {jwt_token}
Content-Type: application/json
{
  "gradingSessionId": 1,
  "evaluatorId": 5,
  "evaluatorRole": "Instructor",
  "studentGrades": [
    {
      "studentId": 101,
      "criteriaGrades": [
        {"criteriaId": 1, "score": 8.0, "comments": "Good technical skills"},
        {"criteriaId": 2, "score": 7.8, "comments": "Problem solving approach"},
        {"criteriaId": 3, "score": 7.2, "comments": "Clear presentation"},
        {"criteriaId": 4, "score": 8.8, "comments": "Excellent teamwork"},
        {"criteriaId": 5, "score": 7.6, "comments": "Creative solutions"},
        {"criteriaId": 6, "score": 7.4, "comments": "Good project management"}
      ]
    },
    {
      "studentId": 102,
      "criteriaGrades": [
        {"criteriaId": 1, "score": 8.0, "comments": "Good technical skills"},
        {"criteriaId": 2, "score": 7.8, "comments": "Problem solving approach"},
        // ... tương tự cho các tiêu chí khác
      ]
    }
    // ... cho tất cả sinh viên trong nhóm
  ]
}
# Expected: Toàn bộ sinh viên trong nhóm được chấm điểm cùng lúc
```

**Step C2: Điều Chỉnh Cá Nhân Sau Chấm Nhanh**
```bash
# Sau khi chấm nhanh, có thể điều chỉnh cho những sinh viên nổi bật
PUT /api/grading/grades/{gradeId}  # Team Leader
Authorization: Bearer {jwt_token}
Content-Type: application/json
{
  "score": 9.2,  // Nâng Technical Skills cho team leader
  "comments": "Team leader thể hiện kỹ năng kỹ thuật vượt trội, dẫn dắt team rất tốt"
}
```

---

#### **📊 Phase D: Theo Dõi & Phân Tích**

**Step D1: Kiểm Tra Tiến Độ Chấm Điểm**
```bash
GET /api/grading/sessions/{sessionId}/grades
Authorization: Bearer {jwt_token}
# Expected: Danh sách chi tiết điểm số của tất cả sinh viên
```

**Step D2: Xem Bảng Chấm Điểm Hoàn Chỉnh**
```bash
GET /api/grading/sessions/{sessionId}/grading-sheet
Authorization: Bearer {jwt_token}
# Expected: Ma trận điểm hoàn chỉnh dạng bảng
```

**Step D3: Xem Báo Cáo Tổng Kết**
```bash
GET /api/grading/sessions/{sessionId}/summary
Authorization: Bearer {jwt_token}
# Expected: Thống kê toàn diện về phiên chấm điểm
```

**Báo Cáo Mẫu:**
```json
{
  "success": true,
  "data": {
    "gradingSessionId": 1,
    "projectTitle": "AI Learning Platform",
    "teamCode": "TEAM_CAP1_001",
    "sessionDate": "2024-02-15T14:00:00Z",
    "totalStudents": 5,
    "gradedStudents": 5,
    "completionPercentage": 100.0,
    "statistics": {
      "averageFinalScore": 8.24,
      "highestScore": 9.67,
      "lowestScore": 7.45,
      "gradeDistribution": {
        "excellent": 2,     // Điểm ≥ 8.5
        "good": 2,          // Điểm 7.5-8.4
        "average": 1,       // Điểm 6.5-7.4
        "belowAverage": 0   // Điểm < 6.5
      }
    },
    "criteriaStatistics": [
      {
        "criteriaName": "Technical Skills",
        "averageScore": 8.3,
        "highestScore": 9.2,
        "lowestScore": 7.8
      },
      {
        "criteriaName": "Teamwork", 
        "averageScore": 8.8,
        "highestScore": 9.5,
        "lowestScore": 8.0
      }
    ],
    "studentRankings": [
      {
        "rank": 1,
        "studentCode": "SE210003",
        "fullName": "Le Van C",
        "finalScore": 9.67
      },
      {
        "rank": 2,
        "studentCode": "SE210001",
        "fullName": "Nguyen Van A",
        "finalScore": 9.22
      }
    ]
  }
}
```

---

#### **✅ Phase E: Hoàn Thiện & Lưu Trữ**

**Step E1: Hoàn Thành Phiên Chấm Điểm**
```bash
POST /api/grading/sessions/{sessionId}/complete
Authorization: Bearer {jwt_token}
Content-Type: application/json
"Phiên chấm điểm hoàn tất. Tất cả sinh viên đều thể hiện tốt, nhóm có tinh thần teamwork cao."
# Expected: Phiên chấm điểm được đánh dấu hoàn thành
```

**Step E2: Kiểm Tra Lịch Sử Chấm Điểm Của Team**
```bash
GET /api/grading/sessions/project/{projectId}
Authorization: Bearer {jwt_token}
# Expected: Tất cả phiên chấm điểm của project theo thời gian
```

**Step E3: So Sánh Tiến Bộ (Nếu Có Nhiều Phiên)**
```bash
# Nếu team đã có nhiều phiên chấm điểm, có thể so sánh:
GET /api/grading/sessions/{sessionId1}/summary   # Mid-term
GET /api/grading/sessions/{sessionId2}/summary   # Final
# Expected: So sánh tiến bộ giữa các lần đánh giá
```

---

### 🎯 Các Workflow Chấm Điểm Phổ Biến

#### **🏆 Workflow 1: Chấm Điểm Presentation/Demo (45 phút)**
```bash
# Phù hợp cho: Mid-term evaluation, Progress review
# Thời gian: 5-7 phút/sinh viên

# Step 1: Tạo phiên chấm điểm
POST /api/grading/sessions (15 phút presentation + 30 phút chấm)

# Step 2: Chấm điểm nhanh dựa trên presentation chung
POST /api/grading/sessions/quick-grade

# Step 3: Điều chỉnh cá nhân dựa trên Q&A
PUT /api/grading/grades/{gradeId}

# Step 4: Hoàn thành và xuất báo cáo
GET /api/grading/sessions/{sessionId}/summary
```

#### **🔬 Workflow 2: Chấm Điểm Chi Tiết Technical Review (90 phút)**
```bash
# Phù hợp cho: Final defense, Code review
# Thời gian: 15-18 phút/sinh viên

# Step 1: Tạo phiên chấm điểm
POST /api/grading/sessions

# Step 2: Chấm từng sinh viên chi tiết
POST /api/grading/grades (cho từng tiêu chí của từng sinh viên)

# Step 3: Review và điều chỉnh điểm nếu cần
PUT /api/grading/grades/{gradeId}

# Step 4: Phân tích performance và ranking
GET /api/grading/sessions/{sessionId}/summary
```

#### **⚡ Workflow 3: Chấm Điểm Nhanh Multiple Teams (2 giờ)**
```bash
# Phù hợp cho: Bulk evaluation, Progress check
# Thời gian: 20-25 phút/team

# For each team (lặp lại 5-6 teams):
POST /api/grading/sessions (team X)
POST /api/grading/sessions/quick-grade
GET /api/grading/sessions/{sessionId}/summary

# Cuối buổi: So sánh performance giữa các teams
```

---

### 🎓 Hướng Dẫn Contribution Scoring System

#### **📊 Tự Động Tính Điểm Contribution**

Hệ thống tự động tính điểm Contribution dựa trên thuật toán phân tích performance:

```csharp
// Algorithm tính Contribution Score
public decimal CalculateContributionScore(int sessionId, int studentId)
{
    // Lấy điểm trung bình của student so với team
    var studentAverage = GetStudentAverageScore(sessionId, studentId);
    var teamAverage = GetTeamAverageScore(sessionId);
    
    // Tính contribution level dựa trên performance relative to team
    if (studentAverage >= teamAverage + 1.0) return 2.0m;  // Excellent
    if (studentAverage >= teamAverage + 0.5) return 1.5m;  // High  
    if (studentAverage >= teamAverage - 0.5) return 1.0m;  // Medium
    return 0.5m;  // Low
}
```

#### **📝 Contribution Level Explanation**

| Level | Điểm Thưởng | Tiêu Chí Tự Động |
|-------|-------------|-------------------|
| **Excellent** | +2.0 điểm | Điểm trung bình cao hơn team ≥ 1.0 điểm |
| **High** | +1.5 điểm | Điểm trung bình cao hơn team 0.5-0.99 điểm |
| **Medium** | +1.0 điểm | Điểm trung bình trong khoảng ±0.5 so với team |
| **Low** | +0.5 điểm | Điểm trung bình thấp hơn team > 0.5 điểm |

---

### 🚀 Advanced Features & Tips

#### **📊 Grading Sheet View (Comprehensive Overview)**
```bash
GET /api/grading/sessions/{sessionId}/grading-sheet
Authorization: Bearer {jwt_token}
# Expected: Ma trận điểm hoàn chỉnh với all students × all criteria × all evaluators
```

#### **🔄 Batch Operations for Multiple Sessions**
```bash
# Lấy tất cả sessions của một committee
GET /api/grading/sessions/committee/{committeeId}

# Batch validate multiple sessions
GET /api/grading/sessions/{sessionId}/validate
```

#### **📈 Performance Analytics**
```bash
# So sánh performance across projects
GET /api/grading/sessions/project/{projectId}

# Detailed grades cho một sinh viên
GET /api/grading/sessions/{sessionId}/students/{studentId}/detailed-grades

# Summary cho tất cả sinh viên trong session
GET /api/grading/sessions/{sessionId}/summary
```

#### **⚙️ Grading Best Practices**

**🎯 Preparation Phase:**
1. **Review Project Requirements**: Hiểu rõ objectives và deliverables
2. **Setup Grading Sessions**: Tạo sessions trước khi bắt đầu evaluation
3. **Prepare Evaluation Environment**: Đảm bảo stable network và clear criteria

**📝 During Grading:**
1. **Consistent Standards**: Áp dụng cùng standards cho tất cả students
2. **Detailed Comments**: Provide constructive feedback trong comments field
3. **Real-time Updates**: Sử dụng PUT endpoints để adjust scores khi cần

**✅ Post-Grading:**
1. **Validate Completeness**: Ensure tất cả students đã được grade
2. **Review Statistics**: Check summary để đảm bảo fairness
3. **Complete Sessions**: Mark sessions as completed và archive results

---

### 🚨 Common Issues & Solutions

| Issue | Possible Cause | Solution |
|-------|----------------|----------|
| **Không thể tạo session** | Missing project/committee/team | Verify all required entities exist |
| **Grade submission fails** | Invalid criteria or student ID | Check valid criteriaId (1-6) và studentId in team |
| **Contribution not calculated** | Insufficient grade data | Ensure at least 3 criteria grades exist |
| **Quick grade không áp dụng** | Incomplete request data | Validate all students và criteria included |
| **Session không complete** | Missing required grades | Complete grading for all team members |

### 🎯 Validation Rules & Business Logic

#### **🔒 Score Validation**
- **Criteria Scores**: 0.0 - 10.0 (decimal precision allowed)
- **Session Requirements**: Project, Committee, Team must exist
- **Grade Completeness**: All 6 criteria required per student
- **Evaluator Authorization**: Must be committee member or admin

#### **👥 Access Control**
- **Admin**: Full access - all grading operations
- **Committee Members**: Grade assigned sessions only
- **Other Lecturers**: Read-only access to public sessions
- **Students**: No direct access (future: read own grades)

#### **📅 Session State Management**
- **Active Session**: Allows grading và updates
- **Completed Session**: Read-only, preserves historical data
- **Validation Required**: Auto-check completeness before completion

---

### ⏱️ Thời Gian Ước Tính Cho Các Workflow

| Workflow Type | Số Sinh Viên | Estimated Time | Best Practice |
|---------------|--------------|----------------|---------------|
| **Individual Detail** | 5 students | 45-60 phút | Final defense, comprehensive assessment |
| **Quick Grade Bulk** | 5 students | 15-20 phút | Mid-term evaluation, uniform performance |
| **Mixed Approach** | 5 students | 25-35 phút | Quick grade + individual adjustments |
| **Multiple Teams** | 3 teams (15 students) | 1.5-2 giờ | Batch evaluation sessions |

### 📋 Checklist Hoàn Thành Chấm Điểm

**✅ Pre-Grading Setup:**
- [ ] Login với appropriate permissions (Admin/Committee Member)
- [ ] Projects và Teams đã được setup
- [ ] Grading session created với correct project/committee/team
- [ ] Committee members assigned để đảm bảo access rights

**✅ During Grading Process:**
- [ ] Tất cả 6 criteria được grade cho mỗi student (Technical → Project Management)
- [ ] Comments provided cho constructive feedback
- [ ] Scores trong valid range (0-10) với reasonable distribution
- [ ] Contribution scores được calculate tự động

**✅ Post-Grading Validation:**
- [ ] Tất cả students trong team/project đã completed
- [ ] Final scores calculated correctly với contribution bonus
- [ ] Summary statistics reviewed cho consistency
- [ ] Session marked as completed và results archived

**✅ Quality Assurance:**
- [ ] Grade distribution appears reasonable (not all identical)
- [ ] Comments provide actionable feedback cho improvement
- [ ] Contribution scores reflect actual performance differences
- [ ] Historical comparison shows logical progression (if applicable)

---

## 🔧 Technical Specifications

### 🏗️ Architecture
- **Framework**: ASP.NET Core 8.0 Web API
- **Authentication**: JWT Bearer Token
- **Database**: SQL Server with Entity Framework Core
- **Caching**: Redis (for password reset codes)
- **Email**: SMTP integration
- **File Processing**: EPPlus for Excel import/export

### 📄 Standard Response Format
All endpoints use standardized `ApiResponse` format:
```json
{
    "success": true/false,
    "message": "Result message",
    "data": { /* Response data */ }
}
```

### 🛡️ Security Features
- ✅ JWT-based authentication with refresh tokens
- ✅ Role-based authorization (Admin, Student, Lecturer)
- ✅ Password hashing with BCrypt
- ✅ Email verification for password reset
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Request logging and monitoring

### 🗄️ Database Models
Key entities in the system:
- **Account**: Base user authentication
- **Student**: Student-specific information
- **Lecturer**: Lecturer-specific information
- **Admin**: Administrator information

---

## 🧪 Testing Guide

### 🚀 Quick Start
1. **Start Application**: `dotnet run` or `dotnet watch run`
2. **Access Swagger UI**: `https://localhost:7110/swagger`
3. **Base URL**: `https://localhost:7110/api`

### 📝 Comprehensive API Testing Workflows

#### **📋 Prerequisites for Testing**
1. **Start Application**: `dotnet watch run`
2. **Base URL**: `https://localhost:7110/api`
3. **Admin Account**: 
   - Email: `vohtuankiet@dtu.edu.vn`
   - Password: `kiet123`
4. **Testing Tools**: Swagger UI, Postman, Thunder Client, or curl

---

#### **🔐 Workflow 1: Authentication & Account Management**
```bash
# Test 1.1: Admin Login
POST /api/auth/login
Content-Type: application/json
{
  "email": "vohtuankiet@dtu.edu.vn",
  "password": "kiet123"
}
# Expected: 200 OK with JWT tokens and userInfo

# Test 1.2: Get Profile Information
GET /api/auth/profile
Authorization: Bearer {admin_jwt_token}
# Expected: 200 OK with admin profile details

# Test 1.3: Refresh JWT Token
POST /api/auth/refresh
Content-Type: application/json
{
  "token": "{expired_jwt_token}",
  "refreshToken": "{valid_refresh_token}"
}
# Expected: 200 OK with new JWT tokens

# Test 1.4: Register New Student Account
POST /api/auth/register/student
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
{
  "email": "student.test@university.edu",
  "password": "SecurePass123!",
  "studentCode": "SE999001",
  "fullName": "Test Student",
  "faculty": "Computer Science",
  "major": "Software Engineering",
  "phone": "+84901234567",
  "capstoneType": 1,
  "gpa": 3.5
}
# Expected: 201 Created with new student account info

# Test 1.5: Register New Lecturer Account
POST /api/auth/register/lecturer
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
{
  "email": "lecturer.test@university.edu",
  "password": "SecurePass123!",
  "fullName": "Dr. Test Lecturer",
  "department": "Computer Science",
  "phone": "+84901234567",
  "specialization": "Software Engineering",
  "maxStudentsSupervised": 10,
  "academicTitle": "Associate Professor"
}
# Expected: 201 Created with new lecturer account info

# Test 1.6: Password Reset Request
POST /api/auth/forget-password
Content-Type: application/json
{
  "email": "student.test@university.edu"
}
# Expected: 200 OK with success message

# Test 1.7: Password Reset (with code from email)
POST /api/auth/reset-password
Content-Type: application/json
{
  "email": "student.test@university.edu",
  "resetCode": "123456",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
# Expected: 200 OK with password reset confirmation

# Test 1.8: Logout
POST /api/auth/logout
Authorization: Bearer {admin_jwt_token}
# Expected: 200 OK with logout confirmation
```

---

#### **👨‍🎓 Workflow 2: Student Management (Full CRUD)**
```bash
# Test 2.1: Get All Students
GET /api/students/get-students
Authorization: Bearer {admin_jwt_token}
# Expected: 200 OK with array of all students

# Test 2.2: Get Student by ID
GET /api/students/get-student-by-id/1
Authorization: Bearer {admin_jwt_token}
# Expected: 200 OK with specific student details

# Test 2.3: Get Student by Email
GET /api/students/get-student-by-email/student.test@university.edu
Authorization: Bearer {admin_jwt_token}
# Expected: 200 OK with student details

# Test 2.4: Get Students by Capstone Type
GET /api/students/get-student-by-capstone-type/1
Authorization: Bearer {admin_jwt_token}
# Expected: 200 OK with students of specific capstone type

# Test 2.5: Update Student Information
PUT /api/students/update-student/1
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
{
  "studentCode": "SE999001",
  "fullName": "Updated Test Student",
  "faculty": "Information Technology",
  "major": "Software Engineering",
  "phone": "+84901234567",
  "gpa": 3.8,
  "capstoneType": 2
}
# Expected: 200 OK with updated student data

# Test 2.6: Import Students from Excel (Capstone 1)
POST /api/students/insert
Authorization: Bearer {admin_jwt_token}
Content-Type: multipart/form-data
ExcelFile: [students_capstone1.xlsx]
CapstoneType: 1
# Expected: 200 OK with import success/failure report

# Test 2.7: Import Students from Excel (Capstone 2 with Teams)
POST /api/students/insert
Authorization: Bearer {admin_jwt_token}
Content-Type: multipart/form-data
ExcelFile: [students_capstone2.xlsx]
CapstoneType: 2
# Expected: 200 OK with import and team creation report

# Test 2.8: Delete Student
DELETE /api/students/delete-student/1
Authorization: Bearer {admin_jwt_token}
# Expected: 200 OK with deletion confirmation
```

---

#### **👨‍🏫 Workflow 3: Lecturer Management (Full CRUD)**
```bash
# Test 3.1: Get All Lecturers
GET /api/lecturers/get-lecturers
Authorization: Bearer {admin_jwt_token}
# Expected: 200 OK with array of all lecturers

# Test 3.2: Get Lecturer by ID
GET /api/lecturers/get-lecturer-by-id/1
Authorization: Bearer {admin_jwt_token}
# Expected: 200 OK with specific lecturer details

# Test 3.3: Get Lecturer by Email
GET /api/lecturers/get-lecturer-by-email/lecturer.test@university.edu
Authorization: Bearer {admin_jwt_token}
# Expected: 200 OK with lecturer details

# Test 3.4: Update Lecturer Information
PUT /api/lecturers/update-lecturer/1
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
{
  "fullName": "Dr. Updated Lecturer Name",
  "department": "Information Technology",
  "phone": "+84901234567",
  "specialization": "Machine Learning & AI",
  "maxStudentsSupervised": 15,
  "academicTitle": "Professor"
}
# Expected: 200 OK with updated lecturer data

# Test 3.5: Import Lecturers from Excel
POST /api/lecturers/insert
Authorization: Bearer {admin_jwt_token}
Content-Type: multipart/form-data
ExcelFile: [lecturers.xlsx]
# Expected: 200 OK with import success/failure report

# Test 3.6: Delete Lecturer
DELETE /api/lecturers/delete-lecturer/1
Authorization: Bearer {admin_jwt_token}
# Expected: 200 OK with deletion confirmation
```

---

#### **👥 Workflow 4: Team Management (Complete Operations)**
```bash
# Test 4.1: Auto-Arrange Teams for Capstone 1
POST /api/teams/auto-arrange-capstone1
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
{
  "capstoneType": 1
}
# Expected: 200 OK with team creation report and balanced teams

# Test 4.2: Get Teams by Capstone Type
GET /api/teams/by-capstone-type/1
Authorization: Bearer {admin_jwt_token}
# Expected: 200 OK with array of teams for specific capstone type

# Test 4.3: Get Specific Team Details
GET /api/teams/1
Authorization: Bearer {admin_jwt_token}
# Expected: 200 OK with detailed team information

# Test 4.4: Create Team Manually
POST /api/teams/create
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
{
  "teamName": "Manual Test Team",
  "projectTitle": "Test Project",
  "studentIds": [1, 2, 3, 4, 5],
  "teamLeaderId": 1
}
# Expected: 200 OK with new team details

# Test 4.5: Update Team Information
PUT /api/teams/update/1
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
{
  "teamName": "Updated Team Name",
  "projectTitle": "Updated Project Title",
  "teamLeaderId": 2,
  "mentorId": 1,
  "status": "Active"
}
# Expected: 200 OK with updated team data

# Test 4.6: Get Unassigned Students
GET /api/teams/unassigned-students/1
Authorization: Bearer {admin_jwt_token}
# Expected: 200 OK with list of students without teams

# Test 4.7: Move Student Between Teams
POST /api/teams/move-student
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
{
  "studentId": 5,
  "targetTeamId": 2
}
# Expected: 200 OK with successful move confirmation

# Test 4.8: Swap Students Between Teams
POST /api/teams/swap-students
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
{
  "studentId1": 5,
  "studentId2": 10
}
# Expected: 200 OK with successful swap confirmation

# Test 4.9: Remove Student from Team
POST /api/teams/remove-student
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
{
  "studentId": 5
}
# Expected: 200 OK with successful removal confirmation

# Test 4.10: Assign Mentor to Team
POST /api/teams/assign-mentor
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
{
  "teamId": 1,
  "mentorId": 1
}
# Expected: 200 OK with successful mentor assignment

# Test 4.11: Remove Mentor from Team
POST /api/teams/remove-mentor
Authorization: Bearer {admin_jwt_token}
Content-Type: application/json
{
  "teamId": 1
}
# Expected: 200 OK with successful mentor removal

# Test 4.12: Get Mentor Workload Information
GET /api/teams/mentor-workload
Authorization: Bearer {admin_jwt_token}
# Expected: 200 OK with lecturer workload details

# Test 4.13: Get Teams Without Mentors
GET /api/teams/teams-without-mentor/1
Authorization: Bearer {admin_jwt_token}
# Expected: 200 OK with list of teams needing mentors

# Test 4.14: Delete Team
DELETE /api/teams/delete/1
Authorization: Bearer {admin_jwt_token}
# Expected: 200 OK with team deletion confirmation
```

---

#### **🔄 Workflow 5: End-to-End Integration Testing**
```bash
# Integration Test: Complete Capstone 1 Workflow
# Step 1: Import lecturers
POST /api/lecturers/insert (with Excel file)

# Step 2: Import students for Capstone 1
POST /api/students/insert (with Capstone1 Excel, CapstoneType: 1)

# Step 3: Auto-arrange teams
POST /api/teams/auto-arrange-capstone1

# Step 4: Verify team creation
GET /api/teams/by-capstone-type/1

# Step 5: Assign mentors to all teams
POST /api/teams/assign-mentor (for each team)

# Step 6: Verify mentor assignments
GET /api/teams/mentor-workload

# Integration Test: Complete Capstone 2 Workflow  
# Step 1: Import students with team information
POST /api/students/insert (with Capstone2 Excel including TeamCode)

# Step 2: Verify teams were auto-created
GET /api/teams/by-capstone-type/2

# Step 3: Make team adjustments if needed
POST /api/teams/move-student or POST /api/teams/swap-students

# Step 4: Assign mentors
POST /api/teams/assign-mentor
```

---

#### **🚨 Workflow 6: Error Testing & Edge Cases**
```bash
# Test 6.1: Authentication Errors
POST /api/auth/login
{
  "email": "wrong@email.com",
  "password": "wrongpass"
}
# Expected: 400 Bad Request with error message

# Test 6.2: Authorization Errors
GET /api/students/get-students
# (without Authorization header)
# Expected: 401 Unauthorized

# Test 6.3: Invalid Data Validation
POST /api/students/update-student/999
Authorization: Bearer {admin_jwt_token}
{
  "gpa": 5.0,  // Invalid GPA > 4.0
  "email": "invalid-email"
}
# Expected: 400 Bad Request with validation errors

# Test 6.4: Resource Not Found
GET /api/students/get-student-by-id/99999
Authorization: Bearer {admin_jwt_token}
# Expected: 404 Not Found

# Test 6.5: Excel Import Errors
POST /api/students/insert
Authorization: Bearer {admin_jwt_token}
ExcelFile: [invalid_format.xlsx]
CapstoneType: 1
# Expected: 400 Bad Request with detailed error report

# Test 6.6: Team Management Edge Cases
POST /api/teams/move-student
Authorization: Bearer {admin_jwt_token}
{
  "studentId": 1,
  "targetTeamId": 999  // Non-existent team
}
# Expected: 400 Bad Request with error message

# Test 6.7: Mentor Assignment Limits
POST /api/teams/assign-mentor
Authorization: Bearer {admin_jwt_token}
{
  "teamId": 1,
  "mentorId": 1  // Lecturer already has 5 teams
}
# Expected: 400 Bad Request with limit exceeded message
```

---

#### **📊 Workflow 7: Excel Import Testing Templates**

**Student Import Excel Format (9 columns):**
| StudentCode | FullName | Faculty | Major | Email | Phone | GPA | Password | TeamCode |
|-------------|----------|---------|-------|-------|-------|-----|----------|----------|
| SE210001 | John Doe | IT | Software Engineering | john@dtu.edu.vn | +84901234567 | 3.5 | john123 | TEAM001 |
| SE210002 | Jane Smith | IT | Software Engineering | jane@dtu.edu.vn | +84901234568 | 3.8 | jane123 | TEAM001 |

**Lecturer Import Excel Format:**
| FullName | Department | Email | Phone | Specialization | MaxStudentsSupervised | AcademicTitle | Password |
|----------|------------|-------|-------|----------------|----------------------|---------------|----------|
| Dr. John Professor | Computer Science | prof.john@dtu.edu.vn | +84901111111 | AI & ML | 10 | Professor | prof123 |

---

#### **🎯 Workflow 8: Performance & Load Testing**
```bash
# Test concurrent user registrations
for i in {1..10}; do
  curl -X POST "https://localhost:7110/api/auth/register/student" \
    -H "Authorization: Bearer {admin_jwt}" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"student$i@test.com\", \"password\":\"Pass123!\", \"studentCode\":\"SE00$i\", \"fullName\":\"Test Student $i\"}" &
done

# Test bulk team operations
curl -X POST "https://localhost:7110/api/teams/auto-arrange-capstone1" \
  -H "Authorization: Bearer {admin_jwt}" \
  -H "Content-Type: application/json" \
  -d "{\"capstoneType\": 1}"

# Monitor response times and system resource usage
```

---

#### **🔧 Workflow 9: Database & System Setup Testing**
```sql
-- Test database connection and initial setup
-- Run these SQL commands in SQL Server Management Studio

-- 1. Verify CapSys database exists
USE CapSys;
SELECT DB_NAME() as CurrentDatabase;

-- 2. Check all required tables exist
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- 3. Verify admin account exists
SELECT Id, Email, Role, CreatedAt 
FROM Accounts 
WHERE Email = 'vohtuankiet@dtu.edu.vn';

-- 4. Check database schema version
SELECT * FROM __EFMigrationsHistory 
ORDER BY MigrationId DESC;

-- 5. Test data integrity
SELECT 
    (SELECT COUNT(*) FROM Students) as StudentCount,
    (SELECT COUNT(*) FROM Lecturers) as LecturerCount,
    (SELECT COUNT(*) FROM Teams) as TeamCount,
    (SELECT COUNT(*) FROM Accounts) as AccountCount;
```

---

#### **✅ Workflow 10: API Health Check & Monitoring**
```bash
# Test 10.1: Application Health Check
GET /health
# Expected: 200 OK with system status

# Test 10.2: Database Connectivity Test
GET /api/health/database
Authorization: Bearer {admin_jwt_token}
# Expected: 200 OK with database connection status

# Test 10.3: Memory Usage Check
GET /api/health/memory
Authorization: Bearer {admin_jwt_token}
# Expected: 200 OK with memory usage statistics

# Test 10.4: API Response Time Testing
time curl -X GET "https://localhost:7110/api/students/get-students" \
  -H "Authorization: Bearer {admin_jwt}"
# Expected: Response time < 2 seconds for normal operations

# Test 10.5: Concurrent Request Testing
ab -n 100 -c 10 -H "Authorization: Bearer {admin_jwt}" \
  "https://localhost:7110/api/students/get-students"
# Expected: All requests successful, consistent response times
```

---

#### **🎯 Workflow 11: Complete System Validation Checklist**

**✅ Authentication & Authorization:**
- [ ] Admin login with correct credentials
- [ ] Student/Lecturer account registration
- [ ] JWT token generation and validation
- [ ] Password reset functionality
- [ ] Unauthorized access prevention
- [ ] Token refresh mechanism

**✅ User Management:**
- [ ] CRUD operations for students
- [ ] CRUD operations for lecturers
- [ ] Email uniqueness validation
- [ ] Data validation rules
- [ ] Search and filtering capabilities

**✅ Excel Import System:**
- [ ] Student import with team creation (Capstone 2)
- [ ] Student import without teams (Capstone 1)
- [ ] Lecturer import functionality
- [ ] Error handling for invalid data
- [ ] Duplicate prevention
- [ ] TeamCode-based grouping

**✅ Team Management:**
- [ ] Auto-arrange teams for Capstone 1
- [ ] Pre-arranged team creation for Capstone 2
- [ ] Team member management (add/remove/swap)
- [ ] Mentor assignment and removal
- [ ] Team leader designation
- [ ] Workload balancing

**✅ Data Integrity:**
- [ ] Foreign key relationships
- [ ] Data consistency across operations
- [ ] Transaction rollback on errors
- [ ] Unique constraint enforcement
- [ ] Cascade delete operations

**✅ Performance & Reliability:**
- [ ] Response time benchmarks
- [ ] Concurrent user handling
- [ ] Memory usage optimization
- [ ] Database query efficiency
- [ ] Error logging and monitoring
- [ ] Graceful error handling

**✅ Security:**
- [ ] Input validation and sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] JWT security implementation
- [ ] Password encryption (BCrypt)
- [ ] Role-based access control

---

#### **🚀 Quick Test Commands (Copy & Paste)**
```bash
# Complete System Test (Run in sequence)

# 1. Test authentication
curl -X POST "https://localhost:7110/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"vohtuankiet@dtu.edu.vn","password":"kiet123"}'

# 2. Test student operations (replace {JWT_TOKEN} with actual token)
curl -X GET "https://localhost:7110/api/students/get-students" \
  -H "Authorization: Bearer {JWT_TOKEN}"

# 3. Test lecturer operations
curl -X GET "https://localhost:7110/api/lecturers/get-lecturers" \
  -H "Authorization: Bearer {JWT_TOKEN}"

# 4. Test team operations
curl -X GET "https://localhost:7110/api/teams/by-capstone-type/1" \
  -H "Authorization: Bearer {JWT_TOKEN}"

# 5. Test auto-arrange functionality
curl -X POST "https://localhost:7110/api/teams/auto-arrange-capstone1" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"capstoneType":1}'
```

#### **🎪 Testing Tools Recommendations**
- **Swagger UI**: `https://localhost:7110/swagger` (Built-in interactive API documentation)
- **Postman**: Import OpenAPI spec for automated testing collections
- **Thunder Client** (VS Code): Lightweight API testing within editor
- **curl**: Command-line testing for automation scripts
- **Apache Bench (ab)**: Performance and load testing
- **SQL Server Management Studio**: Database verification and debugging

---

### 🔧 Expected Responses

#### **Success Cases**
# Step 1: Login as admin
POST /api/auth/login (admin credentials)

# Step 2: Import lecturers from Excel first (optional)
POST /api/lecturers/insert
  Header: Authorization: Bearer {admin_jwt_token}
  Body: FormData with ExcelFile (.xlsx/.xls)

# Step 3: Import students from Excel with Capstone Type
POST /api/students/insert
  Header: Authorization: Bearer {admin_jwt_token}
  Body: FormData with ExcelFile and CapstoneType

# Step 4: Auto-arrange teams for Capstone 1 students
POST /api/teams/auto-arrange-capstone1
  Header: Authorization: Bearer {admin_jwt_token}
  Body: {"capstoneType": 1}

# Step 5: View created teams
GET /api/teams/by-capstone-type/1
  Header: Authorization: Bearer {admin_jwt_token}

# Step 6: Manual team adjustments (if needed)
POST /api/teams/move-student
  Header: Authorization: Bearer {admin_jwt_token}
  Body: {"studentId": 10, "targetTeamId": 5}

# Step 7: Assign mentors to teams (from imported lecturers)
POST /api/teams/assign-mentor
  Header: Authorization: Bearer {admin_jwt_token}
  Body: {"teamId": 1, "mentorId": 5}
```

#### **Workflow 7: Complete Team Management Flow**
```bash
# Step 1: Login as admin
POST /api/auth/login (admin credentials)

# Step 2: Get unassigned students for specific capstone type
GET /api/teams/unassigned-students/2
  Header: Authorization: Bearer {admin_jwt_token}

# Step 3: Create team manually
POST /api/teams/create
  Header: Authorization: Bearer {admin_jwt_token}
  Body: {
    "teamName": "Custom Team",
    "studentIds": [1, 2, 3, 4, 5],
    "teamLeaderId": 1
  }

# Step 4: Update team information
PUT /api/teams/update/1
  Header: Authorization: Bearer {admin_jwt_token}
  Body: {"teamName": "Updated Team Name", "projectTitle": "New Project"}

# Step 5: Swap students between teams
POST /api/teams/swap-students
  Header: Authorization: Bearer {admin_jwt_token}
  Body: {"studentId1": 10, "studentId2": 15}

# Step 6: Remove student from team
POST /api/teams/remove-student
  Header: Authorization: Bearer {admin_jwt_token}
  Body: {"studentId": 20}

# Step 7: Delete team (if needed)
DELETE /api/teams/delete/5
  Header: Authorization: Bearer {admin_jwt_token}

# Step 8: Check mentor workload
GET /api/teams/mentor-workload
  Header: Authorization: Bearer {admin_jwt_token}

# Step 9: Find teams without mentors
GET /api/teams/teams-without-mentor/1
  Header: Authorization: Bearer {admin_jwt_token}

# Step 10: Assign mentor to team
POST /api/teams/assign-mentor
  Header: Authorization: Bearer {admin_jwt_token}
  Body: {"teamId": 5, "mentorId": 3}

# Step 11: Remove mentor from team (if needed)
POST /api/teams/remove-mentor
  Header: Authorization: Bearer {admin_jwt_token}
  Body: {"teamId": 5}
```

### 🛠️ Testing Tools

#### **1. Swagger UI** (Recommended for beginners)
- **URL**: `https://localhost:7110/swagger`
- ✅ Interactive UI
- ✅ Auto JSON formatting
- ✅ Built-in authentication handling

#### **2. Postman/Thunder Client**
Example requests:
```javascript
// Login
POST https://localhost:7110/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

// Get Profile (with token)
GET https://localhost:7110/api/auth/profile
Authorization: Bearer {{jwt_token}}

// Get all students (admin only)
GET https://localhost:7110/api/students/get-students
Authorization: Bearer {{admin_jwt_token}}

// Get all lecturers (admin only)
GET https://localhost:7110/api/lecturers/get-lecturers
Authorization: Bearer {{admin_jwt_token}}

// Update lecturer information
PUT https://localhost:7110/api/lecturers/update-lecturer/1
Authorization: Bearer {{admin_jwt_token}}
Content-Type: application/json

{
  "fullName": "TS. Nguyễn Văn B Updated",
  "department": "Công nghệ thông tin",
  "specialization": "Machine Learning"
}

// Import students with Capstone Type
POST https://localhost:7110/api/students/insert
Authorization: Bearer {{admin_jwt_token}}
Content-Type: multipart/form-data

ExcelFile: students.xlsx
CapstoneType: 1

// Import lecturers from Excel
POST https://localhost:7110/api/lecturers/insert
Authorization: Bearer {{admin_jwt_token}}
Content-Type: multipart/form-data

ExcelFile: lecturers.xlsx

// Auto-arrange Capstone 1 teams
POST https://localhost:7110/api/teams/auto-arrange-capstone1
Authorization: Bearer {{admin_jwt_token}}
Content-Type: application/json

{
  "capstoneType": 1
}

// Get teams by capstone type
GET https://localhost:7110/api/teams/by-capstone-type/1
Authorization: Bearer {{admin_jwt_token}}

// Create team manually
POST https://localhost:7110/api/teams/create
Authorization: Bearer {{admin_jwt_token}}
Content-Type: application/json

{
  "teamName": "Custom Team Alpha",
  "projectTitle": "Mobile App Development",
  "studentIds": [10, 15, 20, 25, 30],
  "teamLeaderId": 15
}

// Update team
PUT https://localhost:7110/api/teams/update/1
Authorization: Bearer {{admin_jwt_token}}
Content-Type: application/json

{
  "teamName": "Updated Team Name",
  "projectTitle": "New Project Title",
  "teamLeaderId": 20
}

// Move student to another team
POST https://localhost:7110/api/teams/move-student
Authorization: Bearer {{admin_jwt_token}}
Content-Type: application/json

{
  "studentId": 25,
  "targetTeamId": 5
}

// Swap students between teams
POST https://localhost:7110/api/teams/swap-students
Authorization: Bearer {{admin_jwt_token}}
Content-Type: application/json

{
  "studentId1": 10,
  "studentId2": 15
}

// Remove student from team
POST https://localhost:7110/api/teams/remove-student
Authorization: Bearer {{admin_jwt_token}}
Content-Type: application/json

{
  "studentId": 20
}

// Get unassigned students
GET https://localhost:7110/api/teams/unassigned-students/1
Authorization: Bearer {{admin_jwt_token}}

// Delete team
DELETE https://localhost:7110/api/teams/delete/5
Authorization: Bearer {{admin_jwt_token}}
```

#### **3. curl Commands**
```bash
# Login
curl -X POST "https://localhost:7110/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -k

# Import Students with Capstone Type (requires admin token and multipart form)
curl -X POST "https://localhost:7110/api/students/insert" \
  -H "Authorization: Bearer {admin_jwt_token}" \
  -F "ExcelFile=@students.xlsx" \
  -F "CapstoneType=1" \
  -k

# Import Lecturers from Excel
curl -X POST "https://localhost:7110/api/lecturers/insert" \
  -H "Authorization: Bearer {admin_jwt_token}" \
  -F "ExcelFile=@lecturers.xlsx" \
  -k

# Auto-arrange Capstone 1 teams
curl -X POST "https://localhost:7110/api/teams/auto-arrange-capstone1" \
  -H "Authorization: Bearer {admin_jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{"capstoneType":1}' \
  -k

# Get teams by capstone type
curl -X GET "https://localhost:7110/api/teams/by-capstone-type/1" \
  -H "Authorization: Bearer {admin_jwt_token}" \
  -k

# Create team manually
curl -X POST "https://localhost:7110/api/teams/create" \
  -H "Authorization: Bearer {admin_jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{"teamName":"Custom Team","studentIds":[1,2,3,4,5],"teamLeaderId":1}' \
  -k

# Move student to another team
curl -X POST "https://localhost:7110/api/teams/move-student" \
  -H "Authorization: Bearer {admin_jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{"studentId":25,"targetTeamId":5}' \
  -k
```

### ⚙️ Prerequisites

#### **Environment Setup**
1. **Database**: SQL Server with connection string configured
2. **Email Service**: SMTP settings in `appsettings.json`
3. **Redis**: For password reset codes (optional but recommended)

#### **Configuration Examples**
```json
// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=CapSysDB;Trusted_Connection=true;TrustServerCertificate=true;",
    "Redis": "localhost:6379"
  },
  "JWT": {
    "Secret": "your-secret-key-here",
    "Issuer": "CapSys",
    "Audience": "CapSys-Users",
    "ExpirationInMinutes": 5,
    "RefreshTokenExpirationInDays": 7
  },
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587",
    "Username": "your-email@gmail.com",
    "Password": "your-app-password",
    "FromEmail": "noreply@capsys.com",
    "FromName": "CapSys System"
  }
}
```

### 🚨 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Missing/Invalid JWT | Verify Authorization header format |
| 400 Bad Request | Invalid request format | Check JSON structure and required fields |
| 500 Internal Error | Database/Service error | Check database connection and logs |
| Email not sent | SMTP configuration | Verify email settings and credentials |
| Import failed | Excel format issues | Check file format and column structure |

### ✅ Expected Results

#### **Success Cases**
- ✅ Login with valid credentials → JWT tokens returned
- ✅ Protected endpoints with valid JWT → Data returned
- ✅ Password reset with valid code → Password updated
- ✅ Admin registration → New accounts created
- ✅ Excel import with capstone type → Students imported with success/error summary
- ✅ Lecturer Excel import → Lecturers imported with automatic account creation
- ✅ Auto-arrange Capstone 1 teams → Teams created with balanced GPA distribution
- ✅ Student management → CRUD operations successful
- ✅ Lecturer management → CRUD operations successful
- ✅ Team management → CRUD operations successful
- ✅ Get students/lecturers/teams → List of records returned
- ✅ Update student/lecturer/team → Updated data returned
- ✅ Move/swap students between teams → Team assignments updated
- ✅ Get unassigned students → List of students without teams

#### **Error Cases**
- ❌ Invalid credentials → 400 with error message
- ❌ Expired JWT → 401 Unauthorized
- ❌ Missing admin role → 403 Forbidden
- ❌ Invalid file format → 400 with validation error
- ❌ Duplicate data → 400 with specific error details
- ❌ Invalid ID → 400 "Invalid ID" error
- ❌ Not found → 404 "Record not found" error
- ❌ Empty update data → 400 "At least one field must be provided" error
- ❌ Invalid capstone type → 400 "Invalid capstone type" error
- ❌ Team full → 400 "Target team is full (maximum 5 students per team)" error
- ❌ Student already in team → 400 "Some students are already assigned to a team" error
- ❌ Auto-arrange wrong capstone → 400 "Auto arrange is only available for Capstone 1" error

---

## 📚 Additional Resources

### 🔗 Important Links
- **Swagger UI**: `https://localhost:7110/swagger`
- **Base URL**: `https://localhost:7110/api`
- **Health Check**: `https://localhost:7110/health` (if implemented)

### 📖 Documentation Standards
- **Authentication**: JWT Bearer Token
- **Content-Type**: `application/json` (except file uploads)
- **File Uploads**: `multipart/form-data`
- **Date Format**: ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)

### 🎯 Team Management Workflow Guide

#### **For Capstone 1 (Auto-Arrangement)**
1. **Import Students**: Use `/api/students/insert` with `CapstoneType: 1` (no team info needed)
2. **Auto-Arrange**: Call `/api/teams/auto-arrange-capstone1` to create balanced teams by GPA
3. **Review Results**: Check created teams and unassigned students
4. **Manual Adjustments**: Use move/swap/remove APIs to fine-tune teams
5. **Assign Mentors**: Use `/api/teams/assign-mentor` to assign lecturers

#### **For Capstone 2 & Research (Pre-Arranged with Excel)**
1. **Prepare Excel**: Include TeamCode (Column I) for each student
2. **Import Students**: Use `/api/students/insert` with `CapstoneType: 2 or 3` - **teams are created automatically**
3. **Review Teams**: Check created teams using `/api/teams/by-capstone-type/{type}`
4. **Manual Adjustments**: Use team management APIs if needed (move/swap/remove students)  
5. **Assign Mentors**: Use `/api/teams/assign-mentor` to assign lecturers

#### **🆕 Key Difference**: 
- **Capstone 1**: Import students → Auto-arrange → Manual adjustments
- **Capstone 2/Research**: Import students with team info → Teams created automatically → Manual adjustments

#### **Team Management Best Practices**
- Always check unassigned students after import/arrangement
- Validate team balance (max 5 students per team)
- Ensure team leaders are appropriate (usually highest GPA)
- Monitor team status and project assignments
- Use swap function to balance teams after initial arrangement

### 🤖 Auto-Arrangement Algorithm Details

The auto-arrangement for Capstone 1 uses a sophisticated GPA-based balancing algorithm:

1. **GPA Classification**:
   - **Excellent**: GPA ≥ 3.6 (Xuất sắc)
   - **Good**: 3.2 ≤ GPA < 3.6 (Giỏi)
   - **Fair**: 2.5 ≤ GPA < 3.2 (Khá)
   - **Average**: 2.0 ≤ GPA < 2.5 (Trung bình)
   - **Others**: GPA < 2.0 or null (Còn lại)

2. **Team Formation Strategy**:
   - Each team gets 1 student from each GPA tier (first 4 members)
   - 5th member is randomly selected from remaining students
   - Teams are created in order of available students
   - Remaining students after team formation are marked as unassigned

3. **Team Leadership**:
   - Team leader is automatically assigned to the highest GPA student in each team
   - Team names follow format: "Team X - Capstone 1"
   - All teams start with "Active" status

### 🚀 Deployment Notes
- Configure connection strings for production
- Set up proper SSL certificates
- Configure SMTP service for email functionality
- Set up Redis for caching (recommended)
- Configure logging providers
- Set up health checks and monitoring
- Ensure database supports the Team Management schema
- Configure appropriate JWT token expiration for admin operations

### 🔄 Version History
- **v1.0**: Initial API implementation
  - Authentication system
  - Student/Lecturer registration
  - Basic Excel import functionality
  - Password reset with email verification
- **v1.1**: Student & Lecturer Management
  - Complete CRUD operations for Students
  - Complete CRUD operations for Lecturers
  - Advanced filtering and search capabilities
  - Standardized API response format
  - Enhanced error handling and validation
- **v1.2**: Team Management & Auto Arrangement System
  - Complete Team Management CRUD operations
  - Auto-arrange teams for Capstone 1 by GPA algorithm
  - Student import with Capstone Type selection (1, 2, 3)
  - Advanced team manipulation (move, swap, remove students)
  - Support for different capstone workflows:
    - Capstone 1: Auto-arrange + manual editing
    - Capstone 2: Manual team management (pre-arranged)
    - Research: Manual team management (pre-arranged)
  - Enhanced student data model with team information
  - Unassigned students tracking and management
- **v1.3**: Lecturer Mentor Assignment System
  - Mentor assignment to teams with business rule validation
  - Maximum 5 teams per lecturer constraint enforcement
  - Enhanced UpdateTeam endpoint with mentor assignment capability
  - Detailed mentor workload tracking with complete team information
  - Teams without mentor identification by capstone type
  - Complete mentor management operations (assign/remove)
  - Enhanced team data model with mentor relationships
  - Comprehensive mentor validation in all team operations
- **v1.4**: Complete Excel Import System
  - Full lecturer Excel import functionality with validation
  - Enhanced Excel parsing with comprehensive error handling
  - Bulk data import with transaction support and rollback capability
  - Auto-generated accounts with default passwords for imported data
  - Detailed import reports with row-level error feedback
  - Support for both student and lecturer Excel import workflows
  - Improved column mapping for accurate data extraction
  - File format validation and size limits enforcement
- **v1.5**: Pre-Arranged Team Import for Capstone 2 & Research
  - Excel-based team creation for Capstone 2 and Research workflows
  - Automatic team formation from TeamCode column during student import
  - Enhanced Excel format with TeamCode column (9 columns total)
  - Team leader auto-assignment based on highest GPA within each team
  - Comprehensive validation for team data during import process
  - Seamless integration with existing manual team management APIs
  - Support for mixed workflow: pre-arranged import + manual adjustments

---

## 📞 Support

For technical support or questions about the API:
- Check the Swagger documentation first
- Review error messages and status codes
- Ensure all prerequisites are properly configured
- Verify request format and authentication headers

*This documentation covers all available endpoints in the CapSys-Backend API system.*