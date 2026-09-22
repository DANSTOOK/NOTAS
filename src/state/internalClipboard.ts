import type { ImageElement, Note } from './types';

/**
 * Portapapeles interno de la app (independiente del portapapeles del SO) para
 * copiar/cortar/pegar una nota o una imagen seleccionada con Ctrl+C/X/V.
 * Se dispara por `keydown`, nunca por el evento `paste`, así que no puede
 * chocar con el paste nativo de imágenes/texto externos (ver useOsPasteHandler).
 */
export type ClipboardPayload = { kind: 'image'; image: ImageElement } | { kind: 'note'; note: Note };

let clipboard: ClipboardPayload | null = null;

export function setInternalClipboard(payload: ClipboardPayload): void {
  clipboard = payload;
}

export function getInternalClipboard(): ClipboardPayload | null {
  return clipboard;
}

export function clearInternalClipboard(): void {
  clipboard = null;
}
