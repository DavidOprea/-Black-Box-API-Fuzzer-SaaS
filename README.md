# Black-Box Fuzzer SaaS

A modern, async-polling API fuzzer that tests staging APIs for 5xx server errors using OpenAPI/Swagger specifications.

## Features

✅ **OpenAPI/Swagger Integration** — Load specifications via URL
✅ **5xx Error Detection** — Focus on server errors, ignore client errors
✅ **Rate Limiting & Concurrency Control** — Respect API limits, avoid WAF triggers
✅ **Real-time Polling** — Live progress updates every 3 seconds
✅ **Reproducible Crashes** — cURL commands for each crash found
✅ **API Key Injection** — Support for authenticated APIs
✅ **Live Terminal Output** — Watch fuzzing in real-time

## Tech Stack

- **Frontend:** Next.js 14 + React 18 + Tailwind CSS
- **Backend:** FastAPI + Uvicorn
- **Queue:** Celery + Redis
- **Fuzzer:** Schemathesis
- **Container:** Docker Compose

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Using Docker Compose (Recommended)

```bash
# Clone and enter project
cd black-box-fuzzer

# Start all services
docker-compose up -d

# Wait for services to initialize (30 seconds)
sleep 30

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
# Redis: localhost:6379
```

**Stopping services:**
```bash
docker-compose down
```

### Local Development (Manual Setup)

#### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Start Redis (requires separate installation or Docker)
redis-server

# In another terminal, start FastAPI
uvicorn app.api:app --reload

# In another terminal, start Celery worker
celery -A app.worker worker --loglevel=info
```

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Start Next.js dev server
npm run dev
```

Access frontend at `http://localhost:3000`

## API Endpoints

### Submit Fuzzing Job
```bash
POST /fuzz
Content-Type: application/json

{
  "target_openapi_url": "https://api.example.com/v1/openapi.json",
  "api_key_header": "X-API-Key",
  "api_key_value": "sk-1234567890",
  "consent_acknowledged": true
}
```

**Response:**
```json
{
  "task_id": "abc-123-def",
  "status": "pending",
  "message": "Fuzzing job abc-123-def queued..."
}
```

### Poll Job Status
```bash
GET /status/{task_id}
```

**Response:**
```json
{
  "task_id": "abc-123-def",
  "status": "running",
  "progress_percent": 45,
  "total_tests_run": 225,
  "total_crashes": 3,
  "crashes": [
    {
      "method": "POST",
      "path": "/users",
      "status_code": 500,
      "curl_command": "curl -X POST ..."
    }
  ],
  "curl_commands": ["curl -X POST ...", "curl -X GET ..."],
  "message": "Fuzzing in progress..."
}
```

### Cancel Job
```bash
POST /cancel/{task_id}
```

### Health Check
```bash
GET /health
```

### Statistics
```bash
GET /stats
```

## Configuration

### Backend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `CELERY_BROKER_URL` | `redis://localhost:6379/0` | Celery broker |
| `CELERY_RESULT_BACKEND` | `redis://localhost:6379/1` | Celery results backend |
| `API_TIMEOUT` | `300` | Fuzzing timeout (seconds) |
| `CONCURRENCY_LIMIT` | `20` | Max concurrent tests |
| `RATE_LIMIT_RPS` | `10.0` | Requests per second |
| `MAX_FAILURES` | `100` | Max failures before stopping |

### Frontend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API URL |

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api.py              # FastAPI application
│   │   ├── worker.py           # Celery tasks
│   │   ├── schemas.py          # Pydantic models
│   │   └── __init__.py
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx            # Main page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── FuzzerForm.tsx       # Input form
│   │   ├── Dashboard.tsx        # Results display
│   │   ├── ProgressBar.tsx
│   │   ├── TerminalOutput.tsx
│   │   └── StatusPoller.tsx
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   └── types.ts            # TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

## Key Features Explained

### Async Polling Flow

1. **Form Submission** — User submits OpenAPI URL + consent
2. **Job Enqueue** — FastAPI validates and enqueues Celery task
3. **Immediate Response** — Returns `task_id` for polling
4. **Real-time Polling** — Frontend polls `GET /status/{task_id}` every 3 seconds
5. **Progress Updates** — Celery worker updates Redis with progress
6. **Results Display** — Dashboard shows crashes + cURL commands when complete

### Schemathesis Integration

- **Schema Loading** — `schemathesis.openapi.from_uri()`
- **Test Generation** — Automatic test case generation from OpenAPI spec
- **5xx Filtering** — Only report 500-599 status codes
- **Rate Limiting** — Configurable RPS to avoid WAF triggers
- **Header Injection** — Automatic API key injection

### Security

- ✅ Mandatory ownership acknowledgment
- ✅ No password storage (API keys expire per-session)
- ✅ Rate limiting prevents WAF blocks
- ✅ Timeout protection (5 minutes default)
- ⚠️ **Warning:** Only run on APIs you own/control

## Development Workflow

### Adding New Features

1. **Backend changes** → Edit `backend/app/`
2. **Frontend changes** → Edit `frontend/app/` or `components/`
3. **Docker changes** → Rebuild with `docker-compose up --build`

### Debugging

**Backend logs:**
```bash
docker-compose logs -f api
docker-compose logs -f worker
```

**Frontend logs:**
```bash
docker-compose logs -f frontend
```

**Redis CLI:**
```bash
docker-compose exec redis redis-cli
```

## Future Enhancements

- [ ] User authentication & project management
- [ ] Scheduled fuzzing runs
- [ ] Detailed crash analysis & deduplication
- [ ] Integration with bug tracking (Jira, GitHub)
- [ ] Custom mutation strategies
- [ ] Database persistence for results
- [ ] WebSocket support for real-time updates
- [ ] Batch API testing

## Troubleshooting

### Redis connection errors
```bash
# Ensure Redis is running
docker-compose up redis -d

# Check Redis health
docker-compose exec redis redis-cli ping
```

### Celery worker not picking up tasks
```bash
# Check worker logs
docker-compose logs -f worker

# Restart worker
docker-compose restart worker
```

### Frontend can't reach backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is running: `curl http://localhost:8000/health`
- Check CORS settings in `backend/app/api.py`

## License

MIT

## Support

For issues or questions:
1. Check Docker logs: `docker-compose logs`
2. Verify Redis connectivity: `redis-cli ping`
3. Test API directly: `curl http://localhost:8000/docs`
