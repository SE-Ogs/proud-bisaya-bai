"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface NavigationLoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const NavigationLoadingContext = createContext<
  NavigationLoadingContextType | undefined
>(undefined);

const MIN_LOADING_TIME = 300; // Minimum time to show loading overlay (ms)

export function NavigationLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const loadingStartTimeRef = useRef<number | null>(null);
  const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Stop loading when route actually changes, but ensure minimum display time
  useEffect(() => {
    if (!isLoading) return;

    // Clear any existing timeout
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
    }

    // Calculate how long loading has been showing
    const elapsed = loadingStartTimeRef.current 
      ? Date.now() - loadingStartTimeRef.current 
      : MIN_LOADING_TIME;
    
    const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsed);

    // Stop loading after remaining minimum time
    stopTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      loadingStartTimeRef.current = null;
    }, remainingTime);
  }, [pathname]); // Only depend on pathname, not isLoading

  const startLoading = () => {
    loadingStartTimeRef.current = Date.now();
    setIsLoading(true);
  };

  const stopLoading = () => {
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    setIsLoading(false);
    loadingStartTimeRef.current = null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
      }
    };
  }, []);

  return (
    <NavigationLoadingContext.Provider
      value={{ isLoading, startLoading, stopLoading }}
    >
      {children}
      {/* Global loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            {/* Spinner - using custom orange color */}
            <div className="w-12 h-12 border-4 border-[var(--custom-orange)] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-700 font-medium">Loading...</p>
          </div>
        </div>
      )}
    </NavigationLoadingContext.Provider>
  );
}

export function useNavigationLoading() {
  const context = useContext(NavigationLoadingContext);
  if (!context) {
    throw new Error(
      "useNavigationLoading must be used within NavigationLoadingProvider"
    );
  }
  return context;
}
