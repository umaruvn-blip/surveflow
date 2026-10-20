# AI Matching Documentation

| Thuộc tính | Giá trị |
|---|---|
| Phiên bản | V1 |
| Domain | AI Matching & Survey Recommendation |

## Mục tiêu và phạm vi

Bộ tài liệu này định nghĩa nghiệp vụ hệ thống **Gợi ý khảo sát thông minh (AI Matching V1)**, bao gồm:

- Gợi ý khảo sát cá nhân hóa cho người dùng dựa trên độ tương đồng ngữ nghĩa (*Semantic Similarity*) giữa hồ sơ người dùng (*User Profile & Interests*) và nội dung khảo sát (*Survey Metadata & Target Interests*).
- Kiến trúc microservice phân tách giữa Spring Boot Backend (Core Business) và Python FastAPI Service (AI Inference Engine).
- Chuẩn hóa và tổng hợp dữ liệu văn bản (*Text Representation*) từ nhiều nguồn dữ liệu trước khi vector hóa.
- Mô hình nhúng ngôn ngữ (*Sentence Transformers*) và thuật toán tính độ tương đồng Cosine (*Cosine Similarity*).
- Cơ chế chịu lỗi và phục hồi tự động (*Graceful Degradation & Fallback*) khi dịch vụ AI ngoại tuyến hoặc quá thời gian phản hồi (*timeout*).
- Kiểm tra sức khỏe (*Health Check*) và giám sát trạng thái tải mô hình AI.

Ngoài phạm vi V1:

- Tái sắp xếp kết quả (*Re-ranking*) dựa trên lịch sử tương tác sâu (click rate, dwell time, tỷ lệ bỏ dở form).
- Tự động học và tinh chỉnh (*Fine-tuning*) mô hình embedding trên tập dữ liệu riêng của Survey Flow.
- Cơ sở dữ liệu vector chuyên dụng trong thời gian thực (*Vector Database như Milvus, Pinecone, pgvector*).
- Tìm kiếm lai (*Hybrid Search*) kết hợp từ khóa BM25 và ngữ nghĩa vector.
- Gợi ý phân bổ ngân sách tối ưu cho Creator dựa trên AI.

## Actor

- **Participant**: người dùng đăng nhập nhận danh sách khảo sát được đề xuất phù hợp nhất với sở thích và thông tin cá nhân.
- **Creator**: người tạo khảo sát cung cấp tiêu đề, mô tả và target interests để mô hình AI nhận diện ngữ nghĩa chính xác.
- **SurveyFlow Backend (Spring Boot)**: tổng hợp dữ liệu text của user và survey, gọi AI Matching microservice, xử lý fallback và định dạng dữ liệu trả về API.
- **AI Matching Service (Python FastAPI)**: engine nhúng và so khớp vector ngữ nghĩa, xử lý mã hóa văn bản và tính điểm độ tương đồng.
- **System**: kiểm tra sức khỏe service, quản lý timeout kết nối và tự động fallback sang danh sách khảo sát mặc định.

## Thuật ngữ

- **Embedding (Vector nhúng)**: biểu diễn toán học dạng vector đa chiều (384 chiều) chứa thông tin ngữ nghĩa của văn bản.
- **Sentence Transformers**: thư viện và kiến trúc mạng neural chuyên sâu (`all-MiniLM-L6-v2`) dùng để trích xuất sentence embeddings chất lượng cao.
- **Cosine Similarity (Độ tương đồng Cosine)**: chỉ số đo góc giữa hai vector trong không gian nhiều chiều, có giá trị từ $[-1.0, 1.0]$ biểu thị mức độ tương đồng về mặt ngữ nghĩa.
- **Match Score**: điểm số tương đồng được chuẩn hóa và làm tròn (4 chữ số thập phân) trả về cho client.
- **Top-K / Limit**: số lượng khảo sát phù hợp nhất tối đa được lựa chọn và trả về cho người dùng.
- **User Text Representation**: chuỗi văn bản tổng hợp từ trường học, nghề nghiệp, tiểu sử và danh sách sở thích của người dùng.
- **Survey Text Representation**: chuỗi văn bản tổng hợp từ tiêu đề, mô tả và danh sách sở thích mục tiêu (*target interests*) của khảo sát.
- **Graceful Fallback**: cơ chế chuyển hướng an toàn sang truy vấn cơ sở dữ liệu khi AI Matching service gặp sự cố hoặc timeout, bảo đảm không gián đoạn trải nghiệm người dùng.

## Danh sách tài liệu

1. [Business Rules](./01-business-rules.md): các quy tắc và bất biến nghiệp vụ của AI Matching V1.
2. [State Transitions](./02-state-transitions.md): vòng đời nạp mô hình AI và các trạng thái xử lý recommendation request.
3. [Business Flows](./03-business-flows.md): luồng trích xuất đặc trưng, suy luận vector và cơ chế fallback khi có sự cố.
4. [API Contract](./04-api-contract.md): chi tiết endpoint Client API và Internal Microservice API.

## Domain model và DTO liên quan

- **Entities & Models**: `Survey`, `UserProfile`, `UserInterest`, `SurveyTargetInterest`, `Interest`, `SurveyCategory`, `SurveyStatus`.
- **Spring Boot DTOs**: `AiMatchRequest`, `SurveyItemDto`, `AiMatchResponse`, `SurveyScoreDto`, `SurveyRecommendationResponse`.
- **Python Pydantic Models**: `MatchRequest`, `SurveyItem`, `MatchResponse`, `SurveyScore`.
- **Configuration**: `AppAiMatchingProperties` (`serviceUrl`, `defaultTopK`, `timeoutMs`).
