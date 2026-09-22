import { useCallback } from 'react';
import { useAppState } from '../state/store';
import type { Selection } from '../state/types';

export function useSelection() {
  const { selection, setSelection } = useAppState();

  const selectNote = useCallback((noteId: string) => setSelection({ kind: 'note', noteId }), [setSelection]);
  const selectImage = useCallback(
    (noteId: string, imageId: string) => setSelection({ kind: 'image', noteId, imageId }),
    [setSelection]
  );
  const clearSelection = useCallback(() => setSelection({ kind: 'none' }), [setSelection]);

  const isSelected = useCallback(
    (target: Selection) => {
      if (selection.kind !== target.kind) return false;
      if (selection.kind === 'note' && target.kind === 'note') return selection.noteId === target.noteId;
      if (selection.kind === 'image' && target.kind === 'image')
        return selection.noteId === target.noteId && selection.imageId === target.imageId;
      return false;
    },
    [selection]
  );

  return { selection, selectNote, selectImage, clearSelection, isSelected };
}
