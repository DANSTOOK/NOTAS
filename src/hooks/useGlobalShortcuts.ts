import { useEffect } from 'react';
import { useAppState, useUndoRedo } from '../state/store';
import { useSelection } from './useSelection';
import { getInternalClipboard, setInternalClipboard } from '../state/internalClipboard';
import { nextZIndex } from '../state/selectors';
import { uuid } from '../utils/uuid';
import { createEmptyNote } from '../utils/createNote';
import type { ImageElement, Note } from '../state/types';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

function cloneImageForPaste(image: ImageElement, zIndex: number): ImageElement {
  return {
    ...image,
    id: uuid(),
    zIndex,
    transform: { ...image.transform, x: image.transform.x + 24, y: image.transform.y + 24 }
  };
}

function cloneNoteForPaste(note: Note): Note {
  const newNoteId = uuid();
  const now = Date.now();
  return {
    ...note,
    id: newNoteId,
    title: note.title,
    createdAt: now,
    updatedAt: now,
    checklist: note.checklist.map((item) => ({ ...item, id: uuid(), noteId: newNoteId })),
    images: note.images.map((image) => ({ ...image, id: uuid(), noteId: newNoteId }))
  };
}

/**
 * Atajos de teclado globales. Este es el único lugar donde se resuelven los
 * conflictos entre: paste nativo del SO (maneja useOsPasteHandler vía el
 * evento `paste`), el clipboard interno de elementos (Ctrl+C/X/V aquí, vía
 * `keydown`), undo/redo, y Del/Escape. La regla de desempate es el foco: si
 * el foco está en un campo de texto editable, estos atajos de elemento no
 * actúan (se deja pasar el comportamiento nativo del input/contentEditable).
 */
export function useGlobalShortcuts(): void {
  const { data, dispatch } = useAppState();
  const { undo, redo } = useUndoRedo();
  const { selection, clearSelection } = useSelection();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      if (mod && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        dispatch({ type: 'note/create', note: createEmptyNote() });
        return;
      }

      if (e.key === 'Escape') {
        clearSelection();
        return;
      }

      const editing = isEditableTarget(e.target);

      if ((e.key === 'Delete' || e.key === 'Backspace') && !editing) {
        if (selection.kind === 'image') {
          const note = data.notes[selection.noteId];
          const image = note?.images.find((i) => i.id === selection.imageId);
          if (image) {
            e.preventDefault();
            dispatch({ type: 'image/remove', noteId: note!.id, image });
            clearSelection();
          }
        } else if (selection.kind === 'note') {
          const note = data.notes[selection.noteId];
          if (note) {
            e.preventDefault();
            dispatch({ type: 'note/remove', note });
            clearSelection();
          }
        }
        return;
      }

      if (editing) return; // deja el Ctrl+C/X/V nativo de texto intacto

      if (mod && e.key.toLowerCase() === 'c') {
        if (selection.kind === 'image') {
          const note = data.notes[selection.noteId];
          const image = note?.images.find((i) => i.id === selection.imageId);
          if (image) setInternalClipboard({ kind: 'image', image });
        } else if (selection.kind === 'note') {
          const note = data.notes[selection.noteId];
          if (note) setInternalClipboard({ kind: 'note', note });
        }
        return;
      }

      if (mod && e.key.toLowerCase() === 'x') {
        if (selection.kind === 'image') {
          const note = data.notes[selection.noteId];
          const image = note?.images.find((i) => i.id === selection.imageId);
          if (image) {
            setInternalClipboard({ kind: 'image', image });
            dispatch({ type: 'image/remove', noteId: note!.id, image });
            clearSelection();
          }
        } else if (selection.kind === 'note') {
          const note = data.notes[selection.noteId];
          if (note) {
            setInternalClipboard({ kind: 'note', note });
            dispatch({ type: 'note/remove', note });
            clearSelection();
          }
        }
        return;
      }

      if (mod && e.key.toLowerCase() === 'v') {
        const clip = getInternalClipboard();
        if (!clip) return;
        if (clip.kind === 'image' && selection.kind !== 'none') {
          const note = data.notes[selection.noteId];
          if (note) {
            const newImage = cloneImageForPaste(clip.image, nextZIndex(note));
            dispatch({ type: 'image/duplicate', noteId: note.id, sourceId: clip.image.id, newImage });
          }
        } else if (clip.kind === 'note') {
          const newNote = cloneNoteForPaste(clip.note);
          dispatch({ type: 'note/create', note: newNote });
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [data.notes, dispatch, undo, redo, selection, clearSelection]);
}
