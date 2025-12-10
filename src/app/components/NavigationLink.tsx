"use client";

import Link from "next/link";
import { useNavigationLoading } from "@/contexts/NavigationLoadingContext";
import { ReactNode } from "react";

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

  const handleClick = () => {
    // Only show loading for same-origin navigation (not external links or target="_blank")
    if (!target && !href.startsWith("http")) {
      startLoading();
    }
    onClick?.();
  };

  return (
    <Link href={href} onClick={handleClick} target={target} {...props}>
      {children}
    </Link>
  );
}
