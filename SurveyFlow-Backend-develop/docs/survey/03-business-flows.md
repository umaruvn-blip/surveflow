# Survey V1 — Business Flows

## 1. Cấu hình Google Form

Trước khi publish survey dùng `EXTERNAL_CODE`, Creator thực hiện các bước sau:

1. Tạo một câu hỏi bắt buộc để nhận completion code trên Google Form.
2. Cài Apps Script template của Survey Flow vào form.
3. Cài installable form-submit trigger cho script.
4. Cấu hình survey ID, webhook URL và webhook token cho script.
5. Chạy kiểm tra kết nối để xác nhận backend nhận và xác thực được webhook.

Survey không được publish nếu kiểm tra kết nối thất bại.

## 2. Tạo và publish Survey

```mermaid
flowchart TD
    A[Creator tạo draft] --> B[Nhập metadata và nguồn form]
    B --> C[Cấu hình targeting, tag và interest]
    C --> D[Cấu hình số response và deadline]
    D --> E[Chọn phương thức verification]
    E --> F{Dữ liệu hợp lệ?}
    F -- Không --> G[Trả lỗi theo field/business rule]
    G --> B
    F -- Có --> H{Đủ phí tạo survey?}
    H -- Không --> I[Rollback và từ chối tạo]
    H -- Có --> J[Trừ 11 credit cho mỗi response mục tiêu]
    J --> K[Lưu transaction SURVEY_CREATION]
    K --> L[Cho phép cấu hình và publish draft]
```

Khi tạo và publish thành công:

- Phí tạo survey được trừ một lần khi tạo draft.
- `publishedAt` được ghi nhận.
- Survey bắt đầu xuất hiện trong discovery/matching nếu còn thời hạn và capacity.
- Participation lưu `verificationConfigVersion` đang hiệu lực tại thời điểm giữ chỗ.

## 3. Khám phá và kiểm tra eligibility

Một survey chỉ được đưa vào danh sách hoặc matching khi:

- Có trạng thái `PUBLISHED`.
- Chưa quá deadline.
- Còn capacity sau khi tính response đã xác minh, reservation còn hiệu lực và submission đang chờ xác minh.
- Participant không phải Creator của survey.
- Participant thỏa targeting bắt buộc.
- Participant không có participation `RESERVED`, `SUBMITTED`, `VERIFIED` hoặc `REJECTED` trước đó.
- Participation mới chỉ được phép nếu participation gần nhất là `EXPIRED` hoặc `CANCELLED`.

Kết quả eligibility tại thời điểm giữ chỗ được lưu vào `eligibilitySnapshot` để phục vụ audit, ngay cả khi profile người dùng thay đổi sau đó.

## 4. Giữ chỗ, nhận code và hoàn thành Google Form

```mermaid
sequenceDiagram
    actor P as Participant
    participant API as Survey API
    participant DB as Database
    participant F as Google Form
    participant S as Apps Script

    P->>API: Yêu cầu tham gia survey
    API->>DB: Kiểm tra survey, eligibility và capacity
    API->>DB: Tạo participation RESERVED
    DB-->>API: Participation publicId và slotExpiresAt
    API-->>P: External form URL và thời hạn slot
    P->>F: Mở và làm form
    P->>API: Yêu cầu completion code
    API->>API: Kiểm tra minCompletionSeconds
    API->>DB: Lưu hash của code
    API-->>P: Trả plaintext code một lần
    P->>F: Nhập code và submit form
    F->>S: Kích hoạt form-submit trigger
    S->>API: Gửi webhook kèm token
```

Việc kiểm tra capacity và tạo participation phải atomic. Nếu transaction thất bại, hệ thống không được giữ slot.

`estimatedDurationSeconds` chỉ được hiển thị cho Participant. Backend sử dụng `minCompletionSeconds` để quyết định thời điểm cho phép phát hành completion code.

## 5. Xác minh và trả thưởng

```mermaid
sequenceDiagram
    participant S as Apps Script
    participant API as Survey API
    participant V as Verification
    participant DB as Database
    participant W as Credit Wallet

    S->>API: POST form webhook
    API->>API: Xác minh token, form ID và response ID
    API->>V: Đối chiếu completion code với participation
    API->>V: Xác minh theo config version đã snapshot
    V-->>API: Kết quả xác minh
    alt Thành công
        API->>DB: SUBMITTED → VERIFIED
        API->>DB: Tăng currentResponseCount
        API->>W: Cộng cố định 10 credit cho Participant
        W->>DB: Ghi CreditTransaction
    else Thất bại còn lượt thử
        API->>DB: Tăng attempt count, giữ SUBMITTED
    else Thất bại hết lượt
        API->>DB: SUBMITTED → REJECTED
    end
```

Các cập nhật sau phải atomic hoặc sử dụng cơ chế idempotency/outbox tương đương:

- Participation chuyển sang `VERIFIED`.
- `currentResponseCount` tăng đúng một lần.
- Ví Participant được cộng credit đúng một lần.
- `CreditTransaction` loại `SURVEY_COMPLETION` được tạo đúng một lần cho participation.

## 6. Đóng Survey

Survey chuyển thành `CLOSED` khi xảy ra một trong các điều kiện:

- Số response đã xác minh đạt `targetResponseCount`.
- Deadline đã qua.
- Creator đóng survey sớm.
- Admin/System kết thúc survey đang `HIDDEN`.

Sau khi survey đóng:

1. Không nhận reservation mới.
2. Participation `RESERVED` còn hạn được phép tiếp tục đến khi submit, hết hạn hoặc bị hủy.
3. Participation `SUBMITTED` tiếp tục được xác minh.

## 7. Xử lý tự động

- Job expiry chuyển reservation quá hạn từ `RESERVED` sang `EXPIRED`.
- Job deadline chuyển survey quá hạn từ `PUBLISHED` sang `CLOSED`.
- Hệ thống đóng survey ngay khi response đã xác minh đạt target.
- Tác vụ trả thưởng có thể được retry nhưng không được tạo reward hoặc transaction trùng lặp.
- Apps Script template phải lưu callback gửi thất bại và retry; backend xử lý các lần gửi lại theo response ID một cách idempotent.
