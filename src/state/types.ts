export type NoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple' | 'gray';
export type Priority = 'low' | 'medium' | 'high' | null;
export type NoteStatus = 'todo' | 'doing' | 'done';

export interface Transform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number; // degrees, 0-360
}

export interface ChecklistItem {
  id: string;
  noteId: string;
  text: string;
  done: boolean;
  order: number;
}

export interface ImageElement {
  id: string;
  noteId: string;
  blobId: string;
  baseWidth: number;
  baseHeight: number;
  zIndex: number;
  transform: Transform;
}

export interface Note {
  id: string;
  title: string;
  color: NoteColor;
  status: NoteStatus;
  priority: Priority;
  dueDate: number | null;
  createdAt: number;
  updatedAt: number;
  archived: boolean;
  checklist: ChecklistItem[];
  images: ImageElement[];
}

export interface AppState {
  notes: Record<string, Note>;
  noteOrder: string[];
  hydrated: boolean;
}

export type Selection =
  | { kind: 'none' }
  | { kind: 'note'; noteId: string }
  | { kind: 'image'; noteId: string; imageId: string };

export type Action =
  | { type: 'hydrate/set'; state: AppState }
  | { type: 'note/create'; note: Note }
  | { type: 'note/remove'; note: Note }
  | { type: 'note/updateTitle'; noteId: string; from: string; to: string; coalesceKey?: string }
  | { type: 'note/updateColor'; noteId: string; from: NoteColor; to: NoteColor }
  | { type: 'note/updateStatus'; noteId: string; from: NoteStatus; to: NoteStatus }
  | { type: 'note/updatePriority'; noteId: string; from: Priority; to: Priority }
  | { type: 'note/updateDueDate'; noteId: string; from: number | null; to: number | null }
  | { type: 'checklist/addItem'; noteId: string; item: ChecklistItem }
  | { type: 'checklist/removeItem'; noteId: string; item: ChecklistItem }
  | { type: 'checklist/toggleItem'; noteId: string; itemId: string; from: boolean; to: boolean }
  | { type: 'checklist/updateText'; noteId: string; itemId: string; from: string; to: string; coalesceKey?: string }
  | { type: 'image/add'; noteId: string; image: ImageElement }
  | { type: 'image/remove'; noteId: string; image: ImageElement }
  | { type: 'image/duplicate'; noteId: string; sourceId: string; newImage: ImageElement }
  | { type: 'image/transform'; noteId: string; imageId: string; from: Transform; to: Transform }
  | { type: 'image/zorder'; noteId: string; imageId: string; from: number; to: number };

export interface HistoryEntry {
  undo: Action;
  redo: Action;
  timestamp: number;
  coalesceKey?: string;
}

export interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
}

export interface RootState {
  data: AppState;
  history: HistoryState;
  selection: Selection;
}
