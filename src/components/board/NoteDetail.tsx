import React, { useEffect } from 'react';
import * as m from 'motion/react-m';
import { duration, easing, effects, spatial } from '../../styles/motionTokens';
import type { Note, NoteColor } from '../../state/types';
import { useAppState } from '../../state/store';
import { useSelection } from '../../hooks/useSelection';
import { checklistProgress } from '../../state/selectors';
import { StatusPicker } from '../common/StatusPicker';
import { ColorSwatchPicker } from '../common/ColorSwatchPicker';
import { PriorityBadge } from '../common/PriorityBadge';
import { DueDateField } from '../common/DueDateField';
import { ChecklistList } from '../checklist/ChecklistList';
import { ImageCanvas } from '../canvas/ImageCanvas';
import { Icon } from '../common/Icon';

const ACCENT_VAR: Record<NoteColor, string> = {
  yellow: 'var(--note-yellow)',
  pink: 'var(--note-pink)',
  blue: 'var(--note-blue)',
  green: 'var(--note-green)',
  purple: 'var(--note-purple)',
  gray: 'var(--note-gray)'
};

function Section({ title, extra, children }: { title: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-faint">{title}</h3>
        {extra}
      </div>
      {children}
    </section>
  );
}

export function NoteDetail({ note, onClose }: { note: Note; onClose: () => void }): React.JSX.Element {
  const { dispatch } = useAppState();
  const { clearSelection } = useSelection();
  const progress = checklistProgress(note);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-10">
      <m.div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: duration.short4, ease: easing.standardAccelerate } }}
        transition={effects.default}
        onClick={onClose}
      />

      <m.div
        role="dialog"
        aria-modal="true"
        aria-label={note.title || 'Nota sin título'}
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, transition: { duration: duration.short4, ease: easing.emphasizedAccelerate } }}
        transition={{ ...spatial.default, opacity: effects.fast }}
        className="relative z-10 my-auto flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-surface shadow-e2 ring-1 ring-line"
      >
        <div className="h-1 w-full" style={{ background: ACCENT_VAR[note.color] }} />

        <header className="flex items-center gap-3 border-b border-line px-5 py-3">
          <StatusPicker
            value={note.status}
            layoutId={`status-${note.id}`}
            onChange={(to) => dispatch({ type: 'note/updateStatus', noteId: note.id, from: note.status, to })}
          />
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              title="Eliminar nota"
              aria-label="Eliminar nota"
              onClick={() => {
                dispatch({ type: 'note/remove', note });
                clearSelection();
                onClose();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-rose-500/10 hover:text-rose-500"
            >
              <Icon name="trash" size={16} />
            </button>
            <button
              type="button"
              title="Cerrar (Esc)"
              aria-label="Cerrar"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surfaceHover hover:text-ink"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-5 px-5 py-4">
          <input
            autoFocus
            value={note.title}
            onChange={(e) =>
              dispatch({
                type: 'note/updateTitle',
                noteId: note.id,
                from: note.title,
                to: e.target.value,
                coalesceKey: `note:${note.id}:title`
              })
            }
            placeholder="Título de la nota"
            className={`w-full bg-transparent text-[20px] font-semibold tracking-tight text-ink outline-none placeholder:font-normal placeholder:text-faint ${
              note.status === 'done' ? 'text-muted line-through' : ''
            }`}
          />

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-surface2 px-3 py-2.5 ring-1 ring-inset ring-line">
            <label className="flex items-center gap-2 text-[12px] text-muted">
              <Icon name="flag" size={14} />
              <PriorityBadge
                value={note.priority}
                onChange={(to) => dispatch({ type: 'note/updatePriority', noteId: note.id, from: note.priority, to })}
              />
            </label>
            <label className="flex items-center gap-2 text-[12px] text-muted">
              <Icon name="calendar" size={14} />
              <DueDateField
                value={note.dueDate}
                onChange={(to) => dispatch({ type: 'note/updateDueDate', noteId: note.id, from: note.dueDate, to })}
              />
            </label>
            <div className="ml-auto">
              <ColorSwatchPicker
                value={note.color}
                onChange={(to) => dispatch({ type: 'note/updateColor', noteId: note.id, from: note.color, to })}
              />
            </div>
          </div>

          <Section
            title="Tareas"
            extra={
              progress.total > 0 ? (
                <span className="text-[11px] tabular-nums text-faint">
                  {progress.done}/{progress.total}
                </span>
              ) : undefined
            }
          >
            <ChecklistList note={note} />
          </Section>

          <Section title="Imágenes">
            <ImageCanvas note={note} />
          </Section>
        </div>
      </m.div>
    </div>
  );
}
