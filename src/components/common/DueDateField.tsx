import React from 'react';

interface DueDateFieldProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

function toInputValue(ts: number | null): string {
  if (!ts) return '';
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function isOverdue(ts: number | null): boolean {
  if (!ts) return false;
  const endOfDay = new Date(ts);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.getTime() < Date.now();
}

export function DueDateField({ value, onChange }: DueDateFieldProps): React.JSX.Element {
  const overdue = isOverdue(value);
  return (
    <input
      type="date"
      title={overdue ? 'Fecha vencida' : 'Fecha de vencimiento'}
      value={toInputValue(value)}
      onChange={(e) => onChange(e.target.value ? new Date(e.target.value).getTime() : null)}
      aria-label="Fecha de vencimiento"
      className={`cursor-pointer rounded-lg border border-line bg-surface px-1.5 py-1 text-[12px] outline-none transition-colors hover:border-lineStrong focus:border-accent ${
        overdue ? 'font-medium text-rose-500' : 'text-muted'
      }`}
    />
  );
}
