/// <reference lib="webworker" />

const MAX_DIMENSION = 2048;
const WEBP_QUALITY = 0.82;

export interface CompressRequest {
  file: Blob;
}

export interface CompressResponse {
  blob: Blob;
  mimeType: string;
  width: number;
  height: number;
}

self.onmessage = async (event: MessageEvent<CompressRequest>) => {
  try {
    const bitmap = await createImageBitmap(event.data.file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo obtener el contexto 2D del OffscreenCanvas');
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    let blob: Blob;
    let mimeType = 'image/webp';
    try {
      blob = await canvas.convertToBlob({ type: mimeType, quality: WEBP_QUALITY });
    } catch {
      mimeType = 'image/jpeg';
      blob = await canvas.convertToBlob({ type: mimeType, quality: WEBP_QUALITY });
    }

    const response: CompressResponse = { blob, mimeType, width, height };
    postMessage(response);
  } catch (error) {
    postMessage({ error: error instanceof Error ? error.message : String(error) });
  }
};
