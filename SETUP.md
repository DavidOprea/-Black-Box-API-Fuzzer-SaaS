# Setup Guide — Black-Box Fuzzer SaaS

## 1. Quick Start (Docker Compose) — 3 minutes

### Fastest way to get everything running:

```bash
# Navigate to project root
cd /path/to/black-box-fuzzer

# Start all services (Redis, API, Worker, Frontend)
docker-compose up -d

# Wait for initialization
sleep 30

# Verify services are running
docker-compose ps

# Access the application
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"
echo "Redis: localhost:6379"
```

**That's it!** The entire system is now running.

---

## 2. Manual Local Setup (Without Docker)

### 2.1 Prerequisites

```bash
# Check Python version (need 3.11+)
python3 --version

# Check Node version (need 18+)
node --version

# Install Redis (macOS)
brew install redis

# Or install via system package manager (Linux)
sudo apt-get install redis-server
```

### 2.2 Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Install Python dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Verify FastAPI app
python -c "from app.api import app; print('API loaded successfully')"
```

### 2.3 Frontend Setup

```bash
cd ../frontend

# Install Node dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Verify Next.js build (optional)
npm run build
```

### 2.4 Running Services (3 Terminal Windows)

**Terminal 1 — Redis:**
```bash
redis-server
# Expected: "Ready to accept connections"
```

**Terminal 2 — FastAPI Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.api:app --reload --port 8000
# Expected: "Uvicorn running on http://0.0.0.0:8000"
```

**Terminal 3 — Celery Worker:**
```bash
cd backend
source venv/bin/activate
celery -A app.worker worker --loglevel=info
# Expected: "Ready to accept tasks"
```

**Terminal 4 — Next.js Frontend:**
```bash
cd frontend
npm run dev
# Expected: "Ready in XXms" and "Local: http://localhost:3000"
```

### 2.5 Verify Installation

```bash
# Check backend health
curl http://localhost:8000/health

# Check Redis
redis-cli ping

# Open frontend
open http://localhost:3000  # macOS
# or
xdg-open http://localhost:3000  # Linux
# or
start http://localhost:3000  # Windows
```

---

## 3. Testing the System

### 3.1 Simple Test with Public API

1. Go to `http://localhost:3000`
2. Enter a public OpenAPI URL (e.g., `https://petstore.swagger.io/v2/swagger.json`)
3. Check the "I own this API" checkbox
4. Click "Start Fuzzing"
5. Watch progress in real-time
6. View results dashboard when complete

### 3.2 Test with Your Own API

1. Ensure your API has an OpenAPI/Swagger endpoint:
   - `/openapi.json`
   - `/swagger.json`
   - `/api/openapi.json`
   - `/api-docs`

2. If using API key authentication:
   - Enter header name (e.g., `X-API-Key`)
   - Enter your API key value
   - Schemathesis will inject it into all requests

3. Submit the form and monitor fuzzing

### 3.3 Verify Celery Task Processing

```bash
# Check active tasks
curl http://localhost:8000/stats

# Example response:
# {
#   "active_tasks": 1,
#   "workers": 1,
#   "registered_tasks": 2
# }
```

---

## 4. Configuration

### Backend Configuration

Edit `backend/.env`:

```env
# Redis (adjust if not localhost)
REDIS_URL=redis://localhost:6379
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# Fuzzing parameters
API_TIMEOUT=300           # Timeout in seconds (5 min default)
CONCURRENCY_LIMIT=20      # Max parallel tests
RATE_LIMIT_RPS=10.0       # Requests per second
MAX_FAILURES=100          # Stop after N failures

# Server
HOST=0.0.0.0
PORT=8000
```

### Frontend Configuration

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 5. Docker Troubleshooting

### Services won't start

```bash
# Check logs for specific service
docker-compose logs api     # FastAPI
docker-compose logs worker  # Celery
docker-compose logs redis   # Redis
docker-compose logs frontend  # Next.js

# Force rebuild all images
docker-compose down
docker-compose up --build -d
```

### Port conflicts

If ports are already in use, edit `docker-compose.yml`:

```yaml
# Change port mappings, e.g., 3001 instead of 3000
frontend:
  ports:
    - "3001:3000"  # Access on localhost:3001
```

### Redis persistence

To clear Redis data:

```bash
docker-compose exec redis redis-cli FLUSHALL
```

---

## 6. Local Development Workflow

### Running with hot reload:

```bash
# Backend auto-reloads on file changes (uvicorn --reload)
# Frontend auto-reloads on file changes (next dev)
# Worker requires manual restart: docker-compose restart worker

# All services have volume mounts for live code updates
```

### Making code changes:

1. Edit source files in your editor
2. Frontend: Changes appear immediately in browser (hot reload)
3. Backend API: Changes appear on next request (hot reload)
4. Worker: Manually restart with `docker-compose restart worker`

---

## 7. Production Deployment

### Before deploying:

1. Set all environment variables securely
2. Use a managed Redis service (AWS ElastiCache, Redis Cloud)
3. Enable CORS properly (restrict origins)
4. Add authentication to API
5. Use HTTPS only
6. Set up proper logging and monitoring
7. Configure rate limiting per user
8. Add input validation and sanitization

### Deployment checklist:

- [ ] `.env` files properly configured with secrets
- [ ] Database backups for results
- [ ] CORS configured for production domain
- [ ] HTTPS enabled
- [ ] Rate limiting per API key
- [ ] Monitoring and alerting set up
- [ ] Log aggregation configured
- [ ] Database indexes optimized

---

## 8. Stopping Services

### Docker Compose:

```bash
# Stop all services (data persists)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove everything including volumes
docker-compose down -v
```

### Manual local setup:

- Press `Ctrl+C` in each terminal window
- Or use `pkill redis-server`, `pkill celery`, etc.

---

## 9. Next Steps

- [ ] Test with your own API
- [ ] Configure rate limits for your API
- [ ] Set up monitoring and alerts
- [ ] Add API authentication
- [ ] Deploy to staging/production
- [ ] Integrate with CI/CD pipeline

---

## Support

**Issue:** "Connection refused" when accessing frontend
- **Fix:** Verify `NEXT_PUBLIC_API_URL` environment variable points to running backend

**Issue:** Celery tasks not processing
- **Fix:** Check `docker-compose logs worker` for errors, verify Redis is running

**Issue:** Can't connect to API at localhost:8000
- **Fix:** Run `curl http://localhost:8000/health`, verify backend is running

**Issue:** High memory usage
- **Fix:** Reduce `CONCURRENCY_LIMIT` in `.env`, increase rate limiting (lower `RATE_LIMIT_RPS`)
