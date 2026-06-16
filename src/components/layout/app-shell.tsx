"use client";

import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { ToastContainer } from "./toast";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
