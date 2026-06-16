"use client";

export function Sidebar() {
  return (
    <aside className="w-56 h-[calc(100vh-3.5rem)] border-r border-surface-tertiary bg-surface-secondary/50 hidden lg:flex flex-col overflow-y-auto">
      <div className="p-4 space-y-1">
        <div className="text-caption font-medium text-text-muted uppercase tracking-wider px-3 py-2">
          Projects
        </div>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-soft text-body-sm text-text-secondary hover:bg-surface-tertiary transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-brand-primary">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          New Generation
        </button>
      </div>

      <div className="flex-1 px-4 space-y-1">
        <div className="text-caption font-medium text-text-muted uppercase tracking-wider px-3 py-2">
          Recent
        </div>
        <div className="text-center py-12">
          <div className="text-caption text-text-muted">
            No projects yet
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-surface-tertiary">
        <div className="flex items-center gap-3 px-3 py-2 rounded-soft hover:bg-surface-tertiary transition-colors cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-secondary to-teal-600 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-body-sm font-medium truncate">Settings</div>
            <div className="text-caption text-text-muted">API Key & Providers</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
