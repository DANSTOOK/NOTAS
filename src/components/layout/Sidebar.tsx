import React from 'react';
import * as m from 'motion/react-m';
import { pressable, spatial } from '../../styles/motionTokens';
import type { NoteStatus } from '../../state/types';
import { Icon, type IconName } from '../common/Icon';

export type Filter = NoteStatus | 'all';

const NAV: { key: Filter; label: string; icon: IconName }[] = [
  { key: 'all', label: 'Todas', icon: 'note' },
  { key: 'todo', label: 'Pendientes', icon: 'circle' },
  { key: 'doing', label: 'En curso', icon: 'half' },
  { key: 'done', label: 'Hechas', icon: 'check' }
];

const ACCENT: Record<Filter, string> = {
  all: 'text-accent',
  todo: 'text-note-gray',
  doing: 'text-note-blue',
  done: 'text-note-green'
};

interface SidebarProps {
  filter: Filter;
  onFilter: (f: Filter) => void;
  counts: Record<Filter, number>;
  onCreate: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Sidebar({ filter, onFilter, counts, onCreate, theme, onToggleTheme }: SidebarProps): React.JSX.Element {
  return (
    <aside className="flex w-56 shrink-0 flex-col gap-4 border-r border-line bg-surface px-3 py-4">
      <div className="flex items-center gap-2 px-1">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white shadow-e1">
          <Icon name="note" size={16} />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">Notas</span>
      </div>

      <m.button
        type="button"
        onClick={onCreate}
        title="Nueva nota (Ctrl+N)"
        whileHover={{ scale: 1.015 }}
        whileTap={pressable.whileTap}
        transition={pressable.transition}
        className="flex items-center justify-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-[13px] font-medium text-white shadow-e1"
      >
        <Icon name="plus" size={15} />
        Nueva nota
      </m.button>

      <nav className="flex flex-col gap-0.5">
        {NAV.map(({ key, label, icon }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onFilter(key)}
              className={`relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors ${
                active ? 'text-ink' : 'text-muted hover:bg-surfaceHover hover:text-ink'
              }`}
            >
              {active && (
                <m.span
                  layoutId="nav-pill"
                  transition={spatial.fast}
                  className="absolute inset-0 rounded-lg bg-accentSoft ring-1 ring-inset ring-line"
                />
              )}
              <span className={`relative ${active ? ACCENT[key] : ''}`}>
                <Icon name={icon} size={15} />
              </span>
              <span className="relative flex-1 text-left">{label}</span>
              <span className={`relative text-[11px] tabular-nums ${active ? 'text-ink' : 'text-faint'}`}>{counts[key]}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 px-1">
        <button
          type="button"
          onClick={onToggleTheme}
          className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-[12px] text-muted transition-colors hover:bg-surfaceHover hover:text-ink"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
          {theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
        </button>
        <p className="px-1.5 text-[11px] leading-relaxed text-faint">
          <kbd className="font-sans">Ctrl+N</kbd> nueva · <kbd className="font-sans">Ctrl+Z</kbd> deshacer
          <br />
          <kbd className="font-sans">Ctrl+V</kbd> pega imágenes en la nota
        </p>
      </div>
    </aside>
  );
}
