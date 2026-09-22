import React from 'react';
import * as m from 'motion/react-m';
import { spatial } from '../../styles/motionTokens';
import { Icon } from '../common/Icon';

interface TopBarProps {
  title: string;
  count: number;
  query: string;
  onQuery: (q: string) => void;
  view: 'grid' | 'list';
  onView: (v: 'grid' | 'list') => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

function ToolButton({
  label,
  icon,
  onClick,
  disabled,
  active
}: {
  label: string;
  icon: 'undo' | 'redo' | 'grid' | 'list';
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}): React.JSX.Element {
  return (
    <m.button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      transition={spatial.fast}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-30 ${
        active ? 'bg-accentSoft text-accent' : 'text-muted enabled:hover:bg-surfaceHover enabled:hover:text-ink'
      }`}
    >
      <Icon name={icon} size={16} />
    </m.button>
  );
}

export function TopBar({
  title,
  count,
  query,
  onQuery,
  view,
  onView,
  undo,
  redo,
  canUndo,
  canRedo
}: TopBarProps): React.JSX.Element {
  return (
    <header className="flex items-center gap-3 border-b border-line bg-surface/70 px-5 py-3 backdrop-blur">
      <div className="flex min-w-0 items-baseline gap-2">
        <h2 className="truncate text-[15px] font-semibold tracking-tight">{title}</h2>
        <span className="text-[12px] tabular-nums text-faint">{count}</span>
      </div>

      <div className="relative ml-4 min-w-0 flex-1 max-w-sm">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint">
          <Icon name="search" size={15} />
        </span>
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Buscar notas y tareas…"
          className="w-full rounded-lg border border-line bg-surface2 py-1.5 pl-8 pr-8 text-[13px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQuery('')}
            aria-label="Limpiar búsqueda"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-faint hover:text-ink"
          >
            <Icon name="close" size={14} />
          </button>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <ToolButton label="Deshacer (Ctrl+Z)" icon="undo" onClick={undo} disabled={!canUndo} />
        <ToolButton label="Rehacer (Ctrl+Y)" icon="redo" onClick={redo} disabled={!canRedo} />
        <span className="mx-1 h-5 w-px bg-line" />
        <ToolButton label="Cuadrícula" icon="grid" onClick={() => onView('grid')} active={view === 'grid'} />
        <ToolButton label="Lista" icon="list" onClick={() => onView('list')} active={view === 'list'} />
      </div>
    </header>
  );
}
