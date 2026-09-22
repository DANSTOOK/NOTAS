import { db } from './db';
import type { Action, ChecklistItem, ImageElement, Note } from '../state/types';

function noteRowFrom(note: Note) {
  return {
    id: note.id,
    title: note.title,
    color: note.color,
    status: note.status,
    priority: note.priority,
    dueDate: note.dueDate,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    archived: note.archived ? 1 : 0
  };
}

function checklistRowFrom(item: ChecklistItem) {
  return { id: item.id, noteId: item.noteId, text: item.text, done: item.done ? 1 : 0, order: item.order };
}

function imageRowFrom(image: ImageElement) {
  return {
    id: image.id,
    noteId: image.noteId,
    blobId: image.blobId,
    baseWidth: image.baseWidth,
    baseHeight: image.baseHeight,
    zIndex: image.zIndex,
    x: image.transform.x,
    y: image.transform.y,
    scaleX: image.transform.scaleX,
    scaleY: image.transform.scaleY,
    rotation: image.transform.rotation
  };
}

// Cola serializada: cada escritura espera a la anterior, así un `note/create`
// siempre queda escrito antes que las ediciones posteriores de esa nota.
// No se usa requestIdleCallback: puede no dispararse nunca y perder datos al cerrar.
let writeQueue: Promise<void> = Promise.resolve();

/**
 * Aplica a Dexie el efecto de una acción ya aplicada al estado en memoria
 * (tanto si vino de un dispatch normal como de un undo/redo).
 */
export function persistAction(action: Action, resolvedNote?: Note): void {
  const run = async () => {
    switch (action.type) {
      case 'note/create':
        await db.transaction('rw', db.notes, db.checklistItems, db.imageElements, async () => {
          await db.notes.put(noteRowFrom(action.note));
          if (action.note.checklist.length) await db.checklistItems.bulkPut(action.note.checklist.map(checklistRowFrom));
          if (action.note.images.length) await db.imageElements.bulkPut(action.note.images.map(imageRowFrom));
        });
        break;
      case 'note/remove':
        await db.transaction('rw', db.notes, db.checklistItems, db.imageElements, async () => {
          await db.notes.delete(action.note.id);
          await db.checklistItems.where('noteId').equals(action.note.id).delete();
          await db.imageElements.where('noteId').equals(action.note.id).delete();
        });
        break;
      case 'note/updateTitle':
      case 'note/updateColor':
      case 'note/updateStatus':
      case 'note/updatePriority':
      case 'note/updateDueDate':
        if (resolvedNote) await db.notes.put(noteRowFrom(resolvedNote));
        break;
      case 'checklist/addItem':
        await db.checklistItems.put(checklistRowFrom(action.item));
        if (resolvedNote) await db.notes.put(noteRowFrom(resolvedNote));
        break;
      case 'checklist/removeItem':
        await db.checklistItems.delete(action.item.id);
        if (resolvedNote) await db.notes.put(noteRowFrom(resolvedNote));
        break;
      case 'checklist/toggleItem':
      case 'checklist/updateText': {
        const item = resolvedNote?.checklist.find((i) => i.id === action.itemId);
        if (item) await db.checklistItems.put(checklistRowFrom(item));
        break;
      }
      case 'image/add':
        await db.imageElements.put(imageRowFrom(action.image));
        break;
      case 'image/remove':
        await db.imageElements.delete(action.image.id);
        break;
      case 'image/duplicate':
        await db.imageElements.put(imageRowFrom(action.newImage));
        break;
      case 'image/transform': {
        const image = resolvedNote?.images.find((i) => i.id === action.imageId);
        if (image) await db.imageElements.put(imageRowFrom(image));
        break;
      }
      case 'image/zorder': {
        const image = resolvedNote?.images.find((i) => i.id === action.imageId);
        if (image) await db.imageElements.put(imageRowFrom(image));
        break;
      }
      case 'hydrate/set':
        break;
    }
  };

  writeQueue = writeQueue.then(run).catch((error) => console.error('[persistencia]', action.type, error));
}

export async function persistNewImageBlob(blobId: string, blob: Blob, mimeType: string): Promise<void> {
  await db.imageBlobs.put({ id: blobId, blob, mimeType, sizeBytes: blob.size });
}
