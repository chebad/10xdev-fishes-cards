import React from "react";

interface LoadingSkeletonProps {
  variant?: "card" | "list" | "controls" | "modal";
  count?: number;
  className?: string;
}

/**
 * Komponent skeleton loading dla różnych wariantów UI
 */
export default function LoadingSkeleton({ 
  variant = "card", 
  count = 1, 
  className = "" 
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case "card":
        return (
          <div className={`animate-pulse space-y-4 ${className}`}>
            <div className="bg-gray-200 rounded-lg p-6 space-y-4">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded w-5/6"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-8 bg-gray-300 rounded w-20"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-300 rounded w-16"></div>
                  <div className="h-8 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        );

      case "list":
        return (
          <div className={`animate-pulse space-y-4 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="bg-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-8 w-8 bg-gray-300 rounded"></div>
                    <div className="h-8 w-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded w-4/5"></div>
                </div>
              </div>
            ))}
          </div>
        );

      case "controls":
        return (
          <div className={`animate-pulse bg-gray-50 rounded-lg p-6 space-y-4 ${className}`}>
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-6 bg-gray-300 rounded w-32"></div>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </div>
              <div className="h-10 bg-gray-300 rounded w-32"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-16"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        );

      case "modal":
        return (
          <div className={`animate-pulse space-y-6 ${className}`}>
            <div className="space-y-2">
              <div className="h-6 bg-gray-300 rounded w-48"></div>
              <div className="h-4 bg-gray-300 rounded w-64"></div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
                <div className="h-24 bg-gray-300 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <div className="h-10 bg-gray-300 rounded w-20"></div>
              <div className="h-10 bg-gray-300 rounded w-28"></div>
            </div>
          </div>
        );

      default:
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="h-4 bg-gray-300 rounded"></div>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {renderSkeleton()}
    </div>
  );
} 