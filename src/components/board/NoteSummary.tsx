import React, { useEffect, useState } from 'react';
import * as m from 'motion/react-m';
import { cardMotion, spatial } from '../../styles/motionTokens';
import type { Note, NoteColor, NoteStatus } from '../../state/types';
import { useSelection } from '../../hooks/useSelection';
import { checklistProgress } from '../../state/selectors';
import { acquireBlobUrl, releaseBlobUrl } from '../../db/blobUrlCache';
import { Icon, type IconName } from '../common/Icon';

const ACCENT_VAR: Record<NoteColor, string> = {
  yellow: 'var(--note-yellow)',
  pink: 'var(--note-pink)',
  blue: 'var(--note-blue)',
  green: 'var(--note-green)',
  purple: 'var(--note-purple)',
  gray: 'var(--note-gray)'
};

const STATUS_ICON: Record<NoteStatus, IconName> = { todo: 'circle', doing: 'half', done: 'check' };
const STATUS_COLOR: Record<NoteStatus, string> = {
  todo: 'text-faint',
  doing: 'text-note-blue',
  done: 'text-note-green'
};
const STATUS_LABEL: Record<NoteStatus, string> = { todo: 'Pendiente', doing: 'En curso', done: 'Hecha' };

const PRIORITY_LABEL = { low: 'Baja', medium: 'Media', high: 'Alta' } as const;
const PRIORITY_COLOR = {
  low: 'text-faint',
  medium: 'text-amber-500',
  high: 'text-rose-500'
} as const;

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

function isOverdue(ts: number | null): boolean {
  if (!ts) return false;
  const end = new Date(ts);
  end.setHours(23, 59, 59, 999);
  return end.getTime() < Date.now();
}

/** Anillo de progreso de las tareas de la nota. */
function ProgressRing({ ratio, done, total }: { ratio: number; done: number; total: number }): React.JSX.Element {
  const r = 8;
  const c = 2 * Math.PI * r;
  return (
    <span className="flex items-center gap-1 text-[11px] tabular-nums text-muted" title={`${done} de ${total} tareas`}>
      <svg width="20" height="20" viewBox="0 0 20 20" className="-rotate-90">
        <circle cx="10" cy="10" r={r} fill="none" stroke="var(--border-strong)" strokeWidth="2.5" />
        <m.circle
          cx="10"
          cy="10"
          r={r}
          fill="none"
          stroke={ratio === 1 ? 'var(--note-green)' : 'var(--accent)'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - ratio) }}
          transition={spatial.default}
        />
      </svg>
      {done}/{total}
    </span>
  );
}

/** Miniatura de la primera imagen de la nota. */
function Thumb({ blobId }: { blobId: string }): React.JSX.Element {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    acquireBlobUrl(blobId).then((u) => (active ? setUrl(u) : releaseBlobUrl(blobId)));
    return () => {
      active = false;
      releaseBlobUrl(blobId);
    };
  }, [blobId]);
  return (
    <span className="block h-full w-full overflow-hidden rounded-lg bg-surface2 ring-1 ring-inset ring-line">
      {url && <img src={url} alt="" className="h-full w-full object-cover" />}
    </span>
  );
}

interface NoteSummaryProps {
  note: Note;
  variant: 'grid' | 'list';
  onOpen: () => void;
}

export function NoteSummary({ note, variant, onOpen }: NoteSummaryProps): React.JSX.Element {
  const { selectNote, isSelected } = useSelection();
  const selected = isSelected({ kind: 'note', noteId: note.id });
  const progress = checklistProgress(note);
  const list = variant === 'list';
  const accent = ACCENT_VAR[note.color];
  const pending = note.checklist.filter((i) => !i.done).slice(0, 3);
  const overdue = isOverdue(note.dueDate);

  const chips = (
    <>
      {progress.total > 0 && <ProgressRing ratio={progress.ratio} done={progress.done} total={progress.total} />}
      {note.images.length > 0 && (
        <span className="flex items-center gap-1 text-[11px] text-muted" title={`${note.images.length} imágenes`}>
          <Icon name="image" size={13} />
          {note.images.length}
        </span>
      )}
      {note.priority && (
        <span className={`flex items-center gap-1 text-[11px] ${PRIORITY_COLOR[note.priority]}`}>
          <Icon name="flag" size={13} />
          {PRIORITY_LABEL[note.priority]}
        </span>
      )}
      {note.dueDate && (
        <span className={`flex items-center gap-1 text-[11px] ${overdue ? 'font-medium text-rose-500' : 'text-muted'}`}>
          <Icon name="calendar" size={13} />
          {formatDate(note.dueDate)}
        </span>
      )}
    </>
  );

  return (
    <m.button
      type="button"
      layout="position"
      initial={cardMotion.initial}
      animate={cardMotion.animate}
      exit={cardMotion.exit}
      transition={cardMotion.transition}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onPointerDown={() => selectNote(note.id)}
      onClick={onOpen}
      style={{ borderTopColor: list ? undefined : accent, borderLeftColor: list ? accent : undefined }}
      className={`group relative w-full min-w-0 overflow-hidden bg-surface text-left shadow-e1 ring-1 ring-line transition-shadow hover:shadow-e2 ${
        selected ? 'ring-2 ring-accent' : ''
      } ${note.status === 'done' ? 'opacity-65' : ''} ${
        list
          ? 'flex items-center gap-3 rounded-xl border-l-[3px] px-3 py-2.5'
          : 'flex flex-col gap-2 rounded-2xl border-t-[3px] p-3.5'
      }`}
    >
      <span className={`flex min-w-0 items-center gap-2 ${list ? 'w-56 shrink-0' : 'w-full'}`}>
        <span className={STATUS_COLOR[note.status]} title={STATUS_LABEL[note.status]}>
          <Icon name={STATUS_ICON[note.status]} size={15} />
        </span>
        <span
          className={`min-w-0 flex-1 truncate text-[14px] font-semibold tracking-tight ${
            note.status === 'done' ? 'text-muted line-through' : 'text-ink'
          }`}
        >
          {note.title || <span className="font-normal italic text-faint">Sin título</span>}
        </span>
      </span>

      {list ? (
        <>
          <span className="min-w-0 flex-1 truncate text-[12px] text-muted">
            {pending.length > 0 ? pending.map((i) => i.text || 'Tarea sin texto').join(' · ') : 'Sin tareas pendientes'}
          </span>
          <span className="flex shrink-0 items-center gap-3">{chips}</span>
        </>
      ) : (
        <>
          <span className="flex min-w-0 gap-2">
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              {pending.length > 0 ? (
                pending.map((item) => (
                  <span key={item.id} className="flex min-w-0 items-center gap-1.5 text-[12px] text-muted">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent }} />
                    <span className="min-w-0 truncate">{item.text || 'Tarea sin texto'}</span>
                  </span>
                ))
              ) : (
                <span className="text-[12px] italic text-faint">
                  {progress.total > 0 ? 'Todas las tareas hechas' : 'Sin tareas'}
                </span>
              )}
            </span>
            {note.images[0] && (
              <span className="h-14 w-14 shrink-0">
                <Thumb blobId={note.images[0].blobId} />
              </span>
            )}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-2">{chips}</span>
        </>
      )}
    </m.button>
  );
}
