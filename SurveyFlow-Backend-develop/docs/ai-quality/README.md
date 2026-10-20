# AI Quality Check V1

AI Quality Check là REST API Python chấm **tín hiệu thời gian** của một lượt trả lời khảo sát. Điểm chỉ phục vụ theo dõi và phân tích; API này không xác minh lượt tham gia hoặc quyết định Credits.

Hiện đã có Python API. Phần Spring Boot gọi API và lưu kết quả vào `quality_scores` chưa được tích hợp.

## Tài liệu

1. [Business rules](./01-business-rules.md): dữ liệu đầu vào và quy tắc chấm điểm.
2. [State transitions](./02-state-transitions.md): ý nghĩa của các trạng thái điểm.
3. [Business flows](./03-business-flows.md): luồng hiện có và điểm nối dự kiến với Spring Boot.
4. [API contract](./04-api-contract.md): endpoint và ví dụ request/response.

Xem [README của Python service](../../ai-quality/README.md) để chạy ứng dụng và test.
