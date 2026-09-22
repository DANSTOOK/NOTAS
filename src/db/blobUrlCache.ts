import { db } from './db';

/**
 * URLs de objeto compartidas por blobId y contadas por referencias: dos
 * imágenes duplicadas apuntan al mismo blob y comparten una sola URL, que se
 * revoca cuando se desmonta la última que la usaba. Sin esto, cada montaje
 * crearía una URL nueva que el navegador retiene hasta recargar la página.
 */
interface Entry {
  url: string;
  refs: number;
}

const entries = new Map<string, Entry>();
const pending = new Map<string, Promise<string | null>>();

export async function acquireBlobUrl(blobId: string): Promise<string | null> {
  const existing = entries.get(blobId);
  if (existing) {
    existing.refs += 1;
    return existing.url;
  }

  const inFlight = pending.get(blobId);
  if (inFlight) {
    const url = await inFlight;
    const entry = entries.get(blobId);
    if (entry) entry.refs += 1;
    return url;
  }

  const load = (async () => {
    const row = await db.imageBlobs.get(blobId);
    if (!row) return null;
    const url = URL.createObjectURL(row.blob);
    entries.set(blobId, { url, refs: 1 });
    return url;
  })();

  pending.set(blobId, load);
  try {
    return await load;
  } finally {
    pending.delete(blobId);
  }
}

export function releaseBlobUrl(blobId: string): void {
  const entry = entries.get(blobId);
  if (!entry) return;
  entry.refs -= 1;
  if (entry.refs <= 0) {
    URL.revokeObjectURL(entry.url);
    entries.delete(blobId);
  }
}
