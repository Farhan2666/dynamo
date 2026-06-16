"use client";

import Link from "next/link";
import { useUIStore } from "@/lib/store";
import { Button } from "@/components/ui";

export function Navbar() {
  const { toggleSidebar } = useUIStore();

  return (
    <nav className="sticky top-0 z-50 w-full h-14 border-b border-surface-tertiary bg-white/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-soft hover:bg-surface-tertiary transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
              <span className="text-white font-heading font-bold text-sm">D</span>
            </div>
            <span className="font-heading font-bold text-heading-sm hidden sm:block">
              DYNAMO
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/create">
            <Button variant="primary" size="sm">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              New Page
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
