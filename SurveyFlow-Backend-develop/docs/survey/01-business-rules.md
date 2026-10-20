# Survey V1 — Business Rules

## 1. Provider và phương thức xác minh

- V1 hỗ trợ survey dùng form bên ngoài với provider `GOOGLE_FORMS` hoặc `OTHER`.
- Provider `INTERNAL` được giữ trong domain model nhưng không thuộc phạm vi V1.
- Form bên ngoài dùng `EXTERNAL_CODE` làm phương thức xác minh mặc định.
- Với `EXTERNAL_CODE`, completion code do Survey Flow phát hành và Participant nhập mã vào một câu hỏi bắt buộc trên Google Form.
- Completion code chỉ được phát hành sau `minCompletionSeconds`, tính từ `slotReservedAt`.
- `estimatedDurationSeconds` chỉ dùng để cung cấp thông tin cho Participant, không dùng làm điều kiện phát hành hoặc xác minh code.
- Mỗi participation chỉ có một completion code đang hiệu lực. Việc phát hành lại code phải vô hiệu hóa code trước đó.
- Backend chỉ lưu hash của completion code; plaintext chỉ được trả về khi phát hành.
- Google Form phải cài Apps Script với installable form-submit trigger. Khi form được submit, script gửi form response metadata và completion code về webhook của Survey Flow.
- Apps Script webhook phải gửi token trong header `X-Webhook-Token`. Backend chỉ lưu SHA-256 hash của token; plaintext token chỉ được trả một lần khi cấu hình webhook.
- Không được publish survey dùng `EXTERNAL_CODE` nếu cấu hình form, code question, webhook và token chưa vượt qua bước kiểm tra kết nối.
- External form không hỗ trợ webhook tương thích phải dùng `MANUAL_REVIEW`.
- Với `MANUAL_REVIEW`, participation giữ trạng thái `SUBMITTED` trong lúc chờ duyệt; V1 không sử dụng trạng thái `UNDER_REVIEW`.
- `INTERNAL_SUBMISSION` không thuộc phạm vi V1.

### 1.1. Quy tắc webhook

- Payload webhook tối thiểu gồm form ID, response ID, thời điểm submit và completion code.
- Form ID phải khớp với form đã cấu hình cho survey.
- Response ID phải duy nhất trong phạm vi provider để chống xử lý trùng.
- Webhook token phải được xác minh trước khi đọc hoặc xử lý completion code.
- Completion code phải tồn tại, còn hiệu lực, chưa được sử dụng và thuộc participation đang `RESERVED`.
- Thời điểm form được submit phải sau thời điểm code được phép phát hành và không muộn hơn `slotExpiresAt`.
- Callback lặp lại với cùng response ID phải trả về kết quả idempotent và không phân phối reward lần nữa.
- Webhook không xác thực được không làm thay đổi participation và không tăng `verificationAttemptCount`.

## 2. Sức chứa survey

Capacity khả dụng được tính như sau:

```text
occupiedSlots = verifiedCount + activeReservedCount + submittedCount
availableSlots = targetResponseCount - occupiedSlots
```

Trong đó:

- `activeReservedCount` chỉ gồm reservation chưa hết hạn.
- `SUBMITTED` tiếp tục chiếm slot cho đến khi thành `VERIFIED` hoặc `REJECTED`.
- `EXPIRED`, `CANCELLED` và `REJECTED` không chiếm slot.
- Không được tạo reservation khi `availableSlots <= 0`.
- Kiểm tra capacity và tạo reservation phải atomic để tránh overbooking.

## 3. Chính sách tham gia lại

- Mỗi user chỉ được có tối đa một participation đang hoạt động (`RESERVED` hoặc `SUBMITTED`) trên một survey.
- Sau `EXPIRED` hoặc `CANCELLED`, user được tạo participation mới nếu survey vẫn còn capacity và còn thời hạn.
- Sau `REJECTED`, user không được tham gia lại trong V1.
- Sau `VERIFIED`, user không được tham gia lại cùng survey.
- `maxAttempts` giới hạn số lần xác minh trên một participation, không phải số lần gửi HTTP request.

## 4. Chỉnh sửa sau publish

- Khi `DRAFT`, Creator được sửa cấu hình survey nhưng không được đổi `targetResponseCount` đã dùng để tính phí tạo.
- Khi `PUBLISHED`, Creator chỉ được sửa các trường mô tả không làm thay đổi điều kiện tham gia: `title`, `description`, `researchPurpose`, `participantInstructions` và `dataUsageNotice`.
- Không được đổi provider, URL form, targeting hoặc verification config đang được participation sử dụng.
- Không hỗ trợ tăng hoặc giảm `targetResponseCount` hay thay đổi targeting sau publish.
- Deadline chỉ được gia hạn; không được rút ngắn làm ảnh hưởng participation đang hoạt động.
- Mọi thay đổi verification phải tạo config version mới, không sửa version cũ.

## 5. Đóng và ẩn survey

- `CLOSED` là trạng thái kết thúc và không được mở lại.
- Survey tự đóng khi đạt target response đã xác minh hoặc quá deadline.
- Creator được đóng survey sớm.
- Survey `CLOSED` không nhận reservation mới.
- Participation `RESERVED` còn hạn được phép hoàn tất trong slot đã giữ.
- Participation `SUBMITTED` vẫn phải được xác minh và được trả thưởng nếu hợp lệ.
- `HIDDEN` dùng cho Admin/System tạm ngừng phân phối vì kiểm duyệt hoặc sự cố.
- Creator không được trực tiếp chuyển survey sang `HIDDEN`.
- Survey `HIDDEN` không nhận reservation mới nhưng các participation đã có vẫn được xử lý.

## 6. Credit

- Creator trả phí tạo survey theo công thức:

```text
creationCost = 11 * targetResponseCount
```

- Phí được trừ một lần khi tạo survey và không được hoàn lại.
- `targetResponseCount` không được thay đổi sau khi survey đã được tạo.
- Participant luôn nhận 10 credit từ hệ thống sau khi participation chuyển thành `VERIFIED`.
- Reward không được trừ thêm từ ví Creator và không cần ngân sách riêng cho survey.
- `REJECTED`, `EXPIRED` và `CANCELLED` không nhận reward.

## 7. Quality và dữ liệu nhạy cảm

- Quality score chỉ phục vụ theo dõi và phân tích, không tự động chặn reward.
- Survey có `containsSensitiveQuestions = true` bắt buộc phải có `dataUsageNotice`.
- Kiểm duyệt nâng cao và consent riêng không thuộc phạm vi V1.

## 8. Bất biến nghiệp vụ

- Không trả thưởng hai lần cho cùng một participation.
- `currentResponseCount` chỉ đếm participation `VERIFIED`.
- `currentResponseCount <= targetResponseCount`.
- Các giá trị credit luôn không âm.
- Mỗi participation `VERIFIED` nhận đúng 10 credit.
- Verification config đã được participation tham chiếu không bị sửa; thay đổi phải tạo version mới.
- Creator không được tham gia survey của chính mình.
- Mỗi user chỉ có tối đa một participation đang hoạt động trên một survey.
- Mọi transition phải kiểm tra trạng thái hiện tại.
- Các thao tác có side effect về response count hoặc credit phải idempotent.

## 9. Tác vụ nền

- Đánh dấu participation `RESERVED` quá hạn thành `EXPIRED` và trả slot về capacity.
- Đóng survey `PUBLISHED` đã quá deadline.
- Đóng survey khi đủ response đã xác minh.
- Retry tác vụ trả thưởng nếu hệ thống sử dụng outbox hoặc event processing.
