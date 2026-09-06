import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn, priorityClass } from '@/lib/utils';

export function Button({
  className,
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  return (
    <button
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition hover:-translate-y-px disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary' && 'bg-ink text-white shadow-sm hover:bg-[#26332f]',
        variant === 'secondary' && 'border bg-white text-ink hover:bg-slate-50',
        variant === 'ghost' && 'text-slate-600 hover:bg-slate-100',
        className,
      )}
      {...props}
    />
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-2xl border bg-white shadow-card', className)}>{children}</div>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      className={cn(
        'inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-bold',
        priorityClass(priority),
      )}
    >
      {priority === 'Excellent' ? 'Excellent opportunity' : priority}
    </span>
  );
}

export function StatusDot({ status }: { status: string }) {
  const tone = ['Won', 'Replied', 'Qualified'].includes(status)
    ? 'bg-emerald-500'
    : ['Contacted', 'Meeting Booked', 'Proposal Sent'].includes(status)
      ? 'bg-blue-500'
      : status === 'Lost'
        ? 'bg-slate-400'
        : 'bg-amber-500';
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium text-slate-600">
      <span className={cn('h-1.5 w-1.5 rounded-full', tone)} />
      {status}
    </span>
  );
}

export function Avatar({
  initials,
  color = '#147D64',
  size = 'md',
}: {
  initials: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <span
      style={{ backgroundColor: `${color}18`, color }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-xl font-bold',
        size === 'sm'
          ? 'h-8 w-8 text-[10px]'
          : size === 'lg'
            ? 'h-14 w-14 text-base'
            : 'h-10 w-10 text-xs',
      )}
    >
      {initials}
    </span>
  );
}

export function ScoreRing({ score, size = 42 }: { score: number; size?: number }) {
  const color =
    score >= 85 ? '#148260' : score >= 70 ? '#3478A5' : score >= 55 ? '#D18A2C' : '#89918E';
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center rounded-full font-extrabold"
      style={{
        width: size,
        height: size,
        color,
        background: `conic-gradient(${color} ${score * 3.6}deg,#EDF0EC 0)`,
        fontSize: size * 0.27,
      }}
    >
      <span className="absolute rounded-full bg-white" style={{ inset: 3 }} />
      <span className="relative">{score}</span>
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  back,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  back?: string;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back && (
          <Link
            href={back}
            className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-ink"
          >
            <ArrowLeft size={14} /> Back
          </Link>
        )}
        {eyebrow && (
          <p className="mb-1 text-xs font-bold uppercase tracking-[.16em] text-brand">{eyebrow}</p>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[28px]">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}

export function Progress({
  value,
  tone = 'brand',
}: {
  value: number;
  tone?: 'brand' | 'blue' | 'amber';
}) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
      <div
        className={cn(
          'h-full rounded-full',
          tone === 'brand' ? 'bg-brand' : tone === 'blue' ? 'bg-blue-500' : 'bg-amber-500',
        )}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle?: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="font-bold tracking-tight text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-xs font-bold text-brand hover:underline"
        >
          View all <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}
