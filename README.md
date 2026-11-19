# FU-EOS Kỳ 3 - Ôn Thi Trắc Nghiệm & Mock Exam

Ứng dụng web ôn tập trắc nghiệm, thẻ ghi nhớ (Flashcards) và thi thử giao diện Safe Exam Browser (SEB) dành cho các môn học Kỳ 3 - Đại học FPT.

## Tổng quan ngân hàng câu hỏi

| Mã môn | Số lượng câu hỏi | Ghi chú hình ảnh |
| --- | ---: | --- |
| **CSD203** | 409 | Slide đính kèm (`SEMESTER_3_CSD203/`) |
| **DBI202** | 374 | Slide đính kèm (`SEMESTER_3_DBI202/`) |
| **IAO202** | 316 | Slide đính kèm (`SEMESTER_3_IAO202/`) |
| **NWC303** | 269 | Slide đính kèm (`SEMESTER_3_NWC303/`) |
| **JPD113** | 226 | Slide đính kèm (`SEMESTER_3_JPD113/`) |
| **Tổng cộng** | **1,594** | |

## Tính năng chính

- **Dashboard**: Thống kê tiến độ ôn tập, số câu đã làm, tỷ lệ chính xác theo từng học phần và truy cập nhanh các chế độ học.
- **Study**: Luyện tập theo từng môn học kèm bộ lọc, tìm kiếm, đáp án giải thích và hiển thị hình ảnh slide câu hỏi trực tiếp.
- **Thi thử SEB**: Giả lập môi trường làm bài thi thử với giao diện Safe Exam Browser (đồng hồ đếm ngược, bảng điều hướng câu hỏi, đánh dấu câu).
- **FE - Test**: Chế độ luyện đề thi kết thúc học phần (Final Exam) sát với cấu trúc bài thi thực tế.
- **Flashcards**: Ôn tập nhanh theo thẻ ghi nhớ kèm xem trước hình ảnh slide và lật thẻ hỏi/đáp.
- **Câu sai**: Tự động lưu danh sách câu trả lời sai để ôn luyện lại có trọng tâm.

- **Tổng quan (`/`)**: Hiển thị thống kê số lượng câu hỏi đã học, số câu cần ôn lại, số câu đã đánh dấu và lịch sử điểm thi thử theo từng môn.
- **Học theo chủ đề (`/study`)**: Làm từng câu hỏi theo môn học, chủ đề và mức độ khó. Hiển thị đáp án đúng, giải thích chi tiết và cho phép đánh dấu trạng thái câu hỏi.
- **Thẻ ghi nhớ (`/flashcards`)**: Lật thẻ để xem câu hỏi ở mặt trước và đáp án kèm giải thích ở mặt sau. Hỗ trợ trộn thứ tự thẻ và điều khiển bằng phím Space, Mũi tên Trái/Phải.
- **Ngân hàng câu hỏi (`/questions`)**: Tìm kiếm câu hỏi theo từ khóa, lọc theo môn học, chủ đề, độ khó và trạng thái học tập.
- **Thi thử (`/exam`)**: Tạo bài kiểm tra ngẫu nhiên theo môn học với số lượng câu hỏi (10, 25, 40, 50 câu) và thời gian đếm ngược (15, 30, 45, 60 phút). Tự động chấm điểm và lưu kết quả sau khi nộp bài.

Toàn bộ tiến độ học tập và lịch sử bài thi được lưu trực tiếp trên trình duyệt thông qua LocalStorage.

## Cấu trúc thư mục

```text
Website-FE-Semester3_IA/
├── data/
│   └── questions.json        # Ngân hàng 1,594 câu hỏi cho 5 môn học
├── SEMESTER_3_CSD203/        # 409 ảnh slide môn CSD203
├── SEMESTER_3_DBI202/        # 374 ảnh slide môn DBI202
├── SEMESTER_3_IAO202/        # 316 ảnh slide môn IAO202
├── SEMESTER_3_NWC303/        # 269 ảnh slide môn NWC303
├── SEMESTER_3_JPD113/        # 226 ảnh slide môn JPD113
├── index.html                # Giao diện chính ứng dụng
├── style.css                 # Stylesheet
├── app.js                    # Logic ứng dụng frontend
├── server.mjs                # HTTP server tĩnh & SPA fallback cho localhost
├── start.sh                  # Script khởi chạy nhanh (bash)
├── package.json              # Cấu hình npm scripts
├── .gitignore
└── README.md
```

## 3. Chạy ứng dụng trên máy cá nhân

Yêu cầu **Node.js** (khuyến nghị bản LTS trở lên):

```bash
node server.mjs
```

Hoặc dùng npm / bash script:

```bash
npm start
# hoặc
./start.sh
```

Mặc định server chạy tại `http://127.0.0.1:3000` (có thể tùy chỉnh qua biến môi trường `PORT` và `HOST`).
