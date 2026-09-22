import { db } from './db';
import type { AppState, ChecklistItem, ImageElement, Note } from '../state/types';

export async function hydrateAppState(): Promise<AppState> {
  const [noteRowsAsc, checklistRows, imageRows] = await Promise.all([
    db.notes.orderBy('updatedAt').toArray(),
    db.checklistItems.toArray(),
    db.imageElements.toArray()
  ]);
  const noteRows = noteRowsAsc.reverse(); // más recientes primero

  const notes: Record<string, Note> = {};

  for (const row of noteRows) {
    notes[row.id] = {
      id: row.id,
      title: row.title,
      color: row.color,
      status: row.status ?? 'todo',
      priority: row.priority,
      dueDate: row.dueDate,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      archived: row.archived === 1,
      checklist: [],
      images: []
    };
  }

  const checklistByNote = new Map<string, ChecklistItem[]>();
  for (const row of checklistRows) {
    const item: ChecklistItem = { id: row.id, noteId: row.noteId, text: row.text, done: row.done === 1, order: row.order };
    if (!checklistByNote.has(row.noteId)) checklistByNote.set(row.noteId, []);
    checklistByNote.get(row.noteId)!.push(item);
  }
  for (const [noteId, items] of checklistByNote) {
    if (notes[noteId]) notes[noteId].checklist = items.sort((a, b) => a.order - b.order);
  }

  const imagesByNote = new Map<string, ImageElement[]>();
  for (const row of imageRows) {
    const image: ImageElement = {
      id: row.id,
      noteId: row.noteId,
      blobId: row.blobId,
      baseWidth: row.baseWidth,
      baseHeight: row.baseHeight,
      zIndex: row.zIndex,
      transform: { x: row.x, y: row.y, scaleX: row.scaleX, scaleY: row.scaleY, rotation: row.rotation }
    };
    if (!imagesByNote.has(row.noteId)) imagesByNote.set(row.noteId, []);
    imagesByNote.get(row.noteId)!.push(image);
  }
  for (const [noteId, images] of imagesByNote) {
    if (notes[noteId]) notes[noteId].images = images.sort((a, b) => a.zIndex - b.zIndex);
  }

  return {
    notes,
    noteOrder: noteRows.map((r) => r.id),
    hydrated: true
  };
}

/**
 * Borra los blobs que ya no referencia ninguna imagen. Solo es seguro al
 * arrancar: en caliente, un blob sin referencias todavía puede recuperarse
 * con deshacer, pero el historial no sobrevive al cierre de la app.
 */
export async function collectOrphanBlobs(): Promise<void> {
  const [referenced, stored] = await Promise.all([
    db.imageElements.orderBy('blobId').uniqueKeys(),
    db.imageBlobs.toCollection().primaryKeys()
  ]);
  const inUse = new Set(referenced as string[]);
  const orphans = stored.filter((id) => !inUse.has(id));
  if (orphans.length) await db.imageBlobs.bulkDelete(orphans);
}

