'use client';

import { useEffect, useRef, useState } from 'react';
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
  LogOut,
  Mail,
  Menu,
  Search,
  Settings,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from './auth-provider';
import { useNotifications } from './notification-provider';
import { useMarkets } from './market-provider';

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
  const { user, signOut } = useAuth();
  const { notifications, markAllRead } = useNotifications();
  const { activeMarket, markets, selectMarket } = useMarkets();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const workspaceMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!workspaceMenuRef.current?.contains(target)) setWorkspaceOpen(false);
      if (!accountMenuRef.current?.contains(target)) setAccountOpen(false);
      if (!notificationMenuRef.current?.contains(target)) setNotificationOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setWorkspaceOpen(false);
      setAccountOpen(false);
      setNotificationOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);
  const initials =
    user?.name
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? 'NS';
  const role = user?.role ? `${user.role[0]?.toUpperCase()}${user.role.slice(1)}` : '';
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
        <div ref={workspaceMenuRef} className="relative mx-4 mb-5">
          <button
            type="button"
            aria-label="Select workspace"
            aria-expanded={workspaceOpen}
            onClick={() => {
              setWorkspaceOpen((current) => !current);
              setNotificationOpen(false);
              setAccountOpen(false);
            }}
            className="w-full rounded-xl border border-white/10 bg-white/[.055] px-3 py-2.5 text-left hover:bg-white/[.08]"
          >
            <span className="block text-[10px] font-bold uppercase tracking-wider text-white/40">
              Workspace
            </span>
            <span className="mt-1 flex items-center justify-between text-xs font-semibold">
              <span className="truncate">{activeMarket.city} market</span>
              <ChevronDown
                size={13}
                className={cn('text-white/40 transition-transform', workspaceOpen && 'rotate-180')}
              />
            </span>
          </button>
          {workspaceOpen && (
            <div className="absolute left-0 right-0 top-full z-[60] mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#21312B] p-1 shadow-2xl">
              <div className="max-h-60 overflow-y-auto">
                {markets.map((market) => {
                  const selected = market.id === activeMarket.id;
                  return (
                    <button
                      key={market.id}
                      type="button"
                      aria-label={`Select ${market.city} market`}
                      onClick={() => {
                        selectMarket(market.id);
                        setWorkspaceOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-white/[.08]',
                        selected && 'bg-white/[.08]',
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-white">
                          {market.city} market
                        </span>
                        <span className="mt-0.5 block truncate text-[9px] text-white/40">
                          {selected ? 'Current workspace' : `${market.region}, ${market.country}`}
                        </span>
                      </span>
                      {selected && <span className="h-2 w-2 shrink-0 rounded-full bg-[#56D2A7]" />}
                    </button>
                  );
                })}
              </div>
              <Link
                href="/settings/markets"
                onClick={() => {
                  setWorkspaceOpen(false);
                  setOpen(false);
                }}
                className="mt-1 block rounded-lg px-3 py-2 text-xs font-semibold text-white/65 hover:bg-white/[.08] hover:text-white"
              >
                Manage markets
              </Link>
            </div>
          )}
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {navigation.map((item) => {
            const active = path === item.href || path.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setOpen(false);
                  setWorkspaceOpen(false);
                }}
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
          <div ref={accountMenuRef} className="relative mt-2 border-t border-white/10 pt-3">
            {accountOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-white/10 bg-[#21312B] p-1 shadow-2xl">
                <p className="truncate px-3 py-2 text-[10px] text-white/45">{user?.email}</p>
                <button
                  type="button"
                  onClick={signOut}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-white/75 hover:bg-white/[.08] hover:text-white"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            )}
            <button
              type="button"
              aria-label="Open account menu"
              aria-expanded={accountOpen}
              onClick={() => {
                setAccountOpen((current) => !current);
                setNotificationOpen(false);
                setWorkspaceOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-1 text-left hover:bg-white/[.06]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E3A955] text-xs font-extrabold text-[#31210E]">
                {initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold">{user?.name}</span>
                <span className="block text-[10px] text-white/40">{role}</span>
              </span>
              <ChevronDown size={13} className="text-white/35" />
            </button>
          </div>
        </div>
      </aside>
      <div className="lg:pl-[238px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center border-b bg-white/90 px-4 backdrop-blur-md sm:px-7">
          <button
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
            className="mr-3 text-slate-500 lg:hidden"
          >
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
          <div ref={notificationMenuRef} className="relative ml-auto flex items-center gap-2">
            <button
              type="button"
              aria-label="Open notifications"
              aria-expanded={notificationOpen}
              onClick={() => {
                setNotificationOpen((current) => !current);
                setAccountOpen(false);
                setWorkspaceOpen(false);
              }}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-coral ring-2 ring-white" />
              )}
            </button>
            {notificationOpen && (
              <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-ink">Notifications</p>
                    <p className="text-[10px] text-slate-400">
                      {notifications.length ? `${notifications.length} unread` : 'You’re all caught up'}
                    </p>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-[10px] font-bold text-brand hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.length > 0 ? (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <Link
                        key={notification.id}
                        href={notification.href}
                        onClick={() => setNotificationOpen(false)}
                        className="flex gap-3 px-4 py-3 hover:bg-slate-50"
                      >
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-coral" />
                        <span>
                          <span className="block text-xs font-semibold text-ink">
                            {notification.title}
                          </span>
                          <span className="mt-1 block text-[10px] text-slate-400">
                            {notification.detail}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-5 py-8 text-center">
                    <Bell className="mx-auto text-slate-300" size={24} />
                    <p className="mt-3 text-xs font-bold text-ink">No notifications</p>
                    <p className="mt-1 text-[10px] text-slate-400">New activity will appear here.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 sm:p-7 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
