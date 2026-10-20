# AI Matching V1 — Business Flows

## 1. Luồng gợi ý khảo sát cá nhân hóa (End-to-End Recommendation Flow)

```mermaid
sequenceDiagram
    actor User as Participant
    participant Ctrl as SurveyRecommendationController
    participant Svc as SurveyRecommendationServiceImpl
    participant DB as PostgreSQL Database
    participant Client as AiMatchingClient
    participant AI as Python AI Service (FastAPI)

    User->>Ctrl: GET /api/v1/surveys/recommendations?limit=10 (với JWT)
    Ctrl->>Svc: getRecommendedSurveys(userId, limit=10)
    
    Svc->>DB: surveyRepository.findByStatus(PUBLISHED)
    DB-->>Svc: Danh sách Published Surveys
    
    alt Không có survey nào PUBLISHED
        Svc-->>Ctrl: []
        Ctrl-->>User: HTTP 200 OK (data: [])
    else Có survey PUBLISHED
        Svc->>DB: Lấy target interests của từng survey
        Svc->>DB: Lấy UserProfile & UserInterest của userId
        DB-->>Svc: Profile, Interests và Target Interests
        
        Note over Svc: Xây dựng user_text và survey_texts
        
        Svc->>Client: matchSurveys(AiMatchRequest)
        Client->>AI: POST /api/v1/match
        
        Note over AI: Encode embeddings & Cosine Similarity
        
        AI-->>Client: AiMatchResponse (survey_id, score)
        Client-->>Svc: AiMatchResponse
        
        Note over Svc: Ghép metadata và sắp xếp theo score giảm dần
        
        Svc-->>Ctrl: List<SurveyRecommendationResponse>
        Ctrl-->>User: HTTP 200 OK (data: [...])
    end
```

---

## 2. Luồng tiền xử lý và trích xuất đặc trưng (Text Feature Extraction)

```mermaid
flowchart TD
    A[Bắt đầu chuẩn bị dữ liệu] --> B{userId != null?}
    
    B -- Có --> C[Truy vấn UserProfile: school, occupation, bio]
    B -- Có --> D[Truy vấn UserInterest: danh sách tên interest]
    B -- Không --> E[Sử dụng chuỗi mặc định rỗng]
    
    C --> F[Ghép chuỗi user_text: 'Student at... Occupation:...']
    D --> F
    E --> F
    
    F --> G[Duyệt từng Survey PUBLISHED]
    G --> H[Lấy title, description của Survey]
    G --> I[Lấy TargetInterests tương ứng]
    H --> J[Ghép chuỗi survey_text: 'title. description. Target interests:...']
    I --> J
    
    J --> K[Tạo mảng SurveyItemDto: id, text]
    K --> L[Đóng gói AiMatchRequest: user_text, surveys, top_k]
    L --> M[Sẵn sàng gửi sang AI Service]
```

---

## 3. Luồng tính toán suy luận ngữ nghĩa tại Python AI Service

```mermaid
flowchart TD
    A[Nhận POST /api/v1/match] --> B{Mô hình đã load trong model_container?}
    B -- Không --> C[Raise HTTPException 503: Model is not loaded]
    
    B -- Có --> D{request.surveys rỗng?}
    D -- Có --> E[Trả về MatchResponse rỗng results: []]
    
    D -- Không --> F[Lấy model = model_container['model']]
    F --> G[Encode user_text -> user_embedding 1x384]
    G --> H[Batch encode survey_texts -> survey_embeddings Nx384]
    H --> I[Tính cosine_similarity giữa user_embedding và survey_embeddings]
    I --> J[Tạo danh sách SurveyScore: survey_id, score làm tròn 4 chữ số]
    J --> K[Sắp xếp danh sách theo score giảm dần]
    K --> L[Cắt lấy top_k phần tử đầu tiên]
    L --> M[Trả về MatchResponse results: top_results]
```

---

## 4. Luồng xử lý sự cố và tự động Fallback (Graceful Degradation Flow)

```mermaid
sequenceDiagram
    participant Svc as SurveyRecommendationServiceImpl
    participant Client as AiMatchingClient
    participant AI as Python AI Service (FastAPI)
    participant Log as System Logger

    Svc->>Client: matchSurveys(AiMatchRequest)
    Client->>AI: POST /api/v1/match (Timeout: 5000ms)
    
    alt Kết nối bị từ chối / Dịch vụ AI sập / Timeout > 5000ms
        AI--xClient: ConnectionRefused / SocketTimeoutException / 500 Error
        Client->>Log: Ghi log cảnh báo: "Failed to call AI Matching Service..."
        Client-->>Svc: null
        
        Note over Svc: Kích hoạt cơ chế Fallback
        Svc->>Log: Ghi log info: "Using fallback survey recommendation (database order)"
        Note over Svc: Sắp xếp theo thứ tự CSDL mặc định, gán score = null, cắt theo limit
        Svc-->>Svc: Danh sách SurveyRecommendationResponse (score: null)
    end
```
