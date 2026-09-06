'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ChevronDown,
  ClipboardCheck,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Mail,
  Menu,
  Search,
  Settings,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/businesses', label: 'Businesses', icon: BriefcaseBusiness },
  { href: '/niches', label: 'Niches', icon: ChartNoAxesCombined },
  { href: '/research', label: 'Research', icon: FlaskConical },
  { href: '/audits', label: 'Audits', icon: ClipboardCheck },
  { href: '/prospects', label: 'Top prospects', icon: Target },
  { href: '/pipeline', label: 'Pipeline', icon: BarChart3, badge: '3' },
  { href: '/outreach', label: 'Outreach', icon: Mail },
  { href: '/reports', label: 'Reports', icon: FileText },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-canvas">
      {open && (
        <button
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink/30 lg:hidden"
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[238px] flex-col bg-[#17241F] text-white transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-[72px] items-center justify-between px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#39B98D] text-[#10241D]">
              <Sparkles size={18} strokeWidth={2.5} />
            </span>
            <span className="text-[17px] font-bold tracking-tight">Northstar</span>
          </Link>
          <button className="text-white/50 lg:hidden" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="mx-4 mb-5 rounded-xl border border-white/10 bg-white/[.055] px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Workspace</p>
          <div className="mt-1 flex items-center justify-between text-xs font-semibold">
            <span>San Jose market</span>
            <ChevronDown size={13} className="text-white/40" />
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {navigation.map((item) => {
            const active = path === item.href || path.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'group flex h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-medium text-white/62 transition hover:bg-white/[.06] hover:text-white',
                  active && 'bg-white/[.105] text-white shadow-inner',
                )}
              >
                <item.icon
                  size={17}
                  strokeWidth={active ? 2.25 : 1.8}
                  className={cn(
                    active ? 'text-[#56D2A7]' : 'text-white/45 group-hover:text-white/70',
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="rounded-full bg-[#3AC193] px-1.5 py-0.5 text-[9px] font-extrabold text-[#10241D]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-3">
          <Link
            href="/settings"
            className={cn(
              'flex h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-medium text-white/60 hover:bg-white/[.06] hover:text-white',
              path === '/settings' && 'bg-white/[.1] text-white',
            )}
          >
            <Settings size={17} /> Settings
          </Link>
          <div className="mt-2 flex items-center gap-3 border-t border-white/10 px-2 pt-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E3A955] text-xs font-extrabold text-[#31210E]">
              SR
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">Shafiq Rehman</p>
              <p className="text-[10px] text-white/40">Administrator</p>
            </div>
            <ChevronDown size={13} className="text-white/35" />
          </div>
        </div>
      </aside>
      <div className="lg:pl-[238px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center border-b bg-white/90 px-4 backdrop-blur-md sm:px-7">
          <button onClick={() => setOpen(true)} className="mr-3 text-slate-500 lg:hidden">
            <Menu size={22} />
          </button>
          <div className="relative hidden w-full max-w-lg sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              aria-label="Global search"
              className="h-10 w-full rounded-xl border-0 bg-slate-100/75 pl-10 pr-4 text-sm outline-none ring-brand/20 placeholder:text-slate-400 focus:ring-2"
              placeholder="Search businesses, niches, or type “HVAC score > 75”"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 sm:inline">
              Demo workspace
            </span>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100">
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-coral ring-2 ring-white" />
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 sm:p-7 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
