"use client";

import { CrashResult } from "@/lib/types";
import { useState } from "react";

interface DashboardProps {
  totalTests: number;
  totalCrashes: number;
  crashes: CrashResult[];
  curlCommands: string[];
}

export default function Dashboard({
  totalTests,
  totalCrashes,
  crashes,
  curlCommands,
}: DashboardProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCurl = (curl: string, index: number) => {
    navigator.clipboard.writeText(curl);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600">Total Tests</div>
          <div className="text-3xl font-bold text-blue-600">{totalTests}</div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600">5xx Crashes</div>
          <div className="text-3xl font-bold text-red-600">{totalCrashes}</div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600">Crash Rate</div>
          <div className="text-3xl font-bold text-orange-600">
            {totalTests > 0 ? ((totalCrashes / totalTests) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      {/* Crashes Table */}
      {crashes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Crashes Detected</h3>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Path
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Status Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {crashes.map((crash, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-blue-600">
                        {crash.method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-gray-700">{crash.path}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {crash.status_code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleCopyCurl(crash.curl_command, idx)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {copiedIndex === idx ? "✓ Copied" : "Copy cURL"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* cURL Commands */}
      {curlCommands.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Reproducing cURL Commands</h3>
          <div className="space-y-2">
            {curlCommands.map((curl, idx) => (
              <div
                key={idx}
                className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-gray-100 font-mono text-xs"
              >
                <div className="flex justify-between items-start gap-4">
                  <code className="flex-1 break-all text-green-400">{curl}</code>
                  <button
                    onClick={() => handleCopyCurl(curl, idx)}
                    className="flex-shrink-0 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-100 text-xs whitespace-nowrap"
                  >
                    {copiedIndex === idx ? "✓" : "Copy"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Crashes Found */}
      {crashes.length === 0 && totalTests > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-lg font-semibold text-green-900">
            ✓ No 5xx crashes detected
          </div>
          <p className="text-sm text-green-700 mt-1">
            Fuzzing completed successfully with {totalTests} test cases.
          </p>
        </div>
      )}
    </div>
  );
}
