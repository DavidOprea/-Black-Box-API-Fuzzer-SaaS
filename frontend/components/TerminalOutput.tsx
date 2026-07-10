"use client";

import { useEffect, useRef } from "react";

interface TerminalOutputProps {
  lines: string[];
  isActive: boolean;
}

export default function TerminalOutput({ lines, isActive }: TerminalOutputProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-900">Live Output</h3>
        {isActive && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="w-2 h-2 bg-green-600 rounded-full mr-1.5 animate-pulse" />
            Running
          </span>
        )}
      </div>

      {/* Terminal Window */}
      <div
        ref={containerRef}
        className="w-full h-64 bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-y-auto font-mono text-sm text-gray-100"
      >
        {lines.length === 0 ? (
          <div className="text-gray-500">Waiting for fuzzing to start...</div>
        ) : (
          lines.map((line, idx) => (
            <div key={idx} className="text-green-400 break-all">
              {line}
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-gray-500 mt-2">
        {lines.length} lines • Auto-scrolling enabled
      </p>
    </div>
  );
}
