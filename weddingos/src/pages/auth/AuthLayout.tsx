import type { ReactNode } from 'react';
import { Heart } from 'lucide-react';

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="bg-surface-subtle flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="bg-brand-700 flex h-9 w-9 items-center justify-center rounded-lg text-white">
            <Heart className="h-5 w-5" fill="currentColor" />
          </div>
          <div>
            <p className="text-ink text-sm font-bold">WeddingOS</p>
            <p className="text-ink-faint text-xs">Wedding Command Center</p>
          </div>
        </div>
        <div className="border-line bg-surface rounded-xl border p-6 shadow-sm">
          <h1 className="text-ink text-lg font-bold">{title}</h1>
          {subtitle && <p className="text-ink-soft mt-1 text-sm">{subtitle}</p>}
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
