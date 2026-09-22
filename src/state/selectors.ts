import type { Note } from './types';

export function checklistProgress(note: Note): { done: number; total: number; ratio: number } {
  const total = note.checklist.length;
  const done = note.checklist.filter((i) => i.done).length;
  return { done, total, ratio: total === 0 ? 0 : done / total };
}

export function sortedImages(note: Note) {
  return [...note.images].sort((a, b) => a.zIndex - b.zIndex);
}

export function nextZIndex(note: Note): number {
  return note.images.length === 0 ? 1 : Math.max(...note.images.map((i) => i.zIndex)) + 1;
}

export function minZIndex(note: Note): number {
  return note.images.length === 0 ? 1 : Math.min(...note.images.map((i) => i.zIndex)) - 1;
}
