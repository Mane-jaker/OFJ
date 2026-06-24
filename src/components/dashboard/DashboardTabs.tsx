"use client";

import type { KeyboardEvent, ReactNode } from "react";

export interface Tab {
  id: string;
  label: string;
  badge?: ReactNode;
}

interface DashboardTabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  children: ReactNode;
}

export function DashboardTabs({
  tabs,
  active,
  onChange,
  children,
}: DashboardTabsProps) {
  function handleKeyDown(e: KeyboardEvent, index: number) {
    let nextIndex: number | null = null;

    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const nextTab = tabs[nextIndex];
      onChange(nextTab.id);
      const el = document.getElementById(`tab-${nextTab.id}`);
      el?.focus();
    }
  }

  return (
    <div className="mt-8">
      <nav role="tablist" className="flex gap-1 border-b border-[var(--color-border)]" aria-label="Dashboard sections">
        {tabs.map((tab, i) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-accent)] ${
                isActive
                  ? "text-[var(--color-fg)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-fg)]"
              }`}
            >
              {tab.label}
              {tab.badge && (
                <span className="ml-2 text-xs">{tab.badge}</span>
              )}
              {isActive && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[var(--color-accent)]" />
              )}
            </button>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
