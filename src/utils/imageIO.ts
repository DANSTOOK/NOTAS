import type { CompressRequest, CompressResponse } from '../workers/imageCompress.worker';

export interface CompressedImage {
  blob: Blob;
  mimeType: string;
  width: number;
  height: number;
}

export function compressImage(file: Blob): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../workers/imageCompress.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<CompressResponse | { error: string }>) => {
      worker.terminate();
      if ('error' in event.data) reject(new Error(event.data.error));
      else resolve(event.data);
    };
    worker.onerror = (event) => {
      worker.terminate();
      reject(event.error ?? new Error('Error desconocido comprimiendo la imagen'));
    };
    const request: CompressRequest = { file };
    worker.postMessage(request);
  });
}

export function imageFilesFromDataTransfer(dt: DataTransfer): File[] {
  return Array.from(dt.files).filter((f) => f.type.startsWith('image/'));
}

export function imageItemFromClipboard(cd: DataTransfer): File | null {
  for (const item of Array.from(cd.items)) {
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      return item.getAsFile();
    }
  }
  return null;
}
