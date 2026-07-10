# Claude Code Guidelines for Black-Box Fuzzer SaaS

## Project Overview

Black-Box Fuzzer SaaS is an async-polling API fuzzer that tests staging APIs for 5xx errors using OpenAPI/Swagger specs.

**Stack:** Next.js + FastAPI + Celery + Redis + Schemathesis

## Architecture Quick Reference

```
Frontend (Next.js) → FastAPI → Celery Queue → Redis ← Schemathesis Worker
     ↓ (poll every 3s)  ↓ (enqueue job)              ↑ (write results)
   Status Bar       Returns task_id
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `backend/app/api.py` | FastAPI endpoints: POST /fuzz, GET /status/{id}, POST /cancel/{id} |
| `backend/app/worker.py` | Celery task that runs Schemathesis fuzzing |
| `backend/app/schemas.py` | Pydantic models for validation |
| `frontend/app/page.tsx` | Main React component (form → results) |
| `frontend/lib/api.ts` | HTTP client for backend API |
| `docker-compose.yml` | Local dev environment (Redis + API + Worker + Frontend) |

## Common Development Tasks

### Adding a New API Endpoint

1. Add endpoint to `backend/app/api.py`
2. Add request/response models to `backend/app/schemas.py`
3. If it's a long-running task, use Celery: add task to `backend/app/worker.py`
4. Document in API docs (FastAPI auto-generates at `/docs`)

### Modifying Fuzzing Logic

Edit `backend/app/worker.py` → `fuzz_api_task()` function:
- Change Schemathesis configuration
- Modify rate limiting
- Update crash detection logic
- Adjust progress reporting

### Frontend UI Changes

Edit `frontend/app/page.tsx` or components in `frontend/components/`:
- Add new input fields in `FuzzerForm.tsx`
- Modify results display in `Dashboard.tsx`
- Update polling behavior in `page.tsx`

### Running Locally

```bash
# Use Docker (recommended)
docker-compose up -d

# Or manual setup — follow SETUP.md
```

## Code Style

- **Backend:** Follow PEP 8, type hints required
- **Frontend:** React functional components, TypeScript strict mode
- **No comments** unless WHY is non-obvious
- **Minimal abstractions** — one-shot operations don't need helpers

## Testing Changes

### Backend
```bash
# Test API endpoint
curl -X POST http://localhost:8000/fuzz \
  -H "Content-Type: application/json" \
  -d '{
    "target_openapi_url": "https://petstore.swagger.io/v2/swagger.json",
    "consent_acknowledged": true
  }'

# Check status
curl http://localhost:8000/status/{task_id}

# Check worker logs
docker-compose logs -f worker
```

### Frontend
```bash
# Browser dev tools (F12)
# Check Network tab for API calls
# Watch for polling interval (3s)
```

## Performance Considerations

- **Rate Limiting:** Default 10 RPS to avoid WAF blocks — adjust in `.env`
- **Concurrency:** Default 20 parallel tests — tune based on target API capacity
- **Timeout:** Default 5 minutes per job — increase for large APIs
- **Memory:** Schemathesis generates many test cases — watch for OOM with huge specs

## Security Notes

- API keys are NOT stored — pass per-session only
- Consent checkbox is mandatory (user owns the API)
- Rate limiting prevents abuse
- CORS is open in dev (restrict in production)
- No authentication in MVP (add before deploying)

## Deployment Checklist

- [ ] Environment variables configured securely
- [ ] Redis in managed service (not localhost)
- [ ] CORS restricted to production domain
- [ ] HTTPS enforced
- [ ] API authentication added
- [ ] Rate limiting per user/key
- [ ] Error logging configured
- [ ] Database for persistent results (currently in-memory Redis)

## Future Work

See `README.md` → "Future Enhancements" for planned features.

## Questions?

- **Architecture:** Check diagram in README.md
- **Setup:** See SETUP.md
- **API docs:** http://localhost:8000/docs (when running)
- **Logs:** `docker-compose logs [service]`
