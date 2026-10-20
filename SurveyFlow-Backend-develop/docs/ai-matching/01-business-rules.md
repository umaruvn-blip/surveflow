# AI Matching V1 — Business Rules

## 1. Kiến trúc phân tách và mô hình nhúng

- Hệ thống phân tách thành hai thành phần độc lập:
  - **SurveyFlow Backend (Spring Boot)**: chịu trách nhiệm nghiệp vụ cốt lõi, bảo mật, truy vấn dữ liệu từ CSDL quan hệ (PostgreSQL) và quản lý vòng đời khảo sát.
  - **AI Matching Service (Python FastAPI)**: hoạt động như một microservice suy luận (*inference engine*) độc lập, chuyên trách việc mã hóa vector và tính toán ma trận tương đồng.
- Mô hình nhúng tiêu chuẩn sử dụng trong V1 là `sentence-transformers/all-MiniLM-L6-v2`.
- Không gian vector có kích thước cố định là **384 chiều** (*384-dimensional embeddings*).
- Vector được chuẩn hóa $L_2$ (`normalize_embeddings=True`) trước khi tính toán độ tương đồng Cosine để bảo đảm điểm số nằm trong khoảng chuẩn $[-1.0, 1.0]$.

## 2. Quy tắc xây dựng văn bản đặc trưng (Text Representation Rules)

### 2.1. Văn bản đại diện người dùng (User Text)
- Chuỗi văn bản đại diện hồ sơ người dùng được tổng hợp theo khuôn mẫu sau:
  ```text
  Student at {school}. Occupation: {occupation}. {bio} Interests: {interest_1, interest_2, ...}.
  ```
- Nếu trường dữ liệu bị `null`, giá trị sẽ được thay bằng chuỗi rỗng `""`.
- Khi người dùng chưa đăng nhập hoặc chưa cập nhật hồ sơ cá nhân (`UserProfile` / `UserInterest` rỗng), chuỗi đại diện vẫn được định dạng hợp lệ để mô hình AI xử lý mà không gây lỗi.
- Chuỗi văn bản sau khi ghép nối được cắt tỉa khoảng trắng thừa (`trim()`).

### 2.2. Văn bản đại diện khảo sát (Survey Text)
- Mỗi khảo sát đang hoạt động được biểu diễn bằng một chuỗi văn bản tổng hợp theo khuôn mẫu:
  ```text
  {title}. {description} Target interests: {interest_1, interest_2, ...}.
  ```
- `title` là trường bắt buộc của khảo sát.
- Nếu `description` là `null`, giá trị mặc định là chuỗi rỗng `""`.
- Danh sách `target_interests` lấy từ các bản ghi `SurveyTargetInterest` liên kết với khảo sát qua bảng `interests`. Nếu khảo sát không cấu hình target interest, danh sách này là rỗng.

## 3. Tiền điều kiện lọc khảo sát (Pre-filtering Rules)

- Chỉ những khảo sát có trạng thái `PUBLISHED` mới được đưa vào danh sách ứng viên gửi sang AI Matching Service.
- Các khảo sát ở trạng thái `DRAFT`, `HIDDEN`, hoặc `CLOSED` tuyệt đối không được đưa vào tập ứng viên đề xuất.
- Nếu không có bất kỳ khảo sát nào ở trạng thái `PUBLISHED`, backend trả về danh sách rỗng `[]` ngay lập tức mà không cần gọi sang AI Matching Service.
- Mỗi bản ghi gửi sang AI Service chứa cặp `id` (mã khảo sát) và `text` (văn bản đặc trưng đã xây dựng).

## 4. Quy tắc xếp hạng, làm tròn và cắt Top-K (Ranking & Slicing)

- Điểm tương đồng ngữ nghĩa `score` được tính bằng Cosine Similarity giữa vector đặc trưng của người dùng và vector đặc trưng của từng khảo sát:
  $$\text{score} = \cos(\mathbf{u}, \mathbf{s}) = \frac{\mathbf{u} \cdot \mathbf{s}}{\|\mathbf{u}\| \|\mathbf{s}\|}$$
