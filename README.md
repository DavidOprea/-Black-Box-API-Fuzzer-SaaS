# Black-Box API Fuzzer
 
A containerized DevSecOps testing utility designed to stress-test APIs and uncover edge-case 5xx server errors before public deployment. This fuzzer consumes OpenAPI specifications and leverages property-based testing to automatically generate and execute thousands of mutated HTTP requests against target endpoints.
 
## Architecture
 
This project is built with a decoupled, asynchronous microservices architecture to ensure the UI remains responsive during long-running fuzzing campaigns:
 
* **Frontend:** Next.js (React)
* **Backend:** FastAPI (Python)
* **Task Queue:** Celery
* **Message Broker & Cache:** Redis
* **Fuzzing Engine:** Schemathesis
## Getting Started
 
### Prerequisites
 
* Docker & Docker Compose
* (Optional) Python 3.10+ and Node.js if running manually
### Installation via Docker Compose (Recommended)
 
The easiest way to spin up the entire stack is using Docker Compose. This ensures Redis, the FastAPI backend, the Celery worker, and the Next.js frontend are correctly networked.
 
```bash
# Clone the repository
git clone https://github.com/your-username/black-box-api-fuzzer.git
cd black-box-api-fuzzer
 
# Build and spin up the containers
docker-compose up --build
```
 
The services will be available at:
 
* Frontend UI: `http://localhost:3000`
* Backend API: `http://localhost:8000`
### Manual Setup (Development)
 
If you need to run the services bare-metal for debugging:
 
1. Start Redis:
```bash
redis-server
```
 
2. Start the Backend (FastAPI):
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
 
3. Start the Celery Worker:
```bash
cd backend
celery -A worker.celery_app worker --loglevel=info
```
 
4. Start the Frontend:
```bash
cd frontend
npm install
npm run dev
```
 
## Network Troubleshooting: Fuzzing `localhost`
 
By default, Docker containers run in isolated networks. If you are using this tool to fuzz an API that is currently running on your host machine's `localhost` (e.g., a local staging environment), the fuzzer container will not be able to reach it via `http://localhost`.
 
**The Fix:** Use `host.docker.internal` as the target domain.
 
When submitting a fuzzing job through the UI, if your target API is running on port `5000` of your host machine, set the target URL to:
 
```
http://host.docker.internal:5000/openapi.json
```
 
This tells the Docker container to route the malicious payloads out of the container network and directly to your host machine's local ports specified on the OpenAPI JSON files.
 
## API Documentation
 
The FastAPI backend exposes the following primary endpoints for integration:
 
### `POST /api/fuzz/start`
 
Initiates a new asynchronous fuzzing campaign.
 
* **Payload:** `{ "openapi_url": "https://...", "target_url": "http://..." }`
* **Response:** `{ "task_id": "uuid-string" }`
### `GET /api/fuzz/status/{task_id}`
 
Polls the current status and metrics of a running fuzzing campaign.
 
* **Response:** `{ "status": "running", "payloads_sent": 1450, "errors_found": 2 }`
### `POST /api/fuzz/cancel/{task_id}`
 
Terminates an ongoing Celery worker task.
 
## Future Roadmap
 
* File upload support for local OpenAPI/Swagger JSON specifications
* Persistent test campaign history
* Exportable PDF/HTML vulnerability reports

## License

MIT

## Support

For issues or questions:
1. Check Docker logs: `docker-compose logs`
2. Verify Redis connectivity: `redis-cli ping`
3. Test API directly: `curl http://localhost:8000/docs`