"use client";

import Link from "next/link";
import { useNavigationLoading } from "@/contexts/NavigationLoadingContext";
import { ReactNode, startTransition } from "react";

interface NavigationLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  target?: string;
  rel?: string;
  title?: string;
  ariaLabel?: string;
  [key: string]: any; // For other Link props
}

export function NavigationLink({
  href,
  children,
  onClick,
  target,
  ...props
}: NavigationLinkProps) {
  const { startLoading } = useNavigationLoading();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Only show loading for same-origin navigation (not external links or target="_blank")
    if (!target && !href.startsWith("http")) {
      // Start loading immediately before navigation
      startLoading();
      // Use startTransition to ensure loading state is set before navigation
      startTransition(() => {
        // Call onClick if provided
        onClick?.();
      });
    } else {
      // For external links, just call onClick
      onClick?.();
    }
  };

  return (
    <Link href={href} onClick={handleClick} target={target} {...props}>
      {children}
    </Link>
  );
}
