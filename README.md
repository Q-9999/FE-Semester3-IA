# 

Ứng dụng web tĩnh hỗ trợ ôn tập và làm bài kiểm tra trắc nghiệm cho 5 môn học kỳ 3 tại Đại học FPT.

## 1. Dữ liệu câu hỏi

Hệ thống bao gồm 1,594 câu hỏi trắc nghiệm có đáp án và giải thích, chia theo 5 môn học:

| Mã môn | Tên môn học | Số lượng câu hỏi |
| :--- | :--- | ---: |
| CSD203 | Data Structures and Algorithms (Python) | 409 |
| DBI202 | Introduction to Databases (SQL) | 374 |
| IAO202 | Information Assurance Operations | 316 |
| NWC303 | Computer Networking | 269 |
| JPD113 | Elementary Japanese 3 | 226 |

## 2. Chức năng chính

- **Tổng quan (`/`)**: Hiển thị thống kê số lượng câu hỏi đã học, số câu cần ôn lại, số câu đã đánh dấu và lịch sử điểm thi thử theo từng môn.
- **Học theo chủ đề (`/study`)**: Làm từng câu hỏi theo môn học, chủ đề và mức độ khó. Hiển thị đáp án đúng, giải thích chi tiết và cho phép đánh dấu trạng thái câu hỏi.
- **Thẻ ghi nhớ (`/flashcards`)**: Lật thẻ để xem câu hỏi ở mặt trước và đáp án kèm giải thích ở mặt sau. Hỗ trợ trộn thứ tự thẻ và điều khiển bằng phím Space, Mũi tên Trái/Phải.
- **Ngân hàng câu hỏi (`/questions`)**: Tìm kiếm câu hỏi theo từ khóa, lọc theo môn học, chủ đề, độ khó và trạng thái học tập.
- **Thi thử (`/exam`)**: Tạo bài kiểm tra ngẫu nhiên theo môn học với số lượng câu hỏi (10, 25, 40, 50 câu) và thời gian đếm ngược (15, 30, 45, 60 phút). Tự động chấm điểm và lưu kết quả sau khi nộp bài.

Toàn bộ tiến độ học tập và lịch sử bài thi được lưu trực tiếp trên trình duyệt thông qua LocalStorage.


## 3. Chạy ứng dụng trên máy cá nhân

Yêu cầu máy tính đã cài đặt Node.js. Mở terminal tại thư mục dự án và chạy:

```bash
npm run dev
```

Sau đó mở trình duyệt tại địa chỉ `http://localhost:3000`.

