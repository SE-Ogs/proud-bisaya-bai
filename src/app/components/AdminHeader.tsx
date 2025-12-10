"use client";

import React, { useEffect, useState } from "react";
import { NavigationLink as Link } from "@/app/components/NavigationLink";

type NavItem = {
  label: string;
  href: string;
};

const defaultItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Articles", href: "/articles" },
  { label: "Content Editor", href: "/admin/content" },
  { label: "Contact Form Submissions", href: "/admin/contact-form" },
  { label: "Back to Landing Page", href: "/home" },
];

export default function AdminHeader({
  items = defaultItems,
}: {
  items?: NavItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const width = isOpen ? "240px" : "0px";
      document.documentElement.style.setProperty("--sidebar-width", width);
    }
  }, [isOpen]);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/images/pbb_hd_logo.webp"
              alt="Proud Bisaya Bai"
              width={64}
              height={64}
            />
            <span className="text-base font-semibold text-gray-700">
              PBB Admin
            </span>
          </div>
          <button
            aria-label={isOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsOpen((v) => !v)}
            className="rounded p-2 text-xl text-red-600 hover:text-red-700 hover:bg-gray-100"
            title={isOpen ? "Close" : "Open"}
          >
            {isOpen ? "x" : "☰"}
          </button>
        </div>
      </div>

      <aside
        className="fixed top-0 right-0 h-screen z-50 bg-white border-l border-gray-200 shadow-lg"
        style={{
          width: isOpen ? 240 : 0,
          overflow: "hidden",
          transition: "width 200ms ease",
        }}
      >
        {isOpen && (
          <div className="flex flex-col h-full">
            <div className="sticky top-0 z-10 bg-white">
              <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200">
                <span className="text-sm font-semibold text-gray-700">
                  Menu
                </span>
                <button
                  aria-label="Close menu"
                  onClick={() => setIsOpen(false)}
                  className="rounded p-2 text-xl text-black hover:text-black hover:bg-gray-200"
                  title="Close"
                >
                  x
                </button>
              </div>
            </div>
            <nav className="px-2 py-3 space-y-1 overflow-y-auto flex-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 rounded px-3 py-2 text-sm text-black font-bold hover:bg-gray-100"
                  title={item.label}
                  onClick={() => setIsOpen(false)}
                  target={item.label === "Articles" ? "_blank" : undefined}
                  rel={
                    item.label === "Articles"
                      ? "noopener noreferrer"
                      : undefined
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-gray-200 p-3">
              <form action="/api/admin/auth/logout" method="post">
                <button
                  type="submit"
                  className="w-full rounded px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
