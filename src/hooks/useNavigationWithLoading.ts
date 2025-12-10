"use client";

import { useRouter } from 'next/navigation';
import { useNavigationLoading } from '@/contexts/NavigationLoadingContext';

export function useNavigationWithLoading() {
  const router = useRouter();
  const { startLoading } = useNavigationLoading();

  const push = (href: string) => {
    // Only show loading for same-origin navigation
    if (!href.startsWith('http')) {
      startLoading();
    }
    router.push(href);
  };

  const replace = (href: string) => {
    // Only show loading for same-origin navigation
    if (!href.startsWith('http')) {
      startLoading();
    }
    router.replace(href);
  };

  return { push, replace, router };
}