- Điểm `score` được làm tròn đến **4 chữ số thập phân** (ví dụ: `0.8524`).
- Danh sách khảo sát được sắp xếp theo thứ tự **giảm dần** của `score` (điểm cao nhất lên đầu).
- Tham số `limit` (hoặc `top_k`) quyết định số lượng khảo sát tối đa trả về:
  - Giá trị mặc định được cấu hình bởi `app.ai-matching.default-top-k` (mặc định là `10`).
  - Nếu client truyền `limit <= 0` hoặc không truyền, hệ thống sử dụng giá trị mặc định.
  - Sau khi sắp xếp, danh sách kết quả được cắt (`slice`) lấy tối đa `top_k` phần tử.

## 5. Phòng vệ và chịu lỗi (Fault-Tolerance & Graceful Fallback)

- Lời gọi HTTP từ Spring Boot sang Python AI Service áp dụng cơ chế giới hạn thời gian phản hồi:
  - Cấu hình qua `app.ai-matching.timeout-ms` (mặc định là `5000ms` cho cả Connect Timeout và Read Timeout).
- **Graceful Fallback**: Trong các trường hợp sau:
  - Python AI Matching Service chưa khởi động hoặc gặp sự cố mất mạng (`ConnectException`, `ResourceAccessException`).
  - AI Service phản hồi lỗi HTTP 5xx hoặc timeout.
  - Mô hình AI chưa nạp xong vào bộ nhớ (trả HTTP 503).
  - Phản hồi từ AI Service rỗng hoặc sai định dạng.
  - Hệ thống tự động chuyển sang cơ chế **Fallback mặc định**:
    1. Ghi log cảnh báo (`log.warn(...)` hoặc `log.info(...)`).
    2. Trả về danh sách khảo sát theo thứ tự cơ sở dữ liệu mặc định (`publishedSurveys` cắt theo `limit`).
    3. Điểm số `matchScore` trong kết quả fallback được gán bằng `null`.
    4. Client nhận mã trạng thái `HTTP 200 OK` thành công, không bị gián đoạn hoặc nhận lỗi `HTTP 500`.

## 6. Hiệu năng và tài nguyên (Performance & Resource Management)

- **Lifespan Initialization**: Python AI Service nạp mô hình `SentenceTransformer` một lần duy nhất vào bộ nhớ (`model_container`) trong quá trình khởi động ứng dụng (`@asynccontextmanager lifespan`), tránh việc nạp lại mô hình trong từng request gây nghẽn CPU/RAM.
- **Batch Encoding**: Quá trình vector hóa danh sách khảo sát được thực hiện theo cơ chế batch `model.encode(survey_texts)` thay vì lặp từng câu đơn lẻ, tối ưu hóa khả năng tính toán ma trận của PyTorch/NumPy.
- **Không truy vấn thừa**: Backend gom các target interest theo từng survey trước khi build text và dùng `Map<Long, Survey>` để map lại kết quả trả về từ AI Service với độ phức tạp $O(N)$.

## 7. Bất biến nghiệp vụ (Business Invariants)

1. **Khảo sát đề xuất luôn hợp lệ**: Mọi khảo sát trả về trong danh sách recommendations bắt buộc phải ở trạng thái `PUBLISHED`.
2. **Không làm lộ dữ liệu nội bộ**: Client chỉ nhận điểm số `matchScore` và metadata khảo sát công khai; vector embedding thô không bao giờ được trả qua API public.
3. **Tính nhất quán của kết quả**: Cùng một người dùng và cùng một tập khảo sát, điểm tương đồng ngữ nghĩa của AI Engine là có tính xác định (*deterministic*) trong cùng một phiên bản mô hình.
4. **An toàn trải nghiệm (High Availability)**: Lỗi từ AI Matching Service không bao giờ làm sập hoặc chặn luồng duyệt danh sách khảo sát của người dùng.
