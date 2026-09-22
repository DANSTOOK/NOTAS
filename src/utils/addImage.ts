import type { Dispatch } from 'react';
import type { Action, ImageElement } from '../state/types';
import { compressImage } from './imageIO';
import { persistNewImageBlob } from '../db/persistence';
import { uuid } from './uuid';

const DEFAULT_MAX_ON_CANVAS = 220;

/**
 * Comprime un archivo de imagen, lo guarda como blob y despacha `image/add`
 * con un tamaño/posición inicial razonable. Usado por drag&drop, el botón de
 * carga y el paste (tanto del SO como el de archivos internos).
 */
export async function addImageToNote(
  file: Blob,
  noteId: string,
  center: { x: number; y: number },
  zIndex: number,
  dispatch: Dispatch<Action>
): Promise<void> {
  const compressed = await compressImage(file);
  const blobId = uuid();
  await persistNewImageBlob(blobId, compressed.blob, compressed.mimeType);

  const scale = Math.min(1, DEFAULT_MAX_ON_CANVAS / Math.max(compressed.width, compressed.height));

  const image: ImageElement = {
    id: uuid(),
    noteId,
    blobId,
    baseWidth: compressed.width,
    baseHeight: compressed.height,
    zIndex,
    transform: { x: center.x, y: center.y, scaleX: scale, scaleY: scale, rotation: 0 }
  };

  dispatch({ type: 'image/add', noteId, image });
}
