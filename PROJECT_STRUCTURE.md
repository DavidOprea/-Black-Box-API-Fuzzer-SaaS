# Black-Box Fuzzer SaaS - Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── api.py                 # FastAPI main app
│   │   ├── worker.py              # Celery worker tasks
│   │   ├── schemas.py             # Pydantic models
│   │   └── utils.py               # Helpers (cURL generation, etc.)
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx               # Main page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── FuzzerForm.tsx          # Input form
│   │   ├── Dashboard.tsx           # Results dashboard
│   │   ├── ProgressBar.tsx
│   │   ├── TerminalOutput.tsx
│   │   └── StatusPoller.tsx
│   ├── lib/
│   │   ├── api.ts                  # API client
│   │   └── types.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── .env.local.example
│
└── docker-compose.yml
```

## Key Integration Points

1. **Frontend → Backend**: `POST /fuzz` (form submission) + `GET /status/{task_id}` (polling)
2. **Backend → Queue**: Celery task enqueued in Redis
3. **Worker → Redis**: Status updates and results stored
4. **Worker Execution**: Schemathesis fuzzing with 5xx filter, rate limiting, header injection

## Environment Variables

Backend:
- `REDIS_URL`: Redis connection (default: redis://localhost:6379)
- `CELERY_BROKER_URL`: Celery broker (default: redis://localhost:6379/0)
- `CELERY_RESULT_BACKEND`: Results backend (default: redis://localhost:6379/1)
- `API_TIMEOUT`: Fuzzing timeout in seconds (default: 300)
- `CONCURRENCY_LIMIT`: Max concurrent fuzzing tests (default: 20)
- `RATE_LIMIT_RPS`: Requests per second (default: 10)

Frontend:
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)
