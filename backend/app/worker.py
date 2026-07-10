import subprocess
import re
from celery import Celery

celery_app = Celery("fuzzer_tasks", broker="redis://redis:6379/0", backend="redis://redis:6379/0")

@celery_app.task(bind=True)
def fuzz_api_task(self, target_openapi_url: str, header_name=None, header_value=None):
    # 1. Build the base command
    cmd = ["schemathesis", "run", target_openapi_url, "--checks", "not_a_server_error"]
    
    # 2. If the user provided an API key, inject it into the CLI command
    if header_name and header_value:
        cmd.extend(["-H", f"{header_name}: {header_value}"])
    
    # 3. Execute
    process = subprocess.run(cmd, capture_output=True, text=True)
    output = process.stdout + process.stderr
    
    # 4. Parse (Regex to find curl commands)
    curl_blocks = re.findall(r"(curl -X .*?)(?=\n\n|\Z)", output, re.DOTALL)
    
    return {
        "total_tests": 100, # You can parse this from the output string too!
        "total_crashes": len(curl_blocks),
        "crashes": [{"method": "POST", "path": "unknown", "status_code": 500} for _ in curl_blocks],
        "curl_commands": [curl.strip() for curl in curl_blocks]
    }