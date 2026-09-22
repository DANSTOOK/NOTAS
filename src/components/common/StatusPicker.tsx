import React from 'react';
import * as m from 'motion/react-m';
import type { NoteStatus } from '../../state/types';
import { spatial } from '../../styles/motionTokens';
import { Icon, type IconName } from './Icon';

export const STATUS_ORDER: NoteStatus[] = ['todo', 'doing', 'done'];

export const STATUS_LABEL: Record<NoteStatus, string> = {
  todo: 'Pendiente',
  doing: 'En curso',
  done: 'Hecha'
};

const STATUS_ICON: Record<NoteStatus, IconName> = { todo: 'circle', doing: 'half', done: 'check' };

const ACTIVE_TEXT: Record<NoteStatus, string> = {
  todo: 'text-ink',
  doing: 'text-note-blue',
  done: 'text-note-green'
};

interface StatusPickerProps {
  value: NoteStatus;
  onChange: (status: NoteStatus) => void;
  layoutId: string;
}

/** Selector segmentado de estado: la píldora activa se desliza al cambiar. */
export function StatusPicker({ value, onChange, layoutId }: StatusPickerProps): React.JSX.Element {
  return (
    <div
      role="radiogroup"
      aria-label="Estado de la tarea"
      className="flex gap-0.5 rounded-xl bg-surface2 p-0.5 ring-1 ring-inset ring-line"
    >
      {STATUS_ORDER.map((status) => {
        const active = status === value;
        return (
          <button
            key={status}
            type="button"
            role="radio"
            aria-checked={active}
            title={STATUS_LABEL[status]}
            onClick={() => onChange(status)}
            className={`relative flex items-center gap-1.5 rounded-[10px] px-2.5 py-1 text-[12px] font-medium transition-colors ${
              active ? ACTIVE_TEXT[status] : 'text-muted hover:text-ink'
            }`}
          >
            {active && (
              <m.span
                layoutId={layoutId}
                transition={spatial.fast}
                className="absolute inset-0 rounded-[10px] bg-surface shadow-e1 ring-1 ring-line"
              />
            )}
            <span className="relative">
              <Icon name={STATUS_ICON[status]} size={13} />
            </span>
            <span className="relative">{STATUS_LABEL[status]}</span>
          </button>
        );
      })}
    </div>
  );
}
