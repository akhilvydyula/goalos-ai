"use client";

export function EnterpriseShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="goalos-app-shell goalos-app-viewport">
      <div className="flex h-full min-h-0">{children}</div>
    </div>
  );
}
