import { FuzzRequest, FuzzResponse, StatusResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function validateTarget(url: string): Promise<{ status: string, message?: string }> {
  const response = await fetch(`${API_BASE}/validate-target?url=${encodeURIComponent(url)}`, {
    method: "POST",
  });
  
  if (!response.ok) {
    throw new Error("Validation service unavailable");
  }
  
  return response.json();
}

export async function submitFuzzJob(request: FuzzRequest): Promise<FuzzResponse> {
  const response = await fetch(`${API_BASE}/fuzz`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to submit job");
  }

  return response.json();
}

export async function getJobStatus(taskId: string): Promise<StatusResponse> {
  const response = await fetch(`${API_BASE}/status/${taskId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to retrieve job status");
  }

  return response.json();
}

export async function cancelJob(taskId: string): Promise<any> {
  const response = await fetch(`${API_BASE}/cancel/${taskId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to cancel job");
  }

  return response.json();
}

export async function getStats(): Promise<any> {
  const response = await fetch(`${API_BASE}/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to retrieve stats");
  }

  return response.json();
}
