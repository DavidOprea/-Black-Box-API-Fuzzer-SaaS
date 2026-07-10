"use client";

import { useState } from "react";
import { FuzzRequest } from "@/lib/types";

interface FuzzerFormProps {
  onSubmit: (request: FuzzRequest) => Promise<void>;
  isLoading?: boolean;
}

export default function FuzzerForm({ onSubmit, isLoading = false }: FuzzerFormProps) {
  const [url, setUrl] = useState("");
  const [apiKeyHeader, setApiKeyHeader] = useState("");
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (!url.trim()) {
        throw new Error("Please enter a valid OpenAPI/Swagger URL");
      }

      if (!consent) {
        throw new Error("You must acknowledge that you own this API");
      }

      const request: FuzzRequest = {
        target_openapi_url: url,
        api_key_header: apiKeyHeader || undefined,
        api_key_value: apiKeyValue || undefined,
        consent_acknowledged: consent,
      };

      await onSubmit(request);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="space-y-4">
        {/* URL Input */}
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            OpenAPI/Swagger URL *
          </label>
          <input
            id="url"
            type="url"
            placeholder="https://api.example.com/v1/openapi.json"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading || isSubmitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            required
          />
        </div>

        {/* API Key Header */}
        <div>
          <label htmlFor="keyHeader" className="block text-sm font-medium text-gray-700 mb-1">
            API Key Header Name (optional)
          </label>
          <input
            id="keyHeader"
            type="text"
            placeholder="e.g., X-API-Key, Authorization"
            value={apiKeyHeader}
            onChange={(e) => setApiKeyHeader(e.target.value)}
            disabled={isLoading || isSubmitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
        </div>

        {/* API Key Value */}
        {apiKeyHeader && (
          <div>
            <label htmlFor="keyValue" className="block text-sm font-medium text-gray-700 mb-1">
              API Key Value
            </label>
            <input
              id="keyValue"
              type="password"
              placeholder="Your API key"
              value={apiKeyValue}
              onChange={(e) => setApiKeyValue(e.target.value)}
              disabled={isLoading || isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>
        )}

        {/* Consent Checkbox */}
        <div className="flex items-start">
          <input
            id="consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            disabled={isLoading || isSubmitting}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="consent" className="ml-2 block text-sm text-gray-700">
            I own this API and understand that fuzzing may modify data and trigger 5xx errors
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isSubmitting || !url || !consent}
          className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {isSubmitting ? "Submitting..." : "Start Fuzzing"}
        </button>
      </div>
    </form>
  );
}
