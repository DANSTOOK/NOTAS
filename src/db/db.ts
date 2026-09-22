import Dexie, { type Table } from 'dexie';
import type { NoteColor, NoteStatus, Priority } from '../state/types';

export interface NoteRow {
  id: string;
  title: string;
  color: NoteColor;
  status: NoteStatus;
  priority: Priority;
  dueDate: number | null;
  createdAt: number;
  updatedAt: number;
  archived: number; // 0/1, Dexie indexes booleans poorly across browsers
}

export interface ChecklistItemRow {
  id: string;
  noteId: string;
  text: string;
  done: number; // 0/1
  order: number;
}

export interface ImageElementRow {
  id: string;
  noteId: string;
  blobId: string;
  baseWidth: number;
  baseHeight: number;
  zIndex: number;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

export interface ImageBlobRow {
  id: string;
  blob: Blob;
  mimeType: string;
  sizeBytes: number;
}

class NotesDB extends Dexie {
  notes!: Table<NoteRow, string>;
  checklistItems!: Table<ChecklistItemRow, string>;
  imageElements!: Table<ImageElementRow, string>;
  imageBlobs!: Table<ImageBlobRow, string>;

  constructor() {
    super('NotasAppDB');
    this.version(1).stores({
      notes: 'id, updatedAt, archived, dueDate, priority',
      checklistItems: 'id, noteId, order',
      imageElements: 'id, noteId, zIndex, blobId',
      imageBlobs: 'id'
    });

    // v2: estado de progreso. Las notas que ya existían pasan a "pendiente".
    this.version(2)
      .stores({ notes: 'id, updatedAt, archived, dueDate, priority, status' })
      .upgrade((tx) => tx.table<NoteRow>('notes').toCollection().modify((note) => {
        note.status = 'todo';
      }));
  }
}

export const db = new NotesDB();
