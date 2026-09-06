import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', { notation: value > 9999 ? 'compact' : 'standard' }).format(
    value,
  );
}
export function priorityFor(score: number) {
  return score >= 85 ? 'Excellent' : score >= 70 ? 'High' : score >= 55 ? 'Medium' : 'Low';
}
export function priorityClass(priority: string) {
  return priority === 'Excellent'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : priority === 'High'
      ? 'border-blue-200 bg-blue-50 text-blue-700'
      : priority === 'Medium'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-slate-200 bg-slate-50 text-slate-600';
}
export function downloadCsv(filename: string, rows: Record<string, string | number | undefined>[]) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]!);
  const csv = [keys, ...rows.map((row) => keys.map((key) => row[key] ?? ''))]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
