import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import type { Note } from '../../state/types';
import { useAppState } from '../../state/store';
import { checklistProgress } from '../../state/selectors';
import { uuid } from '../../utils/uuid';
import { ChecklistItemRow } from './ChecklistItemRow';
import { ProgressBar } from './ProgressBar';
import { Icon } from '../common/Icon';

export function ChecklistList({ note }: { note: Note }): React.JSX.Element {
  const { dispatch } = useAppState();
  const [draft, setDraft] = useState('');
  const [focusId, setFocusId] = useState<string | null>(null);
  const progress = checklistProgress(note);

  const addItem = (text: string) => {
    const id = uuid();
    dispatch({
      type: 'checklist/addItem',
      noteId: note.id,
      item: { id, noteId: note.id, text, done: false, order: note.checklist.length }
    });
    return id;
  };

  const commitDraft = () => {
    const text = draft.trim();
    if (!text) return;
    addItem(text);
    setDraft('');
  };

  return (
    <div className="flex flex-col gap-0.5">
      {progress.total > 0 && (
        <div className="mb-2 px-1.5">
          <ProgressBar ratio={progress.ratio} />
        </div>
      )}
      <AnimatePresence initial={false}>
        {note.checklist.map((item) => (
          <ChecklistItemRow
            key={item.id}
            item={item}
            autoFocus={item.id === focusId}
            onAddAfter={() => setFocusId(addItem(''))}
          />
        ))}
      </AnimatePresence>
      <div className="flex items-center gap-2.5 rounded-lg px-1.5 py-1">
        <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border border-dashed border-lineStrong text-faint">
          <Icon name="plus" size={11} />
        </span>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitDraft();
            }
          }}
          onBlur={commitDraft}
          placeholder="Añadir tarea…"
          className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-faint"
        />
      </div>
    </div>
  );
}
