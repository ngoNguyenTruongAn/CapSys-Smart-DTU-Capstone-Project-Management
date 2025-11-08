import csv
import random
try:
    from faker import Faker
except ImportError:
    print("Thư viện 'Faker' chưa được cài đặt. Đang tiến hành cài đặt...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "faker"])
    from faker import Faker

# Khởi tạo Faker để tạo dữ liệu tiếng Việt
fake = Faker('vi_VN')

# Các danh sách dữ liệu mẫu
faculties_majors = {
    'Công nghệ Thông tin': ['Kỹ thuật phần mềm', 'Khoa học máy tính', 'An toàn thông tin', 'Hệ thống thông tin'],
    'Kinh tế': ['Quản trị kinh doanh', 'Kế toán', 'Marketing', 'Tài chính - Ngân hàng'],
    'Kỹ thuật': ['Kỹ thuật Điện', 'Kỹ thuật Cơ khí', 'Kỹ thuật Xây dựng', 'Kỹ thuật Ô tô'],
    'Ngoại ngữ': ['Ngôn ngữ Anh', 'Ngôn ngữ Nhật', 'Ngôn ngữ Hàn', 'Ngôn ngữ Trung'],
    'Luật': ['Luật Kinh tế', 'Luật Dân sự', 'Luật Quốc tế'],
    'Y Dược': ['Y Đa khoa', 'Dược học', 'Răng - Hàm - Mặt']
}
capstone_types = ['Nghiên cứu khoa học', 'Dự án thực tế', 'Chuyên đề tốt nghiệp']
faculties = list(faculties_majors.keys())

# Tên file output
filename = 'danh_sach_sinh_vien.csv'

# Danh sách tiêu đề
headers = ['StudentCode', 'FullName', 'Faculty', 'Major', 'Phone', 'GPA', 'CapstoneType', 'Email', 'TeamCode']

# Bắt đầu tạo dữ liệu
data = []
for i in range(1, 201):
    student_code = f'SV{i:03d}' # Tạo mã SV dạng SV001, SV002...
    full_name = fake.name()
    
    # Chọn khoa và chuyên ngành ngẫu nhiên
    faculty = random.choice(faculties)
    major = random.choice(faculties_majors[faculty])
    
    # Tạo SĐT ngẫu nhiên 10 số
    phone = f'0{random.choice([3, 5, 7, 8, 9])}{random.randint(10000000, 99999999)}'
    
    # Tạo GPA ngẫu nhiên
    gpa = round(random.uniform(2.20, 3.95), 2)
    
    capstone_type = random.choice(capstone_types)
    
    # Tạo email theo mã sinh viên
    email = f'{student_code.lower()}@sv.truong.edu.vn'
    
    # Giả lập 50 nhóm (mỗi nhóm ~4 người)
    team_code = f'Nhom{random.randint(1, 50):02d}'
    
    data.append([student_code, full_name, faculty, major, phone, gpa, capstone_type, email, team_code])

# Ghi dữ liệu ra file CSV
# Dùng 'utf-8-sig' để Excel đọc file tiếng Việt không bị lỗi font
with open(filename, 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.writer(f)
    writer.writerow(headers) # Ghi dòng tiêu đề
    writer.writerows(data)    # Ghi 200 dòng dữ liệu

print(f"Đã tạo file '{filename}' thành công với 200 sinh viên.")
print("Bạn có thể mở file này trực tiếp bằng Excel.")