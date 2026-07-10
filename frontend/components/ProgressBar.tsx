"use client";

interface ProgressBarProps {
  progress: number;
  status: string;
  testCount: number;
  crashCount: number;
}

export default function ProgressBar({
  progress,
  status,
  testCount,
  crashCount,
}: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Fuzzing Progress</h3>
          <p className="text-xs text-gray-500 mt-1">
            {testCount} tests • {crashCount} crashes found
          </p>
        </div>
        <span className="text-2xl font-bold text-blue-600">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-out ${
            crashCount > 0 ? "bg-red-500" : "bg-blue-600"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Status Text */}
      <p className="text-xs text-gray-500 mt-2">
        Status:{" "}
        <span className={`font-medium ${
          status === "success" ? "text-green-600" :
          status === "failed" ? "text-red-600" :
          "text-blue-600"
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </p>
    </div>
  );
}
