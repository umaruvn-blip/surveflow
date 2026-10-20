# State transitions — AI Quality Check V1

`status` trong response là **kết quả phân loại của một lần chấm**, không phải trạng thái vòng đời của `survey_participations`. Python service hiện không lưu trạng thái và không tự chuyển trạng thái participation.

| Điều kiện | `status` | `reason_codes` |
| --- | --- | --- |
| Thiếu `estimated_duration_seconds` | `REVIEW` | `ESTIMATED_DURATION_MISSING` |
| Thời gian hoàn thành dưới 30% thời lượng dự kiến | `VERY_LOW` | `COMPLETION_TOO_FAST` |
| Từ 30% đến dưới 70% | `REVIEW` | `COMPLETION_TIME_REVIEW` |
| Từ 70% trở lên | `GOOD` | `COMPLETION_TIME_OK` |

Mỗi request hợp lệ tạo một kết quả mới theo dữ liệu được gửi. Không có luồng `GOOD → REVIEW` hay `REVIEW → VERY_LOW` được quản lý trong Python service. Việc xác minh participation và phát Credits thuộc luồng Survey của Spring Boot.
