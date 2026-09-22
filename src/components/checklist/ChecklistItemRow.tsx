import React, { useEffect, useRef } from 'react';
import * as m from 'motion/react-m';
import { listItemMotion, spatial } from '../../styles/motionTokens';
import type { ChecklistItem } from '../../state/types';
import { useAppState } from '../../state/store';
import { Icon } from '../common/Icon';

interface ChecklistItemRowProps {
  item: ChecklistItem;
  onAddAfter: () => void;
  autoFocus?: boolean;
}

export function ChecklistItemRow({ item, onAddAfter, autoFocus }: ChecklistItemRowProps): React.JSX.Element {
  const { dispatch } = useAppState();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const toggle = () =>
    dispatch({ type: 'checklist/toggleItem', noteId: item.noteId, itemId: item.id, from: item.done, to: !item.done });

  return (
    <m.div
      layout="position"
      initial={listItemMotion.initial}
      animate={listItemMotion.animate}
      exit={listItemMotion.exit}
      transition={listItemMotion.transition}
      className="group flex items-center gap-2.5 overflow-hidden rounded-lg px-1.5 py-1 transition-colors hover:bg-surfaceHover"
    >
      <m.button
        type="button"
        role="checkbox"
        aria-checked={item.done}
        aria-label={item.done ? 'Marcar como pendiente' : 'Marcar como hecha'}
        onClick={toggle}
        whileTap={{ scale: 0.82 }}
        transition={spatial.fast}
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-colors ${
          item.done ? 'border-transparent bg-note-green text-white' : 'border-lineStrong text-transparent hover:border-accent'
        }`}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12.5 4.5 4.5L19 7" />
        </svg>
      </m.button>

      <input
        ref={inputRef}
        value={item.text}
        placeholder="Tarea sin texto"
        onChange={(e) =>
          dispatch({
            type: 'checklist/updateText',
            noteId: item.noteId,
            itemId: item.id,
            from: item.text,
            to: e.target.value,
            coalesceKey: `checklist:${item.id}:text`
          })
        }
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onAddAfter();
          } else if (e.key === 'Backspace' && item.text === '') {
            e.preventDefault();
            dispatch({ type: 'checklist/removeItem', noteId: item.noteId, item });
          }
        }}
        className={`min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-faint ${
          item.done ? 'text-faint line-through' : 'text-ink'
        }`}
      />

      <button
        type="button"
        aria-label="Eliminar tarea"
        title="Eliminar tarea"
        onClick={() => dispatch({ type: 'checklist/removeItem', noteId: item.noteId, item })}
        className="shrink-0 text-faint opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100"
      >
        <Icon name="close" size={13} />
      </button>
    </m.div>
  );
}
