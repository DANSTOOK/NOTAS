import React from 'react';
import type { Priority } from '../../state/types';

const LABEL: Record<Exclude<Priority, null>, string> = { low: 'Baja', medium: 'Media', high: 'Alta' };
const OPTIONS: Priority[] = [null, 'low', 'medium', 'high'];

const TEXT: Record<Exclude<Priority, null>, string> = {
  low: 'text-muted',
  medium: 'text-amber-500',
  high: 'text-rose-500'
};

interface PriorityBadgeProps {
  value: Priority;
  onChange: (value: Priority) => void;
}

export function PriorityBadge({ value, onChange }: PriorityBadgeProps): React.JSX.Element {
  return (
    <select
      aria-label="Prioridad"
      value={value ?? ''}
      onChange={(e) => onChange((e.target.value || null) as Priority)}
      className={`cursor-pointer rounded-lg border border-line bg-surface px-1.5 py-1 text-[12px] outline-none transition-colors hover:border-lineStrong focus:border-accent ${
        value ? TEXT[value] : 'text-muted'
      }`}
    >
      {OPTIONS.map((opt) => (
        <option key={opt ?? 'none'} value={opt ?? ''}>
          {opt ? LABEL[opt] : 'Sin prioridad'}
        </option>
      ))}
    </select>
  );
}
