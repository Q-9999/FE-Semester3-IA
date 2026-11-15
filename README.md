# FU-EOS Kỳ 3 - Ôn Thi Trắc Nghiệm & Mock Exam

Ứng dụng web ôn tập trắc nghiệm, thẻ ghi nhớ (Flashcards) và thi thử giao diện Safe Exam Browser (SEB) dành cho các môn học Kỳ 3 - Đại học FPT.

## Tổng quan ngân hàng câu hỏi

| Mã môn | Số lượng câu hỏi | Ghi chú hình ảnh |
| --- | ---: | --- |
| **CSD203** | 409 | — |
| **DBI202** | 374 | Slide đính kèm (`SEMESTER_3_DBI202/`) |
| **IAO202** | 316 | Slide đính kèm (`SEMESTER_3_IAO202/`) |
| **NWC303** | 269 | — |
| **JPD113** | 226 | — |
| **Tổng cộng** | **1,594** | |

## Tính năng chính

- **Dashboard**: Thống kê tiến độ ôn tập, số câu đã làm, tỷ lệ chính xác theo từng học phần và truy cập nhanh các chế độ học.
- **Study**: Luyện tập theo từng môn học kèm bộ lọc, tìm kiếm, đáp án giải thích và hiển thị hình ảnh slide câu hỏi trực tiếp.
- **Thi thử SEB**: Giả lập môi trường làm bài thi thử với giao diện Safe Exam Browser (đồng hồ đếm ngược, bảng điều hướng câu hỏi, đánh dấu câu).
- **FE - Test**: Chế độ luyện đề thi kết thúc học phần (Final Exam) sát với cấu trúc bài thi thực tế.
- **Flashcards**: Ôn tập nhanh theo thẻ ghi nhớ kèm xem trước hình ảnh slide và lật thẻ hỏi/đáp.
- **Câu sai**: Tự động lưu danh sách câu trả lời sai để ôn luyện lại có trọng tâm.

## Cấu trúc thư mục

```text
Website-FE-Semester3_IA/
├── data/
│   └── questions.json        # Ngân hàng 1,594 câu hỏi cho 5 môn học
├── SEMESTER_3_DBI202/        # 374 ảnh slide môn DBI202
├── SEMESTER_3_IAO202/        # 316 ảnh slide môn IAO202
├── index.html                # Giao diện chính ứng dụng
├── style.css                 # Stylesheet
├── app.js                    # Logic ứng dụng frontend
├── server.mjs                # HTTP server tĩnh & SPA fallback cho localhost
├── start.sh                  # Script khởi chạy nhanh (bash)
├── package.json              # Cấu hình npm scripts
├── vercel.json               # Cấu hình deploy static & SPA rewrites trên Vercel
├── .gitignore
└── README.md
```

## Chạy trên máy (Localhost)

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

## Deploy lên Vercel

Repository hỗ trợ deploy trực tiếp lên Vercel ở thư mục gốc thông qua [vercel.json](./vercel.json) (`outputDirectory: "."` và SPA rewrites cho các route không phải file tĩnh hoặc `/data/`).
