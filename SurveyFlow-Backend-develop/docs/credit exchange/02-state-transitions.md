# Credit V1 — State Transitions

## 1. Tạo survey

| Nguồn | Hành động | Kết quả |
|---|---|---|
| Creator đủ credit | Tạo survey | Trừ `11 × targetResponseCount`, tạo transaction `SURVEY_CREATION`, lưu survey `DRAFT` |
| Creator thiếu credit | Tạo survey | Rollback, không lưu survey hoặc transaction |

## 2. Reward participation

| Trạng thái participation | Hành động | Kết quả |
|---|---|---|
| `RESERVED` | Webhook hợp lệ | Chuyển qua `SUBMITTED` đến `VERIFIED` |
| `VERIFIED` hoặc `VALID` chưa nhận thưởng | Grant reward | Cộng 10 credit và tạo `SURVEY_COMPLETION` |
| Đã có transaction reward | Retry | Trả kết quả idempotent, không cộng thêm |
| Trạng thái khác | Grant reward | Từ chối |

Survey publish, close hoặc participant thất bại không thay đổi balance của Creator.
