import React from 'react';
import * as m from 'motion/react-m';
import { duration, easing } from '../../styles/motionTokens';
import { Icon } from '../common/Icon';

interface EmptyStateProps {
  title: string;
  hint: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, hint, actionLabel, onAction }: EmptyStateProps): React.JSX.Element {
  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.medium2, ease: easing.emphasizedDecelerate }}
      className="mx-auto mt-16 flex max-w-sm flex-col items-center text-center"
    >
      <svg width="132" height="104" viewBox="0 0 132 104" fill="none" aria-hidden="true">
        <rect x="16" y="14" width="62" height="74" rx="8" fill="var(--surface)" stroke="var(--border-strong)" />
        <rect x="26" y="26" width="32" height="5" rx="2.5" fill="var(--note-yellow)" />
        <rect x="26" y="39" width="42" height="4" rx="2" fill="var(--border-strong)" />
        <rect x="26" y="49" width="34" height="4" rx="2" fill="var(--border-strong)" />
        <rect x="26" y="59" width="38" height="4" rx="2" fill="var(--border-strong)" />
        <rect x="54" y="30" width="62" height="60" rx="8" fill="var(--surface-2)" stroke="var(--border-strong)" />
        <circle cx="70" cy="46" r="5" fill="var(--note-blue)" opacity="0.7" />
        <path d="M58 78l14-14 10 9 8-6 14 11" stroke="var(--note-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <h3 className="mt-5 text-[15px] font-semibold tracking-tight text-ink">{title}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{hint}</p>

      {actionLabel && onAction && (
        <m.button
          type="button"
          onClick={onAction}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          className="mt-5 flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-[13px] font-medium text-white shadow-e1"
        >
          <Icon name="plus" size={15} />
          {actionLabel}
        </m.button>
      )}
    </m.div>
  );
}
