import { useEffect } from 'react';
import type { RefObject } from 'react';
import { useAppState } from '../state/store';
import { nextZIndex } from '../state/selectors';
import { addImageToNote } from '../utils/addImage';
import { imageItemFromClipboard } from '../utils/imageIO';

/**
 * Intercepta el evento `paste` nativo del SO en el contenedor del canvas de
 * una nota. Solo actúa cuando el portapapeles trae una imagen; si trae texto
 * plano, no hace nada y deja que el campo de texto enfocado (contentEditable/
 * input) reciba el paste de forma nativa. Esto es intencional: así nunca
 * compite con el clipboard interno de elementos (Ctrl+C/V de una imagen ya
 * seleccionada), que se maneja aparte por `keydown` en useGlobalShortcuts.
 */
export function useOsPasteHandler(containerRef: RefObject<HTMLElement>, noteId: string): void {
  const { data, dispatch } = useAppState();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onPaste = (e: ClipboardEvent) => {
      const cd = e.clipboardData;
      if (!cd) return;
      const file = imageItemFromClipboard(cd);
      if (!file) return; // deja que el paste nativo de texto siga su curso

      e.preventDefault();
      const note = data.notes[noteId];
      const zIndex = note ? nextZIndex(note) : 1;
      const rect = el.getBoundingClientRect();
      const center = { x: rect.width / 2, y: rect.height / 2 };
      void addImageToNote(file, noteId, center, zIndex, dispatch);
    };

    el.addEventListener('paste', onPaste);
    return () => el.removeEventListener('paste', onPaste);
  }, [containerRef, noteId, data.notes, dispatch]);
}
