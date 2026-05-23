# Mermaid Diagrams

## 1. Use Case Diagram

```mermaid
flowchart LR
    A[Admin/User] --> Z[Verify hCaptcha if new session]
    A --> B[Input Product URL]
    A --> T[Choose target reviews]
    A --> C[Start Scraping]
    A --> D[View Dashboard]
    A --> E[View Review Data]
    A --> F[Filter/Search Reviews]
    A --> G[Export CSV/JSON]

    C --> H[Scraper Collects Data]
    H --> I[Save to Database]
    I --> D
    I --> E
```

## 2. Activity Diagram

```mermaid
flowchart TD
    A[Start] --> B[Open Scrape Page]
    B --> S{Anonymous session exists?}
    S -- No --> HCAP[Complete hCaptcha]
    HCAP --> AUTH[Create anonymous session]
    S -- Yes --> C[Input Product URL]
    AUTH --> C
    C --> D[Choose target reviews]
    D --> E[Click Start Scraping]
    E --> V[Validate URL and target]
    V --> F{Valid request?}
    F -- No --> G[Show Error]
    G --> C
    F -- Yes --> H[Create Scrape Job with owner_id]
    H --> I[Run Playwright]
    I --> J[Extract Product and Reviews]
    J --> K[Clean Data]
    K --> L[Save to Supabase with owner_id]
    L --> M[Update Status and Stop Reason]
    M --> N[Display Reviews]
    N --> O[End]
```

## 3. Sequence Diagram

```mermaid
sequenceDiagram
    actor Admin
    participant FE as Next.js Frontend
    participant API as Scraper API
    participant PW as Playwright
    participant FD as FemaleDaily
    participant DB as Supabase

    Admin->>FE: Open app
    FE->>DB: Restore anonymous session
    alt No session
        FE->>Admin: Show hCaptcha
        Admin->>FE: Complete hCaptcha
        FE->>DB: Sign in anonymously
    end
    Admin->>FE: Input product URL
    Admin->>FE: Choose target reviews
    Admin->>FE: Click start scraping
    FE->>API: Send product URL, target, Bearer token
    API->>DB: Verify token and create scrape job running
    API->>PW: Launch browser
    PW->>FD: Open product page
    FD-->>PW: Return page content
    PW->>API: Return extracted data
    API->>API: Clean and validate data
    API->>DB: Save product and reviews with owner_id
    API->>DB: Update job success and stop reason
    API-->>FE: Return job id
    FE->>API: Poll job status with Bearer token
    API-->>FE: Return scoped job data
    FE-->>Admin: Display result
```

## 4. ERD

```mermaid
erDiagram
    PRODUCTS ||--o{ REVIEWS : has
    SCRAPE_JOBS ||--o{ REVIEWS : produces

    PRODUCTS {
        uuid id PK
        uuid owner_id FK
        string product_name
        string brand_name
        string category
        string source_url
        timestamp created_at
        timestamp updated_at
    }

    REVIEWS {
        uuid id PK
        uuid owner_id FK
        uuid product_id FK
        uuid scrape_job_id FK
        int rating
        text review_text
        string review_date
        string source_url
        timestamp created_at
    }

    SCRAPE_JOBS {
        uuid id PK
        uuid owner_id FK
        string source_url
        string status
        int total_reviews
        int requested_reviews
        string stop_reason
        text error_message
        timestamp started_at
        timestamp finished_at
        timestamp created_at
    }
```
